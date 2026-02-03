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

export function MonthlyDataView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const logs = useQuery(api.analytics.getMonthlyLogs, { year, month });
  const wellbeingTrends = useQuery(api.analytics.getWellbeingTrends, {
    startDate: getMonthStartDate(year, month),
    endDate: getMonthEndDate(year, month),
  });
  const trackingPerformance = useQuery(api.analytics.getTrackingPerformance, {
    startDate: getMonthStartDate(year, month),
    endDate: getMonthEndDate(year, month),
  });
  const reviewStatus = useQuery(api.analytics.getMonthlyReviewStatus, {
    year,
    month,
  });

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "next") {
      if (month >= 12) {
        setMonth(1);
        setYear(year + 1);
      } else {
        setMonth(month + 1);
      }
    } else {
      if (month <= 1) {
        setMonth(12);
        setYear(year - 1);
      } else {
        setMonth(month - 1);
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

  const monthName = new Date(year, month - 1).toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const isCurrentMonth = month === currentMonth && year === currentYear;

  // Group logs by week
  const weekGroups = groupLogsByWeek(logs);

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <h2 className="text-2xl font-bold">{monthName}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {logs.filter((l) => l.completed).length} / {getDaysInMonth(year, month)} Tage abgeschlossen
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateMonth("next")}
          disabled={month >= currentMonth && year >= currentYear}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Monthly Review Status */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Monthly Review</span>
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

      {/* Calendar View */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Kalender</h3>
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {getCalendarDays(year, month).map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="p-2" />;
            }

            const dateStr = day.toISOString().split("T")[0];
            const log = logs.find((l) => l.date === dateStr);
            const isToday = dateStr === new Date().toISOString().split("T")[0];

            return (
              <div
                key={dateStr}
                className={`p-3 border rounded-lg text-center ${
                  isToday ? "border-primary bg-primary/5" : ""
                } ${log?.completed ? "bg-green-50" : ""}`}
              >
                <div className="text-sm font-medium mb-1">{day.getDate()}</div>
                <div>
                  {log?.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                  ) : day <= new Date() ? (
                    <Circle className="h-4 w-4 text-muted-foreground mx-auto" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Breakdown */}
      {weekGroups.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Wochenübersicht</h3>
          <div className="space-y-3">
            {weekGroups.map((week) => (
              <div
                key={week.weekNumber}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <div className="font-medium">KW {week.weekNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {week.completed} / {week.total} Tage
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {week.avgEnergy > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Ø Energie: </span>
                      <span className="font-semibold">{week.avgEnergy}</span>
                    </div>
                  )}
                  <div className="w-24">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(week.completed / week.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            Für diesen Monat wurden noch keine Daten erfasst.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getMonthStartDate(year: number, month: number): string {
  return new Date(year, month - 1, 1).toISOString().split("T")[0];
}

function getMonthEndDate(year: number, month: number): string {
  return new Date(year, month, 0).toISOString().split("T")[0];
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  let startDay = firstDay.getDay();
  // Convert to Monday = 0
  startDay = startDay === 0 ? 6 : startDay - 1;

  const days: (Date | null)[] = [];

  // Add empty slots for days before month starts
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month - 1, i));
  }

  return days;
}

function groupLogsByWeek(logs: any[]) {
  const weekMap = new Map<number, any>();

  logs.forEach((log) => {
    const weekNum = log.weekNumber;
    if (!weekMap.has(weekNum)) {
      weekMap.set(weekNum, {
        weekNumber: weekNum,
        logs: [],
        completed: 0,
        total: 0,
        totalEnergy: 0,
        energyCount: 0,
      });
    }

    const week = weekMap.get(weekNum)!;
    week.logs.push(log);
    week.total++;
    if (log.completed) {
      week.completed++;
    }
    if (log.wellbeing?.energy) {
      week.totalEnergy += log.wellbeing.energy;
      week.energyCount++;
    }
  });

  return Array.from(weekMap.values()).map((week) => ({
    weekNumber: week.weekNumber,
    completed: week.completed,
    total: week.total,
    avgEnergy:
      week.energyCount > 0
        ? Math.round((week.totalEnergy / week.energyCount) * 10) / 10
        : 0,
  }));
}
