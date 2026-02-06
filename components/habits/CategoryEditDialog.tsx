"use client";

import { useState } from "react";
import { logger } from "@/lib/logger";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CategoryEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: {
    id: string;
    name: string;
    icon: string;
  } | null;
  mode: "create" | "edit";
}

const PREDEFINED_COLORS = [
  { name: "Gray", value: "#888888" },
  { name: "Cyan", value: "#00BCD4" },
  { name: "Green", value: "#4CAF50" },
  { name: "Orange", value: "#FF9800" },
  { name: "Red", value: "#F44336" },
  { name: "Purple", value: "#9C27B0" },
  { name: "Blue", value: "#2196F3" },
  { name: "Yellow", value: "#FFEB3B" },
  { name: "Pink", value: "#E91E63" },
];

export function CategoryEditDialog({
  open,
  onOpenChange,
  category,
  mode,
}: CategoryEditDialogProps) {
  const [name, setName] = useState(category?.name || "");
  const [color, setColor] = useState(category?.icon || PREDEFINED_COLORS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createCategory = useMutation(api.habitCategories.createCategory);
  const updateCategory = useMutation(api.habitCategories.updateCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !color.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await createCategory({
          name: name.trim(),
          icon: color.trim(),
          requiresCoreCompletion: false,
        });
        toast.success("Category created successfully");
      } else if (category) {
        await updateCategory({
          categoryId: category.id as Id<"habitCategories">,
          name: name.trim(),
          icon: color.trim(),
        });
        toast.success("Category updated successfully");
      }

      onOpenChange(false);
      setName("");
      setColor(PREDEFINED_COLORS[0].value);
    } catch (error) {
      logger.error("Failed to save category:", error);
      toast.error("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setName(category?.name || "");
      setColor(category?.icon || PREDEFINED_COLORS[0].value);
    } else {
      setName("");
      setColor(PREDEFINED_COLORS[0].value);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Category" : "Edit Category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new habit category to organize your habits."
              : "Update the category name and icon."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Morning Routine"
              />
            </div>

            <div className="space-y-2">
              <Label>Circle Color</Label>
              <div className="flex gap-2 flex-wrap">
                {PREDEFINED_COLORS.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setColor(colorOption.value)}
                    className={`w-10 h-10 rounded-full transition-all ${
                      color === colorOption.value
                        ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: colorOption.value }}
                    title={colorOption.name}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select a color for the category number circle
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
