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
