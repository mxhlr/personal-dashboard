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

export function AnnualDataView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());

  const logs = useQuery(api.analytics.getAnnualLogs, { year });
  const profile = useQuery(api.userProfile.getUserProfile);
  const reviewStatus = useQuery(api.analytics.getAnnualReviewStatus, { year });

  const navigateYear = (direction: "prev" | "next") => {
    setYear(year + (direction === "next" ? 1 : -1));
  };

  if (
    logs === undefined ||
    profile === undefined ||
    reviewStatus === undefined
  ) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const isCurrentYear = year === currentYear;

  // Calculate quarterly stats
  const quarterlyStats = profile ? getQuarterlyStats(logs, profile, year) : [];

  // Calculate overall completion rate
  const completedDays = logs.filter((log) => log.completed).length;
  const totalDays = isCurrentYear
    ? Math.floor(
        (new Date().getTime() - new Date(year, 0, 1).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    : 365;

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => navigateYear("prev")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <h2 className="text-2xl font-bold">{year}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {completedDays} / {totalDays} Tage getrackt
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateYear("next")}
          disabled={year >= currentYear}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Annual Review Status */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Annual Review</span>
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

      {/* North Stars Progress */}
      {profile?.northStars && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-6">North Stars {year}</h3>
          <div className="space-y-6">
            {Object.entries(LIFE_AREAS).map(([key, area]) => {
              const northStar =
                profile?.northStars[key as keyof typeof profile.northStars];

              // Check if achieved from annual review
              let achieved = "Ausstehend";
              if (reviewStatus.review?.northStarReview) {
                const areaReview =
                  reviewStatus.review.northStarReview[
                    key as keyof typeof reviewStatus.review.northStarReview
                  ];
                achieved = areaReview?.achieved || "Ausstehend";
              }

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{area.icon}</span>
                    <span className={`font-semibold ${area.color}`}>
                      {area.label}
                    </span>
                  </div>
                  <div className="pl-10">
                    <p className="text-sm mb-2">{northStar}</p>
                    <div className="text-xs text-muted-foreground">
                      Status:{" "}
                      <span
                        className={
                          achieved === "Ja"
                            ? "text-green-600 font-semibold"
                            : achieved === "Teilweise"
                            ? "text-amber-600 font-semibold"
                            : "text-muted-foreground"
                        }
                      >
                        {achieved}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quarterly Overview */}
      {quarterlyStats.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Quartalsübersicht</h3>
          <div className="grid grid-cols-2 gap-4">
            {quarterlyStats.map((quarter) => (
              <div
                key={quarter.quarter}
                className="p-6 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="text-center mb-4">
                  <div className="text-xl font-bold mb-1">Q{quarter.quarter}</div>
                  <div className="text-xs text-muted-foreground">
                    {quarter.months}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tage getrackt</span>
                    <span className="font-semibold">
                      {quarter.completedDays}
                    </span>
                  </div>

                  {quarter.milestoneTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Milestones</span>
                      <span className="font-semibold">
                        {quarter.milestoneCompleted}/{quarter.milestoneTotal}
                      </span>
                    </div>
                  )}

                  {quarter.avgEnergy > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ø Energie</span>
                      <span className="font-semibold">{quarter.avgEnergy}</span>
                    </div>
                  )}

                  {quarter.reviewCompleted && (
                    <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Review abgeschlossen</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Overall Stats */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Gesamtstatistik</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{completedDays}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Tage getrackt
            </div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">
              {Math.round((completedDays / totalDays) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Completion Rate
            </div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">
              {quarterlyStats.reduce((sum, q) => sum + q.milestoneTotal, 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total Milestones
            </div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">
              {
                quarterlyStats.filter((q) => q.reviewCompleted).length
              }
              /4
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Quarterly Reviews
            </div>
          </div>
        </div>
      </div>

      {logs.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Keine Daten</h3>
          <p className="text-muted-foreground">
            Für dieses Jahr wurden noch keine Daten erfasst.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper functions
interface DailyLog {
  date: string;
  completed: boolean;
  wellbeing?: {
    energy: number;
    satisfaction: number;
    stress: number;
  };
}

interface Milestone {
  year: number;
  quarter: number;
  area: string;
  milestone: string;
  completed: boolean;
}

interface UserProfile {
  quarterlyMilestones: Milestone[];
}

function getQuarterlyStats(logs: DailyLog[], profile: UserProfile, year: number) {
  const quarters = [];
  const quarterMonths = [
    "Jan - Mär",
    "Apr - Jun",
    "Jul - Sep",
    "Okt - Dez",
  ];

  for (let q = 1; q <= 4; q++) {
    const startMonth = (q - 1) * 3;
    const endMonth = q * 3;

    const quarterLogs = logs.filter((log) => {
      const logDate = new Date(log.date);
      const logMonth = logDate.getMonth();
      return logMonth >= startMonth && logMonth < endMonth;
    });

    const completedDays = quarterLogs.filter((log) => log.completed).length;

    // Get milestones for this quarter
    const milestones = profile.quarterlyMilestones.filter(
      (m) => m.year === year && m.quarter === q
    );
    const milestoneCompleted = milestones.filter((m) => m.completed).length;

    // Calculate avg energy
    const logsWithWellbeing = quarterLogs.filter((log) => log.wellbeing);
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

    quarters.push({
      quarter: q,
      months: quarterMonths[q - 1],
      completedDays,
      milestoneTotal: milestones.length,
      milestoneCompleted,
      avgEnergy,
      reviewCompleted: false, // TODO: fetch from quarterly review
    });
  }

  return quarters;
}
