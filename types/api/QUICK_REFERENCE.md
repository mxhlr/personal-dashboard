# API Types Quick Reference

## Import Statements

```typescript
// All types and utilities
import {
  fetchApi,
  isSuccessResponse,
  ErrorCode,
  type ApiResponse,
  type UserProfile,
  type GetTodayHabitsResponse
} from "@/types/api";

// Or import from specific modules
import { createSuccessResponse, createErrorResponse } from "@/types/api/common";
import type { HabitCategory } from "@/types/api/convex";
import { useApi, usePost, useFetch } from "@/lib/api";
```

## Common Patterns

### Pattern 1: Fetch Data
```typescript
const response = await fetchApi<DataType>("/api/endpoint");
if (isSuccessResponse(response)) {
  // Use response.data
}
```

### Pattern 2: Post Data
```typescript
const response = await postApi<ResultType>("/api/endpoint", { data });
if (isSuccessResponse(response)) {
  // Use response.data
}
```

### Pattern 3: Use React Hook
```typescript
const { data, loading, error, execute } = useApi<DataType>();
await execute("/api/endpoint");
```

### Pattern 4: Auto-Fetch Hook
```typescript
const { data, loading, error } = useFetch<DataType>("/api/endpoint");
```

### Pattern 5: Convex Query
```typescript
const data = useQuery(api.module.functionName);
// Already typed!
```

### Pattern 6: Convex Mutation
```typescript
const mutate = useMutation(api.module.functionName);
await mutate({ args });
// Type-checked args
```

## Type Reference

### Common Types
- `ApiResponse<T>` - Success or error response
- `ApiSuccessResponse<T>` - Success only
- `ApiErrorResponse` - Error only
- `ErrorCode` - Error code enum
- `PaginatedResponse<T>` - Paginated data
- `CursorPaginatedResponse<T>` - Cursor pagination

### User Profile
- `UserProfile` - Complete profile
- `NorthStars` - North star goals
- `QuarterlyMilestone` - Quarterly goals

### Habits
- `HabitCategory` - Category data
- `HabitTemplate` - Template definition
- `DailyHabit` - Daily instance
- `EnrichedDailyHabit` - With template data
- `PatternIntelligenceResponse` - Analytics
- `HabitHistoryResponse` - Historical data

### Gamification
- `UserStats` - XP, level, streaks
- `LevelUpResponse` - Level progression
- `StreakInfoResponse` - Streak data

### Reviews
- `WeeklyReview` - Weekly review
- `MonthlyReview` - Monthly review
- `QuarterlyReview` - Quarterly review
- `AnnualReview` - Annual review

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | No permission |
| `NOT_FOUND` | 404 | Not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `CONFLICT` | 409 | Resource conflict |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service down |
| `EXTERNAL_API_ERROR` | 502 | External API failed |

## Functions

### Client (`/lib/api/client.ts`)
```typescript
fetchApi<T>(url, options?) → Promise<ApiResponse<T>>
getApi<T>(url) → Promise<ApiResponse<T>>
postApi<T>(url, data?) → Promise<ApiResponse<T>>
putApi<T>(url, data?) → Promise<ApiResponse<T>>
deleteApi<T>(url) → Promise<ApiResponse<T>>
isSuccessResponse(response) → boolean
isErrorResponse(response) → boolean
unwrapApiResponse<T>(promise) → Promise<T>
handleApiResponse(promise, callbacks) → Promise<void>
batchApiCalls(calls) → Promise<ApiResponse<T[]>>
retryApiCall(fn, options?) → Promise<ApiResponse<T>>
```

### Hooks (`/lib/api/hooks.ts`)
```typescript
useApi<T>() → { data, error, loading, execute, reset }
usePost<T>() → { data, error, loading, post }
usePut<T>() → { data, error, loading, put }
useDelete<T>() → { data, error, loading, delete }
useFetch<T>(url) → { data, error, loading, refetch }
useOptimistic<T>() → { data, error, loading, executeOptimistically }
usePaginated<T>(url) → { data, loading, error, hasMore, fetchNextPage }
useDebouncedApi<T>(delay) → { data, error, loading, execute }
```

### Helpers (`/types/api/common.ts`)
```typescript
createSuccessResponse<T>(data) → ApiSuccessResponse<T>
createErrorResponse(code, message, details?) → ApiErrorResponse
```

## Cheat Sheet

### ✅ DO
```typescript
// Use type parameters
const response = await fetchApi<DataType>("/api/data");

// Check response type
if (isSuccessResponse(response)) { }

// Import types
import type { UserProfile } from "@/types/api";

// Use provided hooks
const { data } = useFetch<DataType>("/api/data");

// Handle errors properly
if (!isSuccessResponse(response)) {
  switch (response.error.code) { }
}
```

### ❌ DON'T
```typescript
// Don't skip type parameters
const response = await fetchApi("/api/data"); // No type safety

// Don't use 'any'
const data: any = response.data;

// Don't bypass type guards
const data = response.data; // Might be undefined

// Don't ignore errors
await fetchApi("/api/data"); // No error handling

// Don't use old fetch
await fetch("/api/data"); // Use fetchApi instead
```

## Quick Examples

### Fetch User Profile
```typescript
import { fetchApi, isSuccessResponse } from "@/lib/api";
import type { UserProfile } from "@/types/api";

const response = await fetchApi<UserProfile>("/api/profile");
if (isSuccessResponse(response)) {
  console.log(response.data.name);
}
```

### Create Category
```typescript
import { postApi } from "@/lib/api";
import type { CreateCategoryResponse } from "@/types/api";

const response = await postApi<CreateCategoryResponse>(
  "/api/categories",
  { name: "New", icon: "🎯" }
);
```

### React Component
```typescript
import { useFetch } from "@/lib/api";
import type { GetTodayHabitsResponse } from "@/types/api";

function Habits() {
  const { data } = useFetch<GetTodayHabitsResponse>("/api/habits");
  return <div>{data?.length} habits</div>;
}
```

### Convex Query
```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function Categories() {
  const categories = useQuery(api.habitCategories.listCategories);
  return <div>{categories?.length} categories</div>;
}
```

### Error Handling
```typescript
import { fetchApi, isSuccessResponse, ErrorCode } from "@/lib/api";

const response = await fetchApi("/api/data");

if (!isSuccessResponse(response)) {
  if (response.error.code === ErrorCode.UNAUTHORIZED) {
    // Redirect to login
  } else {
    // Show error
    alert(response.error.message);
  }
  return;
}

// Use data
console.log(response.data);
```

## Resources

- Full Docs: `/types/api/README.md`
- Migration: `/types/api/MIGRATION.md`
- Examples: `/types/api/examples.ts`
- Summary: `/types/api/SUMMARY.md`
