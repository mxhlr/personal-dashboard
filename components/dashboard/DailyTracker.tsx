"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { TrackingCard } from "./TrackingCard";
import { ProgressIndicator } from "./ProgressIndicator";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DailyTracker() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate] = useState(today);
  const [isSaving, setIsSaving] = useState(false);

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

  // Calculate completion percentage
  const calculateCompletion = (): number => {
    let filled = 0;
    let total = 0;

    // Default fields
    if (tracking.movement) filled++;
    total++;

    if (tracking.phoneJail) filled++;
    total++;

    if (tracking.vibes) filled++;
    total++;

    if (tracking.breakfast || tracking.lunch || tracking.dinner) filled++;
    total++;

    if (tracking.workHours > 0) filled++;
    total++;

    // Wellbeing (count as filled if not default value)
    if (wellbeing.energy !== 5) filled++;
    total++;
    if (wellbeing.satisfaction !== 5) filled++;
    total++;
    if (wellbeing.stress !== 5) filled++;
    total++;

    // Custom fields
    tracking.customToggles.forEach(() => {
      filled++;
      total++;
    });

    tracking.customTexts.forEach((t) => {
      if (t.value) filled++;
      total++;
    });

    return total > 0 ? (filled / total) * 100 : 0;
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
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold">Today&apos;s Log</h1>
        <p className="text-sm text-muted-foreground">
          {new Date(selectedDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator percentage={calculateCompletion()} />

      {/* Tracking Cards */}
      <div className="space-y-4">
        {/* Movement */}
        <TrackingCard label="Movement">
          <Input
            placeholder="e.g., 10k steps, gym, running..."
            value={tracking.movement}
            onChange={(e) =>
              setTracking({ ...tracking, movement: e.target.value })
            }
            className="text-base"
          />
        </TrackingCard>

        {/* Phone Jail */}
        <TrackingCard label="Phone Jail">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed today</span>
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
        </TrackingCard>

        {/* Vibes */}
        <TrackingCard label="Vibes">
          <Textarea
            placeholder="How's the day going? Thoughts, feelings..."
            value={tracking.vibes}
            onChange={(e) =>
              setTracking({ ...tracking, vibes: e.target.value })
            }
            rows={3}
            className="text-base"
          />
        </TrackingCard>

        {/* Meals */}
        <TrackingCard label="Meals">
          <div className="space-y-3">
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
        </TrackingCard>

        {/* Work */}
        <TrackingCard label="Work">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-16">Hours:</span>
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
        </TrackingCard>

        {/* Custom Fields */}
        {trackingFields.filter((f) => !f.isDefault).map((field) => (
          <TrackingCard key={field._id} label={field.name}>
            {field.type === "toggle" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed today</span>
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
              </div>
            ) : (
              <Input
                placeholder={`Enter ${field.name.toLowerCase()}...`}
                value={getTextValue(field._id)}
                onChange={(e) =>
                  handleTextChange(field._id, e.target.value)
                }
              />
            )}
          </TrackingCard>
        ))}

        {/* Wellbeing */}
        <TrackingCard label="Energy">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">How energized do you feel?</span>
              <span className="text-base font-medium tabular-nums">
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
            />
          </div>
        </TrackingCard>

        <TrackingCard label="Satisfaction">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">How satisfied are you today?</span>
              <span className="text-base font-medium tabular-nums">
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
        </TrackingCard>

        <TrackingCard label="Stress">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">How stressed do you feel?</span>
              <span className="text-base font-medium tabular-nums">
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
            />
          </div>
        </TrackingCard>
      </div>

      {/* Save Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSave}
          size="lg"
          disabled={isSaving}
          className="px-8"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Tip: Press Cmd+S (Mac) or Ctrl+S (Windows) to save quickly
      </p>
    </div>
  );
}
