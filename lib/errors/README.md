# Centralized Error Handling System

A comprehensive, production-ready error handling system for Next.js + Convex applications.

## Features

- **Structured Error Types** - Custom error classes for different scenarios (ValidationError, NetworkError, etc.)
- **Unified Error Handling** - Consistent error handling across the application
- **Error Recovery** - Retry logic, timeouts, and fallback strategies
- **User-Friendly Notifications** - Toast notifications with sonner integration
- **Error Tracking** - Breadcrumbs and context for debugging
- **Error Reporting** - Integration points for external services (Sentry, LogRocket, etc.)
- **React Integration** - Error boundaries and hooks for React components
- **Convex Integration** - Specialized utilities for Convex queries/mutations
- **TypeScript Support** - Full type safety and IntelliSense

## Quick Start

### 1. Setup

Add to your root layout:

```tsx
import { ErrorProvider } from "@/lib/errors/ErrorProvider";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorProvider>
          <GlobalErrorBoundary>
            {children}
          </GlobalErrorBoundary>
        </ErrorProvider>
      </body>
    </html>
  );
}
```

### 2. Basic Usage

```typescript
import { ValidationError, handleError } from '@/lib/errors';

try {
  if (!email.includes('@')) {
    throw new ValidationError('Invalid email', { email });
  }
} catch (error) {
  handleError(error, { showToast: true });
}
```

### 3. Convex Integration

**Server (Convex function):**
```typescript
import { validateConvex, authenticateConvex } from '@/lib/errors/convexErrorHandler';

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    validateConvex(args.text.length > 0, 'Text required');

    const identity = await ctx.auth.getUserIdentity();
    authenticateConvex(identity, 'Login required');

    return await ctx.db.insert('todos', { text: args.text });
  },
});
```

**Client:**
```typescript
import { withConvexErrorHandling } from '@/lib/errors';

const result = await withConvexErrorHandling(
  () => createTodo({ text }),
  { showToast: true }
);
```

## Documentation

- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** - Complete documentation with examples
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference for common patterns
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Guide for migrating existing code
- **[examples.ts](./examples.ts)** - Code examples for common use cases

## Files

```
lib/errors/
├── index.ts                    # Main entry point
├── errorTypes.ts               # Custom error classes
├── errorHandler.ts             # Central error handling logic
├── errorReporting.ts           # Error tracking and breadcrumbs
├── convexErrorHandler.ts       # Convex-specific utilities
├── useErrorHandler.ts          # React hooks
├── ErrorProvider.tsx           # Error provider component
├── examples.ts                 # Usage examples
├── README.md                   # This file
├── ERROR_HANDLING.md           # Complete documentation
├── QUICK_REFERENCE.md          # Quick reference
└── MIGRATION_GUIDE.md          # Migration guide

components/
├── GlobalErrorBoundary.tsx     # Global error boundary
├── ErrorBoundary.tsx           # General error boundary (enhanced)
└── reviews/
    └── ReviewErrorBoundary.tsx # Review-specific error boundary (enhanced)
```

## Error Types

| Type | Status | Use Case |
|------|--------|----------|
| `ValidationError` | 400 | Invalid input, schema validation |
| `AuthenticationError` | 401 | User not authenticated |
| `AuthorizationError` | 403 | User lacks permission |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Duplicate resource, constraint violation |
| `TimeoutError` | 408 | Operation timeout |
| `RateLimitError` | 429 | Rate limit exceeded |
| `NetworkError` | 503 | Network/fetch failure |
| `DatabaseError` | 500 | Database operation failure |
| `ExternalServiceError` | 502 | External API failure |
| `ConfigurationError` | 500 | Configuration error |

## React Hooks

### useErrorHandler

```typescript
const { error, handleError, clearError, hasError } = useErrorHandler();
```

### useAsyncError

```typescript
const { execute, loading, error, data, reset } = useAsyncError(asyncFn, options);
```

### useErrorTracking

```typescript
const { trackAction, trackError } = useErrorTracking('ComponentName');
```

## Error Recovery

### Retry with Exponential Backoff

```typescript
import { retry } from '@/lib/errors';

const data = await retry(() => fetch(url), {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffFactor: 2,
});
```

### Timeout

```typescript
import { withTimeout } from '@/lib/errors';

const data = await withTimeout(() => slowOperation(), 5000);
```

### Safe Operations

```typescript
import { safe } from '@/lib/errors';

const [error, data] = await safe(riskyOperation());
if (error) {
  // Handle error
}
```

## Error Tracking

### Breadcrumbs

```typescript
import { trackUserAction, trackNavigation } from '@/lib/errors';

trackUserAction('button-click', { buttonId: 'submit' });
trackNavigation('/dashboard');
```

### Error Context

All errors are automatically tracked with:
- Last 50 user actions (breadcrumbs)
- User agent
- Current URL
- Timestamp
- Custom metadata

## Error Boundaries

### Global

```tsx
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';

<GlobalErrorBoundary>
  <App />
</GlobalErrorBoundary>
```

### Specialized

```tsx
import { ReviewErrorBoundary } from '@/components/reviews/ReviewErrorBoundary';

<ReviewErrorBoundary reviewType="weekly">
  <WeeklyReview />
</ReviewErrorBoundary>
```

### Custom Fallback

```tsx
<GlobalErrorBoundary fallback={(error, reset) => (
  <CustomErrorUI error={error} onReset={reset} />
)}>
  <Component />
</GlobalErrorBoundary>
```

## Convex Helpers

### Validation

```typescript
validateConvex(condition, message);
```

### Authentication

```typescript
authenticateConvex(identity, message);
```

### Authorization

```typescript
authorizeConvex(condition, message);
```

### Not Found

```typescript
assertFoundConvex(value, message);
```

## External Service Integration

### Sentry

```typescript
// In errorReporting.ts, uncomment Sentry code
import * as Sentry from '@sentry/nextjs';

export function reportError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    contexts: { errorContext: createErrorContext(context) },
  });
}
```

### LogRocket

```typescript
import LogRocket from 'logrocket';

export function reportError(error: Error, context?: Record<string, unknown>) {
  LogRocket.captureException(error, {
    extra: createErrorContext(context),
  });
}
```

## Testing

Use the demo component to test error handling:

```tsx
import { ErrorHandlingDemo } from '@/components/ErrorHandlingDemo';

<ErrorHandlingDemo />
```

## Best Practices

1. **Use specific error types** - Don't use generic `Error`
2. **Provide context** - Add relevant data to errors
3. **Handle errors close to source** - Don't let errors bubble too far
4. **Use error boundaries** - Protect critical sections
5. **Track user actions** - Add breadcrumbs for debugging
6. **Implement retry logic** - For network operations
7. **Use safe operations** - For non-critical errors
8. **Validate in Convex** - Use validation helpers

## Examples

### Form Submission

```typescript
import { ValidationError, handleError, trackUserAction } from '@/lib/errors';

const handleSubmit = async (formData: FormData) => {
  trackUserAction('form-submit', { formType: 'contact' });

  try {
    // Validate
    const email = formData.get('email') as string;
    if (!email.includes('@')) {
      throw new ValidationError('Invalid email', { email });
    }

    // Submit
    await submitForm(formData);
    trackUserAction('form-submit-success');
  } catch (error) {
    trackUserAction('form-submit-error');
    handleError(error, { showToast: true });
  }
};
```

### API Call with Retry

```typescript
import { retry, NetworkError, trackNetworkRequest } from '@/lib/errors';

const fetchData = async () => {
  return await retry(
    async () => {
      const response = await fetch('/api/data');

      trackNetworkRequest('GET', '/api/data', response.status);

      if (!response.ok) {
        throw new NetworkError('Failed to fetch', {
          url: '/api/data',
          status: response.status,
        });
      }

      return response.json();
    },
    { maxAttempts: 3, initialDelay: 1000 }
  );
};
```

### Convex Mutation

```typescript
// Server
import { validateConvex, authenticateConvex } from '@/lib/errors/convexErrorHandler';

export const updateTodo = mutation({
  args: { id: v.id('todos'), completed: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    authenticateConvex(identity);

    const todo = await ctx.db.get(args.id);
    assertFoundConvex(todo, `Todo ${args.id} not found`);

    authorizeConvex(
      todo.userId === identity.subject,
      'Cannot modify others todos'
    );

    return await ctx.db.patch(args.id, { completed: args.completed });
  },
});

// Client
import { withConvexErrorHandling } from '@/lib/errors';

const updateTodo = useMutation(api.todos.update);

await withConvexErrorHandling(
  () => updateTodo({ id, completed: true }),
  { showToast: true, toastMessage: 'Failed to update todo' }
);
```

## Performance

The error handling system is designed to be lightweight:

- **Zero overhead** when no errors occur
- **Minimal memory** for breadcrumbs (max 50 entries)
- **Lazy loading** for error reporting
- **Tree-shakeable** exports

## TypeScript

Full TypeScript support with:

- Type guards (`isAppError`, `isOperationalError`)
- Generic type inference
- Strict type checking
- IntelliSense for all utilities

## Contributing

To add a new error type:

1. Add to `errorTypes.ts`:
```typescript
export class MyCustomError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'MY_CUSTOM_ERROR', 500, true, context);
  }
}
```

2. Add message to `errorHandler.ts`:
```typescript
const ERROR_MESSAGES: Record<string, string> = {
  MY_CUSTOM_ERROR: 'User-friendly message',
};
```

3. Export from `index.ts`

## License

Part of the personal-dashboard project.

## Support

For issues or questions:
1. Check [ERROR_HANDLING.md](./ERROR_HANDLING.md)
2. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
3. Review [examples.ts](./examples.ts)
4. Test with [ErrorHandlingDemo](../../components/ErrorHandlingDemo.tsx)
