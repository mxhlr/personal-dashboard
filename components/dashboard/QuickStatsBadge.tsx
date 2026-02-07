"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function QuickStatsBadge() {
  const userStats = useQuery(api.gamification.getUserStats);

  if (!userStats) {
    return null;
  }

  const { level, totalXP, xpForNextLevel, currentStreak } = userStats;
  const xpProgress = xpForNextLevel > 0 ? Math.round((totalXP / xpForNextLevel) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <h3 className="text-[13px] font-bold uppercase tracking-wider dark:text-white text-black font-orbitron">
          Quick Stats
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
      {/* Level Badge */}
      <div
        className="group flex items-center justify-between px-4 py-4 rounded-lg
          dark:bg-gradient-to-r dark:from-purple-500/10 dark:to-cyan-500/10
          bg-gradient-to-r from-purple-500/5 to-cyan-500/5
          dark:border dark:border-purple-500/20 border border-purple-500/10
          hover:shadow-lg transition-all duration-200"
        style={{
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.1)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="text-xl">⚡</div>
          <div>
            <p
              className="text-[10px] uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Level
            </p>
            <p
              className="text-xl font-bold dark:text-white text-black"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              {level}
            </p>
          </div>
        </div>
      </div>

      {/* XP Progress Ring */}
      <div
        className="flex items-center justify-center px-4 py-4 rounded-lg
          dark:bg-white/[0.03] bg-black/[0.02]
          dark:border dark:border-white/[0.08] border border-black/[0.05]
          transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 flex-shrink-0">
            <svg className="transform -rotate-90" width="40" height="40">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="dark:text-white/10 text-black/10"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#00E5FF"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 16}`}
                strokeDashoffset={`${2 * Math.PI * 16 * (1 - xpProgress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-[10px] font-bold dark:text-white text-black"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              >
                {xpProgress}%
              </span>
            </div>
          </div>
          <div>
            <p
              className="text-[10px] uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              To Lvl {level + 1}
            </p>
            <p
              className="text-xs font-bold dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              {totalXP}/{xpForNextLevel}
            </p>
          </div>
        </div>
      </div>

      {/* Streak Badge */}
      <div
        className={`flex items-center justify-between px-4 py-4 rounded-lg
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
        <div className="flex items-center gap-2">
          <div className="text-xl">{currentStreak >= 7 ? '🔥' : '📊'}</div>
          <div>
            <p
              className="text-[10px] uppercase tracking-wider dark:text-[#525252] text-[#3d3d3d]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              Streak
            </p>
            <p
              className={`text-xl font-bold ${
                currentStreak >= 7 ? 'text-orange-500' : 'dark:text-white text-black'
              }`}
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              {currentStreak}d
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
