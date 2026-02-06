# Error Handling Quick Reference

Quick reference for the most common error handling patterns.

## Import

```typescript
import {
  // Error types
  ValidationError,
  NetworkError,
  NotFoundError,
  DatabaseError,
  AuthenticationError,
  AuthorizationError,

  // Error handling
  handleError,
  retry,
  withTimeout,
  safe,

  // Tracking
  trackUserAction,
  trackNavigation,

  // Hooks
  useErrorHandler,
  useAsyncError,
  useErrorTracking,

  // Convex
  withConvexErrorHandling,
  validateConvex,
  authorizeConvex,
} from '@/lib/errors';
```

## Common Patterns

### Throw Custom Error

```typescript
throw new ValidationError('Email is required', { field: 'email' });
```

### Handle Error with Toast

```typescript
try {
  await operation();
} catch (error) {
  handleError(error, { showToast: true });
}
```

### Retry Network Request

```typescript
const data = await retry(() => fetch(url), {
  maxAttempts: 3,
  initialDelay: 1000,
});
```

### Safe Operation

```typescript
const [error, data] = await safe(riskyOperation());
if (error) {
  handleError(error);
  return;
}
```

### Track User Action

```typescript
trackUserAction('button-click', { buttonId: 'submit' });
```

### Use Error Hook

```typescript
const { handleError, error, clearError } = useErrorHandler();

const handleSubmit = async () => {
  try {
    await submit();
  } catch (err) {
    handleError(err, { showToast: true });
  }
};
```

### Async Error Hook

```typescript
const { execute, loading, error, data } = useAsyncError(fetchData, {
  showToast: true,
});

<button onClick={() => execute(params)} disabled={loading}>
  {loading ? 'Loading...' : 'Load'}
</button>
```

### Convex Error Handling

```typescript
// Client
const result = await withConvexErrorHandling(
  () => createTodo({ text }),
  { showToast: true }
);

// Server
validateConvex(args.text.length > 0, 'Text required');
authenticateConvex(identity, 'Login required');
authorizeConvex(canEdit, 'Permission denied');
```

## Error Types

| Type | Status | Use Case |
|------|--------|----------|
| `ValidationError` | 400 | Invalid input |
| `AuthenticationError` | 401 | Not logged in |
| `AuthorizationError` | 403 | No permission |
| `NotFoundError` | 404 | Missing resource |
| `ConflictError` | 409 | Duplicate/constraint |
| `TimeoutError` | 408 | Operation timeout |
| `RateLimitError` | 429 | Rate limit exceeded |
| `NetworkError` | 503 | Network failure |
| `DatabaseError` | 500 | Database error |
| `ExternalServiceError` | 502 | External API error |

## Error Boundaries

### Global

```tsx
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';

<GlobalErrorBoundary>
  <App />
</GlobalErrorBoundary>
```

### Custom Fallback

```tsx
<GlobalErrorBoundary fallback={(error, reset) => (
  <div>
    <p>{error.message}</p>
    <button onClick={reset}>Reset</button>
  </div>
)}>
  <Component />
</GlobalErrorBoundary>
```

## Convex Functions

### Validation

```typescript
export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    validateConvex(args.text.length > 0, 'Text required');
    validateConvex(args.text.length <= 100, 'Text too long');
  },
});
```

### Authentication

```typescript
const identity = await ctx.auth.getUserIdentity();
authenticateConvex(identity, 'Login required');
```

### Authorization

```typescript
authorizeConvex(
  doc.userId === identity.subject,
  'Cannot modify others documents'
);
```

### Not Found

```typescript
const doc = await ctx.db.get(args.id);
assertFoundConvex(doc, `Document ${args.id} not found`);
```

## Tracking

```typescript
// User action
trackUserAction('form-submit', { formId: 'contact' });

// Navigation
trackNavigation('/dashboard');

// Network request
trackNetworkRequest('POST', '/api/data', 200);

// State change
trackStateChange('user-logged-in', { userId: '123' });
```

## Setup

### Root Layout

```tsx
import { ErrorProvider } from '@/lib/errors/ErrorProvider';
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';

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

### Initialize (Alternative)

```tsx
import { initializeErrorReporting } from '@/lib/errors';

useEffect(() => {
  initializeErrorReporting();
}, []);
```
