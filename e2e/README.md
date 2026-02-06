# E2E Testing Strategy

This directory contains end-to-end (E2E) tests for the Personal Dashboard application using Playwright.

## Overview

Our E2E tests validate complete user journeys through the application, ensuring that all features work together correctly from a user's perspective.

## Test Coverage

### Main User Journeys

1. **Onboarding Flow** (`onboarding.spec.ts`)
   - Complete setup wizard
   - Profile creation
   - North Stars definition
   - Milestone setting
   - Coach configuration

2. **Daily Habit Workflow** (`daily-habits.spec.ts`)
   - View daily habits
   - Check off habits
   - Complete daily session
   - Earn XP and level up
   - Track streaks

3. **Weekly Review Workflow** (`weekly-review.spec.ts`)
   - Navigate to weekly review
   - Fill out reflection questions
   - Track goal progress
   - Save review

4. **Goal Setting and Tracking** (`goals.spec.ts`)
   - Create North Stars
   - Set quarterly milestones
   - Update milestone progress
   - Track OKRs

5. **Visionboard Management** (`visionboard.spec.ts`)
   - Create visionboard lists
   - Add visionboard items
   - Reorder items
   - Delete items

## Directory Structure

```
e2e/
├── README.md                 # This file
├── fixtures/                 # Test fixtures and utilities
│   ├── auth.ts              # Authentication helpers
│   ├── database.ts          # Database seeding utilities
│   └── test-data.ts         # Test data constants
├── utils/                   # Utility functions
│   ├── convex-helpers.ts    # Convex database helpers
│   └── navigation.ts        # Navigation helpers
├── onboarding.spec.ts       # Onboarding flow tests
├── daily-habits.spec.ts     # Daily habit workflow tests
├── weekly-review.spec.ts    # Weekly review tests
├── goals.spec.ts            # Goal setting tests
└── visionboard.spec.ts      # Visionboard tests
```

## Running Tests

### Run all tests
```bash
npx playwright test
```

### Run specific test file
```bash
npx playwright test e2e/onboarding.spec.ts
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

### Run tests in a specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### View test report
```bash
npx playwright show-report
```

## Test Environment Setup

### Environment Variables

Create a `.env.test` file with the following variables:

```env
# Test user credentials (Clerk)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test-password-123

# Convex backend
CONVEX_URL=your-test-deployment-url
CONVEX_DEPLOY_KEY=your-test-deployment-key

# Application
BASE_URL=http://localhost:3000
```

### Test User Authentication

Tests use a dedicated test user account in Clerk. The authentication state is:
- Persisted in the `fixtures/auth.ts` file
- Reused across test runs to avoid repeated logins
- Cleared before each test suite to ensure clean state

### Database Seeding

Before each test:
1. Test database is cleared of previous test data
2. Fresh seed data is inserted via Convex mutations
3. User profile is set up with default settings

The seeding logic is in `fixtures/database.ts`.

## Writing Tests

### Test Structure

Follow the Arrange-Act-Assert pattern:

```typescript
test('should complete onboarding', async ({ page }) => {
  // Arrange: Set up test state
  await page.goto('/setup');

  // Act: Perform user actions
  await page.fill('[name="name"]', 'Test User');
  await page.click('button:has-text("Next")');

  // Assert: Verify results
  await expect(page.locator('h1')).toContainText('North Stars');
});
```

### Best Practices

1. **Use Data Test IDs**: Prefer `data-testid` attributes over CSS selectors
2. **Wait for Network**: Use `page.waitForResponse()` for Convex mutations
3. **Isolated Tests**: Each test should be independent and idempotent
4. **Clean State**: Reset database state before each test
5. **Realistic Data**: Use realistic test data that mimics production
6. **Accessibility**: Test keyboard navigation and screen reader labels
7. **Error States**: Test error handling and edge cases

### Page Object Model

For complex pages, use the Page Object Model pattern:

```typescript
// e2e/pages/onboarding.page.ts
export class OnboardingPage {
  constructor(private page: Page) {}

  async fillPersonalInfo(name: string, role: string, project: string) {
    await this.page.fill('[name="name"]', name);
    await this.page.fill('[name="role"]', role);
    await this.page.fill('[name="mainProject"]', project);
  }

  async clickNext() {
    await this.page.click('button:has-text("Next")');
  }
}
```

## CI/CD Integration

Tests run automatically in CI/CD pipelines:

1. **Pre-merge**: Run on every pull request
2. **Post-merge**: Run on main branch after merge
3. **Scheduled**: Run nightly for regression testing

### CI Configuration

See `.github/workflows/e2e-tests.yml` for GitHub Actions setup.

## Debugging Failed Tests

### Local Debugging

1. Run test in headed mode:
   ```bash
   npx playwright test --headed --debug e2e/onboarding.spec.ts
   ```

2. Use Playwright Inspector to step through test

3. Check screenshots in `test-results/` folder

4. View trace files:
   ```bash
   npx playwright show-trace test-results/trace.zip
   ```

### CI Debugging

1. Download test artifacts from CI job
2. View HTML report
3. Check screenshots and videos
4. Review trace files

## Test Data Management

### Seed Data

Test seed data is defined in `fixtures/test-data.ts`:

```typescript
export const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  role: 'Developer',
  mainProject: 'Test Project',
};

export const TEST_HABITS = [
  { name: 'Morning Exercise', xp: 50, category: 'Health' },
  { name: 'Meditation', xp: 30, category: 'Mental' },
];
```

### Data Cleanup

After each test suite:
1. Test user data is cleared from Convex
2. Authentication state is reset
3. Local storage is cleared

## Performance Testing

While E2E tests focus on functionality, we also monitor:
- Page load times
- Time to interactive
- Mutation response times

Metrics are logged in test output and can be tracked over time.

## Accessibility Testing

Tests include basic accessibility checks:
- Keyboard navigation
- ARIA labels
- Focus management
- Color contrast (via axe-core integration)

## Known Issues & Limitations

1. **Clerk Authentication**: May occasionally timeout in CI (retry configured)
2. **Convex Real-time**: Polling-based tests for real-time updates
3. **File Uploads**: Limited testing of visionboard image uploads
4. **Mobile**: Mobile viewport testing disabled by default (enable in config)

## Contributing

When adding new features:
1. Write E2E tests for main user journeys
2. Follow existing test patterns
3. Update this README if adding new test categories
4. Ensure tests pass locally before pushing

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Convex Testing Guide](https://docs.convex.dev/testing)
- [Clerk Testing Guide](https://clerk.com/docs/testing)
