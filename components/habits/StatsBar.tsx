"use client";

interface StatsBarProps {
  streak: number;
  level: number;
  weekCompleted: number;
  totalXP: number;
}

export function StatsBar({ streak, level, weekCompleted, totalXP }: StatsBarProps) {
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
      <div className="h-8 w-[2px] dark:bg-white/10 bg-black/10" />
      <StatItem
        label="LEVEL"
        value={level}
        icon="⚡"
        accentColor="#00E5FF"
      />
      <div className="h-8 w-[2px] dark:bg-white/10 bg-black/10" />
      <StatItem
        label="WEEK"
        value={`${weekCompleted}/5`}
        icon="📅"
        accentColor="#00E676"
        isHighlight={weekCompleted >= 5}
      />
      <div className="h-8 w-[2px] dark:bg-white/10 bg-black/10" />
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
}: {
  label: string;
  value: number | string;
  icon: string;
  accentColor: string;
  isHighlight?: boolean;
  showFlicker?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 text-center">
      {/* Icon */}
      <span
        className={`text-2xl ${showFlicker ? 'animate-[fire-flicker_0.5s_ease-in-out_infinite]' : ''}`}
        style={isHighlight ? { filter: 'drop-shadow(0 0 4px rgba(255, 152, 0, 0.4))' } : undefined}
      >
        {icon}
      </span>

      {/* Value + Label */}
      <div className="flex flex-col items-start">
        <p
          className="text-3xl font-bold font-orbitron leading-none"
          style={{
            color: accentColor,
            textShadow: isHighlight ? `0 0 6px ${accentColor}` : `0 0 3px ${accentColor}`
          }}
        >
          {value}
        </p>
        <p className="text-[9px] dark:text-[#888888] text-[#666666] uppercase font-semibold font-orbitron tracking-widest mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}
