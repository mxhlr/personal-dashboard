"use client";

import { useState } from "react";
import { WinConditionBanner } from "./WinConditionBanner";
import { StatsBar } from "./StatsBar";
import { ProgressRing } from "./ProgressRing";
import { HabitCategory } from "./HabitCategory";
import { PatternIntelligence } from "./PatternIntelligence";
import { MilestonePopup } from "./MilestonePopup";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data - will be replaced with real data
const MOCK_CATEGORIES = [
  {
    id: "1",
    icon: "💪",
    name: "Physical",
    habits: [
      { id: "1a", name: "Morning workout", xp: 25, completed: false },
      { id: "1b", name: "10k steps", xp: 15, completed: false },
      { id: "1c", name: "Stretch routine", xp: 10, completed: false },
      { id: "1d", name: "Evening walk", xp: 10, completed: false, isExtra: true },
    ],
  },
  {
    id: "2",
    icon: "🧠",
    name: "Mental",
    habits: [
      { id: "2a", name: "Read 30 min", xp: 20, completed: false },
      { id: "2b", name: "Meditation", xp: 15, completed: false },
      { id: "2c", name: "Journal", xp: 15, completed: false },
    ],
  },
  {
    id: "3",
    icon: "💼",
    name: "Work",
    habits: [
      { id: "3a", name: "Deep work session", xp: 30, completed: false },
      { id: "3b", name: "Review goals", xp: 10, completed: false },
      { id: "3c", name: "Plan tomorrow", xp: 10, completed: false },
    ],
  },
  {
    id: "4",
    icon: "🎯",
    name: "Personal",
    habits: [
      { id: "4a", name: "Learn new skill", xp: 25, completed: false },
      { id: "4b", name: "Connect with friend", xp: 15, completed: false },
      { id: "4c", name: "Creative project", xp: 20, completed: false },
    ],
  },
];

const MOCK_PATTERN_DATA = {
  lowCompletionHabits: [
    { name: "Evening walk", rate: 23 },
    { name: "Creative project", rate: 45 },
  ],
  commonSkipReasons: [
    { reason: "Not enough time", count: 12 },
    { reason: "Forgot", count: 8 },
  ],
  recommendations: [
    "Consider scheduling 'Evening walk' earlier in the day",
    "Set a reminder for habits you tend to forget",
    "Break down 'Creative project' into smaller tasks",
  ],
};

export function HabitDashboard() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const totalXP = categories.reduce(
    (sum, cat) =>
      sum + cat.habits.reduce((s, h) => s + (h.completed ? h.xp : 0), 0),
    0
  );

  const maxXP = categories.reduce(
    (sum, cat) => sum + cat.habits.reduce((s, h) => s + h.xp, 0),
    0
  );

  const progress = maxXP > 0 ? (totalXP / maxXP) * 100 : 0;

  const handleHabitToggle = (categoryName: string, habitId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.name === categoryName
          ? {
              ...cat,
              habits: cat.habits.map((h) =>
                h.id === habitId
                  ? {
                      ...h,
                      completed: !h.completed,
                      completedAt: !h.completed
                        ? new Date().toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        : undefined,
                    }
                  : h
              ),
            }
          : cat
      )
    );
  };

  const handleHabitSkip = (
    categoryName: string,
    habitId: string,
    reason: string
  ) => {
    console.log(`Skipped ${habitId} in ${categoryName}: ${reason}`);
  };

  const handleFinishDay = () => {
    console.log("Finishing day...");
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: 'var(--page-background)',
      }}
    >
      <MilestonePopup progress={progress} />
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <header className="space-y-2 text-center">
          <p
            className="font-bold dark:text-[#00E5FF] text-[#0077B6]"
            style={{
              fontFamily: 'var(--font-orbitron), "Courier New", monospace',
              fontSize: '56px',
              fontWeight: 700,
              letterSpacing: '2px',
            }}
          >
            {currentTime}
          </p>
          <p className="font-normal dark:text-[#E0E0E0] text-[#1A1A1A]" style={{ fontSize: '18px' }}>
            Execute.
          </p>
          <p style={{ fontSize: '14px' }}>
            <span className="text-[#999] font-normal">Sprint: </span>
            <span className="font-bold dark:text-[#E0E0E0] text-[#1A1A1A]">6h 14m</span>
          </p>
        </header>

        {/* Win Condition */}
        <WinConditionBanner />

        {/* Stats Bar */}
        <StatsBar streak={7} level={12} weekCompleted={5} totalXP={totalXP} />

        {/* Progress Ring */}
        <ProgressRing current={totalXP} total={maxXP} />

        {/* Habit Categories */}
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {categories.map((category, index) => (
              <HabitCategory
                key={category.id}
                icon={category.icon}
                name={category.name}
                habits={category.habits}
                categoryNumber={index + 1}
                onHabitToggle={handleHabitToggle}
                onHabitSkip={handleHabitSkip}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Pattern Intelligence */}
        <PatternIntelligence data={MOCK_PATTERN_DATA} />

        {/* Finish Day Button */}
        <Button
          onClick={handleFinishDay}
          size="lg"
          className="w-full bg-green-600 text-lg font-semibold text-white transition-colors hover:bg-green-700"
        >
          <span className="mr-2">🎊</span>
          Finish Day
        </Button>
      </div>
    </div>
  );
}
