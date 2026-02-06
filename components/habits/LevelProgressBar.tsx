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
        <span className="font-medium dark:text-[#888888] text-[#3d3d3d] uppercase tracking-wider">
          Level {level} → {level + 1}
        </span>
        <span className="font-bold font-orbitron text-[#00E5FF]" style={{ textShadow: '0 0 8px rgba(0, 229, 255, 0.5)' }}>
          {xpInCurrentLevel}/{1000} XP
        </span>
      </div>
      <div className="relative h-2 w-full rounded-full dark:bg-[#2A2A2E] bg-[#d1d2d4] overflow-hidden border border-[#00E5FF]/20">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] transition-all duration-500"
          style={{
            width: `${progress}%`,
            boxShadow: '0 0 10px rgba(0, 229, 255, 0.6), inset 0 0 10px rgba(0, 229, 255, 0.3)'
          }}
        />
        {/* Enhanced glow effect */}
        <div
          className="absolute inset-y-0 left-0 rounded-full opacity-70"
          style={{
            width: `${progress}%`,
            background: 'rgba(0, 229, 255, 0.4)',
            filter: 'blur(4px)',
          }}
        />
      </div>
    </div>
  );
}
