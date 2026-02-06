/**
 * Error reporting and logging
 *
 * Provides error tracking, breadcrumbs, and reporting to external services.
 */

import { logger } from '@/lib/logger';
import { isAppError } from './errorTypes';

/**
 * Breadcrumb for tracking user actions
 */
export interface ErrorBreadcrumb {
  timestamp: Date;
  category: 'navigation' | 'user-action' | 'network' | 'state-change' | 'console';
  message: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

/**
 * Error context with breadcrumbs and metadata
 */
export interface ErrorContext {
  breadcrumbs: ErrorBreadcrumb[];
  userAgent?: string;
  url?: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Global breadcrumb store (max 50 breadcrumbs)
 */
class BreadcrumbStore {
  private breadcrumbs: ErrorBreadcrumb[] = [];
  private maxBreadcrumbs = 50;

  add(breadcrumb: Omit<ErrorBreadcrumb, 'timestamp'>): void {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: new Date(),
    });

    // Keep only the last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  getAll(): ErrorBreadcrumb[] {
    return [...this.breadcrumbs];
  }

  clear(): void {
    this.breadcrumbs = [];
  }
}

// Global breadcrumb store instance
const breadcrumbStore = new BreadcrumbStore();

/**
 * Add a breadcrumb to track user actions
 *
 * @example
 * addBreadcrumb({
 *   category: 'user-action',
 *   message: 'User clicked save button',
 *   level: 'info',
 *   data: { buttonId: 'save-btn' }
 * });
 */
export function addBreadcrumb(
  breadcrumb: Omit<ErrorBreadcrumb, 'timestamp'>
): void {
  breadcrumbStore.add(breadcrumb);

  // Also log in development
  if (process.env.NODE_ENV === 'development') {
    logger.log('[Breadcrumb]', breadcrumb);
  }
}

/**
 * Get all breadcrumbs
 */
export function getBreadcrumbs(): ErrorBreadcrumb[] {
  return breadcrumbStore.getAll();
}

/**
 * Clear all breadcrumbs
 */
export function clearBreadcrumbs(): void {
  breadcrumbStore.clear();
}

/**
 * Create error context with breadcrumbs and metadata
 */
export function createErrorContext(
  additionalData?: Record<string, unknown>
): ErrorContext {
  return {
    breadcrumbs: getBreadcrumbs(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    timestamp: new Date(),
    metadata: additionalData,
  };
}

/**
 * Report error to external service
 *
 * In production, you would integrate with services like:
 * - Sentry
 * - LogRocket
 * - Datadog
 * - Rollbar
 * - Custom error tracking API
 */
export function reportError(
  error: Error,
  context?: Record<string, unknown>
): void {
  const errorContext = createErrorContext(context);

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    logger.error('Error Report:', {
      error: isAppError(error) ? error.toJSON() : error,
      context: errorContext,
    });
    return;
  }

  // In production, send to error tracking service
  // Example with Sentry:
  // if (typeof Sentry !== 'undefined') {
  //   Sentry.captureException(error, {
  //     contexts: {
  //       errorContext: errorContext,
  //     },
  //     tags: {
  //       errorCode: isAppError(error) ? error.code : 'UNKNOWN',
  //     },
  //   });
  // }

  // Example with custom API:
  // try {
  //   await fetch('/api/errors', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       error: isAppError(error) ? error.toJSON() : {
  //         name: error.name,
  //         message: error.message,
  //         stack: error.stack,
  //       },
  //       context: errorContext,
  //     }),
  //   });
  // } catch (reportingError) {
  //   logger.error('Failed to report error:', reportingError);
  // }
}

/**
 * Track navigation events
 */
export function trackNavigation(url: string): void {
  addBreadcrumb({
    category: 'navigation',
    message: `Navigated to ${url}`,
    level: 'info',
    data: { url },
  });
}

/**
 * Track user actions
 */
export function trackUserAction(
  action: string,
  data?: Record<string, unknown>
): void {
  addBreadcrumb({
    category: 'user-action',
    message: action,
    level: 'info',
    data,
  });
}

/**
 * Track network requests
 */
export function trackNetworkRequest(
  method: string,
  url: string,
  status?: number,
  error?: Error
): void {
  addBreadcrumb({
    category: 'network',
    message: `${method} ${url}`,
    level: error ? 'error' : 'info',
    data: {
      method,
      url,
      status,
      error: error?.message,
    },
  });
}

/**
 * Track state changes
 */
export function trackStateChange(
  name: string,
  data?: Record<string, unknown>
): void {
  addBreadcrumb({
    category: 'state-change',
    message: `State changed: ${name}`,
    level: 'debug',
    data,
  });
}

/**
 * Track console messages
 */
export function trackConsole(
  level: 'debug' | 'info' | 'warning' | 'error',
  message: string,
  data?: Record<string, unknown>
): void {
  addBreadcrumb({
    category: 'console',
    message,
    level,
    data,
  });
}

/**
 * Initialize error reporting with automatic tracking
 */
export function initializeErrorReporting(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Track navigation (commented out as Navigation API is experimental)
  // if (typeof window.navigation !== 'undefined') {
  //   window.navigation.addEventListener('navigate', (event) => {
  //     trackNavigation(event.destination.url);
  //   });
  // }

  // Override console methods to track console messages
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    trackConsole('error', args.map(String).join(' '));
    originalConsoleError(...args);
  };

  const originalConsoleWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    trackConsole('warning', args.map(String).join(' '));
    originalConsoleWarn(...args);
  };

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));

    logger.error('Unhandled promise rejection:', error);
    reportError(error, {
      type: 'unhandled-rejection',
    });

    addBreadcrumb({
      category: 'console',
      message: 'Unhandled promise rejection',
      level: 'error',
      data: {
        reason: event.reason,
      },
    });
  });

  // Track global errors
  window.addEventListener('error', (event) => {
    logger.error('Global error:', event.error);

    if (event.error) {
      reportError(event.error, {
        type: 'global-error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    }

    addBreadcrumb({
      category: 'console',
      message: event.message,
      level: 'error',
      data: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  logger.info('Error reporting initialized');
}
