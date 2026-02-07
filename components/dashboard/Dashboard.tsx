"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle2,
  Target,
  TrendingUp
} from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { TodaysWinCondition } from "./TodaysWinCondition";
import { StoicQuote } from "./StoicQuote";
import { ReviewNotificationBar } from "./ReviewNotificationBar";
import { WeeklyProgressTracker } from "./WeeklyProgressTracker";
import { QuickStatsBadge } from "./QuickStatsBadge";
import { VisionboardCarousel } from "./VisionboardCarousel";
import { WeeklyGoalsWidget } from "./WeeklyGoalsWidget";
import { MonthlyOKRProgress } from "./MonthlyOKRProgress";

interface DashboardProps {
  onNavigate: (tab: "daily-log" | "visionboard" | "planning" | "data" | "okr") => void;
}

// Simplified greeting arrays
const MORNING_GREETINGS = [
  "Good morning", "Rise and shine", "Fresh start", "New day"
];

const AFTERNOON_GREETINGS = [
  "Good afternoon", "Keep pushing", "Halfway there", "Making progress"
];

const EVENING_GREETINGS = [
  "Good evening", "Finishing strong", "Winding down", "Almost there"
];

const NIGHT_GREETINGS = [
  "Burning midnight oil", "Late night hustle", "Night owl mode", "Still grinding"
];

function getDynamicGreeting(name: string): string {
  const now = new Date();
  const hour = now.getHours();
  const timeBlock = Math.floor(hour / 2);

  let greetingsTemplate = MORNING_GREETINGS;

  if (hour >= 5 && hour < 12) {
    greetingsTemplate = MORNING_GREETINGS;
  } else if (hour >= 12 && hour < 18) {
    greetingsTemplate = AFTERNOON_GREETINGS;
  } else if (hour >= 18 && hour < 23) {
    greetingsTemplate = EVENING_GREETINGS;
  } else {
    greetingsTemplate = NIGHT_GREETINGS;
  }

  const greetingIndex = timeBlock % greetingsTemplate.length;
  return `${greetingsTemplate[greetingIndex]}, ${name}`;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const profile = useQuery(api.userProfile.getUserProfile);
  const userStats = useQuery(api.gamification.getUserStats);
  const dailyHabits = useQuery(api.dailyHabits.getHabitsForDate, { date: today });
  const habitTemplates = useQuery(api.habitTemplates.listTemplates, {});
  const visionboardImages = useQuery(api.visionboard.getAllImages);

  const greeting = useMemo(
    () => profile ? getDynamicGreeting(profile.name) : "",
    [profile]
  );

  const habitStats = useMemo(() => {
    if (!dailyHabits || !habitTemplates) {
      return {
        coreHabits: [],
        totalHabits: 0,
        completedHabits: 0,
        completedCore: 0,
        todayProgress: 0,
        todayXP: 0,
        coreComplete: false,
        todayComplete: false,
      };
    }

    const coreHabits = habitTemplates.filter((h) => h.isCore);
    const totalHabits = habitTemplates.length;
    const completedHabits = dailyHabits.filter((h) => h.completed).length;
    const completedCore = dailyHabits.filter(
      (h) => h.completed && habitTemplates.find(t => t._id === h.templateId)?.isCore
    ).length;
    const todayProgress = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
    const todayXP = dailyHabits.reduce((sum, h) => sum + (h.completed ? h.xpEarned : 0), 0);
    const coreComplete = completedCore === coreHabits.length && coreHabits.length > 0;
    const todayComplete = todayProgress === 100;

    return {
      coreHabits,
      totalHabits,
      completedHabits,
      completedCore,
      todayProgress,
      todayXP,
      coreComplete,
      todayComplete,
    };
  }, [dailyHabits, habitTemplates]);

  const progressRingProps = useMemo(() => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - habitStats.todayProgress / 100);
    return {
      circumference,
      strokeDashoffset,
    };
  }, [habitStats.todayProgress]);

  const {
    totalHabits,
    completedHabits,
    todayProgress,
    todayXP,
    coreComplete,
    todayComplete,
  } = habitStats;

  if (!profile || !userStats || !dailyHabits || !habitTemplates) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        {/* Clean Header */}
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            {greeting}
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </header>

        {/* Review Notifications + Weekly Progress */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardContent className="p-6">
              <ReviewNotificationBar />
            </CardContent>
          </Card>

          <Card className="shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardContent className="p-6">
              <WeeklyProgressTracker />
            </CardContent>
          </Card>
        </div>

        {/* Win Condition & Stoic Quote */}
        <div className="grid gap-6 md:grid-cols-2">
          <StoicQuote />
          <TodaysWinCondition />
        </div>

        {/* Weekly Goals Widget */}
        <WeeklyGoalsWidget />

        {/* Monthly OKR Progress Widget */}
        <MonthlyOKRProgress />

        {/* North Stars - Clean Version */}
        <Card className="shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">North Stars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Wealth
                  </p>
                </div>
                <p className="text-sm leading-relaxed">{profile.northStars.wealth}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏃</span>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Health
                  </p>
                </div>
                <p className="text-sm leading-relaxed">{profile.northStars.health}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">❤️</span>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Love
                  </p>
                </div>
                <p className="text-sm leading-relaxed">{profile.northStars.love}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">😊</span>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Happiness
                  </p>
                </div>
                <p className="text-sm leading-relaxed">{profile.northStars.happiness}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Log + Quick Stats */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's Log - Compact Version */}
          <Card className={`shadow-sm transition-all duration-200 ${
            todayComplete
              ? 'border-yellow-500/20 hover:shadow-yellow-500/10'
              : coreComplete
                ? 'border-green-500/20 hover:shadow-green-500/10'
                : 'hover:shadow-md'
          }`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold">Today&apos;s Log</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayComplete ? (
                <>
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="h-10 w-10 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                        Perfect Day ✨
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {todayProgress}% • {todayXP} XP
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => onNavigate("daily-log")}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-600 hover:to-amber-600 transition-all duration-200"
                  >
                    Celebration Mode ✨
                  </Button>
                </>
              ) : coreComplete ? (
                <>
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-500">
                        Solid Day ✓
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Core done • Extras open
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => onNavigate("daily-log")}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                  >
                    Complete Extras →
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16">
                      <svg className="h-16 w-16 -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-muted/30"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={progressRingProps.circumference}
                          strokeDashoffset={progressRingProps.strokeDashoffset}
                          className="text-primary transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-semibold">{todayProgress}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {completedHabits}/{totalHabits} Habits
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {todayXP} XP earned
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => onNavigate("daily-log")}
                    className="w-full transition-all duration-200"
                  >
                    Go to Daily Log →
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Badge */}
          <QuickStatsBadge />
        </div>

        {/* Visionboard Carousel */}
        <VisionboardCarousel />
      </div>
    </div>
  );
}
