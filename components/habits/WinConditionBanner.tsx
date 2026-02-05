"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";

export function WinConditionBanner() {
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
      className="relative overflow-hidden p-6 backdrop-blur-[10px] border dark:border-white/[0.1] border-black/[0.1]"
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '12px',
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), linear-gradient(135deg, rgba(107, 33, 168, 0.4) 0%, transparent 100%)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
      }}
    >
      <div className="relative space-y-3 text-center">
        <h3
          className="text-[13px] font-semibold text-[#1A1A1A] uppercase"
          style={{ letterSpacing: '1px' }}
        >
          ⚡ TODAY&apos;S WIN CONDITION
        </h3>
        <Input
          placeholder="If I do nothing else, I will..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          className="border-0 bg-transparent text-center placeholder:text-[#888888] focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-[#1A1A1A]"
          style={{ fontSize: '16px' }}
        />
      </div>

      {/* Dark mode override */}
      <style jsx>{`
        :global(.dark) div {
          background: rgba(15, 15, 30, 0.8) !important;
          background-image: linear-gradient(rgba(15, 15, 30, 0.8), rgba(15, 15, 30, 0.8)), linear-gradient(135deg, rgba(107, 33, 168, 0.4) 0%, transparent 100%) !important;
        }
        :global(.dark) div h3 {
          color: white !important;
        }
        :global(.dark) div input {
          color: white !important;
        }
      `}</style>
    </div>
  );
}
