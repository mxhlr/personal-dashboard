"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, CheckCircle2, Flag, Edit2 } from "lucide-react";
import { getWeek, getYear, getMonth } from "date-fns";
import { EditNorthStarsDialog } from "./EditNorthStarsDialog";
import { EditMilestonesDialog } from "./EditMilestonesDialog";
import { EditWeeklyGoalsDialog } from "./EditWeeklyGoalsDialog";
import { EditMonthlyOKRsDialog } from "./EditMonthlyOKRsDialog";

export function OKROverview() {
  const currentDate = new Date();
  const currentWeekNumber = getWeek(currentDate, { weekStartsOn: 1 });
  const currentMonth = getMonth(currentDate) + 1;
  const currentYear = getYear(currentDate);
  const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;

  const [isNorthStarsDialogOpen, setIsNorthStarsDialogOpen] = useState(false);
  const [isMilestonesDialogOpen, setIsMilestonesDialogOpen] = useState(false);
  const [isWeeklyGoalsDialogOpen, setIsWeeklyGoalsDialogOpen] = useState(false);
  const [isMonthlyOKRsDialogOpen, setIsMonthlyOKRsDialogOpen] = useState(false);

  const profile = useQuery(api.userProfile.getUserProfile);
  const weeklyGoals = useQuery(api.weeklyReview.getWeeklyGoals, {
    year: currentYear,
    weekNumber: currentWeekNumber,
  });
  const monthlyOKRs = useQuery(api.monthlyReview.getMonthlyOKRs, {
    year: currentYear,
    month: currentMonth,
  });

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Extract quarterly milestones
  const quarterlyMilestones = profile?.quarterlyMilestones?.filter(
    (m) => m.year === currentYear && m.quarter === currentQuarter
  ) || [];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const categoryConfig: Record<string, { icon: string; color: string }> = {
    Work: { icon: "💼", color: "text-blue-400" },
    Health: { icon: "🏃", color: "text-green-400" },
    Learning: { icon: "📚", color: "text-purple-400" },
    Personal: { icon: "✨", color: "text-pink-400" },
  };

  const areaConfig: Record<string, { icon: string; color: string; gradient: string }> = {
    Wealth: {
      icon: "💰",
      color: "text-yellow-400",
      gradient: "from-yellow-500/20 to-yellow-600/10",
    },
    Health: {
      icon: "🏃",
      color: "text-green-400",
      gradient: "from-green-500/20 to-green-600/10",
    },
    Love: {
      icon: "❤️",
      color: "text-red-400",
      gradient: "from-red-500/20 to-red-600/10",
    },
    Happiness: {
      icon: "😊",
      color: "text-purple-400",
      gradient: "from-purple-500/20 to-purple-600/10",
    },
  };

  return (
    <div
      className="min-h-[calc(100vh-64px)] relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, var(--daily-log-bg-start) 0%, var(--daily-log-bg-end) 100%)'
      }}
    >
      {/* Subtle grid overlay */}
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

      {/* Animated scanline */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          background: 'linear-gradient(transparent 40%, rgba(0, 229, 255, 0.2) 50%, transparent 60%)',
          backgroundSize: '100% 4px',
          animation: 'scanline 8s linear infinite'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold font-orbitron dark:text-white text-black"
            style={{ textShadow: '0 0 20px rgba(0, 229, 255, 0.2)' }}>
            OKR OVERVIEW
          </h1>
          <p className="text-sm dark:text-[#525252] text-[#555555]"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
            Your complete goal hierarchy at a glance
          </p>
        </div>

        {/* Annual North Stars */}

        <Card className="p-8 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.25)] dark:bg-card/50 bg-white/80
          shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 dark:text-[#00E5FF] text-[#0097A7]" />
              <h2 className="text-xl font-bold font-orbitron dark:text-[#00E5FF] text-[#0097A7]">
                WEEK {currentWeekNumber} GOALS
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm dark:text-[#525252] text-[#555555] font-bold"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                {weeklyGoals?.length || 0} Goals
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsWeeklyGoalsDialogOpen(true)}
                className="h-8 w-8 dark:hover:bg-white/[0.08] hover:bg-black/[0.05]"
              >
                <Edit2 className="h-4 w-4 dark:text-[#00E5FF] text-[#0097A7]" />
              </Button>
            </div>
          </div>

          {!weeklyGoals || weeklyGoals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 dark:text-[#444444] text-[#BBBBBB] mx-auto mb-4 opacity-40" />
              <p className="text-sm dark:text-[#3d3d3d] text-[#777777]"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                No goals set for this week.<br />
                Complete last week&apos;s review to plan ahead.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(
                weeklyGoals.reduce((acc, goal) => {
                  if (!acc[goal.category]) acc[goal.category] = [];
                  acc[goal.category].push(goal);
                  return acc;
                }, {} as Record<string, typeof weeklyGoals>)
              ).map(([category, goals]) => {
                const config = categoryConfig[category] || { icon: "🎯", color: "text-gray-400" };

                return (
                  <div
                    key={category}
                    className="p-6 rounded-xl dark:bg-white/[0.02] bg-black/[0.03]
                      dark:border dark:border-white/[0.08] border border-black/[0.08]"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">{config.icon}</span>
                      <h3 className={`text-sm font-bold uppercase tracking-wider ${config.color}`}
                        style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                        {category}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {goals.map((goal, index) => (
                        <div key={index} className="flex items-start gap-3 group">
                          <CheckCircle2 className="w-5 h-5 mt-0.5 dark:text-[#3d3d3d] text-[#525252] flex-shrink-0
                            group-hover:dark:text-[#00E5FF] group-hover:text-[#0097A7] transition-colors" />
                          <p className="text-sm dark:text-[#E0E0E0] text-[#1A1A1A] leading-relaxed"
                            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                            {goal.goal}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-8 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.25)] dark:bg-card/50 bg-white/80
          shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 dark:text-[#00E5FF] text-[#0097A7]" />
              <h2 className="text-xl font-bold font-orbitron dark:text-[#00E5FF] text-[#0097A7]">
                {monthNames[currentMonth - 1].toUpperCase()} {currentYear} OKRs
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm dark:text-[#525252] text-[#555555] font-bold"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                {monthlyOKRs?.length || 0} Objectives
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMonthlyOKRsDialogOpen(true)}
                className="h-8 w-8 dark:hover:bg-white/[0.08] hover:bg-black/[0.05]"
              >
                <Edit2 className="h-4 w-4 dark:text-[#00E5FF] text-[#0097A7]" />
              </Button>
            </div>
          </div>

          {!monthlyOKRs || monthlyOKRs.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 dark:text-[#444444] text-[#BBBBBB] mx-auto mb-4 opacity-40" />
              <p className="text-sm dark:text-[#3d3d3d] text-[#777777]"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                No OKRs set for this month.<br />
                Complete last month&apos;s review to plan ahead.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {monthlyOKRs.map((okr, index) => {
                const config = areaConfig[okr.area] || {
                  icon: "🎯",
                  color: "text-gray-400",
                  gradient: "from-gray-500/20 to-gray-600/10",
                };

                return (
                  <div
                    key={index}
                    className={`rounded-xl p-6 bg-gradient-to-br ${config.gradient}
                      dark:border dark:border-white/[0.08] border border-black/[0.08]`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <span className="text-xl mt-1">{config.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}
                            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                            {okr.area}
                          </span>
                        </div>
                        <p className="text-lg dark:text-[#E0E0E0] text-[#1A1A1A] font-semibold leading-relaxed mb-4"
                          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                          {okr.objective}
                        </p>

                        {/* Key Results */}
                        <div className="space-y-3 pl-6 border-l-2 dark:border-white/[0.15] border-black/[0.12]">
                          {okr.keyResults.map((kr, krIndex) => (
                            <div key={krIndex} className="space-y-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <p className="text-sm dark:text-[#CCCCCC] text-[#333333]"
                                  style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                                  {kr.description}
                                </p>
                                <span className="text-xs dark:text-[#525252] text-[#555555] font-bold whitespace-nowrap"
                                  style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                                  0/{kr.target} {kr.unit}
                                </span>
                              </div>
                              <div className="h-2 dark:bg-white/[0.05] bg-black/[0.08] rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-500`}
                                  style={{ width: "0%" }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-8 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.25)] dark:bg-card/50 bg-white/80
          shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Flag className="w-6 h-6 dark:text-[#00E5FF] text-[#0097A7]" />
              <h2 className="text-xl font-bold font-orbitron dark:text-[#00E5FF] text-[#0097A7]">
                Q{currentQuarter} {currentYear} MILESTONES
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm dark:text-[#525252] text-[#555555] font-bold"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                {quarterlyMilestones.length} {quarterlyMilestones.length === 1 ? "Milestone" : "Milestones"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMilestonesDialogOpen(true)}
                className="h-8 w-8 dark:hover:bg-white/[0.08] hover:bg-black/[0.05]"
              >
                <Edit2 className="h-4 w-4 dark:text-[#00E5FF] text-[#0097A7]" />
              </Button>
            </div>
          </div>

          {quarterlyMilestones.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="w-16 h-16 dark:text-[#444444] text-[#BBBBBB] mx-auto mb-4 opacity-40" />
              <p className="text-sm dark:text-[#3d3d3d] text-[#777777]"
                style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                No milestones set for this quarter.<br />
                Complete last quarter&apos;s review to plan ahead.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quarterlyMilestones.map((milestone, index) => {
                const config = areaConfig[milestone.area] || {
                  icon: "🎯",
                  color: "text-gray-400",
                  gradient: "from-gray-500/20 to-gray-600/10",
                };

                return (
                  <div
                    key={index}
                    className={`p-6 rounded-xl bg-gradient-to-br ${config.gradient}
                      dark:border dark:border-white/[0.08] border border-black/[0.08]
                      transition-all duration-200 hover:scale-[1.02]`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-1">{config.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}
                            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                            {milestone.area}
                          </span>
                        </div>
                        <p className="text-base dark:text-[#E0E0E0] text-[#1A1A1A] leading-relaxed"
                          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                          {milestone.milestone}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-8 dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.25)] dark:bg-card/50 bg-white/80
          shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Flag className="w-6 h-6 dark:text-[#00E5FF] text-[#0097A7]" />
              <h2 className="text-xl font-bold font-orbitron dark:text-[#00E5FF] text-[#0097A7]">
                ANNUAL NORTH STARS
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNorthStarsDialogOpen(true)}
              className="h-8 w-8 dark:hover:bg-white/[0.08] hover:bg-black/[0.05]"
            >
              <Edit2 className="h-4 w-4 dark:text-[#00E5FF] text-[#0097A7]" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { area: "Wealth", value: profile.northStars.wealth },
              { area: "Health", value: profile.northStars.health },
              { area: "Love", value: profile.northStars.love },
              { area: "Happiness", value: profile.northStars.happiness },
            ].map(({ area, value }) => {
              const config = areaConfig[area];
              return (
                <div key={area} className={`p-6 rounded-xl bg-gradient-to-br ${config.gradient}
                  dark:border dark:border-white/[0.08] border border-black/[0.08]`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{config.icon}</span>
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${config.color}`}
                      style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                      {area}
                    </h3>
                  </div>
                  <p className="text-base dark:text-[#E0E0E0] text-[#1A1A1A] leading-relaxed"
                    style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
                    {value}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

{/* Info Footer */}
        <div className="text-center py-6">
          <p className="text-xs dark:text-[#3d3d3d] text-[#777777] uppercase tracking-wider"
            style={{ fontFamily: '"Courier New", "Monaco", monospace' }}>
            Complete your reviews to keep your OKRs up to date
          </p>
        </div>
      </div>

      {/* Edit Dialogs */}
      <EditWeeklyGoalsDialog
        isOpen={isWeeklyGoalsDialogOpen}
        onClose={() => setIsWeeklyGoalsDialogOpen(false)}
        year={currentYear}
        weekNumber={currentWeekNumber}
      />
      <EditMonthlyOKRsDialog
        isOpen={isMonthlyOKRsDialogOpen}
        onClose={() => setIsMonthlyOKRsDialogOpen(false)}
        year={currentYear}
        month={currentMonth}
      />
      <EditMilestonesDialog
        isOpen={isMilestonesDialogOpen}
        onClose={() => setIsMilestonesDialogOpen(false)}
        year={currentYear}
        quarter={currentQuarter}
      />
      <EditNorthStarsDialog
        isOpen={isNorthStarsDialogOpen}
        onClose={() => setIsNorthStarsDialogOpen(false)}
      />
    </div>
  );
}
