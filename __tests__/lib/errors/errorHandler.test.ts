/**
 * Tests for error handler utilities
 */

import {
  getUserFriendlyMessage,
  normalizeError,
  retry,
  withTimeout,
  safeJSONParse,
  safe,
  toAppError,
} from '@/lib/errors/errorHandler'
import {
  AppError,
  ValidationError,
  NetworkError,
  TimeoutError,
  NotFoundError,
} from '@/lib/errors/errorTypes'

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}))

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
  },
}))

// Mock error reporting
jest.mock('@/lib/errors/errorReporting', () => ({
  reportError: jest.fn(),
}))

describe('errorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserFriendlyMessage', () => {
    it('should return custom message for AppError', () => {
      const error = new ValidationError('Invalid email format')
      const message = getUserFriendlyMessage(error)

      expect(message).toContain('Ungültige Eingabe')
    })

    it('should return default message for unknown error', () => {
      const error = new Error('Some random error')
      const message = getUserFriendlyMessage(error)

      expect(message).toBe('Ein unerwarteter Fehler ist aufgetreten.')
    })

    it('should detect network errors from message', () => {
      const error = new Error('Failed to fetch data')
      const message = getUserFriendlyMessage(error)

      expect(message).toContain('Netzwerkfehler')
    })

    it('should detect timeout errors from message', () => {
      const error = new Error('Request timeout occurred')
      const message = getUserFriendlyMessage(error)

      expect(message).toContain('zu lange gedauert')
    })
  })

  describe('normalizeError', () => {
    it('should return Error instance as-is', () => {
      const error = new Error('Test error')
      const normalized = normalizeError(error)

      expect(normalized).toBe(error)
    })

    it('should convert string to Error', () => {
      const normalized = normalizeError('Error message')

      expect(normalized).toBeInstanceOf(Error)
      expect(normalized.message).toBe('Error message')
    })

    it('should convert object with message to Error', () => {
      const normalized = normalizeError({ message: 'Object error' })

      expect(normalized).toBeInstanceOf(Error)
      expect(normalized.message).toBe('Object error')
    })

    it('should handle unknown values', () => {
      const normalized = normalizeError(null)

      expect(normalized).toBeInstanceOf(Error)
      expect(normalized.message).toBe('An unknown error occurred')
    })

    it('should handle undefined', () => {
      const normalized = normalizeError(undefined)

      expect(normalized).toBeInstanceOf(Error)
    })

    it('should handle numbers', () => {
      const normalized = normalizeError(404)

      expect(normalized).toBeInstanceOf(Error)
    })
  })

  describe('retry', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should succeed on first try', async () => {
      const fn = jest.fn().mockResolvedValue('success')

      const result = await retry(fn)

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new NetworkError('Failed'))
        .mockRejectedValueOnce(new NetworkError('Failed'))
        .mockResolvedValue('success')

      const resultPromise = retry(fn, { maxAttempts: 3, initialDelay: 100 })

      // Advance timers for retries
      await jest.advanceTimersByTimeAsync(100)
      await jest.advanceTimersByTimeAsync(200)

      const result = await resultPromise

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should throw after max attempts', async () => {
      const error = new NetworkError('Failed')
      const fn = jest.fn().mockRejectedValue(error)

      // Suppress console error output from the test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      let caughtError
      try {
        const promise = retry(fn, { maxAttempts: 2, initialDelay: 100 })
        await jest.advanceTimersByTimeAsync(100)
        await promise
      } catch (e) {
        caughtError = e
      }

      consoleSpy.mockRestore()

      expect(caughtError).toBeInstanceOf(NetworkError)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should not retry non-retryable errors', async () => {
      const error = new ValidationError('Invalid')
      const fn = jest.fn().mockRejectedValue(error)

      await expect(
        retry(fn, {
          maxAttempts: 3,
          shouldRetry: (err) => err instanceof NetworkError,
        })
      ).rejects.toThrow(ValidationError)

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should call onRetry callback', async () => {
      const onRetry = jest.fn()
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new NetworkError('Failed'))
        .mockResolvedValue('success')

      const resultPromise = retry(fn, { initialDelay: 100, onRetry })

      await jest.advanceTimersByTimeAsync(100)
      await resultPromise

      expect(onRetry).toHaveBeenCalledTimes(1)
      expect(onRetry).toHaveBeenCalledWith(expect.any(NetworkError), 1)
    })

    it('should use exponential backoff', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new TimeoutError('Timeout', 1000))
        .mockRejectedValueOnce(new TimeoutError('Timeout', 1000))
        .mockResolvedValue('success')

      const resultPromise = retry(fn, {
        maxAttempts: 3,
        initialDelay: 100,
        backoffFactor: 2,
      })

      // First retry: 100ms
      await jest.advanceTimersByTimeAsync(100)
      // Second retry: 200ms (100 * 2)
      await jest.advanceTimersByTimeAsync(200)

      await resultPromise

      expect(fn).toHaveBeenCalledTimes(3)
    })
  })

  describe('withTimeout', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should resolve if function completes in time', async () => {
      const fn = jest.fn().mockResolvedValue('success')

      const result = await withTimeout(fn, 1000)

      expect(result).toBe('success')
    })

    it('should reject with TimeoutError if function takes too long', async () => {
      const fn = jest.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve('too slow'), 2000)
          )
      )

      const promise = withTimeout(fn, 1000, 'Custom timeout message')

      // Advance past timeout
      jest.advanceTimersByTime(1000)

      await expect(promise).rejects.toThrow(TimeoutError)
      await expect(promise).rejects.toThrow('Custom timeout message')
    })
  })

  describe('safeJSONParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJSONParse('{"name":"John"}', {})

      expect(result).toEqual({ name: 'John' })
    })

    it('should return fallback on parse error', () => {
      const fallback = { default: true }
      const result = safeJSONParse('invalid json', fallback)

      expect(result).toBe(fallback)
    })

    it('should handle complex objects', () => {
      const data = { user: { name: 'Jane', age: 30 }, items: [1, 2, 3] }
      const json = JSON.stringify(data)
      const result = safeJSONParse(json, {})

      expect(result).toEqual(data)
    })
  })

  describe('safe', () => {
    it('should return [undefined, data] on success', async () => {
      const promise = Promise.resolve('success')
      const [error, data] = await safe(promise)

      expect(error).toBeUndefined()
      expect(data).toBe('success')
    })

    it('should return [error, undefined] on failure', async () => {
      const promise = Promise.reject(new Error('Failed'))
      const [error, data] = await safe(promise)

      expect(error).toBeInstanceOf(Error)
      expect(error?.message).toBe('Failed')
      expect(data).toBeUndefined()
    })

    it('should normalize non-Error rejections', async () => {
      const promise = Promise.reject('string error')
      const [error, data] = await safe(promise)

      expect(error).toBeInstanceOf(Error)
      expect(data).toBeUndefined()
    })
  })

  describe('toAppError', () => {
    it('should return AppError as-is', () => {
      const error = new ValidationError('Invalid')
      const result = toAppError(error)

      expect(result).toBe(error)
    })

    it('should convert validation error', () => {
      const error = new Error('validation failed')
      const result = toAppError(error)

      expect(result).toBeInstanceOf(ValidationError)
    })

    it('should convert not found error', () => {
      const error = new Error('Resource not found')
      const result = toAppError(error)

      expect(result).toBeInstanceOf(NotFoundError)
    })

    it('should convert network error', () => {
      const error = new Error('Failed to fetch data')
      const result = toAppError(error)

      expect(result).toBeInstanceOf(NetworkError)
    })

    it('should convert timeout error', () => {
      const error = new Error('Request timeout')
      const result = toAppError(error)

      expect(result).toBeInstanceOf(TimeoutError)
    })

    it('should use default message if provided', () => {
      const error = new Error('Original message')
      const result = toAppError(error, 'Custom message')

      expect(result.message).toBe('Custom message')
    })

    it('should default to generic AppError for unknown errors', () => {
      const error = new Error('Random error')
      const result = toAppError(error)

      expect(result).toBeInstanceOf(AppError)
      expect(result.code).toBe('UNKNOWN_ERROR')
    })
  })
})
