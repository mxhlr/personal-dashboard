"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingData } from "./SetupWizard";

interface Step3NorthStarsProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3NorthStars({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step3NorthStarsProps) {
  const canProceed =
    data.northStars.wealth &&
    data.northStars.health &&
    data.northStars.love &&
    data.northStars.happiness;

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-2">Schritt 2/5: Deine North Stars</h2>
      <p className="text-muted-foreground mb-6">
        Was willst du dieses Jahr erreichen? (1 Ziel pro Lebensbereich)
      </p>

      <div className="space-y-6">
        <div>
          <Label>💰 WEALTH (Geld, Karriere, Business)</Label>
          <Input
            value={data.northStars.wealth}
            onChange={(e) =>
              onUpdate({
                northStars: { ...data.northStars, wealth: e.target.value },
              })
            }
            placeholder="z.B. SaaS auf 10k MRR"
            className="mt-2"
          />
        </div>

        <div>
          <Label>🏃 HEALTH (Körper, Fitness, Ernährung)</Label>
          <Input
            value={data.northStars.health}
            onChange={(e) =>
              onUpdate({
                northStars: { ...data.northStars, health: e.target.value },
              })
            }
            placeholder="z.B. Halbmarathon laufen"
            className="mt-2"
          />
        </div>

        <div>
          <Label>❤️ LOVE (Beziehungen, Familie, Freunde)</Label>
          <Input
            value={data.northStars.love}
            onChange={(e) =>
              onUpdate({
                northStars: { ...data.northStars, love: e.target.value },
              })
            }
            placeholder="z.B. Weekly Date Night etablieren"
            className="mt-2"
          />
        </div>

        <div>
          <Label>😊 HAPPINESS (Erfüllung, Hobbies, Sinn)</Label>
          <Input
            value={data.northStars.happiness}
            onChange={(e) =>
              onUpdate({
                northStars: { ...data.northStars, happiness: e.target.value },
              })
            }
            placeholder="z.B. Meditation täglich"
            className="mt-2"
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          ← Zurück
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Weiter →
        </Button>
      </div>
    </div>
  );
}
