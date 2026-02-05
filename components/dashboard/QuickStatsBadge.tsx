"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function QuickStatsBadge() {
  const userStats = useQuery(api.gamification.getUserStats);

  if (!userStats) {
    return null;
  }

  const { level, xp, xpForNextLevel, currentStreak } = userStats;
  const xpProgress = xpForNextLevel > 0 ? Math.round((xp / xpForNextLevel) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Level Badge */}
      <div
        className="group flex items-center justify-between px-4 py-3 rounded-lg
          dark:bg-gradient-to-r dark:from-purple-500/10 dark:to-cyan-500/10
          bg-gradient-to-r from-purple-500/5 to-cyan-500/5
          dark:border dark:border-purple-500/20 border border-purple-500/10
          hover:shadow-lg transition-all duration-200"
        style={{
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.1)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">⚡</div>
          <div>
            <p
              className="text-[10px] uppercase tracking-wider dark:text-[#888888] text-[#666666]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Level
            </p>
            <p
              className="text-2xl font-bold dark:text-white text-black"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              {level}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className="text-[10px] uppercase tracking-wider dark:text-[#888888] text-[#666666]"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
          >
            XP
          </p>
          <p
            className="text-sm font-bold dark:text-[#E0E0E0] text-[#1A1A1A]"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
          >
            {xp}/{xpForNextLevel}
          </p>
        </div>
      </div>

      {/* XP Progress Ring */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-lg
          dark:bg-white/[0.03] bg-black/[0.02]
          dark:border dark:border-white/[0.08] border border-black/[0.05]
          transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <svg className="transform -rotate-90" width="48" height="48">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="dark:text-white/10 text-black/10"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#00E5FF"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - xpProgress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-[11px] font-bold dark:text-white text-black"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              >
                {xpProgress}%
              </span>
            </div>
          </div>
          <div>
            <p
              className="text-[10px] uppercase tracking-wider dark:text-[#888888] text-[#666666]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Progress to Level {level + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Streak Badge */}
      <div
        className={`flex items-center justify-between px-4 py-3 rounded-lg
          dark:border border transition-all duration-200 ${
          currentStreak >= 7
            ? 'dark:bg-gradient-to-r dark:from-orange-500/10 dark:to-red-500/10 bg-gradient-to-r from-orange-500/5 to-red-500/5 dark:border-orange-500/20 border-orange-500/10'
            : 'dark:bg-white/[0.03] bg-black/[0.02] dark:border-white/[0.08] border-black/[0.05]'
        }`}
        style={
          currentStreak >= 7
            ? { boxShadow: '0 0 20px rgba(249, 115, 22, 0.2)' }
            : undefined
        }
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">{currentStreak >= 7 ? '🔥' : '📊'}</div>
          <div>
            <p
              className="text-[10px] uppercase tracking-wider dark:text-[#888888] text-[#666666]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Current Streak
            </p>
            <p
              className={`text-2xl font-bold ${
                currentStreak >= 7 ? 'text-orange-500' : 'dark:text-white text-black'
              }`}
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              {currentStreak}
            </p>
          </div>
        </div>
        <p
          className="text-[10px] uppercase tracking-wider dark:text-[#888888] text-[#666666]"
          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
        >
          Tage
        </p>
      </div>
    </div>
  );
}
