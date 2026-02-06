/**
 * Next.js API Route Response Types
 *
 * Type definitions for all API routes in /app/api
 */

import { ApiResponse } from "./common";

// ============================================
// CLEANUP FIELDS API
// ============================================

export interface CleanupFieldsResult {
  deletedCount: number;
  deletedFields: Array<{
    id: string;
    name: string;
  }>;
  message: string;
}

export type CleanupFieldsResponse = ApiResponse<CleanupFieldsResult>;

// ============================================
// FIX CUSTOM FIELDS API
// ============================================

export interface FixCustomFieldsResult {
  fixedCount: number;
  fixedLogs: Array<{
    id: string;
    date: string;
    before: unknown;
    after: unknown;
  }>;
  message: string;
}

export type FixCustomFieldsResponse = ApiResponse<FixCustomFieldsResult>;

// ============================================
// GENERIC API ROUTE PATTERNS
// ============================================

/**
 * Standard success response for mutation operations
 */
export interface MutationSuccess {
  success: true;
  result?: unknown;
  message?: string;
}

/**
 * Standard error response
 */
export interface MutationError {
  success: false;
  error: string;
  details?: Record<string, unknown>;
}

/**
 * Generic mutation response
 */
export type MutationResponse<T = unknown> =
  | (MutationSuccess & { result: T })
  | MutationError;

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services?: {
    database?: boolean;
    authentication?: boolean;
    [key: string]: boolean | undefined;
  };
}
