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
        <p
          className="dark:text-[#888888] text-[#666666]"
          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
        >
          Loading analytics...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100vh-64px)] relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, var(--daily-log-bg-start) 0%, var(--daily-log-bg-end) 100%)'
      }}
    >
      {/* Subtle grid overlay for HUD effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 229, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Animated scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          background: 'linear-gradient(transparent 40%, rgba(0, 229, 255, 0.2) 50%, transparent 60%)',
          backgroundSize: '100% 4px',
          animation: 'scanline 8s linear infinite'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-8 space-y-6">
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

        {/* Skip Patterns - Full Width */}
        <SkipPatterns patterns={analytics.skipPatterns} />

        {/* Average Block Times - Half Width (Left Aligned) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AverageBlockTimes blockTimes={analytics.avgBlockTimes} />
        </div>
      </div>
    </div>
  );
}
