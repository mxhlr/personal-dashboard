import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Category Time Tracking
 * Tracks time spent completing category blocks
 */

// Start tracking time for a category
export const startCategoryTimer = mutation({
  args: {
    categoryId: v.id("habitCategories"),
    date: v.string(), // "YYYY-MM-DD"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = new Date().toISOString();

    // Check if a timer is already running for this category on this date
    const existingTimer = await ctx.db
      .query("categoryBlockTimes")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
      .first();

    if (existingTimer) {
      // Timer already exists, return its ID
      return existingTimer._id;
    }

    // Create a new timer record (incomplete, no completedAt yet)
    const timerId = await ctx.db.insert("categoryBlockTimes", {
      userId: identity.subject,
      date: args.date,
      categoryId: args.categoryId,
      durationMinutes: 0,
      startedAt: now,
      completedAt: "",
      createdAt: now,
    });

    return timerId;
  },
});

// Complete tracking time for a category
export const completeCategoryTimer = mutation({
  args: {
    categoryId: v.id("habitCategories"),
    date: v.string(), // "YYYY-MM-DD"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = new Date().toISOString();

    // Find the timer for this category on this date
    const timer = await ctx.db
      .query("categoryBlockTimes")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
      .first();

    if (!timer) {
      // No timer exists, cannot complete
      return null;
    }

    // If already completed, return
    if (timer.completedAt && timer.completedAt !== "") {
      return timer._id;
    }

    // Calculate duration in minutes
    const startTime = new Date(timer.startedAt);
    const endTime = new Date(now);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));

    // Update the timer with completion data
    await ctx.db.patch(timer._id, {
      completedAt: now,
      durationMinutes: durationMinutes,
    });

    return timer._id;
  },
});

// Get average block times for analytics
export const getAverageBlockTimes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get all category block times for user
    const blockTimes = await ctx.db
      .query("categoryBlockTimes")
      .withIndex("by_user_date", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.gt(q.field("durationMinutes"), 0))
      .collect();

    // Get all categories
    const categories = await ctx.db
      .query("habitCategories")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Calculate average per category
    const categoryMap = new Map(categories.map((c) => [c._id, c.name]));

    const categoryStats: Record<
      string,
      { name: string; totalMinutes: number; count: number }
    > = {};

    blockTimes.forEach((bt) => {
      const categoryName = categoryMap.get(bt.categoryId) || "Unknown";
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = {
          name: categoryName,
          totalMinutes: 0,
          count: 0,
        };
      }
      categoryStats[categoryName].totalMinutes += bt.durationMinutes;
      categoryStats[categoryName].count += 1;
    });

    const avgBlockTimes = Object.values(categoryStats).map((stat) => ({
      categoryName: stat.name,
      avgMinutes: Math.round(stat.totalMinutes / stat.count),
      logs: stat.count,
    }));

    return avgBlockTimes;
  },
});
