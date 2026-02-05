"use client";

interface StatsBarProps {
  streak: number;
  level: number;
  weekCompleted: number;
  totalXP: number;
}

export function StatsBar({ streak, level, weekCompleted, totalXP }: StatsBarProps) {
  return (
    <div className="grid grid-cols-4 gap-6">
      <StatCard
        label="🔥 STREAK"
        value={streak}
        accentColor="text-[#FF9800]"
      />
      <StatCard
        label="LEVEL"
        value={level}
        accentColor="text-[#00E5FF]"
      />
      <StatCard
        label="WEEK"
        value={`${weekCompleted}/5`}
        accentColor="text-[#00E676]"
      />
      <StatCard
        label="XP"
        value={totalXP.toLocaleString()}
        accentColor="text-[#FFD700]"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  accentColor,
}: {
  label: string;
  value: number | string;
  accentColor: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-[48px] font-bold ${accentColor}`}>
        {value}
      </p>
      <p
        className="text-[11px] mt-1 text-[#666] uppercase"
        style={{ letterSpacing: '2px' }}
      >
        {label}
      </p>
    </div>
  );
}
