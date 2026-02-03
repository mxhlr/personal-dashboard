"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

// Helper to get week number
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function WeeklyDataView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [weekNumber, setWeekNumber] = useState(getWeekNumber(today));

  const logs = useQuery(api.dailyLog.getWeeklyLogs, { weekNumber, year });
  const wellbeingTrends = useQuery(api.analytics.getWellbeingTrends, {
    startDate: getWeekStartDate(year, weekNumber),
    endDate: getWeekEndDate(year, weekNumber),
  });
  const trackingPerformance = useQuery(api.analytics.getTrackingPerformance, {
    startDate: getWeekStartDate(year, weekNumber),
    endDate: getWeekEndDate(year, weekNumber),
  });
  const reviewStatus = useQuery(api.analytics.getWeeklyReviewStatus, {
    year,
    weekNumber,
  });

  const navigateWeek = (direction: "prev" | "next") => {
    if (direction === "next") {
      if (weekNumber >= 52) {
        setWeekNumber(1);
        setYear(year + 1);
      } else {
        setWeekNumber(weekNumber + 1);
      }
    } else {
      if (weekNumber <= 1) {
        setWeekNumber(52);
        setYear(year - 1);
      } else {
        setWeekNumber(weekNumber - 1);
      }
    }
  };

  if (
    logs === undefined ||
    wellbeingTrends === undefined ||
    trackingPerformance === undefined ||
    reviewStatus === undefined
  ) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const weekDays = getWeekDays(year, weekNumber);
  const currentWeekNumber = getWeekNumber(new Date());
  const currentYear = new Date().getFullYear();
  const isCurrentWeek = weekNumber === currentWeekNumber && year === currentYear;

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <h2 className="text-2xl font-bold">
            KW {weekNumber} / {year}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {weekDays[0].toLocaleDateString("de-DE", {
              day: "numeric",
              month: "short",
            })}{" "}
            -{" "}
            {weekDays[6].toLocaleDateString("de-DE", {
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateWeek("next")}
          disabled={weekNumber >= currentWeekNumber && year >= currentYear}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekly Review Status */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Weekly Review</span>
          <span className="inline-flex items-center gap-1">
            {reviewStatus.completed ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-green-600 text-sm">Abgeschlossen</span>
              </>
            ) : (
              <>
                <Circle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">Ausstehend</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Week Grid */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Tagesübersicht</h3>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dateStr = day.toISOString().split("T")[0];
            const log = logs.find((l) => l.date === dateStr);
            const isToday =
              dateStr === new Date().toISOString().split("T")[0];

            return (
              <div
                key={dateStr}
                className={`p-3 border rounded-lg text-center ${
                  isToday ? "border-primary bg-primary/5" : ""
                } ${log?.completed ? "bg-green-50" : ""}`}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {day.toLocaleDateString("de-DE", { weekday: "short" })}
                </div>
                <div className="text-lg font-semibold mb-2">
                  {day.getDate()}
                </div>
                <div>
                  {log?.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground mx-auto" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracking Performance */}
      {trackingPerformance.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Tracking Performance</h3>
          <div className="space-y-3">
            {trackingPerformance.map((perf) => (
              <div key={perf.fieldName}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{perf.fieldName}</span>
                  <span className="text-sm text-muted-foreground">
                    {perf.current}/{perf.total} ({perf.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${perf.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wellbeing Trends */}
      {wellbeingTrends.count > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Wellbeing Durchschnitt</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {wellbeingTrends.avgEnergy}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Energie</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {wellbeingTrends.avgSatisfaction}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Zufriedenheit
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {wellbeingTrends.avgStress}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Stress</div>
            </div>
          </div>
        </div>
      )}

      {logs.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Daten</h3>
          <p className="text-muted-foreground">
            Für diese Woche wurden noch keine Daten erfasst.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper to get week start date
function getWeekStartDate(year: number, weekNumber: number): string {
  const jan4 = new Date(year, 0, 4);
  const daysToAdd = (weekNumber - 1) * 7 - jan4.getDay() + 1;
  const weekStart = new Date(year, 0, 4 + daysToAdd);
  return weekStart.toISOString().split("T")[0];
}

// Helper to get week end date
function getWeekEndDate(year: number, weekNumber: number): string {
  const startDate = new Date(getWeekStartDate(year, weekNumber));
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  return endDate.toISOString().split("T")[0];
}

// Helper to get all days in a week
function getWeekDays(year: number, weekNumber: number): Date[] {
  const startDate = new Date(getWeekStartDate(year, weekNumber));
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(day.getDate() + i);
    days.push(day);
  }
  return days;
}
