/**
 * Custom error types for the application
 *
 * These error classes provide structured error handling with
 * additional context and categorization.
 */

/**
 * Base application error class
 * All custom errors extend from this class
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.context = context;

    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Convert error to a plain object for logging/reporting
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Validation errors (400)
 * Used for input validation failures, schema validation, etc.
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', 400, true, context);
  }
}

/**
 * Authentication errors (401)
 * Used when user is not authenticated
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = 'Authentication required',
    context?: Record<string, unknown>
  ) {
    super(message, 'AUTHENTICATION_ERROR', 401, true, context);
  }
}

/**
 * Authorization errors (403)
 * Used when user lacks permission for an action
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = 'Permission denied',
    context?: Record<string, unknown>
  ) {
    super(message, 'AUTHORIZATION_ERROR', 403, true, context);
  }
}

/**
 * Not found errors (404)
 * Used when a resource cannot be found
 */
export class NotFoundError extends AppError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'NOT_FOUND_ERROR', 404, true, context);
  }
}

/**
 * Conflict errors (409)
 * Used for duplicate resources, constraint violations, etc.
 */
export class ConflictError extends AppError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'CONFLICT_ERROR', 409, true, context);
  }
}

/**
 * Network errors
 * Used for HTTP request failures, timeouts, etc.
 */
export class NetworkError extends AppError {
  public readonly originalError?: Error;

  constructor(
    message: string,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message, 'NETWORK_ERROR', 503, true, context);
    this.originalError = originalError;
  }
}

/**
 * Database errors
 * Used for database operations that fail
 */
export class DatabaseError extends AppError {
  public readonly query?: string;
  public readonly originalError?: Error;

  constructor(
    message: string,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message, 'DATABASE_ERROR', 500, true, context);
    this.originalError = originalError;
  }
}

/**
 * External service errors
 * Used when external APIs or services fail
 */
export class ExternalServiceError extends AppError {
  public readonly service: string;
  public readonly originalError?: Error;

  constructor(
    message: string,
    service: string,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message, 'EXTERNAL_SERVICE_ERROR', 502, true, context);
    this.service = service;
    this.originalError = originalError;
  }
}

/**
 * Rate limit errors (429)
 * Used when rate limits are exceeded
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    context?: Record<string, unknown>
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429, true, context);
    this.retryAfter = retryAfter;
  }
}

/**
 * Configuration errors
 * Used for missing or invalid configuration
 */
export class ConfigurationError extends AppError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'CONFIGURATION_ERROR', 500, false, context);
  }
}

/**
 * Timeout errors
 * Used when operations exceed their time limit
 */
export class TimeoutError extends AppError {
  public readonly timeoutMs: number;

  constructor(
    message: string,
    timeoutMs: number,
    context?: Record<string, unknown>
  ) {
    super(message, 'TIMEOUT_ERROR', 408, true, context);
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if an error is operational (safe to expose to users)
 */
export function isOperationalError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.isOperational;
  }
  return false;
}
