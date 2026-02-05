import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * Seed Habit System Migration
 *
 * This mutation converts existing trackingFields to the new gamification system.
 * It creates default habit categories and habits based on the existing tracking pattern.
 *
 * This function is idempotent - safe to run multiple times without duplicating data.
 */

export const seedHabitSystemForUser = internalMutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    // Check if user already has habit categories (idempotent check)
    const existingCategories = await ctx.db
      .query("habitCategories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (existingCategories.length > 0) {
      return {
        success: false,
        message: "User already has habit categories. Skipping migration.",
        categoriesCount: existingCategories.length,
      };
    }

    // Initialize userStats if it doesn't exist
    const existingStats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!existingStats) {
      await ctx.db.insert("userStats", {
        userId: args.userId,
        totalXP: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        weekScore: 0,
        updatedAt: now,
      });
    }

    // Define default categories and their habits
    const categories = [
      {
        name: "Physical Foundation",
        icon: "🏃",
        habits: [
          { name: "Movement", xp: 25, isCore: true },
          { name: "Breakfast", xp: 15, isCore: true },
          { name: "Lunch", xp: 15, isCore: true },
          { name: "Dinner", xp: 15, isCore: true },
        ],
      },
      {
        name: "Mental Clarity",
        icon: "🧠",
        habits: [
          { name: "Phone Jail", xp: 10, isCore: true },
          { name: "Vibes/Energy", xp: 5, isCore: false },
        ],
      },
      {
        name: "Deep Work",
        icon: "💼",
        habits: [
          { name: "Work Hours", xp: 20, isCore: true },
          { name: "Work Notes", xp: 10, isCore: false },
        ],
      },
      {
        name: "Evening Routine",
        icon: "🌙",
        habits: [
          { name: "Energy Reflection", xp: 3, isCore: false },
          { name: "Satisfaction Reflection", xp: 3, isCore: false },
          { name: "Stress Reflection", xp: 3, isCore: false },
        ],
      },
    ];

    const createdData = {
      categories: 0,
      habits: 0,
    };

    // Create categories and their habits
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];

      const categoryId = await ctx.db.insert("habitCategories", {
        userId: args.userId,
        name: category.name,
        icon: category.icon,
        order: i,
        requiresCoreCompletion: true,
        createdAt: now,
        updatedAt: now,
      });

      createdData.categories++;

      // Create habit templates for this category
      for (let j = 0; j < category.habits.length; j++) {
        const habit = category.habits[j];

        await ctx.db.insert("habitTemplates", {
          userId: args.userId,
          categoryId,
          name: habit.name,
          xpValue: habit.xp,
          isCore: habit.isCore,
          order: j,
          createdAt: now,
        });

        createdData.habits++;
      }
    }

    return {
      success: true,
      message: "Habit system seeded successfully",
      ...createdData,
    };
  },
});

/**
 * Seed all users (admin function)
 *
 * This is a utility function that can be called to migrate all existing users.
 * Use with caution - it will process all users in the system.
 */
export const seedAllUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all unique user IDs from userProfile table
    const profiles = await ctx.db.query("userProfile").collect();

    const results = {
      total: profiles.length,
      migrated: 0,
      skipped: 0,
      errors: 0,
      userResults: [] as Array<{
        userId: string;
        success: boolean;
        message: string;
      }>,
    };

    for (const profile of profiles) {
      try {
        // Call the individual user migration using ctx.runMutation
        const migrationResult = await ctx.runMutation(
          internal.migrations.seedHabitSystem.seedHabitSystemForUser,
          { userId: profile.userId }
        );

        if (migrationResult.success) {
          results.migrated++;
        } else {
          results.skipped++;
        }

        results.userResults.push({
          userId: profile.userId,
          success: migrationResult.success,
          message: migrationResult.message,
        });
      } catch (error) {
        results.errors++;
        results.userResults.push({
          userId: profile.userId,
          success: false,
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },
});
