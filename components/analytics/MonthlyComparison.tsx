"use client";

import { Card } from "@/components/ui/card";

interface MonthlyComparisonProps {
  monthlyStats: Array<{ month: string; score: number }>;
}

export function MonthlyComparison({ monthlyStats }: MonthlyComparisonProps) {
  return (
    <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6">
        📊 MONTHLY COMPARISON
      </h3>

      <div className="space-y-3">
        {monthlyStats.map((stat) => (
          <div key={stat.month} className="flex items-center gap-4">
            {/* Month Label */}
            <div className="w-12 text-sm font-medium text-gray-900 dark:text-white">
              {stat.month}
            </div>

            {/* Progress Bar */}
            <div className="flex-1 h-6 bg-gray-200 dark:bg-[#2A2A2E] rounded overflow-hidden">
              {stat.score > 0 ? (
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] transition-all duration-300"
                  style={{ width: `${stat.score}%` }}
                />
              ) : (
                <div className="h-full bg-gray-300 dark:bg-gray-800" />
              )}
            </div>

            {/* Percentage */}
            <div className="w-12 text-right text-sm font-medium text-gray-900 dark:text-white">
              {stat.score > 0 ? `${stat.score}%` : "–"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
