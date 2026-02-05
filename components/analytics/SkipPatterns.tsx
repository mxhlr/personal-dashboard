"use client";

import { Card } from "@/components/ui/card";

interface SkipPatternsProps {
  patterns: Array<{ reason: string; count: number }>;
}

export function SkipPatterns({ patterns }: SkipPatternsProps) {
  if (patterns.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 bg-gray-900 border-gray-800 rounded-xl">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-6">
        ⚠️ SKIP PATTERNS
      </h3>

      <div className="space-y-3">
        {patterns.map((pattern, idx) => (
          <div key={idx} className="text-sm">
            <span className="font-bold text-white">{pattern.reason}</span>
            <span className="text-gray-400">: {pattern.count} times</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
