"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WinConditionBanner } from "./WinConditionBanner";
import { StatsBar } from "./StatsBar";
import { ProgressRing } from "./ProgressRing";
import { HabitCategory } from "./HabitCategory";
import { PatternIntelligence } from "./PatternIntelligence";
import { MilestonePopup } from "./MilestonePopup";
import { SprintTimer } from "./SprintTimer";
import { LevelProgressBar } from "./LevelProgressBar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";

interface Habit {
  id: string;
  name: string;
  subtitle?: string;
  xp: number;
  completed: boolean;
  completedAt?: string;
  isExtra?: boolean;
  skipped?: boolean;
  skipReason?: string;
}

interface Category {
  id: string;
  icon: string;
  name: string;
  habits: Habit[];
}

export function HabitDashboardConnected() {
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  // Fetch data from Convex
  const userStats = useQuery(api.gamification.getUserStats);
  const categories = useQuery(api.habitCategories.listCategories);
  const habitTemplates = useQuery(api.habitTemplates.listTemplates, {});
  const dailyHabits = useQuery(api.dailyHabits.getHabitsForDate, { date: today });
  const patternData = useQuery(api.habitAnalytics.getPatternIntelligence, {});

  // Mutations
  const completeHabit = useMutation(api.gamification.completeHabit);
  const skipHabit = useMutation(api.gamification.skipHabit);
  const startCategoryTimer = useMutation(api.categoryTimeTracking.startCategoryTimer);
  const completeCategoryTimer = useMutation(api.categoryTimeTracking.completeCategoryTimer);

  const [currentTime, setCurrentTime] = useState("");
  const [localCategories, setLocalCategories] = useState<Category[]>([]);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Transform Convex data into local format
  useEffect(() => {
    if (!categories || !habitTemplates || !dailyHabits) return;

    const transformed = categories.map((cat) => {
      const templates = habitTemplates
        .filter((t) => t.categoryId === cat._id)
        .sort((a, b) => a.order - b.order); // Sort by order field

      const habits = templates.map((template) => {
        const daily = dailyHabits.find((d) => d.templateId === template._id);
        return {
          id: template._id,
          name: template.name,
          subtitle: template.subtitle,
          xp: template.xpValue,
          completed: daily?.completed || false,
          completedAt: daily?.completedAt,
          isExtra: !template.isCore,
          skipped: daily?.skipped || false,
          skipReason: daily?.skipReason,
        };
      });

      return {
        id: cat._id,
        icon: cat.icon,
        name: cat.name,
        habits,
      };
    });

    setLocalCategories(transformed);
  }, [categories, habitTemplates, dailyHabits]);

  const totalXP = localCategories.reduce(
    (sum, cat) =>
      sum + cat.habits.reduce((s, h) => s + (h.completed ? h.xp : 0), 0),
    0
  );

  const maxXP = localCategories.reduce(
    (sum, cat) => sum + cat.habits.reduce((s, h) => s + h.xp, 0),
    0
  );

  const progress = maxXP > 0 ? Math.round((totalXP / maxXP) * 100) : 0;

  const handleHabitToggle = async (categoryName: string, habitId: string) => {
    const category = localCategories.find((c) => c.name === categoryName);
    const habit = category?.habits.find((h) => h.id === habitId);

    if (!habit || !category) return;

    // Check category completion status BEFORE toggle
    const coreHabitsBeforeToggle = category.habits.filter((h) => !h.isExtra);
    const wasNoneCompleted = coreHabitsBeforeToggle.every((h) => !h.completed);

    try {
      // Toggle habit (completeHabit now works as a toggle)
      await completeHabit({
        templateId: habitId as Id<"habitTemplates">,
        date: today,
      });

      if (!habit.completed) {
        // Completing the habit
        toast({
          title: `+${habit.xp} XP`,
          description: `${habit.name} completed!`,
          duration: 2000,
        });

        // Check if category is now complete
        const updatedHabits = category.habits.map((h) =>
          h.id === habitId ? { ...h, completed: true } : h
        );
        const categoryComplete = updatedHabits
          .filter((h) => !h.isExtra)
          .every((h) => h.completed);

        // Start timer if this is the first habit in the category
        if (!habit.isExtra && wasNoneCompleted) {
          await startCategoryTimer({
            categoryId: category.id as Id<"habitCategories">,
            date: today,
          });
        }

        // Complete timer if category is now fully complete
        if (categoryComplete) {
          await completeCategoryTimer({
            categoryId: category.id as Id<"habitCategories">,
            date: today,
          });

          toast({
            title: `✓ ${categoryName} complete!`,
            description: "Great job! Keep the momentum going.",
            duration: 3000,
          });
        }
      } else {
        // Uncompleting the habit
        toast({
          title: `−${habit.xp} XP`,
          description: `${habit.name} uncompleted`,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Failed to toggle habit:", error);
      toast({
        title: "Error",
        description: "Failed to update habit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleHabitSkip = async (
    categoryName: string,
    habitId: string,
    reason: string
  ) => {
    try {
      await skipHabit({
        templateId: habitId as Id<"habitTemplates">,
        date: today,
        reason,
      });

      toast({
        title: "Habit skipped",
        description: `${reason}`,
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to skip habit:", error);
      toast({
        title: "Error",
        description: "Failed to skip habit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFinishDay = () => {
    // Calculate today's XP
    const todayXP = localCategories.reduce(
      (sum, cat) =>
        sum + cat.habits.reduce((s, h) => s + (h.completed ? h.xp : 0), 0),
      0
    );

    toast({
      title: "🎊 Day Complete!",
      description: `You earned ${todayXP} XP today! ${
        userStats && userStats.currentStreak > 0
          ? `🔥 ${userStats.currentStreak} day streak!`
          : ""
      }`,
      duration: 5000,
    });
  };

  // Show loading state
  if (!userStats || !categories || !habitTemplates) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600 dark:border-cyan-400"></div>
          <p className="text-muted-foreground">Loading your habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1" style={{ background: 'var(--page-background)' }}>
      <MilestonePopup progress={progress} />
      <div className="mx-auto max-w-4xl space-y-8 px-8 py-8">
        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <div className="flex-1 text-center space-y-1">
              <p
                className="font-[family-name:var(--font-orbitron)] text-[56px] font-bold text-[#0077B6] dark:text-[#00E5FF]"
                style={{ letterSpacing: '2px' }}
              >
                {currentTime}
              </p>
              <p className="text-lg font-normal text-[#1A1A1A] dark:text-[#E0E0E0]">Execute.</p>
            </div>
            <div className="flex-1" />
          </div>
          <SprintTimer />
        </header>

        {/* Progress Ring */}
        <ProgressRing current={totalXP} total={maxXP} />

        {/* Win Condition */}
        <WinConditionBanner />

        {/* Stats Bar */}
        <StatsBar
          streak={userStats.currentStreak}
          level={userStats.level}
          weekCompleted={userStats.weekScore}
          totalXP={userStats.totalXP % 1000}
          currentLevelXP={userStats.totalXP}
          nextLevelXP={1000}
        />

        {/* Level Progress Bar */}
        <LevelProgressBar
          level={userStats.level}
          currentXP={userStats.totalXP}
        />

        {/* Habit Categories */}
        <div className="space-y-6">
          {localCategories.map((category, index) => (
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

        {/* Pattern Intelligence - only show real data */}
        {patternData && (
          <PatternIntelligence
            data={{
              lowCompletionHabits: patternData.lowCompletionHabits,
              commonSkipReasons: patternData.commonSkipReasons,
              recommendations: patternData.recommendations,
            }}
          />
        )}

        {/* Finish Day Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleFinishDay}
            size="lg"
            className="px-12 py-6 bg-[#00E676] dark:text-black text-black font-bold font-orbitron uppercase tracking-wider text-sm
              border border-[#00E676]/50 shadow-sm
              hover:bg-[#00C853] hover:shadow-md hover:scale-[1.02]
              transition-all duration-300"
          >
            🎊 Finish Day
          </Button>
        </div>
      </div>

    </div>
  );
}
