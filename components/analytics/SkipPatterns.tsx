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
    <Card className="p-6 bg-card border shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-6">
        ⚠️ SKIP PATTERNS
      </h3>

      <div className="space-y-3">
        {patterns.map((pattern, idx) => (
          <div key={idx} className="text-sm">
            <span className="font-bold text-foreground">&ldquo;{pattern.reason}&rdquo;</span>
            <span className="text-muted-foreground">: {pattern.count} times</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
