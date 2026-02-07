import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the weekly review for a specific year and week
 */
export const getWeeklyReview = query({
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
        q.eq("userId", identity.subject).eq("year", args.year).eq("weekNumber", args.weekNumber)
      )
      .first();

    return review;
  },
});

/**
 * Submit a weekly review
 */
export const submitWeeklyReview = mutation({
  args: {
    year: v.number(),
    weekNumber: v.number(),
    responses: v.object({
      biggestSuccess: v.string(),
      mostFrustrating: v.string(),
      differentlyNextTime: v.string(),
      learned: v.string(),
      nextWeekFocus: v.string(),
    }),
    nextWeekGoals: v.optional(v.array(v.object({
      goal: v.string(),
      category: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if review already exists
    const existingReview = await ctx.db
      .query("weeklyReview")
      .withIndex("by_user_year_week", (q) =>
        q.eq("userId", identity.subject).eq("year", args.year).eq("weekNumber", args.weekNumber)
      )
      .first();

    if (existingReview) {
      // Update existing review
      await ctx.db.patch(existingReview._id, {
        responses: args.responses,
        nextWeekGoals: args.nextWeekGoals,
        completedAt: new Date().toISOString(),
      });
      return existingReview._id;
    } else {
      // Create new review
      const reviewId = await ctx.db.insert("weeklyReview", {
        userId: identity.subject,
        year: args.year,
        weekNumber: args.weekNumber,
        responses: args.responses,
        nextWeekGoals: args.nextWeekGoals,
        completedAt: new Date().toISOString(),
      });
      return reviewId;
    }
  },
});

/**
 * Get weekly goals for the current week
 */
export const getWeeklyGoals = query({
  args: {
    year: v.number(),
    weekNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Goals are set in LAST week's review for THIS week
    // So we need to look at (year, weekNumber - 1)
    let targetYear = args.year;
    let targetWeek = args.weekNumber - 1;

    // Handle week 1 edge case (get from last week of previous year)
    if (targetWeek < 1) {
      targetYear = args.year - 1;
      targetWeek = 52; // Approximate last week of previous year
    }

    const review = await ctx.db
      .query("weeklyReview")
      .withIndex("by_user_year_week", (q) =>
        q.eq("userId", identity.subject).eq("year", targetYear).eq("weekNumber", targetWeek)
      )
      .first();

    return review?.nextWeekGoals || [];
  },
});

/**
 * Update weekly goals for a specific week
 */
export const updateWeeklyGoals = mutation({
  args: {
    year: v.number(),
    weekNumber: v.number(),
    goals: v.array(v.object({
      goal: v.string(),
      category: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Goals for week X are stored in week X-1's review
    let targetYear = args.year;
    let targetWeek = args.weekNumber - 1;

    // Handle week 1 edge case
    if (targetWeek < 1) {
      targetYear = args.year - 1;
      targetWeek = 52;
    }

    // Find or create the review
    const existingReview = await ctx.db
      .query("weeklyReview")
      .withIndex("by_user_year_week", (q) =>
        q.eq("userId", identity.subject).eq("year", targetYear).eq("weekNumber", targetWeek)
      )
      .first();

    if (existingReview) {
      // Update existing review
      await ctx.db.patch(existingReview._id, {
        nextWeekGoals: args.goals,
      });
      return existingReview._id;
    } else {
      // Create new review with empty responses
      const reviewId = await ctx.db.insert("weeklyReview", {
        userId: identity.subject,
        year: targetYear,
        weekNumber: targetWeek,
        responses: {
          biggestSuccess: "",
          mostFrustrating: "",
          differentlyNextTime: "",
          learned: "",
          nextWeekFocus: "",
        },
        nextWeekGoals: args.goals,
        completedAt: new Date().toISOString(),
      });
      return reviewId;
    }
  },
});
