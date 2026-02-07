import { query, mutation } from "./_generated/server";
import { v } from "convex/values";


/**
 * Get the quarterly review for a specific year and quarter
 */
export const getQuarterlyReview = query({
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
        q.eq("userId", identity.subject).eq("year", args.year).eq("quarter", args.quarter)
      )
      .first();

    return review;
  },
});

/**
 * Get the current quarter's milestones from previous quarter's review
 */
export const getCurrentQuarterMilestones = query({
  args: {
    year: v.number(),
    quarter: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Milestones for quarter X are set in quarter X-1's review
    let targetYear = args.year;
    let targetQuarter = args.quarter - 1;

    // Handle quarter 1 edge case (get from Q4 of previous year)
    if (targetQuarter < 1) {
      targetYear = args.year - 1;
      targetQuarter = 4;
    }

    const review = await ctx.db
      .query("quarterlyReview")
      .withIndex("by_user_year_quarter", (q) =>
        q.eq("userId", identity.subject).eq("year", targetYear).eq("quarter", targetQuarter)
      )
      .first();

    return review?.nextQuarterMilestones || [];
  },
});

/**
 * Submit a quarterly review
 */
export const submitQuarterlyReview = mutation({
  args: {
    year: v.number(),
    quarter: v.number(),
    milestoneReview: v.array(
      v.object({
        area: v.string(),
        milestone: v.string(),
        completed: v.boolean(),
        notes: v.optional(v.string()),
      })
    ),
    responses: v.object({
      proudestMilestone: v.string(),
      approachDifferently: v.string(),
      learnedAboutGoals: v.string(),
      decisionDifferently: v.string(),
      needForNextQuarter: v.string(),
    }),
    nextQuarterMilestones: v.array(
      v.object({
        area: v.string(),
        milestone: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Note: Milestone review is now stored in quarterlyReview table
    // Quarterly planning is done via OKRs in userProfile.quarterlyOKRs

    // Check if review already exists
    const existingReview = await ctx.db
      .query("quarterlyReview")
      .withIndex("by_user_year_quarter", (q) =>
        q.eq("userId", identity.subject).eq("year", args.year).eq("quarter", args.quarter)
      )
      .first();

    if (existingReview) {
      // Update existing review
      await ctx.db.patch(existingReview._id, {
        milestoneReview: args.milestoneReview,
        responses: args.responses,
        nextQuarterMilestones: args.nextQuarterMilestones,
        completedAt: new Date().toISOString(),
      });
      return existingReview._id;
    } else {
      // Create new review
      const reviewId = await ctx.db.insert("quarterlyReview", {
        userId: identity.subject,
        year: args.year,
        quarter: args.quarter,
        milestoneReview: args.milestoneReview,
        responses: args.responses,
        nextQuarterMilestones: args.nextQuarterMilestones,
        completedAt: new Date().toISOString(),
      });
      return reviewId;
    }
  },
});
