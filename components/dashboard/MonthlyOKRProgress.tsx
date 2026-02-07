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

  const monthlyMilestones = useQuery(api.monthlyReview.getMonthlyMilestones, {
    year: currentYear,
    month: currentMonth,
  });

  // Loading state
  if (monthlyMilestones === undefined) {
    return (
      <Card className="p-6 dark:bg-card/50 bg-white/80
        shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
        dark:border-border/50 border-border/60
        dark:hover:border-border hover:border-border/80 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 dark:bg-white/10 bg-black/8 rounded w-1/2" />
          <div className="h-20 dark:bg-white/10 bg-black/8 rounded" />
          <div className="h-20 dark:bg-white/10 bg-black/8 rounded" />
        </div>
      </Card>
    );
  }

  // No Milestones for this month
  if (!monthlyMilestones || monthlyMilestones.length === 0) {
    return (
      <Card className="p-6 dark:bg-card/50 bg-white/80
        shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
        dark:border-border/50 border-border/60
        dark:hover:border-border hover:border-border/80">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <TrendingUp className="w-10 h-10 dark:text-[#525252] text-[#3d3d3d] opacity-50" />
          </div>
          <h3 className="text-[13px] font-bold uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d]"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
            This Month&apos;s Milestones
          </h3>
          <p className="text-[12px] dark:text-[#3d3d3d] text-[#525252]"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
            No milestones set for this month.
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
      dark:border-border/50 border-border/60
      dark:hover:border-border hover:border-border/80">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 dark:text-[#00E5FF] text-[#0097A7]" />
            <h3 className="text-[13px] font-bold uppercase tracking-wider dark:text-[#00E5FF] text-[#0097A7]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
              {monthNames[currentMonth - 1]} {currentYear} Milestones
            </h3>
          </div>
          <span className="text-[11px] dark:text-[#525252] text-[#3d3d3d] font-bold"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
            {monthlyMilestones.length} {monthlyMilestones.length === 1 ? "Milestone" : "Milestones"}
          </span>
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monthlyMilestones.map((milestone, index) => {
            const config = areaConfig[milestone.area] || {
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
                <div className="flex items-start gap-2">
                  <span className="text-xl mt-0.5">{config.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}
                        style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                        {milestone.area}
                      </span>
                    </div>
                    <p className="text-[13px] dark:text-[#E0E0E0] text-[#1A1A1A] leading-relaxed"
                      style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                      {milestone.milestone}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Info */}
        <div className="pt-4 border-t dark:border-white/[0.08] border-black/[0.05] text-center">
          <p className="text-[10px] dark:text-[#525252] text-[#3d3d3d] uppercase tracking-wider"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
            Complete this month&apos;s review to reflect &amp; plan next month
          </p>
        </div>
      </div>
    </Card>
  );
}
