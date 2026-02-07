import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * User Profile Queries & Mutations
 */

// Check if user has completed setup
export const hasCompletedSetup = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    return profile?.setupCompleted ?? false;
  },
});

// Get user profile
export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    return profile;
  },
});

// Create minimal user profile (quick onboarding)
export const createMinimalProfile = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = new Date().toISOString();

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfile")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, {
        name: args.name,
        setupCompleted: true,
        setupDate: existingProfile.setupDate || now,
        updatedAt: now,
      });
      return existingProfile._id;
    }

    // Create minimal profile with defaults
    const profileId = await ctx.db.insert("userProfile", {
      userId: identity.subject,
      name: args.name,
      role: "User", // Default
      mainProject: "Personal Growth", // Default
      northStars: {
        wealth: [],
        health: [],
        love: [],
        happiness: [],
      },
      quarterlyOKRs: [],
      coachTone: "Direkt", // Default
      setupCompleted: true,
      setupDate: now,
      createdAt: now,
      updatedAt: now,
    });

    return profileId;
  },
});

// Create user profile (during onboarding)
export const createUserProfile = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    mainProject: v.string(),
    northStars: v.object({
      wealth: v.array(v.string()),
      health: v.array(v.string()),
      love: v.array(v.string()),
      happiness: v.array(v.string()),
    }),
    quarterlyOKRs: v.optional(v.array(v.object({
      quarter: v.number(),
      year: v.number(),
      area: v.string(),
      objective: v.string(),
      keyResults: v.array(v.object({
        description: v.string(),
        target: v.number(),
        unit: v.string(),
        current: v.optional(v.number()),
      })),
    }))),
    coachTone: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = new Date().toISOString();

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfile")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (existingProfile) {
      // Update existing profile instead of creating a new one
      await ctx.db.patch(existingProfile._id, {
        name: args.name,
        role: args.role,
        mainProject: args.mainProject,
        northStars: args.northStars,
        quarterlyOKRs: args.quarterlyOKRs || [],
        coachTone: args.coachTone,
        setupCompleted: true,
        setupDate: existingProfile.setupDate || now,
        updatedAt: now,
      });
      return existingProfile._id;
    }

    const profileId = await ctx.db.insert("userProfile", {
      userId: identity.subject,
      name: args.name,
      role: args.role,
      mainProject: args.mainProject,
      northStars: args.northStars,
      quarterlyOKRs: args.quarterlyOKRs || [],
      coachTone: args.coachTone,
      setupCompleted: true,
      setupDate: now,
      createdAt: now,
      updatedAt: now,
    });

    return profileId;
  },
});

// Update North Stars
export const updateNorthStars = mutation({
  args: {
    northStars: v.object({
      wealth: v.array(v.string()),
      health: v.array(v.string()),
      love: v.array(v.string()),
      happiness: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      northStars: args.northStars,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Update Coach Tone
export const updateCoachTone = mutation({
  args: {
    tone: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      coachTone: args.tone,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Update Quarterly OKRs
export const updateQuarterlyOKRs = mutation({
  args: {
    okrs: v.array(v.object({
      area: v.string(),
      objective: v.string(),
      keyResults: v.array(v.object({
        description: v.string(),
        target: v.number(),
        unit: v.string(),
        current: v.optional(v.number()),
      })),
      year: v.number(),
      quarter: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfile")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      quarterlyOKRs: args.okrs,
      updatedAt: new Date().toISOString(),
    });
  },
});
