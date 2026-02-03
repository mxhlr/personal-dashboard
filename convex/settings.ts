import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Update basic profile info
export const updateProfile = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    mainProject: v.string(),
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
      throw new Error("Profile not found");
    }

    await ctx.db.patch(profile._id, {
      name: args.name,
      role: args.role,
      mainProject: args.mainProject,
      updatedAt: new Date().toISOString(),
    });

    return profile._id;
  },
});

// Update North Stars
export const updateNorthStars = mutation({
  args: {
    northStars: v.object({
      wealth: v.string(),
      health: v.string(),
      love: v.string(),
      happiness: v.string(),
    }),
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
      throw new Error("Profile not found");
    }

    await ctx.db.patch(profile._id, {
      northStars: args.northStars,
      updatedAt: new Date().toISOString(),
    });

    return profile._id;
  },
});

// Update coach tone
export const updateCoachTone = mutation({
  args: {
    coachTone: v.string(),
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
      throw new Error("Profile not found");
    }

    await ctx.db.patch(profile._id, {
      coachTone: args.coachTone,
      updatedAt: new Date().toISOString(),
    });

    return profile._id;
  },
});

// Get user profile for settings
export const getProfile = query({
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

    return profile;
  },
});
