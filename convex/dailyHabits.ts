import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Daily Habits Queries
 * View and analyze daily habit completions
 */

// Get habits for a specific date
export const getHabitsForDate = query({
  args: {
    date: v.string(), // "YYYY-MM-DD"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const habits = await ctx.db
      .query("dailyHabits")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", args.date)
      )
      .collect();

    // Enrich with template data
    // Get all unique template IDs
    const templateIds = [...new Set(habits.map(h => h.templateId))];

    // Fetch all templates in parallel
    const templates = await Promise.all(templateIds.map(id => ctx.db.get(id)));

    // Create a map for O(1) lookup
    const templateMap = new Map(templates.filter((t): t is NonNullable<typeof t> => t !== null).map(t => [t._id, t]));

    // Enrich habits with templates
    const enrichedHabits = habits.map(habit => ({
      ...habit,
      template: templateMap.get(habit.templateId) || null
    }));

    return enrichedHabits;
  },
});

// Get today's habits
export const getTodayHabits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const today = new Date().toISOString().split('T')[0];

    const habits = await ctx.db
      .query("dailyHabits")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", today)
      )
      .collect();

    // Enrich with template data
    // Get all unique template IDs
    const templateIds = [...new Set(habits.map(h => h.templateId))];

    // Fetch all templates in parallel
    const templates = await Promise.all(templateIds.map(id => ctx.db.get(id)));

    // Create a map for O(1) lookup
    const templateMap = new Map(templates.filter((t): t is NonNullable<typeof t> => t !== null).map(t => [t._id, t]));

    // Enrich habits with templates
    const enrichedHabits = habits.map(habit => ({
      ...habit,
      template: templateMap.get(habit.templateId) || null
    }));

    return enrichedHabits;
  },
});

// Get pattern intelligence: analyze completion rates and skip reasons
export const getPatternIntelligence = query({
  args: {
    daysBack: v.optional(v.number()), // Number of days to analyze (default 30)
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const daysBack = args.daysBack || 30;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysBack);

    const startDateStr = startDate.toISOString().split('T')[0];

    // Get all habits for user in date range
    const allHabits = await ctx.db
      .query("dailyHabits")
      .withIndex("by_user_date", (q) => q.eq("userId", identity.subject))
      .collect();

    // Filter to date range
    const habitsInRange = allHabits.filter(
      (h) => h.date >= startDateStr
    );

    // Calculate overall stats
    const totalHabits = habitsInRange.length;
    const completedHabits = habitsInRange.filter((h) => h.completed).length;
    const skippedHabits = habitsInRange.filter((h) => h.skipped).length;

    const completionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

    // Analyze skip reasons
    const skipReasonCounts = new Map<string, number>();
    habitsInRange
      .filter((h) => h.skipped && h.skipReason)
      .forEach((h) => {
        const reason = h.skipReason!;
        skipReasonCounts.set(reason, (skipReasonCounts.get(reason) || 0) + 1);
      });

    const topSkipReasons = Array.from(skipReasonCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));

    // Analyze by habit template
    const templateStats = new Map<string, {
      templateId: string;
      name: string;
      total: number;
      completed: number;
      skipped: number;
      completionRate: number;
    }>();

    // Fetch all templates in batch to avoid N+1 queries
    const templateIds = [...new Set(habitsInRange.map(h => h.templateId))];
    const templates = await Promise.all(templateIds.map(id => ctx.db.get(id)));
    const templateMap = new Map(templates.filter((t): t is NonNullable<typeof t> => t !== null).map(t => [t._id, t]));

    for (const habit of habitsInRange) {
      const template = templateMap.get(habit.templateId);
      if (!template) continue;

      const key = habit.templateId;
      const existing = templateStats.get(key);

      if (existing) {
        existing.total++;
        if (habit.completed) existing.completed++;
        if (habit.skipped) existing.skipped++;
      } else {
        templateStats.set(key, {
          templateId: habit.templateId,
          name: template.name,
          total: 1,
          completed: habit.completed ? 1 : 0,
          skipped: habit.skipped ? 1 : 0,
          completionRate: 0,
        });
      }
    }

    // Calculate completion rates for each template
    const templateStatsArray = Array.from(templateStats.values()).map((stat) => ({
      ...stat,
      completionRate: stat.total > 0 ? (stat.completed / stat.total) * 100 : 0,
    }));

    // Sort by completion rate (ascending) to show struggling habits first
    templateStatsArray.sort((a, b) => a.completionRate - b.completionRate);

    // Analyze day-of-week patterns
    const dayOfWeekStats = new Map<string, { total: number; completed: number }>();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    habitsInRange.forEach((habit) => {
      const date = new Date(habit.date);
      const dayName = daysOfWeek[date.getDay()];

      const existing = dayOfWeekStats.get(dayName);
      if (existing) {
        existing.total++;
        if (habit.completed) existing.completed++;
      } else {
        dayOfWeekStats.set(dayName, {
          total: 1,
          completed: habit.completed ? 1 : 0,
        });
      }
    });

    const dayOfWeekArray = daysOfWeek.map((day) => {
      const stats = dayOfWeekStats.get(day) || { total: 0, completed: 0 };
      return {
        day,
        total: stats.total,
        completed: stats.completed,
        completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      };
    });

    return {
      period: {
        startDate: startDateStr,
        endDate: endDate.toISOString().split('T')[0],
        daysAnalyzed: daysBack,
      },
      overall: {
        totalHabits,
        completedHabits,
        skippedHabits,
        completionRate: Math.round(completionRate * 10) / 10,
      },
      topSkipReasons,
      habitPerformance: templateStatsArray,
      dayOfWeekPatterns: dayOfWeekArray,
    };
  },
});

// Get habit history for a specific template
export const getHabitHistory = query({
  args: {
    templateId: v.id("habitTemplates"),
    daysBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const daysBack = args.daysBack || 30;

    // Verify template ownership
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");
    if (template.userId !== identity.subject) throw new Error("Unauthorized");

    // Get all habits for this template
    const allHabits = await ctx.db
      .query("dailyHabits")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .collect();

    // Filter to date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysBack);
    const startDateStr = startDate.toISOString().split('T')[0];

    const habitsInRange = allHabits.filter((h) => h.date >= startDateStr);

    // Sort by date (most recent first)
    habitsInRange.sort((a, b) => b.date.localeCompare(a.date));

    return {
      template,
      habits: habitsInRange,
      stats: {
        total: habitsInRange.length,
        completed: habitsInRange.filter((h) => h.completed).length,
        skipped: habitsInRange.filter((h) => h.skipped).length,
      },
    };
  },
});
