/**
 * Central error handling logic
 *
 * Provides unified error handling, recovery strategies,
 * and error transformation utilities.
 */

import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import {
  AppError,
  isAppError,
  isOperationalError,
  ValidationError,
  NetworkError,
  DatabaseError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  TimeoutError,
  RateLimitError,
} from './errorTypes';
import { reportError } from './errorReporting';

/**
 * Error handling options
 */
export interface ErrorHandlingOptions {
  /** Whether to show a toast notification */
  showToast?: boolean;
  /** Custom toast message (overrides default) */
  toastMessage?: string;
  /** Whether to report the error for tracking */
  report?: boolean;
  /** Additional context for error reporting */
  context?: Record<string, unknown>;
  /** Whether to rethrow the error after handling */
  rethrow?: boolean;
  /** Custom error recovery function */
  onError?: (error: Error) => void;
}

/**
 * Default error messages for different error types
 */
const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Ungültige Eingabe. Bitte überprüfen Sie Ihre Daten.',
  AUTHENTICATION_ERROR: 'Bitte melden Sie sich an, um fortzufahren.',
  AUTHORIZATION_ERROR: 'Sie haben keine Berechtigung für diese Aktion.',
  NOT_FOUND_ERROR: 'Die angeforderte Ressource wurde nicht gefunden.',
  CONFLICT_ERROR: 'Diese Aktion kann nicht ausgeführt werden.',
  NETWORK_ERROR: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.',
  DATABASE_ERROR: 'Ein Datenbankfehler ist aufgetreten.',
  EXTERNAL_SERVICE_ERROR: 'Ein externer Dienst ist nicht verfügbar.',
  RATE_LIMIT_ERROR: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.',
  TIMEOUT_ERROR: 'Die Anfrage hat zu lange gedauert.',
  CONFIGURATION_ERROR: 'Konfigurationsfehler. Bitte kontaktieren Sie den Support.',
  UNKNOWN_ERROR: 'Ein unerwarteter Fehler ist aufgetreten.',
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: Error): string {
  if (isAppError(error)) {
    return ERROR_MESSAGES[error.code] || error.message;
  }

  // Handle common error patterns
  if (error.message.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (error.message.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT_ERROR;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Show error toast notification
 */
export function showErrorToast(error: Error, customMessage?: string) {
  const message = customMessage || getUserFriendlyMessage(error);

  toast.error(message, {
    duration: 5000,
    description: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
}

/**
 * Main error handler
 *
 * @example
 * try {
 *   await someOperation();
 * } catch (error) {
 *   handleError(error, { showToast: true, report: true });
 * }
 */
export function handleError(
  error: unknown,
  options: ErrorHandlingOptions = {}
): void {
  const {
    showToast = true,
    toastMessage,
    report = true,
    context,
    rethrow = false,
    onError,
  } = options;

  // Normalize error to Error instance
  const normalizedError = normalizeError(error);

  // Log the error
  logger.error('Error handled:', {
    error: normalizedError,
    context,
    stack: normalizedError.stack,
  });

  // Show toast notification
  if (showToast) {
    showErrorToast(normalizedError, toastMessage);
  }

  // Report error for tracking
  if (report && isOperationalError(normalizedError)) {
    reportError(normalizedError, context);
  }

  // Call custom error handler
  if (onError) {
    onError(normalizedError);
  }

  // Rethrow if requested
  if (rethrow) {
    throw normalizedError;
  }
}

/**
 * Normalize unknown error to Error instance
 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return new Error(error.message);
    }
  }

  return new Error('An unknown error occurred');
}

/**
 * Wrap async function with error handling
 *
 * @example
 * const safeFetch = withErrorHandling(fetchData, {
 *   showToast: true,
 *   report: true,
 * });
 *
 * const data = await safeFetch();
 */
export function withErrorHandling<T extends (...args: never[]) => Promise<unknown>>(
  fn: T,
  options: ErrorHandlingOptions = {}
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | undefined> {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | undefined> => {
    try {
      return (await fn(...args)) as Awaited<ReturnType<T>>;
    } catch (error) {
      handleError(error, options);
      return undefined;
    }
  };
}

/**
 * Retry async operation with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    shouldRetry?: (error: Error, attempt: number) => boolean;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = (error) => error instanceof NetworkError || error instanceof TimeoutError,
    onRetry,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = normalizeError(error);

      // Don't retry if this is the last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Check if we should retry this error
      if (!shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      // Call retry callback
      if (onRetry) {
        onRetry(lastError, attempt);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError!;
}

/**
 * Execute function with timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new TimeoutError(errorMessage, timeoutMs)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Safe JSON parse with error handling
 */
export function safeJSONParse<T>(
  json: string,
  fallback: T
): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logger.warn('JSON parse error:', error);
    return fallback;
  }
}

/**
 * Safe async operation that returns [error, data]
 *
 * @example
 * const [error, data] = await safe(fetchData());
 * if (error) {
 *   handleError(error);
 *   return;
 * }
 * console.log(data);
 */
export async function safe<T>(
  promise: Promise<T>
): Promise<[Error, undefined] | [undefined, T]> {
  try {
    const data = await promise;
    return [undefined, data];
  } catch (error) {
    return [normalizeError(error), undefined];
  }
}

/**
 * Convert unknown error to appropriate AppError
 */
export function toAppError(error: unknown, defaultMessage?: string): AppError {
  if (isAppError(error)) {
    return error;
  }

  const normalizedError = normalizeError(error);
  const message = defaultMessage || normalizedError.message;

  // Try to infer error type from message
  if (normalizedError.message.includes('validation')) {
    return new ValidationError(message);
  }

  if (normalizedError.message.includes('not found')) {
    return new NotFoundError(message);
  }

  if (normalizedError.message.includes('unauthorized') ||
      normalizedError.message.includes('authentication')) {
    return new AuthenticationError(message);
  }

  if (normalizedError.message.includes('forbidden') ||
      normalizedError.message.includes('permission')) {
    return new AuthorizationError(message);
  }

  if (normalizedError.message.includes('network') ||
      normalizedError.message.includes('fetch')) {
    return new NetworkError(message);
  }

  if (normalizedError.message.includes('database') ||
      normalizedError.message.includes('query')) {
    return new DatabaseError(message);
  }

  if (normalizedError.message.includes('timeout')) {
    return new TimeoutError(message, 0);
  }

  if (normalizedError.message.includes('rate limit')) {
    return new RateLimitError(message);
  }

  // Default to generic AppError
  return new AppError(message, 'UNKNOWN_ERROR', 500, true);
}
