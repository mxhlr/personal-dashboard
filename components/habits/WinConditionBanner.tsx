"use client";

import { Input } from "@/components/ui/input";

export function WinConditionBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-6"
      style={{
        background: 'rgba(15, 15, 30, 0.8)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid transparent',
        backgroundImage: 'linear-gradient(rgba(15, 15, 30, 0.8), rgba(15, 15, 30, 0.8)), linear-gradient(135deg, rgba(107, 33, 168, 0.4), transparent)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
      }}
    >
      <div className="relative space-y-3 text-center">
        <h3
          className="text-[13px] font-semibold text-white uppercase"
          style={{ letterSpacing: '1px' }}
        >
          ⚡ TODAY&apos;S WIN CONDITION
        </h3>
        <Input
          placeholder="If I do nothing else, I will..."
          className="border-0 bg-transparent text-center text-base placeholder:text-[#888888] focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-white"
        />
      </div>
    </div>
  );
}
