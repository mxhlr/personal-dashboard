"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  TrendingUp,
  MessageSquare,
  Image as ImageIcon,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import { TodaysWinCondition } from "./TodaysWinCondition";

interface DashboardProps {
  onNavigate: (tab: "visionboard" | "planning" | "data" | "coach") => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const profile = useQuery(api.userProfile.getUserProfile);
  const userStats = useQuery(api.gamification.getUserStats);
  const dailyHabits = useQuery(api.dailyHabits.getHabitsForDate, { date: today });
  const habitTemplates = useQuery(api.habitTemplates.listTemplates, {});
  const visionboardImages = useQuery(api.visionboard.getAllImages);

  if (!profile || !userStats || !dailyHabits || !habitTemplates) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Calculate today's progress
  const totalHabits = habitTemplates.length;
  const completedHabits = dailyHabits.filter((h) => h.completed).length;
  const todayProgress = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
  const todayXP = dailyHabits.reduce((sum, h) => sum + (h.completed ? h.xpEarned : 0), 0);
  const todayComplete = todayProgress === 100;

  const visionboardPreview = visionboardImages?.slice(0, 4) || [];
  const hasVisionboardImages = visionboardImages && visionboardImages.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">
          Welcome back, {profile.name}! 👋
        </h1>
        <p className="text-lg text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Today's Win Condition */}
      <TodaysWinCondition />

      {/* North Stars - Compact Single Row */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              💰 WEALTH
            </p>
            <p className="text-sm">{profile.northStars.wealth}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              🏃 HEALTH
            </p>
            <p className="text-sm">{profile.northStars.health}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              ❤️ LOVE
            </p>
            <p className="text-sm">{profile.northStars.love}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              😊 HAPPINESS
            </p>
            <p className="text-sm">{profile.northStars.happiness}</p>
          </div>
        </div>
      </Card>

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Log - Improved */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Today&apos;s Log</h3>
            </div>

            {todayComplete ? (
              <>
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Tag abgeschlossen ✓</p>
                    <p className="text-sm text-muted-foreground">{todayProgress}% • {todayXP} XP</p>
                  </div>
                </div>
                <Button
                  onClick={() => onNavigate("planning")}
                  variant="outline"
                  className="w-full"
                >
                  Details ansehen →
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16">
                    {/* Simple Progress Ring */}
                    <svg className="h-16 w-16 -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - todayProgress / 100)}`}
                        className="text-primary"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">{todayProgress}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{completedHabits}/{totalHabits} Habits erledigt</p>
                    <p className="text-sm text-muted-foreground">{todayXP} XP earned</p>
                  </div>
                </div>
                <Button
                  onClick={() => onNavigate("planning")}
                  className="w-full"
                >
                  Zum Sprint →
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Weekly Progress - Improved */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Weekly Progress</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold">{userStats.weekScore}/7 Days</p>
                <p className="text-sm text-muted-foreground">Diese Woche</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-primary">{userStats.totalXP} XP</p>
                <p className="text-sm text-muted-foreground">Diese Woche</p>
              </div>
              <div>
                <p className="text-lg font-semibold">🔥 {userStats.currentStreak} Tage Streak</p>
              </div>
            </div>
            <Button
              onClick={() => onNavigate("data")}
              variant="outline"
              className="w-full"
            >
              View All Data →
            </Button>
          </div>
        </Card>

        {/* Visionboard Preview */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Visionboard</h3>
            </div>
            {hasVisionboardImages ? (
              <div className="flex gap-2 overflow-hidden">
                {visionboardPreview.map((image) => (
                  <div
                    key={image._id}
                    className="w-20 h-20 rounded-lg overflow-hidden bg-muted relative flex-shrink-0"
                  >
                    <Image
                      src={image.url}
                      alt="Vision"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No images yet</p>
            )}
            <Button
              onClick={() => onNavigate("visionboard")}
              variant="outline"
              className="w-full"
            >
              {hasVisionboardImages ? "Zum Visionboard" : "Add Images"}
            </Button>
          </div>
        </Card>

        {/* Coach Quick Access */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI Coach</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Get personalized guidance and support
            </p>
            <Button
              onClick={() => onNavigate("coach")}
              variant="outline"
              className="w-full"
            >
              Start Chat
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
