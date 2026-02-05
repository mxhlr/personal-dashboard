"use client";

import { Card } from "@/components/ui/card";

interface MonthlyComparisonProps {
  monthlyStats: Array<{ month: string; score: number }>;
}

export function MonthlyComparison({ monthlyStats }: MonthlyComparisonProps) {
  // Ensure all 12 months are always displayed (Jan-Dec)
  const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const displayStats = allMonths.map(month => {
    const existingStat = monthlyStats.find(s => s.month === month);
    return existingStat || { month, score: 0 };
  });

  return (
    <Card className="p-6 dark:border-[rgba(0,230,118,0.15)] border-[rgba(76,175,80,0.2)] dark:bg-card/50 bg-white/80
      shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
      dark:hover:border-[rgba(0,230,118,0.25)] hover:border-[rgba(76,175,80,0.3)]">
      <h3 className="text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#00E676] text-[#4CAF50] mb-6">
        📊 MONTHLY COMPARISON
      </h3>

      <div className="space-y-3">
        {displayStats.map((stat) => (
          <div key={stat.month} className="flex items-center gap-4">
            {/* Month Label */}
            <div
              className="w-12 text-sm font-medium dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              {stat.month}
            </div>

            {/* Progress Bar */}
            <div className="flex-1 h-6 dark:bg-[#2A2A2E] bg-[#e9ecef] rounded overflow-hidden
              dark:border-[rgba(0,230,118,0.1)] border-[rgba(76,175,80,0.15)] border">
              {stat.score > 0 ? (
                <div
                  className="h-full dark:bg-gradient-to-r dark:from-[#FFD700] dark:to-[#FFA000]
                    bg-gradient-to-r from-[#FFC107] to-[#FF9800] transition-all duration-300"
                  style={{ width: `${stat.score}%` }}
                />
              ) : (
                <div className="h-full dark:bg-[#2A2A2E] bg-[#e9ecef]" />
              )}
            </div>

            {/* Percentage */}
            <div
              className="w-12 text-right text-sm font-medium dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              {stat.score > 0 ? `${stat.score}%` : "–"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
