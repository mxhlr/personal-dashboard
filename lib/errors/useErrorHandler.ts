/**
 * React hook for error handling
 *
 * Provides declarative error handling in React components
 */

import { useCallback, useEffect, useState } from 'react';
import { handleError, ErrorHandlingOptions } from './errorHandler';
import { trackUserAction } from './errorReporting';

/**
 * Hook for handling errors with toast notifications
 *
 * @example
 * const { handleError, clearError, error } = useErrorHandler();
 *
 * const handleSubmit = async () => {
 *   try {
 *     await submitForm();
 *   } catch (error) {
 *     handleError(error, { showToast: true });
 *   }
 * };
 */
export function useErrorHandler(defaultOptions: ErrorHandlingOptions = {}) {
  const [error, setError] = useState<Error | null>(null);

  const handleErrorCallback = useCallback(
    (error: unknown, options?: ErrorHandlingOptions) => {
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      setError(errorInstance);
      handleError(error, { ...defaultOptions, ...options });
    },
    [defaultOptions]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError: handleErrorCallback,
    clearError,
    hasError: error !== null,
  };
}

/**
 * Hook for async operations with automatic error handling
 *
 * @example
 * const { execute, loading, error, data } = useAsyncError(fetchData);
 *
 * const handleClick = () => {
 *   execute(params);
 * };
 */
export function useAsyncError<T extends (...args: never[]) => Promise<unknown>>(
  asyncFn: T,
  options: ErrorHandlingOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<T>> | null>(null);

  const execute = useCallback(
    async (...args: Parameters<T>) => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFn(...args);
        setData(result as Awaited<ReturnType<T>>);
        return result;
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error(String(err));
        setError(errorInstance);
        handleError(err, options);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn, options]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset,
    hasError: error !== null,
  };
}

/**
 * Hook to track component errors and user actions
 *
 * @example
 * const { trackAction, trackError } = useErrorTracking('MyComponent');
 *
 * const handleClick = () => {
 *   trackAction('button-click', { buttonId: 'save' });
 * };
 */
export function useErrorTracking(componentName: string) {
  const trackAction = useCallback(
    (action: string, data?: Record<string, unknown>) => {
      trackUserAction(`${componentName}: ${action}`, {
        component: componentName,
        ...data,
      });
    },
    [componentName]
  );

  const trackErrorCallback = useCallback(
    (error: Error, context?: Record<string, unknown>) => {
      handleError(error, {
        showToast: true,
        report: true,
        context: {
          component: componentName,
          ...context,
        },
      });
    },
    [componentName]
  );

  return {
    trackAction,
    trackError: trackErrorCallback,
  };
}

/**
 * Hook to handle errors in React Query or similar libraries
 *
 * @example
 * const query = useQuery({ queryKey: ['data'], queryFn: fetchData });
 * useQueryErrorHandler(query.error);
 */
export function useQueryErrorHandler(
  error: Error | null,
  options: ErrorHandlingOptions = {}
) {
  useEffect(() => {
    if (error) {
      handleError(error, {
        showToast: true,
        report: true,
        ...options,
      });
    }
  }, [error, options]);
}
