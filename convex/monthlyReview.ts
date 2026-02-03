import { query, mutation } from "./_generated/server";
import { v } from "convex/values";


/**
 * Get the monthly review for a specific year and month
 */
export const getMonthlyReview = query({
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
        q.eq("userId", identity.subject).eq("year", args.year).eq("month", args.month)
      )
      .first();

    return review;
  },
});

/**
 * Submit a monthly review
 */
export const submitMonthlyReview = mutation({
  args: {
    year: v.number(),
    month: v.number(),
    responses: v.object({
      biggestSuccess: v.string(),
      patternToChange: v.string(),
      learnedAboutSelf: v.string(),
      biggestSurprise: v.string(),
      proudOf: v.string(),
      nextMonthFocus: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if review already exists
    const existingReview = await ctx.db
      .query("monthlyReview")
      .withIndex("by_user_year_month", (q) =>
        q.eq("userId", identity.subject).eq("year", args.year).eq("month", args.month)
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
      const reviewId = await ctx.db.insert("monthlyReview", {
        userId: identity.subject,
        year: args.year,
        month: args.month,
        responses: args.responses,
        completedAt: new Date().toISOString(),
      });
      return reviewId;
    }
  },
});
