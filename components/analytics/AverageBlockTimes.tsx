"use client";

import { Card } from "@/components/ui/card";

interface AverageBlockTimesProps {
  blockTimes: Array<{ categoryName: string; avgMinutes: number; logs: number }>;
}

export function AverageBlockTimes({ blockTimes }: AverageBlockTimesProps) {
  // Sort by avgMinutes descending
  const sortedTimes = [...blockTimes].sort((a, b) => b.avgMinutes - a.avgMinutes);

  return (
    <Card className="p-6 dark:border-[rgba(255,152,0,0.15)] border-[rgba(255,152,0,0.4)] dark:bg-card/50 bg-white/80
      shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
      dark:hover:border-[rgba(255,152,0,0.25)] hover:border-[rgba(255,152,0,0.5)]">
      <h3 className="text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#FF9800] text-[#E65100] mb-6">
        🕐 AVERAGE BLOCK TIMES
      </h3>

      {sortedTimes.length === 0 ? (
        <p
          className="text-sm dark:text-[#888888] text-[#424242]"
          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
        >
          Time tracking data will appear here once you complete categories in the Daily Log.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedTimes.map((time, idx) => (
            <div key={idx} className="text-sm">
              <span
                className="font-bold dark:text-[#E0E0E0] text-[#1A1A1A]"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              >
                {time.categoryName}
              </span>
              <span
                className="dark:text-[#888888] text-[#424242]"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              >
                :{" "}
              </span>
              <span
                className="dark:text-[#00E676] text-[#2E7D32] font-medium"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              >
                {time.avgMinutes}min
              </span>
              <span
                className="dark:text-[#888888] text-[#424242]"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              >
                {" "}avg ({time.logs} logs)
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
