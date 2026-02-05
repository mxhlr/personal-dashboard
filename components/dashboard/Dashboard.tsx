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
import { StoicQuote } from "./StoicQuote";

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
  const coreHabits = habitTemplates.filter((h) => !h.isExtra);
  const extraHabits = habitTemplates.filter((h) => h.isExtra);
  const totalHabits = habitTemplates.length;
  const completedHabits = dailyHabits.filter((h) => h.completed).length;
  const completedCore = dailyHabits.filter((h) => h.completed && !habitTemplates.find(t => t._id === h.templateId)?.isExtra).length;
  const todayProgress = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
  const todayXP = dailyHabits.reduce((sum, h) => sum + (h.completed ? h.xpEarned : 0), 0);
  const coreComplete = completedCore === coreHabits.length && coreHabits.length > 0;
  const todayComplete = todayProgress === 100; // Core + Extra all done = PERFECT DAY (Gold)

  const visionboardPreview = visionboardImages?.slice(0, 4) || [];
  const hasVisionboardImages = visionboardImages && visionboardImages.length > 0;

  return (
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

      <div className="relative max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-3 mb-2">
          <h1 className="text-5xl font-bold font-orbitron dark:text-[#00E5FF] text-[#0077B6]"
            style={{
              textShadow: '0 0 30px rgba(0, 229, 255, 0.2)'
            }}
          >
            Welcome back, {profile.name}! 👋
          </h1>
          <p
            className="text-lg dark:text-[#888888] text-[#666666]"
            style={{
              fontFamily: '"Courier New", "Monaco", monospace',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

      {/* Today's Win Condition */}
      <TodaysWinCondition />

      {/* Daily Stoic Quote */}
      <StoicQuote />

        {/* North Stars - Gaming HUD Style */}
        <Card className="p-8 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-card/50 bg-white/80
          shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
          dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)]
          dark:hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:shadow-[0_8px_30px_rgba(0,180,220,0.2)]
          hover:scale-[1.005]"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%), rgba(26, 26, 26, 0.5)'
          }}
        >
          <div className="flex items-center justify-center gap-16 flex-wrap">
            <div className="text-center group cursor-default">
              <p className="text-xs font-bold font-orbitron uppercase tracking-widest dark:text-[#888888] text-[#666666] mb-3 group-hover:dark:text-[#00E5FF] group-hover:text-[#0077B6] transition-colors duration-200">
                💰 WEALTH
              </p>
              <p className="text-base dark:text-[#E0E0E0] text-[#1A1A1A] font-semibold leading-relaxed">{profile.northStars.wealth}</p>
            </div>
            <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent opacity-30" />
            <div className="text-center group cursor-default">
              <p className="text-xs font-bold font-orbitron uppercase tracking-widest dark:text-[#888888] text-[#666666] mb-3 group-hover:dark:text-[#00E5FF] group-hover:text-[#0077B6] transition-colors duration-200">
                🏃 HEALTH
              </p>
              <p className="text-base dark:text-[#E0E0E0] text-[#1A1A1A] font-semibold leading-relaxed">{profile.northStars.health}</p>
            </div>
            <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent opacity-30" />
            <div className="text-center group cursor-default">
              <p className="text-xs font-bold font-orbitron uppercase tracking-widest dark:text-[#888888] text-[#666666] mb-3 group-hover:dark:text-[#00E5FF] group-hover:text-[#0077B6] transition-colors duration-200">
                ❤️ LOVE
              </p>
              <p className="text-base dark:text-[#E0E0E0] text-[#1A1A1A] font-semibold leading-relaxed">{profile.northStars.love}</p>
            </div>
            <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent opacity-30" />
            <div className="text-center group cursor-default">
              <p className="text-xs font-bold font-orbitron uppercase tracking-widest dark:text-[#888888] text-[#666666] mb-3 group-hover:dark:text-[#00E5FF] group-hover:text-[#0077B6] transition-colors duration-200">
                😊 HAPPINESS
              </p>
              <p className="text-base dark:text-[#E0E0E0] text-[#1A1A1A] font-semibold leading-relaxed">{profile.northStars.happiness}</p>
            </div>
          </div>
        </Card>

        {/* Main Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Today's Log - Gaming HUD Style */}
          <Card
            className={`p-6 dark:bg-card/50 bg-white/80
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            ${todayComplete
              ? 'dark:border-[rgba(255,215,0,0.3)] border-[rgba(255,215,0,0.4)] dark:hover:border-[rgba(255,215,0,0.4)] hover:border-[rgba(255,215,0,0.5)] dark:hover:shadow-[0_0_40px_rgba(255,215,0,0.3)] hover:shadow-[0_8px_40px_rgba(255,215,0,0.4)]'
              : coreComplete
                ? 'dark:border-[rgba(0,230,118,0.25)] border-[rgba(76,175,80,0.3)] dark:hover:border-[rgba(0,230,118,0.35)] hover:border-[rgba(76,175,80,0.4)] dark:hover:shadow-[0_0_35px_rgba(0,230,118,0.25)] hover:shadow-[0_8_35px_rgba(76,175,80,0.3)]'
                : 'dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:hover:border-[rgba(0,229,255,0.25)] hover:border-[rgba(0,180,220,0.3)] dark:hover:shadow-[0_0_30px_rgba(0,229,255,0.2)] hover:shadow-[0_8px_30px_rgba(0,180,220,0.25)]'
            }`"
            style={{
              background: todayComplete
                ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(0, 230, 118, 0.06) 100%), rgba(26, 26, 26, 0.5)'
                : coreComplete
                  ? 'linear-gradient(135deg, rgba(0, 230, 118, 0.08) 0%, rgba(0, 229, 255, 0.04) 100%), rgba(26, 26, 26, 0.5)'
                  : 'linear-gradient(135deg, rgba(0, 229, 255, 0.05) 0%, rgba(26, 26, 26, 0.5) 100%)'
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 dark:text-[#00E5FF] text-[#0077B6]" />
                <h3 className="font-bold font-orbitron dark:text-[#00E5FF] text-[#0077B6]">Today&apos;s Log</h3>
              </div>

            {todayComplete ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <CheckCircle2
                      className="h-12 w-12 dark:text-[#FFD700] text-[#FFA500]"
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))',
                        animation: 'neon-pulse 2s ease-in-out infinite'
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium font-orbitron dark:text-[#FFD700] text-[#FFA500]"
                      style={{
                        textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                      }}
                    >
                      PERFECT DAY ✨
                    </p>
                    <p className="text-sm dark:text-[#888888] text-[#666666]">
                      <span className="font-orbitron" style={{ fontVariantNumeric: 'tabular-nums' }}>{todayProgress}%</span>
                      {' • '}
                      <span className="font-orbitron" style={{ fontVariantNumeric: 'tabular-nums' }}>{todayXP}</span>
                      {' '}XP
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => onNavigate("daily-log")}
                  className="w-full dark:bg-gradient-to-r dark:from-[#FFD700] dark:to-[#FFA500] bg-gradient-to-r from-[#FFA500] to-[#FF8C00]
                    text-black font-bold font-orbitron uppercase tracking-wider text-xs
                    dark:shadow-[0_0_20px_rgba(255,215,0,0.4)] shadow-[0_4px_15px_rgba(255,165,0,0.4)]
                    dark:hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] hover:shadow-[0_6px_25px_rgba(255,165,0,0.6)] hover:scale-105
                    transition-all duration-300"
                >
                  Celebration Mode ✨
                </Button>
              </>
            ) : coreComplete ? (
              <>
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="h-12 w-12 dark:text-[#00E676] text-[#4CAF50]"
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(0, 230, 118, 0.5))'
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium font-orbitron dark:text-[#00E676] text-[#4CAF50]">
                      SOLID DAY ✓
                    </p>
                    <p className="text-sm dark:text-[#888888] text-[#666666]">
                      Core erledigt • Extras offen
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => onNavigate("daily-log")}
                  className="w-full dark:bg-gradient-to-r dark:from-[#00E676] dark:to-[#00C853] bg-gradient-to-r from-[#4CAF50] to-[#388E3C]
                    text-black font-bold font-orbitron uppercase tracking-wider text-xs
                    dark:shadow-[0_0_15px_rgba(0,230,118,0.3)] shadow-[0_4px_12px_rgba(76,175,80,0.3)]
                    dark:hover:shadow-[0_0_25px_rgba(0,230,118,0.5)] hover:shadow-[0_6px_20px_rgba(76,175,80,0.5)] hover:scale-105
                    transition-all duration-300"
                >
                  Complete Extras →
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16">
                    {/* Simple Progress Ring with glow */}
                    <svg className="h-16 w-16 -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="dark:text-[#2a2a2a] text-[#e9ecef]"
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
                        className="dark:text-[#00E5FF] text-[#0077B6] transition-all duration-500"
                        style={{
                          filter: todayProgress > 50 ? 'drop-shadow(0 0 6px currentColor)' : 'none'
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold dark:text-[#E0E0E0] text-[#1A1A1A] font-orbitron">{todayProgress}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-[#E0E0E0] text-[#1A1A1A]">
                      <span className="font-orbitron" style={{ fontVariantNumeric: 'tabular-nums' }}>{completedHabits}/{totalHabits}</span>
                      {' '}Habits erledigt
                    </p>
                    <p className="text-sm dark:text-[#888888] text-[#666666]">
                      <span className="font-orbitron" style={{ fontVariantNumeric: 'tabular-nums' }}>{todayXP}</span>
                      {' '}XP earned
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => onNavigate("daily-log")}
                  className="w-full dark:bg-gradient-to-r dark:from-[#00E5FF] dark:to-[#00B8D4] bg-gradient-to-r from-[#0077B6] to-[#005F8F]
                    text-white font-bold font-orbitron uppercase tracking-wider text-xs
                    dark:border-[#00E5FF]/30 border-[#0077B6]/30
                    dark:shadow-[0_0_15px_rgba(0,229,255,0.3)] shadow-[0_4px_12px_rgba(0,119,182,0.3)]
                    dark:hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] hover:shadow-[0_6px_20px_rgba(0,119,182,0.5)] hover:scale-105
                    transition-all duration-300"
                >
                  Zum Daily Log →
                </Button>
              </>
            )}
          </div>
        </Card>

          {/* Weekly Progress - Gaming HUD Style */}
          <Card
            className="p-6 dark:border-[rgba(0,230,118,0.15)] border-[rgba(76,175,80,0.2)] dark:bg-card/50 bg-white/80
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            dark:hover:border-[rgba(0,230,118,0.25)] hover:border-[rgba(76,175,80,0.3)]
            dark:hover:shadow-[0_0_30px_rgba(0,230,118,0.2)] hover:shadow-[0_8px_30px_rgba(76,175,80,0.25)]"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 230, 118, 0.05) 0%, rgba(26, 26, 26, 0.5) 100%)'
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 dark:text-[#00E676] text-[#4CAF50]" />
                <h3 className="font-bold font-orbitron dark:text-[#00E676] text-[#4CAF50]">Weekly Progress</h3>
              </div>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold dark:text-[#E0E0E0] text-[#1A1A1A] font-orbitron">{userStats.weekScore}/7 Days</p>
                <p className="text-sm dark:text-[#888888] text-[#666666]">Diese Woche</p>
              </div>
              <div>
                <p className="text-lg font-semibold dark:text-[#00E676] text-[#4CAF50] font-orbitron"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {userStats.totalXP} XP
                </p>
                <p className="text-sm dark:text-[#888888] text-[#666666]">Diese Woche</p>
              </div>
              <div>
                <p className="text-lg font-semibold dark:text-[#E0E0E0] text-[#1A1A1A]">
                  <span className="inline-block" style={{ animation: userStats.currentStreak > 0 ? 'fire-flicker 0.5s infinite' : 'none' }}>
                    🔥
                  </span>
                  {' '}
                  <span className="font-orbitron" style={{ fontVariantNumeric: 'tabular-nums' }}>{userStats.currentStreak}</span>
                  {' '}Tage Streak
                </p>
              </div>
            </div>
              <Button
                onClick={() => onNavigate("data")}
                variant="outline"
                className="w-full dark:border-[#00E676]/30 border-[#4CAF50]/30 dark:text-[#00E676] text-[#4CAF50]
                  dark:hover:bg-[rgba(0,230,118,0.1)] hover:bg-[rgba(76,175,80,0.1)]
                  font-orbitron uppercase tracking-wider text-xs transition-all duration-200"
              >
                View All Data →
              </Button>
            </div>
          </Card>

          {/* Visionboard Preview - Gaming HUD Style */}
          <Card
            className="p-6 dark:border-[rgba(139,92,246,0.15)] border-[rgba(139,92,246,0.2)] dark:bg-card/50 bg-white/80
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            dark:hover:border-[rgba(139,92,246,0.25)] hover:border-[rgba(139,92,246,0.3)]
            dark:hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.25)]"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(26, 26, 26, 0.5) 100%)'
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 dark:text-[#8B5CF6] text-[#7C3AED]" />
                <h3 className="font-bold font-orbitron dark:text-[#8B5CF6] text-[#7C3AED]">Visionboard</h3>
              </div>
            {hasVisionboardImages ? (
              <div className="flex gap-2 overflow-hidden">
                {visionboardPreview.map((image) => (
                  <div
                    key={image._id}
                    className="w-20 h-20 rounded-lg overflow-hidden dark:bg-[#2a2a2a] bg-[#f1f3f5] relative flex-shrink-0
                      border dark:border-[rgba(139,92,246,0.2)] border-[rgba(139,92,246,0.15)]"
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
              <p className="text-sm dark:text-[#888888] text-[#666666]">No images yet</p>
            )}
              <Button
                onClick={() => onNavigate("visionboard")}
                variant="outline"
                className="w-full dark:border-[#8B5CF6]/30 border-[#7C3AED]/30 dark:text-[#8B5CF6] text-[#7C3AED]
                  dark:hover:bg-[rgba(139,92,246,0.1)] hover:bg-[rgba(124,58,237,0.1)]
                  font-orbitron uppercase tracking-wider text-xs transition-all duration-200"
              >
                {hasVisionboardImages ? "Zum Visionboard" : "Add Images"}
              </Button>
            </div>
          </Card>

          {/* Coach Quick Access - Gaming HUD Style */}
          <Card
            className="p-6 dark:border-[rgba(255,152,0,0.15)] border-[rgba(255,152,0,0.2)] dark:bg-card/50 bg-white/80
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            dark:hover:border-[rgba(255,152,0,0.25)] hover:border-[rgba(255,152,0,0.3)]
            dark:hover:shadow-[0_0_30px_rgba(255,152,0,0.2)] hover:shadow-[0_8px_30px_rgba(255,152,0,0.25)]"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(26, 26, 26, 0.5) 100%)'
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 dark:text-[#FF9800] text-[#F57C00]" />
                <h3 className="font-bold font-orbitron dark:text-[#FF9800] text-[#F57C00]">AI Coach</h3>
              </div>
            <p className="text-sm dark:text-[#888888] text-[#666666]">
              Get personalized guidance and support
            </p>
              <Button
                onClick={() => onNavigate("coach")}
                variant="outline"
                className="w-full dark:border-[#FF9800]/30 border-[#F57C00]/30 dark:text-[#FF9800] text-[#F57C00]
                  dark:hover:bg-[rgba(255,152,0,0.1)] hover:bg-[rgba(245,124,0,0.1)]
                  font-orbitron uppercase tracking-wider text-xs transition-all duration-200"
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
