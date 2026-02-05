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
        icon="🔥"
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
        accentColor="text-purple-400"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accentColor,
}: {
  icon?: string;
  label: string;
  value: number | string;
  accentColor: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-4 transition-colors hover:bg-card/80">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-2xl font-semibold ${accentColor}`}>
          {icon && <span className="mr-1">{icon}</span>}
          {value}
        </p>
      </div>
    </div>
  );
}
