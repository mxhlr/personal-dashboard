/**
 * Type-Safe API Hooks
 *
 * React hooks for making type-safe API calls with loading states
 */

"use client";

import { useState, useCallback } from "react";
import type { ApiErrorResponse } from "@/types/api/common";
import { isSuccessResponse, fetchApi } from "./client";

/**
 * Hook state interface
 */
interface UseApiState<T> {
  data: T | null;
  error: ApiErrorResponse["error"] | null;
  loading: boolean;
}

/**
 * Hook for manual API calls
 */
export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const execute = useCallback(
    async (url: string, options?: RequestInit): Promise<T | null> => {
      setState({ data: null, error: null, loading: true });

      const response = await fetchApi<T>(url, options);

      if (isSuccessResponse(response)) {
        setState({ data: response.data, error: null, loading: false });
        return response.data;
      } else {
        setState({ data: null, error: response.error, loading: false });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for POST requests
 */
export function usePost<T, D = unknown>() {
  const { execute, ...state } = useApi<T>();

  const post = useCallback(
    async (url: string, data?: D): Promise<T | null> => {
      return execute(url, {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      });
    },
    [execute]
  );

  return {
    ...state,
    post,
  };
}

/**
 * Hook for PUT requests
 */
export function usePut<T, D = unknown>() {
  const { execute, ...state } = useApi<T>();

  const put = useCallback(
    async (url: string, data?: D): Promise<T | null> => {
      return execute(url, {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      });
    },
    [execute]
  );

  return {
    ...state,
    put,
  };
}

/**
 * Hook for DELETE requests
 */
export function useDelete<T>() {
  const { execute, ...state } = useApi<T>();

  const del = useCallback(
    async (url: string): Promise<T | null> => {
      return execute(url, { method: "DELETE" });
    },
    [execute]
  );

  return {
    ...state,
    delete: del,
  };
}

/**
 * Hook for GET requests with auto-fetch
 */
export function useFetch<T>(url: string | null, options?: RequestInit) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    loading: !!url,
  });

  const refetch = useCallback(async () => {
    if (!url) return;

    setState((prev) => ({ ...prev, loading: true }));

    const response = await fetchApi<T>(url, options);

    if (isSuccessResponse(response)) {
      setState({ data: response.data, error: null, loading: false });
    } else {
      setState({ data: null, error: response.error, loading: false });
    }
  }, [url, options]);

  // Auto-fetch on mount and when URL changes
  useState(() => {
    if (url) {
      refetch();
    }
  });

  return {
    ...state,
    refetch,
  };
}

/**
 * Hook for optimistic updates
 */
export function useOptimistic<T>() {
  const [optimisticData, setOptimisticData] = useState<T | null>(null);
  const { execute, ...state } = useApi<T>();

  const executeOptimistically = useCallback(
    async (
      url: string,
      options: RequestInit,
      optimisticValue: T
    ): Promise<T | null> => {
      // Set optimistic value immediately
      setOptimisticData(optimisticValue);

      const result = await execute(url, options);

      // Clear optimistic value after request completes
      setOptimisticData(null);

      return result;
    },
    [execute]
  );

  return {
    ...state,
    data: optimisticData ?? state.data,
    executeOptimistically,
  };
}

/**
 * Hook for infinite scroll / pagination
 */
export function usePaginated<T>(
  baseUrl: string,
  options?: {
    pageSize?: number;
  }
) {
  const [pages, setPages] = useState<T[][]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse["error"] | null>(null);

  const fetchNextPage = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    const page = pages.length;
    const url = `${baseUrl}?page=${page}&pageSize=${options?.pageSize ?? 20}`;

    const response = await fetchApi<{ items: T[]; hasMore: boolean }>(url);

    if (isSuccessResponse(response)) {
      setPages((prev) => [...prev, response.data.items]);
      setHasMore(response.data.hasMore);
      setLoading(false);
    } else {
      setError(response.error);
      setLoading(false);
    }
  }, [baseUrl, loading, hasMore, pages.length, options?.pageSize]);

  const reset = useCallback(() => {
    setPages([]);
    setHasMore(true);
    setError(null);
  }, []);

  const allItems = pages.flat();

  return {
    data: allItems,
    loading,
    error,
    hasMore,
    fetchNextPage,
    reset,
  };
}

/**
 * Hook for debounced API calls (e.g., search)
 */
export function useDebouncedApi<T>(delay: number = 300) {
  const { execute, ...state } = useApi<T>();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedExecute = useCallback(
    (url: string, options?: RequestInit): Promise<T | null> => {
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      return new Promise((resolve) => {
        const id = setTimeout(async () => {
          const result = await execute(url, options);
          resolve(result);
        }, delay);

        setTimeoutId(id);
      });
    },
    [execute, delay, timeoutId]
  );

  return {
    ...state,
    execute: debouncedExecute,
  };
}
