import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * User Migration Functions
 *
 * These mutations allow users to opt-in to the new gamification system
 * from the UI. They are safe to call multiple times (idempotent).
 */

/**
 * Check if user has been migrated to the new habit system
 */
export const checkMigrationStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    // Check if user has habit categories
    const categories = await ctx.db
      .query("habitCategories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Check if user has userStats
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Check existing tracking fields for context
    const trackingFields = await ctx.db
      .query("trackingFields")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return {
      isMigrated: categories.length > 0,
      hasStats: stats !== null,
      categoriesCount: categories.length,
      trackingFieldsCount: trackingFields.length,
      stats: stats
        ? {
            level: stats.level,
            totalXP: stats.totalXP,
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak,
          }
        : null,
    };
  },
});

/**
 * Migrate current user to the new habit system
 *
 * This is the main function users call from the UI to opt-in to gamification.
 * It's idempotent - safe to call multiple times.
 */
export const migrateToHabitSystem = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    // Check if already migrated
    const existingCategories = await ctx.db
      .query("habitCategories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (existingCategories.length > 0) {
      return {
        success: false,
        message: "You have already migrated to the new habit system",
        alreadyMigrated: true,
      };
    }

    try {
      // Call the internal seed function
      const result = await ctx.scheduler.runAfter(
        0,
        internal.migrations.seedHabitSystem.seedHabitSystemForUser,
        { userId }
      );

      return {
        success: true,
        message: "Successfully migrated to the new habit system!",
        alreadyMigrated: false,
      };
    } catch (error) {
      console.error("Migration error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Migration failed",
        alreadyMigrated: false,
      };
    }
  },
});

/**
 * Get migration preview - shows what will be created
 */
export const getMigrationPreview = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Return a preview of what will be created
    return {
      categories: [
        {
          name: "Physical Foundation",
          icon: "🏃",
          habits: ["Movement (+25 XP)", "Breakfast (+15 XP)", "Lunch (+15 XP)", "Dinner (+15 XP)"],
        },
        {
          name: "Mental Clarity",
          icon: "🧠",
          habits: ["Phone Jail (+10 XP)", "Vibes/Energy (+5 XP)"],
        },
        {
          name: "Deep Work",
          icon: "💼",
          habits: ["Work Hours (+20 XP)", "Work Notes (+10 XP)"],
        },
        {
          name: "Evening Routine",
          icon: "🌙",
          habits: [
            "Energy Reflection (+3 XP)",
            "Satisfaction Reflection (+3 XP)",
            "Stress Reflection (+3 XP)",
          ],
        },
      ],
      totalCategories: 4,
      totalHabits: 13,
      totalPossibleXP: 124, // Sum of all XP values
    };
  },
});

/**
 * Reset habit system (for testing or if user wants to start over)
 *
 * WARNING: This deletes all habit data and starts fresh.
 * Use with caution!
 */
export const resetHabitSystem = mutation({
  args: {
    confirmReset: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    if (!args.confirmReset) {
      throw new Error("Reset not confirmed");
    }

    const userId = identity.subject;

    // Delete all daily habits
    const dailyHabits = await ctx.db
      .query("dailyHabits")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .collect();

    for (const habit of dailyHabits) {
      await ctx.db.delete(habit._id);
    }

    // Delete all habit templates
    const habitTemplates = await ctx.db
      .query("habitTemplates")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const template of habitTemplates) {
      await ctx.db.delete(template._id);
    }

    // Delete all categories
    const categories = await ctx.db
      .query("habitCategories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const category of categories) {
      await ctx.db.delete(category._id);
    }

    // Reset userStats
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (stats) {
      await ctx.db.delete(stats._id);
    }

    return {
      success: true,
      message: "Habit system reset successfully",
      deleted: {
        categories: categories.length,
        habitTemplates: habitTemplates.length,
        dailyHabits: dailyHabits.length,
        stats: stats ? 1 : 0,
      },
    };
  },
});
