# API Types Migration Guide

This guide helps you migrate existing code to use the new type-safe API system.

## Quick Start

### Before
```typescript
// Untyped API call
const response = await fetch("/api/habits");
const data = await response.json();
console.log(data.habits); // No type safety
```

### After
```typescript
// Type-safe API call
import { fetchApi, isSuccessResponse } from "@/lib/api";
import type { GetTodayHabitsResponse } from "@/types/api";

const response = await fetchApi<GetTodayHabitsResponse>("/api/habits");
if (isSuccessResponse(response)) {
  console.log(response.data); // Fully typed!
}
```

## Migration Steps

### Step 1: Update Imports

Replace manual fetch calls with type-safe utilities:

```typescript
// Before
import { NextResponse } from "next/server";

// After
import { NextResponse } from "next/server";
import { createSuccessResponse, createErrorResponse, ErrorCode } from "@/types/api/common";
```

### Step 2: Add Response Types to API Routes

```typescript
// Before
export async function GET() {
  const data = await db.getData();
  return NextResponse.json({ success: true, data });
}

// After
import type { ApiResponse } from "@/types/api/common";

export async function GET(): Promise<NextResponse<ApiResponse<DataType>>> {
  try {
    const data = await db.getData();
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(ErrorCode.INTERNAL_ERROR, error.message),
      { status: 500 }
    );
  }
}
```

### Step 3: Update Convex Function Calls

```typescript
// Before
const habits = useQuery(api.dailyHabits.getTodayHabits);
// habits: unknown

// After - Already typed! Just import the type for reference
import type { GetTodayHabitsResponse } from "@/types/api";
const habits = useQuery(api.dailyHabits.getTodayHabits);
// habits: GetTodayHabitsResponse | undefined
```

### Step 4: Use Type-Safe Hooks

```typescript
// Before
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await fetch("/api/data");
    const json = await response.json();
    setData(json);
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};

// After
import { useApi } from "@/lib/api";

const { data, loading, error, execute } = useApi<DataType>();

const fetchData = () => execute("/api/data");
```

## Common Migration Patterns

### Pattern 1: Simple GET Request

**Before:**
```typescript
const response = await fetch("/api/profile");
const profile = await response.json();
```

**After:**
```typescript
import { getApi, unwrapApiResponse } from "@/lib/api";
import type { UserProfile } from "@/types/api";

const profile = await unwrapApiResponse(
  getApi<UserProfile>("/api/profile")
);
```

### Pattern 2: POST with Data

**Before:**
```typescript
const response = await fetch("/api/categories", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "New Category" }),
});
const result = await response.json();
```

**After:**
```typescript
import { postApi, isSuccessResponse } from "@/lib/api";
import type { CreateCategoryResponse } from "@/types/api";

const response = await postApi<CreateCategoryResponse>(
  "/api/categories",
  { name: "New Category" }
);

if (isSuccessResponse(response)) {
  console.log("Created:", response.data);
}
```

### Pattern 3: Error Handling

**Before:**
```typescript
try {
  const response = await fetch("/api/data");
  if (!response.ok) {
    throw new Error("Request failed");
  }
  const data = await response.json();
} catch (error) {
  console.error(error);
}
```

**After:**
```typescript
import { fetchApi, isSuccessResponse } from "@/lib/api";

const response = await fetchApi<DataType>("/api/data");

if (!isSuccessResponse(response)) {
  switch (response.error.code) {
    case ErrorCode.UNAUTHORIZED:
      // Handle auth error
      break;
    case ErrorCode.NOT_FOUND:
      // Handle not found
      break;
    default:
      console.error(response.error.message);
  }
  return;
}

// Use response.data with full type safety
```

### Pattern 4: Convex Mutations

**Before:**
```typescript
const createCategory = useMutation(api.habitCategories.createCategory);

const handleCreate = async () => {
  const id = await createCategory({
    name: "Test",
    // Missing required fields, no TypeScript error
  });
};
```

**After:**
```typescript
const createCategory = useMutation(api.habitCategories.createCategory);

const handleCreate = async () => {
  const id = await createCategory({
    name: "Test",
    icon: "🎯",
    requiresCoreCompletion: false,
    // TypeScript enforces all required fields
  });
  // id is typed as Id<"habitCategories">
};
```

### Pattern 5: React Component

**Before:**
```typescript
function ProfileCard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!profile) return null;

  return <div>{profile.name}</div>; // No type safety
}
```

**After:**
```typescript
import { useFetch } from "@/lib/api";
import type { UserProfile } from "@/types/api";

function ProfileCard() {
  const { data: profile, loading } = useFetch<UserProfile>("/api/profile");

  if (loading) return <div>Loading...</div>;
  if (!profile) return null;

  return <div>{profile.name}</div>; // Fully typed!
}
```

## Checklist

Use this checklist to ensure complete migration:

- [ ] Replace `fetch()` calls with `fetchApi()`, `getApi()`, or `postApi()`
- [ ] Add type parameters to all API calls
- [ ] Replace custom loading/error states with `useApi()` or similar hooks
- [ ] Add return types to API route handlers
- [ ] Use `createSuccessResponse()` and `createErrorResponse()` in API routes
- [ ] Replace error handling with standardized `ErrorCode` checks
- [ ] Import types from `@/types/api` instead of defining inline
- [ ] Update tests to use typed responses
- [ ] Remove redundant type assertions and null checks
- [ ] Add JSDoc comments referencing the types

## Testing

After migration, verify:

1. **No TypeScript errors** - Run `npm run type-check`
2. **Runtime behavior unchanged** - Run existing tests
3. **Type safety working** - Try accessing wrong properties (should error)
4. **Autocomplete working** - IDE should suggest properties

## Common Issues

### Issue 1: Type Mismatch

**Error:**
```
Type 'X' is not assignable to type 'Y'
```

**Solution:**
Check that your API route returns the correct structure. Use `createSuccessResponse()` to ensure consistency.

### Issue 2: Undefined Type

**Error:**
```
Cannot find name 'UserProfile'
```

**Solution:**
Import the type from `@/types/api`:
```typescript
import type { UserProfile } from "@/types/api";
```

### Issue 3: Generic Type Required

**Error:**
```
Generic type 'ApiResponse<T>' requires 1 type argument(s)
```

**Solution:**
Specify the data type:
```typescript
const response = await fetchApi<DataType>("/api/endpoint");
```

## Best Practices

1. **Always specify types** - Don't use `any` or skip type parameters
2. **Use type guards** - Check `isSuccessResponse()` before accessing data
3. **Handle all error codes** - Use switch statements for error handling
4. **Don't bypass types** - Avoid `as any` or `@ts-ignore`
5. **Keep types up to date** - Update types when changing API responses

## Getting Help

- Check `/types/api/examples.ts` for usage examples
- Review `/types/api/README.md` for comprehensive documentation
- Run tests in `/types/api/__tests__/` to verify behavior

## Gradual Migration

You don't need to migrate everything at once:

1. **Start with new code** - Use types for all new features
2. **Migrate on touch** - Update files as you modify them
3. **Focus on critical paths** - Prioritize user-facing features
4. **Test thoroughly** - Ensure each migration doesn't break functionality

## Rollback

If you need to rollback temporarily:

```typescript
// Bypass type checking (not recommended)
const response = await fetch("/api/data");
const data = await response.json() as any;
```

However, this defeats the purpose of type safety. Better to fix the issue.

## Next Steps

After migration:

1. Enable stricter TypeScript settings
2. Add more comprehensive types for edge cases
3. Create custom type guards for domain-specific validation
4. Document any type assumptions or limitations
