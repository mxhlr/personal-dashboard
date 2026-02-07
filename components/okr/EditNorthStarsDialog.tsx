"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface EditNorthStarsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditNorthStarsDialog({ isOpen, onClose }: EditNorthStarsDialogProps) {
  const profile = useQuery(api.userProfile.getUserProfile);
  const updateNorthStars = useMutation(api.settings.updateNorthStars);
  
  const [wealth, setWealth] = useState<string[]>([""]);
  const [health, setHealth] = useState<string[]>([""]);
  const [love, setLove] = useState<string[]>([""]);
  const [happiness, setHappiness] = useState<string[]>([""]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with current values when dialog opens
  useEffect(() => {
    if (profile && isOpen) {
      setWealth(profile.northStars.wealth.length > 0 ? profile.northStars.wealth : [""]);
      setHealth(profile.northStars.health.length > 0 ? profile.northStars.health : [""]);
      setLove(profile.northStars.love.length > 0 ? profile.northStars.love : [""]);
      setHappiness(profile.northStars.happiness.length > 0 ? profile.northStars.happiness : [""]);
    }
  }, [profile, isOpen]);

  const handleSave = async () => {
    // Filter out empty strings
    const cleanedWealth = wealth.filter(g => g.trim() !== "");
    const cleanedHealth = health.filter(g => g.trim() !== "");
    const cleanedLove = love.filter(g => g.trim() !== "");
    const cleanedHappiness = happiness.filter(g => g.trim() !== "");

    if (!cleanedWealth.length || !cleanedHealth.length || !cleanedLove.length || !cleanedHappiness.length) {
      toast.error("Please add at least one goal per category");
      return;
    }

    setIsSaving(true);
    try {
      await updateNorthStars({
        northStars: {
          wealth: cleanedWealth,
          health: cleanedHealth,
          love: cleanedLove,
          happiness: cleanedHappiness,
        }
      });
      toast.success("North Stars updated!");
      onClose();
    } catch {
      toast.error("Failed to update North Stars");
    } finally {
      setIsSaving(false);
    }
  };

  const addGoal = (category: 'wealth' | 'health' | 'love' | 'happiness') => {
    if (category === 'wealth') setWealth([...wealth, ""]);
    if (category === 'health') setHealth([...health, ""]);
    if (category === 'love') setLove([...love, ""]);
    if (category === 'happiness') setHappiness([...happiness, ""]);
  };

  const removeGoal = (category: 'wealth' | 'health' | 'love' | 'happiness', index: number) => {
    if (category === 'wealth') setWealth(wealth.filter((_, i) => i !== index));
    if (category === 'health') setHealth(health.filter((_, i) => i !== index));
    if (category === 'love') setLove(love.filter((_, i) => i !== index));
    if (category === 'happiness') setHappiness(happiness.filter((_, i) => i !== index));
  };

  const updateGoal = (category: 'wealth' | 'health' | 'love' | 'happiness', index: number, value: string) => {
    if (category === 'wealth') {
      const updated = [...wealth];
      updated[index] = value;
      setWealth(updated);
    }
    if (category === 'health') {
      const updated = [...health];
      updated[index] = value;
      setHealth(updated);
    }
    if (category === 'love') {
      const updated = [...love];
      updated[index] = value;
      setLove(updated);
    }
    if (category === 'happiness') {
      const updated = [...happiness];
      updated[index] = value;
      setHappiness(updated);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-orbitron">Edit Annual North Stars</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>💰 Wealth</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addGoal('wealth')}
                className="h-7 text-xs"
              >
                + Add
              </Button>
            </div>
            <div className="space-y-2">
              {wealth.map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={goal}
                    onChange={(e) => updateGoal('wealth', index, e.target.value)}
                    placeholder="Your wealth goal"
                  />
                  {wealth.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoal('wealth', index)}
                      className="h-10 px-3"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>🏃 Health</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addGoal('health')}
                className="h-7 text-xs"
              >
                + Add
              </Button>
            </div>
            <div className="space-y-2">
              {health.map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={goal}
                    onChange={(e) => updateGoal('health', index, e.target.value)}
                    placeholder="Your health goal"
                  />
                  {health.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoal('health', index)}
                      className="h-10 px-3"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>❤️ Love</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addGoal('love')}
                className="h-7 text-xs"
              >
                + Add
              </Button>
            </div>
            <div className="space-y-2">
              {love.map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={goal}
                    onChange={(e) => updateGoal('love', index, e.target.value)}
                    placeholder="Your love goal"
                  />
                  {love.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoal('love', index)}
                      className="h-10 px-3"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>😊 Happiness</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addGoal('happiness')}
                className="h-7 text-xs"
              >
                + Add
              </Button>
            </div>
            <div className="space-y-2">
              {happiness.map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={goal}
                    onChange={(e) => updateGoal('happiness', index, e.target.value)}
                    placeholder="Your happiness goal"
                  />
                  {happiness.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoal('happiness', index)}
                      className="h-10 px-3"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

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
