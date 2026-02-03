import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get the quarterly review for a specific year and quarter
 */
export const getQuarterlyReview = query({
  args: {
    year: v.number(),
    quarter: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const review = await ctx.db
      .query("quarterlyReview")
      .withIndex("by_user_year_quarter", (q) =>
        q.eq("userId", userId).eq("year", args.year).eq("quarter", args.quarter)
      )
      .unique();

    return review;
  },
});

/**
 * Get the current quarter's milestones from userProfile
 */
export const getCurrentQuarterMilestones = query({
  args: {
    year: v.number(),
    quarter: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      return [];
    }

    // Filter milestones for the specified quarter and year
    const milestones = profile.quarterlyMilestones.filter(
      (m) => m.quarter === args.quarter && m.year === args.year
    );

    return milestones;
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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Update milestones in userProfile based on milestoneReview
    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      // Update completion status of reviewed milestones
      const updatedMilestones = profile.quarterlyMilestones.map((milestone) => {
        const review = args.milestoneReview.find(
          (r) =>
            r.area === milestone.area &&
            r.milestone === milestone.milestone &&
            milestone.quarter === args.quarter &&
            milestone.year === args.year
        );
        if (review) {
          return { ...milestone, completed: review.completed };
        }
        return milestone;
      });

      // Add next quarter milestones to the profile
      const nextQuarter = args.quarter === 4 ? 1 : args.quarter + 1;
      const nextYear = args.quarter === 4 ? args.year + 1 : args.year;

      const newMilestones = args.nextQuarterMilestones.map((m) => ({
        quarter: nextQuarter,
        year: nextYear,
        area: m.area,
        milestone: m.milestone,
        completed: false,
      }));

      await ctx.db.patch(profile._id, {
        quarterlyMilestones: [...updatedMilestones, ...newMilestones],
        updatedAt: new Date().toISOString(),
      });
    }

    // Check if review already exists
    const existingReview = await ctx.db
      .query("quarterlyReview")
      .withIndex("by_user_year_quarter", (q) =>
        q.eq("userId", userId).eq("year", args.year).eq("quarter", args.quarter)
      )
      .unique();

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
        userId,
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
