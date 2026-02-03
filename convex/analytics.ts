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

// Calculate wellbeing trends for a set of logs
export const getWellbeingTrends = query({
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

    if (logs.length === 0) {
      return {
        avgEnergy: 0,
        avgSatisfaction: 0,
        avgStress: 0,
        count: 0,
        trend: [],
      };
    }

    const withWellbeing = logs.filter((log) => log.wellbeing);

    if (withWellbeing.length === 0) {
      return {
        avgEnergy: 0,
        avgSatisfaction: 0,
        avgStress: 0,
        count: 0,
        trend: [],
      };
    }

    const totalEnergy = withWellbeing.reduce(
      (sum, log) => sum + (log.wellbeing?.energy || 0),
      0
    );
    const totalSatisfaction = withWellbeing.reduce(
      (sum, log) => sum + (log.wellbeing?.satisfaction || 0),
      0
    );
    const totalStress = withWellbeing.reduce(
      (sum, log) => sum + (log.wellbeing?.stress || 0),
      0
    );

    return {
      avgEnergy: Math.round((totalEnergy / withWellbeing.length) * 10) / 10,
      avgSatisfaction:
        Math.round((totalSatisfaction / withWellbeing.length) * 10) / 10,
      avgStress: Math.round((totalStress / withWellbeing.length) * 10) / 10,
      count: withWellbeing.length,
      trend: withWellbeing.map((log) => ({
        date: log.date,
        energy: log.wellbeing?.energy || 0,
        satisfaction: log.wellbeing?.satisfaction || 0,
        stress: log.wellbeing?.stress || 0,
      })),
    };
  },
});

// Get tracking performance for date range
export const getTrackingPerformance = query({
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
