"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function QuarterlyReview() {
  const [bigWins, setBigWins] = useState("");
  const [biggestChallenges, setBiggestChallenges] = useState("");
  const [growthAreas, setGrowthAreas] = useState("");
  const [systemsToOptimize, setSystemsToOptimize] = useState("");
  const [nextQuarterVision, setNextQuarterVision] = useState("");

  // Calculate current quarter timeframe
  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const quarterStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
  const quarterEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const timeframe = `Q${currentQuarter} ${now.getFullYear()} (${formatDate(quarterStart)} - ${formatDate(quarterEnd)})`;

  // Mock data
  const stats = {
    monthsCompleted: 2,
    totalMonths: 3,
    habitsCompleted: 1056,
    totalHabits: 1260,
    totalXP: 17234,
    avgMonthlyXP: 5745,
    longestStreak: 34,
    currentStreak: 23,
    level: 18,
    levelsGained: 3
  };

  const completionRate = (stats.habitsCompleted / stats.totalHabits) * 100;

  // Mock growth metrics
  const growthMetrics = [
    { metric: "Consistency", current: 84, previous: 67, change: +17 },
    { metric: "Avg Daily XP", current: 186, previous: 142, change: +44 },
    { metric: "Win Rate", current: 88, previous: 74, change: +14 },
    { metric: "Streak Days", current: 34, previous: 21, change: +13 }
  ];

  const handleSave = () => {
    console.log("Saving quarterly review...");
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
            className="font-bold dark:text-[#8B5CF6] text-[#7C3AED] text-4xl md:text-5xl lg:text-[56px] font-orbitron"
            style={{
              letterSpacing: '2px',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            QUARTERLY REVIEW
          </p>
          <p className="font-normal dark:text-[#E0E0E0] text-[#1A1A1A] text-lg">
            Strategic review. System analysis. Next level.
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
                {stats.avgMonthlyXP.toLocaleString()} avg/month
              </p>
            </div>
          </Card>

          {/* Best Streak */}
          <Card className="p-6 dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            dark:hover:border-border hover:border-border/80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl" style={{
                  filter: stats.longestStreak >= 30 ? 'drop-shadow(0 0 8px rgba(255, 152, 0, 0.6))' : 'none',
                  animation: stats.longestStreak >= 30 ? 'neon-pulse 2s ease-in-out infinite' : 'none'
                }}>🔥</span>
                <h3 className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#999] text-[#666]">
                  BEST STREAK
                </h3>
              </div>
              <p
                className="text-5xl font-bold leading-none dark:text-[#FF9800] text-[#F57C00]"
                style={{
                  textShadow: stats.longestStreak >= 30 ? '0 0 10px rgba(255, 152, 0, 0.5)' : '0 0 3px rgba(255, 152, 0, 0.3)',
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

          {/* Level Up */}
          <Card className="p-6 dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl
            dark:hover:border-border hover:border-border/80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl" style={{
                  filter: stats.levelsGained >= 3 ? 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))' : 'none',
                  animation: stats.levelsGained >= 3 ? 'neon-pulse 2s ease-in-out infinite' : 'none'
                }}>⚡</span>
                <h3 className="text-xs font-bold font-orbitron uppercase tracking-wider dark:text-[#999] text-[#666]">
                  LEVEL UP
                </h3>
              </div>
              <p
                className="text-5xl font-bold leading-none dark:text-[#8B5CF6] text-[#7C3AED]"
                style={{
                  textShadow: stats.levelsGained >= 3 ? '0 0 10px rgba(139, 92, 246, 0.5)' : '0 0 3px rgba(139, 92, 246, 0.3)',
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
        <Card className="p-6 dark:border-[#8B5CF6]/30 border-[#8B5CF6]/20 dark:bg-card/50 bg-white/80
          shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
          dark:hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.2)]">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🚀</span>
            <div>
              <h3 className="text-lg font-orbitron font-bold dark:text-[#8B5CF6] text-[#7C3AED] uppercase tracking-wider">
                QUARTER PERFORMANCE
              </h3>
              <p className="text-sm dark:text-[#E0E0E0] text-[#1A1A1A] mt-1">
                {completionRate >= 80
                  ? "Exceptional quarter! You're operating at peak performance."
                  : completionRate >= 60
                  ? "Solid foundation built. Ready to scale up next quarter."
                  : "Strategic reset needed. Time to rebuild your systems."}
              </p>
            </div>
          </div>
        </Card>

        {/* Growth Metrics */}
        <Card className="p-6 dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
          shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl
          dark:hover:border-border hover:border-border/80">
          <div className="space-y-4">
            <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
              📈 GROWTH METRICS (vs Previous Quarter)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {growthMetrics.map((item) => {
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
                        {isPositive ? "+" : ""}{item.change}{item.metric.includes("XP") || item.metric.includes("Days") ? "" : "%"}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-3xl font-bold font-mono"
                        style={{ color: "#00E5FF" }}
                      >
                        {item.current}
                      </span>
                      <span className="text-sm dark:text-[#525252] text-[#666] font-mono line-through">
                        {item.previous}
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
          {/* Big Wins */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  BIG WINS
                </h3>
              </div>
              <Textarea
                value={bigWins}
                onChange={(e) => setBigWins(e.target.value)}
                placeholder="What were your biggest achievements this quarter? What breakthroughs did you have?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#8B5CF6] focus-visible:border-[#8B5CF6]
                  resize-none font-mono text-sm"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              />
            </div>
          </Card>

          {/* Biggest Challenges */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  BIGGEST CHALLENGES
                </h3>
              </div>
              <Textarea
                value={biggestChallenges}
                onChange={(e) => setBiggestChallenges(e.target.value)}
                placeholder="What were the major obstacles? What almost broke you?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#8B5CF6] focus-visible:border-[#8B5CF6]
                  resize-none font-mono text-sm"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              />
            </div>
          </Card>

          {/* Growth Areas */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  GROWTH AREAS
                </h3>
              </div>
              <Textarea
                value={growthAreas}
                onChange={(e) => setGrowthAreas(e.target.value)}
                placeholder="Where did you grow the most? What skills improved? What new capabilities did you develop?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#8B5CF6] focus-visible:border-[#8B5CF6]
                  resize-none font-mono text-sm"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              />
            </div>
          </Card>

          {/* Systems to Optimize */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔧</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  SYSTEMS TO OPTIMIZE
                </h3>
              </div>
              <Textarea
                value={systemsToOptimize}
                onChange={(e) => setSystemsToOptimize(e.target.value)}
                placeholder="What systems need improvement? What processes can be streamlined?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#8B5CF6] focus-visible:border-[#8B5CF6]
                  resize-none font-mono text-sm"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
              />
            </div>
          </Card>

          {/* Next Quarter Vision */}
          <Card className="dark:bg-card/50 bg-white/80 dark:border-border/50 border-border/60
            shadow-sm transition-all duration-300 rounded-2xl">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <h3 className="text-lg font-orbitron font-bold dark:text-[#E0E0E0] text-[#1A1A1A] uppercase tracking-wider">
                  NEXT QUARTER VISION
                </h3>
              </div>
              <Textarea
                value={nextQuarterVision}
                onChange={(e) => setNextQuarterVision(e.target.value)}
                placeholder="What's your vision for next quarter? What's the next level look like?"
                className="min-h-[150px] dark:bg-[#1A1A1A]/50 bg-white/50 dark:border-white/[0.08] border-black/[0.12]
                  dark:text-[#E0E0E0] text-[#1A1A1A] placeholder:dark:text-[#525252] placeholder:text-[#666]
                  focus-visible:ring-[#8B5CF6] focus-visible:border-[#8B5CF6]
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
            className="px-12 py-6 dark:bg-gradient-to-r dark:from-[#8B5CF6] dark:to-[#7C3AED] bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]
              text-white font-bold font-orbitron uppercase tracking-wider text-sm
              shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]
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
