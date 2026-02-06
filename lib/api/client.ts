/**
 * Type-Safe API Client
 *
 * Utilities for making type-safe API calls with proper error handling
 */

import type { ApiResponse, ApiSuccessResponse, ApiErrorResponse, ErrorCode } from "@/types/api/common";

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(
  response: ApiResponse<unknown>
): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Type-safe fetch wrapper
 */
export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // If response is not ok but doesn't have error structure, create one
      if (!data.success && data.error) {
        return data as ApiErrorResponse;
      }

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR" as ErrorCode,
          message: data.message || data.error || response.statusText,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // If successful but doesn't have success structure, wrap it
    if (data.success === undefined) {
      return {
        success: true,
        data: data as T,
        timestamp: new Date().toISOString(),
      };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR" as ErrorCode,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * POST request helper
 */
export async function postApi<T, D = unknown>(
  url: string,
  data?: D
): Promise<ApiResponse<T>> {
  return fetchApi<T>(url, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request helper
 */
export async function putApi<T, D = unknown>(
  url: string,
  data?: D
): Promise<ApiResponse<T>> {
  return fetchApi<T>(url, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function deleteApi<T>(url: string): Promise<ApiResponse<T>> {
  return fetchApi<T>(url, {
    method: "DELETE",
  });
}

/**
 * GET request helper
 */
export async function getApi<T>(url: string): Promise<ApiResponse<T>> {
  return fetchApi<T>(url, {
    method: "GET",
  });
}

/**
 * Handle API response with callbacks
 */
export async function handleApiResponse<T>(
  promise: Promise<ApiResponse<T>>,
  callbacks: {
    onSuccess?: (data: T) => void | Promise<void>;
    onError?: (error: ApiErrorResponse["error"]) => void | Promise<void>;
  }
): Promise<void> {
  const response = await promise;

  if (isSuccessResponse(response)) {
    await callbacks.onSuccess?.(response.data);
  } else {
    await callbacks.onError?.(response.error);
  }
}

/**
 * Unwrap API response (throws on error)
 */
export async function unwrapApiResponse<T>(
  promise: Promise<ApiResponse<T>>
): Promise<T> {
  const response = await promise;

  if (isSuccessResponse(response)) {
    return response.data;
  } else {
    throw new Error(response.error.message);
  }
}

/**
 * Batch multiple API calls
 */
export async function batchApiCalls<T extends readonly unknown[]>(
  calls: { [K in keyof T]: Promise<ApiResponse<T[K]>> }
): Promise<ApiResponse<T>> {
  try {
    const results = await Promise.all(calls);

    // Check if any call failed
    const firstError = results.find(isErrorResponse);
    if (firstError) {
      return firstError as ApiErrorResponse;
    }

    // All succeeded, extract data
    const data = results.map((r) => {
      if (isSuccessResponse(r)) {
        return r.data;
      }
      throw new Error("Unexpected response type");
    }) as unknown as T;

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR" as ErrorCode,
        message: error instanceof Error ? error.message : "Batch operation failed",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Retry API call with exponential backoff
 */
export async function retryApiCall<T>(
  fn: () => Promise<ApiResponse<T>>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  } = {}
): Promise<ApiResponse<T>> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;

  let lastResponse: ApiResponse<T> | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    lastResponse = await fn();

    if (isSuccessResponse(lastResponse)) {
      return lastResponse;
    }

    // Don't retry on certain error codes
    const nonRetryableErrors: ErrorCode[] = [
      "UNAUTHORIZED" as ErrorCode,
      "FORBIDDEN" as ErrorCode,
      "VALIDATION_ERROR" as ErrorCode,
      "NOT_FOUND" as ErrorCode,
    ];

    if (nonRetryableErrors.includes(lastResponse.error.code)) {
      return lastResponse;
    }

    // Don't delay on last attempt
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  return lastResponse!;
}
