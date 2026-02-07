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

interface EditMonthlyMilestonesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  month: number;
}

export function EditMonthlyMilestonesDialog({ isOpen, onClose, year, month }: EditMonthlyMilestonesDialogProps) {
  const monthlyMilestones = useQuery(api.monthlyReview.getMonthlyMilestones, { year, month });
  const updateMonthlyMilestones = useMutation(api.monthlyReview.updateMonthlyMilestones);

  const [milestones, setMilestones] = useState<Array<{area: string; milestone: string}>>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with current milestones
  useEffect(() => {
    if (monthlyMilestones && isOpen) {
      if (monthlyMilestones.length > 0) {
        setMilestones(monthlyMilestones.map(m => ({
          area: m.area || "Wealth",
          milestone: m.milestone
        })));
      } else {
        setMilestones([{ area: "Wealth", milestone: "" }]);
      }
    }
  }, [monthlyMilestones, isOpen]);

  const addMilestone = () => {
    setMilestones((prev) => [...prev, { area: "Wealth", milestone: "" }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: "area" | "milestone", value: string) => {
    setMilestones((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    // Validate that all milestones have both area and milestone filled
    const validMilestones = milestones.filter(m => m.milestone.trim() !== "" && m.area.trim() !== "");

    if (validMilestones.length === 0) {
      toast.error("Add at least one milestone");
      return;
    }

    // Check if any milestone has an empty area
    const hasEmptyArea = milestones.some(m => m.milestone.trim() !== "" && !m.area);
    if (hasEmptyArea) {
      toast.error("Please select a category for all milestones");
      return;
    }

    setIsSaving(true);
    try {
      await updateMonthlyMilestones({
        year,
        month,
        milestones: validMilestones
      });
      toast.success(`Monthly milestones updated!`);
      onClose();
    } catch (error) {
      console.error("Failed to update milestones:", error);
      toast.error("Failed to update milestones");
    } finally {
      setIsSaving(false);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-orbitron">
            Edit {monthNames[month - 1]} {year} Milestones
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-2 items-start">
              <div className="flex-1 w-full space-y-2">
                <Select
                  value={milestone.area || "Wealth"}
                  onValueChange={(value) => updateMilestone(index, "area", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wealth">💰 Wealth</SelectItem>
                    <SelectItem value="Health">🏃 Health</SelectItem>
                    <SelectItem value="Love">❤️ Love</SelectItem>
                    <SelectItem value="Happiness">😊 Happiness</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={milestone.milestone}
                  onChange={(e) => updateMilestone(index, "milestone", e.target.value)}
                  placeholder="Describe your monthly milestone..."
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMilestone(index)}
                disabled={milestones.length === 1}
                className="sm:mt-1 w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addMilestone}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
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
