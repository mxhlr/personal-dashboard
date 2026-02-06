# Playwright Testing Quick Start Guide

Get up and running with integration tests in 5 minutes.

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Test User

Create a test user in your Clerk dashboard:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Navigate to your application
3. Create a new user with email/password authentication
4. Note the email and password

## 3. Configure Environment

Create or update `.env.local` with test credentials:

```env
CLERK_TEST_EMAIL=your-test-user@example.com
CLERK_TEST_PASSWORD=your-secure-password
```

## 4. Install Playwright Browsers

```bash
npx playwright install chromium
```

For all browsers (recommended):
```bash
npx playwright install
```

## 5. Run Your First Test

```bash
# Start your dev server (in a separate terminal)
npm run dev

# Run tests
npm run test:integration
```

## 6. Explore Tests Interactively

Use Playwright's UI mode for the best development experience:

```bash
npm run test:integration:ui
```

This opens an interactive interface where you can:
- See all tests
- Run tests individually
- Watch tests run in real-time
- Debug failing tests
- Generate new tests with codegen

## Quick Commands Cheat Sheet

```bash
# Run all integration tests
npm run test:integration

# Run with UI mode (recommended for development)
npm run test:integration:ui

# Run in headed mode (see the browser)
npm run test:integration:headed

# Debug mode (step through tests)
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/integration/habit-completion.spec.ts

# Run only chromium browser
npm run test:e2e:chromium

# View test report
npm run test:e2e:report

# Generate new tests from browser interactions
npm run test:codegen
```

## Understanding Test Results

### Passing Tests ✓
Green checkmarks indicate tests that passed successfully.

### Failing Tests ✗
Red X's indicate tests that failed. Click on them to see:
- Error message
- Screenshot at failure
- Video recording
- Step-by-step trace

### Test Reports
After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

## Writing Your First Test

Create a new file `tests/integration/my-feature.spec.ts`:

```typescript
import { test, expect } from '../fixtures';

test.describe('My Feature', () => {
  test('should do something', async ({ authenticatedPage }) => {
    // Navigate to page
    await authenticatedPage.goto('/my-page');

    // Interact with elements
    await authenticatedPage.click('button:has-text("Click Me")');

    // Assert expected outcome
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
  });
});
```

## Common Issues & Solutions

### Tests fail with "Cannot find module"
```bash
npm install
```

### Browser not installed
```bash
npx playwright install
```

### Authentication fails
- Verify `CLERK_TEST_EMAIL` and `CLERK_TEST_PASSWORD` are set correctly
- Ensure the test user exists in your Clerk dashboard
- Check that the user has a verified email

### Dev server not starting
- Make sure port 3000 is available
- Check that Convex is configured correctly
- Verify all environment variables are set

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Check if your dev server is running slowly
- Verify network connectivity to Convex

## Next Steps

1. Read the full [Testing README](./README.md) for detailed information
2. Explore existing tests in `tests/integration/`
3. Learn about [Page Objects](./utils/page-objects.ts) for better test organization
4. Check out [Playwright Documentation](https://playwright.dev/)

## Need Help?

- [Playwright Discord](https://discord.gg/playwright-807756831384403968)
- [Playwright Documentation](https://playwright.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/playwright)

Happy Testing!
