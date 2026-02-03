"use client";

import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  percentage: number;
}

export function ProgressIndicator({ percentage }: ProgressIndicatorProps) {
  return (
    <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Progress
          </span>
          <span className="text-sm font-semibold text-foreground">
            {Math.round(percentage)}% Complete
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    </div>
  );
}
