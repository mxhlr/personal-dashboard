/**
 * Performance utility functions for debouncing and throttling
 */

type AnyFunction = (...args: never[]) => void;

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 *
 * @example
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 500);
 */
export function debounce<T extends AnyFunction>(
  func: T,
  wait: number
): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(this: unknown, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, wait);
  } as T;
}

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 *
 * @param func - The function to throttle
 * @param wait - The number of milliseconds to throttle invocations to
 * @returns A throttled version of the function
 *
 * @example
 * const throttledScroll = throttle((event: Event) => {
 *   console.log('Scroll position:', window.scrollY);
 * }, 100);
 */
export function throttle<T extends AnyFunction>(
  func: T,
  wait: number
): T {
  let isThrottled = false;
  let lastArgs: Parameters<T> | null = null;

  const throttled = function (this: unknown, ...args: Parameters<T>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;

    if (isThrottled) {
      lastArgs = args;
      return;
    }

    func.apply(context, args);
    isThrottled = true;

    setTimeout(() => {
      isThrottled = false;
      if (lastArgs !== null) {
        func.apply(context, lastArgs);
        lastArgs = null;
      }
    }, wait);
  };

  return throttled as T;
}

/**
 * React hook for creating a debounced callback that is stable across renders.
 * Useful for preventing excessive re-renders and API calls.
 *
 * Note: This should be used in conjunction with React's useCallback hook.
 *
 * @example
 * import { useCallback } from 'react';
 * import { debounce } from '@/lib/performance';
 *
 * function SearchComponent() {
 *   const handleSearch = useCallback(
 *     debounce((query: string) => {
 *       // Perform search
 *     }, 500),
 *     []
 *   );
 * }
 */

/**
 * React hook for creating a throttled callback that is stable across renders.
 * Useful for scroll and resize handlers.
 *
 * Note: This should be used in conjunction with React's useCallback hook.
 *
 * @example
 * import { useCallback } from 'react';
 * import { throttle } from '@/lib/performance';
 *
 * function ScrollComponent() {
 *   const handleScroll = useCallback(
 *     throttle((event: Event) => {
 *       // Handle scroll
 *     }, 100),
 *     []
 *   );
 * }
 */
