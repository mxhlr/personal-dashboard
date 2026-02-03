"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Visionboard() {
  const visionboardImages = useQuery(api.visionboard.getVisionboardImages);
  const generateUploadUrl = useMutation(api.visionboard.generateUploadUrl);
  const addImage = useMutation(api.visionboard.addImage);
  const deleteImage = useMutation(api.visionboard.deleteImage);

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Bitte lade nur Bilder hoch");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Bild ist zu groß (max 5MB)");
      return;
    }

    setIsUploading(true);
    try {
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload file to Convex
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();

      // Save image reference to database
      await addImage({ storageId });

      toast.success("Bild hochgeladen!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Fehler beim Hochladen");
    } finally {
      setIsUploading(false);
      // Reset input
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold">Visionboard</h1>
        <p className="text-sm text-muted-foreground">
          Visualisiere deine Ziele und Träume
        </p>
      </div>

      {/* Upload Button */}
      <div className="flex justify-center">
        <label htmlFor="image-upload">
          <Button
            type="button"
            onClick={() => document.getElementById("image-upload")?.click()}
            disabled={isUploading}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {isUploading ? "Lädt hoch..." : "Bild hinzufügen"}
          </Button>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Images Grid */}
      {visionboardImages && visionboardImages.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visionboardImages.map((image) => (
            <div
              key={image._id}
              className="group relative aspect-square rounded-lg overflow-hidden bg-card border shadow-sm hover:shadow-md transition-shadow"
            >
              <Image
                src={image.url}
                alt="Vision board image"
                fill
                className="object-cover"
              />
              {/* Delete Button (shows on hover) */}
              <button
                onClick={() => handleDelete(image._id)}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                aria-label="Delete image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Noch keine Bilder. Füge dein erstes Vision hinzu!</p>
        </div>
      )}
    </div>
  );
}
