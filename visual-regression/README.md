# Visual Regression Testing

This directory contains visual regression tests for the Personal Dashboard application using Playwright's screenshot testing capabilities.

## Overview

Visual regression testing helps catch unintended UI changes by comparing screenshots of your application before and after changes. This ensures that updates don't accidentally break the visual appearance of your app.

## Setup

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- The application running locally (or accessible at the configured baseURL)

### Installation

The necessary dependencies are already installed. If you need to reinstall:

```bash
npm install --save-dev @playwright/test
```

### Browser Installation

Install Playwright browsers:

```bash
npx playwright install
```

## Running Tests

### Generate Baseline Screenshots

Before you can run visual regression tests, you need to generate baseline screenshots:

```bash
npm run test:visual:update
```

This will run all tests and save screenshots as the baseline for future comparisons.

### Run Visual Regression Tests

Compare current state against baseline:

```bash
npm run test:visual
```

### Run Specific Test Files

```bash
# Test only the dashboard
npx playwright test visual-regression/dashboard.spec.ts

# Test only habits
npx playwright test visual-regression/habits.spec.ts

# Test only settings
npx playwright test visual-regression/settings.spec.ts
```

### Run Tests for Specific Browsers

```bash
# Chrome only
npx playwright test --project=chromium

# Mobile only
npx playwright test --project=mobile-chrome
```

### Debug Mode

Run tests in debug mode with Playwright Inspector:

```bash
npx playwright test --debug
```

### View Test Report

After running tests, view the HTML report:

```bash
npx playwright show-report visual-regression/test-results/html-report
```

## Test Structure

### Test Files

- **dashboard.spec.ts** - Dashboard view, widgets, and components
- **habits.spec.ts** - Habit list, expanded/collapsed states, habit items
- **reviews.spec.ts** - Weekly, monthly, quarterly, and annual review forms
- **settings.spec.ts** - Settings modal and all tabs
- **coach.spec.ts** - AI Coach panel and toggle states
- **visionboard.spec.ts** - Visionboard carousel and layouts

### Fixtures

- **auth.setup.ts** - Authentication setup for tests
- **test-data.ts** - Test data and helper functions for consistent screenshots

## Configuration

### playwright.config.ts

Key configuration options:

```typescript
{
  // Screenshot comparison thresholds
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,      // Max pixel differences allowed
      threshold: 0.2,           // Threshold for pixel diff (0-1)
      animations: 'disabled',   // Disable animations for stability
    },
  },

  // Test viewport sizes
  projects: [
    { name: 'chromium', viewport: { width: 1920, height: 1080 } },
    { name: 'mobile-chrome', device: 'Pixel 5' },
    // ...
  ],
}
```

### Adjusting Thresholds

If tests are failing due to minor differences:

1. **Per-test override:**
   ```typescript
   await expect(page).toHaveScreenshot('name.png', {
     maxDiffPixels: 200,
     threshold: 0.3,
   });
   ```

2. **Global config:** Edit `playwright.config.ts`

## Best Practices

### 1. Hide Dynamic Content

Always hide content that changes on every render:

```typescript
await hideDynamicContent(page);
```

This hides:
- Current time displays
- Dynamic dates
- Animated counters
- Loading spinners

### 2. Wait for Page Stability

Ensure the page is fully loaded before taking screenshots:

```typescript
await waitForPageStable(page);
```

### 3. Set Consistent Test Date

Use a fixed date for consistent results:

```typescript
await setTestDateTime(page);
```

### 4. Handle Animations

Animations are disabled in the global config, but you can also:

```typescript
await page.waitForTimeout(500); // Wait for animation to complete
```

### 5. Full Page vs Viewport

Choose the appropriate screenshot mode:

```typescript
// Full scrollable page
await expect(page).toHaveScreenshot('name.png', { fullPage: true });

// Visible viewport only
await expect(page).toHaveScreenshot('name.png', { fullPage: false });
```

## Troubleshooting

### Tests Failing After Code Changes

1. **Review the diff:** Check the HTML report to see visual differences
2. **Update baselines if changes are intentional:**
   ```bash
   npm run test:visual:update
   ```

### Flaky Tests

If tests are inconsistent:

1. Increase wait times for animations
2. Adjust thresholds in config
3. Add more specific waits for elements to load
4. Ensure fonts are loaded: `await page.evaluate(() => document.fonts.ready)`

### Authentication Issues

If tests fail due to auth:

1. Update `fixtures/auth.setup.ts` with your auth flow
2. Use Clerk's test mode or create a test user
3. Store auth state in `.auth/user.json`

### CI/CD Integration

For CI environments:

1. Install browsers: `npx playwright install --with-deps`
2. Run in CI mode: `CI=true npx playwright test`
3. Store baseline screenshots in version control or artifact storage

## Screenshot Storage

### Location

- **Baselines:** `visual-regression/*.spec.ts-snapshots/`
- **Failures:** `visual-regression/test-results/`
- **Reports:** `visual-regression/test-results/html-report/`

### Git Considerations

Add baseline screenshots to git:

```bash
git add visual-regression/**/*-snapshots/
```

Consider using Git LFS for large screenshot files.

## Test Coverage

Current visual regression tests cover:

- Dashboard (full view, widgets, mobile)
- Habit list (expanded, collapsed, individual items)
- Habit stats and progress bars
- Review forms (weekly, monthly, quarterly, annual)
- Settings modal (all tabs)
- AI Coach panel (toggle, open/closed states)
- Visionboard (carousel, grid layout, fullscreen)

## Maintenance

### Adding New Tests

1. Create a new `.spec.ts` file in `visual-regression/`
2. Follow the existing pattern:
   ```typescript
   import { test, expect } from '@playwright/test';
   import { waitForPageStable, hideDynamicContent } from './fixtures/test-data';

   test.describe('New Feature', () => {
     test.beforeEach(async ({ page }) => {
       await page.goto('/new-feature');
       await waitForPageStable(page);
       await hideDynamicContent(page);
     });

     test('feature view', async ({ page }) => {
       await expect(page).toHaveScreenshot('feature.png');
     });
   });
   ```
3. Generate baseline: `npm run test:visual:update`

### Updating Baselines

When UI changes are intentional:

```bash
# Update all baselines
npm run test:visual:update

# Update specific test
npx playwright test dashboard.spec.ts --update-snapshots
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Visual Regression Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run visual regression tests
        run: npm run test:visual

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: visual-regression-results
          path: visual-regression/test-results/
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Visual Comparisons Guide](https://playwright.dev/docs/test-snapshots)
- [Best Practices](https://playwright.dev/docs/best-practices)

## Support

For issues or questions:
1. Check the Playwright documentation
2. Review existing test examples
3. Check test reports for detailed failure information
