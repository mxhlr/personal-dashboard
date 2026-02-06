/**
 * Example usage of the error handling system
 *
 * These examples demonstrate common patterns and best practices.
 * You can import and adapt these for your own use cases.
 */

import {
  ValidationError,
  NetworkError,
  NotFoundError,
  handleError,
  retry,
  withTimeout,
  safe,
  toAppError,
  trackUserAction,
  withConvexErrorHandling,
} from '@/lib/errors';

// Example 1: Form validation with custom error
export async function validateAndSubmitForm(formData: FormData) {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;

  // Validate inputs
  if (!email || !email.includes('@')) {
    throw new ValidationError('Invalid email address', {
      email,
      field: 'email',
    });
  }

  if (!name || name.length < 2) {
    throw new ValidationError('Name must be at least 2 characters', {
      name,
      field: 'name',
    });
  }

  // Track user action
  trackUserAction('form-submit', {
    formType: 'contact',
    fields: ['email', 'name'],
  });

  // Submit form
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new NetworkError('Failed to submit form', {
        status: response.status,
        statusText: response.statusText,
      });
    }

    trackUserAction('form-submit-success');
    return await response.json();
  } catch (error) {
    trackUserAction('form-submit-error');
    throw error;
  }
}

// Example 2: Retry network request with exponential backoff
export async function fetchDataWithRetry<T>(url: string): Promise<T> {
  return await retry(
    async () => {
      const response = await fetch(url);

      if (!response.ok) {
        throw new NetworkError(
          `Failed to fetch: ${response.statusText}`,
          { url, status: response.status }
        );
      }

      return response.json() as Promise<T>;
    },
    {
      maxAttempts: 3,
      initialDelay: 1000,
      shouldRetry: (error) => error instanceof NetworkError,
      onRetry: (error, attempt) => {
        console.log(`Retrying request (attempt ${attempt}):`, error.message);
      },
    }
  );
}

// Example 3: Safe operation with error handling
export async function safeLoadUserData(userId: string) {
  const [error, data] = await safe(fetchUserData(userId));

  if (error) {
    handleError(error, {
      showToast: true,
      toastMessage: 'Failed to load user data',
      context: { userId },
    });
    return null;
  }

  return data;
}

async function fetchUserData(userId: string) {
  const response = await fetch(`/api/users/${userId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new NotFoundError(`User ${userId} not found`, { userId });
    }
    throw new NetworkError(`Failed to fetch user: ${response.statusText}`);
  }

  return response.json();
}

// Example 4: Timeout for slow operations
export async function fetchWithTimeout<T>(
  url: string,
  timeoutMs: number = 5000
): Promise<T> {
  return await withTimeout(
    async () => {
      const response = await fetch(url);

      if (!response.ok) {
        throw new NetworkError(
          `Request failed: ${response.statusText}`,
          { url, status: response.status }
        );
      }

      return response.json();
    },
    timeoutMs,
    `Request to ${url} timed out after ${timeoutMs}ms`
  );
}

// Example 5: Transform unknown error to AppError
export function processUserInput(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch (error) {
    // Transform to ValidationError
    throw toAppError(error, 'Invalid JSON input');
  }
}

// Example 6: Convex mutation with error handling
export async function createTodoSafely(
  createTodo: (args: { text: string }) => Promise<string>,
  text: string
) {
  trackUserAction('create-todo', { text });

  const result = await withConvexErrorHandling(
    () => createTodo({ text }),
    {
      showToast: true,
      toastMessage: 'Failed to create todo',
      report: true,
    }
  );

  if (result) {
    trackUserAction('create-todo-success', { todoId: result });
  } else {
    trackUserAction('create-todo-error');
  }

  return result;
}

// Example 7: Multiple retries with different strategies
export async function robustFetch<T>(url: string): Promise<T> {
  // First try with retry
  try {
    return await retry(
      () => fetchWithTimeout<T>(url, 5000),
      {
        maxAttempts: 3,
        initialDelay: 1000,
        shouldRetry: (error) => error instanceof NetworkError,
      }
    );
  } catch (error) {
    // If all retries fail, handle the error
    handleError(error, {
      showToast: true,
      toastMessage: 'Failed to load data. Please try again.',
      report: true,
      context: { url },
    });
    throw error;
  }
}

// Example 8: Batch operations with error collection
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>
): Promise<{ results: R[]; errors: Error[] }> {
  const results: R[] = [];
  const errors: Error[] = [];

  for (const item of items) {
    const [error, result] = await safe(processor(item));

    if (error) {
      errors.push(error);
      handleError(error, {
        showToast: false, // Don't show toast for each error
        report: true,
      });
    } else if (result) {
      results.push(result);
    }
  }

  // Show summary toast if there were errors
  if (errors.length > 0) {
    handleError(
      new Error(`${errors.length} items failed to process`),
      {
        showToast: true,
        toastMessage: `Processed ${results.length}/${items.length} items successfully`,
        context: { totalItems: items.length, successCount: results.length, errorCount: errors.length },
      }
    );
  }

  return { results, errors };
}
