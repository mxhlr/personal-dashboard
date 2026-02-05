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
        className="min-h-[calc(100vh-64px)]"
        style={{
          background: 'radial-gradient(ellipse at center, var(--daily-log-bg-start) 0%, var(--daily-log-bg-end) 100%)'
        }}
      >
        <HabitDashboardConnected />
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
