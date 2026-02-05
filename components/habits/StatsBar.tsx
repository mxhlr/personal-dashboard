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
        label="Streak"
        value={streak}
        accentColor="text-orange-500"
      />
      <StatCard
        label="Level"
        value={level}
        accentColor="text-cyan-400"
      />
      <StatCard
        label="Week"
        value={`${weekCompleted}/7`}
        accentColor="text-green-500"
      />
      <StatCard
        label="Total XP"
        value={totalXP}
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
      <p className={`text-3xl font-bold ${accentColor}`}>
        {value}
      </p>
      <p className="text-xs mt-1 text-[#666666] dark:text-[#888888]">{label}</p>
    </div>
  );
}
