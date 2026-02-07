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
  
  const [wealth, setWealth] = useState("");
  const [health, setHealth] = useState("");
  const [love, setLove] = useState("");
  const [happiness, setHappiness] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with current values when dialog opens
  useEffect(() => {
    if (profile && isOpen) {
      setWealth(profile.northStars.wealth);
      setHealth(profile.northStars.health);
      setLove(profile.northStars.love);
      setHappiness(profile.northStars.happiness);
    }
  }, [profile, isOpen]);

  const handleSave = async () => {
    if (!wealth || !health || !love || !happiness) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSaving(true);
    try {
      await updateNorthStars({
        northStars: {
          wealth,
          health,
          love,
          happiness,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-orbitron">Edit Annual North Stars</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="wealth">💰 Wealth</Label>
            <Input
              id="wealth"
              value={wealth}
              onChange={(e) => setWealth(e.target.value)}
              placeholder="Your wealth vision for the year"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="health">🏃 Health</Label>
            <Input
              id="health"
              value={health}
              onChange={(e) => setHealth(e.target.value)}
              placeholder="Your health vision for the year"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="love">❤️ Love</Label>
            <Input
              id="love"
              value={love}
              onChange={(e) => setLove(e.target.value)}
              placeholder="Your love vision for the year"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="happiness">😊 Happiness</Label>
            <Input
              id="happiness"
              value={happiness}
              onChange={(e) => setHappiness(e.target.value)}
              placeholder="Your happiness vision for the year"
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
