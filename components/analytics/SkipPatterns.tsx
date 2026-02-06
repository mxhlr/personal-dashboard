"use client";

import { Card } from "@/components/ui/card";

interface SkipPatternsProps {
  patterns: Array<{ reason: string; count: number }>;
}

export function SkipPatterns({ patterns }: SkipPatternsProps) {
  return (
    <Card className="p-6 dark:border-[rgba(255,68,68,0.15)] border-[rgba(244,67,54,0.3)] dark:bg-card/50 bg-white/80
      shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
      dark:hover:border-[rgba(255,68,68,0.25)] hover:border-[rgba(244,67,54,0.4)]">
      <h3 className="text-sm font-bold font-orbitron uppercase tracking-wider dark:text-[#FF4444] text-[#F44336] mb-6">
        ⚠️ SKIP PATTERNS
      </h3>

      <div className="space-y-3">
        {patterns.map((pattern, idx) => (
          <div key={idx} className="text-sm">
            <span
              className="font-bold dark:text-[#E0E0E0] text-[#0D0D0D]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              {pattern.reason}
            </span>
            <span
              className="dark:text-[#888888] text-[#4D4D4D]"
              style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
            >
              : {pattern.count} times
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
