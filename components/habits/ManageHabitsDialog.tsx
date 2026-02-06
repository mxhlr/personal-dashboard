"use client";

import { useState } from "react";
import { logger } from "@/lib/logger";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryEditDialog } from "./CategoryEditDialog";
import { HabitEditDialog } from "./HabitEditDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import {
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

interface ManageHabitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageHabitsDialog({
  open,
  onOpenChange,
}: ManageHabitsDialogProps) {
  const categories = useQuery(api.habitCategories.listCategories);
  const habitTemplates = useQuery(api.habitTemplates.listTemplates, {});

  const deleteCategory = useMutation(api.habitCategories.deleteCategory);
  const deleteTemplate = useMutation(api.habitTemplates.deleteTemplate);
  const reorderCategories = useMutation(api.habitCategories.reorderCategories);
  const reorderTemplates = useMutation(api.habitTemplates.reorderTemplates);

  const [categoryEditOpen, setCategoryEditOpen] = useState(false);
  const [categoryEditMode, setCategoryEditMode] = useState<"create" | "edit">(
    "create"
  );
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
    icon: string;
  } | null>(null);

  const [habitEditOpen, setHabitEditOpen] = useState(false);
  const [habitEditMode, setHabitEditMode] = useState<"create" | "edit">(
    "create"
  );
  const [selectedHabit, setSelectedHabit] = useState<{
    id: string;
    name: string;
    subtitle?: string;
    xp: number;
    isCore: boolean;
  } | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "category" | "habit";
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateCategory = () => {
    setCategoryEditMode("create");
    setSelectedCategory(null);
    setCategoryEditOpen(true);
  };

  const handleEditCategory = (category: {
    id: string;
    name: string;
    icon: string;
  }) => {
    setCategoryEditMode("edit");
    setSelectedCategory(category);
    setCategoryEditOpen(true);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setDeleteTarget({ type: "category", id, name });
    setDeleteDialogOpen(true);
  };

  const handleCreateHabit = (categoryId: string) => {
    setHabitEditMode("create");
    setSelectedCategoryId(categoryId);
    setSelectedHabit(null);
    setHabitEditOpen(true);
  };

  const handleEditHabit = (
    categoryId: string,
    habit: { id: string; name: string; subtitle?: string; xp: number; isCore: boolean }
  ) => {
    setHabitEditMode("edit");
    setSelectedCategoryId(categoryId);
    setSelectedHabit(habit);
    setHabitEditOpen(true);
  };

  const handleDeleteHabit = (id: string, name: string) => {
    setDeleteTarget({ type: "habit", id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      if (deleteTarget.type === "category") {
        await deleteCategory({
          categoryId: deleteTarget.id as Id<"habitCategories">,
        });
        toast.success("Category deleted successfully");
      } else {
        await deleteTemplate({
          templateId: deleteTarget.id as Id<"habitTemplates">,
        });
        toast.success("Habit deleted successfully");
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      logger.error("Failed to delete:", error);
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMoveCategoryUp = async (index: number) => {
    if (!categories || index === 0) return;

    const newOrder = [...categories];
    [newOrder[index - 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index - 1],
    ];

    try {
      await reorderCategories({
        categoryIds: newOrder.map((c) => c._id),
      });
      toast.success("Category moved up");
    } catch (error) {
      logger.error("Failed to reorder:", error);
      toast.error("Failed to reorder categories");
    }
  };

  const handleMoveCategoryDown = async (index: number) => {
    if (!categories || index === categories.length - 1) return;

    const newOrder = [...categories];
    [newOrder[index], newOrder[index + 1]] = [
      newOrder[index + 1],
      newOrder[index],
    ];

    try {
      await reorderCategories({
        categoryIds: newOrder.map((c) => c._id),
      });
      toast.success("Category moved down");
    } catch (error) {
      logger.error("Failed to reorder:", error);
      toast.error("Failed to reorder categories");
    }
  };

  const handleMoveHabitUp = async (categoryId: string, index: number) => {
    if (!habitTemplates) return;

    const categoryHabits = habitTemplates
      .filter((t) => t.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);

    if (index === 0) return;

    const newOrder = [...categoryHabits];
    [newOrder[index - 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index - 1],
    ];

    try {
      await reorderTemplates({
        categoryId: categoryId as Id<"habitCategories">,
        templateIds: newOrder.map((h) => h._id),
      });
      toast.success("Habit moved up");
    } catch (error) {
      logger.error("Failed to reorder:", error);
      toast.error("Failed to reorder habits");
    }
  };

  const handleMoveHabitDown = async (categoryId: string, index: number) => {
    if (!habitTemplates) return;

    const categoryHabits = habitTemplates
      .filter((t) => t.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);

    if (index === categoryHabits.length - 1) return;

    const newOrder = [...categoryHabits];
    [newOrder[index], newOrder[index + 1]] = [
      newOrder[index + 1],
      newOrder[index],
    ];

    try {
      await reorderTemplates({
        categoryId: categoryId as Id<"habitCategories">,
        templateIds: newOrder.map((h) => h._id),
      });
      toast.success("Habit moved down");
    } catch (error) {
      logger.error("Failed to reorder:", error);
      toast.error("Failed to reorder habits");
    }
  };

  if (!categories || !habitTemplates) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Habits & Categories</DialogTitle>
            <DialogDescription>
              Add, edit, delete, and reorder your habit categories and templates.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between py-2">
            <p className="text-sm text-muted-foreground">
              {categories.length} categories, {habitTemplates.length} habit
              templates
            </p>
            <Button onClick={handleCreateCategory} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          </div>

          <Separator />

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {categories.map((category, catIndex) => {
                const categoryHabits = habitTemplates
                  .filter((t) => t.categoryId === category._id)
                  .sort((a, b) => a.order - b.order);

                return (
                  <div
                    key={category._id}
                    className="rounded-lg border border-border/50 bg-card/30 p-4"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-[#E0E0E0] dark:text-[#E0E0E0] text-[#333333]">
                          {catIndex + 1}
                        </span>
                        {category.icon?.startsWith("#") && (
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: category.icon }}
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {categoryHabits.length} habits
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Reorder buttons */}
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => handleMoveCategoryUp(catIndex)}
                            disabled={catIndex === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => handleMoveCategoryDown(catIndex)}
                            disabled={catIndex === categories.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Actions dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleEditCategory({
                                  id: category._id,
                                  name: category.name,
                                  icon: category.icon,
                                })
                              }
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCreateHabit(category._id)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Habit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteCategory(category._id, category.name)
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Habits List */}
                    {categoryHabits.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {categoryHabits.map((habit, habitIndex) => (
                          <div
                            key={habit._id}
                            className="flex items-center justify-between rounded-md border border-border/30 bg-card/20 p-2 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                                  habit.isCore
                                    ? "bg-cyan-500/20 text-cyan-400"
                                    : "bg-orange-500/20 text-orange-400"
                                }`}
                              >
                                {habit.isCore ? "Core" : "Extra"}
                              </span>
                              <span>{habit.name}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-orange-500">
                                +{habit.xpValue} XP
                              </span>

                              {/* Reorder buttons */}
                              <div className="flex flex-col gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    handleMoveHabitUp(category._id, habitIndex)
                                  }
                                  disabled={habitIndex === 0}
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0"
                                  onClick={() =>
                                    handleMoveHabitDown(category._id, habitIndex)
                                  }
                                  disabled={habitIndex === categoryHabits.length - 1}
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Actions dropdown */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleEditHabit(category._id, {
                                        id: habit._id,
                                        name: habit.name,
                                        subtitle: habit.subtitle,
                                        xp: habit.xpValue,
                                        isCore: habit.isCore,
                                      })
                                    }
                                  >
                                    <Pencil className="mr-2 h-3 w-3" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteHabit(habit._id, habit.name)
                                    }
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-3 w-3" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {categoryHabits.length === 0 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          No habits yet.
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleCreateHabit(category._id)}
                          className="mt-1"
                        >
                          Add your first habit
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}

              {categories.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No categories yet.</p>
                  <Button
                    variant="link"
                    onClick={handleCreateCategory}
                    className="mt-2"
                  >
                    Create your first category
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Category Edit Dialog */}
      <CategoryEditDialog
        open={categoryEditOpen}
        onOpenChange={setCategoryEditOpen}
        category={selectedCategory}
        mode={categoryEditMode}
      />

      {/* Habit Edit Dialog */}
      <HabitEditDialog
        open={habitEditOpen}
        onOpenChange={setHabitEditOpen}
        categoryId={selectedCategoryId}
        habit={selectedHabit}
        mode={habitEditMode}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title={
          deleteTarget?.type === "category"
            ? "Delete Category"
            : "Delete Habit"
        }
        description={
          deleteTarget?.type === "category"
            ? `Are you sure you want to delete "${deleteTarget.name}"? This will also delete all habits in this category and cannot be undone.`
            : `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`
        }
      />
    </>
  );
}
