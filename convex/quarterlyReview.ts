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
 * Get the current quarter's OKRs from userProfile
 */
export const getCurrentQuarterOKRs = query({
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

    if (!profile || !profile.quarterlyOKRs) {
      return [];
    }

    // Filter OKRs for the current quarter
    const currentOKRs = profile.quarterlyOKRs.filter(
      (okr) => okr.quarter === args.quarter && okr.year === args.year
    );

    return currentOKRs;
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
    nextQuarterOKRs: v.array(
      v.object({
        area: v.string(),
        objective: v.string(),
        quarter: v.number(),
        year: v.number(),
        keyResults: v.array(
          v.object({
            description: v.string(),
            target: v.number(),
            unit: v.string(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

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
        completedAt: new Date().toISOString(),
      });
    } else {
      // Create new review
      await ctx.db.insert("quarterlyReview", {
        userId: identity.subject,
        year: args.year,
        quarter: args.quarter,
        milestoneReview: args.milestoneReview,
        responses: args.responses,
        completedAt: new Date().toISOString(),
      });
    }

    // Update user profile with quarterly OKRs
    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (profile) {
      // Get existing OKRs and filter out OKRs for the next quarter/year
      const existingOKRs = profile.quarterlyOKRs || [];
      const nextQuarter = args.nextQuarterOKRs[0]?.quarter;
      const nextYear = args.nextQuarterOKRs[0]?.year;

      const filteredOKRs = existingOKRs.filter(
        (okr) => !(okr.quarter === nextQuarter && okr.year === nextYear)
      );

      // Add new OKRs
      const updatedOKRs = [...filteredOKRs, ...args.nextQuarterOKRs];

      await ctx.db.patch(profile._id, {
        quarterlyOKRs: updatedOKRs,
      });
    }

    return existingReview?._id;
  },
});
