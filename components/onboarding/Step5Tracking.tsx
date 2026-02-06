"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { OnboardingData } from "./SetupWizard";
import { Plus } from "lucide-react";
import { useState } from "react";

interface Step5TrackingProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface DefaultField {
  name: string;
  type: string;
  hasStreak: boolean;
  description: string;
}

const defaultFields: DefaultField[] = [
  { name: "Movement", type: "text", hasStreak: false, description: "Training/Bewegung" },
  { name: "Phone Jail", type: "toggle", hasStreak: true, description: "Handy-Disziplin" },
  { name: "Vibes", type: "text", hasStreak: false, description: "Stimmung/Energie" },
  { name: "Breakfast", type: "text", hasStreak: false, description: "Frühstück" },
  { name: "Lunch", type: "text", hasStreak: false, description: "Mittagessen" },
  { name: "Dinner", type: "text", hasStreak: false, description: "Abendessen" },
  { name: "Work Hours", type: "text", hasStreak: false, description: "Arbeitsstunden" },
  { name: "Work Notes", type: "text", hasStreak: false, description: "Arbeitsnotizen" },
];

export default function Step5Tracking({
  data,
  onUpdate,
  onNext,
  onBack,
}: Step5TrackingProps) {
  const [customFieldName, setCustomFieldName] = useState("");

  const isFieldSelected = (fieldName: string) => {
    return data.trackingFields.some((f) => f.name === fieldName);
  };

  const toggleField = (field: DefaultField) => {
    const updatedFields = [...data.trackingFields];
    const existingIndex = updatedFields.findIndex((f) => f.name === field.name);

    if (existingIndex >= 0) {
      // Remove field
      updatedFields.splice(existingIndex, 1);
    } else {
      // Add field
      updatedFields.push({
        name: field.name,
        type: field.type,
        hasStreak: field.hasStreak,
        weeklyTarget: field.hasStreak ? 5 : undefined,
      });
    }

    onUpdate({ trackingFields: updatedFields });
  };

  const updateWeeklyTarget = (fieldName: string, target: number) => {
    // Validate target is between 1 and 7
    if (target < 1 || target > 7) {
      return;
    }
    const updatedFields = data.trackingFields.map((f) =>
      f.name === fieldName ? { ...f, weeklyTarget: target } : f
    );
    onUpdate({ trackingFields: updatedFields });
  };

  const addCustomField = () => {
    if (!customFieldName.trim()) return;

    // Check if field already exists (case-insensitive)
    const fieldExists = data.trackingFields.some(
      (f) => f.name.toLowerCase() === customFieldName.trim().toLowerCase()
    );

    if (fieldExists) {
      alert(`Ein Feld mit dem Namen "${customFieldName}" existiert bereits.`);
      return;
    }

    const newField = {
      name: customFieldName.trim(),
      type: "text",
      hasStreak: false,
      weeklyTarget: undefined,
    };

    onUpdate({
      trackingFields: [...data.trackingFields, newField],
    });

    setCustomFieldName("");
  };

  const canProceed = data.trackingFields.length > 0;

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-2">Schritt 4/5: Tracking Felder</h2>
      <p className="text-muted-foreground mb-6">
        Was willst du täglich tracken?
      </p>

      <div className="space-y-4 mb-6">
        {defaultFields.map((field) => {
          const isSelected = isFieldSelected(field.name);
          const selectedField = data.trackingFields.find((f) => f.name === field.name);

          return (
            <div key={field.name} className="border border-border/60 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleField(field)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">{field.name}</Label>
                    {field.hasStreak && (
                      <span className="text-xs bg-primary/10 dark:bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Streak
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {field.description}
                  </p>

                  {isSelected && field.hasStreak && (
                    <div className="mt-3">
                      <Label className="text-sm">
                        Wöchentliches Ziel (Tage):
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="7"
                        value={selectedField?.weeklyTarget || 5}
                        onChange={(e) =>
                          updateWeeklyTarget(
                            field.name,
                            parseInt(e.target.value) || 5
                          )
                        }
                        className="mt-1 w-24"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Fields Section */}
      {data.trackingFields.filter((f) => !defaultFields.some((df) => df.name === f.name)).length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Eigene Felder</h3>
          {data.trackingFields
            .filter((f) => !defaultFields.some((df) => df.name === f.name))
            .map((field, index) => (
              <div key={`custom-${index}`} className="border border-border/60 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{field.name}</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Custom Field
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updatedFields = data.trackingFields.filter(
                        (f) => f.name !== field.name
                      );
                      onUpdate({ trackingFields: updatedFields });
                    }}
                  >
                    Entfernen
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="border border-dashed border-border/60 rounded-lg p-4 mb-6">
        <Label className="mb-2 block">Eigenes Feld hinzufügen</Label>
        <div className="flex gap-2">
          <Input
            value={customFieldName}
            onChange={(e) => setCustomFieldName(e.target.value)}
            placeholder="Feldname eingeben..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addCustomField();
              }
            }}
          />
          <Button onClick={addCustomField} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between">
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
