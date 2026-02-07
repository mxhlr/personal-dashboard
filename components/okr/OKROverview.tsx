"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Target, TrendingUp, CheckCircle2, Flag } from "lucide-react";
import { getWeek, getYear, getMonth } from "date-fns";

export function OKROverview() {
  const currentDate = new Date();
  const currentWeekNumber = getWeek(currentDate, { weekStartsOn: 1 });
  const currentMonth = getMonth(currentDate) + 1;
  const currentYear = getYear(currentDate);
  const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;

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

  const quarterlyMilestones = profile?.quarterlyMilestones?.filter(
    (m) => m.year === currentYear && m.quarter === currentQuarter
  ) || [];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const categoryConfig: Record<string, { icon: string; color: string }> = {
    Work: { icon: "💼", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
    Health: { icon: "🏃", color: "bg-green-500/10 text-green-700 dark:text-green-400" },
    Learning: { icon: "📚", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
    Personal: { icon: "✨", color: "bg-pink-500/10 text-pink-700 dark:text-pink-400" },
  };

  const areaConfig: Record<string, { icon: string; color: string }> = {
    Wealth: { icon: "💰", color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
    Health: { icon: "🏃", color: "bg-green-500/10 text-green-700 dark:text-green-400" },
    Love: { icon: "❤️", color: "bg-red-500/10 text-red-700 dark:text-red-400" },
    Happiness: { icon: "😊", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            OKR Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            From weekly actions to annual vision
          </p>
        </header>

        {/* Weekly Goals - PRIORITY #1 */}
        <Card className="shadow-md border-primary/20 transition-all duration-200 hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold">
                  Week {currentWeekNumber} Goals
                </CardTitle>
                <Badge variant="outline" className="ml-2">This Week</Badge>
              </div>
              <Badge variant="outline">
                {weeklyGoals?.length || 0} Goals
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {!weeklyGoals || weeklyGoals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-sm text-muted-foreground">
                  No goals set for this week.
                  <br />
                  Complete last week&apos;s review to plan ahead.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(
                  weeklyGoals.reduce((acc, goal) => {
                    if (!acc[goal.category]) acc[goal.category] = [];
                    acc[goal.category].push(goal);
                    return acc;
                  }, {} as Record<string, typeof weeklyGoals>)
                ).map(([category, goals]) => {
                  const config = categoryConfig[category] || {
                    icon: "🎯",
                    color: "bg-gray-500/10 text-gray-700 dark:text-gray-400"
                  };

                  return (
                    <div
                      key={category}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">{config.icon}</span>
                        <Badge variant="secondary" className={config.color}>
                          {category}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {goals.map((goal, index) => (
                          <div key={index} className="flex items-start gap-2 group">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-muted-foreground/40 flex-shrink-0 group-hover:text-primary transition-colors" />
                            <p className="text-sm leading-relaxed">
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
          </CardContent>
        </Card>

        {/* Monthly OKRs */}
        <Card className="shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <CardTitle className="text-lg font-semibold">
                  {monthNames[currentMonth - 1]} {currentYear} OKRs
                </CardTitle>
              </div>
              <Badge variant="outline">
                {monthlyOKRs?.length || 0} Objectives
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {!monthlyOKRs || monthlyOKRs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-sm text-muted-foreground">
                  No OKRs set for this month.
                  <br />
                  Complete last month&apos;s review to plan ahead.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {monthlyOKRs.map((okr, index) => {
                  const config = areaConfig[okr.area] || {
                    icon: "🎯",
                    color: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
                  };

                  return (
                    <div key={index} className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{config.icon}</span>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={config.color}>
                              {okr.area}
                            </Badge>
                          </div>
                          <p className="text-base font-medium leading-relaxed">
                            {okr.objective}
                          </p>

                          {/* Key Results */}
                          <div className="space-y-3 pl-4 border-l-2 border-border">
                            {okr.keyResults.map((kr, krIndex) => (
                              <div key={krIndex} className="space-y-2">
                                <div className="flex items-baseline justify-between gap-2">
                                  <p className="text-sm text-muted-foreground">
                                    {kr.description}
                                  </p>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    0/{kr.target} {kr.unit}
                                  </span>
                                </div>
                                <Progress value={0} className="h-2" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {index < monthlyOKRs.length - 1 && <Separator />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quarterly Milestones */}
        <Card className="shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                <CardTitle className="text-lg font-semibold">
                  Q{currentQuarter} {currentYear} Milestones
                </CardTitle>
              </div>
              <Badge variant="outline">
                {quarterlyMilestones.length} {quarterlyMilestones.length === 1 ? "Milestone" : "Milestones"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {quarterlyMilestones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Flag className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-sm text-muted-foreground">
                  No milestones set for this quarter.
                  <br />
                  Complete last quarter&apos;s review to plan ahead.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {quarterlyMilestones.map((milestone, index) => {
                  const config = areaConfig[milestone.area] || {
                    icon: "🎯",
                    color: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
                  };

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg border bg-card transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{config.icon}</span>
                        <div className="flex-1 space-y-2">
                          <Badge variant="secondary" className={config.color}>
                            {milestone.area}
                          </Badge>
                          <p className="text-sm leading-relaxed">
                            {milestone.milestone}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Annual North Stars */}
        <Card className="shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              <CardTitle className="text-lg font-semibold">Annual North Stars</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { area: "Wealth", value: profile.northStars.wealth },
                { area: "Health", value: profile.northStars.health },
                { area: "Love", value: profile.northStars.love },
                { area: "Happiness", value: profile.northStars.happiness },
              ].map(({ area, value }) => {
                const config = areaConfig[area];
                return (
                  <div key={area} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.icon}</span>
                      <Badge variant="secondary" className={config.color}>
                        {area}
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed">{value}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Complete your reviews to keep your OKRs up to date
          </p>
        </div>
      </div>
    </div>
  );
}
