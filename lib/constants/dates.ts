/**
 * Date Constants
 *
 * Date formatting patterns, week calculations, and time-related constants
 * used throughout the application.
 */

/**
 * Date Format Patterns
 * Standard date format strings used with date-fns
 */
export const DATE_FORMAT = {
  /** ISO date format (YYYY-MM-DD) - used for database storage */
  ISO: 'yyyy-MM-dd',

  /** Full date with month name (e.g., "January 15, 2024") */
  FULL: 'MMMM d, yyyy',

  /** Short date (e.g., "Jan 15, 2024") */
  SHORT: 'MMM d, yyyy',

  /** Month and year (e.g., "January 2024") */
  MONTH_YEAR: 'MMMM yyyy',

  /** Short month and year (e.g., "Jan 2024") */
  SHORT_MONTH_YEAR: 'MMM yyyy',

  /** Day of week (e.g., "Monday") */
  DAY_NAME: 'EEEE',

  /** Short day of week (e.g., "Mon") */
  SHORT_DAY_NAME: 'EEE',

  /** Two-letter day abbreviation (e.g., "Mo") */
  MINI_DAY_NAME: 'EEEEEE',

  /** Month name only (e.g., "January") */
  MONTH_NAME: 'MMMM',

  /** Year only (e.g., "2024") */
  YEAR: 'yyyy',
} as const;

/**
 * Time Format Patterns
 */
export const TIME_FORMAT = {
  /** 24-hour format (e.g., "14:30") */
  HOUR_24: 'HH:mm',

  /** 12-hour format with AM/PM (e.g., "2:30 PM") */
  HOUR_12: 'h:mm a',

  /** 24-hour format with seconds (e.g., "14:30:45") */
  HOUR_24_SECONDS: 'HH:mm:ss',

  /** 12-hour format with seconds (e.g., "2:30:45 PM") */
  HOUR_12_SECONDS: 'h:mm:ss a',
} as const;

/**
 * DateTime Format Patterns
 */
export const DATETIME_FORMAT = {
  /** ISO datetime (e.g., "2024-01-15T14:30:00") */
  ISO: "yyyy-MM-dd'T'HH:mm:ss",

  /** Full datetime (e.g., "January 15, 2024 at 2:30 PM") */
  FULL: "MMMM d, yyyy 'at' h:mm a",

  /** Short datetime (e.g., "Jan 15, 2024 2:30 PM") */
  SHORT: 'MMM d, yyyy h:mm a',
} as const;

/**
 * Week Configuration
 */
export const WEEK = {
  /** Days in a week */
  DAYS: 7,

  /** First day of week (0 = Sunday, 1 = Monday) */
  STARTS_ON: 1 as const, // Monday

  /** Weekend days (0-indexed, 0 = Sunday) */
  WEEKEND_DAYS: [0, 6] as const, // Sunday and Saturday

  /** Maximum week number in a year */
  MAX_WEEK_NUMBER: 53,
} as const;

/**
 * Month Configuration
 */
export const MONTH = {
  /** Months in a year */
  COUNT: 12,

  /** Month numbers (1-indexed) */
  JANUARY: 1,
  FEBRUARY: 2,
  MARCH: 3,
  APRIL: 4,
  MAY: 5,
  JUNE: 6,
  JULY: 7,
  AUGUST: 8,
  SEPTEMBER: 9,
  OCTOBER: 10,
  NOVEMBER: 11,
  DECEMBER: 12,
} as const;

/**
 * Quarter Configuration
 */
export const QUARTER = {
  /** Quarters in a year */
  COUNT: 4,

  /** Quarter numbers */
  Q1: 1,
  Q2: 2,
  Q3: 3,
  Q4: 4,

  /** Months per quarter */
  MONTHS_PER_QUARTER: 3,

  /** Quarter to months mapping */
  MONTHS: {
    1: [1, 2, 3],    // Q1: Jan, Feb, Mar
    2: [4, 5, 6],    // Q2: Apr, May, Jun
    3: [7, 8, 9],    // Q3: Jul, Aug, Sep
    4: [10, 11, 12], // Q4: Oct, Nov, Dec
  } as const,
} as const;

/**
 * Time Units (in milliseconds)
 */
export const TIME_MS = {
  /** One second in milliseconds */
  SECOND: 1000,

  /** One minute in milliseconds */
  MINUTE: 60 * 1000,

  /** One hour in milliseconds */
  HOUR: 60 * 60 * 1000,

  /** One day in milliseconds */
  DAY: 24 * 60 * 60 * 1000,

  /** One week in milliseconds */
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Relative Time Periods (in days)
 */
export const DAYS = {
  /** One week */
  WEEK: 7,

  /** Two weeks */
  FORTNIGHT: 14,

  /** One month (approximate) */
  MONTH: 30,

  /** One quarter (approximate) */
  QUARTER: 90,

  /** One year */
  YEAR: 365,
} as const;
