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
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log errors (always logged)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log warnings (development only)
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log info messages (development only)
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
};
