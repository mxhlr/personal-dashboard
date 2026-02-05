import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Category Timer System
 * Uses habitCategories as "blocks" and categoryBlockTimes for tracking
 */

/**
 * Start timer for a category/block
 * Automatically stops any currently running timer
 */
export const startCategoryTimer = mutation({
  args: {
    categoryId: v.id("habitCategories"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];

    // Check if category exists and belongs to user
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");
    if (category.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Stop any currently running timer
    const runningTimer = await ctx.db
      .query("categoryBlockTimes")
      .withIndex("by_user_running", (q) =>
        q.eq("userId", identity.subject).eq("completedAt", undefined)
      )
      .first();

    if (runningTimer) {
      const now = new Date().toISOString();
      const startTime = new Date(runningTimer.startedAt);
      const durationMinutes = Math.round(
        (new Date(now).getTime() - startTime.getTime()) / (1000 * 60)
      );

      await ctx.db.patch(runningTimer._id, {
        completedAt: now,
        durationMinutes,
      });
    }

    // Start new timer
    const newTimerId = await ctx.db.insert("categoryBlockTimes", {
      userId: identity.subject,
      date: today,
      categoryId: args.categoryId,
      durationMinutes: 0, // Will be calculated on stop
      startedAt: new Date().toISOString(),
      completedAt: undefined,
      createdAt: new Date().toISOString(),
    });

    return newTimerId;
  },
});

/**
 * Stop the currently running timer
 */
export const stopCategoryTimer = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const runningTimer = await ctx.db
      .query("categoryBlockTimes")
      .withIndex("by_user_running", (q) =>
        q.eq("userId", identity.subject).eq("completedAt", undefined)
      )
      .first();

    if (!runningTimer) {
      throw new Error("No timer running");
    }

    const now = new Date().toISOString();
    const startTime = new Date(runningTimer.startedAt);
    const durationMinutes = Math.round(
      (new Date(now).getTime() - startTime.getTime()) / (1000 * 60)
    );

    await ctx.db.patch(runningTimer._id, {
      completedAt: now,
      durationMinutes,
    });

    return { durationMinutes };
  },
});

/**
 * Get currently running timer with category info
 */
export const getCurrentTimer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const runningTimer = await ctx.db
      .query("categoryBlockTimes")
      .withIndex("by_user_running", (q) =>
        q.eq("userId", identity.subject).eq("completedAt", undefined)
      )
      .first();

    if (!runningTimer) return null;

    const category = await ctx.db.get(runningTimer.categoryId);
    if (!category) return null;

    return {
      timerId: runningTimer._id,
      categoryId: category._id,
      categoryName: category.name,
      categoryIcon: category.icon,
      startedAt: runningTimer.startedAt,
    };
  },
});
