"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoachToggleProps {
  onClick: () => void;
}

export function CoachToggle({ onClick }: CoachToggleProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full z-30
        dark:bg-[#FF9800] bg-[#F57C00]
        dark:hover:bg-[#F57C00] hover:bg-[#E64A19]
        shadow-2xl
        dark:shadow-[0_0_30px_rgba(255,152,0,0.4)] shadow-[0_8px_30px_rgba(245,124,0,0.4)]
        hover:scale-110
        transition-all duration-300 ease-out
        group"
      style={{
        boxShadow: '0 10px 40px rgba(255, 152, 0, 0.3), 0 0 0 0 rgba(255, 152, 0, 0.4)',
        animation: 'pulse-glow 2s ease-in-out infinite'
      }}
    >
      <MessageCircle className="w-6 h-6 dark:text-black text-white
        group-hover:scale-110 transition-transform duration-200" />

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 10px 40px rgba(255, 152, 0, 0.3), 0 0 0 0 rgba(255, 152, 0, 0.4);
          }
          50% {
            box-shadow: 0 10px 40px rgba(255, 152, 0, 0.5), 0 0 0 8px rgba(255, 152, 0, 0);
          }
        }
      `}</style>
    </Button>
  );
}
