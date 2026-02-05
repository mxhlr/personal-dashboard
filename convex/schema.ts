import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Personal Dashboard Schema
 *
 * PRIMARY SYSTEM (Active):
 * - habitCategories - User-configurable habit categories
 * - habitTemplates - Habit templates with XP values
 * - dailyHabits - Daily habit completion tracking
 * - userStats - Gamification stats (XP, level, streaks)
 *
 * LEGACY SYSTEM (For historical data only):
 * - trackingFields - Legacy configurable tracking fields (readonly)
 * - dailyLog - Legacy daily tracking data (readonly)
 *
 * OTHER TABLES:
 * - userProfile - User basics, North Stars, Milestones, Coach Settings
 * - weeklyReview, monthlyReview, quarterlyReview, annualReview
 * - coachMessages - Chat history with AI Coach
 * - visionboard, visionboardLists - Vision board system
 */

export default defineSchema({
  // ============================================
  // USER PROFILE (inkl. North Stars & Milestones)
  // ============================================

  userProfile: defineTable({
    // Basics
    userId: v.string(), // Clerk user ID
    name: v.string(),
    role: v.string(),
    mainProject: v.string(),

    // 4 North Stars (1 pro Lebensbereich)
    northStars: v.object({
      wealth: v.string(),
      health: v.string(),
      love: v.string(),
      happiness: v.string(),
    }),

    // Quarterly Milestones (pro Bereich, frei wählbar)
    quarterlyMilestones: v.array(v.object({
      quarter: v.number(), // 1-4
      year: v.number(), // Jahr für das Quartal
      area: v.string(), // "wealth" | "health" | "love" | "happiness"
      milestone: v.string(),
      completed: v.boolean(),
    })),

    // Coach Settings
    coachTone: v.string(), // "Motivierend" | "Sachlich" | "Empathisch" | "Direkt"

    // Setup
    setupCompleted: v.boolean(),
    setupDate: v.optional(v.string()),

    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_user", ["userId"]),

  // ============================================
  // TRACKING FIELDS (Konfigurierbar)
  // ============================================

  trackingFields: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(),
    type: v.string(), // "text" | "toggle" | "meals" | "work"
    hasStreak: v.boolean(),
    isDefault: v.boolean(),
    isActive: v.boolean(),
    order: v.number(),

    // Streak (nur wenn hasStreak = true)
    currentStreak: v.optional(v.number()),
    longestStreak: v.optional(v.number()),

    // Weekly Target (optional, für Toggle-Felder)
    weeklyTarget: v.optional(v.number()),

    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"])
    .index("by_user_order", ["userId", "order"]),

  // ============================================
  // DAILY LOG
  // ============================================

  dailyLog: defineTable({
    userId: v.string(), // Clerk user ID
    date: v.string(), // "YYYY-MM-DD"
    weekNumber: v.number(),
    year: v.number(),
    dayOfWeek: v.string(),

    // Tracking Data (Original Daily Tracker)
    tracking: v.object({
      movement: v.optional(v.string()),
      phoneJail: v.optional(v.boolean()),
      phoneJailNotes: v.optional(v.string()),
      vibes: v.optional(v.string()),
      breakfast: v.optional(v.string()),
      lunch: v.optional(v.string()),
      dinner: v.optional(v.string()),
      workHours: v.optional(v.number()),
      workNotes: v.optional(v.string()),

      // Custom Fields
      customToggles: v.optional(v.array(v.object({
        fieldId: v.id("trackingFields"),
        value: v.boolean(),
      }))),
      customTexts: v.optional(v.array(v.object({
        fieldId: v.id("trackingFields"),
        value: v.string(),
      }))),
    }),

    // Wellbeing Slider (1-10)
    wellbeing: v.optional(v.object({
      energy: v.number(),
      satisfaction: v.number(),
      stress: v.number(),
    })),

    // Meta
    completed: v.boolean(),
    completedAt: v.optional(v.string()),

    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_user_week", ["userId", "year", "weekNumber"]),

  // ============================================
  // WEEKLY REVIEW (5 Fragen)
  // ============================================

  weeklyReview: defineTable({
    userId: v.string(), // Clerk user ID
    year: v.number(),
    weekNumber: v.number(),

    // User Input (5 Fragen)
    responses: v.object({
      biggestSuccess: v.string(),        // Was war dein größter Erfolg diese Woche?
      mostFrustrating: v.string(),       // Was hat dich am meisten frustriert?
      differentlyNextTime: v.string(),   // Was hättest du anders gemacht?
      learned: v.string(),               // Was hast du diese Woche gelernt?
      nextWeekFocus: v.string(),         // Worauf fokussierst du dich nächste Woche?
    }),

    completedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_year_week", ["userId", "year", "weekNumber"]),

  // ============================================
  // MONTHLY REVIEW (6 Fragen)
  // ============================================

  monthlyReview: defineTable({
    userId: v.string(), // Clerk user ID
    year: v.number(),
    month: v.number(),

    // User Input (6 Fragen)
    responses: v.object({
      biggestSuccess: v.string(),        // Was war dein größter Erfolg diesen Monat?
      patternToChange: v.string(),       // Welches Muster möchtest du ändern?
      learnedAboutSelf: v.string(),      // Was hast du über dich selbst gelernt?
      biggestSurprise: v.string(),       // Was war die größte Überraschung?
      proudOf: v.string(),               // Worauf bist du stolz?
      nextMonthFocus: v.string(),        // Was ist dein Fokus für nächsten Monat?
    }),

    completedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_year_month", ["userId", "year", "month"]),

  // ============================================
  // QUARTERLY REVIEW (5 Fragen)
  // ============================================

  quarterlyReview: defineTable({
    userId: v.string(), // Clerk user ID
    year: v.number(),
    quarter: v.number(),

    // Milestone Review (User markiert welche completed)
    milestoneReview: v.array(v.object({
      area: v.string(),
      milestone: v.string(),
      completed: v.boolean(),
      notes: v.optional(v.string()),
    })),

    // User Input (5 Fragen)
    responses: v.object({
      proudestMilestone: v.string(),     // Welcher Milestone macht dich am stolzesten?
      approachDifferently: v.string(),   // Welches Ziel hättest du anders angehen sollen?
      learnedAboutGoals: v.string(),     // Was hast du über deine Zielsetzung gelernt?
      decisionDifferently: v.string(),   // Welche Entscheidung würdest du anders treffen?
      needForNextQuarter: v.string(),    // Was brauchst du, um nächstes Quartal erfolgreicher zu sein?
    }),

    // Next Quarter Milestones (User definiert neue)
    nextQuarterMilestones: v.array(v.object({
      area: v.string(),
      milestone: v.string(),
    })),

    completedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_year_quarter", ["userId", "year", "quarter"]),

  // ============================================
  // ANNUAL REVIEW (6 Fragen)
  // ============================================

  annualReview: defineTable({
    userId: v.string(), // Clerk user ID
    year: v.number(),

    // North Star Review
    northStarReview: v.object({
      wealth: v.object({ achieved: v.string(), notes: v.string() }),
      health: v.object({ achieved: v.string(), notes: v.string() }),
      love: v.object({ achieved: v.string(), notes: v.string() }),
      happiness: v.object({ achieved: v.string(), notes: v.string() }),
    }),

    // User Input (6 Fragen)
    responses: v.object({
      yearInOneSentence: v.string(),     // Das Jahr in einem Satz?
      turningPoint: v.string(),          // Was war der Wendepunkt?
      mostProudOf: v.string(),           // Worauf bist du am meisten stolz?
      topThreeLearnings: v.string(),     // Top 3 Learnings?
      stopStartContinue: v.string(),     // Was stoppen/starten/weitermachen?
      nextYearNorthStars: v.object({     // North Stars für nächstes Jahr
        wealth: v.string(),
        health: v.string(),
        love: v.string(),
        happiness: v.string(),
      }),
    }),

    completedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_year", ["userId", "year"]),

  // ============================================
  // COACH MESSAGES
  // ============================================

  coachMessages: defineTable({
    userId: v.string(), // Clerk user ID
    role: v.string(), // "user" | "assistant"
    content: v.string(),
    timestamp: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_timestamp", ["userId", "timestamp"]),

  // ============================================
  // VISIONBOARD
  // ============================================

  visionboardLists: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(), // List name (editable)
    position: v.number(), // Order for horizontal sorting
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_position", ["userId", "position"]),

  visionboard: defineTable({
    userId: v.string(), // Clerk user ID
    listId: v.optional(v.id("visionboardLists")), // Optional list ID (for backward compatibility)
    storageId: v.id("_storage"), // Convex file storage ID
    subtitle: v.optional(v.string()), // Optional subtitle for image
    width: v.optional(v.number()), // Original image width (optional for old images)
    height: v.optional(v.number()), // Original image height (optional for old images)
    position: v.optional(v.number()), // Order/position for drag & drop (optional for old images)
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_list", ["userId", "listId"])
    .index("by_user_position", ["userId", "position"]),

  // ============================================
  // GAMIFICATION SYSTEM
  // ============================================

  habitCategories: defineTable({
    userId: v.string(),
    name: v.string(),
    icon: v.string(), // emoji
    order: v.number(),
    requiresCoreCompletion: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_order", ["userId", "order"]),

  habitTemplates: defineTable({
    userId: v.string(),
    categoryId: v.id("habitCategories"),
    name: v.string(),
    subtitle: v.optional(v.string()), // Optional subtitle/description for context
    xpValue: v.number(), // user-configurable
    isCore: v.boolean(), // core habits must be completed to unlock extras
    order: v.number(),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["categoryId"])
    .index("by_category_order", ["categoryId", "order"]),

  dailyHabits: defineTable({
    userId: v.string(),
    date: v.string(), // "YYYY-MM-DD"
    templateId: v.id("habitTemplates"),
    completed: v.boolean(),
    skipped: v.boolean(),
    skipReason: v.optional(v.string()), // "Ran out of time", "Not feeling well", etc.
    completedAt: v.optional(v.string()),
    xpEarned: v.number(),
    createdAt: v.string(),
  })
    .index("by_user_date", ["userId", "date"])
    .index("by_template", ["templateId"])
    .index("by_user_date_template", ["userId", "date", "templateId"]),

  userStats: defineTable({
    userId: v.string(),
    totalXP: v.number(),
    level: v.number(),
    currentStreak: v.number(), // days in a row completing habits
    longestStreak: v.number(),
    weekScore: v.number(), // days completed this week (0-7)
    updatedAt: v.string(),
  })
    .index("by_user", ["userId"]),

  categoryBlockTimes: defineTable({
    userId: v.string(),
    date: v.string(), // "YYYY-MM-DD"
    categoryId: v.id("habitCategories"),
    durationMinutes: v.number(),
    startedAt: v.string(),
    completedAt: v.string(),
    createdAt: v.string(),
  })
    .index("by_user_date", ["userId", "date"])
    .index("by_category", ["categoryId"])
    .index("by_user_category", ["userId", "categoryId"]),
});
