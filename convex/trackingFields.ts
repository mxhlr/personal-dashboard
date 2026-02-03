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

// Get all tracking fields for user (active and inactive)
export const getAllTrackingFields = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const fields = await ctx.db
      .query("trackingFields")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
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

    // List of actual default field names
    const defaultFieldNames = [
      "Movement",
      "Phone Jail",
      "Vibes",
      "Breakfast",
      "Lunch",
      "Dinner",
      "Work Hours",
      "Work Notes",
    ];

    // Create all selected fields
    const fieldPromises = args.selectedFields.map((field, index) =>
      ctx.db.insert("trackingFields", {
        userId: identity.subject,
        name: field.name,
        type: field.type,
        hasStreak: field.hasStreak,
        isDefault: defaultFieldNames.includes(field.name),
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

// Fix custom fields that were incorrectly marked as default
export const fixCustomFields = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // List of actual default field names
    const defaultFieldNames = [
      "Movement",
      "Phone Jail",
      "Vibes",
      "Breakfast",
      "Lunch",
      "Dinner",
      "Work Hours",
      "Work Notes",
    ];

    // Get all fields for this user
    const fields = await ctx.db
      .query("trackingFields")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Fix fields that are marked as default but aren't in the list
    const fixPromises = fields
      .filter(f => f.isDefault && !defaultFieldNames.includes(f.name))
      .map(f => ctx.db.patch(f._id, { isDefault: false }));

    await Promise.all(fixPromises);

    return { fixed: fixPromises.length };
  },
});

// Admin function: Clean up duplicate fields and fix isDefault flags
export const adminCleanupFields = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const defaultFieldNames = [
      "Movement",
      "Phone Jail",
      "Vibes",
      "Breakfast",
      "Lunch",
      "Dinner",
      "Work Hours",
      "Work Notes",
    ];

    // Get all fields for this user
    const fields = await ctx.db
      .query("trackingFields")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const results = {
      fixed: 0,
      deleted: 0,
      duplicatesRemoved: [] as string[],
      fieldsFixed: [] as string[],
    };

    // Group fields by name to find duplicates
    const fieldsByName = new Map<string, typeof fields>();
    for (const field of fields) {
      const existing = fieldsByName.get(field.name);
      if (!existing) {
        fieldsByName.set(field.name, [field]);
      } else {
        existing.push(field);
      }
    }

    // Process each field group
    for (const [name, fieldsWithName] of Array.from(fieldsByName.entries())) {
      const isDefaultField = defaultFieldNames.includes(name);

      if (fieldsWithName.length > 1) {
        // Handle duplicates - keep the oldest one, delete the rest
        const sorted = fieldsWithName.sort((a, b) => a._creationTime - b._creationTime);
        const keepField = sorted[0];
        const deleteFields = sorted.slice(1);

        // Fix the isDefault flag on the kept field
        if (keepField.isDefault !== isDefaultField) {
          await ctx.db.patch(keepField._id, { isDefault: isDefaultField });
          results.fixed++;
          results.fieldsFixed.push(name);
        }

        // Delete duplicates
        for (const field of deleteFields) {
          await ctx.db.delete(field._id);
          results.deleted++;
          results.duplicatesRemoved.push(name);
        }
      } else {
        // Single field - just fix isDefault if needed
        const field = fieldsWithName[0];
        if (field.isDefault !== isDefaultField) {
          await ctx.db.patch(field._id, { isDefault: isDefaultField });
          results.fixed++;
          results.fieldsFixed.push(name);
        }
      }
    }

    return results;
  },
});
