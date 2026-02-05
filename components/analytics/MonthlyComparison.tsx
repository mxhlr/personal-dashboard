"use client";

import { Card } from "@/components/ui/card";

interface MonthlyComparisonProps {
  monthlyStats: Array<{ month: string; score: number }>;
}

export function MonthlyComparison({ monthlyStats }: MonthlyComparisonProps) {
  return (
    <Card className="p-6 bg-card border shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-6">
        📊 MONTHLY COMPARISON
      </h3>

      <div className="space-y-3">
        {monthlyStats.map((stat) => (
          <div key={stat.month} className="flex items-center gap-4">
            {/* Month Label */}
            <div className="w-12 text-sm font-medium text-foreground">
              {stat.month}
            </div>

            {/* Progress Bar */}
            <div className="flex-1 h-6 bg-[#2A2A2E] rounded overflow-hidden">
              <div
                className="h-full bg-[#FFD700] transition-all duration-300"
                style={{ width: `${stat.score}%` }}
              />
            </div>

            {/* Percentage */}
            <div className="w-12 text-right text-sm font-medium text-foreground">
              {stat.score > 0 ? `${stat.score}%` : "-"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
