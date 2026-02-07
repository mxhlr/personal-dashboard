import { query, mutation } from "./_generated/server";
import { v } from "convex/values";


/**
 * Get the annual review for a specific year
 */
export const getAnnualReview = query({
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

    return review;
  },
});

/**
 * Get the current North Stars from userProfile
 */
export const getCurrentNorthStars = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!profile) {
      return null;
    }

    return profile.northStars;
  },
});

/**
 * Submit an annual review
 */
export const submitAnnualReview = mutation({
  args: {
    year: v.number(),
    northStarReview: v.object({
      wealth: v.object({ achieved: v.string(), notes: v.string() }),
      health: v.object({ achieved: v.string(), notes: v.string() }),
      love: v.object({ achieved: v.string(), notes: v.string() }),
      happiness: v.object({ achieved: v.string(), notes: v.string() }),
    }),
    responses: v.object({
      yearInOneSentence: v.string(),
      turningPoint: v.string(),
      mostProudOf: v.string(),
      topThreeLearnings: v.string(),
      stopStartContinue: v.string(),
      nextYearNorthStars: v.object({
        wealth: v.array(v.string()),
        health: v.array(v.string()),
        love: v.array(v.string()),
        happiness: v.array(v.string()),
      }),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Update North Stars in userProfile with next year's North Stars
    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        northStars: args.responses.nextYearNorthStars,
        updatedAt: new Date().toISOString(),
      });
    }

    // Check if review already exists
    const existingReview = await ctx.db
      .query("annualReview")
      .withIndex("by_user_year", (q) =>
        q.eq("userId", identity.subject).eq("year", args.year)
      )
      .first();

    if (existingReview) {
      // Update existing review
      await ctx.db.patch(existingReview._id, {
        northStarReview: args.northStarReview,
        responses: args.responses,
        completedAt: new Date().toISOString(),
      });
      return existingReview._id;
    } else {
      // Create new review
      const reviewId = await ctx.db.insert("annualReview", {
        userId: identity.subject,
        year: args.year,
        northStarReview: args.northStarReview,
        responses: args.responses,
        completedAt: new Date().toISOString(),
      });
      return reviewId;
    }
  },
});
