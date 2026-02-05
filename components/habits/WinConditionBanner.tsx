"use client";

import { Input } from "@/components/ui/input";

export function WinConditionBanner() {
  return (
    <div
      className="relative overflow-hidden p-6 backdrop-blur-[10px]"
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '12px',
        border: '1px solid transparent',
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
