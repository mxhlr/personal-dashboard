"use client";

interface StatsBarProps {
  streak: number;
  level: number;
  weekCompleted: number;
  totalXP: number;
  currentLevelXP?: number;
  nextLevelXP?: number;
}

export function StatsBar({ streak, level, weekCompleted, totalXP, currentLevelXP = 0, nextLevelXP = 1000 }: StatsBarProps) {
  const levelProgress = ((currentLevelXP % nextLevelXP) / nextLevelXP) * 100;
  const weekProgress = (weekCompleted / 5) * 100;

  return (
    <div className="flex items-center justify-center gap-8 py-4">
      <StatItem
        label="STREAK"
        value={streak}
        icon="🔥"
        accentColor="#FF9800"
        isHighlight={streak >= 7}
        showFlicker={streak > 0}
      />
      {/* Tactical divider with glow */}
      <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent opacity-40" />
      <StatItem
        label="LEVEL"
        value={level}
        icon="⚡"
        accentColor="#00E5FF"
        progressPercent={levelProgress}
      />
      <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent opacity-40" />
      <StatItem
        label="WEEK"
        value={`${weekCompleted}/5`}
        icon="📅"
        accentColor="#00E676"
        isHighlight={weekCompleted >= 5}
        progressPercent={weekProgress}
      />
      <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent opacity-40" />
      <StatItem
        label="XP"
        value={totalXP.toLocaleString()}
        icon="✨"
        accentColor="#FFD700"
      />
    </div>
  );
}

function StatItem({
  label,
  value,
  icon,
  accentColor,
  isHighlight,
  showFlicker,
  progressPercent,
}: {
  label: string;
  value: number | string;
  icon: string;
  accentColor: string;
  isHighlight?: boolean;
  showFlicker?: boolean;
  progressPercent?: number;
}) {
  return (
    <div className="flex items-center gap-3 text-center">
      {/* Icon */}
      <span
        className={`text-2xl ${showFlicker ? 'animate-[fire-flicker_0.5s_ease-in-out_infinite]' : ''}`}
        style={isHighlight ? {
          filter: 'drop-shadow(0 0 8px rgba(255, 152, 0, 0.6)) drop-shadow(0 0 16px rgba(255, 152, 0, 0.4))',
          animation: 'neon-pulse 2s ease-in-out infinite'
        } : undefined}
      >
        {icon}
      </span>

      {/* Value + Label + Mini Progress Bar */}
      <div className="flex flex-col items-start gap-1">
        <p
          className="text-3xl font-bold leading-none"
          style={{
            color: accentColor,
            textShadow: isHighlight ? `0 0 6px ${accentColor}` : `0 0 3px ${accentColor}`,
            fontFamily: '"Courier New", "Monaco", monospace',
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {value}
        </p>
        <p className="text-[9px] dark:text-[#888888] text-[#666666] uppercase font-semibold font-orbitron tracking-widest">
          {label}
        </p>
        {/* Mini progress bar */}
        {progressPercent !== undefined && (
          <div className="w-full h-[3px] dark:bg-white/5 bg-black/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: accentColor,
                boxShadow: `0 0 4px ${accentColor}`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
