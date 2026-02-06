# Migration Guide

Guide for integrating the centralized error handling system into your application.

## Step 1: Add ErrorProvider to Root Layout

Update `/app/layout.tsx` to include the ErrorProvider:

```tsx
import { ErrorProvider } from "@/lib/errors/ErrorProvider";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientBody className={`${geistMono.variable} ${orbitron.variable} antialiased font-mona-regular`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ClerkProvider dynamic appearance={...}>
              <ErrorProvider>
                <GlobalErrorBoundary>
                  <ConvexClientProvider>{children}</ConvexClientProvider>
                  <Toaster richColors position="bottom-right" />
                </GlobalErrorBoundary>
              </ErrorProvider>
            </ClerkProvider>
          </ThemeProvider>
        </ClientBody>
      </body>
    </html>
  );
}
```

## Step 2: Replace Existing Error Handling

### Before

```typescript
try {
  await fetch('/api/data');
} catch (error) {
  console.error(error);
  alert('An error occurred');
}
```

### After

```typescript
import { handleError, NetworkError } from '@/lib/errors';

try {
  const response = await fetch('/api/data');
  if (!response.ok) {
    throw new NetworkError('Failed to fetch data', {
      url: '/api/data',
      status: response.status,
    });
  }
} catch (error) {
  handleError(error, {
    showToast: true,
    report: true,
  });
}
```

## Step 3: Update Convex Functions

### Before

```typescript
export const createTodo = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    if (!args.text) {
      throw new Error('Text is required');
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    return await ctx.db.insert('todos', {
      text: args.text,
      userId: identity.subject,
    });
  },
});
```

### After

```typescript
import { validateConvex, authenticateConvex } from '@/lib/errors/convexErrorHandler';

export const createTodo = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    // Validate
    validateConvex(args.text.length > 0, 'Text is required');
    validateConvex(args.text.length <= 100, 'Text must be 100 characters or less');

    // Authenticate
    const identity = await ctx.auth.getUserIdentity();
    authenticateConvex(identity, 'You must be logged in');

    return await ctx.db.insert('todos', {
      text: args.text,
      userId: identity.subject,
    });
  },
});
```

## Step 4: Update Convex Client Calls

### Before

```typescript
const createTodo = useMutation(api.todos.create);

const handleSubmit = async () => {
  try {
    await createTodo({ text });
  } catch (error) {
    console.error(error);
    toast.error('Failed to create todo');
  }
};
```

### After

```typescript
import { useMutation } from 'convex/react';
import { withConvexErrorHandling, trackUserAction } from '@/lib/errors';
import { api } from '@/convex/_generated/api';

const createTodo = useMutation(api.todos.create);

const handleSubmit = async () => {
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
  }
};
```

## Step 5: Add Error Boundaries to Critical Components

```tsx
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';

export function CriticalFeature() {
  return (
    <GlobalErrorBoundary>
      <YourComponent />
    </GlobalErrorBoundary>
  );
}
```

Or use the specialized ReviewErrorBoundary:

```tsx
import { ReviewErrorBoundary } from '@/components/reviews/ReviewErrorBoundary';

export function WeeklyReviewPage() {
  return (
    <ReviewErrorBoundary reviewType="weekly">
      <WeeklyReview />
    </ReviewErrorBoundary>
  );
}
```

## Step 6: Replace useQuery/useMutation Error Handling

### Before

```typescript
const data = useQuery(api.todos.list);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (data?.error) {
    setError('Failed to load todos');
  }
}, [data]);
```

### After

```typescript
import { useQuery } from 'convex/react';
import { useQueryErrorHandler } from '@/lib/errors/useErrorHandler';
import { api } from '@/convex/_generated/api';

const data = useQuery(api.todos.list);

useQueryErrorHandler(data?.error, {
  showToast: true,
  toastMessage: 'Failed to load todos',
});
```

## Step 7: Add Retry Logic to Network Requests

### Before

```typescript
const data = await fetch('/api/data');
```

### After

```typescript
import { retry, NetworkError } from '@/lib/errors';

const data = await retry(
  async () => {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new NetworkError('Failed to fetch');
    }
    return response.json();
  },
  {
    maxAttempts: 3,
    initialDelay: 1000,
    shouldRetry: (error) => error instanceof NetworkError,
  }
);
```

## Step 8: Add User Action Tracking

Add tracking to important user actions:

```typescript
import { trackUserAction } from '@/lib/errors';

const handleSubmit = async () => {
  trackUserAction('form-submit', {
    formType: 'contact',
    fields: ['name', 'email', 'message'],
  });

  try {
    await submitForm();
    trackUserAction('form-submit-success');
  } catch (error) {
    trackUserAction('form-submit-error');
    handleError(error);
  }
};
```

## Step 9: Update Form Validation

### Before

```typescript
const handleSubmit = (e: FormEvent) => {
  e.preventDefault();

  if (!email) {
    setError('Email is required');
    return;
  }

  if (!email.includes('@')) {
    setError('Invalid email');
    return;
  }

  // Submit...
};
```

### After

```typescript
import { ValidationError, handleError } from '@/lib/errors';

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  try {
    // Validate
    if (!email) {
      throw new ValidationError('Email is required', { field: 'email' });
    }

    if (!email.includes('@')) {
      throw new ValidationError('Invalid email format', {
        field: 'email',
        value: email,
      });
    }

    // Submit...
    await submitForm();
  } catch (error) {
    handleError(error, { showToast: true });
  }
};
```

## Step 10: Test Error Handling

1. Add the ErrorHandlingDemo component to a test page:

```tsx
import { ErrorHandlingDemo } from '@/components/ErrorHandlingDemo';

export default function TestPage() {
  return <ErrorHandlingDemo />;
}
```

2. Test each error type:
   - Validation errors
   - Network errors
   - Not found errors
   - Authentication errors
   - Authorization errors

3. Verify:
   - Toast notifications appear
   - Errors are logged to console (dev mode)
   - Breadcrumbs are tracked
   - Error boundaries catch errors
   - Retry logic works

## Common Patterns to Migrate

### Pattern 1: Try-Catch with Console.error

**Before:**
```typescript
try {
  await operation();
} catch (error) {
  console.error(error);
}
```

**After:**
```typescript
import { handleError } from '@/lib/errors';

try {
  await operation();
} catch (error) {
  handleError(error, { showToast: true, report: true });
}
```

### Pattern 2: Alert or Window Notification

**Before:**
```typescript
if (error) {
  alert('An error occurred');
}
```

**After:**
```typescript
import { handleError } from '@/lib/errors';

if (error) {
  handleError(error, { showToast: true });
}
```

### Pattern 3: Manual Toast

**Before:**
```typescript
try {
  await operation();
} catch (error) {
  toast.error('Operation failed');
}
```

**After:**
```typescript
import { handleError } from '@/lib/errors';

try {
  await operation();
} catch (error) {
  handleError(error, {
    showToast: true,
    toastMessage: 'Operation failed',
  });
}
```

### Pattern 4: Error State Management

**Before:**
```typescript
const [error, setError] = useState<string | null>(null);

const handleClick = async () => {
  try {
    await operation();
    setError(null);
  } catch (err) {
    setError(err.message);
  }
};
```

**After:**
```typescript
import { useErrorHandler } from '@/lib/errors/useErrorHandler';

const { error, handleError, clearError } = useErrorHandler();

const handleClick = async () => {
  try {
    await operation();
    clearError();
  } catch (err) {
    handleError(err, { showToast: true });
  }
};
```

### Pattern 5: Async State

**Before:**
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

const fetchData = async () => {
  setLoading(true);
  try {
    const result = await fetch('/api/data');
    setData(result);
    setError(null);
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};
```

**After:**
```typescript
import { useAsyncError } from '@/lib/errors/useErrorHandler';

const { execute, loading, error, data } = useAsyncError(
  async () => {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new NetworkError('Failed to fetch data');
    }
    return response.json();
  },
  { showToast: true }
);

// Just call execute()
const fetchData = () => execute();
```

## Rollback Plan

If you need to rollback:

1. Remove ErrorProvider from layout
2. Remove GlobalErrorBoundary wrapper
3. Keep the old error handling code
4. The new system is opt-in, so existing code will continue to work

## Gradual Migration

You don't need to migrate everything at once:

1. **Week 1**: Add ErrorProvider and GlobalErrorBoundary
2. **Week 2**: Migrate critical paths (auth, payments, etc.)
3. **Week 3**: Migrate Convex functions
4. **Week 4**: Migrate forms and user interactions
5. **Week 5**: Add tracking and monitoring
6. **Week 6**: Clean up old error handling code

## Checklist

- [ ] ErrorProvider added to root layout
- [ ] GlobalErrorBoundary wrapping app
- [ ] Toaster configured
- [ ] Critical error boundaries added
- [ ] Convex functions using error helpers
- [ ] Client calls using withConvexErrorHandling
- [ ] Forms using ValidationError
- [ ] Network requests using NetworkError
- [ ] User actions tracked
- [ ] Error handling tested
- [ ] Old error handling removed
- [ ] Team trained on new patterns
