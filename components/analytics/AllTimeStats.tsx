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
    <Card className="p-6 bg-gray-900 border-gray-800 rounded-xl">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-6">
        📈 ALL-TIME STATS
      </h3>

      <div className="grid grid-cols-3 gap-8">
        {/* Wins */}
        <div className="text-center">
          <div className="text-4xl font-bold text-green-500 mb-2">
            {stats.wins}
          </div>
          <div className="text-xs uppercase tracking-wider text-gray-500">
            WINS
          </div>
        </div>

        {/* Perfect */}
        <div className="text-center">
          <div className="text-4xl font-bold text-white mb-2">
            {stats.perfect}
          </div>
          <div className="text-xs uppercase tracking-wider text-gray-500">
            PERFECT
          </div>
        </div>

        {/* Best Streak */}
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-500 mb-2">
            {stats.bestStreak}
          </div>
          <div className="text-xs uppercase tracking-wider text-gray-500">
            BEST STREAK
          </div>
        </div>
      </div>
    </Card>
  );
}
