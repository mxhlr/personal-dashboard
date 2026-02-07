"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function WeeklyReview() {
  const [wins, setWins] = useState("");
  const [challenges, setChallenges] = useState("");
  const [learnings, setLearnings] = useState("");
  const [nextWeekGoals, setNextWeekGoals] = useState("");

  // Calculate current week timeframe
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const timeframe = `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;

  // Mock stats - will be replaced with real data
  const stats = {
    daysCompleted: 5,
    totalDays: 7,
    habitsCompleted: 87,
    totalHabits: 105,
    totalXP: 1247,
    streak: 12
  };

  const completionRate = (stats.habitsCompleted / stats.totalHabits) * 100;
  const dayCompletionRate = (stats.daysCompleted / stats.totalDays) * 100;

  const handleSave = () => {
    console.log("Saving weekly review...");
    // TODO: Save to Convex
  };

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

      <div className="relative max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* Header */}
        <header className="space-y-2 text-center">
          <p
            className="font-bold dark:text-[#00E5FF] text-[#0077B6] text-4xl md:text-5xl lg:text-[56px] font-orbitron"
            style={{
              letterSpacing: '2px',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            WEEKLY REVIEW
          </p>
          <p className="font-normal dark:text-[#E0E0E0] text-[#1A1A1A] text-lg">
            Reflect. Adjust. Execute.
          </p>
          <p className="text-sm">
            <span className="dark:text-[#999] text-[#666]">Period: </span>
            <span
              className="font-bold dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{
                fontFamily: '"Courier New", "Monaco", monospace'
              }}
            >
              {timeframe}
            </span>
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Completion Rate */}
          <Card className="p-6 dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            dark:hover:border-border hover:border-border/80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🎯</span>
                <h3 className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#999] text-[#666]">
                  COMPLETION
                </h3>
              </div>
              <p
                className="text-5xl font-bold leading-none dark:text-[#00E5FF] text-[#0077B6]"
                style={{
                  textShadow: '0 0 3px rgba(0, 229, 255, 0.5)',
                  fontFamily: '"Courier New", "Monaco", monospace',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {completionRate.toFixed(0)}%
              </p>
              <p className="text-xs dark:text-[#525252] text-[#3d3d3d]" style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                {stats.habitsCompleted}/{stats.totalHabits} habits
              </p>
            </div>
          </Card>

          {/* Days Nailed */}
          <Card className="p-6 dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            dark:hover:border-border hover:border-border/80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl" style={{
                  filter: stats.daysCompleted >= 5 ? 'drop-shadow(0 0 8px rgba(0, 230, 118, 0.6))' : 'none',
                  animation: stats.daysCompleted >= 5 ? 'neon-pulse 2s ease-in-out infinite' : 'none'
                }}>✅</span>
                <h3 className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#999] text-[#666]">
                  DAYS NAILED
                </h3>
              </div>
              <p
                className="text-5xl font-bold leading-none dark:text-[#00E676] text-[#4CAF50]"
                style={{
                  textShadow: stats.daysCompleted >= 5 ? '0 0 10px rgba(0, 230, 118, 0.5)' : '0 0 3px rgba(0, 230, 118, 0.3)',
                  fontFamily: '"Courier New", "Monaco", monospace',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {stats.daysCompleted}/{stats.totalDays}
              </p>
              <p className="text-xs dark:text-[#525252] text-[#3d3d3d]" style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                days completed
              </p>
            </div>
          </Card>

          {/* Total XP */}
          <Card className="p-6 dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            dark:hover:border-border hover:border-border/80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">✨</span>
                <h3 className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#999] text-[#666]">
                  TOTAL XP
                </h3>
              </div>
              <p
                className="text-5xl font-bold leading-none dark:text-[#FFD700] text-[#FFA500]"
                style={{
                  textShadow: '0 0 3px rgba(255, 215, 0, 0.5)',
                  fontFamily: '"Courier New", "Monaco", monospace',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {stats.totalXP.toLocaleString()}
              </p>
              <p className="text-xs dark:text-[#525252] text-[#3d3d3d]" style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                experience points
              </p>
            </div>
          </Card>

          {/* Streak */}
          <Card className="p-6 dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            dark:hover:border-border hover:border-border/80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl" style={{
                  filter: stats.streak >= 7 ? 'drop-shadow(0 0 8px rgba(255, 152, 0, 0.6))' : 'none',
                  animation: stats.streak >= 7 ? 'neon-pulse 2s ease-in-out infinite' : 'none'
                }}>🔥</span>
                <h3 className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#999] text-[#666]">
                  STREAK
                </h3>
              </div>
              <p
                className="text-5xl font-bold leading-none dark:text-[#FF9800] text-[#F57C00]"
                style={{
                  textShadow: stats.streak >= 7 ? '0 0 10px rgba(255, 152, 0, 0.5)' : '0 0 3px rgba(255, 152, 0, 0.3)',
                  fontFamily: '"Courier New", "Monaco", monospace',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {stats.streak}
              </p>
              <p className="text-xs dark:text-[#525252] text-[#3d3d3d]" style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                days in a row
              </p>
            </div>
          </Card>
        </div>

        {/* Status Banner */}
        <Card className="p-6 dark:border-[#00E676]/30 border-[#00E676]/20 dark:bg-card/50 bg-white/80
          shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
          dark:hover:shadow-[0_0_30px_rgba(0,230,118,0.2)] hover:shadow-[0_8px_30px_rgba(76,175,80,0.2)]">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🏆</span>
            <div>
              <h3 className="text-lg font-orbitron font-bold dark:text-[#00E676] text-[#4CAF50] uppercase tracking-wider">
                WEEK STATUS
              </h3>
              <p className="text-sm dark:text-[#E0E0E0] text-[#1A1A1A] mt-1">
                {completionRate >= 80
                  ? "Outstanding performance! You crushed this week."
                  : completionRate >= 60
                  ? "Solid progress! Keep building momentum."
                  : "Room for improvement. What can you adjust?"}
              </p>
            </div>
          </div>
        </Card>

        {/* Reflection Sections */}
        <div className="space-y-4">
          {/* Wins */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌟</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  WINS THIS WEEK
                </h3>
              </div>
              <Textarea
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                placeholder="What went well? What are you proud of?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#00E5FF] focus-visible:border-[#00E5FF]
                  resize-none font-mono text-sm"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              />
            </div>
          </Card>

          {/* Challenges */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  CHALLENGES
                </h3>
              </div>
              <Textarea
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                placeholder="What obstacles did you face? What held you back?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#00E5FF] focus-visible:border-[#00E5FF]
                  resize-none font-mono text-sm"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              />
            </div>
          </Card>

          {/* Key Learnings */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  KEY LEARNINGS
                </h3>
              </div>
              <Textarea
                value={learnings}
                onChange={(e) => setLearnings(e.target.value)}
                placeholder="What did you learn this week? What insights did you gain?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#00E5FF] focus-visible:border-[#00E5FF]
                  resize-none font-mono text-sm"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              />
            </div>
          </Card>

          {/* Next Week Goals */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  NEXT WEEK GOALS
                </h3>
              </div>
              <Textarea
                value={nextWeekGoals}
                onChange={(e) => setNextWeekGoals(e.target.value)}
                placeholder="What will you focus on next week? What's your game plan?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#00E5FF] focus-visible:border-[#00E5FF]
                  resize-none font-mono text-sm"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              />
            </div>
          </Card>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSave}
            size="lg"
            className="px-12 py-6 dark:bg-gradient-to-r dark:from-white dark:to-gray-100 bg-gradient-to-r from-gray-700 to-gray-800
              dark:text-black text-white font-bold font-orbitron uppercase tracking-wider text-sm
              border dark:border-white/50 border-gray-600/50 shadow-sm
              hover:shadow-md hover:scale-[1.02]
              transition-all duration-300"
          >
            💾 Save Review
          </Button>
        </div>
      </div>
    </div>
  );
}
