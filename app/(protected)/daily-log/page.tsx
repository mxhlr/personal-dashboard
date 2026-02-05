"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { HabitDashboardConnected } from "@/components/habits/HabitDashboardConnected";
import { SettingsModal } from "@/components/settings/SettingsModal";

type ReviewType = "weekly" | "monthly" | "quarterly" | "annual";

export default function DailyLogPage() {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedReview] = useState<ReviewType>("weekly");

  const handleTabChange = (tab: "dashboard" | "daily-log" | "visionboard" | "planning" | "data" | "coach") => {
    if (tab === "daily-log") {
      // Already on daily-log page
      return;
    } else if (tab === "dashboard") {
      router.push("/");
    } else {
      router.push(`/?tab=${tab}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        activeTab="daily-log"
        onTabChange={handleTabChange}
        onSettingsClick={() => setSettingsOpen(true)}
        selectedReview={selectedReview}
      />

      <div
        className="min-h-[calc(100vh-64px)] relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at center, var(--daily-log-bg-start) 0%, var(--daily-log-bg-end) 100%)'
        }}
      >
        {/* Subtle grid overlay for HUD effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 229, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 229, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Animated scanline effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            background: 'linear-gradient(transparent 40%, rgba(0, 229, 255, 0.2) 50%, transparent 60%)',
            backgroundSize: '100% 4px',
            animation: 'scanline 8s linear infinite'
          }}
        />

        <HabitDashboardConnected />
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
