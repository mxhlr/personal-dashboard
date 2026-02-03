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
        completedAt: new Date().toISOString(),
      });
      return reviewId;
    }
  },
});
