# API Types Documentation

This directory contains comprehensive TypeScript type definitions for all API responses in the Personal Dashboard application.

## Overview

The type system is organized into several modules:

- **common.ts** - Generic response wrappers and error types
- **convex.ts** - Convex function return types
- **routes.ts** - Next.js API route response types
- **external.ts** - External API integration types
- **index.ts** - Central export point

## Usage

### Importing Types

```typescript
// Import all types
import { ApiResponse, UserProfile, CreateCategoryResponse } from "@/types/api";

// Import specific modules
import { createSuccessResponse, createErrorResponse } from "@/types/api/common";
import type { GetHabitsForDateResponse } from "@/types/api/convex";
```

### Common Response Patterns

#### Success Response

```typescript
import { createSuccessResponse } from "@/types/api/common";

const response = createSuccessResponse({
  id: "123",
  name: "Example",
});

// Response type:
// {
//   success: true,
//   data: { id: string, name: string },
//   timestamp: string
// }
```

#### Error Response

```typescript
import { createErrorResponse, ErrorCode } from "@/types/api/common";

const response = createErrorResponse(
  ErrorCode.NOT_FOUND,
  "Resource not found",
  { resourceId: "123" }
);

// Response type:
// {
//   success: false,
//   error: {
//     code: "NOT_FOUND",
//     message: "Resource not found",
//     details: { resourceId: "123" }
//   },
//   timestamp: string
// }
```

#### Generic API Response

```typescript
import type { ApiResponse } from "@/types/api/common";

// Function that can return success or error
async function fetchData(): Promise<ApiResponse<UserData>> {
  try {
    const data = await api.getData();
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      error.message
    );
  }
}
```

## Type Categories

### 1. Common Types (`common.ts`)

**Core Response Types:**
- `ApiResponse<T>` - Generic response wrapper (success or error)
- `ApiSuccessResponse<T>` - Successful response with data
- `ApiErrorResponse` - Error response with error details

**Error Handling:**
- `ApiError` - Error details interface
- `ErrorCode` - Standard error code enum

**Pagination:**
- `PaginatedResponse<T>` - Offset-based pagination
- `CursorPaginatedResponse<T>` - Cursor-based pagination

### 2. Convex Types (`convex.ts`)

All Convex function return types are defined here, organized by domain:

**User Profile:**
- `UserProfile` - Complete user profile
- `NorthStars` - User's north star goals
- `QuarterlyMilestone` - Quarterly milestone data

**Habits:**
- `HabitCategory` - Habit category data
- `HabitTemplate` - Habit template definition
- `DailyHabit` - Daily habit instance
- `EnrichedDailyHabit` - Habit with template data

**Analytics:**
- `PatternIntelligenceResponse` - Habit pattern analysis
- `HabitHistoryResponse` - Habit completion history
- `HabitAnalyticsResponse` - Aggregated habit analytics

**Gamification:**
- `UserStats` - XP, level, and streak data
- `LevelUpResponse` - Level progression info

**Reviews:**
- `WeeklyReview`, `MonthlyReview`, `QuarterlyReview`, `AnnualReview`

**Other:**
- `CoachMessage` - AI coach chat messages
- `VisionBoardItem` - Vision board items
- `TrackingField` - Legacy tracking fields
- `DailyLog` - Legacy daily log entries

### 3. API Route Types (`routes.ts`)

Types for Next.js API routes in `/app/api`:

- `CleanupFieldsResponse` - Cleanup fields API response
- `FixCustomFieldsResponse` - Fix custom fields API response
- `MutationResponse<T>` - Generic mutation response
- `HealthCheckResponse` - Health check endpoint

### 4. External API Types (`external.ts`)

Types for external service integrations:

**AI Services:**
- `OpenAIChatCompletionRequest/Response` - OpenAI API
- `AnthropicRequest/Response` - Anthropic Claude API

**Authentication:**
- `ClerkUser` - Clerk user data
- `ClerkSession` - Clerk session data

**Other:**
- `FileUploadResponse` - File upload results
- `WebhookPayload<T>` - Generic webhook payload
- `GoogleCalendarEvent` - Google Calendar integration
- `NotionPage` - Notion integration

## Best Practices

### 1. Always Type API Responses

```typescript
// ❌ Bad - No types
const data = await fetch("/api/habits").then(r => r.json());

// ✅ Good - Properly typed
const response = await fetch("/api/habits")
  .then(r => r.json() as Promise<ApiResponse<GetHabitsForDateResponse>>);

if (response.success) {
  // TypeScript knows response.data is GetHabitsForDateResponse
  console.log(response.data);
}
```

### 2. Use Type Guards

```typescript
function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

const response = await fetchData();
if (isSuccessResponse(response)) {
  // TypeScript knows this is success response
  console.log(response.data);
} else {
  // TypeScript knows this is error response
  console.error(response.error.message);
}
```

### 3. Type Convex Queries and Mutations

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { GetTodayHabitsResponse } from "@/types/api/convex";

function HabitList() {
  // Query is automatically typed
  const habits = useQuery(api.dailyHabits.getTodayHabits);
  // habits type is: GetTodayHabitsResponse | undefined

  const createHabit = useMutation(api.habitTemplates.createTemplate);
  // Return type is automatically typed as: Id<"habitTemplates">
}
```

### 4. Handle Errors Consistently

```typescript
import { ErrorCode } from "@/types/api/common";

function handleApiError(error: ApiError) {
  switch (error.code) {
    case ErrorCode.UNAUTHORIZED:
      // Redirect to login
      break;
    case ErrorCode.NOT_FOUND:
      // Show 404 page
      break;
    case ErrorCode.VALIDATION_ERROR:
      // Show validation errors
      break;
    default:
      // Show generic error
      break;
  }
}
```

## Adding New Types

When adding new API endpoints or Convex functions:

1. **Define the data type** in the appropriate module
2. **Export response type** (e.g., `GetXResponse`, `CreateXResponse`)
3. **Update index.ts** if adding a new module
4. **Document the type** in this README

Example:

```typescript
// In convex.ts
export interface NewFeature {
  _id: Id<"newFeatures">;
  name: string;
  description: string;
}

export type GetNewFeatureResponse = NewFeature | null;
export type ListNewFeaturesResponse = NewFeature[];
export type CreateNewFeatureResponse = Id<"newFeatures">;
```

## Type Safety Benefits

1. **Autocomplete** - IDE provides suggestions for all response properties
2. **Type Checking** - Catch errors at compile time, not runtime
3. **Refactoring** - Safely rename or change types across the codebase
4. **Documentation** - Types serve as inline documentation
5. **Consistency** - Enforces consistent response structures

## Error Code Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | User not authenticated |
| `FORBIDDEN` | 403 | User lacks permission |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `CONFLICT` | 409 | Resource conflict |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `EXTERNAL_API_ERROR` | 502 | External API failure |

## Migration Guide

### Migrating Existing Code

If you have existing code without types, follow these steps:

1. **Import the appropriate types:**
```typescript
import type { GetUserProfileResponse } from "@/types/api/convex";
```

2. **Add type annotations:**
```typescript
// Before
const profile = useQuery(api.userProfile.getUserProfile);

// After
const profile = useQuery(api.userProfile.getUserProfile) as GetUserProfileResponse;
```

3. **Handle null/undefined cases:**
```typescript
if (profile) {
  // TypeScript knows profile is not null
  console.log(profile.name);
}
```

4. **Update fetch calls:**
```typescript
// Before
const data = await fetch("/api/data").then(r => r.json());

// After
const response = await fetch("/api/data")
  .then(r => r.json() as Promise<ApiResponse<DataType>>);
```

## Contributing

When contributing new types:

1. Follow existing naming conventions
2. Add JSDoc comments for complex types
3. Export response type aliases (e.g., `GetXResponse`)
4. Update this README with new types
5. Add usage examples for non-obvious types

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Convex Types](https://docs.convex.dev/using/types)
- [Next.js TypeScript](https://nextjs.org/docs/basic-features/typescript)
