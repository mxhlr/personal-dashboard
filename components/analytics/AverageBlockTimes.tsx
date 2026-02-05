"use client";

import { Card } from "@/components/ui/card";

interface AverageBlockTimesProps {
  blockTimes: Array<{ categoryName: string; avgMinutes: number; logs: number }>;
}

export function AverageBlockTimes({ blockTimes }: AverageBlockTimesProps) {
  // Sort by avgMinutes descending
  const sortedTimes = [...blockTimes].sort((a, b) => b.avgMinutes - a.avgMinutes);

  return (
    <Card className="p-6 bg-gray-900 border-gray-800 rounded-xl">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-6">
        🕐 AVERAGE BLOCK TIMES
      </h3>

      {sortedTimes.length === 0 ? (
        <p className="text-sm text-gray-400">
          Time tracking data will appear here once you complete categories in the Daily Log.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedTimes.map((time, idx) => (
            <div key={idx} className="text-sm">
              <span className="font-bold text-white">{time.categoryName}</span>
              <span className="text-gray-400">: </span>
              <span className="text-green-500 font-medium">{time.avgMinutes}min</span>
              <span className="text-gray-400"> avg ({time.logs} logs)</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
