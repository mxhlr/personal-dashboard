# Testing Documentation

This document outlines the testing approach and conventions for the personal-dashboard project.

## Table of Contents

- [Overview](#overview)
- [Test Setup](#test-setup)
- [Running Tests](#running-tests)
- [Test Organization](#test-organization)
- [Writing Tests](#writing-tests)
- [Coverage Goals](#coverage-goals)
- [Best Practices](#best-practices)

## Overview

This project uses **Jest** as the primary testing framework for unit and integration tests. Tests focus on critical business logic, utilities, and validation schemas.

### Test Types

1. **Unit Tests** - Test individual functions and modules in isolation
2. **Integration Tests** - Test interactions between multiple modules
3. **Visual Tests** - Playwright-based visual regression tests (separate configuration)
4. **E2E Tests** - End-to-end tests using Playwright (separate configuration)

## Test Setup

### Dependencies

The following testing libraries are installed:

- `jest` - Test runner and framework
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers for DOM testing
- `@testing-library/user-event` - User interaction simulation
- `jest-environment-jsdom` - DOM environment for React tests
- `ts-jest` - TypeScript support for Jest

### Configuration

Tests are configured in `jest.config.js` with:

- Next.js integration via `next/jest`
- TypeScript support
- Path aliases (`@/` maps to project root)
- Coverage thresholds (80% for all metrics)
- jsdom test environment for React components

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (no watch, with coverage)
npm run test:ci
```

### Filtering Tests

```bash
# Run tests in a specific file
npm test -- performance.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="debounce"

# Run only changed tests (in watch mode)
# Press 'o' in watch mode
```

## Test Organization

Tests are organized to mirror the source code structure:

```
__tests__/
├── lib/
│   ├── performance.test.ts          # Tests for lib/performance.ts
│   ├── utils.test.ts                # Tests for lib/utils.ts
│   ├── constants/
│   │   └── constants.test.ts        # Tests for lib/constants/
│   ├── errors/
│   │   ├── errorTypes.test.ts       # Tests for lib/errors/errorTypes.ts
│   │   └── errorHandler.test.ts     # Tests for lib/errors/errorHandler.ts
│   └── validations/
│       ├── habitSchemas.test.ts     # Tests for lib/validations/habitSchemas.ts
│       ├── profileSchemas.test.ts   # Tests for lib/validations/profileSchemas.ts
│       ├── trackingSchemas.test.ts  # Tests for lib/validations/trackingSchemas.ts
│       └── reviewSchemas.test.ts    # Tests for lib/validations/reviewSchemas.ts
└── utils/
    └── testHelpers.ts               # Shared test utilities (not run as tests)
```

## Writing Tests

### Test Structure

Follow the Arrange-Act-Assert (AAA) pattern:

```typescript
describe('myFunction', () => {
  it('should do something specific', () => {
    // Arrange - Set up test data
    const input = 'test'

    // Act - Execute the function
    const result = myFunction(input)

    // Assert - Verify the result
    expect(result).toBe('expected')
  })
})
```

### Test Helpers

Use the shared test helpers from `__tests__/utils/testHelpers.ts`:

```typescript
import { wait, createMockFn, randomString } from '../utils/testHelpers'

it('should test async behavior', async () => {
  const { fn, calls } = createMockFn<(value: string) => void>()

  fn('test')
  await wait(100)

  expect(calls).toHaveLength(1)
})
```

### Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction()
  expect(result).toBeDefined()
})

it('should handle errors', async () => {
  await expect(failingFunction()).rejects.toThrow(Error)
})
```

### Testing with Timers

```typescript
beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

it('should debounce calls', () => {
  const fn = jest.fn()
  const debounced = debounce(fn, 500)

  debounced()
  jest.advanceTimersByTime(500)

  expect(fn).toHaveBeenCalledTimes(1)
})
```

### Testing Zod Schemas

```typescript
import { mySchema } from '@/lib/validations/mySchemas'

it('should validate correct data', () => {
  const valid = { field: 'value' }
  const result = mySchema.safeParse(valid)

  expect(result.success).toBe(true)
})

it('should reject invalid data', () => {
  const invalid = { field: '' }
  const result = mySchema.safeParse(invalid)

  expect(result.success).toBe(false)
  if (!result.success) {
    const error = result.error.issues.find(issue =>
      issue.path.includes('field')
    )
    expect(error?.message).toContain('required')
  }
})
```

### Testing Error Classes

```typescript
import { ValidationError } from '@/lib/errors/errorTypes'

it('should create error with correct properties', () => {
  const error = new ValidationError('Invalid input')

  expect(error).toBeInstanceOf(ValidationError)
  expect(error.message).toBe('Invalid input')
  expect(error.code).toBe('VALIDATION_ERROR')
  expect(error.statusCode).toBe(400)
})
```

## Coverage Goals

### Target Metrics

All metrics should meet or exceed **80% coverage**:

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Coverage Reports

After running `npm run test:coverage`, view the detailed report:

```bash
# Open HTML coverage report
open coverage/lcov-report/index.html
```

### Files Covered

Current test coverage focuses on:

- ✅ `lib/performance.ts` - Debounce and throttle utilities
- ✅ `lib/utils.ts` - Utility functions (cn)
- ✅ `lib/validations/` - All Zod validation schemas
- ✅ `lib/errors/errorTypes.ts` - Custom error classes
- ✅ `lib/errors/errorHandler.ts` - Error handling utilities
- ✅ `lib/constants/` - Application constants

### Files Excluded

The following are excluded from coverage requirements:

- `lib/errors/ErrorProvider.tsx` - React context provider
- `lib/errors/useErrorHandler.ts` - React hook
- `lib/errors/examples.ts` - Example code
- `lib/api/**` - API clients (require integration tests)
- `lib/**/index.ts` - Barrel exports

## Best Practices

### 1. Descriptive Test Names

Use clear, descriptive test names that explain the expected behavior:

```typescript
// Good
it('should return error when email is invalid')

// Bad
it('test email validation')
```

### 2. Test One Thing at a Time

Each test should verify a single behavior:

```typescript
// Good
it('should accept minimum value (1)', () => {
  expect(schema.safeParse({ value: 1 }).success).toBe(true)
})

it('should reject value below minimum', () => {
  expect(schema.safeParse({ value: 0 }).success).toBe(false)
})

// Bad
it('should validate value range', () => {
  expect(schema.safeParse({ value: 1 }).success).toBe(true)
  expect(schema.safeParse({ value: 0 }).success).toBe(false)
  expect(schema.safeParse({ value: 10 }).success).toBe(true)
})
```

### 3. Use Test Fixtures

Create reusable test data:

```typescript
const VALID_HABIT = {
  id: 'habit-1',
  name: 'Exercise',
  xp: 10,
  completed: false,
}

it('should validate valid habit', () => {
  expect(habitSchema.safeParse(VALID_HABIT).success).toBe(true)
})
```

### 4. Clean Up After Tests

Always clean up side effects:

```typescript
beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})
```

### 5. Avoid Testing Implementation Details

Focus on behavior, not implementation:

```typescript
// Good - Tests behavior
it('should return sorted array', () => {
  expect(sortArray([3, 1, 2])).toEqual([1, 2, 3])
})

// Bad - Tests implementation
it('should call Array.sort', () => {
  const spy = jest.spyOn(Array.prototype, 'sort')
  sortArray([3, 1, 2])
  expect(spy).toHaveBeenCalled()
})
```

### 6. Mock External Dependencies

Keep tests isolated by mocking external dependencies:

```typescript
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
  },
}))
```

### 7. Test Edge Cases

Don't forget to test:
- Empty inputs
- Null/undefined values
- Boundary conditions (min/max values)
- Error conditions

```typescript
it('should handle empty string', () => {
  expect(validateInput('')).toBe(false)
})

it('should handle null', () => {
  expect(validateInput(null)).toBe(false)
})

it('should handle max length', () => {
  const maxLength = 'a'.repeat(100)
  expect(validateInput(maxLength)).toBe(true)
})
```

### 8. Keep Tests Fast

- Use fake timers instead of real delays
- Mock expensive operations
- Avoid unnecessary setup

```typescript
// Good - Uses fake timers
jest.useFakeTimers()
debounced()
jest.advanceTimersByTime(500)

// Bad - Uses real delays
debounced()
await new Promise(resolve => setTimeout(resolve, 500))
```

## Continuous Integration

Tests run automatically on CI with the following command:

```bash
npm run test:ci
```

This runs tests in CI mode with:
- No watch mode
- Coverage collection
- Limited worker threads (2)
- Fail on coverage threshold violations

## Troubleshooting

### Tests Timeout

Increase timeout for specific tests:

```typescript
it('should handle slow operation', async () => {
  // Test code
}, 10000) // 10 second timeout
```

### Tests Fail Intermittently

This often indicates:
- Race conditions in async code
- Shared state between tests
- Missing test cleanup

Solution: Ensure proper cleanup and isolation.

### Coverage Not Meeting Threshold

1. Check coverage report: `npm run test:coverage`
2. Open HTML report to see uncovered lines
3. Add tests for uncovered code paths
4. Consider if code should be excluded from coverage

## Contributing

When adding new features:

1. Write tests FIRST (TDD approach recommended)
2. Ensure all tests pass: `npm test`
3. Check coverage: `npm run test:coverage`
4. Update this documentation if adding new patterns

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Zod Documentation](https://zod.dev/)
- [Next.js Testing](https://nextjs.org/docs/testing)
