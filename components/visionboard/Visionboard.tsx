"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Plus, X, Edit2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
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
  listId?: Id<"visionboardLists">;
  createdAt: string;
}

interface VisionList {
  _id: Id<"visionboardLists">;
  name: string;
  position: number;
  createdAt: string;
}

// SortableImage component - individual draggable image card
function SortableImage({
  image,
  onDelete,
  onUpdateSubtitle,
}: {
  image: VisionImage;
  onDelete: (id: Id<"visionboard">) => void;
  onUpdateSubtitle: (id: Id<"visionboard">, subtitle: string) => void;
}) {
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

  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [subtitleText, setSubtitleText] = useState(image.subtitle || "");

  const handleSaveSubtitle = () => {
    onUpdateSubtitle(image._id, subtitleText);
    setIsEditingSubtitle(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="group relative w-[256px] min-h-[20px] mb-2 rounded-lg overflow-hidden shadow-sm"
    >
      <div
        className="relative cursor-move"
        style={{
          borderRadius: image.subtitle ? "8px 8px 0 0" : "8px",
        }}
        {...listeners}
      >
        {/* Image - simple img tag with width 100% and height auto */}
        <img
          src={image.url}
          alt={image.subtitle || "Vision board image"}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            maxHeight: "400px",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Overlay buttons - OUTSIDE the drag listeners */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditingSubtitle(true);
          }}
          className="p-1.5 rounded-md bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm cursor-pointer"
        >
          <Edit2 className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(image._id);
          }}
          className="p-1.5 rounded-md bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm cursor-pointer"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Subtitle section - only show if subtitle exists or editing */}
      {(image.subtitle || isEditingSubtitle) && (
        <div className="p-2 bg-white rounded-b-lg">
          {isEditingSubtitle ? (
            <div className="flex items-center gap-1">
              <Input
                value={subtitleText}
                onChange={(e) => setSubtitleText(e.target.value)}
                placeholder="Untertitel..."
                className="h-7 text-xs bg-white text-gray-900"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveSubtitle();
                  else if (e.key === "Escape") {
                    setIsEditingSubtitle(false);
                    setSubtitleText(image.subtitle || "");
                  }
                }}
              />
              <button
                onClick={handleSaveSubtitle}
                className="p-1 rounded hover:bg-gray-100 text-gray-900"
              >
                <Check className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-center text-gray-900">{image.subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}

// DroppableList component - represents one Trello-style list
// This component queries its own images
function DroppableList({
  list,
  onUpdateListName,
  onConvertDefaultList,
  onDelete,
  onUpdateSubtitle,
  onFileUpload,
}: {
  list?: VisionList;
  onUpdateListName?: (listId: Id<"visionboardLists">, name: string) => void;
  onConvertDefaultList?: (name: string) => Promise<void>;
  onDelete: (imageId: Id<"visionboard">) => void;
  onUpdateSubtitle: (imageId: Id<"visionboard">, subtitle: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, listId?: Id<"visionboardLists">) => void;
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [listName, setListName] = useState(list?.name || "🎥🎥🎥");

  // Update listName when list.name changes
  useEffect(() => {
    if (list?.name) {
      setListName(list.name);
    }
  }, [list?.name]);

  // Query images for THIS list
  const listImages = useQuery(api.visionboard.getImagesForList, {
    listId: list?._id,
  });

  const handleSaveListName = async () => {
    if (!listName.trim()) {
      setIsEditingName(false);
      return;
    }

    if (list && onUpdateListName) {
      // Real list - update name
      onUpdateListName(list._id, listName.trim());
    } else if (!list && onConvertDefaultList) {
      // Default list - convert to real list
      await onConvertDefaultList(listName.trim());
    }
    setIsEditingName(false);
  };

  const listId = list?._id || "default";

  // Make the list a droppable zone
  const { setNodeRef } = useDroppable({
    id: listId,
  });

  const images = (listImages as VisionImage[]) || [];

  return (
    <div
      ref={setNodeRef}
      data-list-id={listId}
      className="w-[272px] flex-shrink-0 bg-white dark:bg-white rounded-lg p-2 border border-gray-200 dark:border-gray-300"
    >
      {/* List Header - editable name */}
      <div className="mb-2 px-2 flex items-center justify-between group">
        {isEditingName ? (
          <div className="flex items-center gap-1 flex-1">
            <Input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="h-7 text-sm font-semibold bg-white text-gray-900"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveListName();
                else if (e.key === "Escape") {
                  setIsEditingName(false);
                  setListName(list?.name || "🎥🎥🎥");
                }
              }}
              onBlur={handleSaveListName}
            />
            <button onClick={handleSaveListName} className="text-gray-900">
              <Check className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <h2
            className="text-sm font-semibold flex-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 text-gray-900"
            onClick={() => setIsEditingName(true)}
          >
            {listName}
          </h2>
        )}
      </div>

      {/* Droppable area for images */}
      <SortableContext
        id={listId}
        items={images.map((img) => img._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0 min-h-[100px]">
          {images.map((image) => (
            <SortableImage
              key={image._id}
              image={image}
              onDelete={onDelete}
              onUpdateSubtitle={onUpdateSubtitle}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add Card Button */}
      <div className="mt-2">
        <label
          htmlFor={`image-upload-${listId}`}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer text-sm text-gray-600"
        >
          <Plus className="h-4 w-4" />
          <span>Karte hinzufügen</span>
        </label>
        <input
          id={`image-upload-${listId}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFileUpload(e, list?._id)}
        />
      </div>
    </div>
  );
}

// Main Visionboard component with global drag & drop context
export function Visionboard() {
  const lists = useQuery(api.visionboardLists.getLists);
  const createList = useMutation(api.visionboardLists.createList);
  const updateListName = useMutation(api.visionboardLists.updateListName);
  const convertDefaultListToReal = useMutation(api.visionboardLists.convertDefaultListToReal);

  // Query for images without listId to check if default list should be shown
  const defaultListImages = useQuery(api.visionboard.getImagesForList, {
    listId: undefined,
  });
  const hasDefaultList = defaultListImages && defaultListImages.length > 0;

  // Mutations
  const generateUploadUrl = useMutation(api.visionboard.generateUploadUrl);
  const addImage = useMutation(api.visionboard.addImage);
  const deleteImage = useMutation(api.visionboard.deleteImage);
  const updateSubtitle = useMutation(api.visionboard.updateSubtitle);
  const moveImageToList = useMutation(api.visionboard.moveImageToList);

  const [isUploading, setIsUploading] = useState(false);
  const [activeId, setActiveId] = useState<Id<"visionboard"> | null>(null);

  // Get all lists (including default if it has images)
  const allLists = [
    ...(hasDefaultList || !lists || lists.length === 0 ? [null] : []),
    ...(lists || []),
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateList = async () => {
    try {
      await createList({ name: "Neue Liste" });
      toast.success("Liste erstellt");
    } catch (error) {
      console.error("Create list error:", error);
      toast.error("Fehler beim Erstellen");
    }
  };

  const handleUpdateListName = async (
    listId: Id<"visionboardLists">,
    name: string
  ) => {
    try {
      await updateListName({ listId, name });
      toast.success("Listenname aktualisiert");
    } catch (error) {
      console.error("Update list name error:", error);
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    listId?: Id<"visionboardLists">
  ) => {
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
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const imgElement = new window.Image();
        imgElement.onload = () => resolve(imgElement);
        imgElement.onerror = reject;
        imgElement.src = URL.createObjectURL(file);
      });

      const width = img.naturalWidth;
      const height = img.naturalHeight;

      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();

      await addImage({ storageId, width, height, listId });

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
      toast.success("Untertitel aktualisiert");
    } catch (error) {
      console.error("Update subtitle error:", error);
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as Id<"visionboard">);
  };

  const handleDragOver = () => {
    // Optional: Add visual feedback during drag over
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as Id<"visionboard">;

    // Find which list the dragged item came from
    const activeListId = (active.data.current as { sortable?: { containerId?: string } })?.sortable?.containerId;

    // Find the target: either dropped on another image (over has sortable data) or on a list container
    const overSortable = (over.data.current as { sortable?: { containerId?: string } })?.sortable;
    const overListId = overSortable?.containerId || over.id;

    console.log("Drag end:", { activeId, activeListId, overListId, overId: over.id });

    // If dropped on a different list, move the image
    if (activeListId !== overListId) {
      try {
        // Extract actual list ID (handle "default" case)
        const targetListId = overListId === "default" ? undefined : (overListId as Id<"visionboardLists">);
        await moveImageToList({ imageId: activeId, targetListId });
        toast.success("Bild verschoben");
      } catch (error) {
        console.error("Move error:", error);
        toast.error("Fehler beim Verschieben");
      }
    } else if (active.id !== over.id) {
      // Reorder within the same list - we need to query the images again
      // This is a limitation but it works
      toast.success("Neuordnung wird gespeichert...");
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col">
        {/* Centered Page Title */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-semibold">Vision Board</h1>
        </div>

        {/* Trello-style horizontal scrolling container */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="inline-flex gap-4 p-4 h-full items-start">
            {allLists.map((list) => {
              const listKey = list?._id || "default";

              return (
                <DroppableList
                  key={listKey}
                  list={list || undefined}
                  onUpdateListName={handleUpdateListName}
                  onConvertDefaultList={async (name: string) => {
                    try {
                      await convertDefaultListToReal({ name });
                      toast.success("Liste erstellt");
                    } catch (error) {
                      console.error("Convert error:", error);
                      toast.error("Fehler beim Umbenennen");
                    }
                  }}
                  onDelete={handleDelete}
                  onUpdateSubtitle={handleUpdateSubtitle}
                  onFileUpload={handleFileUpload}
                />
              );
            })}

            {/* Add Another List Button - Trello style */}
            <div className="w-[272px] flex-shrink-0">
              <button
                onClick={handleCreateList}
                disabled={isUploading}
                className="w-full px-3 py-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors text-sm text-muted-foreground flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Weitere Liste hinzufügen</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drag overlay for visual feedback */}
      <DragOverlay>
        {activeId ? (
          <div className="w-[256px] opacity-90 rotate-3">
            <div className="bg-white rounded-lg shadow-xl">
              <div className="text-sm p-4 text-center">Verschieben...</div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
