"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus, X } from "lucide-react";

interface EditWeeklyGoalsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  weekNumber: number;
}

interface KeyResult {
  description: string;
  target: number;
  unit: string;
}

interface WeeklyGoal {
  area: string;
  objective: string;
  keyResults: KeyResult[];
}

export function EditWeeklyGoalsDialog({ isOpen, onClose, year, weekNumber }: EditWeeklyGoalsDialogProps) {
  const weeklyGoals = useQuery(api.weeklyReview.getWeeklyGoals, { year, weekNumber });
  const updateWeeklyGoals = useMutation(api.weeklyReview.updateWeeklyGoals);

  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with current goals
  useEffect(() => {
    if (weeklyGoals && isOpen) {
      if (weeklyGoals.length > 0) {
        setGoals(weeklyGoals);
      } else {
        setGoals([{
          area: "Wealth",
          objective: "",
          keyResults: [{ description: "", target: 1, unit: "" }]
        }]);
      }
    }
  }, [weeklyGoals, isOpen]);

  const addGoal = () => {
    setGoals((prev) => [...prev, {
      area: "Wealth",
      objective: "",
      keyResults: [{ description: "", target: 1, unit: "" }]
    }]);
  };

  const removeGoal = (index: number) => {
    setGoals((prev) => prev.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, field: "area" | "objective", value: string) => {
    setGoals((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addKeyResult = (goalIndex: number) => {
    setGoals((prev) => {
      const updated = [...prev];
      updated[goalIndex].keyResults.push({ description: "", target: 1, unit: "" });
      return updated;
    });
  };

  const removeKeyResult = (goalIndex: number, krIndex: number) => {
    setGoals((prev) => {
      const updated = [...prev];
      updated[goalIndex].keyResults = updated[goalIndex].keyResults.filter((_, i) => i !== krIndex);
      return updated;
    });
  };

  const updateKeyResult = (goalIndex: number, krIndex: number, field: keyof KeyResult, value: string | number) => {
    setGoals((prev) => {
      const updated = [...prev];
      updated[goalIndex].keyResults[krIndex] = {
        ...updated[goalIndex].keyResults[krIndex],
        [field]: value
      };
      return updated;
    });
  };

  const handleSave = async () => {
    const validGoals = goals.filter(goal =>
      goal.objective.trim() !== "" &&
      goal.keyResults.some(kr => kr.description.trim() !== "")
    ).map(goal => ({
      ...goal,
      keyResults: goal.keyResults.filter(kr => kr.description.trim() !== "")
    }));

    if (validGoals.length === 0) {
      toast.error("Add at least one goal with objectives and key results");
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
      <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-orbitron">
            Edit Week {weekNumber} {year} Goals
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {goals.map((goal, goalIndex) => (
            <div key={goalIndex} className="p-4 border rounded-lg space-y-4 dark:border-white/[0.08] border-black/[0.08]">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-3">
                  <Select
                    value={goal.area}
                    onValueChange={(value) => updateGoal(goalIndex, "area", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wealth">💰 Wealth</SelectItem>
                      <SelectItem value="Health">🏃 Health</SelectItem>
                      <SelectItem value="Love">❤️ Love</SelectItem>
                      <SelectItem value="Happiness">😊 Happiness</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    value={goal.objective}
                    onChange={(e) => updateGoal(goalIndex, "objective", e.target.value)}
                    placeholder="Objective (e.g., 'Complete key project deliverables')"
                  />

                  <div className="space-y-2 pl-4 border-l-2 dark:border-white/[0.08] border-black/[0.08]">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Key Results</Label>
                    {goal.keyResults.map((kr, krIndex) => (
                      <div key={krIndex} className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Input
                            value={kr.description}
                            onChange={(e) => updateKeyResult(goalIndex, krIndex, "description", e.target.value)}
                            placeholder="Description"
                            className="sm:col-span-2"
                          />
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              value={kr.target}
                              onChange={(e) => updateKeyResult(goalIndex, krIndex, "target", parseInt(e.target.value) || 0)}
                              placeholder="Target"
                              className="w-20"
                            />
                            <Input
                              value={kr.unit}
                              onChange={(e) => updateKeyResult(goalIndex, krIndex, "unit", e.target.value)}
                              placeholder="Unit"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeKeyResult(goalIndex, krIndex)}
                          disabled={goal.keyResults.length === 1}
                          className="h-9 w-9"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addKeyResult(goalIndex)}
                      className="w-full"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Key Result
                    </Button>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeGoal(goalIndex)}
                  disabled={goals.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
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
