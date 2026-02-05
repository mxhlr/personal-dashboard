import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Analytics Queries for Data Views
 * Provides aggregated data for Daily, Weekly, Monthly, Quarterly, and Annual views
 */

// Get logs for a date range
export const getLogsByDateRange = query({
  args: {
    startDate: v.string(), // "YYYY-MM-DD"
    endDate: v.string(), // "YYYY-MM-DD"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const logs = await ctx.db
      .query("dailyLog")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    return logs;
  },
});

// Get monthly logs (all weeks in a month)
export const getMonthlyLogs = query({
  args: {
    year: v.number(),
    month: v.number(), // 1-12
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Calculate start and end dates for the month
    const startDate = new Date(args.year, args.month - 1, 1);
    const endDate = new Date(args.year, args.month, 0);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    const logs = await ctx.db
      .query("dailyLog")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDateStr),
          q.lte(q.field("date"), endDateStr)
        )
      )
      .collect();

    return logs;
  },
});

// Get monthly habit completion data (new system)
export const getMonthlyHabitCompletion = query({
  args: {
    year: v.number(),
    month: v.number(), // 1-12
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Calculate start and end dates for the month
    const startDate = new Date(args.year, args.month - 1, 1);
    const endDate = new Date(args.year, args.month, 0);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // Get all habit templates to know total possible XP per day
    const templates = await ctx.db
      .query("habitTemplates")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const totalPossibleXP = templates.reduce((sum, t) => sum + t.xpValue, 0);

    // Get all dailyHabits for the month
    const allHabits = await ctx.db
      .query("dailyHabits")
      .withIndex("by_user_date", (q) => q.eq("userId", identity.subject))
      .collect();

    const habitsInMonth = allHabits.filter(
      (h) => h.date >= startDateStr && h.date <= endDateStr
    );

    // Group by date and calculate XP-based completion percentage
    const dateMap = new Map<string, { earnedXP: number; totalXP: number }>();

    habitsInMonth.forEach((habit) => {
      const existing = dateMap.get(habit.date);
      const xp = habit.completed ? habit.xpEarned : 0;

      if (existing) {
        existing.earnedXP += xp;
      } else {
        dateMap.set(habit.date, {
          earnedXP: xp,
          totalXP: totalPossibleXP,
        });
      }
    });

    // Convert to array format with percentage
    return Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      earnedXP: data.earnedXP,
      totalXP: data.totalXP,
      completionPercentage: data.totalXP > 0
        ? Math.round((data.earnedXP / data.totalXP) * 100)
        : 0,
    }));
  },
});

// Get quarterly logs
export const getQuarterlyLogs = query({
  args: {
    year: v.number(),
    quarter: v.number(), // 1-4
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Calculate quarter date range
    const quarterStartMonth = (args.quarter - 1) * 3;
    const startDate = new Date(args.year, quarterStartMonth, 1);
    const endDate = new Date(args.year, quarterStartMonth + 3, 0);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    const logs = await ctx.db
      .query("dailyLog")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDateStr),
          q.lte(q.field("date"), endDateStr),
          q.eq(q.field("year"), args.year)
        )
      )
      .collect();

    return logs;
  },
});

// Get annual logs
export const getAnnualLogs = query({
  args: {
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const logs = await ctx.db
      .query("dailyLog")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("year"), args.year))
      .collect();

    return logs;
  },
});

// REMOVED: getWellbeingTrends - Legacy system not used anymore
// REMOVED: getTrackingPerformance - Legacy system not used anymore

export const getTrackingPerformance_REMOVED = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const logs = await ctx.db
      .query("dailyLog")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    const fields = await ctx.db
      .query("trackingFields")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", identity.subject).eq("isActive", true)
      )
      .collect();

    const completedLogs = logs.filter((log) => log.completed);
    const totalDays = completedLogs.length;

    if (totalDays === 0) {
      return [];
    }

    const performance = fields.map((field) => {
      let count = 0;

      if (field.name === "Phone Jail") {
        count = completedLogs.filter(
          (log) => log.tracking.phoneJail === true
        ).length;
      } else if (field.type === "toggle") {
        for (const log of completedLogs) {
          if (log.tracking.customToggles) {
            const toggle = log.tracking.customToggles.find(
              (t) => t.fieldId === field._id
            );
            if (toggle?.value === true) {
              count++;
            }
          }
        }
      } else if (field.type === "text") {
        if (field.name === "Movement") {
          count = completedLogs.filter(
            (log) => log.tracking.movement && log.tracking.movement.length > 0
          ).length;
        } else if (field.name === "Vibes") {
          count = completedLogs.filter(
            (log) => log.tracking.vibes && log.tracking.vibes.length > 0
          ).length;
        } else {
          for (const log of completedLogs) {
            if (log.tracking.customTexts) {
              const text = log.tracking.customTexts.find(
                (t) => t.fieldId === field._id
              );
              if (text?.value && text.value.length > 0) {
                count++;
              }
            }
          }
        }
      }

      return {
        fieldName: field.name,
        fieldType: field.type,
        current: count,
        total: totalDays,
        percentage: Math.round((count / totalDays) * 100),
      };
    });

    return performance;
  },
});

// Get streak statistics
export const getStreakStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const fields = await ctx.db
      .query("trackingFields")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", identity.subject).eq("isActive", true)
      )
      .filter((q) => q.eq(q.field("hasStreak"), true))
      .collect();

    return fields.map((field) => ({
      fieldName: field.name,
      currentStreak: field.currentStreak || 0,
      longestStreak: field.longestStreak || 0,
      weeklyTarget: field.weeklyTarget,
    }));
  },
});

// Get quarterly milestones with completion status
export const getQuarterlyMilestones = query({
  args: {
    year: v.number(),
    quarter: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!profile) {
      return [];
    }

    const milestones = profile.quarterlyMilestones.filter(
      (m) => m.year === args.year && m.quarter === args.quarter
    );

    const total = milestones.length;
    const completed = milestones.filter((m) => m.completed).length;

    return {
      milestones,
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },
});

// Get annual review status
export const getAnnualReviewStatus = query({
  args: {
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const review = await ctx.db
      .query("annualReview")
      .withIndex("by_user_year", (q) =>
        q.eq("userId", identity.subject).eq("year", args.year)
      )
      .first();

    return {
      completed: !!review,
      review: review || null,
    };
  },
});

// Get weekly review status
export const getWeeklyReviewStatus = query({
  args: {
    year: v.number(),
    weekNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const review = await ctx.db
      .query("weeklyReview")
      .withIndex("by_user_year_week", (q) =>
        q
          .eq("userId", identity.subject)
          .eq("year", args.year)
          .eq("weekNumber", args.weekNumber)
      )
      .first();

    return {
      completed: !!review,
      review: review || null,
    };
  },
});

// Get monthly review status
export const getMonthlyReviewStatus = query({
  args: {
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const review = await ctx.db
      .query("monthlyReview")
      .withIndex("by_user_year_month", (q) =>
        q
          .eq("userId", identity.subject)
          .eq("year", args.year)
          .eq("month", args.month)
      )
      .first();

    return {
      completed: !!review,
      review: review || null,
    };
  },
});

// Get quarterly review status
export const getQuarterlyReviewStatus = query({
  args: {
    year: v.number(),
    quarter: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const review = await ctx.db
      .query("quarterlyReview")
      .withIndex("by_user_year_quarter", (q) =>
        q
          .eq("userId", identity.subject)
          .eq("year", args.year)
          .eq("quarter", args.quarter)
      )
      .first();

    return {
      completed: !!review,
      review: review || null,
    };
  },
});

// ============================================
// PATTERN INTELLIGENCE ANALYTICS
// ============================================

/**
 * Get Pattern Intelligence for the last 30 days
 * Analyzes habit completion patterns and provides insights
 */
export const getPatternIntelligence = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get last 30 days of logs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split("T")[0];

    const logs = await ctx.db
      .query("dailyLog")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.gte(q.field("date"), startDate))
      .collect();

    // Get all active tracking fields
    const fields = await ctx.db
      .query("trackingFields")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", identity.subject).eq("isActive", true)
      )
      .collect();

    const completedLogs = logs.filter((log) => log.completed);
    const totalDays = completedLogs.length;

    if (totalDays === 0) {
      return {
        weakHabits: [],
        strongHabits: [],
        totalDaysTracked: 0,
        averageCompletionRate: 0,
        insights: [],
      };
    }

    // Analyze each habit
    const habitAnalysis = fields.map((field) => {
      const completionRate = calculateCompletionRate(
        completedLogs,
        field,
        totalDays
      );

      return {
        habitId: field._id,
        habitName: field.name,
        habitType: field.type,
        completionRate,
        completionCount: Math.round((completionRate / 100) * totalDays),
        totalDays,
        hasStreak: field.hasStreak,
        currentStreak: field.currentStreak || 0,
        longestStreak: field.longestStreak || 0,
        weeklyTarget: field.weeklyTarget,
      };
    });

    // Identify weak habits (< 30% completion rate)
    const weakHabits = habitAnalysis
      .filter((h) => h.completionRate < 30)
      .map((h) => ({
        habitName: h.habitName,
        completionRate: h.completionRate,
        recommendation: "Consider restructuring.",
      }));

    // Identify strong habits (>= 70% completion rate)
    const strongHabits = habitAnalysis
      .filter((h) => h.completionRate >= 70)
      .map((h) => ({
        habitName: h.habitName,
        completionRate: h.completionRate,
        currentStreak: h.currentStreak,
      }));

    // Calculate average completion rate
    const avgCompletionRate =
      habitAnalysis.length > 0
        ? habitAnalysis.reduce((sum, h) => sum + h.completionRate, 0) /
          habitAnalysis.length
        : 0;

    // Generate insights
    const insights: Array<string> = [];
    if (weakHabits.length > 0) {
      insights.push(
        `You have ${weakHabits.length} habit(s) with low completion rates. Consider simplifying or breaking them down.`
      );
    }
    if (strongHabits.length > 0) {
      insights.push(
        `Great job! You're maintaining ${strongHabits.length} habit(s) consistently.`
      );
    }
    if (avgCompletionRate < 50) {
      insights.push(
        "Your overall completion rate is below 50%. Try focusing on fewer habits to build momentum."
      );
    }

    return {
      weakHabits,
      strongHabits,
      totalDaysTracked: totalDays,
      averageCompletionRate: Math.round(avgCompletionRate),
      allHabits: habitAnalysis,
      insights,
    };
  },
});

/**
 * Get detailed statistics for a specific habit
 * Shows day-by-day completion, streaks, and patterns
 */
export const getHabitStats = query({
  args: {
    fieldId: v.id("trackingFields"),
    days: v.optional(v.number()), // Number of days to analyze (default 30)
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the tracking field
    const field = await ctx.db.get(args.fieldId);
    if (!field || field.userId !== identity.subject) {
      throw new Error("Field not found");
    }

    // Get logs for the specified period
    const daysToAnalyze = args.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToAnalyze);
    const startDateStr = startDate.toISOString().split("T")[0];

    const logs = await ctx.db
      .query("dailyLog")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.gte(q.field("date"), startDateStr))
      .collect();

    // Build day-by-day completion history
    const completionHistory: Array<{
      date: string;
      completed: boolean;
      dayOfWeek: string;
    }> = [];

    for (const log of logs.sort((a, b) => a.date.localeCompare(b.date))) {
      let completed = false;

      if (field.name === "Phone Jail") {
        completed = log.tracking.phoneJail === true;
      } else if (field.type === "toggle") {
        const toggle = log.tracking.customToggles?.find(
          (t) => t.fieldId === field._id
        );
        completed = toggle?.value === true;
      } else if (field.type === "text") {
        if (field.name === "Movement") {
          completed = !!(log.tracking.movement && log.tracking.movement.length > 0);
        } else if (field.name === "Vibes") {
          completed = !!(log.tracking.vibes && log.tracking.vibes.length > 0);
        } else {
          const text = log.tracking.customTexts?.find(
            (t) => t.fieldId === field._id
          );
          completed = !!(text?.value && text.value.length > 0);
        }
      }

      completionHistory.push({
        date: log.date,
        completed,
        dayOfWeek: log.dayOfWeek,
      });
    }

    // Calculate current streak from completion history
    let currentStreakDays = 0;
    for (let i = completionHistory.length - 1; i >= 0; i--) {
      if (completionHistory[i].completed) {
        currentStreakDays++;
      } else {
        break;
      }
    }

    // Calculate best streak from completion history
    let bestStreakDays = 0;
    let tempStreak = 0;
    for (const day of completionHistory) {
      if (day.completed) {
        tempStreak++;
        bestStreakDays = Math.max(bestStreakDays, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate completion rate
    const totalDays = completionHistory.length;
    const completedDays = completionHistory.filter((d) => d.completed).length;
    const completionRate =
      totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    return {
      fieldId: field._id,
      fieldName: field.name,
      fieldType: field.type,
      completionHistory,
      currentStreak: currentStreakDays,
      bestStreak: bestStreakDays,
      completionRate,
      totalDays,
      completedDays,
      weeklyTarget: field.weeklyTarget,
    };
  },
});

/**
 * Get completion trends over time
 * Shows weekly trends and best/worst days
 */
export const getCompletionTrends = query({
  args: {
    weeks: v.optional(v.number()), // Number of weeks to analyze (default 4)
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const weeksToAnalyze = args.weeks || 4;
    const daysToAnalyze = weeksToAnalyze * 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToAnalyze);
    const startDateStr = startDate.toISOString().split("T")[0];

    // Get logs
    const logs = await ctx.db
      .query("dailyLog")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.gte(q.field("date"), startDateStr))
      .collect();

    // Get active fields
    const fields = await ctx.db
      .query("trackingFields")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", identity.subject).eq("isActive", true)
      )
      .collect();

    const completedLogs = logs.filter((log) => log.completed);

    // Group logs by week
    const weeklyData = new Map<number, Array<typeof logs[0]>>();
    for (const log of completedLogs) {
      if (!weeklyData.has(log.weekNumber)) {
        weeklyData.set(log.weekNumber, []);
      }
      weeklyData.get(log.weekNumber)!.push(log);
    }

    // Calculate weekly completion rates
    const weeklyTrends: Array<{
      weekNumber: number;
      year: number;
      completionRate: number;
      totalHabits: number;
      completedHabits: number;
    }> = [];

    for (const [weekNumber, weekLogs] of Array.from(weeklyData.entries())) {
      let totalHabitCompletions = 0;
      const totalPossible = fields.length * weekLogs.length;

      for (const field of fields) {
        for (const log of weekLogs) {
          let completed = false;

          if (field.name === "Phone Jail") {
            completed = log.tracking.phoneJail === true;
          } else if (field.type === "toggle") {
            const toggle = log.tracking.customToggles?.find(
              (t) => t.fieldId === field._id
            );
            completed = toggle?.value === true;
          } else if (field.type === "text") {
            if (field.name === "Movement") {
              completed = !!(log.tracking.movement && log.tracking.movement.length > 0);
            } else if (field.name === "Vibes") {
              completed = !!(log.tracking.vibes && log.tracking.vibes.length > 0);
            } else {
              const text = log.tracking.customTexts?.find(
                (t) => t.fieldId === field._id
              );
              completed = !!(text?.value && text.value.length > 0);
            }
          }

          if (completed) totalHabitCompletions++;
        }
      }

      const completionRate =
        totalPossible > 0
          ? Math.round((totalHabitCompletions / totalPossible) * 100)
          : 0;

      weeklyTrends.push({
        weekNumber,
        year: weekLogs[0].year,
        completionRate,
        totalHabits: fields.length,
        completedHabits: totalHabitCompletions,
      });
    }

    // Analyze day of week patterns
    const dayOfWeekStats = new Map<string, { completed: number; total: number }>();

    for (const log of completedLogs) {
      if (!dayOfWeekStats.has(log.dayOfWeek)) {
        dayOfWeekStats.set(log.dayOfWeek, { completed: 0, total: 0 });
      }

      const stats = dayOfWeekStats.get(log.dayOfWeek)!;
      stats.total += fields.length;

      for (const field of fields) {
        let completed = false;

        if (field.name === "Phone Jail") {
          completed = log.tracking.phoneJail === true;
        } else if (field.type === "toggle") {
          const toggle = log.tracking.customToggles?.find(
            (t) => t.fieldId === field._id
          );
          completed = toggle?.value === true;
        } else if (field.type === "text") {
          if (field.name === "Movement") {
            completed = !!(log.tracking.movement && log.tracking.movement.length > 0);
          } else if (field.name === "Vibes") {
            completed = !!(log.tracking.vibes && log.tracking.vibes.length > 0);
          } else {
            const text = log.tracking.customTexts?.find(
              (t) => t.fieldId === field._id
            );
            completed = !!(text?.value && text.value.length > 0);
          }
        }

        if (completed) stats.completed++;
      }
    }

    // Calculate day of week completion rates
    const dayOfWeekData: Array<{
      dayOfWeek: string;
      completionRate: number;
    }> = [];

    for (const [dayOfWeek, stats] of Array.from(dayOfWeekStats.entries())) {
      const completionRate =
        stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      dayOfWeekData.push({ dayOfWeek, completionRate });
    }

    // Find best and worst days
    dayOfWeekData.sort((a, b) => b.completionRate - a.completionRate);
    const bestDay = dayOfWeekData[0] || null;
    const worstDay = dayOfWeekData[dayOfWeekData.length - 1] || null;

    return {
      weeklyTrends: weeklyTrends.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.weekNumber - b.weekNumber;
      }),
      dayOfWeekData: dayOfWeekData.sort((a, b) => {
        const days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
        return days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek);
      }),
      bestDay,
      worstDay,
      totalWeeks: weeklyTrends.length,
    };
  },
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate completion rate for a specific tracking field
 */
function calculateCompletionRate(
  logs: Array<{
    tracking: {
      movement?: string;
      phoneJail?: boolean;
      vibes?: string;
      customToggles?: Array<{ fieldId: any; value: boolean }>;
      customTexts?: Array<{ fieldId: any; value: string }>;
    };
  }>,
  field: {
    _id: any;
    name: string;
    type: string;
  },
  totalDays: number
): number {
  if (totalDays === 0) return 0;

  let completedCount = 0;

  for (const log of logs) {
    let completed = false;

    if (field.name === "Phone Jail") {
      completed = log.tracking.phoneJail === true;
    } else if (field.type === "toggle") {
      const toggle = log.tracking.customToggles?.find(
        (t) => t.fieldId === field._id
      );
      completed = toggle?.value === true;
    } else if (field.type === "text") {
      if (field.name === "Movement") {
        completed = !!(log.tracking.movement && log.tracking.movement.length > 0);
      } else if (field.name === "Vibes") {
        completed = !!(log.tracking.vibes && log.tracking.vibes.length > 0);
      } else {
        const text = log.tracking.customTexts?.find(
          (t) => t.fieldId === field._id
        );
        completed = !!(text?.value && text.value.length > 0);
      }
    }

    if (completed) completedCount++;
  }

  return Math.round((completedCount / totalDays) * 100);
}
