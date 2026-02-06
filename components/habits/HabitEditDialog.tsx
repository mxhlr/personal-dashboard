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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface HabitEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  habit?: {
    id: string;
    name: string;
    subtitle?: string;
    xp: number;
    isCore: boolean;
  } | null;
  mode: "create" | "edit";
}

export function HabitEditDialog({
  open,
  onOpenChange,
  categoryId,
  habit,
  mode,
}: HabitEditDialogProps) {
  const [name, setName] = useState(habit?.name || "");
  const [subtitle, setSubtitle] = useState(habit?.subtitle || "");
  const [xp, setXp] = useState(habit?.xp?.toString() || "10");
  const [isCore, setIsCore] = useState(habit?.isCore ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTemplate = useMutation(api.habitTemplates.createTemplate);
  const updateTemplate = useMutation(api.habitTemplates.updateTemplate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a habit name");
      return;
    }

    const xpValue = parseInt(xp, 10);
    if (isNaN(xpValue) || xpValue <= 0 || xpValue > 10000) {
      toast.error("XP must be between 1 and 10,000");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await createTemplate({
          categoryId: categoryId as Id<"habitCategories">,
          name: name.trim(),
          subtitle: subtitle.trim() || undefined,
          xpValue,
          isCore,
        });
        toast.success("Habit created successfully");
      } else if (habit) {
        await updateTemplate({
          templateId: habit.id as Id<"habitTemplates">,
          name: name.trim(),
          subtitle: subtitle.trim() || undefined,
          xpValue,
          isCore,
        });
        toast.success("Habit updated successfully");
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      logger.error("Failed to save habit:", error);
      toast.error("Failed to save habit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setSubtitle("");
    setXp("10");
    setIsCore(true);
  };

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setName(habit?.name || "");
      setSubtitle(habit?.subtitle || "");
      setXp(habit?.xp?.toString() || "10");
      setIsCore(habit?.isCore ?? true);
    } else {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Habit" : "Edit Habit"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new habit to this category."
              : "Update the habit details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input
                id="habit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Exercise for 30 minutes"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle (optional)</Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g., BTC, ETH, majors"
              />
              <p className="text-xs text-muted-foreground">
                Context hint or workflow path (e.g., X → Typefully, Discord → Notion)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="xp">XP Value</Label>
              <Input
                id="xp"
                type="number"
                min="1"
                max="10000"
                value={xp}
                onChange={(e) => setXp(e.target.value)}
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">
                How much XP this habit is worth when completed (1-10,000)
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/30 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="is-core" className="text-sm font-medium">
                  Core Habit
                </Label>
                <p className="text-xs text-muted-foreground">
                  Core habits must be completed before extras
                </p>
              </div>
              <Switch
                id="is-core"
                checked={isCore}
                onCheckedChange={setIsCore}
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
