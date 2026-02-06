import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Habit Analytics - Pattern Intelligence
 * Analyzes habit completion patterns for the new gamification system
 */

export const getPatternIntelligence = query({
  args: {
    daysBack: v.optional(v.number()), // Default: 30 days
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const daysBack = args.daysBack || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    const startDateStr = startDate.toISOString().split("T")[0];

    // Get all habit templates for user
    const templates = await ctx.db
      .query("habitTemplates")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    if (templates.length === 0) {
      return {
        lowCompletionHabits: [],
        commonSkipReasons: [],
        recommendations: [],
      };
    }

    // Get all daily habits for the date range
    const dailyHabits = await ctx.db
      .query("dailyHabits")
      .withIndex("by_user_date", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.gte(q.field("date"), startDateStr))
      .collect();

    // Analyze each habit template
    const habitAnalysis = templates.map((template) => {
      const habitEntries = dailyHabits.filter(
        (dh) => dh.templateId === template._id
      );

      const completedCount = habitEntries.filter((h) => h.completed).length;
      const skippedCount = habitEntries.filter((h) => h.skipped).length;
      const totalDays = habitEntries.length;

      const completionRate =
        totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

      return {
        templateId: template._id,
        name: template.name,
        completionRate,
        completedCount,
        skippedCount,
        totalDays,
        xpValue: template.xpValue,
      };
    });

    // Find habits with low completion rates (< 30%)
    const lowCompletionHabits = habitAnalysis
      .filter((h) => h.totalDays > 0 && h.completionRate < 30)
      .sort((a, b) => a.completionRate - b.completionRate)
      .slice(0, 5) // Top 5 worst
      .map((h) => ({
        name: h.name,
        rate: h.completionRate,
      }));

    // Analyze skip reasons
    const skipReasonCounts: Record<string, number> = {};
    dailyHabits
      .filter((h) => h.skipped && h.skipReason)
      .forEach((h) => {
        const reason = h.skipReason!;
        skipReasonCounts[reason] = (skipReasonCounts[reason] || 0) + 1;
      });

    const commonSkipReasons = Object.entries(skipReasonCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3) // Top 3 reasons
      .map(([reason, count]) => ({
        reason,
        count,
      }));

    // Generate recommendations
    const recommendations: string[] = [];

    if (lowCompletionHabits.length > 0) {
      const worstHabit = lowCompletionHabits[0];
      recommendations.push(
        `"${worstHabit.name}" only completed ${worstHabit.rate}% of the time. Consider breaking it down or reducing XP to make it less intimidating.`
      );
    }

    if (commonSkipReasons.length > 0) {
      const topReason = commonSkipReasons[0];
      recommendations.push(
        `Most common skip reason: "${topReason.reason}" (${topReason.count}x). Try adjusting your schedule or habit timing.`
      );
    }

    const avgCompletionRate =
      habitAnalysis.length > 0
        ? habitAnalysis.reduce((sum, h) => sum + h.completionRate, 0) /
          habitAnalysis.length
        : 0;

    if (avgCompletionRate < 50) {
      recommendations.push(
        "Your overall completion rate is below 50%. Consider focusing on fewer habits to build consistency."
      );
    }

    if (avgCompletionRate >= 80) {
      recommendations.push(
        "Amazing work! You're maintaining an 80%+ completion rate. Consider adding more challenging habits."
      );
    }

    return {
      lowCompletionHabits,
      commonSkipReasons,
      recommendations,
    };
  },
});

export const getHabitHistory = query({
  args: {
    templateId: v.id("habitTemplates"),
    daysBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const daysBack = args.daysBack || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    const startDateStr = startDate.toISOString().split("T")[0];

    const history = await ctx.db
      .query("dailyHabits")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .filter((q) => q.gte(q.field("date"), startDateStr))
      .collect();

    const completedDays = history.filter((h) => h.completed).length;
    const skippedDays = history.filter((h) => h.skipped).length;
    const totalDays = history.length;

    return {
      history,
      completedDays,
      skippedDays,
      totalDays,
      completionRate:
        totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
    };
  },
});

/**
 * Get comprehensive analytics for the new Data page
 */
export const getComprehensiveAnalytics = query({
  args: {
    year: v.optional(v.number()),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentDate = new Date();
    const year = args.year || currentDate.getFullYear();
    const month = args.month !== undefined ? args.month : currentDate.getMonth() + 1;

    // Get all daily habits for the user
    const allDailyHabits = await ctx.db
      .query("dailyHabits")
      .withIndex("by_user_date", (q) => q.eq("userId", identity.subject))
      .collect();

    // Get all habit templates and categories
    const templates = await ctx.db
      .query("habitTemplates")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const categories = await ctx.db
      .query("habitCategories")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Calculate daily scores for calendar heatmap
    const dailyScores: Record<string, { score: number; xp: number }> = {};
    const dateGroups: Record<string, typeof allDailyHabits> = {};

    allDailyHabits.forEach((habit) => {
      if (!dateGroups[habit.date]) {
        dateGroups[habit.date] = [];
      }
      dateGroups[habit.date].push(habit);
    });

    Object.entries(dateGroups).forEach(([date, habits]) => {
      const completed = habits.filter((h) => h.completed).length;
      const total = habits.length;
      const score = total > 0 ? Math.round((completed / total) * 100) : 0;
      const xp = habits.reduce((sum, h) => sum + (h.completed ? h.xpEarned : 0), 0);
      dailyScores[date] = { score, xp };
    });

    // Calculate monthly comparison (current year: January - December)
    const monthlyStats: Array<{ month: string; score: number }> = [];
    for (let monthNum = 1; monthNum <= 12; monthNum++) {
      const targetYear = year;
      const targetMonth = monthNum;

      const monthHabits = allDailyHabits.filter((h) => {
        const [y, m] = h.date.split("-").map(Number);
        return y === targetYear && m === targetMonth;
      });

      const monthlyDateGroups: Record<string, typeof allDailyHabits> = {};
      monthHabits.forEach((habit) => {
        if (!monthlyDateGroups[habit.date]) {
          monthlyDateGroups[habit.date] = [];
        }
        monthlyDateGroups[habit.date].push(habit);
      });

      const dailyScoresForMonth = Object.values(monthlyDateGroups).map((habits) => {
        const completed = habits.filter((h) => h.completed).length;
        const total = habits.length;
        return total > 0 ? (completed / total) * 100 : 0;
      });

      const avgScore =
        dailyScoresForMonth.length > 0
          ? Math.round(
              dailyScoresForMonth.reduce((sum, s) => sum + s, 0) / dailyScoresForMonth.length
            )
          : 0;

      // Generate month label
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      monthlyStats.push({
        month: monthNames[monthNum - 1],
        score: avgScore,
      });
    }

    // All-time stats - Get from userStats
    const userStats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    const allDailyScores = Object.values(dailyScores).map((d) => d.score);
    const perfect = allDailyScores.filter((s) => s === 100).length;

    // Use totalWins from userStats, or fallback to 0
    const totalWins = userStats?.totalWins || 0;

    // Use longestStreak from userStats instead of calculating
    const bestStreak = userStats?.longestStreak || 0;

    // Skip patterns - Initialize all categories with 0
    const skipReasons: Record<string, number> = {};

    // First, add all categories with 0
    categories.forEach((category) => {
      skipReasons[category.name] = 0;
    });

    // Then count actual skips
    allDailyHabits
      .filter((h) => h.skipped && h.skipReason)
      .forEach((h) => {
        const reason = h.skipReason!;
        skipReasons[reason] = (skipReasons[reason] || 0) + 1;
      });

    const skipPatterns = Object.entries(skipReasons)
      .sort(([, a], [, b]) => b - a)
      .map(([reason, count]) => ({ reason, count }));

    // Average block times - get from categoryTimeTracking
    const blockTimes = await ctx.db
      .query("categoryBlockTimes")
      .withIndex("by_user_date", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.gt(q.field("durationMinutes"), 0))
      .collect();

    const categoryStats: Record<
      string,
      { name: string; totalMinutes: number; count: number }
    > = {};

    for (const bt of blockTimes) {
      const category = categories.find((c) => c._id === bt.categoryId);
      const categoryName = category?.name || "Unknown";

      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = {
          name: categoryName,
          totalMinutes: 0,
          count: 0,
        };
      }
      categoryStats[categoryName].totalMinutes += bt.durationMinutes;
      categoryStats[categoryName].count += 1;
    }

    const avgBlockTimes = Object.values(categoryStats).map((stat) => ({
      categoryName: stat.name,
      avgMinutes: Math.round(stat.totalMinutes / stat.count),
      logs: stat.count,
    }));

    return {
      dailyScores,
      monthlyStats,
      allTimeStats: {
        totalWins,
        perfect,
        bestStreak,
      },
      skipPatterns,
      avgBlockTimes,
    };
  },
});
