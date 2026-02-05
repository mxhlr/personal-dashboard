"use client";

interface LevelProgressBarProps {
  level: number;
  currentXP: number;
}

export function LevelProgressBar({ level, currentXP }: LevelProgressBarProps) {
  // XP within current level
  const xpInCurrentLevel = currentXP % 1000;
  const progress = (xpInCurrentLevel / 1000) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium dark:text-[#888888] text-[#666666]">
          Level {level} → {level + 1}
        </span>
        <span className="font-bold text-[#00E5FF]">
          {xpInCurrentLevel}/{1000} XP
        </span>
      </div>
      <div className="relative h-1 w-full rounded-full dark:bg-[#2A2A2E] bg-[#E5E5E5] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
        {/* Subtle glow effect */}
        <div
          className="absolute inset-y-0 left-0 rounded-full opacity-50"
          style={{
            width: `${progress}%`,
            background: 'rgba(0, 229, 255, 0.3)',
            filter: 'blur(2px)',
          }}
        />
      </div>
    </div>
  );
}
