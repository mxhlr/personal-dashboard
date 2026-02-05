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
  onNavigate: (tab: "daily-log" | "visionboard" | "planning" | "data" | "coach") => void;
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
    <div
      className="min-h-[calc(100vh-64px)] relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #12121F 0%, #0A0A0F 100%)'
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

      <div className="relative max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold font-orbitron dark:text-[#00E5FF] text-[#0077B6]">
            Welcome back, {profile.name}! 👋
          </h1>
          <p
            className="text-lg dark:text-[#888888] text-[#666666]"
            style={{
              fontFamily: '"Courier New", "Monaco", monospace'
            }}
          >
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

      {/* Today's Win Condition */}
      <TodaysWinCondition />

        {/* North Stars - Gaming HUD Style */}
        <Card className="p-6 border dark:border-border/50 border-border/30 dark:bg-card/50 bg-white/80 shadow-sm hover:shadow-xl transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%), rgba(26, 26, 26, 0.5)',
            borderRadius: '16px'
          }}
        >
          <div className="flex items-center justify-center gap-12 flex-wrap">
            <div className="text-center">
              <p className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-2">
                💰 WEALTH
              </p>
              <p className="text-sm dark:text-[#E0E0E0] text-[#1A1A1A] font-medium">{profile.northStars.wealth}</p>
            </div>
            <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent opacity-40" />
            <div className="text-center">
              <p className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-2">
                🏃 HEALTH
              </p>
              <p className="text-sm dark:text-[#E0E0E0] text-[#1A1A1A] font-medium">{profile.northStars.health}</p>
            </div>
            <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent opacity-40" />
            <div className="text-center">
              <p className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-2">
                ❤️ LOVE
              </p>
              <p className="text-sm dark:text-[#E0E0E0] text-[#1A1A1A] font-medium">{profile.northStars.love}</p>
            </div>
            <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent opacity-40" />
            <div className="text-center">
              <p className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-2">
                😊 HAPPINESS
              </p>
              <p className="text-sm dark:text-[#E0E0E0] text-[#1A1A1A] font-medium">{profile.northStars.happiness}</p>
            </div>
          </div>
        </Card>

        {/* Main Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Log - Gaming HUD Style */}
          <Card className="p-6 border dark:border-border/50 border-border/30 dark:bg-card/50 bg-white/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#00E5FF]" />
                <h3 className="font-bold font-orbitron text-[#00E5FF]">Today&apos;s Log</h3>
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
                  onClick={() => onNavigate("daily-log")}
                  variant="outline"
                  className="w-full border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10 font-orbitron uppercase tracking-wider text-xs"
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
                  onClick={() => onNavigate("daily-log")}
                  className="w-full bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] text-white font-bold font-orbitron uppercase tracking-wider text-xs
                    border border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.3)]
                    hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] hover:scale-105
                    transition-all duration-300"
                >
                  Zum Daily Log →
                </Button>
              </>
            )}
          </div>
        </Card>

          {/* Weekly Progress - Gaming HUD Style */}
          <Card className="p-6 border dark:border-border/50 border-border/30 dark:bg-card/50 bg-white/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#00E676]" />
                <h3 className="font-bold font-orbitron text-[#00E676]">Weekly Progress</h3>
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
                className="w-full border-[#00E676]/30 text-[#00E676] hover:bg-[#00E676]/10 font-orbitron uppercase tracking-wider text-xs"
              >
                View All Data →
              </Button>
            </div>
          </Card>

          {/* Visionboard Preview - Gaming HUD Style */}
          <Card className="p-6 border dark:border-border/50 border-border/30 dark:bg-card/50 bg-white/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#8B5CF6]" />
                <h3 className="font-bold font-orbitron text-[#8B5CF6]">Visionboard</h3>
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
                className="w-full border-[#8B5CF6]/30 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 font-orbitron uppercase tracking-wider text-xs"
              >
                {hasVisionboardImages ? "Zum Visionboard" : "Add Images"}
              </Button>
            </div>
          </Card>

          {/* Coach Quick Access - Gaming HUD Style */}
          <Card className="p-6 border dark:border-border/50 border-border/30 dark:bg-card/50 bg-white/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#FF9800]" />
                <h3 className="font-bold font-orbitron text-[#FF9800]">AI Coach</h3>
              </div>
            <p className="text-sm text-muted-foreground">
              Get personalized guidance and support
            </p>
              <Button
                onClick={() => onNavigate("coach")}
                variant="outline"
                className="w-full border-[#FF9800]/30 text-[#FF9800] hover:bg-[#FF9800]/10 font-orbitron uppercase tracking-wider text-xs"
              >
                Start Chat
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
