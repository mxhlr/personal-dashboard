/**
 * Centralized error handling system
 *
 * @example Import everything
 * import * as ErrorHandler from '@/lib/errors';
 *
 * @example Import specific items
 * import { handleError, ValidationError } from '@/lib/errors';
 */

// Export error types
export * from './errorTypes';

// Export error handler utilities
export * from './errorHandler';

// Export error reporting utilities
export * from './errorReporting';

// Export React hooks
export * from './useErrorHandler';

// Export Convex utilities
export * from './convexErrorHandler';
