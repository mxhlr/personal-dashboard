"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

export function VisionBoardSettings() {
  const lists = useQuery(api.visionboardLists.getLists);
  const createList = useMutation(api.visionboardLists.createList);
  const updateListName = useMutation(api.visionboardLists.updateListName);
  const deleteList = useMutation(api.visionboardLists.deleteList);
  const reorderLists = useMutation(api.visionboardLists.reorderLists);

  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListIcon, setNewListIcon] = useState("");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  const handleCreate = async () => {
    if (!newListName.trim()) {
      toast.error("Bitte gib einen Namen ein");
      return;
    }

    try {
      await createList({ name: `${newListIcon} ${newListName}`.trim() });
      toast.success("Liste erstellt");
      setNewListName("");
      setNewListIcon("");
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create list:", error);
      toast.error("Fehler beim Erstellen");
    }
  };

  const handleUpdate = async (listId: Id<"visionboardLists">) => {
    if (!editName.trim()) {
      toast.error("Bitte gib einen Namen ein");
      return;
    }

    try {
      await updateListName({
        listId,
        name: `${editIcon} ${editName}`.trim(),
      });
      toast.success("Liste aktualisiert");
      setEditingListId(null);
      setEditName("");
      setEditIcon("");
    } catch (error) {
      console.error("Failed to update list:", error);
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleDelete = async (listId: Id<"visionboardLists">, name: string) => {
    if (!confirm(`Diese Liste "${name}" und alle Karten darin wirklich löschen?`)) {
      return;
    }

    try {
      await deleteList({ listId });
      toast.success("Liste gelöscht");
    } catch (error) {
      console.error("Failed to delete list:", error);
      toast.error("Fehler beim Löschen");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!lists || index === 0) return;

    const newOrder = [...lists];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];

    try {
      await reorderLists({
        listIds: newOrder.map((l) => l._id),
      });
      toast.success("Reihenfolge geändert");
    } catch (error) {
      console.error("Failed to reorder:", error);
      toast.error("Fehler beim Sortieren");
    }
  };

  const handleMoveDown = async (index: number) => {
    if (!lists || index === lists.length - 1) return;

    const newOrder = [...lists];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];

    try {
      await reorderLists({
        listIds: newOrder.map((l) => l._id),
      });
      toast.success("Reihenfolge geändert");
    } catch (error) {
      console.error("Failed to reorder:", error);
      toast.error("Fehler beim Sortieren");
    }
  };

  const startEdit = (list: { _id: Id<"visionboardLists">; name: string }) => {
    setEditingListId(list._id);
    // Extract icon and name from the list name
    const parts = list.name.split(" ");
    if (parts.length > 1 && /\p{Emoji}/u.test(parts[0])) {
      setEditIcon(parts[0]);
      setEditName(parts.slice(1).join(" "));
    } else {
      setEditIcon("");
      setEditName(list.name);
    }
  };

  if (!lists) {
    return <div className="text-sm text-muted-foreground">Lädt...</div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Verwalte deine Vision Board Listen und Spalten
      </p>

      {/* Existing Lists */}
      <div className="space-y-2">
        {lists.map((list, index) => (
          <div
            key={list._id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
          >
            {editingListId === list._id ? (
              <>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    placeholder="🎨"
                    className="w-16 text-center"
                    maxLength={2}
                  />
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Name"
                    className="flex-1"
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUpdate(list._id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingListId(null);
                    setEditName("");
                    setEditIcon("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <span className="text-lg">{list.name}</span>
                <div className="flex-1" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEdit(list)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(list._id, list.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="flex flex-col gap-0.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === lists.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Create New List */}
      {isCreating ? (
        <div className="p-4 rounded-lg border border-border bg-card space-y-3">
          <div className="space-y-2">
            <Label>Icon/Emoji</Label>
            <Input
              value={newListIcon}
              onChange={(e) => setNewListIcon(e.target.value)}
              placeholder="🎨"
              maxLength={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Listen-Name</Label>
            <Input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="z.B. Lifestyle"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate}>Erstellen</Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setNewListName("");
                setNewListIcon("");
              }}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setIsCreating(true)} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Neue Liste hinzufügen
        </Button>
      )}
    </div>
  );
}
