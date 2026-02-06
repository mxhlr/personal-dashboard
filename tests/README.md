# Integration Testing with Playwright

This directory contains integration tests for the Personal Dashboard application using Playwright.

## Overview

The test suite covers the following critical user flows:
- Habit completion and tracking
- Daily log submission
- Review form completion (Weekly, Monthly, Quarterly, Annual)
- AI Coach panel interaction
- Settings updates and configuration

## Directory Structure

```
tests/
├── fixtures/           # Test fixtures and shared setup
│   ├── auth.ts        # Authentication fixture for logged-in tests
│   ├── test-data.ts   # Test data generators and constants
│   └── index.ts       # Fixture exports
├── utils/             # Utility functions and helpers
│   ├── helpers.ts     # Common test helper functions
│   └── page-objects.ts # Page Object Models for consistent interactions
├── integration/       # Integration test specs
│   ├── habit-completion.spec.ts  # Habit tracking flow tests
│   ├── daily-log.spec.ts         # Daily log submission tests
│   ├── reviews.spec.ts           # Review form tests
│   ├── coach-panel.spec.ts       # AI Coach interaction tests
│   └── settings.spec.ts          # Settings management tests
└── README.md          # This file
```

## Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up test environment variables in `.env.local`:
   ```env
   CLERK_TEST_EMAIL=your-test-email@example.com
   CLERK_TEST_PASSWORD=your-test-password
   ```

3. Install Playwright browsers (if not already installed):
   ```bash
   npx playwright install
   ```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run integration tests only
```bash
npm run test:integration
```

### Run with UI mode (recommended for development)
```bash
npm run test:integration:ui
```

### Run in headed mode (see browser)
```bash
npm run test:integration:headed
```

### Run in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test tests/integration/habit-completion.spec.ts
```

### Run on specific browser
```bash
npm run test:e2e:chromium
npm run test:visual:firefox
npm run test:visual:webkit
```

### Run mobile tests
```bash
npm run test:visual:mobile
```

## Test Reports

### View HTML report
```bash
npm run test:e2e:report
```

Reports are generated in `playwright-report/` directory.

## Writing New Tests

### Using Page Objects

Page objects provide a clean abstraction over page interactions:

```typescript
import { test, expect } from '../fixtures';
import { HabitsPage } from '../utils/page-objects';

test('should complete a habit', async ({ authenticatedPage }) => {
  const habitsPage = new HabitsPage(authenticatedPage);
  await habitsPage.goto();
  await habitsPage.completeHabit('Morning Meditation');

  const isCompleted = await habitsPage.isHabitCompleted('Morning Meditation');
  expect(isCompleted).toBe(true);
});
```

### Using Test Data

Use the test data generators for consistent test data:

```typescript
import { testHabit, generateUniqueTestData } from '../fixtures/test-data';

const uniqueHabit = generateUniqueTestData(testHabit);
await habitsPage.addHabit(uniqueHabit);
```

### Authentication

Tests use the `authenticatedPage` fixture which automatically handles login:

```typescript
test('my test', async ({ authenticatedPage }) => {
  // Page is already authenticated
  await authenticatedPage.goto('/protected-route');
});
```

## Helper Functions

Common helpers are available in `tests/utils/helpers.ts`:

```typescript
import { waitForElement, fillAndVerify, clickAndNavigate } from '../utils/helpers';

// Wait for element to be visible
const element = await waitForElement(page, '[data-testid="my-element"]');

// Fill and verify input
await fillAndVerify(page, 'input[name="email"]', 'test@example.com');

// Click and wait for navigation
await clickAndNavigate(page, 'button[type="submit"]', '/dashboard');
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e:ci
        env:
          CLERK_TEST_EMAIL: ${{ secrets.CLERK_TEST_EMAIL }}
          CLERK_TEST_PASSWORD: ${{ secrets.CLERK_TEST_PASSWORD }}
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

1. **Use Page Objects**: Keep tests readable by abstracting page interactions into page objects
2. **Use Test Data Generators**: Generate unique test data to avoid conflicts
3. **Wait for Elements**: Always wait for elements to be visible before interacting
4. **Use Data Testids**: Prefer `data-testid` attributes over CSS selectors for stability
5. **Independent Tests**: Each test should be independent and not rely on state from other tests
6. **Clean Up**: Clean up test data after tests complete (if applicable)
7. **Meaningful Names**: Use descriptive test names that explain what is being tested

## Debugging Tips

1. **Use UI Mode**: The Playwright UI mode (`test:integration:ui`) provides an interactive way to debug tests
2. **Use Headed Mode**: Run in headed mode to see the browser actions
3. **Use Debug Mode**: Step through tests using `test:e2e:debug`
4. **Screenshots**: Tests automatically capture screenshots on failure
5. **Videos**: Tests record videos on failure (configurable in `playwright.config.ts`)
6. **Console Logs**: Check the browser console in the Playwright UI for errors

## Configuration

Configuration is in `playwright.config.ts` at the project root. Key settings:

- `testDir`: Points to `./tests`
- `timeout`: Default test timeout (60s)
- `retries`: Number of retries on CI (2)
- `workers`: Parallel workers (1 on CI, unlimited locally)
- `webServer`: Automatically starts dev server before tests

## Troubleshooting

### Tests fail due to authentication
- Verify `CLERK_TEST_EMAIL` and `CLERK_TEST_PASSWORD` are set correctly
- Check that the test user exists in your Clerk dashboard
- Update auth fixture selectors if Clerk UI has changed

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Check if dev server is running properly
- Ensure Convex backend is accessible

### Element not found errors
- Verify selectors match your current UI
- Add `data-testid` attributes to components for stable selectors
- Use Playwright's codegen tool: `npm run test:codegen`

### Flaky tests
- Add explicit waits for elements: `await page.waitForSelector()`
- Wait for network to be idle: `await page.waitForLoadState('networkidle')`
- Use retry helpers from `tests/utils/helpers.ts`

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
- [Playwright Assertions](https://playwright.dev/docs/test-assertions)
- [Page Object Model](https://playwright.dev/docs/pom)
