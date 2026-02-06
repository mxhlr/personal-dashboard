# E2E Testing Setup Guide

This guide will help you set up and run E2E tests for the Personal Dashboard application.

## Prerequisites

1. **Node.js 20+** installed
2. **Clerk account** with a test user
3. **Convex deployment** (preferably a separate test deployment)
4. **Playwright** installed (handled by npm install)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

This will install Playwright and all required dependencies.

### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

For full browser support:

```bash
npx playwright install
```

### 3. Configure Test Environment

Copy the example environment file:

```bash
cp .env.test.example .env.test
```

Edit `.env.test` with your test credentials:

```env
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=your-test-password
CONVEX_URL=https://your-test-deployment.convex.cloud
CONVEX_DEPLOY_KEY=your-test-key
BASE_URL=http://localhost:3000
```

### 4. Create Test User in Clerk

1. Go to your Clerk dashboard
2. Navigate to Users
3. Create a new test user with the email from `.env.test`
4. Set the password to match your `.env.test` configuration

**Important:** Use a dedicated test user account, not your personal account.

### 5. Create Test Convex Deployment (Recommended)

For isolated testing, create a separate Convex deployment:

```bash
npx convex deploy --name personal-dashboard-test
```

Update your `.env.test` with the test deployment URL.

## Running Tests

### Run All Tests

```bash
npm run test:e2e
```

### Run in Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

### Run in Debug Mode (Step Through Tests)

```bash
npm run test:e2e:debug
```

### Run with UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

### Run Specific Test File

```bash
npx playwright test e2e/onboarding.spec.ts
```

### Run Tests in Specific Browser

```bash
npm run test:e2e:chromium
```

### View Test Report

After running tests:

```bash
npm run test:e2e:report
```

## Test Data Management

### Database Seeding

The test framework includes utilities for seeding test data:

- `fixtures/database.ts` - Database seeding and cleanup
- `fixtures/test-data.ts` - Test data constants

Before each test:
1. Database is reset to clean state
2. Test user profile is created
3. Default habits and categories are seeded

### Authentication State

Authentication is handled automatically:

- Tests use `setupAuth()` helper from `fixtures/auth.ts`
- Auth state is cached between test runs for speed
- State is cleared before each test suite

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/auth';
import { navigateTo } from './utils/navigation';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should do something', async ({ page }) => {
    await navigateTo(page, 'dashboard');

    // Your test code here
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Using Test Data

```typescript
import { TEST_USER, TEST_HABITS } from './fixtures/test-data';

test('should create habit', async ({ page }) => {
  const habit = TEST_HABITS[0];

  await page.fill('[name="habitName"]', habit.name);
  await page.fill('[name="habitXP"]', habit.xp.toString());
});
```

### Navigation Helpers

```typescript
import { navigateTo } from './utils/navigation';

// Navigate to different sections
await navigateTo(page, 'dashboard');
await navigateTo(page, 'habits');
await navigateTo(page, 'weekly-review');
await navigateTo(page, 'visionboard');
```

### Waiting for Convex Sync

```typescript
import { waitForConvexSync } from './utils/convex-helpers';

// After mutations, wait for sync
await page.click('[data-testid="save-button"]');
await waitForConvexSync(page);
```

## Debugging Failed Tests

### 1. Run in Debug Mode

```bash
npx playwright test --debug e2e/onboarding.spec.ts
```

This opens the Playwright Inspector where you can:
- Step through each action
- Inspect the page at each step
- See screenshots and logs

### 2. View Screenshots

Failed tests automatically capture screenshots:

```
test-results/
  onboarding-should-complete/
    test-failed-1.png
```

### 3. View Trace Files

For deeper debugging:

```bash
npx playwright show-trace test-results/.../trace.zip
```

### 4. Enable Verbose Logging

Set environment variable:

```bash
DEBUG=pw:api npm run test:e2e
```

## CI/CD Integration

Tests run automatically in GitHub Actions on:
- Pull requests to main
- Pushes to main
- Nightly schedule (2am UTC)

### Required Secrets

Configure these in GitHub repository settings:

- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`
- `TEST_CONVEX_URL`
- `TEST_CONVEX_DEPLOY_KEY`

## Troubleshooting

### Tests Timeout

- **Increase timeout**: Edit `playwright.config.ts` timeout value
- **Check dev server**: Ensure `npm run dev` starts successfully
- **Network issues**: Check Convex and Clerk connectivity

### Authentication Fails

- **Verify credentials**: Check `.env.test` values
- **Test user exists**: Ensure user is created in Clerk
- **Clear auth state**: Delete `e2e/.auth/` directory

### Tests Are Flaky

- **Add waits**: Use `waitForConvexSync()` after mutations
- **Verify selectors**: Use `data-testid` attributes
- **Check timing**: Increase timeouts for slow operations

### Database State Issues

- **Clear test data**: Implement cleanup in `fixtures/database.ts`
- **Isolated tests**: Each test should reset state
- **Use test deployment**: Separate from development data

## Best Practices

1. **Use data-testid attributes** for reliable selectors
2. **Wait for Convex sync** after mutations
3. **Keep tests independent** - no shared state
4. **Use realistic test data** from `fixtures/test-data.ts`
5. **Test happy paths first** then edge cases
6. **Run locally before CI** to catch issues early
7. **Keep tests fast** - use targeted waits, not arbitrary delays

## Performance Tips

1. **Reuse authentication** between tests
2. **Run tests in parallel** (default in Playwright)
3. **Use headed mode only for debugging**
4. **Cache Playwright browsers** in CI
5. **Limit test scope** to critical user journeys

## Next Steps

1. Add more test coverage for new features
2. Implement visual regression tests
3. Add accessibility testing with axe-core
4. Set up test data factories for complex scenarios
5. Create custom fixtures for common workflows

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Convex Testing](https://docs.convex.dev/testing)
- [Clerk Testing](https://clerk.com/docs/testing)
