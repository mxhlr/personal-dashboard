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
    <Card className="p-6 bg-card border shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-6">
        📈 ALL-TIME STATS
      </h3>

      <div className="grid grid-cols-3 gap-8">
        {/* Wins */}
        <div className="text-center">
          <div className="text-4xl font-bold text-[#00E676] mb-2">
            {stats.wins}
          </div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            WINS
          </div>
        </div>

        {/* Perfect */}
        <div className="text-center">
          <div className="text-4xl font-bold text-[#E0E0E0] mb-2">
            {stats.perfect}
          </div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            PERFECT
          </div>
        </div>

        {/* Best Streak */}
        <div className="text-center">
          <div className="text-4xl font-bold text-[#FF9800] mb-2">
            {stats.bestStreak}
          </div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            BEST STREAK
          </div>
        </div>
      </div>
    </Card>
  );
}
