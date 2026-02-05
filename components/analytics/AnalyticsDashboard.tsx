"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
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

      {/* Skip Patterns & Average Block Times - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analytics.skipPatterns.length > 0 && (
          <SkipPatterns patterns={analytics.skipPatterns} />
        )}
        <AverageBlockTimes blockTimes={analytics.avgBlockTimes} />
      </div>
    </div>
  );
}
