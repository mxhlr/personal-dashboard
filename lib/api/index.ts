/**
 * API Library Index
 *
 * Central export point for all API utilities
 */

// Client utilities
export * from "./client";

// React hooks
export * from "./hooks";

// Re-export common types for convenience
export type {
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiError,
  ErrorCode,
  PaginatedResponse,
  CursorPaginatedResponse,
} from "@/types/api/common";
