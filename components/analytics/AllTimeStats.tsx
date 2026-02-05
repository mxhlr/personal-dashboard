"use client";

import { Card } from "@/components/ui/card";

interface AllTimeStatsProps {
  stats: {
    wins: number;
    perfect: number;
    bestStreak: number;
  };
}

export function AllTimeStats({ stats }: AllTimeStatsProps) {
  return (
    <Card className="p-6 dark:border-[rgba(139,92,246,0.15)] border-[rgba(139,92,246,0.2)] dark:bg-card/50 bg-white/80
      shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
      dark:hover:border-[rgba(139,92,246,0.25)] hover:border-[rgba(139,92,246,0.3)]">
      <h3 className="text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#8B5CF6] text-[#7C3AED] mb-6">
        📈 ALL-TIME STATS
      </h3>

      <div className="grid grid-cols-3 gap-8">
        {/* Wins */}
        <div className="text-center">
          <div
            className="text-4xl font-bold dark:text-[#00E676] text-[#4CAF50] mb-2"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
          >
            {stats.wins}
          </div>
          <div className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#888888] text-[#666666]">
            WINS
          </div>
        </div>

        {/* Perfect */}
        <div className="text-center">
          <div
            className="text-4xl font-bold dark:text-[#FFD700] text-[#FFC107] mb-2"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
          >
            {stats.perfect}
          </div>
          <div className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#888888] text-[#666666]">
            PERFECT
          </div>
        </div>

        {/* Best Streak */}
        <div className="text-center">
          <div
            className="text-4xl font-bold dark:text-[#FF9800] text-[#F57C00] mb-2"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
          >
            {stats.bestStreak}
          </div>
          <div className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#888888] text-[#666666]">
            BEST STREAK
          </div>
        </div>
      </div>
    </Card>
  );
}
