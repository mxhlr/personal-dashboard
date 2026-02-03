"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { WeeklyProgress } from "./WeeklyProgress";
import { Save, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DailyTracker() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const dailyLog = useQuery(api.dailyLog.getDailyLog, { date: selectedDate });
  const trackingFields = useQuery(api.trackingFields.getActiveTrackingFields);

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
    customToggles: [] as Array<{ fieldId: Id<"trackingFields">; value: boolean }>,
    customTexts: [] as Array<{ fieldId: Id<"trackingFields">; value: string }>,
  });

  const [wellbeing, setWellbeing] = useState({
    energy: 5,
    satisfaction: 5,
    stress: 5,
  });

  const [completed, setCompleted] = useState(false);

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
      setLastSaved(new Date(dailyLog._creationTime));
    } else {
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
      setLastSaved(null);
    }
  }, [dailyLog]);

  const upsertDailyLog = useMutation(api.dailyLog.upsertDailyLog);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await upsertDailyLog({
        date: selectedDate,
        tracking,
        wellbeing,
        completed,
      });
      setLastSaved(new Date());
      toast.success("Gespeichert", {
        description: "Deine Eingaben wurden erfolgreich gespeichert",
        duration: 2000,
      });
    } catch (error) {
      toast.error("Fehler beim Speichern", {
        description: "Bitte versuche es erneut",
      });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }, [selectedDate, tracking, wellbeing, completed, upsertDailyLog]);

  // Keyboard shortcut: Cmd/Ctrl + S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const handleToggleChange = (fieldId: Id<"trackingFields">, value: boolean) => {
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

  const handleTextChange = (fieldId: Id<"trackingFields">, value: string) => {
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
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Lädt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header with Save Status */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold">Daily Tracking</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(selectedDate).toLocaleDateString("de-DE", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {lastSaved && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Zuletzt gespeichert: {lastSaved.toLocaleTimeString("de-DE")}
              </p>
            )}
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
            <Label htmlFor="movement">Movement</Label>
            <Input
              id="movement"
              placeholder="z.B. 10k Schritte, Gym, Laufen..."
              value={tracking.movement}
              onChange={(e) =>
                setTracking({ ...tracking, movement: e.target.value })
              }
              className="transition-colors duration-200"
            />
          </div>

          {/* Phone Jail */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="phoneJail">Phone Jail</Label>
              <Switch
                id="phoneJail"
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
                className="transition-colors duration-200"
              />
            )}
            {trackingFields.find((f) => f.name === "Phone Jail") && (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
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
            <Label htmlFor="vibes">Vibes</Label>
            <Textarea
              id="vibes"
              placeholder="Wie läuft der Tag so? Thoughts, Gefühle..."
              value={tracking.vibes}
              onChange={(e) =>
                setTracking({ ...tracking, vibes: e.target.value })
              }
              rows={3}
              className="transition-colors duration-200"
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
                className="transition-colors duration-200"
              />
              <Input
                placeholder="Lunch"
                value={tracking.lunch}
                onChange={(e) =>
                  setTracking({ ...tracking, lunch: e.target.value })
                }
                className="transition-colors duration-200"
              />
              <Input
                placeholder="Dinner"
                value={tracking.dinner}
                onChange={(e) =>
                  setTracking({ ...tracking, dinner: e.target.value })
                }
                className="transition-colors duration-200"
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
                  className="w-24 transition-colors duration-200"
                />
              </div>
              <Textarea
                placeholder="Notes..."
                value={tracking.workNotes}
                onChange={(e) =>
                  setTracking({ ...tracking, workNotes: e.target.value })
                }
                rows={2}
                className="transition-colors duration-200"
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
                          <Label htmlFor={field._id}>{field.name}</Label>
                          <Switch
                            id={field._id}
                            checked={getToggleValue(field._id)}
                            onCheckedChange={(checked) =>
                              handleToggleChange(field._id, checked)
                            }
                          />
                        </div>
                        {field.hasStreak && (
                          <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                            Current Streak: {field.currentStreak || 0} | Longest:{" "}
                            {field.longestStreak || 0}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <Label htmlFor={field._id}>{field.name}</Label>
                        <Input
                          id={field._id}
                          placeholder={`${field.name}...`}
                          value={getTextValue(field._id)}
                          onChange={(e) =>
                            handleTextChange(field._id, e.target.value)
                          }
                          className="transition-colors duration-200"
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
                <span className="text-sm font-medium tabular-nums">
                  {wellbeing.energy}/10
                </span>
              </div>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[wellbeing.energy]}
                onValueChange={(value) =>
                  setWellbeing({ ...wellbeing, energy: value[0] })
                }
                className="transition-colors duration-200"
              />
            </div>

            {/* Satisfaction */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Satisfaction</Label>
                <span className="text-sm font-medium tabular-nums">
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
                className="transition-colors duration-200"
              />
            </div>

            {/* Stress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Stress</Label>
                <span className="text-sm font-medium tabular-nums">
                  {wellbeing.stress}/10
                </span>
              </div>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[wellbeing.stress]}
                onValueChange={(value) =>
                  setWellbeing({ ...wellbeing, stress: value[0] })
                }
                className="transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t pt-4 -mx-6 px-6 pb-6 space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSave}
              size="lg"
              disabled={isSaving}
              className="transition-all duration-200"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Speichert...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Speichern
                </>
              )}
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
          <p className="text-xs text-muted-foreground">
            Tipp: Drücke Cmd+S (Mac) oder Ctrl+S (Windows) zum schnellen Speichern
          </p>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="sticky top-24 bg-muted/50 rounded-lg p-4 shadow-sm">
          <WeeklyProgress />
        </div>
      </div>
    </div>
  );
}
