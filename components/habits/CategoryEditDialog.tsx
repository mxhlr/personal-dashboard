"use client";

import { useState } from "react";
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

export function CategoryEditDialog({
  open,
  onOpenChange,
  category,
  mode,
}: CategoryEditDialogProps) {
  const [name, setName] = useState(category?.name || "");
  const [icon, setIcon] = useState(category?.icon || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createCategory = useMutation(api.habitCategories.createCategory);
  const updateCategory = useMutation(api.habitCategories.updateCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !icon.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await createCategory({
          name: name.trim(),
          icon: icon.trim(),
          requiresCoreCompletion: false,
        });
        toast.success("Category created successfully");
      } else if (category) {
        await updateCategory({
          categoryId: category.id as Id<"habitCategories">,
          name: name.trim(),
          icon: icon.trim(),
        });
        toast.success("Category updated successfully");
      }

      onOpenChange(false);
      setName("");
      setIcon("");
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setName(category?.name || "");
      setIcon(category?.icon || "");
    } else {
      setName("");
      setIcon("");
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
              <Label htmlFor="icon">Icon (Emoji)</Label>
              <Input
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🏃"
                className="text-2xl"
                maxLength={4}
              />
              <p className="text-xs text-muted-foreground">
                Enter a single emoji to represent this category
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Morning Routine"
              />
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
