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
        dark:bg-[#C0C0C0] bg-[#A8A8A8]
        dark:hover:bg-[#D4D4D4] hover:bg-[#BEBEBE]
        shadow-2xl
        dark:shadow-[0_0_30px_rgba(192,192,192,0.4)] shadow-[0_8px_30px_rgba(168,168,168,0.4)]
        hover:scale-110
        transition-all duration-300 ease-out
        group"
      style={{
        boxShadow: '0 10px 40px rgba(192, 192, 192, 0.3), 0 0 0 0 rgba(192, 192, 192, 0.4)',
        animation: 'pulse-glow 2s ease-in-out infinite'
      }}
    >
      <MessageCircle className="w-6 h-6 dark:text-black text-white
        group-hover:scale-110 transition-transform duration-200" />

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 10px 40px rgba(192, 192, 192, 0.3), 0 0 0 0 rgba(192, 192, 192, 0.4);
          }
          50% {
            box-shadow: 0 10px 40px rgba(192, 192, 192, 0.5), 0 0 0 8px rgba(192, 192, 192, 0);
          }
        }
      `}</style>
    </Button>
  );
}
