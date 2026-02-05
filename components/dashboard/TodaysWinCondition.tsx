"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function TodaysWinCondition() {
  const today = new Date().toISOString().split("T")[0];
  const winConditionData = useQuery(api.winConditions.getWinCondition, { date: today });

  if (!winConditionData?.winCondition) {
    return null;
  }

  return (
    <div
      className="relative overflow-hidden p-6 backdrop-blur-[10px] border dark:border-white/[0.1] border-black/[0.1] transition-all duration-500"
      style={{
        background: 'linear-gradient(135deg, rgba(107, 33, 168, 0.85) 0%, rgba(139, 92, 246, 0.75) 100%)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(107, 33, 168, 0.3)',
      }}
    >
      <div className="relative space-y-3 text-center">
        <h3
          className="text-[13px] font-semibold font-orbitron uppercase flex items-center justify-center gap-2 text-white"
          style={{ letterSpacing: '1px' }}
        >
          ⚡ TODAY&apos;S WIN CONDITION
        </h3>
        <p className="text-base font-medium text-white">
          {winConditionData.winCondition}
        </p>
      </div>
    </div>
  );
}
