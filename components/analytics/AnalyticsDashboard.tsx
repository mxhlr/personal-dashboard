"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PerformanceHistory } from "./PerformanceHistory";
import { MonthlyComparison } from "./MonthlyComparison";
import { AllTimeStats } from "./AllTimeStats";
import { SkipPatterns } from "./SkipPatterns";
import { AverageBlockTimes } from "./AverageBlockTimes";

export function AnalyticsDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const analytics = useQuery(api.habitAnalytics.getComprehensiveAnalytics, {
    year: selectedDate.getFullYear(),
    month: selectedDate.getMonth() + 1,
  });

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Performance History - Full Width */}
      <PerformanceHistory
        dailyScores={analytics.dailyScores}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Monthly Comparison - Full Width */}
      <MonthlyComparison monthlyStats={analytics.monthlyStats} />

      {/* All-Time Stats - Full Width */}
      <AllTimeStats stats={analytics.allTimeStats} />

      {/* Skip Patterns - Full Width (always show with example if empty) */}
      <SkipPatterns
        patterns={analytics.skipPatterns.length > 0 ? analytics.skipPatterns : [
          { reason: "Ran out of time", count: 16 },
          { reason: "Interrupted", count: 12 },
          { reason: "Low energy", count: 9 }
        ]}
      />

      {/* Average Block Times - Half Width (Left Aligned) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AverageBlockTimes blockTimes={analytics.avgBlockTimes} />
      </div>
    </div>
  );
}
