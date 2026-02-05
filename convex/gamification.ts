import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Gamification Core Functions
 * Handles XP, levels, streaks, and habit completion
 */

// Helper: Calculate level from total XP (1000 XP = 1 level)
function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 1000);
}

// Helper: Calculate XP needed for next level
function xpForNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  const nextLevelXP = (currentLevel + 1) * 1000;
  return nextLevelXP - currentXP;
}

// Get user stats
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!stats) {
      return null;
    }

    return {
      ...stats,
      xpForNextLevel: xpForNextLevel(stats.totalXP),
      currentLevelProgress: stats.totalXP % 1000,
    };
  },
});

// Initialize user stats (called during onboarding or first habit creation)
export const initializeUserStats = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) {
      return existing._id;
    }

    const now = new Date().toISOString();
    const statsId = await ctx.db.insert("userStats", {
      userId: identity.subject,
      totalXP: 0,
      level: 0,
      currentStreak: 0,
      longestStreak: 0,
      weekScore: 0,
      updatedAt: now,
    });

    return statsId;
  },
});

// Complete a habit (called when user marks habit as done)
// This now works as a toggle - if already completed, it will uncomplete
export const completeHabit = mutation({
  args: {
    templateId: v.id("habitTemplates"),
    date: v.string(), // "YYYY-MM-DD"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = new Date().toISOString();

    // Get the habit template to know XP value
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Habit template not found");
    if (template.userId !== identity.subject) throw new Error("Unauthorized");

    // Check if habit already exists for this date
    const existingHabit = await ctx.db
      .query("dailyHabits")
      .withIndex("by_user_date_template", (q) =>
        q.eq("userId", identity.subject)
         .eq("date", args.date)
         .eq("templateId", args.templateId)
      )
      .first();

    if (existingHabit) {
      // Toggle: if already completed, uncomplete it
      const newCompletedState = !existingHabit.completed;
      await ctx.db.patch(existingHabit._id, {
        completed: newCompletedState,
        skipped: false,
        skipReason: undefined,
        completedAt: newCompletedState ? now : undefined,
        xpEarned: newCompletedState ? template.xpValue : 0,
      });

      // Update user stats (add or subtract XP)
      if (newCompletedState) {
        await ctx.scheduler.runAfter(0, internal.gamification.updateUserStats, {
          userId: identity.subject,
          xpToAdd: template.xpValue,
          date: args.date,
        });
      } else {
        // Subtract XP when uncompleting
        await ctx.scheduler.runAfter(0, internal.gamification.updateUserStats, {
          userId: identity.subject,
          xpToAdd: -template.xpValue,
          date: args.date,
        });
      }

      return { xpEarned: newCompletedState ? template.xpValue : -template.xpValue };
    } else {
      // Create new habit completion
      await ctx.db.insert("dailyHabits", {
        userId: identity.subject,
        date: args.date,
        templateId: args.templateId,
        completed: true,
        skipped: false,
        completedAt: now,
        xpEarned: template.xpValue,
        createdAt: now,
      });

      // Update user stats
      await ctx.scheduler.runAfter(0, internal.gamification.updateUserStats, {
        userId: identity.subject,
        xpToAdd: template.xpValue,
        date: args.date,
      });

      return { xpEarned: template.xpValue };
    }
  },
});

// Skip a habit with reason
export const skipHabit = mutation({
  args: {
    templateId: v.id("habitTemplates"),
    date: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = new Date().toISOString();

    // Verify template ownership
    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Habit template not found");
    if (template.userId !== identity.subject) throw new Error("Unauthorized");

    // Check if habit already exists for this date
    const existingHabit = await ctx.db
      .query("dailyHabits")
      .withIndex("by_user_date_template", (q) =>
        q.eq("userId", identity.subject)
         .eq("date", args.date)
         .eq("templateId", args.templateId)
      )
      .first();

    if (existingHabit) {
      // Update existing habit
      await ctx.db.patch(existingHabit._id, {
        completed: false,
        skipped: true,
        skipReason: args.reason,
        completedAt: undefined,
        xpEarned: 0,
      });
    } else {
      // Create new skipped habit
      await ctx.db.insert("dailyHabits", {
        userId: identity.subject,
        date: args.date,
        templateId: args.templateId,
        completed: false,
        skipped: true,
        skipReason: args.reason,
        xpEarned: 0,
        createdAt: now,
      });
    }
  },
});

// Internal mutation to update user stats (called by scheduler)
export const updateUserStats = internalMutation({
  args: {
    userId: v.string(),
    xpToAdd: v.number(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    // Get or create stats
    let stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!stats) {
      // Initialize stats if they don't exist
      const statsId = await ctx.db.insert("userStats", {
        userId: args.userId,
        totalXP: args.xpToAdd,
        level: calculateLevel(args.xpToAdd),
        currentStreak: 0,
        longestStreak: 0,
        weekScore: 0,
        updatedAt: now,
      });
      return;
    }

    // Update XP and level
    const newTotalXP = stats.totalXP + args.xpToAdd;
    const newLevel = calculateLevel(newTotalXP);

    // Update streak and week score
    const streakData = await calculateStreakAndWeekScore(ctx, args.userId, args.date);

    await ctx.db.patch(stats._id, {
      totalXP: newTotalXP,
      level: newLevel,
      currentStreak: streakData.currentStreak,
      longestStreak: Math.max(stats.longestStreak, streakData.currentStreak),
      weekScore: streakData.weekScore,
      updatedAt: now,
    });
  },
});

// Helper to calculate streaks and week score
async function calculateStreakAndWeekScore(
  ctx: any,
  userId: string,
  currentDate: string
): Promise<{ currentStreak: number; weekScore: number }> {
  // Get all daily habits for the user
  const allHabits = await ctx.db
    .query("dailyHabits")
    .collect();

  // Filter to only this user's habits
  const userHabits = allHabits.filter((h: any) => h.userId === userId);

  // Group by date and check if each day has any completed habits
  const dateCompletionMap = new Map<string, boolean>();

  for (const habit of userHabits) {
    if (habit.completed) {
      dateCompletionMap.set(habit.date, true);
    }
  }

  // Calculate current streak (consecutive days)
  let currentStreak = 0;
  const today = new Date(currentDate);
  let checkDate = new Date(today);

  // Check backwards from current date
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (dateCompletionMap.get(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate week score (days completed in current week, 0-7)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

  let weekScore = 0;
  for (let i = 0; i < 7; i++) {
    const checkWeekDate = new Date(startOfWeek);
    checkWeekDate.setDate(startOfWeek.getDate() + i);
    const dateStr = checkWeekDate.toISOString().split('T')[0];

    if (dateCompletionMap.get(dateStr)) {
      weekScore++;
    }
  }

  return { currentStreak, weekScore };
}

// Reset all user data (stats, daily habits)
export const resetAllData = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Reset user stats to initial values
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (stats) {
      await ctx.db.patch(stats._id, {
        totalXP: 0,
        level: 0,
        currentStreak: 0,
        longestStreak: 0,
        weekScore: 0,
        updatedAt: new Date().toISOString(),
      });
    }

    // Delete all daily habits
    const dailyHabits = await ctx.db
      .query("dailyHabits")
      .collect();

    const userDailyHabits = dailyHabits.filter((h) => h.userId === identity.subject);

    for (const habit of userDailyHabits) {
      await ctx.db.delete(habit._id);
    }

    return { success: true };
  },
});

// Import internal API for scheduler
import { internal } from "./_generated/api";
