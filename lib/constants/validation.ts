/**
 * Validation Constants
 *
 * Input limits, min/max values, and validation rules used across forms
 * and data entry components.
 */

/**
 * Text Input Limits
 */
export const TEXT_LIMIT = {
  /** Maximum length for habit names */
  HABIT_NAME: 100,

  /** Maximum length for habit subtitles */
  HABIT_SUBTITLE: 200,

  /** Maximum length for category names */
  CATEGORY_NAME: 50,

  /** Maximum length for user profile name */
  USER_NAME: 100,

  /** Maximum length for role/position */
  ROLE: 100,

  /** Maximum length for project names */
  PROJECT_NAME: 200,

  /** Maximum length for North Star descriptions */
  NORTH_STAR: 500,

  /** Maximum length for milestone descriptions */
  MILESTONE: 300,

  /** Maximum length for review text areas */
  REVIEW_TEXTAREA: 2000,

  /** Maximum length for skip reasons */
  SKIP_REASON: 100,

  /** Maximum length for chat messages */
  CHAT_MESSAGE: 1000,
} as const;

/**
 * Numeric Input Ranges
 */
export const NUMERIC_RANGE = {
  /** Wellbeing slider range (1-10) */
  WELLBEING_MIN: 1,
  WELLBEING_MAX: 10,

  /** Work hours range (0-24) */
  WORK_HOURS_MIN: 0,
  WORK_HOURS_MAX: 24,

  /** XP value range (1-10000) */
  XP_MIN: 1,
  XP_MAX: 10000,

  /** Sprint timer maximum minutes */
  SPRINT_MAX_MINUTES: 240, // 4 hours

  /** Category timer maximum hours */
  TIMER_MAX_HOURS: 12,
} as const;

/**
 * Date and Time Validation
 */
export const DATE_VALIDATION = {
  /** Minimum year for date selection */
  MIN_YEAR: 2020,

  /** Maximum years in the future for date selection */
  MAX_FUTURE_YEARS: 5,

  /** Week number range (1-53) */
  WEEK_MIN: 1,
  WEEK_MAX: 53,

  /** Month number range (1-12) */
  MONTH_MIN: 1,
  MONTH_MAX: 12,

  /** Quarter number range (1-4) */
  QUARTER_MIN: 1,
  QUARTER_MAX: 4,
} as const;

/**
 * Array and Collection Limits
 */
export const COLLECTION_LIMIT = {
  /** Maximum number of habits per category */
  MAX_HABITS_PER_CATEGORY: 20,

  /** Maximum number of categories */
  MAX_CATEGORIES: 10,

  /** Maximum number of North Stars (fixed at 4) */
  MAX_NORTH_STARS: 4,

  /** Maximum number of milestones per quarter per area */
  MAX_MILESTONES_PER_QUARTER: 3,

  /** Maximum number of vision board items */
  MAX_VISIONBOARD_ITEMS: 50,

  /** Maximum number of tracking fields */
  MAX_TRACKING_FIELDS: 20,

  /** Maximum number of chat messages to display */
  MAX_CHAT_MESSAGES: 100,
} as const;

/**
 * File Upload Validation
 */
export const FILE_UPLOAD = {
  /** Maximum file size in bytes (5MB) */
  MAX_SIZE: 5 * 1024 * 1024,

  /** Allowed image MIME types */
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ] as const,

  /** Maximum image width in pixels */
  MAX_IMAGE_WIDTH: 2000,

  /** Maximum image height in pixels */
  MAX_IMAGE_HEIGHT: 2000,
} as const;

/**
 * Password and Security Validation
 * (Note: Using Clerk for auth, but keeping for reference)
 */
export const PASSWORD = {
  /** Minimum password length */
  MIN_LENGTH: 8,

  /** Maximum password length */
  MAX_LENGTH: 128,
} as const;

/**
 * Pagination and Loading
 */
export const PAGINATION = {
  /** Default items per page */
  DEFAULT_PAGE_SIZE: 20,

  /** Small page size for limited displays */
  SMALL_PAGE_SIZE: 10,

  /** Large page size for data tables */
  LARGE_PAGE_SIZE: 50,

  /** Maximum page size allowed */
  MAX_PAGE_SIZE: 100,
} as const;
