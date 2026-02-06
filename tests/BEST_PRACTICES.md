# Playwright Testing Best Practices

Guidelines for writing effective, maintainable, and reliable tests.

## General Principles

### 1. Test User Behavior, Not Implementation

**Good:**
```typescript
test('should allow user to complete a habit', async ({ authenticatedPage }) => {
  await authenticatedPage.click('[data-testid="habit-checkbox"]');
  await expect(authenticatedPage.locator('[data-testid="habit-status"]')).toHaveText('Completed');
});
```

**Bad:**
```typescript
test('should call completeHabit mutation', async ({ authenticatedPage }) => {
  // Testing implementation details, not user behavior
});
```

### 2. Write Independent Tests

Each test should be able to run in isolation without depending on other tests.

**Good:**
```typescript
test.beforeEach(async ({ authenticatedPage }) => {
  // Set up fresh state for each test
  await setupTestData(authenticatedPage);
});

test('should complete habit', async ({ authenticatedPage }) => {
  // Test runs with its own setup
});
```

**Bad:**
```typescript
test('should create habit', async ({ authenticatedPage }) => {
  // Creates habit
});

test('should complete habit', async ({ authenticatedPage }) => {
  // Depends on previous test creating the habit
});
```

### 3. Use Descriptive Test Names

Test names should describe what the test does and what it expects.

**Good:**
```typescript
test('should show error message when submitting empty daily log form', async () => {
  // Clear expectation
});
```

**Bad:**
```typescript
test('test1', async () => {
  // No context
});
```

## Selector Best Practices

### Selector Priority (Best to Worst)

1. **Test IDs** (Most Stable)
```typescript
// Best - explicitly for testing
await page.click('[data-testid="submit-button"]');
```

2. **User-Facing Attributes** (Semantic)
```typescript
// Good - based on accessibility
await page.click('button[aria-label="Submit form"]');
await page.click('[role="button"]:has-text("Submit")');
```

3. **Text Content** (User-Visible)
```typescript
// OK - but can break with text changes
await page.click('button:has-text("Submit")');
```

4. **CSS Selectors** (Avoid if possible)
```typescript
// Fragile - breaks when styling changes
await page.click('.btn-primary.submit-btn');
```

### Add Test IDs to Your Components

```tsx
// Add data-testid to important interactive elements
<button data-testid="submit-daily-log">Submit</button>
<input data-testid="habit-name-input" />
<div data-testid="habit-list">
  {habits.map(habit => (
    <div key={habit.id} data-testid="habit-item">
      {habit.name}
    </div>
  ))}
</div>
```

## Waiting Strategies

### Always Wait for Elements

**Good:**
```typescript
await page.waitForSelector('[data-testid="habit-list"]');
await page.click('[data-testid="first-habit"]');
```

**Bad:**
```typescript
// Might fail if element isn't ready
await page.click('[data-testid="first-habit"]');
```

### Use Built-in Auto-Waiting

Playwright automatically waits for elements to be actionable:

```typescript
// These automatically wait for the element to be:
// - visible, stable, enabled, and receives events
await page.click('button');
await page.fill('input', 'text');
await page.selectOption('select', 'value');
```

### Wait for Network Idle When Needed

```typescript
// After navigation or form submission
await page.goto('/dashboard');
await page.waitForLoadState('networkidle');

// After clicking something that triggers API calls
await page.click('button:has-text("Load More")');
await page.waitForLoadState('networkidle');
```

## Page Object Model

Use Page Objects to encapsulate page interactions:

```typescript
// utils/page-objects.ts
export class HabitsPage {
  constructor(private page: Page) {}

  async completeHabit(habitName: string) {
    const habit = this.page.locator(`[data-testid="habit-item"]:has-text("${habitName}")`);
    await habit.locator('[data-testid="complete-button"]').click();
  }

  async isHabitCompleted(habitName: string): Promise<boolean> {
    const habit = this.page.locator(`[data-testid="habit-item"]:has-text("${habitName}")`);
    return habit.locator('[data-testid="completed-badge"]').isVisible();
  }
}

// In your test
test('should complete habit', async ({ authenticatedPage }) => {
  const habitsPage = new HabitsPage(authenticatedPage);
  await habitsPage.completeHabit('Morning Meditation');
  expect(await habitsPage.isHabitCompleted('Morning Meditation')).toBe(true);
});
```

## Assertions

### Use Playwright Assertions

**Good:**
```typescript
await expect(page.locator('[data-testid="success"]')).toBeVisible();
await expect(page).toHaveURL(/dashboard/);
await expect(page).toHaveTitle('Dashboard');
```

**Bad:**
```typescript
const isVisible = await page.locator('[data-testid="success"]').isVisible();
expect(isVisible).toBe(true); // No auto-waiting
```

### Multiple Assertions

```typescript
// All assertions are automatically retried
await expect(page.locator('[data-testid="habit-name"]')).toHaveText('Meditation');
await expect(page.locator('[data-testid="habit-status"]')).toHaveClass(/completed/);
await expect(page.locator('[data-testid="habit-streak"]')).toContainText('5');
```

## Test Data Management

### Use Test Data Fixtures

```typescript
// fixtures/test-data.ts
export const testHabit = {
  name: 'Test Meditation',
  category: 'Wellness',
  timeOfDay: 'morning',
};

// In your test
import { testHabit } from '../fixtures/test-data';

test('should create habit', async ({ authenticatedPage }) => {
  await createHabit(authenticatedPage, testHabit);
});
```

### Generate Unique Data

```typescript
export function generateUniqueTestData<T extends { name: string }>(base: T): T {
  return {
    ...base,
    name: `${base.name} ${Date.now()}`,
  };
}

// Usage
const uniqueHabit = generateUniqueTestData(testHabit);
```

## Error Handling

### Graceful Degradation

Some features might not be available in all environments:

```typescript
test('should show notifications', async ({ authenticatedPage }) => {
  const notificationButton = authenticatedPage.locator('[data-testid="notifications"]');
  const hasNotifications = await notificationButton.isVisible().catch(() => false);

  if (hasNotifications) {
    await notificationButton.click();
    // Test notification feature
  } else {
    // Feature not available, skip gracefully
    test.skip();
  }
});
```

### Retry Failed Actions

```typescript
import { retry } from '../utils/helpers';

const result = await retry(
  async () => {
    await page.click('[data-testid="flaky-button"]');
    return page.locator('[data-testid="success"]').textContent();
  },
  { retries: 3, delay: 1000 }
);
```

## Performance

### Use Parallel Execution

Tests run in parallel by default, but you can control it:

```typescript
// Run tests in this file serially
test.describe.serial('Sequential tests', () => {
  test('test 1', async ({ page }) => {});
  test('test 2', async ({ page }) => {});
});

// Run specific test in isolation
test.describe.parallel('Parallel tests', () => {
  test('test 1', async ({ page }) => {});
  test('test 2', async ({ page }) => {});
});
```

### Reuse Authentication State

Use the authentication fixture to avoid logging in for every test:

```typescript
// Already implemented in fixtures/auth.ts
test('my test', async ({ authenticatedPage }) => {
  // Page is already authenticated
});
```

### Minimize Page Reloads

```typescript
// Navigate once in beforeEach if possible
test.beforeEach(async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/habits');
});

test('test 1', async ({ authenticatedPage }) => {
  // Already on habits page
});

test('test 2', async ({ authenticatedPage }) => {
  // Already on habits page
});
```

## Debugging

### Use Debug Mode

```bash
npm run test:e2e:debug
```

### Add Debug Points

```typescript
test('debug this test', async ({ page }) => {
  await page.goto('/');

  // Pause execution here
  await page.pause();

  await page.click('button');
});
```

### Take Screenshots

```typescript
test('visual verification', async ({ page }) => {
  await page.goto('/dashboard');

  // Take screenshot for manual review
  await page.screenshot({ path: 'dashboard.png', fullPage: true });
});
```

### Console Logging

```typescript
test.beforeEach(async ({ page }) => {
  // Log browser console to test output
  page.on('console', msg => console.log('Browser:', msg.text()));
  page.on('pageerror', error => console.log('Error:', error.message));
});
```

## CI/CD Considerations

### Use Environment Variables

```typescript
const isCI = process.env.CI === 'true';

test('runs in CI', async ({ page }) => {
  if (isCI) {
    // Adjust for CI environment
    test.setTimeout(120000); // Longer timeout
  }
});
```

### Retry on CI

Already configured in `playwright.config.ts`:

```typescript
retries: process.env.CI ? 2 : 0,
```

### Run Subset on CI

```bash
# Only run chromium on CI for speed
npm run test:e2e:ci
```

## Common Anti-Patterns

### ❌ Hard-coded Waits

```typescript
// Bad - arbitrary wait
await page.waitForTimeout(5000);

// Good - wait for specific condition
await page.waitForSelector('[data-testid="loaded"]');
```

### ❌ Testing Multiple Things in One Test

```typescript
// Bad - too much in one test
test('should do everything', async ({ page }) => {
  // Create habit
  // Complete habit
  // Edit habit
  // Delete habit
  // Create daily log
  // etc.
});

// Good - focused tests
test('should create habit', async ({ page }) => {});
test('should complete habit', async ({ page }) => {});
test('should edit habit', async ({ page }) => {});
```

### ❌ Brittle Selectors

```typescript
// Bad - depends on DOM structure
await page.click('div > div > button.primary');

// Good - semantic selector
await page.click('[data-testid="submit-button"]');
```

### ❌ Not Handling Async Properly

```typescript
// Bad - missing await
page.click('button'); // Returns a promise!

// Good
await page.click('button');
```

## Accessibility Testing

Include accessibility checks in your tests:

```typescript
test('should be keyboard navigable', async ({ page }) => {
  await page.goto('/habits');

  // Tab through interactive elements
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');

  // Verify keyboard interaction worked
  await expect(page.locator('[data-testid="habit-modal"]')).toBeVisible();
});

test('should have proper ARIA labels', async ({ page }) => {
  await page.goto('/habits');

  const button = page.locator('button[aria-label="Add new habit"]');
  await expect(button).toBeVisible();
});
```

## Mobile Testing

Test responsive behavior:

```typescript
test('should work on mobile', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto('/habits');

  // Test mobile-specific interactions
  await page.click('[data-testid="mobile-menu"]');
  await expect(page.locator('[data-testid="nav-drawer"]')).toBeVisible();
});
```

## Summary Checklist

- [ ] Tests are independent and can run in any order
- [ ] Test names clearly describe what is being tested
- [ ] Using `data-testid` for stable selectors
- [ ] Proper waiting strategies (no hard-coded timeouts)
- [ ] Using Page Objects for complex interactions
- [ ] Using Playwright assertions (not basic expect)
- [ ] Handling errors gracefully
- [ ] Tests are focused and test one thing
- [ ] Authentication is handled via fixtures
- [ ] Tests clean up after themselves
- [ ] Accessibility is considered
- [ ] Mobile viewports are tested where relevant

Following these practices will make your tests more reliable, maintainable, and valuable.
