/**
 * Convex-specific error handling utilities
 *
 * Handles errors from Convex queries, mutations, and actions
 */

import { ConvexError } from 'convex/values';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  ConflictError,
} from './errorTypes';
import { handleError } from './errorHandler';

/**
 * Convert Convex error to appropriate AppError
 */
export function fromConvexError(error: unknown): AppError {
  // Handle ConvexError
  if (error instanceof ConvexError) {
    const message = error.data || error.message || 'An error occurred';

    // Try to infer error type from message
    if (message.includes('not found')) {
      return new NotFoundError(message);
    }

    if (message.includes('unauthorized') || message.includes('authentication')) {
      return new AuthenticationError(message);
    }

    if (message.includes('forbidden') || message.includes('permission')) {
      return new AuthorizationError(message);
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return new ValidationError(message);
    }

    if (message.includes('duplicate') || message.includes('exists')) {
      return new ConflictError(message);
    }

    // Default to database error for Convex errors
    return new DatabaseError(message);
  }

  // Handle standard errors
  if (error instanceof Error) {
    return new DatabaseError(error.message, undefined, error);
  }

  // Handle unknown errors
  return new DatabaseError('An unknown database error occurred');
}

/**
 * Wrap Convex query/mutation/action with error handling
 *
 * @example
 * const result = await withConvexErrorHandling(
 *   () => api.myFunction({ arg: value }),
 *   { showToast: true }
 * );
 */
export async function withConvexErrorHandling<T>(
  fn: () => Promise<T>,
  options: {
    showToast?: boolean;
    toastMessage?: string;
    report?: boolean;
    rethrow?: boolean;
  } = {}
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    const appError = fromConvexError(error);
    handleError(appError, {
      showToast: options.showToast ?? true,
      toastMessage: options.toastMessage,
      report: options.report ?? true,
      rethrow: options.rethrow ?? false,
    });

    if (options.rethrow) {
      throw appError;
    }

    return undefined;
  }
}

/**
 * Create a Convex error with proper typing
 *
 * Use this in your Convex functions to throw typed errors
 *
 * @example
 * // In a Convex mutation
 * if (!user) {
 *   throw createConvexError('User not authenticated', 401);
 * }
 */
export function createConvexError(message: string, statusCode?: number): ConvexError<{ message: string; statusCode?: number; timestamp: string }> {
  return new ConvexError({
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Validation helper for Convex functions
 *
 * @example
 * // In a Convex mutation
 * validateConvex(args.email, 'email is required');
 * validateConvex(args.email.includes('@'), 'email must be valid');
 */
export function validateConvex(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new ConvexError({
      message,
      type: 'validation',
      statusCode: 400,
    });
  }
}

/**
 * Authorization helper for Convex functions
 *
 * @example
 * // In a Convex mutation
 * const user = await getUserOrThrow(ctx);
 * authorizeConvex(
 *   user.id === document.userId,
 *   'You do not have permission to modify this document'
 * );
 */
export function authorizeConvex(condition: boolean, message: string = 'Permission denied'): asserts condition {
  if (!condition) {
    throw new ConvexError({
      message,
      type: 'authorization',
      statusCode: 403,
    });
  }
}

/**
 * Authentication helper for Convex functions
 *
 * @example
 * // In a Convex query/mutation
 * const identity = await ctx.auth.getUserIdentity();
 * authenticateConvex(identity, 'You must be logged in');
 */
export function authenticateConvex<T>(value: T | null | undefined, message: string = 'Authentication required'): asserts value is T {
  if (!value) {
    throw new ConvexError({
      message,
      type: 'authentication',
      statusCode: 401,
    });
  }
}

/**
 * Not found helper for Convex functions
 *
 * @example
 * // In a Convex query
 * const document = await ctx.db.get(args.id);
 * assertFoundConvex(document, `Document with id ${args.id} not found`);
 */
export function assertFoundConvex<T>(value: T | null | undefined, message: string): asserts value is T {
  if (!value) {
    throw new ConvexError({
      message,
      type: 'not_found',
      statusCode: 404,
    });
  }
}
