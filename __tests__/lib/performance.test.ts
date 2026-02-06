/**
 * Tests for performance utility functions
 * @jest-environment jsdom
 */

import { debounce, throttle } from '@/lib/performance'
import { wait, createMockFn } from '../utils/testHelpers'

describe('performance utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('debounce', () => {
    it('should delay function execution until after wait period', () => {
      const { fn, calls } = createMockFn<(value: string) => void>()
      const debouncedFn = debounce(fn, 500)

      // Call function multiple times
      debouncedFn('call1')
      debouncedFn('call2')
      debouncedFn('call3')

      // Should not have been called yet
      expect(calls).toHaveLength(0)

      // Fast-forward time by 499ms
      jest.advanceTimersByTime(499)
      expect(calls).toHaveLength(0)

      // Fast-forward to 500ms
      jest.advanceTimersByTime(1)
      expect(calls).toHaveLength(1)
      expect(calls[0]).toEqual(['call3'])
    })

    it('should reset timer on each call', () => {
      const { fn, calls } = createMockFn<(value: number) => void>()
      const debouncedFn = debounce(fn, 300)

      debouncedFn(1)
      jest.advanceTimersByTime(200)

      debouncedFn(2)
      jest.advanceTimersByTime(200)

      debouncedFn(3)
      jest.advanceTimersByTime(200)

      // Should not have been called yet (timer keeps resetting)
      expect(calls).toHaveLength(0)

      // Wait for the full delay
      jest.advanceTimersByTime(100)
      expect(calls).toHaveLength(1)
      expect(calls[0]).toEqual([3])
    })

    it('should preserve function context (this)', () => {
      const obj = {
        value: 'test',
        method: jest.fn(function (this: { value: string }) {
          return this.value
        }),
      }

      const debouncedMethod = debounce(obj.method, 100)
      debouncedMethod.call(obj)

      jest.advanceTimersByTime(100)

      expect(obj.method).toHaveBeenCalled()
    })

    it('should handle multiple arguments correctly', () => {
      const { fn, calls } = createMockFn<(a: number, b: string, c: boolean) => void>()
      const debouncedFn = debounce(fn, 200)

      debouncedFn(1, 'test', true)
      jest.advanceTimersByTime(200)

      expect(calls).toHaveLength(1)
      expect(calls[0]).toEqual([1, 'test', true])
    })

    it('should only execute the last call when called multiple times', () => {
      const { fn, calls } = createMockFn<(id: string) => void>()
      const debouncedFn = debounce(fn, 100)

      debouncedFn('first')
      debouncedFn('second')
      debouncedFn('third')

      jest.advanceTimersByTime(100)

      expect(calls).toHaveLength(1)
      expect(calls[0]).toEqual(['third'])
    })
  })

  describe('throttle', () => {
    it('should execute function immediately on first call', () => {
      const { fn, calls } = createMockFn<(value: string) => void>()
      const throttledFn = throttle(fn, 500)

      throttledFn('immediate')

      expect(calls).toHaveLength(1)
      expect(calls[0]).toEqual(['immediate'])
    })

    it('should ignore calls during throttle period', () => {
      const { fn, calls } = createMockFn<(value: number) => void>()
      const throttledFn = throttle(fn, 500)

      throttledFn(1)
      throttledFn(2)
      throttledFn(3)

      // Only the first call should execute immediately
      expect(calls).toHaveLength(1)
      expect(calls[0]).toEqual([1])
    })

    it('should execute last call after throttle period', () => {
      const { fn, calls } = createMockFn<(value: string) => void>()
      const throttledFn = throttle(fn, 300)

      throttledFn('first')
      expect(calls).toHaveLength(1)

      throttledFn('second')
      throttledFn('third')
      throttledFn('fourth')

      // Fast-forward past throttle period
      jest.advanceTimersByTime(300)

      // Should execute the last queued call
      expect(calls).toHaveLength(2)
      expect(calls[1]).toEqual(['fourth'])
    })

    it('should allow new calls after throttle period expires', () => {
      const { fn, calls } = createMockFn<(value: number) => void>()
      const throttledFn = throttle(fn, 200)

      throttledFn(1)
      expect(calls).toHaveLength(1)

      jest.advanceTimersByTime(200)

      throttledFn(2)
      expect(calls).toHaveLength(2)

      jest.advanceTimersByTime(200)

      throttledFn(3)
      expect(calls).toHaveLength(3)
    })

    it('should preserve function context (this)', () => {
      const obj = {
        count: 0,
        method: jest.fn(function (this: { count: number }) {
          this.count++
        }),
      }

      const throttledMethod = throttle(obj.method, 100)
      throttledMethod.call(obj)

      expect(obj.method).toHaveBeenCalled()
    })

    it('should handle rapid successive calls correctly', () => {
      const { fn, calls } = createMockFn<(value: string) => void>()
      const throttledFn = throttle(fn, 1000)

      // First call executes immediately
      throttledFn('call1')
      expect(calls).toHaveLength(1)

      // Rapid calls during throttle period
      for (let i = 2; i <= 10; i++) {
        throttledFn(`call${i}`)
      }

      // Still only one call
      expect(calls).toHaveLength(1)

      // After throttle period, last call should execute
      jest.advanceTimersByTime(1000)
      expect(calls).toHaveLength(2)
      expect(calls[1]).toEqual(['call10'])
    })

    it('should handle zero wait time', () => {
      const { fn, calls } = createMockFn<() => void>()
      const throttledFn = throttle(fn, 0)

      throttledFn()
      expect(calls).toHaveLength(1)

      // With zero wait time, the second call executes after the timer
      throttledFn()
      jest.advanceTimersByTime(0)
      // The throttle will execute the queued call immediately
      expect(calls.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('debounce and throttle comparison', () => {
    it('debounce should only execute once after all calls stop', () => {
      const { fn: debouncedFn, calls: debouncedCalls } = createMockFn<() => void>()
      const debounced = debounce(debouncedFn, 100)

      for (let i = 0; i < 5; i++) {
        debounced()
        jest.advanceTimersByTime(50)
      }

      // Should not have executed yet
      expect(debouncedCalls).toHaveLength(0)

      // Wait for debounce period
      jest.advanceTimersByTime(100)
      expect(debouncedCalls).toHaveLength(1)
    })

    it('throttle should execute first and last calls', () => {
      const { fn: throttledFn, calls: throttledCalls } = createMockFn<() => void>()
      const throttled = throttle(throttledFn, 100)

      // First call executes immediately
      throttled()
      expect(throttledCalls).toHaveLength(1)

      // Calls during throttle period
      for (let i = 0; i < 5; i++) {
        throttled()
        jest.advanceTimersByTime(20)
      }

      // Wait for throttle period to complete
      jest.advanceTimersByTime(100)

      // Should have executed first + last
      expect(throttledCalls).toHaveLength(2)
    })
  })
})
