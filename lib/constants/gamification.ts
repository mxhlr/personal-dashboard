/**
 * Gamification Constants
 *
 * XP values, level calculations, streak bonuses, and achievement thresholds
 * used throughout the gamification system.
 */

/**
 * XP (Experience Points) System
 */
export const XP = {
  /** XP required per level (1 level = 1000 XP) */
  PER_LEVEL: 1000,

  /** Default XP values for habits */
  DEFAULT_HABIT: 10,

  /** Minimum allowed XP value for a habit */
  MIN_HABIT_XP: 1,

  /** Maximum allowed XP value for a habit */
  MAX_HABIT_XP: 10000,
} as const;

/**
 * Streak Bonuses and Multipliers
 */
export const STREAK = {
  /** Minimum days to establish a streak */
  MIN_DAYS: 1,

  /** Days in a week for weekly streak calculations */
  WEEK_DAYS: 7,

  /** Bonus XP percentage for maintaining a streak (e.g., 0.1 = 10% bonus) */
  BONUS_MULTIPLIER: 0.1,
} as const;

/**
 * Level Thresholds and Milestones
 */
export const LEVELS = {
  /** Starting level for new users */
  INITIAL_LEVEL: 0,

  /** Level milestones that trigger special rewards or notifications */
  MILESTONES: [5, 10, 25, 50, 100] as const,

  /** Maximum level cap (if needed) */
  MAX_LEVEL: 999,
} as const;

/**
 * Progress Thresholds (in percentage)
 * Used for milestone popups and progress rings
 */
export const PROGRESS_THRESHOLDS = {
  /** Threshold for showing "good progress" milestone (25%) */
  QUARTER: 25,

  /** Threshold for showing "halfway there" milestone (50%) */
  HALF: 50,

  /** Threshold for showing "almost done" milestone (75%) */
  THREE_QUARTERS: 75,

  /** Threshold for showing "perfect day" milestone (100%) */
  COMPLETE: 100,
} as const;

/**
 * Week Score Range
 * Number of days completed in the current week (0-7)
 */
export const WEEK_SCORE = {
  /** Minimum week score (no days completed) */
  MIN: 0,

  /** Maximum week score (all 7 days completed) */
  MAX: 7,

  /** Target week score for a "good week" */
  GOOD_WEEK_TARGET: 5,

  /** Target week score for a "perfect week" */
  PERFECT_WEEK_TARGET: 7,
} as const;
