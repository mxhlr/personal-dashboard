import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Habit Templates CRUD
 * Templates define habits with XP values that can be instantiated daily
 */

// List all templates (optionally filtered by category)
export const listTemplates = query({
  args: {
    categoryId: v.optional(v.id("habitCategories")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    if (args.categoryId !== undefined) {
      // Get templates for a specific category
      const categoryId = args.categoryId;
      const allTemplates = await ctx.db
        .query("habitTemplates")
        .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
        .collect();

      // Sort by order
      allTemplates.sort((a, b) => a.order - b.order);

      return allTemplates;
    } else {
      // Get all templates for user
      const templates = await ctx.db
        .query("habitTemplates")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject))
        .collect();

      return templates;
    }
  },
});

// Create a new habit template
export const createTemplate = mutation({
  args: {
    categoryId: v.id("habitCategories"),
    name: v.string(),
    subtitle: v.optional(v.string()),
    xpValue: v.number(),
    isCore: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify category ownership
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");
    if (category.userId !== identity.subject) throw new Error("Unauthorized");

    const now = new Date().toISOString();

    // Get max order for this category
    const existingTemplates = await ctx.db
      .query("habitTemplates")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    const maxOrder = existingTemplates.reduce((max, t) => Math.max(max, t.order), -1);

    const templateId = await ctx.db.insert("habitTemplates", {
      userId: identity.subject,
      categoryId: args.categoryId,
      name: args.name,
      subtitle: args.subtitle,
      xpValue: args.xpValue,
      isCore: args.isCore,
      order: maxOrder + 1,
      createdAt: now,
    });

    return templateId;
  },
});

// Update an existing template (including XP value)
export const updateTemplate = mutation({
  args: {
    templateId: v.id("habitTemplates"),
    name: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    xpValue: v.optional(v.number()),
    isCore: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");
    if (template.userId !== identity.subject) throw new Error("Unauthorized");

    const updates: any = {};

    if (args.name !== undefined) updates.name = args.name;
    if (args.subtitle !== undefined) updates.subtitle = args.subtitle;
    if (args.xpValue !== undefined) updates.xpValue = args.xpValue;
    if (args.isCore !== undefined) updates.isCore = args.isCore;

    await ctx.db.patch(args.templateId, updates);
  },
});

// Delete a habit template
export const deleteTemplate = mutation({
  args: {
    templateId: v.id("habitTemplates"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");
    if (template.userId !== identity.subject) throw new Error("Unauthorized");

    // Delete all daily habits for this template
    const dailyHabits = await ctx.db
      .query("dailyHabits")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .collect();

    for (const habit of dailyHabits) {
      await ctx.db.delete(habit._id);
    }

    // Delete the template
    await ctx.db.delete(args.templateId);
  },
});

// Reorder templates within a category
export const reorderTemplates = mutation({
  args: {
    categoryId: v.id("habitCategories"),
    templateIds: v.array(v.id("habitTemplates")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify category ownership
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");
    if (category.userId !== identity.subject) throw new Error("Unauthorized");

    // Update the order of each template
    for (let i = 0; i < args.templateIds.length; i++) {
      const templateId = args.templateIds[i];
      const template = await ctx.db.get(templateId);

      if (!template) continue;
      if (template.userId !== identity.subject) throw new Error("Unauthorized");
      if (template.categoryId !== args.categoryId) {
        throw new Error("Template does not belong to this category");
      }

      await ctx.db.patch(templateId, {
        order: i,
      });
    }
  },
});
