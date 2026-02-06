/**
 * Constants Index
 *
 * Central export point for all application constants.
 * Import from this file to access any constant category.
 *
 * @example
 * ```ts
 * import { XP, ANIMATION_DURATION, TEXT_LIMIT, DATE_FORMAT } from '@/lib/constants';
 *
 * // Use in your code
 * const xpPerLevel = XP.PER_LEVEL;
 * const animationTime = ANIMATION_DURATION.NORMAL;
 * const maxLength = TEXT_LIMIT.HABIT_NAME;
 * const dateString = format(new Date(), DATE_FORMAT.ISO);
 * ```
 */

// Gamification constants
export {
  XP,
  STREAK,
  LEVELS,
  PROGRESS_THRESHOLDS,
  WEEK_SCORE,
} from './gamification';

// UI constants
export {
  ANIMATION_DURATION,
  TIMEOUT,
  BREAKPOINT,
  PANEL_WIDTH,
  Z_INDEX,
  SCROLL,
  SIZE,
  OPACITY,
} from './ui';

// Validation constants
export {
  TEXT_LIMIT,
  NUMERIC_RANGE,
  DATE_VALIDATION,
  COLLECTION_LIMIT,
  FILE_UPLOAD,
  PASSWORD,
  PAGINATION,
} from './validation';

// Date and time constants
export {
  DATE_FORMAT,
  TIME_FORMAT,
  DATETIME_FORMAT,
  WEEK,
  MONTH,
  QUARTER,
  TIME_MS,
  DAYS,
} from './dates';
