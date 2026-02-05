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
      className={`relative overflow-hidden p-6 backdrop-blur-[10px] border transition-all duration-500 ${
        isAchieved
          ? 'border-[#FFD700] dark:border-[#FFD700] shadow-[0_0_25px_rgba(255,215,0,0.4)]'
          : 'dark:border-white/[0.1] border-black/[0.1]'
      }`}
      style={{
        background: isAchieved
          ? 'rgba(255, 215, 0, 0.15)'
          : 'rgba(255, 255, 255, 0.8)',
        borderRadius: '16px',
        backgroundImage: isAchieved
          ? 'linear-gradient(rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.15)), linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, transparent 100%)'
          : 'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), linear-gradient(135deg, rgba(107, 33, 168, 0.4) 0%, transparent 100%)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
      }}
    >
      <div className="relative space-y-4 text-center">
        <h3
          className="text-[13px] font-semibold uppercase flex items-center justify-center gap-2 text-white"
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
