"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AnnualReview() {
  const [yearHighlights, setYearHighlights] = useState("");
  const [majorChallenges, setMajorChallenges] = useState("");
  const [keyLessons, setKeyLessons] = useState("");
  const [characterGrowth, setCharacterGrowth] = useState("");
  const [nextYearVision, setNextYearVision] = useState("");
  const [gratitude, setGratitude] = useState("");

  // Calculate year
  const now = new Date();
  const year = now.getFullYear();

  // Mock stats
  const stats = {
    quartersCompleted: 3,
    totalQuarters: 4,
    habitsCompleted: 4256,
    totalHabits: 5040,
    totalXP: 68945,
    avgDailyXP: 189,
    longestStreak: 87,
    currentStreak: 34,
    level: 24,
    levelsGained: 12,
    perfectDays: 156
  };

  const completionRate = (stats.habitsCompleted / stats.totalHabits) * 100;

  // Mock year-over-year growth
  const yearlyGrowth = [
    { metric: "Total XP", current: 68945, previous: 42180, change: +63 },
    { metric: "Avg Streak", current: 45, previous: 18, change: +150 },
    { metric: "Win Rate", current: 92, previous: 76, change: +21 },
    { metric: "Perfect Days", current: 156, previous: 89, change: +75 }
  ];

  const handleSave = () => {
    console.log("Saving annual review...");
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
            className="font-bold dark:text-[#FFD700] text-[#FFA500] text-4xl md:text-5xl lg:text-[56px] font-orbitron"
            style={{
              letterSpacing: '2px',
              fontVariantNumeric: 'tabular-nums',
              textShadow: '0 0 20px rgba(255, 215, 0, 0.4)'
            }}
          >
            ANNUAL REVIEW
          </p>
          <p className="font-normal dark:text-[#E0E0E0] text-[#1A1A1A] text-lg">
            Reflect deeply. Celebrate growth. Set the vision.
          </p>
          <p className="text-sm">
            <span className="dark:text-[#999] text-[#666]">Year: </span>
            <span
              className="font-bold dark:text-[#E0E0E0] text-[#1A1A1A]"
              style={{
                fontFamily: '"Courier New", "Monaco", monospace'
              }}
            >
              {year}
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

          {/* Total XP */}
          <Card className="p-6 dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            dark:hover:border-border hover:border-border/80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl" style={{
                  filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))',
                  animation: 'neon-pulse 2s ease-in-out infinite'
                }}>✨</span>
                <h3 className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#999] text-[#666]">
                  TOTAL XP
                </h3>
              </div>
              <p
                className="text-5xl font-bold leading-none dark:text-[#FFD700] text-[#FFA500]"
                style={{
                  textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
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

          {/* Longest Streak */}
          <Card className="p-6 dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            dark:hover:border-border hover:border-border/80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl" style={{
                  filter: 'drop-shadow(0 0 8px rgba(255, 152, 0, 0.6))',
                  animation: 'neon-pulse 2s ease-in-out infinite'
                }}>🔥</span>
                <h3 className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#999] text-[#666]">
                  LONGEST STREAK
                </h3>
              </div>
              <p
                className="text-5xl font-bold leading-none dark:text-[#FF9800] text-[#F57C00]"
                style={{
                  textShadow: '0 0 10px rgba(255, 152, 0, 0.5)',
                  fontFamily: '"Courier New", "Monaco", monospace',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {stats.longestStreak}
              </p>
              <p className="text-xs dark:text-[#525252] text-[#3d3d3d]" style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                days in a row
              </p>
            </div>
          </Card>

          {/* Level Progress */}
          <Card className="p-6 dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            dark:hover:border-border hover:border-border/80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl" style={{
                  filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))',
                  animation: 'neon-pulse 2s ease-in-out infinite'
                }}>⚡</span>
                <h3 className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#999] text-[#666]">
                  LEVEL UP
                </h3>
              </div>
              <p
                className="text-5xl font-bold leading-none dark:text-[#8B5CF6] text-[#7C3AED]"
                style={{
                  textShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
                  fontFamily: '"Courier New", "Monaco", monospace',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                +{stats.levelsGained}
              </p>
              <p className="text-xs dark:text-[#525252] text-[#3d3d3d]" style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                Now level {stats.level}
              </p>
            </div>
          </Card>
        </div>

        {/* Status Banner */}
        <Card className="p-6 dark:border-[#FFD700]/30 border-[#FFD700]/20 dark:bg-card/50 bg-white/80
          shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
          dark:hover:shadow-[0_0_40px_rgba(255,215,0,0.3)] hover:shadow-[0_8px_40px_rgba(255,165,0,0.3)]">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🏆</span>
            <div>
              <h3 className="text-lg font-orbitron font-bold dark:text-[#FFD700] text-[#FFA500] uppercase tracking-wider">
                YEAR IN REVIEW
              </h3>
              <p className="text-sm dark:text-[#E0E0E0] text-[#1A1A1A] mt-1">
                {completionRate >= 80
                  ? "Legendary year! You've transformed into your best self."
                  : completionRate >= 60
                  ? "Strong year of growth! You've built solid foundations."
                  : "A year of lessons. Every setback is setup for a comeback."}
              </p>
            </div>
          </div>
        </Card>

        {/* Year-over-Year Growth */}
        <Card className="p-6 dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
          shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
          dark:hover:border-border hover:border-border/80">
          <div className="space-y-4">
            <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
              📈 YEAR-OVER-YEAR GROWTH
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {yearlyGrowth.map((item) => {
                const isPositive = item.change > 0;
                const changeColor = isPositive ? "#00E676" : "#FF5252";
                return (
                  <div
                    key={item.metric}
                    className="p-4 rounded-lg dark:bg-white/[0.03] bg-black/[0.02] border dark:border-white/[0.06] border-black/[0.06]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium dark:text-[#E0E0E0] text-[#1A1A1A]">
                        {item.metric}
                      </span>
                      <span
                        className="text-xs font-bold font-mono"
                        style={{ color: changeColor }}
                      >
                        {isPositive ? "+" : ""}{item.change}%
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-3xl font-bold font-mono"
                        style={{ color: "#FFD700" }}
                      >
                        {item.current.toLocaleString()}
                      </span>
                      <span className="text-sm dark:text-[#525252] text-[#666] font-mono line-through">
                        {item.previous.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Reflection Sections */}
        <div className="space-y-4">
          {/* Year Highlights */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌟</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  YEAR HIGHLIGHTS
                </h3>
              </div>
              <Textarea
                value={yearHighlights}
                onChange={(e) => setYearHighlights(e.target.value)}
                placeholder="What were the defining moments of your year? What will you remember most?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#FFD700] focus-visible:border-[#FFD700]
                  resize-none font-mono text-sm"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              />
            </div>
          </Card>

          {/* Major Challenges */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚔️</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  MAJOR CHALLENGES
                </h3>
              </div>
              <Textarea
                value={majorChallenges}
                onChange={(e) => setMajorChallenges(e.target.value)}
                placeholder="What were your biggest battles? What tested you the most?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#FFD700] focus-visible:border-[#FFD700]
                  resize-none font-mono text-sm"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              />
            </div>
          </Card>

          {/* Key Lessons */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📚</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  KEY LESSONS
                </h3>
              </div>
              <Textarea
                value={keyLessons}
                onChange={(e) => setKeyLessons(e.target.value)}
                placeholder="What profound lessons did this year teach you? What wisdom did you gain?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#FFD700] focus-visible:border-[#FFD700]
                  resize-none font-mono text-sm"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              />
            </div>
          </Card>

          {/* Character Growth */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💎</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  CHARACTER GROWTH
                </h3>
              </div>
              <Textarea
                value={characterGrowth}
                onChange={(e) => setCharacterGrowth(e.target.value)}
                placeholder="How did you evolve as a person? What parts of your character strengthened?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#FFD700] focus-visible:border-[#FFD700]
                  resize-none font-mono text-sm"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              />
            </div>
          </Card>

          {/* Gratitude */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🙏</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  GRATITUDE
                </h3>
              </div>
              <Textarea
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="Who and what are you grateful for this year? What blessings did you receive?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#FFD700] focus-visible:border-[#FFD700]
                  resize-none font-mono text-sm"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              />
            </div>
          </Card>

          {/* Next Year Vision */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  NEXT YEAR VISION
                </h3>
              </div>
              <Textarea
                value={nextYearVision}
                onChange={(e) => setNextYearVision(e.target.value)}
                placeholder="What's your bold vision for next year? Who do you want to become?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#FFD700] focus-visible:border-[#FFD700]
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
            className="px-12 py-6 dark:bg-gradient-to-r dark:from-[#FFD700] dark:to-[#FFA500] bg-gradient-to-r from-[#FFA500] to-[#FF8C00]
              text-black font-bold font-orbitron uppercase tracking-wider text-sm
              shadow-[0_0_30px_rgba(255,215,0,0.5)] hover:shadow-[0_0_50px_rgba(255,215,0,0.7)]
              hover:scale-[1.02]
              transition-all duration-300"
          >
            💾 Save Review
          </Button>
        </div>
      </div>
    </div>
  );
}
