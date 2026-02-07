"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

export function MonthlyReview() {
  const [achievements, setAchievements] = useState("");
  const [setbacks, setSetbacks] = useState("");
  const [insights, setInsights] = useState("");
  const [nextMonthFocus, setNextMonthFocus] = useState("");

  // Calculate current month timeframe
  const now = new Date();
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const timeframe = monthName;

  // Mock data
  const stats = {
    weeksCompleted: 3,
    totalWeeks: 4,
    habitsCompleted: 352,
    totalHabits: 420,
    totalXP: 5689,
    avgDailyXP: 184,
    streak: 23,
    level: 16,
    levelProgress: 67
  };

  const completionRate = (stats.habitsCompleted / stats.totalHabits) * 100;
  const weekCompletionRate = (stats.weeksCompleted / stats.totalWeeks) * 100;

  // Mock category breakdown
  const categoryStats = [
    { name: "Physical", completed: 89, total: 120, color: "#FF9800" },
    { name: "Mental", completed: 95, total: 105, color: "#00E5FF" },
    { name: "Work", completed: 78, total: 105, color: "#FFD700" },
    { name: "Personal", completed: 90, total: 90, color: "#00E676" }
  ];

  const handleSave = () => {
    console.log("Saving monthly review...");
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
            MONTHLY REVIEW
          </p>
          <p className="font-normal dark:text-[#E0E0E0] text-[#1A1A1A] text-lg">
            Zoom out. Analyze. Optimize.
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

          {/* Weeks Nailed */}
          <Card className="p-6 dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            dark:hover:border-border hover:border-border/80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl" style={{
                  filter: stats.weeksCompleted >= 3 ? 'drop-shadow(0 0 8px rgba(0, 230, 118, 0.6))' : 'none',
                  animation: stats.weeksCompleted >= 3 ? 'neon-pulse 2s ease-in-out infinite' : 'none'
                }}>📅</span>
                <h3 className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#999] text-[#666]">
                  WEEKS NAILED
                </h3>
              </div>
              <p
                className="text-5xl font-bold leading-none dark:text-[#00E676] text-[#4CAF50]"
                style={{
                  textShadow: stats.weeksCompleted >= 3 ? '0 0 10px rgba(0, 230, 118, 0.5)' : '0 0 3px rgba(0, 230, 118, 0.3)',
                  fontFamily: '"Courier New", "Monaco", monospace',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {stats.weeksCompleted}/{stats.totalWeeks}
              </p>
              <p className="text-xs dark:text-[#525252] text-[#3d3d3d]" style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                weeks completed
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
                {stats.avgDailyXP} avg/day
              </p>
            </div>
          </Card>

          {/* Level Progress */}
          <Card className="p-6 dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            dark:hover:border-border hover:border-border/80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">⚡</span>
                <h3 className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#999] text-[#666]">
                  LEVEL
                </h3>
              </div>
              <p
                className="text-5xl font-bold leading-none dark:text-[#8B5CF6] text-[#7C3AED]"
                style={{
                  textShadow: '0 0 3px rgba(139, 92, 246, 0.5)',
                  fontFamily: '"Courier New", "Monaco", monospace',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {stats.level}
              </p>
              <p className="text-xs dark:text-[#525252] text-[#3d3d3d]" style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                {stats.levelProgress}% to next
              </p>
            </div>
          </Card>
        </div>

        {/* Status Banner */}
        <Card className="p-6 dark:border-[#00E5FF]/30 border-[#00E5FF]/20 dark:bg-card/50 bg-white/80
          shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
          dark:hover:shadow-[0_0_30px_rgba(0,229,255,0.2)] hover:shadow-[0_8px_30px_rgba(0,180,220,0.2)]">
          <div className="flex items-center gap-4">
            <span className="text-4xl">📊</span>
            <div>
              <h3 className="text-lg font-orbitron font-bold dark:text-[#00E5FF] text-[#0077B6] uppercase tracking-wider">
                MONTH ANALYSIS
              </h3>
              <p className="text-sm dark:text-[#E0E0E0] text-[#1A1A1A] mt-1">
                {completionRate >= 80
                  ? "Exceptional month! You're building unstoppable momentum."
                  : completionRate >= 60
                  ? "Good progress! Identify patterns and optimize further."
                  : "Time to recalibrate. What systems need adjustment?"}
              </p>
            </div>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6 dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
          shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
          dark:hover:border-border hover:border-border/80">
          <div className="space-y-4">
            <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
              📈 CATEGORY BREAKDOWN
            </h3>
            <div className="space-y-4">
              {categoryStats.map((category) => {
                const progress = (category.completed / category.total) * 100;
                return (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium dark:text-[#E0E0E0] text-[#1A1A1A]">
                        {category.name}
                      </span>
                      <span className="text-xs dark:text-[#525252] text-[#3d3d3d] font-mono">
                        {category.completed}/{category.total} ({progress.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-2 dark:bg-[#2A2A2E] bg-[#d1d2d4]"
                      style={{
                        // @ts-ignore
                        '--progress-background': category.color
                      } as React.CSSProperties}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Reflection Sections */}
        <div className="space-y-4">
          {/* Key Achievements */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  KEY ACHIEVEMENTS
                </h3>
              </div>
              <Textarea
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="What major wins did you have this month? What milestones did you reach?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#00E5FF] focus-visible:border-[#00E5FF]
                  resize-none font-mono text-sm"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              />
            </div>
          </Card>

          {/* Setbacks & Obstacles */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚧</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  SETBACKS & OBSTACLES
                </h3>
              </div>
              <Textarea
                value={setbacks}
                onChange={(e) => setSetbacks(e.target.value)}
                placeholder="What challenges did you face? What patterns emerged in your struggles?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#00E5FF] focus-visible:border-[#00E5FF]
                  resize-none font-mono text-sm"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              />
            </div>
          </Card>

          {/* Insights & Patterns */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  INSIGHTS & PATTERNS
                </h3>
              </div>
              <Textarea
                value={insights}
                onChange={(e) => setInsights(e.target.value)}
                placeholder="What did you learn about yourself? What patterns did you notice?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#00E5FF] focus-visible:border-[#00E5FF]
                  resize-none font-mono text-sm"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              />
            </div>
          </Card>

          {/* Next Month Focus */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  NEXT MONTH FOCUS
                </h3>
              </div>
              <Textarea
                value={nextMonthFocus}
                onChange={(e) => setNextMonthFocus(e.target.value)}
                placeholder="What are your top 3 priorities for next month? What will you improve?"
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
