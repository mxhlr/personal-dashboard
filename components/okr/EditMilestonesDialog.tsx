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

interface EditMilestonesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  quarter: number;
}

export function EditMilestonesDialog({ isOpen, onClose, year, quarter }: EditMilestonesDialogProps) {
  const profile = useQuery(api.userProfile.getUserProfile);
  const updateMilestones = useMutation(api.userProfile.updateQuarterlyMilestones);
  
  const [milestones, setMilestones] = useState<Array<{area: string; milestone: string}>>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with current milestones
  useEffect(() => {
    if (profile && isOpen) {
      const currentMilestones = profile.quarterlyMilestones?.filter(
        (m) => m.year === year && m.quarter === quarter
      ) || [];
      
      if (currentMilestones.length > 0) {
        setMilestones(currentMilestones.map(m => ({ area: m.area, milestone: m.milestone })));
      } else {
        setMilestones([{ area: "Wealth", milestone: "" }]);
      }
    }
  }, [profile, isOpen, year, quarter]);

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
    const validMilestones = milestones.filter(m => m.milestone.trim() !== "");

    if (validMilestones.length === 0) {
      toast.error("Add at least one milestone");
      return;
    }

    setIsSaving(true);
    try {
      // Get all existing milestones for other quarters (keep their completed status, year, quarter)
      const otherMilestones = profile?.quarterlyMilestones?.filter(
        (m) => !(m.year === year && m.quarter === quarter)
      ).map(m => ({
        area: m.area,
        milestone: m.milestone,
        year: m.year,
        quarter: m.quarter,
        completed: m.completed
      })) || [];

      // Combine with new milestones for this quarter (all marked as not completed)
      const allMilestones = [
        ...otherMilestones,
        ...validMilestones.map(m => ({
          area: m.area,
          milestone: m.milestone,
          year,
          quarter,
          completed: false
        }))
      ];

      await updateMilestones({ milestones: allMilestones });
      toast.success(`Q${quarter} ${year} Milestones updated!`);
      onClose();
    } catch (error) {
      console.error("Failed to update milestones:", error);
      toast.error("Failed to update milestones");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-orbitron">
            Edit Q{quarter} {year} Milestones
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-2 items-start">
              <div className="flex-1 w-full space-y-2">
                <Select
                  value={milestone.area}
                  onValueChange={(value) => updateMilestone(index, "area", value)}
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
                  value={milestone.milestone}
                  onChange={(e) => updateMilestone(index, "milestone", e.target.value)}
                  placeholder="Describe your quarterly milestone..."
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
