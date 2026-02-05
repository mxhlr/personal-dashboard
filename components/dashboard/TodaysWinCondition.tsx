"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function TodaysWinCondition() {
  const today = new Date().toISOString().split("T")[0];
  const winConditionData = useQuery(api.winConditions.getWinCondition, { date: today });

  if (!winConditionData?.winCondition) {
    return null;
  }

  const isAchieved = winConditionData?.achieved || false;

  return (
    <div
      className={`relative overflow-hidden p-6 backdrop-blur-[10px] border transition-all duration-500 hover:scale-[1.01]
        ${isAchieved
          ? 'dark:border-[rgba(0,230,118,0.25)] border-[rgba(76,175,80,0.3)] ring-2 dark:ring-[rgba(0,230,118,0.2)] ring-[rgba(76,175,80,0.25)]'
          : 'dark:border-[rgba(139,92,246,0.2)] border-[rgba(139,92,246,0.25)]'
        }`}
      style={{
        background: isAchieved
          ? 'linear-gradient(135deg, rgba(0, 230, 118, 0.15) 0%, rgba(0, 200, 83, 0.2) 100%), rgba(26, 26, 26, 0.6)'
          : 'linear-gradient(135deg, rgba(107, 33, 168, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%), rgba(26, 26, 26, 0.6)',
        borderRadius: '16px',
        boxShadow: isAchieved
          ? '0 8px 32px rgba(0, 230, 118, 0.2), 0 0 20px rgba(0, 230, 118, 0.1)'
          : '0 8px 32px rgba(107, 33, 168, 0.2)',
      }}
    >
      {/* Subtle animated corner accent */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-20"
        style={{
          background: isAchieved
            ? 'radial-gradient(circle at top left, rgba(0, 230, 118, 0.5), transparent 70%)'
            : 'radial-gradient(circle at top left, rgba(139, 92, 246, 0.5), transparent 70%)',
          animation: 'neon-pulse 3s ease-in-out infinite'
        }}
      />

      <div className="relative space-y-3 text-center">
        <h3
          className={`text-[13px] font-bold font-orbitron uppercase flex items-center justify-center gap-2
            ${isAchieved ? 'dark:text-[#00E676] text-[#4CAF50]' : 'dark:text-[#A78BFA] text-[#8B5CF6]'}`}
          style={{ letterSpacing: '1.5px' }}
        >
          {isAchieved ? '✓ WIN CONDITION ACHIEVED' : '⚡ TODAY\'S WIN CONDITION'}
        </h3>
        <p className={`text-[17px] font-semibold leading-relaxed
          ${isAchieved ? 'dark:text-[#E8F5E9] text-[#1B5E20]' : 'dark:text-[#E0E0E0] text-[#1A1A1A]'}`}
        >
          {winConditionData.winCondition}
        </p>
      </div>
    </div>
  );
}
