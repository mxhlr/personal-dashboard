"use client";

import { useEffect, useState, useRef } from "react";

interface ProgressRingProps {
  current: number;
  total: number;
}

export function ProgressRing({ current, total }: ProgressRingProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const isComplete = percentage === 100;
  const [showCelebration, setShowCelebration] = useState(false);
  const prevPercentageRef = useRef(percentage);

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Calculate dot position (starts at top, moves clockwise)
  const angle = (percentage / 100) * 360 - 90; // -90 to start at top
  const angleRad = (angle * Math.PI) / 180;
  const dotX = 100 + 90 * Math.cos(angleRad);
  const dotY = 100 + 90 * Math.sin(angleRad);

  // Progressive color thresholds for better visual feedback
  const getRingColor = () => {
    if (percentage === 100) return { color: '#FFD700', glow: 'rgba(255, 215, 0, 0.6)' }; // Gold
    if (percentage >= 80) return { color: '#00E676', glow: 'rgba(0, 230, 118, 0.5)' }; // Green
    if (percentage >= 50) return { color: '#00E5FF', glow: 'rgba(0, 229, 255, 0.4)' }; // Cyan
    return { color: '#888888', glow: 'rgba(136, 136, 136, 0.3)' }; // Gray
  };

  const { color: ringColor, glow: glowColor } = getRingColor();

  // Detect when hitting 100%
  useEffect(() => {
    if (percentage === 100 && prevPercentageRef.current < 100) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
    prevPercentageRef.current = percentage;
  }, [percentage]);

  // Progress stage labels
  const getProgressStage = () => {
    if (percentage === 100) return { label: 'PERFECT DAY 🌟', color: '#FFD700' };
    if (percentage >= 75) return { label: 'ON FIRE', color: '#FF9800' };
    if (percentage >= 50) return { label: 'MOMENTUM', color: '#00E5FF' };
    if (percentage >= 25) return { label: 'WARMING UP', color: '#00E5FF' };
    if (percentage > 0) return { label: 'IN PROGRESS', color: '#00E5FF' };
    return { label: 'NOT STARTED', color: '#888888' };
  };

  const stage = getProgressStage();

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="relative h-52 w-52">
        {/* Celebration particles */}
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-[confetti-fall_2s_ease-out_forwards]"
                style={{
                  left: '50%',
                  top: '50%',
                  backgroundColor: ['#00E676', '#00E5FF', '#FFD700', '#FF9800'][i % 4],
                  transform: `rotate(${i * 30}deg) translateY(-60px)`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        )}

        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            className="dark:stroke-[rgba(42,42,46,0.4)] stroke-[rgba(200,200,200,0.5)]"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle with glow */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke={ringColor}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-700 ease-out ${
              showCelebration ? 'animate-[ring-celebration_0.5s_ease-in-out_3]' : ''
            }`}
            style={{
              filter: `drop-shadow(0 0 ${showCelebration ? '15px' : '8px'} ${glowColor})`
            }}
          />
          {/* Progress dot */}
          {percentage > 0 && (
            <circle
              cx={dotX}
              cy={dotY}
              r="6"
              fill={ringColor}
              className="transition-all duration-500"
              style={{
                filter: `drop-shadow(0 0 4px ${glowColor})`
              }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isComplete ? (
            <div className="text-center">
              <span className="text-4xl">🏆</span>
              <p
                className="text-3xl font-bold mt-1"
                style={{ color: ringColor }}
              >
                100%
              </p>
            </div>
          ) : (
            <>
              <p
                className="text-[44px] font-bold"
                style={{ color: ringColor }}
              >
                {percentage}%
              </p>
              <p className="text-[13px] dark:text-[#888888] text-[#666666] font-medium">
                {current}/{total} XP
              </p>
            </>
          )}
        </div>
      </div>

      {/* Status Badge with stage */}
      <div
        className={`px-5 py-2 rounded-full uppercase text-[11px] font-bold tracking-wider transition-all duration-500
          dark:bg-white/[0.06] bg-black/[0.04]
          dark:border dark:border-white/[0.1] border border-black/[0.08]
          ${showCelebration ? 'scale-110' : ''}`}
        style={{
          color: stage.color,
          boxShadow: isComplete ? `0 0 15px ${glowColor}` : undefined,
        }}
      >
        {stage.label}
      </div>
    </div>
  );
}
