/**
 * Environment-aware logging utility
 *
 * Logs debug messages only in development mode
 * Always logs errors and warnings
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log debug information (development only)
   */
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log errors (always logged)
   */
  error: (...args: unknown[]) => {
    console.error(...args);
  },

  /**
   * Log warnings (development only)
   */
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log info messages (development only)
   */
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
};
