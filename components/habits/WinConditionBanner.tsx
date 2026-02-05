"use client";

import { Input } from "@/components/ui/input";

export function WinConditionBanner() {
  return (
    <div className="relative overflow-hidden rounded-lg p-6 backdrop-blur-sm bg-white/70 dark:bg-[rgba(20,20,40,0.8)] border-2 border-transparent bg-clip-padding" style={{
      backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), linear-gradient(135deg, #9333ea, #06b6d4)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
    }}>
      <style jsx>{`
        @media (prefers-color-scheme: dark) {
          div {
            background-image: linear-gradient(rgba(20, 20, 40, 0.8), rgba(20, 20, 40, 0.8)), linear-gradient(135deg, #9333ea, #06b6d4) !important;
          }
        }
      `}</style>
      <div className="relative space-y-3">
        <h3 className="text-xs font-medium text-[#5B21B6] dark:text-[#FFD700]">
          Win Condition
        </h3>
        <Input
          placeholder="If I do nothing else, I will..."
          className="border-0 bg-transparent text-base placeholder:text-[#999999] dark:placeholder:text-[#888888] focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
        />
      </div>
    </div>
  );
}
