"use client";

import { HabitDashboardConnected } from "@/components/habits/HabitDashboardConnected";

export default function DailyLogPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'radial-gradient(ellipse at center, var(--daily-log-bg-start) 0%, var(--daily-log-bg-end) 100%)'
      }}
    >
      <HabitDashboardConnected />
    </div>
  );
}
