"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Plus, X, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface VisionImage {
  _id: Id<"visionboard">;
  url: string;
  subtitle?: string;
  width: number;
  height: number;
  position: number;
  createdAt: string;
}

interface SortableImageProps {
  image: VisionImage;
  onDelete: (id: Id<"visionboard">) => void;
  onUpdateSubtitle: (id: Id<"visionboard">, subtitle: string) => void;
}

function SortableImage({ image, onDelete, onUpdateSubtitle }: SortableImageProps) {
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [subtitle, setSubtitle] = useState(image.subtitle || "");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveSubtitle = () => {
    onUpdateSubtitle(image._id, subtitle);
    setIsEditingSubtitle(false);
  };

  // Calculate cover height based on Trello formula: (cardWidth / imageWidth) * imageHeight
  const CARD_WIDTH = 256;
  const coverHeight = Math.round((CARD_WIDTH / image.width) * image.height);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative w-[256px] min-h-[20px] mb-2 rounded-lg overflow-hidden bg-white cursor-move"
      // Trello shadow: 0px 1px 1px rgba(9,30,66,0.25), 0px 0px 1px rgba(9,30,66,0.31)
      // Using Tailwind approximation
    >
      {/* Cover Image - Trello style with background-image */}
      <div
        className="relative w-full rounded-t-lg"
        style={{
          height: `${coverHeight}px`,
          maxHeight: "500px", // Prevent extreme heights
          backgroundImage: `url(${image.url})`,
          backgroundSize: "contain", // Changed to contain so nothing is cropped
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        {...attributes}
        {...listeners}
      >
        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(image._id);
          }}
          className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-10"
          aria-label="Delete image"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Add Subtitle Button - show on hover if no subtitle */}
        {!image.subtitle && !isEditingSubtitle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingSubtitle(true);
            }}
            className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-black/60 backdrop-blur-sm rounded hover:bg-black/80 text-white text-xs flex items-center gap-1"
          >
            <Edit2 className="h-3 w-3" />
            <span>Untertitel</span>
          </button>
        )}
      </div>

      {/* Subtitle - only show if exists or editing */}
      {(image.subtitle || isEditingSubtitle) && (
        <div className="p-2 bg-white">
          {isEditingSubtitle ? (
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Untertitel hinzufügen..."
                className="h-8 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveSubtitle();
                  } else if (e.key === "Escape") {
                    setIsEditingSubtitle(false);
                    setSubtitle(image.subtitle || "");
                  }
                }}
              />
              <Button
                size="sm"
                onClick={handleSaveSubtitle}
                className="h-8 px-3"
              >
                OK
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium truncate flex-1">
                {image.subtitle}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingSubtitle(true);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Visionboard() {
  const visionboardImages = useQuery(api.visionboard.getVisionboardImages);
  const generateUploadUrl = useMutation(api.visionboard.generateUploadUrl);
  const addImage = useMutation(api.visionboard.addImage);
  const deleteImage = useMutation(api.visionboard.deleteImage);
  const updateSubtitle = useMutation(api.visionboard.updateSubtitle);
  const reorderImages = useMutation(api.visionboard.reorderImages);

  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<VisionImage[]>([]);

  // Update local state when data changes
  useEffect(() => {
    if (visionboardImages) {
      setImages(visionboardImages as VisionImage[]);
    }
  }, [visionboardImages]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Bitte lade nur Bilder hoch");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Bild ist zu groß (max 5MB)");
      return;
    }

    setIsUploading(true);
    try {
      // Get image dimensions
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const imgElement = new window.Image();
        imgElement.onload = () => resolve(imgElement);
        imgElement.onerror = reject;
        imgElement.src = URL.createObjectURL(file);
      });

      const width = img.naturalWidth;
      const height = img.naturalHeight;

      // Upload to Convex
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();

      // Save with dimensions
      await addImage({ storageId, width, height });

      toast.success("Bild hochgeladen!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Fehler beim Hochladen");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (imageId: Id<"visionboard">) => {
    try {
      await deleteImage({ imageId });
      toast.success("Bild gelöscht");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen");
    }
  };

  const handleUpdateSubtitle = async (
    imageId: Id<"visionboard">,
    subtitle: string
  ) => {
    try {
      await updateSubtitle({ imageId, subtitle });
      toast.success("Untertitel gespeichert");
    } catch (error) {
      console.error("Update subtitle error:", error);
      toast.error("Fehler beim Speichern");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = images.findIndex((img) => img._id === active.id);
    const newIndex = images.findIndex((img) => img._id === over.id);

    const newImages = arrayMove(images, oldIndex, newIndex);
    setImages(newImages);

    // Update positions in database
    try {
      await reorderImages({
        imageIds: newImages.map((img) => img._id),
      });
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error("Fehler beim Verschieben");
      // Revert on error
      if (visionboardImages) {
        setImages(visionboardImages as VisionImage[]);
      }
    }
  };

  // Use local state for display
  const displayImages = images.length > 0 ? images : (visionboardImages as VisionImage[] || []);

  return (
    <div className="h-full flex flex-col">
      {/* Centered Page Title */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-semibold">Vision Board</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Visualisiere deine Ziele und Träume
        </p>
      </div>

      {/* Trello-style horizontal scrolling container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="inline-flex gap-4 p-4 h-full items-start">
          {/* Single vertical list - Trello style */}
          <div className="w-[272px] flex-shrink-0 bg-muted/30 rounded-lg p-2">
            {/* List Header */}
            <div className="mb-2 px-2">
              <h2 className="text-sm font-semibold">Meine Visionen</h2>
            </div>

          {/* Cards Container with Drag & Drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={displayImages.map((img) => img._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-0">
                {displayImages.map((image) => (
                  <SortableImage
                    key={image._id}
                    image={image}
                    onDelete={handleDelete}
                    onUpdateSubtitle={handleUpdateSubtitle}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add Card Button */}
          <div className="mt-2">
            <label htmlFor="image-upload" className="cursor-pointer">
              <div
                onClick={() => document.getElementById("image-upload")?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors text-sm text-muted-foreground"
              >
                <Plus className="h-4 w-4" />
                <span>{isUploading ? "Lädt hoch..." : "Bild hinzufügen"}</span>
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Empty State */}
          {displayImages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>Noch keine Bilder.</p>
              <p>Füge dein erstes Vision hinzu!</p>
            </div>
          )}
          </div>

          {/* Add Another List Button - Trello style */}
          <div className="w-[272px] flex-shrink-0">
            <button className="w-full px-3 py-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors text-sm text-muted-foreground flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Weitere Liste hinzufügen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
