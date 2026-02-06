# Error Handling System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Application Layer                            │
├─────────────────────────────────────────────────────────────────────┤
│  React Components  │  Convex Functions  │  API Routes  │  Utils     │
└──────────┬──────────┴────────────┬───────┴──────────┬──┴────────────┘
           │                       │                  │
           │  Uses Error Hooks     │  Uses Helpers    │  Uses Handler
           ▼                       ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Error Handling Layer                            │
├─────────────────┬──────────────────┬─────────────────┬──────────────┤
│  Error Types    │  Error Handler   │  Error Tracking │  Convex      │
│                 │                  │                 │  Integration │
│  - ValidationErr│  - handleError() │  - Breadcrumbs  │  - validate  │
│  - NetworkErr   │  - retry()       │  - Context      │  - authorize │
│  - NotFoundErr  │  - withTimeout() │  - Report       │  - fromError │
│  - AuthErr      │  - safe()        │  - Track        │  - withError │
│  - TimeoutErr   │  - toAppError()  │  - Init         │  - assert    │
│  - 6 more...    │  - wrapped()     │  - Navigation   │  - create    │
└─────────────────┴──────────────────┴─────────────────┴──────────────┘
           │                       │                  │
           │                       │                  │
           ▼                       ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Integration Layer                               │
├─────────────────┬──────────────────┬─────────────────┬──────────────┤
│  React Hooks    │  Error Bounds    │  Provider       │  Toast       │
│                 │                  │                 │  Notifications│
│  - useErrorHdlr │  - Global        │  - ErrorProvider│  - Sonner    │
│  - useAsyncErr  │  - ErrorBoundary │  - Navigation   │  - User Msgs │
│  - useTracking  │  - Review        │  - Initialize   │  - German    │
│  - useQueryErr  │  - Custom        │  - Auto Track   │  - Context   │
└─────────────────┴──────────────────┴─────────────────┴──────────────┘
           │                       │                  │
           └───────────────────────┴──────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Output Layer                                    │
├─────────────────┬──────────────────┬─────────────────┬──────────────┤
│  User Interface │  Console Logs    │  Breadcrumbs    │  External    │
│                 │                  │                 │  Services    │
│  - Toast        │  - Development   │  - Dev Details  │  - Sentry    │
│  - Error UI     │  - Stack Traces  │  - Component    │  - LogRocket │
│  - Recovery     │  - Context       │  - Network      │  - Custom    │
│  - Messages     │  - Breadcrumbs   │  - User Actions │  - API       │
└─────────────────┴──────────────────┴─────────────────┴──────────────┘
```

## Data Flow

### Error Creation and Handling

```
1. Error Occurs
   │
   ├─ In Component
   │  └─> throw new ValidationError()
   │
   ├─ In Convex Function
   │  └─> validateConvex() / authenticateConvex()
   │      └─> throw ConvexError
   │
   ├─ In API Call
   │  └─> throw new NetworkError()
   │
   └─ In Utility Function
      └─> throw new AppError()

2. Error Caught
   │
   ├─ By Error Boundary
   │  └─> componentDidCatch()
   │      └─> reportError()
   │          └─> Show Fallback UI
   │
   ├─ By Try-Catch
   │  └─> catch (error)
   │      └─> handleError()
   │          ├─> showErrorToast()
   │          ├─> reportError()
   │          └─> Optional: rethrow
   │
   ├─ By Hook
   │  └─> useErrorHandler()
   │      └─> handleError()
   │          └─> Update State
   │
   └─ By Wrapper
      └─> withConvexErrorHandling()
          └─> fromConvexError()
              └─> handleError()

3. Error Processed
   │
   ├─> Breadcrumb Added
   │   └─> Store in breadcrumbStore (max 50)
   │
   ├─> Context Created
   │   ├─> Breadcrumbs
   │   ├─> User Agent
   │   ├─> URL
   │   ├─> Timestamp
   │   └─> Metadata
   │
   ├─> User Message Generated
   │   └─> ERROR_MESSAGES[code] or message
   │
   └─> Toast Notification
       └─> sonner.toast.error()

4. Error Reported
   │
   ├─> Development
   │   └─> console.error()
   │       ├─> Error details
   │       ├─> Stack trace
   │       └─> Breadcrumbs
   │
   └─> Production
       └─> reportError()
           └─> External Service
               ├─> Sentry
               ├─> LogRocket
               └─> Custom API
```

## Component Architecture

### Error Boundary Hierarchy

```
App
└─ ErrorProvider (Navigation tracking)
   └─ GlobalErrorBoundary (Catches all errors)
      └─ ClerkProvider
         └─ ConvexClientProvider
            └─ Layout
               ├─ Page 1
               │  └─ ErrorBoundary (Component-specific)
               │     └─ CriticalFeature
               │
               └─ Page 2
                  └─ ReviewErrorBoundary (Review-specific)
                     └─ WeeklyReview
```

### Error Flow in React

```
Component Error
    │
    ├─> Render Error
    │   └─> Error Boundary
    │       └─> getDerivedStateFromError()
    │       └─> componentDidCatch()
    │           ├─> Log Error
    │           ├─> Report Error
    │           └─> Show Fallback UI
    │
    └─> Event Handler Error
        └─> try-catch
            └─> handleError()
                ├─> Show Toast
                ├─> Report Error
                └─> Update State
```

### Convex Error Flow

```
Client                          Server (Convex)
  │                                 │
  │  useMutation(api.todos.create)  │
  │─────────────────────────────────>│
  │                                 │  mutation handler
  │                                 │    │
  │                                 │    ├─> validateConvex()
  │                                 │    │   └─> throw ConvexError
  │                                 │    │
  │                                 │    ├─> authenticateConvex()
  │                                 │    │   └─> throw ConvexError
  │                                 │    │
  │                                 │    └─> authorizeConvex()
  │                                 │        └─> throw ConvexError
  │                                 │
  │<─────────────────────────────────│  ConvexError
  │  withConvexErrorHandling()       │
  │    │                             │
  │    ├─> fromConvexError()         │
  │    │   └─> AppError              │
  │    │                             │
  │    ├─> handleError()             │
  │    │   ├─> Toast                 │
  │    │   └─> Report                │
  │    │                             │
  │    └─> return undefined          │
```

## Hook Architecture

### useErrorHandler

```
Component
    │
    ├─> const { error, handleError, clearError } = useErrorHandler()
    │
    ├─> Event Handler
    │   └─> try-catch
    │       └─> handleError(error, options)
    │           ├─> setError(error)
    │           └─> handleError() utility
    │
    └─> Render
        └─> if (error) show error UI
```

### useAsyncError

```
Component
    │
    ├─> const { execute, loading, error, data } = useAsyncError(fn, options)
    │
    ├─> Event Handler
    │   └─> execute(params)
    │       ├─> setLoading(true)
    │       ├─> try
    │       │   ├─> const result = await fn(params)
    │       │   ├─> setData(result)
    │       │   └─> return result
    │       ├─> catch
    │       │   ├─> setError(error)
    │       │   ├─> handleError(error, options)
    │       │   └─> throw error
    │       └─> finally
    │           └─> setLoading(false)
    │
    └─> Render
        ├─> if (loading) show loading
        ├─> if (error) show error
        └─> if (data) show data
```

## Error Type Hierarchy

```
Error (JavaScript built-in)
    │
    └─> AppError (Base for all custom errors)
        │
        ├─> ValidationError (400)
        │   └─> Invalid input, schema validation
        │
        ├─> AuthenticationError (401)
        │   └─> Not authenticated, login required
        │
        ├─> AuthorizationError (403)
        │   └─> Permission denied, forbidden
        │
        ├─> NotFoundError (404)
        │   └─> Resource not found
        │
        ├─> TimeoutError (408)
        │   └─> Operation timeout
        │
        ├─> ConflictError (409)
        │   └─> Duplicate, constraint violation
        │
        ├─> RateLimitError (429)
        │   └─> Rate limit exceeded
        │
        ├─> DatabaseError (500)
        │   └─> Database operation failure
        │
        ├─> ConfigurationError (500)
        │   └─> Configuration error
        │
        ├─> ExternalServiceError (502)
        │   └─> External API failure
        │
        └─> NetworkError (503)
            └─> Network/fetch failure
```

## Breadcrumb System

```
Application Events
    │
    ├─> User Action
    │   └─> trackUserAction('button-click', data)
    │       └─> addBreadcrumb({ category: 'user-action', ... })
    │
    ├─> Navigation
    │   └─> trackNavigation('/dashboard')
    │       └─> addBreadcrumb({ category: 'navigation', ... })
    │
    ├─> Network Request
    │   └─> trackNetworkRequest('POST', '/api/data', 200)
    │       └─> addBreadcrumb({ category: 'network', ... })
    │
    ├─> State Change
    │   └─> trackStateChange('user-logged-in', data)
    │       └─> addBreadcrumb({ category: 'state-change', ... })
    │
    └─> Console Message
        └─> trackConsole('error', message)
            └─> addBreadcrumb({ category: 'console', ... })

BreadcrumbStore
    │
    ├─> breadcrumbs: ErrorBreadcrumb[] (max 50)
    │   └─> { timestamp, category, message, level, data }
    │
    ├─> add(breadcrumb)
    │   ├─> breadcrumbs.push(breadcrumb)
    │   └─> if (length > 50) breadcrumbs.shift()
    │
    ├─> getAll()
    │   └─> return [...breadcrumbs]
    │
    └─> clear()
        └─> breadcrumbs = []

Error Context
    │
    └─> createErrorContext(metadata)
        └─> {
              breadcrumbs: getBreadcrumbs(),
              userAgent,
              url,
              timestamp,
              metadata
            }
```

## Recovery Strategies

### Retry with Exponential Backoff

```
retry(fn, options)
    │
    ├─> Attempt 1
    │   ├─> try fn()
    │   │   └─> Success → return result
    │   └─> catch error
    │       ├─> shouldRetry(error, 1) ?
    │       ├─> onRetry(error, 1)
    │       └─> wait(initialDelay)
    │
    ├─> Attempt 2
    │   ├─> try fn()
    │   │   └─> Success → return result
    │   └─> catch error
    │       ├─> shouldRetry(error, 2) ?
    │       ├─> onRetry(error, 2)
    │       └─> wait(initialDelay * backoffFactor)
    │
    └─> Attempt 3 (last)
        ├─> try fn()
        │   └─> Success → return result
        └─> catch error
            └─> throw error

Example Timeline:
  0ms ────────> Attempt 1 (fail)
  1000ms ─────> Attempt 2 (fail)
  3000ms ─────> Attempt 3 (success)
```

### Timeout

```
withTimeout(fn, timeoutMs)
    │
    └─> Promise.race([
          │
          ├─> fn() ──────────────────────> Result
          │
          └─> setTimeout(timeoutMs) ────> TimeoutError
        ])
```

### Safe Operations

```
safe(promise)
    │
    ├─> Success
    │   └─> [undefined, data]
    │
    └─> Error
        └─> [error, undefined]

Usage:
  const [error, data] = await safe(riskyOperation());
  if (error) handle error;
  else use data;
```

## Integration Points

### External Services

```
Error Occurs
    │
    └─> reportError(error, context)
        │
        ├─> Development
        │   └─> console.error(error, context)
        │
        └─> Production
            │
            ├─> Sentry
            │   └─> Sentry.captureException(error, {
            │         contexts: { errorContext },
            │         tags: { errorCode }
            │       })
            │
            ├─> LogRocket
            │   └─> LogRocket.captureException(error, {
            │         extra: errorContext
            │       })
            │
            └─> Custom API
                └─> fetch('/api/errors', {
                      method: 'POST',
                      body: JSON.stringify({ error, context })
                    })
```

## File Dependencies

```
index.ts
    │
    ├─> errorTypes.ts
    │   └─> (no dependencies)
    │
    ├─> errorHandler.ts
    │   ├─> errorTypes.ts
    │   ├─> errorReporting.ts
    │   └─> logger.ts
    │
    ├─> errorReporting.ts
    │   ├─> errorTypes.ts
    │   └─> logger.ts
    │
    ├─> convexErrorHandler.ts
    │   ├─> errorTypes.ts
    │   └─> errorHandler.ts
    │
    └─> useErrorHandler.ts
        ├─> errorHandler.ts
        └─> errorReporting.ts

Components
    │
    ├─> GlobalErrorBoundary.tsx
    │   ├─> errorReporting.ts
    │   ├─> errorTypes.ts
    │   └─> logger.ts
    │
    ├─> ErrorProvider.tsx
    │   └─> errorReporting.ts
    │
    └─> ErrorHandlingDemo.tsx
        └─> index.ts (all utilities)
```

## Performance Characteristics

```
Operation               Time Complexity    Space Complexity
─────────────────────────────────────────────────────────────
Create Error            O(1)               O(1)
Handle Error            O(1)               O(1)
Add Breadcrumb          O(1)               O(1)
Get Breadcrumbs         O(n) n=50          O(n) n=50
Report Error            O(1)               O(1)
Retry (success)         O(attempts)        O(1)
Retry (all fail)        O(maxAttempts)     O(1)
Toast Notification      O(1)               O(1)
Error Boundary Catch    O(1)               O(1)

Memory Usage:
  - BreadcrumbStore: ~50 entries × ~500 bytes = ~25 KB
  - Error Context: ~2-5 KB per error
  - Error Instance: ~1-2 KB
  - Total Overhead: < 50 KB
```

## Security Considerations

```
1. Error Messages
   ├─> Development: Full details, stack traces
   └─> Production: User-friendly messages only

2. Context Data
   ├─> Sanitize sensitive data
   ├─> No passwords, tokens, keys
   └─> Optional data masking

3. Stack Traces
   ├─> Development: Full stack
   └─> Production: Sanitized or hidden

4. Breadcrumbs
   ├─> Max 50 entries (prevent memory leak)
   ├─> Auto-cleanup old entries
   └─> No sensitive user data

5. External Reporting
   ├─> HTTPS only
   ├─> Sanitized data
   └─> Rate limiting
```

This architecture provides a comprehensive, scalable, and maintainable error handling system for the entire application.
