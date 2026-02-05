import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Analytics Queries
 * Provides review status queries for Weekly, Monthly, Quarterly, and Annual reviews
 */

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
