import { v } from "convex/values";
import { mutation, query, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * Admin Commands for Habit System Migrations
 *
 * These are public mutations that can be called from the Convex dashboard
 * or via the Convex CLI to manage migrations.
 *
 * Usage via Convex CLI:
 * npx convex run migrations/adminCommands:migrateAllUsers
 * npx convex run migrations/adminCommands:getMigrationStats
 */

/**
 * Migrate all users to the habit system
 *
 * This is a privileged operation that should only be run by admins.
 * It will migrate ALL users in the system to the new habit system.
 */
export const migrateAllUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // In a production system, you would check if the user is an admin here
    // For now, we'll allow any authenticated user to run this

    try {
      // Schedule the internal migration to run
      await ctx.scheduler.runAfter(
        0,
        internal.migrations.seedHabitSystem.seedAllUsers,
        {}
      );

      return {
        success: true,
        message: "Migration started for all users. Check logs for progress.",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Migration failed to start",
      };
    }
  },
});

/**
 * Get migration statistics
 *
 * Shows how many users have been migrated vs. how many still need migration.
 */
export const getMigrationStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Count total users
    const allProfiles = await ctx.db.query("userProfile").collect();
    const totalUsers = allProfiles.length;

    // Count users with habit categories
    const allCategories = await ctx.db.query("habitCategories").collect();

    // Group by userId to count unique migrated users
    const migratedUserIds = new Set(allCategories.map((cat) => cat.userId));
    const migratedUsers = migratedUserIds.size;

    // Count users with stats
    const allStats = await ctx.db.query("userStats").collect();
    const usersWithStats = allStats.length;

    // Count habit templates and daily habits
    const habitTemplates = await ctx.db.query("habitTemplates").collect();
    const dailyHabits = await ctx.db.query("dailyHabits").collect();

    return {
      totalUsers,
      migratedUsers,
      notMigratedUsers: totalUsers - migratedUsers,
      migrationProgress: totalUsers > 0 ? (migratedUsers / totalUsers) * 100 : 0,
      usersWithStats,
      totalHabitCategories: allCategories.length,
      totalHabitTemplates: habitTemplates.length,
      totalDailyHabits: dailyHabits.length,
      migratedUsersList: Array.from(migratedUserIds),
    };
  },
});

/**
 * Migrate a specific user by email
 *
 * Useful for testing or migrating users one at a time.
 */
export const migrateUserByEmail = mutation({
  args: {
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Find user profile by email
    const profiles = await ctx.db.query("userProfile").collect();
    const profile = profiles.find((p) => p.name === args.userEmail);

    if (!profile) {
      return {
        success: false,
        message: `User with email ${args.userEmail} not found`,
      };
    }

    try {
      // Schedule the migration for this specific user
      await ctx.scheduler.runAfter(
        0,
        internal.migrations.seedHabitSystem.seedHabitSystemForUser,
        { userId: profile.userId }
      );

      return {
        success: true,
        message: `Migration started for user ${args.userEmail}`,
        userId: profile.userId,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Migration failed",
      };
    }
  },
});

/**
 * Check if a specific user needs migration
 */
export const checkUserMigrationStatus = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check if user has habit categories
    const categories = await ctx.db
      .query("habitCategories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Check if user has userStats
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Check habit templates
    const templates = await ctx.db
      .query("habitTemplates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      userId: args.userId,
      isMigrated: categories.length > 0,
      hasStats: stats !== null,
      categoriesCount: categories.length,
      templatesCount: templates.length,
      stats: stats
        ? {
            level: stats.level,
            totalXP: stats.totalXP,
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak,
            weekScore: stats.weekScore,
          }
        : null,
    };
  },
});

/**
 * Migrate North Stars from string to array format (Public wrapper)
 */
export const runNorthStarsMigration = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.scheduler.runAfter(0, internal.migrations.adminCommands.migrateNorthStarsInternal, {});

    return {
      success: true,
      message: "North Stars migration scheduled",
    };
  },
});

/**
 * Migrate North Stars from string to array format (Internal)
 */
export const migrateNorthStarsInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Migrate User Profiles
    const profiles = await ctx.db.query("userProfile").collect();
    let profilesMigrated = 0;
    let profilesSkipped = 0;

    for (const profile of profiles) {
      // Check if already migrated (northStars.wealth is an array)
      const isAlreadyArray = Array.isArray(profile.northStars.wealth);

      if (isAlreadyArray) {
        profilesSkipped++;
        continue;
      }

      // Migrate from string to array
      const migratedNorthStars = {
        wealth: [(profile.northStars.wealth as any) as string],
        health: [(profile.northStars.health as any) as string],
        love: [(profile.northStars.love as any) as string],
        happiness: [(profile.northStars.happiness as any) as string],
      };

      await ctx.db.patch(profile._id, {
        northStars: migratedNorthStars,
        updatedAt: new Date().toISOString(),
      });

      profilesMigrated++;
    }

    // Migrate Annual Reviews
    const reviews = await ctx.db.query("annualReview").collect();
    let reviewsMigrated = 0;
    let reviewsSkipped = 0;

    for (const review of reviews) {
      // Check if already migrated
      const isAlreadyArray = Array.isArray(
        review.responses.nextYearNorthStars.wealth
      );

      if (isAlreadyArray) {
        reviewsSkipped++;
        continue;
      }

      // Migrate nextYearNorthStars from string to array
      const migratedNextYearNorthStars = {
        wealth: [(review.responses.nextYearNorthStars.wealth as any) as string],
        health: [(review.responses.nextYearNorthStars.health as any) as string],
        love: [(review.responses.nextYearNorthStars.love as any) as string],
        happiness: [
          (review.responses.nextYearNorthStars.happiness as any) as string,
        ],
      };

      await ctx.db.patch(review._id, {
        responses: {
          ...review.responses,
          nextYearNorthStars: migratedNextYearNorthStars,
        },
      });

      reviewsMigrated++;
    }

    return {
      success: true,
      profiles: {
        migrated: profilesMigrated,
        skipped: profilesSkipped,
        total: profiles.length,
      },
      reviews: {
        migrated: reviewsMigrated,
        skipped: reviewsSkipped,
        total: reviews.length,
      },
    };
  },
});
