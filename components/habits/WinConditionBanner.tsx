"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Textarea } from "@/components/ui/textarea";

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

  // Show green border if user has filled in the win condition
  const isFilled = value.trim().length > 0;

  return (
    <div
      className={`relative overflow-hidden p-6 border transition-all duration-300 ease-out ${
        isFilled
          ? 'ring-2 ring-[#00E676]/30 shadow-[0_0_20px_rgba(0,230,118,0.15)] dark:border-[#00E676]/50 border-[#00E676]/30'
          : 'shadow-sm dark:border-border/50 border-border/60 hover:shadow-xl hover:-translate-y-1 dark:hover:border-border hover:border-border/80'
      }`}
      style={{
        borderRadius: '16px',
        background: isFilled
          ? 'linear-gradient(135deg, rgba(0, 230, 118, 0.08) 0%, rgba(0, 200, 83, 0.04) 100%), rgba(26, 26, 26, 0.5)'
          : 'linear-gradient(135deg, rgba(0, 229, 255, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%), rgba(26, 26, 26, 0.5)',
      }}
    >
      <div className="relative space-y-4 text-center">
        <h3
          className="text-[13px] font-semibold font-orbitron uppercase flex items-center justify-center gap-2 text-white"
          style={{ letterSpacing: '1px' }}
        >
          {isFilled ? '✓' : '⚡'} TODAY&apos;S WIN CONDITION
        </h3>
        <Textarea
          placeholder="If I do nothing else, I will..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          className="border-0 bg-transparent text-center placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-white resize-none min-h-[60px]"
          style={{ fontSize: '16px', lineHeight: '1.6' }}
          rows={3}
        />
      </div>

    </div>
  );
}
