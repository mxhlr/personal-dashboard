"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";

export function TodaysWinCondition() {
  const today = new Date().toISOString().split("T")[0];
  const winConditionData = useQuery(api.winConditions.getWinCondition, { date: today });

  if (!winConditionData?.winCondition) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-purple-500 dark:bg-card/50 bg-white/80">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <h3 className="text-sm font-semibold uppercase tracking-wider dark:text-[#00E5FF] text-[#0077B6]">
              Today's Win Condition
            </h3>
          </div>
          <p className="text-base font-medium dark:text-white text-gray-900 pl-7">
            {winConditionData.winCondition}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
