"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Progress } from "@/components/ui/progress";

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function WeeklyProgress() {
  const now = new Date();
  const weekNumber = getWeekNumber(now);
  const year = now.getFullYear();

  const progress = useQuery(api.dailyLog.getWeeklyProgress, {
    weekNumber,
    year,
  });

  if (progress === undefined) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-2 bg-muted rounded"></div>
      </div>
    );
  }

  if (progress.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground">
        KW {weekNumber} Progress
      </h3>
      <div className="space-y-3">
        {progress.map((item) => (
          <div key={item.fieldId} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{item.fieldName}</span>
              <span className="text-muted-foreground">
                {item.current}/{item.target}
              </span>
            </div>
            <Progress value={item.percentage} className="h-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
