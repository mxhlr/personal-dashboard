"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { WeeklyProgress } from "./WeeklyProgress";

export function DailyTracker() {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // Fetch data
  const dailyLog = useQuery(api.dailyLog.getDailyLog, { date: selectedDate });
  const trackingFields = useQuery(api.trackingFields.getActiveTrackingFields);

  // Local state for form
  const [tracking, setTracking] = useState({
    movement: "",
    phoneJail: false,
    phoneJailNotes: "",
    vibes: "",
    breakfast: "",
    lunch: "",
    dinner: "",
    workHours: 0,
    workNotes: "",
    customToggles: [] as Array<{ fieldId: string; value: boolean }>,
    customTexts: [] as Array<{ fieldId: string; value: string }>,
  });

  const [wellbeing, setWellbeing] = useState({
    energy: 5,
    satisfaction: 5,
    stress: 5,
  });

  const [completed, setCompleted] = useState(false);

  // Load data when dailyLog changes
  useEffect(() => {
    if (dailyLog) {
      setTracking({
        movement: dailyLog.tracking.movement || "",
        phoneJail: dailyLog.tracking.phoneJail || false,
        phoneJailNotes: dailyLog.tracking.phoneJailNotes || "",
        vibes: dailyLog.tracking.vibes || "",
        breakfast: dailyLog.tracking.breakfast || "",
        lunch: dailyLog.tracking.lunch || "",
        dinner: dailyLog.tracking.dinner || "",
        workHours: dailyLog.tracking.workHours || 0,
        workNotes: dailyLog.tracking.workNotes || "",
        customToggles: dailyLog.tracking.customToggles || [],
        customTexts: dailyLog.tracking.customTexts || [],
      });
      setWellbeing(
        dailyLog.wellbeing || {
          energy: 5,
          satisfaction: 5,
          stress: 5,
        }
      );
      setCompleted(dailyLog.completed);
    } else {
      // Reset to defaults for new day
      setTracking({
        movement: "",
        phoneJail: false,
        phoneJailNotes: "",
        vibes: "",
        breakfast: "",
        lunch: "",
        dinner: "",
        workHours: 0,
        workNotes: "",
        customToggles: [],
        customTexts: [],
      });
      setWellbeing({
        energy: 5,
        satisfaction: 5,
        stress: 5,
      });
      setCompleted(false);
    }
  }, [dailyLog]);

  // Mutation
  const upsertDailyLog = useMutation(api.dailyLog.upsertDailyLog);

  const handleSave = async () => {
    await upsertDailyLog({
      date: selectedDate,
      tracking,
      wellbeing,
      completed,
    });
  };

  const handleToggleChange = (fieldId: string, value: boolean) => {
    setTracking((prev) => {
      const existing = prev.customToggles.find((t) => t.fieldId === fieldId);
      if (existing) {
        return {
          ...prev,
          customToggles: prev.customToggles.map((t) =>
            t.fieldId === fieldId ? { ...t, value } : t
          ),
        };
      } else {
        return {
          ...prev,
          customToggles: [...prev.customToggles, { fieldId, value }],
        };
      }
    });
  };

  const handleTextChange = (fieldId: string, value: string) => {
    setTracking((prev) => {
      const existing = prev.customTexts.find((t) => t.fieldId === fieldId);
      if (existing) {
        return {
          ...prev,
          customTexts: prev.customTexts.map((t) =>
            t.fieldId === fieldId ? { ...t, value } : t
          ),
        };
      } else {
        return {
          ...prev,
          customTexts: [...prev.customTexts, { fieldId, value }],
        };
      }
    });
  };

  const getToggleValue = (fieldId: string): boolean => {
    const toggle = tracking.customToggles.find((t) => t.fieldId === fieldId);
    return toggle?.value || false;
  };

  const getTextValue = (fieldId: string): string => {
    const text = tracking.customTexts.find((t) => t.fieldId === fieldId);
    return text?.value || "";
  };

  if (trackingFields === undefined) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
          {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Daily Tracking</h2>
            <p className="text-sm text-muted-foreground">
              {new Date(selectedDate).toLocaleDateString("de-DE", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48"
          />
        </div>

          {/* Default Fields */}
        <div className="space-y-6">
          {/* Movement */}
          <div className="space-y-2">
            <Label>Movement</Label>
            <Input
              placeholder="z.B. 10k Schritte, Gym, Laufen..."
              value={tracking.movement}
              onChange={(e) =>
                setTracking({ ...tracking, movement: e.target.value })
              }
            />
          </div>

          {/* Phone Jail */}
          <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Phone Jail</Label>
            <Switch
              checked={tracking.phoneJail}
              onCheckedChange={(checked) =>
                setTracking({ ...tracking, phoneJail: checked })
              }
            />
          </div>
          {tracking.phoneJail && (
            <Textarea
              placeholder="Notes (optional)..."
              value={tracking.phoneJailNotes}
              onChange={(e) =>
                setTracking({ ...tracking, phoneJailNotes: e.target.value })
              }
              rows={2}
            />
          )}
          {trackingFields.find((f) => f.name === "Phone Jail") && (
            <div className="text-xs text-muted-foreground">
              Current Streak:{" "}
              {trackingFields.find((f) => f.name === "Phone Jail")
                ?.currentStreak || 0}{" "}
              | Longest:{" "}
              {trackingFields.find((f) => f.name === "Phone Jail")
                ?.longestStreak || 0}
            </div>
          )}
        </div>

          {/* Vibes */}
          <div className="space-y-2">
          <Label>Vibes</Label>
          <Textarea
            placeholder="Wie läuft der Tag so? Thoughts, Gefühle..."
            value={tracking.vibes}
            onChange={(e) =>
              setTracking({ ...tracking, vibes: e.target.value })
            }
            rows={3}
          />
        </div>

          {/* Meals */}
          <div className="space-y-2">
          <Label>Meals</Label>
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Breakfast"
              value={tracking.breakfast}
              onChange={(e) =>
                setTracking({ ...tracking, breakfast: e.target.value })
              }
            />
            <Input
              placeholder="Lunch"
              value={tracking.lunch}
              onChange={(e) =>
                setTracking({ ...tracking, lunch: e.target.value })
              }
            />
            <Input
              placeholder="Dinner"
              value={tracking.dinner}
              onChange={(e) =>
                setTracking({ ...tracking, dinner: e.target.value })
              }
            />
          </div>
        </div>

          {/* Work */}
          <div className="space-y-2">
          <Label>Work</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Hours:</span>
              <Input
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={tracking.workHours}
                onChange={(e) =>
                  setTracking({
                    ...tracking,
                    workHours: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-24"
              />
            </div>
            <Textarea
              placeholder="Notes..."
              value={tracking.workNotes}
              onChange={(e) =>
                setTracking({ ...tracking, workNotes: e.target.value })
              }
              rows={2}
            />
          </div>
        </div>

          {/* Custom Fields */}
        {trackingFields.filter((f) => !f.isDefault).length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Custom Fields</h3>
            {trackingFields
              .filter((f) => !f.isDefault)
              .map((field) => (
                <div key={field._id} className="space-y-2">
                  {field.type === "toggle" ? (
                    <>
                      <div className="flex items-center justify-between">
                        <Label>{field.name}</Label>
                        <Switch
                          checked={getToggleValue(field._id)}
                          onCheckedChange={(checked) =>
                            handleToggleChange(field._id, checked)
                          }
                        />
                      </div>
                      {field.hasStreak && (
                        <div className="text-xs text-muted-foreground">
                          Current Streak: {field.currentStreak || 0} | Longest:{" "}
                          {field.longestStreak || 0}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Label>{field.name}</Label>
                      <Input
                        placeholder={`${field.name}...`}
                        value={getTextValue(field._id)}
                        onChange={(e) =>
                          handleTextChange(field._id, e.target.value)
                        }
                      />
                    </>
                  )}
                </div>
              ))}
          </div>
        )}

          {/* Wellbeing Sliders */}
        <div className="space-y-6 pt-4 border-t">
          <h3 className="text-lg font-semibold">Wellbeing</h3>

          {/* Energy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Energy</Label>
              <span className="text-sm font-medium">{wellbeing.energy}/10</span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[wellbeing.energy]}
              onValueChange={(value) =>
                setWellbeing({ ...wellbeing, energy: value[0] })
              }
            />
          </div>

          {/* Satisfaction */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Satisfaction</Label>
              <span className="text-sm font-medium">
                {wellbeing.satisfaction}/10
              </span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[wellbeing.satisfaction]}
              onValueChange={(value) =>
                setWellbeing({ ...wellbeing, satisfaction: value[0] })
              }
            />
          </div>

          {/* Stress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Stress</Label>
              <span className="text-sm font-medium">{wellbeing.stress}/10</span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[wellbeing.stress]}
              onValueChange={(value) =>
                setWellbeing({ ...wellbeing, stress: value[0] })
              }
            />
          </div>
        </div>
      </div>

          {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t">
          <Button onClick={handleSave} size="lg">
            Speichern
          </Button>
          <div className="flex items-center gap-2">
            <Switch
              checked={completed}
              onCheckedChange={setCompleted}
              id="completed"
            />
            <Label htmlFor="completed" className="cursor-pointer">
              Tag als abgeschlossen markieren
            </Label>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <WeeklyProgress />
        </div>
      </div>
    </div>
  );
}
