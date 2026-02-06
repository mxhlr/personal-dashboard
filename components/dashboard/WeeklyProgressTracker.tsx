"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format, startOfWeek, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { WEEK, SIZE, ANIMATION_DURATION } from "@/lib/constants";

export function WeeklyProgressTracker() {
  const userStats = useQuery(api.gamification.getUserStats);

  // Get the current week (Monday to Sunday)
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: WEEK.STARTS_ON }); // Monday
  const weekDays = Array.from({ length: WEEK.DAYS }, (_, i) => addDays(weekStart, i));

  // Query daily logs for each day of the week
  const dailyLogs = weekDays.map((date) => {
    const dateString = format(date, "yyyy-MM-dd");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery(api.dailyLog.getDailyLog, { date: dateString });
  });

  // Calculate completed days
  const completedDays = dailyLogs.filter((log) => log?.completed).length;
  const currentStreak = userStats?.currentStreak ?? 0;

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        <h3
          className="text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-4"
          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
        >
          Weekly Progress
        </h3>

        {/* Week Days Grid */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((date, index) => {
            const isToday = format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
            const isPast = date < today && !isToday;
            const isFuture = date > today;
            const log = dailyLogs[index];
            const isComplete = log?.completed ?? false;

            return (
              <div key={index} className="flex flex-col items-center gap-1">
                <span
                  className={`text-[10px] uppercase ${
                    isToday ? "dark:text-white text-black font-bold" : "dark:text-[#666666] text-[#999999]"
                  }`}
                  style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                >
                  {format(date, "EEE", { locale: de }).slice(0, 2)}
                </span>
                <div
                  className={`w-${SIZE.AVATAR / 4} h-${SIZE.AVATAR / 4} rounded-full flex items-center justify-center transition-all duration-${ANIMATION_DURATION.FAST} ${
                    isComplete
                      ? "bg-[#00E676] dark:bg-[#00E676] shadow-[0_0_10px_rgba(0,230,118,0.4)]"
                      : isPast
                      ? "dark:bg-red-500/20 bg-red-500/10 border dark:border-red-500/50 border-red-500/30"
                      : isFuture
                      ? "dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/10"
                      : isToday
                      ? "dark:bg-white/10 bg-black/10 border-2 dark:border-white/30 border-black/30 animate-pulse"
                      : "dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/10"
                  }`}
                >
                  {isComplete && (
                    <span className="text-black font-bold text-sm">✓</span>
                  )}
                  {!isComplete && isPast && (
                    <span className="text-red-500 text-sm">✕</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span
            className="text-[11px] dark:text-[#888888] text-[#666666]"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
          >
            Diese Woche
          </span>
          <span
            className="text-[12px] dark:text-[#E0E0E0] text-[#1A1A1A] font-bold"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
          >
            {completedDays}/7 Tage
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span
            className="text-[11px] dark:text-[#888888] text-[#666666]"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
          >
            Current Streak
          </span>
          <span
            className="text-[12px] font-bold flex items-center gap-1"
            style={{
              fontFamily: '"Courier New", "Monaco", monospace',
              color: currentStreak >= 7 ? '#00E676' : '#E0E0E0',
            }}
          >
            {currentStreak >= 7 && '🔥'} {currentStreak} Tage
          </span>
        </div>
      </div>
    </div>
  );
}
