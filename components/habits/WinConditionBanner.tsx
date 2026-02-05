"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";

interface WinConditionBannerProps {
  isAchieved?: boolean;
}

export function WinConditionBanner({ isAchieved = false }: WinConditionBannerProps = {}) {
  const today = new Date().toISOString().split("T")[0];
  const winConditionData = useQuery(api.winConditions.getWinCondition, { date: today });
  const saveWinCondition = useMutation(api.winConditions.saveWinCondition);

  const [value, setValue] = useState("");

  // Load win condition from database
  useEffect(() => {
    if (winConditionData?.winCondition) {
      setValue(winConditionData.winCondition);
    }
  }, [winConditionData]);

  const handleBlur = async () => {
    if (value.trim()) {
      await saveWinCondition({
        date: today,
        winCondition: value.trim(),
      });
    }
  };

  return (
    <div
      className={`relative overflow-hidden p-6 border transition-all duration-300 ease-out ${
        isAchieved
          ? 'ring-2 ring-[#FFD700]/30 shadow-[0_0_20px_rgba(255,215,0,0.15)] dark:border-[#FFD700]/50 border-[#FFD700]/30'
          : 'shadow-sm dark:border-border/50 border-border/30 hover:shadow-xl hover:-translate-y-1 dark:hover:border-border hover:border-border/50'
      }`}
      style={{
        borderRadius: '16px',
        background: isAchieved
          ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 180, 0, 0.04) 100%), rgba(26, 26, 26, 0.5)'
          : 'linear-gradient(135deg, rgba(0, 229, 255, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%), rgba(26, 26, 26, 0.5)',
      }}
    >
      <div className="relative space-y-4 text-center">
        <h3
          className="text-[13px] font-semibold font-orbitron uppercase flex items-center justify-center gap-2 text-white"
          style={{ letterSpacing: '1px' }}
        >
          {isAchieved ? '🏆' : '⚡'} TODAY&apos;S WIN CONDITION {isAchieved && <span className="text-[#FFD700]">ACHIEVED</span>}
        </h3>
        <Input
          placeholder="If I do nothing else, I will..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          className="border-0 bg-transparent text-center placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-white"
          style={{ fontSize: '16px' }}
        />
      </div>

    </div>
  );
}
