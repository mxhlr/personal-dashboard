"use client";

interface StatsBarProps {
  streak: number;
  level: number;
  weekCompleted: number;
  totalXP: number;
}

export function StatsBar({ streak, level, weekCompleted, totalXP }: StatsBarProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        label="STREAK"
        value={streak}
        icon="🔥"
        accentColor="#FF9800"
        glowColor={streak >= 7 ? "rgba(255, 152, 0, 0.6)" : "rgba(255, 152, 0, 0.3)"}
        isHighlight={streak >= 7}
        showFlicker={streak > 0}
        streakLevel={streak >= 7 ? "fire" : "normal"}
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
  streakLevel,
}: {
  label: string;
  value: number | string;
  icon: string;
  accentColor: string;
  glowColor: string;
  isHighlight?: boolean;
  showFlicker?: boolean;
  streakLevel?: "normal" | "fire";
}) {
  return (
    <div
      className={`relative overflow-hidden p-4 text-center transition-all duration-300
        dark:bg-white/[0.03] bg-black/[0.02]
        dark:border-2 dark:border-white/[0.1] border-2 border-black/[0.08]
        hover:scale-[1.02] hover:shadow-lg group
        ${isHighlight ? 'animate-[neon-pulse_2s_ease-in-out_infinite]' : ''}`}
      style={{
        clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
        boxShadow: isHighlight ? `0 0 20px ${glowColor}, inset 0 0 20px ${glowColor}` : undefined,
        borderColor: isHighlight ? accentColor : undefined,
      }}
    >
      {/* Background glow effect */}
      <div
        className="absolute inset-0 opacity-10 blur-2xl"
        style={{ backgroundColor: accentColor }}
      />

      {/* Scanline effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity">
        <div className="absolute w-full h-[2px] bg-white/50 animate-[scanline_2s_linear_infinite]" />
      </div>

      {/* Content */}
      <div className="relative">
        <span
          className={`text-lg mb-1 inline-block ${showFlicker ? 'animate-[fire-flicker_0.5s_ease-in-out_infinite]' : ''} ${streakLevel === 'fire' ? 'scale-110' : ''}`}
          style={streakLevel === 'fire' ? { filter: 'drop-shadow(0 0 8px rgba(255, 152, 0, 0.8))' } : undefined}
        >
          {icon}
        </span>
        <p
          className="text-3xl md:text-4xl font-bold font-orbitron tracking-tight"
          style={{
            color: accentColor,
            textShadow: isHighlight ? `0 0 10px ${glowColor}` : undefined
          }}
        >
          {value}
        </p>
        <p
          className="text-[10px] mt-1 dark:text-[#888888] text-[#666666] uppercase font-semibold tracking-widest"
        >
          {label}
        </p>
      </div>
    </div>
  );
}
