"use client";

import { Card } from "@/components/ui/card";

interface AverageBlockTimesProps {
  blockTimes: Array<{ categoryName: string; avgMinutes: number; logs: number }>;
}

export function AverageBlockTimes({ blockTimes }: AverageBlockTimesProps) {
  // Sort by avgMinutes descending
  const sortedTimes = [...blockTimes].sort((a, b) => b.avgMinutes - a.avgMinutes);

  return (
    <Card className="p-6 bg-card border shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-6">
        🕐 AVERAGE BLOCK TIMES
      </h3>

      {sortedTimes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Time tracking data will appear here once you complete categories in the Daily Log.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedTimes.map((time, idx) => (
            <div key={idx} className="text-sm">
              <span className="font-bold text-foreground">{time.categoryName}</span>
              <span className="text-muted-foreground">: </span>
              <span className="text-[#4CAF50] font-medium">{time.avgMinutes}min</span>
              <span className="text-muted-foreground"> avg ({time.logs} logs)</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
