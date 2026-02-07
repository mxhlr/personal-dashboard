"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

interface EditWeeklyGoalsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  weekNumber: number;
}

export function EditWeeklyGoalsDialog({ isOpen, onClose, year, weekNumber }: EditWeeklyGoalsDialogProps) {
  const weeklyGoals = useQuery(api.weeklyReview.getWeeklyGoals, { year, weekNumber });
  const updateWeeklyGoals = useMutation(api.weeklyReview.updateWeeklyGoals);

  const [goals, setGoals] = useState<Array<{category: string; goal: string}>>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with current goals
  useEffect(() => {
    if (weeklyGoals && isOpen) {
      if (weeklyGoals.length > 0) {
        setGoals(weeklyGoals.map(g => ({ category: g.category || "Wealth", goal: g.goal })));
      } else {
        setGoals([{ category: "Wealth", goal: "" }]);
      }
    }
  }, [weeklyGoals, isOpen]);

  const addGoal = () => {
    setGoals((prev) => [...prev, { category: "Wealth", goal: "" }]);
  };

  const removeGoal = (index: number) => {
    setGoals((prev) => prev.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, field: "category" | "goal", value: string) => {
    setGoals((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    const validGoals = goals.filter(g => g.goal.trim() !== "");

    if (validGoals.length === 0) {
      toast.error("Add at least one goal");
      return;
    }

    setIsSaving(true);
    try {
      await updateWeeklyGoals({
        year,
        weekNumber,
        goals: validGoals
      });
      toast.success(`Week ${weekNumber} goals updated!`);
      onClose();
    } catch (error) {
      console.error("Failed to update goals:", error);
      toast.error("Failed to update goals");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-orbitron">
            Edit Week {weekNumber} {year} Goals
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {goals.map((goal, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-2 items-start">
              <div className="flex-1 w-full space-y-2">
                <Select
                  value={goal.category || "Wealth"}
                  onValueChange={(value) => updateGoal(index, "category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wealth">💰 Wealth</SelectItem>
                    <SelectItem value="Health">🏃 Health</SelectItem>
                    <SelectItem value="Love">❤️ Love</SelectItem>
                    <SelectItem value="Happiness">😊 Happiness</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={goal.goal}
                  onChange={(e) => updateGoal(index, "goal", e.target.value)}
                  placeholder="Describe your weekly goal..."
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeGoal(index)}
                disabled={goals.length === 1}
                className="sm:mt-1 w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addGoal}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSaving} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
