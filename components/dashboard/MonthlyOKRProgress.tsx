"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { getMonth, getYear } from "date-fns";

export function MonthlyOKRProgress() {
  const currentDate = new Date();
  const currentMonth = getMonth(currentDate) + 1; // getMonth() returns 0-11
  const currentYear = getYear(currentDate);

  const monthlyOKRs = useQuery(api.monthlyReview.getMonthlyOKRs, {
    year: currentYear,
    month: currentMonth,
  });

  // Loading state
  if (monthlyOKRs === undefined) {
    return (
      <Card className="p-6 dark:bg-card/50 bg-white/80
        shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
        dark:border-border/50 border-border/30
        dark:hover:border-border hover:border-border/50 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 dark:bg-white/10 bg-black/5 rounded w-1/2" />
          <div className="h-20 dark:bg-white/10 bg-black/5 rounded" />
          <div className="h-20 dark:bg-white/10 bg-black/5 rounded" />
        </div>
      </Card>
    );
  }

  // No OKRs for this month
  if (!monthlyOKRs || monthlyOKRs.length === 0) {
    return (
      <Card className="p-6 dark:bg-card/50 bg-white/80
        shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
        dark:border-border/50 border-border/30
        dark:hover:border-border hover:border-border/50">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <TrendingUp className="w-10 h-10 dark:text-[#888888] text-[#666666] opacity-50" />
          </div>
          <h3 className="text-[13px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666]"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
            This Month&apos;s OKRs
          </h3>
          <p className="text-[12px] dark:text-[#666666] text-[#888888]"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
            No OKRs set for this month.
            <br />
            Complete last month&apos;s review to plan ahead.
          </p>
        </div>
      </Card>
    );
  }

  // Area icons and colors
  const areaConfig: Record<string, { icon: string; color: string; gradient: string }> = {
    Wealth: {
      icon: "💰",
      color: "text-yellow-400",
      gradient: "from-yellow-500/20 to-yellow-600/10",
    },
    Health: {
      icon: "🏃",
      color: "text-green-400",
      gradient: "from-green-500/20 to-green-600/10",
    },
    Love: {
      icon: "❤️",
      color: "text-red-400",
      gradient: "from-red-500/20 to-red-600/10",
    },
    Happiness: {
      icon: "😊",
      color: "text-purple-400",
      gradient: "from-purple-500/20 to-purple-600/10",
    },
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Card className="p-6 dark:bg-card/50 bg-white/80
      shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
      dark:border-border/50 border-border/30
      dark:hover:border-border hover:border-border/50">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 dark:text-[#00E5FF] text-[#0097A7]" />
            <h3 className="text-[13px] font-bold uppercase tracking-wider dark:text-[#00E5FF] text-[#0097A7]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
              {monthNames[currentMonth - 1]} {currentYear} OKRs
            </h3>
          </div>
          <span className="text-[11px] dark:text-[#888888] text-[#666666] font-bold"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
            {monthlyOKRs.length} {monthlyOKRs.length === 1 ? "Objective" : "Objectives"}
          </span>
        </div>

        {/* OKRs */}
        <div className="space-y-5">
          {monthlyOKRs.map((okr, index) => {
            const config = areaConfig[okr.area] || {
              icon: "🎯",
              color: "text-gray-400",
              gradient: "from-gray-500/20 to-gray-600/10",
            };

            return (
              <div
                key={index}
                className={`rounded-xl p-4 bg-gradient-to-br ${config.gradient}
                  dark:border dark:border-white/[0.08] border border-black/[0.05]
                  transition-all duration-200 hover:scale-[1.01]`}
              >
                {/* Objective Header */}
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-[14px] mt-0.5">{config.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}
                        style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                        {okr.area}
                      </span>
                    </div>
                    <p className="text-[13px] dark:text-[#E0E0E0] text-[#1A1A1A] font-semibold leading-relaxed"
                      style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                      {okr.objective}
                    </p>
                  </div>
                </div>

                {/* Key Results */}
                <div className="space-y-2 pl-6 border-l-2 dark:border-white/[0.1] border-black/[0.05]">
                  {okr.keyResults.map((kr, krIndex) => (
                    <div key={krIndex} className="space-y-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[11px] dark:text-[#CCCCCC] text-[#444444]"
                          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                          {kr.description}
                        </p>
                        <span className="text-[10px] dark:text-[#888888] text-[#666666] font-bold whitespace-nowrap"
                          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                          0/{kr.target} {kr.unit}
                        </span>
                      </div>
                      {/* Progress Bar - Currently at 0% since we don't track progress yet */}
                      <div className="h-1.5 dark:bg-white/[0.05] bg-black/[0.05] rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-500`}
                          style={{ width: "0%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Overall Progress Note */}
                <div className="mt-3 pt-3 border-t dark:border-white/[0.05] border-black/[0.03]">
                  <p className="text-[10px] dark:text-[#666666] text-[#888888] text-center italic"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                    Track progress manually • Update in monthly review
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Info */}
        <div className="pt-4 border-t dark:border-white/[0.08] border-black/[0.05] text-center">
          <p className="text-[10px] dark:text-[#888888] text-[#666666] uppercase tracking-wider"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
            Complete this month&apos;s review to reflect &amp; plan next month
          </p>
        </div>
      </div>
    </Card>
  );
}
