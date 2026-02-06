"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { OnboardingData } from "./SetupWizard";

interface Step6CoachProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onComplete: () => void;
  onBack: () => void;
}

const coachTones = [
  {
    value: "Motivierend",
    label: "Motivierend",
    description: "Ermutigend, positiv, pusht dich vorwärts",
  },
  {
    value: "Sachlich",
    label: "Sachlich",
    description: "Neutral, faktenbasiert, objektiv",
  },
  {
    value: "Empathisch",
    label: "Empathisch",
    description: "Verständnisvoll, unterstützend, einfühlsam",
  },
  {
    value: "Direkt",
    label: "Direkt",
    description: "Klar, ehrlich, ohne Umschweife",
  },
];

export default function Step6Coach({
  data,
  onUpdate,
  onComplete,
  onBack,
}: Step6CoachProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-2">Schritt 5/5: Coach Einstellungen</h2>
      <p className="text-muted-foreground mb-6">
        Wie soll dein Coach mit dir kommunizieren?
      </p>

      <div className="space-y-6 mb-8">
        <div>
          <Label className="text-lg mb-4 block">Coach Tonalität</Label>
          <RadioGroup
            value={data.coachTone}
            onValueChange={(value) => onUpdate({ coachTone: value })}
            className="space-y-3"
          >
            {coachTones.map((tone) => (
              <div
                key={tone.value}
                className="flex items-start space-x-3 border border-border/60 rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <RadioGroupItem value={tone.value} id={tone.value} className="mt-1" />
                <Label
                  htmlFor={tone.value}
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium mb-1">{tone.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {tone.description}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Zurück
        </Button>
        <Button onClick={onComplete} size="lg">
          Fertig
        </Button>
      </div>
    </div>
  );
}
