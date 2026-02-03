"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingData } from "./SetupWizard";
import { Plus, X } from "lucide-react";

interface Step4MilestonesProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4Milestones({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step4MilestonesProps) {
  const addMilestone = (area: keyof OnboardingData["milestones"]) => {
    onUpdate({
      milestones: {
        ...data.milestones,
        [area]: [...data.milestones[area], ""],
      },
    });
  };

  const updateMilestone = (
    area: keyof OnboardingData["milestones"],
    index: number,
    value: string
  ) => {
    const updated = [...data.milestones[area]];
    updated[index] = value;
    onUpdate({
      milestones: {
        ...data.milestones,
        [area]: updated,
      },
    });
  };

  const removeMilestone = (
    area: keyof OnboardingData["milestones"],
    index: number
  ) => {
    onUpdate({
      milestones: {
        ...data.milestones,
        [area]: data.milestones[area].filter((_, i) => i !== index),
      },
    });
  };

  const hasAtLeastOne = Object.values(data.milestones).every(
    (milestones) => milestones.length > 0 && milestones.every((m) => m.trim())
  );

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-2">Schritt 3/5: Q1 Milestones</h2>
      <p className="text-muted-foreground mb-6">
        Was willst du bis Ende Q1 erreichen?
      </p>

      <div className="space-y-6">
        {(["wealth", "health", "love", "happiness"] as const).map((area) => (
          <div key={area}>
            <Label className="text-lg mb-2 block">
              {area === "wealth" && "💰 WEALTH"}
              {area === "health" && "🏃 HEALTH"}
              {area === "love" && "❤️ LOVE"}
              {area === "happiness" && "😊 HAPPINESS"}
            </Label>
            {data.milestones[area].map((milestone, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={milestone}
                  onChange={(e) => updateMilestone(area, index, e.target.value)}
                  placeholder="Milestone eingeben..."
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMilestone(area, index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addMilestone(area)}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Milestone hinzufügen
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          ← Zurück
        </Button>
        <Button onClick={onNext} disabled={!hasAtLeastOne}>
          Weiter →
        </Button>
      </div>
    </div>
  );
}
