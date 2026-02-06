/**
 * API Types Usage Examples
 *
 * This file contains code examples showing how to use the API types.
 * These examples are for documentation purposes and should not be imported.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  fetchApi,
  postApi,
  getApi,
  isSuccessResponse,
  unwrapApiResponse,
  handleApiResponse,
  retryApiCall,
} from "@/lib/api/client";
import { useApi, usePost, useFetch } from "@/lib/api/hooks";
import type {
  ApiResponse,
  GetTodayHabitsResponse,
  CreateCategoryResponse,
  UserProfile,
  HabitCategory,
} from "@/types/api";

// ============================================
// EXAMPLE 1: Type-Safe Convex Queries
// ============================================

function Example1_ConvexQueries() {
  // Query automatically typed as GetTodayHabitsResponse | undefined
  const habits = useQuery(api.dailyHabits.getTodayHabits);

  // Type-safe access to data
  if (habits) {
    habits.forEach((habit) => {
      console.log(habit.template?.name); // TypeScript knows the structure
      console.log(habit.completed);
      console.log(habit.xpEarned);
    });
  }

  // Query with parameters
  const categories = useQuery(api.habitCategories.listCategories);

  return (
    <div>
      {habits?.map((habit) => (
        <div key={habit._id}>
          {habit.template?.name}: {habit.completed ? "✓" : "○"}
        </div>
      ))}
    </div>
  );
}

// ============================================
// EXAMPLE 2: Type-Safe Convex Mutations
// ============================================

function Example2_ConvexMutations() {
  // Mutation automatically typed
  const createCategory = useMutation(api.habitCategories.createCategory);

  const handleCreate = async () => {
    // TypeScript enforces correct argument structure
    const categoryId = await createCategory({
      name: "New Category",
      icon: "🎯",
      requiresCoreCompletion: false,
    });

    // categoryId is typed as Id<"habitCategories">
    console.log("Created category:", categoryId);
  };

  return <button onClick={handleCreate}>Create Category</button>;
}

// ============================================
// EXAMPLE 3: Type-Safe API Routes
// ============================================

async function Example3_ApiRoutes() {
  // Using the generic fetchApi function
  const response = await fetchApi<{ message: string }>("/api/cleanup-fields", {
    method: "POST",
  });

  // Type guard to check success
  if (isSuccessResponse(response)) {
    console.log(response.data.message);
  } else {
    console.error(response.error.code);
    console.error(response.error.message);
  }

  // Using the postApi helper
  const response2 = await postApi<{ result: string }>("/api/fix-custom-fields");

  if (isSuccessResponse(response2)) {
    console.log(response2.data.result);
  }
}

// ============================================
// EXAMPLE 4: Unwrapping API Responses
// ============================================

async function Example4_UnwrapResponse() {
  try {
    // Unwrap throws on error, returns data on success
    const data = await unwrapApiResponse(
      fetchApi<UserProfile>("/api/profile")
    );

    // data is typed as UserProfile (not null/undefined)
    console.log(data.name);
    console.log(data.northStars.wealth);
  } catch (error) {
    console.error("API call failed:", error);
  }
}

// ============================================
// EXAMPLE 5: Handling Responses with Callbacks
// ============================================

async function Example5_ResponseCallbacks() {
  await handleApiResponse(fetchApi<HabitCategory[]>("/api/categories"), {
    onSuccess: (categories) => {
      // categories is typed as HabitCategory[]
      console.log(`Loaded ${categories.length} categories`);
      categories.forEach((cat) => console.log(cat.name));
    },
    onError: (error) => {
      // error is typed as ApiError
      console.error(`Error ${error.code}: ${error.message}`);
    },
  });
}

// ============================================
// EXAMPLE 6: Retry with Exponential Backoff
// ============================================

async function Example6_RetryLogic() {
  const response = await retryApiCall(
    () => fetchApi<UserProfile>("/api/profile"),
    {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
    }
  );

  if (isSuccessResponse(response)) {
    console.log("Success after retries:", response.data);
  }
}

// ============================================
// EXAMPLE 7: React Hook for Manual API Calls
// ============================================

function Example7_UseApiHook() {
  const { data, error, loading, execute } = useApi<UserProfile>();

  const loadProfile = async () => {
    const profile = await execute("/api/profile");
    if (profile) {
      console.log("Loaded:", profile.name);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <div>
          <h1>{data.name}</h1>
          <p>{data.role}</p>
        </div>
      )}
      <button onClick={loadProfile}>Load Profile</button>
    </div>
  );
}

// ============================================
// EXAMPLE 8: React Hook for POST Requests
// ============================================

function Example8_UsePostHook() {
  const { data, error, loading, post } = usePost<
    CreateCategoryResponse,
    { name: string; icon: string }
  >();

  const createCategory = async () => {
    const categoryId = await post("/api/categories", {
      name: "New Category",
      icon: "🎯",
    });

    if (categoryId) {
      console.log("Created:", categoryId);
    }
  };

  return (
    <div>
      <button onClick={createCategory} disabled={loading}>
        {loading ? "Creating..." : "Create Category"}
      </button>
      {error && <p className="error">{error.message}</p>}
    </div>
  );
}

// ============================================
// EXAMPLE 9: React Hook for Auto-Fetching
// ============================================

function Example9_UseFetchHook({ userId }: { userId: string }) {
  // Automatically fetches when component mounts or userId changes
  const { data, error, loading, refetch } = useFetch<UserProfile>(
    `/api/users/${userId}`
  );

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <div>
          <h1>{data.name}</h1>
          <button onClick={refetch}>Refresh</button>
        </div>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 10: Complex Type-Safe Flow
// ============================================

function Example10_ComplexFlow() {
  const categories = useQuery(api.habitCategories.listCategories);
  const createHabit = useMutation(api.habitTemplates.createTemplate);
  const { post } = usePost<{ success: boolean }>();

  const handleCreateHabit = async () => {
    if (!categories || categories.length === 0) {
      console.error("No categories available");
      return;
    }

    // TypeScript knows categories is HabitCategory[]
    const firstCategory = categories[0];

    try {
      // Create template in Convex (typed)
      const templateId = await createHabit({
        categoryId: firstCategory._id,
        name: "New Habit",
        description: "A new habit",
        xpValue: 10,
        order: 0,
        isActive: true,
      });

      console.log("Template created:", templateId);

      // Sync to external API (typed)
      const result = await post("/api/sync-habit", {
        templateId,
      });

      if (result?.success) {
        console.log("Synced successfully");
      }
    } catch (error) {
      console.error("Failed to create habit:", error);
    }
  };

  return <button onClick={handleCreateHabit}>Create Habit</button>;
}

// ============================================
// EXAMPLE 11: Error Handling Patterns
// ============================================

async function Example11_ErrorHandling() {
  const response = await fetchApi<UserProfile>("/api/profile");

  if (!isSuccessResponse(response)) {
    // Handle different error codes
    switch (response.error.code) {
      case "UNAUTHORIZED":
        // Redirect to login
        window.location.href = "/login";
        break;

      case "NOT_FOUND":
        // Show 404 page
        console.log("Profile not found");
        break;

      case "VALIDATION_ERROR":
        // Show validation errors
        console.log("Validation failed:", response.error.details);
        break;

      default:
        // Generic error handling
        console.error("Error:", response.error.message);
    }
    return;
  }

  // Success - response.data is typed as UserProfile
  console.log("Welcome,", response.data.name);
}

// ============================================
// EXAMPLE 12: Batch Operations
// ============================================

async function Example12_BatchOperations() {
  const { batchApiCalls } = await import("@/lib/api/client");

  // Fetch multiple resources in parallel with type safety
  const response = await batchApiCalls([
    fetchApi<UserProfile>("/api/profile"),
    fetchApi<HabitCategory[]>("/api/categories"),
    fetchApi<GetTodayHabitsResponse>("/api/habits/today"),
  ] as const);

  if (isSuccessResponse(response)) {
    const [profile, categories, habits] = response.data;

    // All typed correctly
    console.log(profile.name);
    console.log(categories.length);
    console.log(habits.length);
  }
}

// ============================================
// EXAMPLE 13: TypeScript Type Inference
// ============================================

async function Example13_TypeInference() {
  // TypeScript infers the return type
  const response = await fetchApi<{ count: number }>("/api/count");

  if (isSuccessResponse(response)) {
    // response.data.count is inferred as number
    const doubled = response.data.count * 2;
    console.log(doubled);

    // TypeScript error if you try to access wrong property
    // console.log(response.data.invalid); // TS Error
  }
}

// ============================================
// EXAMPLE 14: Generic Component with API Types
// ============================================

interface DataListProps<T> {
  fetchUrl: string;
  renderItem: (item: T) => React.ReactNode;
}

function DataList<T>({ fetchUrl, renderItem }: DataListProps<T>) {
  const { data, loading, error } = useFetch<T[]>(fetchUrl);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return <div>{data.map((item, index) => renderItem(item))}</div>;
}

// Usage with type safety
function Example14_GenericComponent() {
  return (
    <DataList<HabitCategory>
      fetchUrl="/api/categories"
      renderItem={(category) => (
        <div key={category._id}>
          {category.icon} {category.name}
        </div>
      )}
    />
  );
}

// Export examples for documentation
export const examples = {
  Example1_ConvexQueries,
  Example2_ConvexMutations,
  Example3_ApiRoutes,
  Example4_UnwrapResponse,
  Example5_ResponseCallbacks,
  Example6_RetryLogic,
  Example7_UseApiHook,
  Example8_UsePostHook,
  Example9_UseFetchHook,
  Example10_ComplexFlow,
  Example11_ErrorHandling,
  Example12_BatchOperations,
  Example13_TypeInference,
  Example14_GenericComponent,
};
