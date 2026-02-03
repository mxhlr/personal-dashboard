import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Tracking Fields Queries & Mutations
 */

// Get all active tracking fields for user
export const getActiveTrackingFields = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const fields = await ctx.db
      .query("trackingFields")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", identity.subject).eq("isActive", true)
      )
      .collect();

    return fields.sort((a, b) => a.order - b.order);
  },
});

// Create default tracking fields (during onboarding)
export const createDefaultTrackingFields = mutation({
  args: {
    selectedFields: v.array(v.object({
      name: v.string(),
      type: v.string(),
      hasStreak: v.boolean(),
      weeklyTarget: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = new Date().toISOString();

    // Create all selected fields
    const fieldPromises = args.selectedFields.map((field, index) =>
      ctx.db.insert("trackingFields", {
        userId: identity.subject,
        name: field.name,
        type: field.type,
        hasStreak: field.hasStreak,
        isDefault: true,
        isActive: true,
        order: index,
        currentStreak: field.hasStreak ? 0 : undefined,
        longestStreak: field.hasStreak ? 0 : undefined,
        weeklyTarget: field.weeklyTarget,
        createdAt: now,
      })
    );

    await Promise.all(fieldPromises);
  },
});

// Create custom tracking field
export const createTrackingField = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    hasStreak: v.boolean(),
    weeklyTarget: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get current max order
    const fields = await ctx.db
      .query("trackingFields")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const maxOrder = fields.length > 0
      ? Math.max(...fields.map(f => f.order))
      : -1;

    const now = new Date().toISOString();

    const fieldId = await ctx.db.insert("trackingFields", {
      userId: identity.subject,
      name: args.name,
      type: args.type,
      hasStreak: args.hasStreak,
      isDefault: false,
      isActive: true,
      order: maxOrder + 1,
      currentStreak: args.hasStreak ? 0 : undefined,
      longestStreak: args.hasStreak ? 0 : undefined,
      weeklyTarget: args.weeklyTarget,
      createdAt: now,
    });

    return fieldId;
  },
});

// Toggle field active/inactive
export const toggleFieldActive = mutation({
  args: {
    fieldId: v.id("trackingFields"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const field = await ctx.db.get(args.fieldId);
    if (!field || field.userId !== identity.subject) {
      throw new Error("Field not found");
    }

    await ctx.db.patch(args.fieldId, {
      isActive: args.isActive,
    });
  },
});

// Update weekly target
export const updateWeeklyTarget = mutation({
  args: {
    fieldId: v.id("trackingFields"),
    target: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const field = await ctx.db.get(args.fieldId);
    if (!field || field.userId !== identity.subject) {
      throw new Error("Field not found");
    }

    await ctx.db.patch(args.fieldId, {
      weeklyTarget: args.target,
    });
  },
});

// Delete tracking field (only custom fields, not defaults)
export const deleteTrackingField = mutation({
  args: {
    fieldId: v.id("trackingFields"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const field = await ctx.db.get(args.fieldId);
    if (!field || field.userId !== identity.subject) {
      throw new Error("Field not found");
    }

    // Only allow deleting custom fields (not default fields)
    if (field.isDefault) {
      throw new Error("Cannot delete default fields");
    }

    await ctx.db.delete(args.fieldId);
  },
});
