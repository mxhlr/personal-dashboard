# Error Handling Guide

Comprehensive documentation for the centralized error handling system in the personal dashboard application.

## Table of Contents

- [Overview](#overview)
- [Error Types](#error-types)
- [Error Handler](#error-handler)
- [Error Reporting](#error-reporting)
- [Error Boundaries](#error-boundaries)
- [React Hooks](#react-hooks)
- [Convex Integration](#convex-integration)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Overview

The centralized error handling system provides:

- **Structured error types** - Custom error classes for different scenarios
- **Unified error handling** - Consistent error handling across the application
- **Error recovery strategies** - Retry logic, timeouts, and fallbacks
- **User-friendly notifications** - Toast notifications with clear messages
- **Error tracking** - Breadcrumbs and context for debugging
- **Error reporting** - Integration points for external services

## Error Types

All custom errors extend from `AppError`, which provides:

- `code` - Machine-readable error code
- `statusCode` - HTTP status code
- `isOperational` - Whether the error is expected/safe to expose
- `timestamp` - When the error occurred
- `context` - Additional error context
- `toJSON()` - Serialization for logging/reporting

### Available Error Types

```typescript
import {
  ValidationError,      // 400 - Invalid input
  AuthenticationError,  // 401 - Not authenticated
  AuthorizationError,   // 403 - Permission denied
  NotFoundError,        // 404 - Resource not found
  ConflictError,        // 409 - Duplicate/constraint violation
  TimeoutError,         // 408 - Operation timeout
  RateLimitError,       // 429 - Rate limit exceeded
  NetworkError,         // 503 - Network/fetch failure
  DatabaseError,        // 500 - Database operation failure
  ExternalServiceError, // 502 - External API failure
  ConfigurationError,   // 500 - Configuration error
} from '@/lib/errors';
```

### Creating Custom Errors

```typescript
// Simple error
throw new ValidationError('Email is required');

// Error with context
throw new ValidationError('Invalid email format', {
  email: userEmail,
  field: 'email',
});

// Network error with original error
try {
  await fetch(url);
} catch (error) {
  throw new NetworkError(
    'Failed to fetch data',
    { url },
    error as Error
  );
}
```

## Error Handler

The central error handler provides utilities for handling, transforming, and recovering from errors.

### Basic Error Handling

```typescript
import { handleError } from '@/lib/errors';

try {
  await someOperation();
} catch (error) {
  handleError(error, {
    showToast: true,        // Show toast notification
    toastMessage: 'Custom message', // Optional custom message
    report: true,           // Report to error tracking
    context: { userId },    // Additional context
    rethrow: false,         // Don't rethrow after handling
  });
}
```

### Error Transformation

```typescript
import { toAppError } from '@/lib/errors';

try {
  JSON.parse(invalidJson);
} catch (error) {
  // Convert to AppError
  const appError = toAppError(error, 'Failed to parse JSON');
  throw appError;
}
```

### Retry Logic

```typescript
import { retry } from '@/lib/errors';

const data = await retry(
  async () => await fetchData(),
  {
    maxAttempts: 3,
    initialDelay: 1000,        // 1 second
    maxDelay: 10000,           // 10 seconds
    backoffFactor: 2,          // Exponential backoff
    shouldRetry: (error) => {
      // Custom retry logic
      return error instanceof NetworkError;
    },
    onRetry: (error, attempt) => {
      console.log(`Retry attempt ${attempt}`);
    },
  }
);
```

### Timeout Handling

```typescript
import { withTimeout } from '@/lib/errors';

const data = await withTimeout(
  async () => await slowOperation(),
  5000, // 5 seconds
  'Operation took too long'
);
```

### Safe Operations

```typescript
import { safe } from '@/lib/errors';

// Returns [error, data] tuple
const [error, data] = await safe(fetchData());

if (error) {
  // Handle error
  console.error('Failed:', error);
  return;
}

// Use data safely
console.log(data);
```

### Wrapped Functions

```typescript
import { withErrorHandling } from '@/lib/errors';

// Wrap function with automatic error handling
const safeFetch = withErrorHandling(fetchData, {
  showToast: true,
  report: true,
});

// Call without try/catch
const data = await safeFetch();
```

## Error Reporting

Track user actions and errors with breadcrumbs and context.

### Breadcrumbs

```typescript
import {
  addBreadcrumb,
  trackUserAction,
  trackNavigation,
  trackNetworkRequest,
  trackStateChange,
} from '@/lib/errors';

// Track user actions
trackUserAction('button-click', {
  buttonId: 'save-btn',
  formData: { /* ... */ },
});

// Track navigation
trackNavigation('/dashboard');

// Track network requests
trackNetworkRequest('POST', '/api/data', 200);

// Track state changes
trackStateChange('user-logged-in', { userId: '123' });

// Custom breadcrumb
addBreadcrumb({
  category: 'user-action',
  message: 'User submitted form',
  level: 'info',
  data: { formId: 'contact' },
});
```

### Initialize Error Reporting

Add to your root layout or app component:

```typescript
import { initializeErrorReporting } from '@/lib/errors';

// In useEffect or component mount
useEffect(() => {
  initializeErrorReporting();
}, []);
```

This will:
- Track navigation events
- Track console errors/warnings
- Track unhandled promise rejections
- Track global errors

### Error Context

```typescript
import { createErrorContext } from '@/lib/errors';

// Get current error context
const context = createErrorContext({
  customField: 'value',
});

// Context includes:
// - breadcrumbs (last 50 user actions)
// - userAgent
// - url
// - timestamp
// - custom metadata
```

## Error Boundaries

### Global Error Boundary

Wrap your entire app to catch all React errors:

```tsx
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <GlobalErrorBoundary>
      {children}
    </GlobalErrorBoundary>
  );
}
```

### Custom Error Boundary

Create custom error boundaries for specific sections:

```tsx
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';

function CustomFallback(error: Error, resetError: () => void) {
  return (
    <div>
      <h2>Custom Error UI</h2>
      <p>{error.message}</p>
      <button onClick={resetError}>Try Again</button>
    </div>
  );
}

export function MyComponent() {
  return (
    <GlobalErrorBoundary fallback={CustomFallback}>
      {/* Your content */}
    </GlobalErrorBoundary>
  );
}
```

### Existing Error Boundaries

The project includes specialized error boundaries:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ReviewErrorBoundary } from '@/components/reviews/ReviewErrorBoundary';

// General purpose
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// Review-specific with custom styling
<ReviewErrorBoundary reviewType="weekly">
  <WeeklyReview />
</ReviewErrorBoundary>
```

## React Hooks

### useErrorHandler

```typescript
import { useErrorHandler } from '@/lib/errors/useErrorHandler';

function MyComponent() {
  const { error, handleError, clearError, hasError } = useErrorHandler();

  const handleSubmit = async () => {
    try {
      await submitForm();
    } catch (err) {
      handleError(err, { showToast: true });
    }
  };

  if (hasError) {
    return <div>Error: {error?.message}</div>;
  }

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### useAsyncError

```typescript
import { useAsyncError } from '@/lib/errors/useErrorHandler';

function MyComponent() {
  const { execute, loading, error, data, reset } = useAsyncError(
    fetchData,
    { showToast: true }
  );

  const handleClick = () => {
    execute({ userId: '123' });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (data) return <div>Data: {data}</div>;

  return <button onClick={handleClick}>Load Data</button>;
}
```

### useErrorTracking

```typescript
import { useErrorTracking } from '@/lib/errors/useErrorHandler';

function MyComponent() {
  const { trackAction, trackError } = useErrorTracking('MyComponent');

  const handleClick = () => {
    trackAction('button-click', { buttonId: 'submit' });

    try {
      performAction();
    } catch (error) {
      trackError(error as Error, { action: 'performAction' });
    }
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

### useQueryErrorHandler

```typescript
import { useQuery } from 'convex/react';
import { useQueryErrorHandler } from '@/lib/errors/useErrorHandler';
import { api } from '@/convex/_generated/api';

function MyComponent() {
  const data = useQuery(api.myFunction.get);

  // Automatically handle query errors
  useQueryErrorHandler(data?.error, {
    showToast: true,
    toastMessage: 'Failed to load data',
  });

  return <div>{/* ... */}</div>;
}
```

## Convex Integration

### Error Handling in Client

```typescript
import { useMutation } from 'convex/react';
import { withConvexErrorHandling } from '@/lib/errors/convexErrorHandler';
import { api } from '@/convex/_generated/api';

function MyComponent() {
  const createTodo = useMutation(api.todos.create);

  const handleSubmit = async (text: string) => {
    await withConvexErrorHandling(
      () => createTodo({ text }),
      {
        showToast: true,
        toastMessage: 'Failed to create todo',
        report: true,
      }
    );
  };

  return <button onClick={() => handleSubmit('New todo')}>Add</button>;
}
```

### Error Helpers in Convex Functions

```typescript
import {
  validateConvex,
  authorizeConvex,
  authenticateConvex,
  assertFoundConvex,
  createConvexError,
} from '@/lib/errors/convexErrorHandler';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Mutation with validation
export const createTodo = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    // Validate input
    validateConvex(args.text.length > 0, 'Text cannot be empty');
    validateConvex(args.text.length <= 100, 'Text too long');

    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    authenticateConvex(identity, 'You must be logged in');

    // Create todo
    return await ctx.db.insert('todos', {
      text: args.text,
      userId: identity.subject,
    });
  },
});

// Query with authorization
export const getTodo = query({
  args: { id: v.id('todos') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    authenticateConvex(identity);

    const todo = await ctx.db.get(args.id);
    assertFoundConvex(todo, `Todo with id ${args.id} not found`);

    // Check authorization
    authorizeConvex(
      todo.userId === identity.subject,
      'You do not have permission to view this todo'
    );

    return todo;
  },
});

// Custom error
export const customOperation = mutation({
  handler: async (ctx) => {
    throw createConvexError('Custom error message', 400);
  },
});
```

## Best Practices

### 1. Use Appropriate Error Types

```typescript
// Good - Specific error type
throw new ValidationError('Email is required');

// Bad - Generic error
throw new Error('Email is required');
```

### 2. Provide Context

```typescript
// Good - With context
throw new NotFoundError('User not found', {
  userId: '123',
  searchedAt: new Date(),
});

// Bad - No context
throw new NotFoundError('User not found');
```

### 3. Use Error Boundaries

```tsx
// Good - Protected component
<ErrorBoundary>
  <CriticalComponent />
</ErrorBoundary>

// Bad - No error boundary
<CriticalComponent />
```

### 4. Handle Errors Close to Source

```typescript
// Good - Handle where it occurs
async function fetchUser(id: string) {
  try {
    return await api.users.get({ id });
  } catch (error) {
    handleError(error, {
      showToast: true,
      context: { userId: id },
    });
    throw error;
  }
}

// Bad - Silent failure
async function fetchUser(id: string) {
  try {
    return await api.users.get({ id });
  } catch (error) {
    // Error lost
  }
}
```

### 5. Use Breadcrumbs

```typescript
// Good - Track user actions
const handleSubmit = async () => {
  trackUserAction('form-submit', { formId: 'contact' });

  try {
    await submitForm();
    trackUserAction('form-submit-success');
  } catch (error) {
    trackUserAction('form-submit-error');
    handleError(error);
  }
};
```

### 6. Implement Retry for Network Errors

```typescript
// Good - Retry network operations
const data = await retry(
  () => fetch('/api/data'),
  {
    maxAttempts: 3,
    shouldRetry: (error) => error instanceof NetworkError,
  }
);

// Bad - No retry
const data = await fetch('/api/data');
```

### 7. Use Safe Operations for Non-Critical Errors

```typescript
// Good - Safe parsing
const config = safeJSONParse(configString, defaultConfig);

// Bad - Throws on error
const config = JSON.parse(configString);
```

### 8. Validate in Convex Functions

```typescript
// Good - Validate inputs
export const createUser = mutation({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    validateConvex(args.email.includes('@'), 'Invalid email');
    validateConvex(args.name.length > 0, 'Name required');

    // Create user
  },
});

// Bad - No validation
export const createUser = mutation({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    // Directly create without validation
  },
});
```

## Examples

### Complete Form Submission

```typescript
import { useAsyncError, trackUserAction } from '@/lib/errors';

function ContactForm() {
  const { execute, loading, error } = useAsyncError(submitForm, {
    showToast: true,
    toastMessage: 'Failed to submit form',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    trackUserAction('contact-form-submit');

    const formData = new FormData(e.currentTarget);
    const result = await execute(formData);

    if (result) {
      trackUserAction('contact-form-success');
      // Handle success
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div className="error">{error.message}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Data Fetching with Retry

```typescript
import { retry, NetworkError } from '@/lib/errors';
import { toast } from 'sonner';

async function fetchUserData(userId: string) {
  return await retry(
    async () => {
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        throw new NetworkError(`Failed to fetch user: ${response.statusText}`);
      }

      return response.json();
    },
    {
      maxAttempts: 3,
      initialDelay: 1000,
      onRetry: (error, attempt) => {
        toast.info(`Retrying... (attempt ${attempt})`);
      },
    }
  );
}
```

### Protected Component

```tsx
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';
import { useErrorTracking } from '@/lib/errors/useErrorHandler';

function DataDashboard() {
  const { trackAction } = useErrorTracking('DataDashboard');

  useEffect(() => {
    trackAction('component-mounted');
  }, []);

  return (
    <GlobalErrorBoundary>
      <div>
        {/* Dashboard content */}
      </div>
    </GlobalErrorBoundary>
  );
}
```

### Convex Mutation with Full Error Handling

```typescript
// Client side
import { useMutation } from 'convex/react';
import { withConvexErrorHandling } from '@/lib/errors/convexErrorHandler';
import { trackUserAction } from '@/lib/errors';
import { api } from '@/convex/_generated/api';

function TodoForm() {
  const createTodo = useMutation(api.todos.create);

  const handleSubmit = async (text: string) => {
    trackUserAction('create-todo', { text });

    const todo = await withConvexErrorHandling(
      () => createTodo({ text }),
      {
        showToast: true,
        toastMessage: 'Failed to create todo',
      }
    );

    if (todo) {
      trackUserAction('create-todo-success', { todoId: todo });
    }
  };

  return <input onSubmit={handleSubmit} />;
}

// Server side (Convex function)
import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { validateConvex, authenticateConvex } from '@/lib/errors/convexErrorHandler';

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    // Validate
    validateConvex(args.text.length > 0, 'Text cannot be empty');
    validateConvex(args.text.length <= 100, 'Text must be 100 characters or less');

    // Authenticate
    const identity = await ctx.auth.getUserIdentity();
    authenticateConvex(identity, 'You must be logged in to create todos');

    // Create todo
    return await ctx.db.insert('todos', {
      text: args.text,
      userId: identity.subject,
      completed: false,
      createdAt: Date.now(),
    });
  },
});
```

## Integration Checklist

- [ ] Import error types where needed
- [ ] Add GlobalErrorBoundary to root layout
- [ ] Initialize error reporting in app component
- [ ] Add breadcrumbs for user actions
- [ ] Use error hooks in components
- [ ] Add Convex error helpers to mutations/queries
- [ ] Implement retry logic for network requests
- [ ] Add error boundaries around critical sections
- [ ] Test error scenarios
- [ ] Configure external error tracking (optional)

## External Service Integration

To integrate with external error tracking services:

1. **Sentry**: Uncomment Sentry code in `errorReporting.ts`
2. **LogRocket**: Add LogRocket SDK and integrate in `reportError`
3. **Custom API**: Implement custom error endpoint and call in `reportError`

Example Sentry integration:

```typescript
// Install: npm install @sentry/nextjs

// In errorReporting.ts
import * as Sentry from '@sentry/nextjs';

export function reportError(error: Error, context?: Record<string, unknown>): void {
  const errorContext = createErrorContext(context);

  Sentry.captureException(error, {
    contexts: {
      errorContext: errorContext,
    },
    tags: {
      errorCode: isAppError(error) ? error.code : 'UNKNOWN',
    },
  });
}
```

## Troubleshooting

### Errors not showing toasts

- Check that `sonner` Toaster is rendered in your layout
- Verify `showToast: true` is set in error handling options
- Ensure error handler is being called

### Breadcrumbs not appearing

- Call `initializeErrorReporting()` in your app component
- Check that breadcrumb tracking functions are imported and called
- Verify breadcrumbs in error boundary details (development mode)

### Error boundaries not catching errors

- Ensure error boundaries wrap the component throwing errors
- Check that errors are thrown during render (not in event handlers)
- For async errors in event handlers, use try/catch with handleError

### Convex errors not being caught

- Use `withConvexErrorHandling` wrapper
- Ensure Convex error helpers are imported
- Check that ConvexError is being thrown (not regular Error)
