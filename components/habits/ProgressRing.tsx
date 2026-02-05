"use client";

interface ProgressRingProps {
  current: number;
  total: number;
}

export function ProgressRing({ current, total }: ProgressRingProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const isComplete = percentage === 100;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Calculate dot position (starts at top, moves clockwise)
  const angle = (percentage / 100) * 360 - 90; // -90 to start at top
  const angleRad = (angle * Math.PI) / 180;
  const dotX = 100 + 90 * Math.cos(angleRad);
  const dotY = 100 + 90 * Math.sin(angleRad);

  const ringColor = isComplete ? '#00E676' : '#00E5FF';
  const glowColor = isComplete ? 'rgba(0, 230, 118, 0.4)' : 'rgba(0, 229, 255, 0.4)';

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative h-48 w-48">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="rgba(42, 42, 46, 0.4)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle with glow */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke={ringColor}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`
            }}
          />
          {/* Progress dot */}
          {percentage > 0 && (
            <circle
              cx={dotX}
              cy={dotY}
              r="5"
              fill={ringColor}
              className="transition-all duration-500"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p
            className="text-[40px] font-bold"
            style={{ color: ringColor }}
          >
            {percentage}%
          </p>
          <p className="text-[14px] dark:text-[#888888] text-[#666666]">
            {current}/{total}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div
        className="px-5 py-1.5 rounded-2xl uppercase text-[12px] font-medium dark:bg-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.15)] border-[rgba(0,0,0,0.15)]"
        style={{
          letterSpacing: '2px',
          color: isComplete ? '#00E676' : undefined
        }}
      >
        <span className={isComplete ? '' : 'dark:text-[#888888] text-[#666666]'}>
          {isComplete ? 'COMPLETE' : 'IN PROGRESS'}
        </span>
      </div>
    </div>
  );
}
