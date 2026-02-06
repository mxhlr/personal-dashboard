import { v } from "convex/values";
import { logger } from "@/lib/logger";
import { mutation, query, internalMutation } from "./_generated/server";
import { logger } from "@/lib/logger";

/**
 * Habit Categories CRUD
 * User-configurable categories for organizing habits
 */

// List all categories for the current user
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const categories = await ctx.db
      .query("habitCategories")
      .withIndex("by_user_order", (q) => q.eq("userId", identity.subject))
      .collect();

    return categories;
  },
});

// Create a new category
export const createCategory = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
    requiresCoreCompletion: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = new Date().toISOString();

    // Get the current max order
    const existingCategories = await ctx.db
      .query("habitCategories")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const maxOrder = existingCategories.reduce((max, cat) => Math.max(max, cat.order), -1);

    const categoryId = await ctx.db.insert("habitCategories", {
      userId: identity.subject,
      name: args.name,
      icon: args.icon,
      order: maxOrder + 1,
      requiresCoreCompletion: args.requiresCoreCompletion,
      createdAt: now,
      updatedAt: now,
    });

    return categoryId;
  },
});

// Update an existing category
export const updateCategory = mutation({
  args: {
    categoryId: v.id("habitCategories"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
    requiresCoreCompletion: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");
    if (category.userId !== identity.subject) throw new Error("Unauthorized");

    const now = new Date().toISOString();

    type CategoryUpdate = Partial<Pick<typeof category, 'name' | 'icon' | 'requiresCoreCompletion'>> & {
      updatedAt: string
    };

    const updates: CategoryUpdate = { updatedAt: now };

    if (args.name !== undefined) updates.name = args.name;
    if (args.icon !== undefined) updates.icon = args.icon;
    if (args.requiresCoreCompletion !== undefined) {
      updates.requiresCoreCompletion = args.requiresCoreCompletion;
    }

    await ctx.db.patch(args.categoryId, updates);
  },
});

// Delete a category (and all its templates)
export const deleteCategory = mutation({
  args: {
    categoryId: v.id("habitCategories"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");
    if (category.userId !== identity.subject) throw new Error("Unauthorized");

    // Delete all templates in this category
    const templates = await ctx.db
      .query("habitTemplates")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    for (const template of templates) {
      // Delete all daily habits for this template
      const dailyHabits = await ctx.db
        .query("dailyHabits")
        .withIndex("by_template", (q) => q.eq("templateId", template._id))
        .collect();

      for (const habit of dailyHabits) {
        await ctx.db.delete(habit._id);
      }

      await ctx.db.delete(template._id);
    }

    // Delete the category
    await ctx.db.delete(args.categoryId);
  },
});

// Reorder categories
export const reorderCategories = mutation({
  args: {
    categoryIds: v.array(v.id("habitCategories")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = new Date().toISOString();

    // Update the order of each category
    for (let i = 0; i < args.categoryIds.length; i++) {
      const categoryId = args.categoryIds[i];
      const category = await ctx.db.get(categoryId);

      if (!category) continue;
      if (category.userId !== identity.subject) throw new Error("Unauthorized");

      await ctx.db.patch(categoryId, {
        order: i,
        updatedAt: now,
      });
    }
  },
});

// Admin: Remove leading numbers from category names
export const fixCategoryNames = internalMutation({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("habitCategories").collect();

    let updated = 0;

    for (const category of categories) {
      // Remove leading numbers and dots/spaces (e.g., "1. Plan day" -> "Plan day")
      const cleanName = category.name.replace(/^\d+\.\s*/, "").trim();

      if (cleanName !== category.name) {
        await ctx.db.patch(category._id, {
          name: cleanName,
          updatedAt: new Date().toISOString(),
        });
        logger.log(`Updated: "${category.name}" -> "${cleanName}"`);
        updated++;
      }
    }

    return { message: `Updated ${updated} category names`, total: categories.length };
  },
});
