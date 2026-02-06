/**
 * Test Helper Utilities
 *
 * Common utilities and helpers for unit tests
 */

/**
 * Wait for a specified amount of time
 * Useful for testing debounce/throttle functions
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Create a mock function with call tracking
 */
export const createMockFn = <T extends (...args: never[]) => unknown>() => {
  const calls: Parameters<T>[] = []
  const fn = jest.fn((...args: Parameters<T>) => {
    calls.push(args)
  })

  return {
    fn: fn as jest.Mock<ReturnType<T>, Parameters<T>>,
    calls,
    reset: () => {
      calls.length = 0
      fn.mockClear()
    },
  }
}

/**
 * Advance timers and wait for promises to resolve
 */
export const advanceTimersAndFlush = async (ms: number): Promise<void> => {
  jest.advanceTimersByTime(ms)
  await Promise.resolve() // Flush promise queue
}

/**
 * Generate a random string for test data
 */
export const randomString = (length: number = 10): string => {
  return Math.random().toString(36).substring(2, length + 2)
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Create a date string in YYYY-MM-DD format
 */
export const formatDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Create an ISO datetime string
 */
export const formatDateTimeString = (date: Date = new Date()): string => {
  return date.toISOString()
}

/**
 * Expect function to throw with specific error type
 */
export const expectToThrow = async <T extends Error>(
  fn: () => unknown | Promise<unknown>,
  errorType: new (...args: never[]) => T,
  expectedMessage?: string
): Promise<void> => {
  try {
    await fn()
    throw new Error('Expected function to throw, but it did not')
  } catch (error) {
    expect(error).toBeInstanceOf(errorType)
    if (expectedMessage) {
      expect((error as Error).message).toContain(expectedMessage)
    }
  }
}

/**
 * Mock console methods for testing
 */
export const mockConsole = () => {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  }

  const mocks = {
    log: jest.spyOn(console, 'log').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    info: jest.spyOn(console, 'info').mockImplementation(),
  }

  const restore = () => {
    console.log = originalConsole.log
    console.error = originalConsole.error
    console.warn = originalConsole.warn
    console.info = originalConsole.info
  }

  return { mocks, restore }
}

/**
 * Suppress console output during a test
 */
export const suppressConsole = (fn: () => void | Promise<void>) => {
  return async () => {
    const { restore } = mockConsole()
    try {
      await fn()
    } finally {
      restore()
    }
  }
}
