"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

const LIFE_AREAS = {
  wealth: { icon: "💰", label: "WEALTH", color: "text-green-600" },
  health: { icon: "🏃", label: "HEALTH", color: "text-blue-600" },
  love: { icon: "❤️", label: "LOVE", color: "text-red-600" },
  happiness: { icon: "😊", label: "HAPPINESS", color: "text-amber-600" },
};

export function QuarterlyDataView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [quarter, setQuarter] = useState(Math.ceil((today.getMonth() + 1) / 3));

  const logs = useQuery(api.analytics.getQuarterlyLogs, { year, quarter });
  const milestones = useQuery(api.analytics.getQuarterlyMilestones, {
    year,
    quarter,
  });
  const reviewStatus = useQuery(api.analytics.getQuarterlyReviewStatus, {
    year,
    quarter,
  });

  const navigateQuarter = (direction: "prev" | "next") => {
    if (direction === "next") {
      if (quarter >= 4) {
        setQuarter(1);
        setYear(year + 1);
      } else {
        setQuarter(quarter + 1);
      }
    } else {
      if (quarter <= 1) {
        setQuarter(4);
        setYear(year - 1);
      } else {
        setQuarter(quarter - 1);
      }
    }
  };

  if (
    logs === undefined ||
    milestones === undefined ||
    reviewStatus === undefined
  ) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
  const currentYear = new Date().getFullYear();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isCurrentQuarter = quarter === currentQuarter && year === currentYear;

  // Group milestones by area
  const milestonesByArea = Object.keys(LIFE_AREAS).reduce((acc, area) => {
    acc[area] = Array.isArray(milestones)
      ? []
      : milestones.milestones.filter((m) => m.area === area);
    return acc;
  }, {} as Record<string, Array<{ area: string; milestone: string; completed: boolean }>>);

  // Calculate monthly stats
  const monthlyStats = getMonthlyStats(logs, year, quarter);

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateQuarter("prev")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <h2 className="text-2xl font-bold">
            Q{quarter} {year}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {getQuarterMonths(quarter)}
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateQuarter("next")}
          disabled={quarter >= currentQuarter && year >= currentYear}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Quarterly Review Status */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Quarterly Review</span>
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

      {/* Milestone Progress */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Milestone Progress</h3>
          <div className="text-sm text-muted-foreground">
            {Array.isArray(milestones) ? "0 / 0" : `${milestones.completed} / ${milestones.total}`} abgeschlossen (
            {Array.isArray(milestones) ? 0 : milestones.percentage}%)
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(LIFE_AREAS).map(([key, area]) => {
            const areaMilestones = milestonesByArea[key];
            if (areaMilestones.length === 0) return null;

            const completed = areaMilestones.filter((m) => m.completed).length;
            const total = areaMilestones.length;

            return (
              <div key={key} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{area.icon}</span>
                  <span className={`font-semibold ${area.color}`}>
                    {area.label}
                  </span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {completed}/{total}
                  </span>
                </div>
                <div className="space-y-2 pl-10">
                  {areaMilestones.map((milestone, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      {milestone.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span
                        className={
                          milestone.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }
                      >
                        {milestone.milestone}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Overview */}
      {monthlyStats.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Monatsübersicht</h3>
          <div className="grid grid-cols-3 gap-4">
            {monthlyStats.map((month) => (
              <div
                key={month.month}
                className="p-4 border rounded-lg text-center"
              >
                <div className="font-medium mb-2">{month.name}</div>
                <div className="text-2xl font-bold mb-1">
                  {month.completedDays}
                </div>
                <div className="text-xs text-muted-foreground">
                  von {month.totalDays} Tagen
                </div>
                {month.avgEnergy > 0 && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Ø Energie: {month.avgEnergy}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}


      {logs.length === 0 && (Array.isArray(milestones) || milestones.total === 0) && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Daten</h3>
          <p className="text-muted-foreground">
            Für dieses Quartal wurden noch keine Daten erfasst.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getQuarterMonths(quarter: number): string {
  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];
  const startMonth = (quarter - 1) * 3;
  return `${monthNames[startMonth]} - ${monthNames[startMonth + 2]}`;
}

interface QuarterlyLog {
  date: string;
  completed: boolean;
  wellbeing?: {
    energy: number;
  };
}

function getMonthlyStats(logs: QuarterlyLog[], year: number, quarter: number) {
  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];

  const startMonth = (quarter - 1) * 3;
  const months = [];

  for (let i = 0; i < 3; i++) {
    const monthIndex = startMonth + i;
    const monthLogs = logs.filter((log) => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === monthIndex;
    });

    const completedDays = monthLogs.filter((log) => log.completed).length;
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();

    const logsWithWellbeing = monthLogs.filter((log) => log.wellbeing);
    const avgEnergy =
      logsWithWellbeing.length > 0
        ? Math.round(
            (logsWithWellbeing.reduce(
              (sum, log) => sum + log.wellbeing!.energy,
              0
            ) /
              logsWithWellbeing.length) *
              10
          ) / 10
        : 0;

    months.push({
      month: monthIndex + 1,
      name: monthNames[monthIndex],
      completedDays,
      totalDays,
      avgEnergy,
    });
  }

  return months;
}
