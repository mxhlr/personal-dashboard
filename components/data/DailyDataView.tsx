"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

export function DailyDataView() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const dailyLog = useQuery(api.dailyLog.getDailyLog, { date: selectedDate });
  const trackingFields = useQuery(api.trackingFields.getActiveTrackingFields);

  const navigateDay = (direction: "prev" | "next") => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  if (dailyLog === undefined || trackingFields === undefined) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateDay("prev")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <h2 className="text-2xl font-bold">{formatDate(selectedDate)}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {dailyLog?.completed ? (
              <span className="inline-flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Abgeschlossen
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Circle className="h-4 w-4" />
                Nicht abgeschlossen
              </span>
            )}
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateDay("next")}
          disabled={selectedDate >= today}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {!dailyLog ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Daten</h3>
          <p className="text-muted-foreground">
            Für diesen Tag wurden noch keine Daten erfasst.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tracking Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Tracking</h3>
            <div className="space-y-4">
              {/* Phone Jail */}
              {dailyLog.tracking.phoneJail !== undefined && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="font-medium">Phone Jail</span>
                  <div className="text-right">
                    <span
                      className={
                        dailyLog.tracking.phoneJail
                          ? "text-green-600 font-semibold"
                          : "text-muted-foreground"
                      }
                    >
                      {dailyLog.tracking.phoneJail ? "✓ Ja" : "✗ Nein"}
                    </span>
                    {trackingFields.find((f) => f.name === "Phone Jail") && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Streak:{" "}
                        {trackingFields.find((f) => f.name === "Phone Jail")
                          ?.currentStreak || 0}{" "}
                        🔥
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Movement */}
              {dailyLog.tracking.movement && (
                <div className="py-2 border-b">
                  <span className="font-medium block mb-1">Movement</span>
                  <p className="text-muted-foreground">
                    {dailyLog.tracking.movement}
                  </p>
                </div>
              )}

              {/* Vibes */}
              {dailyLog.tracking.vibes && (
                <div className="py-2 border-b">
                  <span className="font-medium block mb-1">Vibes</span>
                  <p className="text-muted-foreground">
                    {dailyLog.tracking.vibes}
                  </p>
                </div>
              )}

              {/* Meals */}
              {(dailyLog.tracking.breakfast ||
                dailyLog.tracking.lunch ||
                dailyLog.tracking.dinner) && (
                <div className="py-2 border-b">
                  <span className="font-medium block mb-2">Meals</span>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block">
                        Breakfast
                      </span>
                      <span>{dailyLog.tracking.breakfast || "-"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Lunch</span>
                      <span>{dailyLog.tracking.lunch || "-"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">
                        Dinner
                      </span>
                      <span>{dailyLog.tracking.dinner || "-"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Work */}
              {(dailyLog.tracking.workHours || dailyLog.tracking.workNotes) && (
                <div className="py-2 border-b">
                  <span className="font-medium block mb-1">Work</span>
                  <p className="text-sm">
                    <span className="font-semibold">
                      {dailyLog.tracking.workHours || 0}h
                    </span>
                    {dailyLog.tracking.workNotes && (
                      <span className="text-muted-foreground ml-2">
                        - {dailyLog.tracking.workNotes}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Custom Fields */}
              {trackingFields
                .filter((f) => !f.isDefault)
                .map((field) => {
                  if (field.type === "toggle") {
                    const toggle = dailyLog.tracking.customToggles?.find(
                      (t) => t.fieldId === field._id
                    );
                    if (toggle !== undefined) {
                      return (
                        <div
                          key={field._id}
                          className="flex items-center justify-between py-2 border-b"
                        >
                          <span className="font-medium">{field.name}</span>
                          <div className="text-right">
                            <span
                              className={
                                toggle.value
                                  ? "text-green-600 font-semibold"
                                  : "text-muted-foreground"
                              }
                            >
                              {toggle.value ? "✓ Ja" : "✗ Nein"}
                            </span>
                            {field.hasStreak && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Streak: {field.currentStreak || 0} 🔥
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                  } else if (field.type === "text") {
                    const text = dailyLog.tracking.customTexts?.find(
                      (t) => t.fieldId === field._id
                    );
                    if (text?.value) {
                      return (
                        <div key={field._id} className="py-2 border-b">
                          <span className="font-medium block mb-1">
                            {field.name}
                          </span>
                          <p className="text-muted-foreground">{text.value}</p>
                        </div>
                      );
                    }
                  }
                  return null;
                })}
            </div>
          </div>

          {/* Wellbeing Section */}
          {dailyLog.wellbeing && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Wellbeing</h3>
              <div className="space-y-4">
                {/* Energy */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Energie</span>
                    <span className="text-sm font-semibold">
                      {dailyLog.wellbeing.energy}/10
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(dailyLog.wellbeing.energy / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Satisfaction */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Zufriedenheit</span>
                    <span className="text-sm font-semibold">
                      {dailyLog.wellbeing.satisfaction}/10
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (dailyLog.wellbeing.satisfaction / 10) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Stress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Stress</span>
                    <span className="text-sm font-semibold">
                      {dailyLog.wellbeing.stress}/10
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${(dailyLog.wellbeing.stress / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
