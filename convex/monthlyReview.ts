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
    nextMonthOKRs: v.optional(v.array(v.object({
      objective: v.string(),
      area: v.string(),
      keyResults: v.array(v.object({
        description: v.string(),
        target: v.number(),
        unit: v.string(),
      })),
    }))),
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
        nextMonthOKRs: args.nextMonthOKRs,
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
        nextMonthOKRs: args.nextMonthOKRs,
        completedAt: new Date().toISOString(),
      });
      return reviewId;
    }
  },
});

/**
 * Get monthly OKRs for the current month
 */
export const getMonthlyOKRs = query({
  args: {
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // OKRs are set in LAST month's review for THIS month
    // So we need to look at (year, month - 1)
    let targetYear = args.year;
    let targetMonth = args.month - 1;

    // Handle month 1 edge case (get from December of previous year)
    if (targetMonth < 1) {
      targetYear = args.year - 1;
      targetMonth = 12;
    }

    const review = await ctx.db
      .query("monthlyReview")
      .withIndex("by_user_year_month", (q) =>
        q.eq("userId", identity.subject).eq("year", targetYear).eq("month", targetMonth)
      )
      .first();

    return review?.nextMonthOKRs || [];
  },
});

/**
 * Update monthly OKRs for a specific month
 */
export const updateMonthlyOKRs = mutation({
  args: {
    year: v.number(),
    month: v.number(),
    okrs: v.array(v.object({
      objective: v.string(),
      area: v.string(),
      keyResults: v.array(v.object({
        description: v.string(),
        target: v.number(),
        unit: v.string(),
      })),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // OKRs for month X are stored in month X-1's review
    let targetYear = args.year;
    let targetMonth = args.month - 1;

    // Handle month 1 edge case
    if (targetMonth < 1) {
      targetYear = args.year - 1;
      targetMonth = 12;
    }

    // Find or create the review
    const existingReview = await ctx.db
      .query("monthlyReview")
      .withIndex("by_user_year_month", (q) =>
        q.eq("userId", identity.subject).eq("year", targetYear).eq("month", targetMonth)
      )
      .first();

    if (existingReview) {
      // Update existing review
      await ctx.db.patch(existingReview._id, {
        nextMonthOKRs: args.okrs,
      });
      return existingReview._id;
    } else {
      // Create new review with empty responses
      const reviewId = await ctx.db.insert("monthlyReview", {
        userId: identity.subject,
        year: targetYear,
        month: targetMonth,
        responses: {
          biggestSuccess: "",
          patternToChange: "",
          learnedAboutSelf: "",
          biggestSurprise: "",
          proudOf: "",
          nextMonthFocus: "",
        },
        nextMonthOKRs: args.okrs,
        completedAt: new Date().toISOString(),
      });
      return reviewId;
    }
  },
});
