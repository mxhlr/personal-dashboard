"use client";

interface StatsBarProps {
  streak: number;
  level: number;
  weekCompleted: number;
  totalXP: number;
}

export function StatsBar({ streak, level, weekCompleted, totalXP }: StatsBarProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <StatCard
        label="STREAK"
        value={streak}
        icon="🔥"
        accentColor="#FF9800"
        glowColor="rgba(255, 152, 0, 0.3)"
        isHighlight={streak >= 7}
        showFlicker={streak > 0}
      />
      <StatCard
        label="LEVEL"
        value={level}
        icon="⚡"
        accentColor="#00E5FF"
        glowColor="rgba(0, 229, 255, 0.3)"
        isHighlight={false}
      />
      <StatCard
        label="WEEK"
        value={`${weekCompleted}/5`}
        icon="📅"
        accentColor="#00E676"
        glowColor="rgba(0, 230, 118, 0.3)"
        isHighlight={weekCompleted >= 5}
      />
      <StatCard
        label="XP"
        value={totalXP.toLocaleString()}
        icon="✨"
        accentColor="#FFD700"
        glowColor="rgba(255, 215, 0, 0.3)"
        isHighlight={false}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accentColor,
  glowColor,
  isHighlight,
  showFlicker,
}: {
  label: string;
  value: number | string;
  icon: string;
  accentColor: string;
  glowColor: string;
  isHighlight?: boolean;
  showFlicker?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-4 text-center transition-all duration-300
        dark:bg-white/[0.03] bg-black/[0.02]
        dark:border dark:border-white/[0.06] border border-black/[0.04]
        hover:scale-[1.02] hover:shadow-lg
        ${isHighlight ? 'animate-[stat-glow_2s_ease-in-out_infinite]' : ''}`}
      style={{
        boxShadow: isHighlight ? `0 0 20px ${glowColor}` : undefined,
      }}
    >
      {/* Background glow effect */}
      <div
        className="absolute inset-0 opacity-10 blur-2xl"
        style={{ backgroundColor: accentColor }}
      />

      {/* Content */}
      <div className="relative">
        <span
          className={`text-lg mb-1 inline-block ${showFlicker ? 'animate-[fire-flicker_0.5s_ease-in-out_infinite]' : ''}`}
        >
          {icon}
        </span>
        <p
          className="text-3xl md:text-4xl font-bold"
          style={{ color: accentColor }}
        >
          {value}
        </p>
        <p
          className="text-[10px] mt-1 dark:text-[#888888] text-[#666666] uppercase font-semibold"
          style={{ letterSpacing: '1.5px' }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
