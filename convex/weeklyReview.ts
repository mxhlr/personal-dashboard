import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get the weekly review for a specific year and week
 */
export const getWeeklyReview = query({
  args: {
    year: v.number(),
    weekNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const review = await ctx.db
      .query("weeklyReview")
      .withIndex("by_user_year_week", (q) =>
        q.eq("userId", userId).eq("year", args.year).eq("weekNumber", args.weekNumber)
      )
      .unique();

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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if review already exists
    const existingReview = await ctx.db
      .query("weeklyReview")
      .withIndex("by_user_year_week", (q) =>
        q.eq("userId", userId).eq("year", args.year).eq("weekNumber", args.weekNumber)
      )
      .unique();

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
        userId,
        year: args.year,
        weekNumber: args.weekNumber,
        responses: args.responses,
        completedAt: new Date().toISOString(),
      });
      return reviewId;
    }
  },
});
