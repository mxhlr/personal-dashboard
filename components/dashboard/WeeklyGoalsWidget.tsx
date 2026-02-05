"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, Target } from "lucide-react";
import { getWeek, getYear } from "date-fns";

export function WeeklyGoalsWidget() {
  const currentDate = new Date();
  const currentWeekNumber = getWeek(currentDate, { weekStartsOn: 1 });
  const currentYear = getYear(currentDate);

  const weeklyGoals = useQuery(api.weeklyReview.getWeeklyGoals, {
    year: currentYear,
    weekNumber: currentWeekNumber,
  });

  // Loading state
  if (weeklyGoals === undefined) {
    return (
      <Card className="p-6 dark:bg-card/50 bg-white/80
        shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
        dark:border-border/50 border-border/30
        dark:hover:border-border hover:border-border/50 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 dark:bg-white/10 bg-black/5 rounded w-1/2" />
          <div className="h-4 dark:bg-white/10 bg-black/5 rounded w-3/4" />
          <div className="h-4 dark:bg-white/10 bg-black/5 rounded w-2/3" />
        </div>
      </Card>
    );
  }

  // No goals for this week
  if (!weeklyGoals || weeklyGoals.length === 0) {
    return (
      <Card className="p-6 dark:bg-card/50 bg-white/80
        shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
        dark:border-border/50 border-border/30
        dark:hover:border-border hover:border-border/50">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Target className="w-10 h-10 dark:text-[#888888] text-[#666666] opacity-50" />
          </div>
          <h3 className="text-[13px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666]"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
            This Week's Goals
          </h3>
          <p className="text-[12px] dark:text-[#666666] text-[#888888]"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
            No goals set for this week.
            <br />
            Complete last week's review to plan ahead.
          </p>
        </div>
      </Card>
    );
  }

  // Group goals by category
  const goalsByCategory = weeklyGoals.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = [];
    }
    acc[goal.category].push(goal);
    return acc;
  }, {} as Record<string, typeof weeklyGoals>);

  // Category colors/icons
  const categoryConfig: Record<string, { icon: string; color: string }> = {
    Work: { icon: "💼", color: "text-blue-400" },
    Health: { icon: "🏃", color: "text-green-400" },
    Learning: { icon: "📚", color: "text-purple-400" },
    Personal: { icon: "✨", color: "text-pink-400" },
  };

  return (
    <Card className="p-6 dark:bg-card/50 bg-white/80
      shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
      dark:border-border/50 border-border/30
      dark:hover:border-border hover:border-border/50">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 dark:text-[#00E5FF] text-[#0097A7]" />
            <h3 className="text-[13px] font-bold uppercase tracking-wider dark:text-[#00E5FF] text-[#0097A7]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
              This Week's Goals
            </h3>
          </div>
          <span className="text-[11px] dark:text-[#888888] text-[#666666] font-bold"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
            Week {currentWeekNumber}
          </span>
        </div>

        {/* Goals by Category */}
        <div className="space-y-3">
          {Object.entries(goalsByCategory).map(([category, goals]) => {
            const config = categoryConfig[category] || { icon: "🎯", color: "text-gray-400" };

            return (
              <div key={category} className="space-y-2">
                {/* Category Header */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px]">{config.icon}</span>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${config.color}`}
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                    {category}
                  </span>
                </div>

                {/* Goals in Category */}
                <div className="space-y-2 pl-6">
                  {goals.map((goal, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 group"
                    >
                      <Circle className="w-4 h-4 mt-0.5 dark:text-[#666666] text-[#888888] flex-shrink-0
                        group-hover:dark:text-[#00E5FF] group-hover:text-[#0097A7] transition-colors" />
                      <p className="text-[13px] dark:text-[#E0E0E0] text-[#1A1A1A] leading-relaxed"
                        style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                        {goal.goal}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="pt-4 border-t dark:border-white/[0.08] border-black/[0.05]">
          <div className="flex items-center justify-between text-[11px]"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
            <span className="dark:text-[#888888] text-[#666666] uppercase tracking-wider font-bold">
              Total Goals
            </span>
            <span className="dark:text-[#00E5FF] text-[#0097A7] font-bold">
              {weeklyGoals.length}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
