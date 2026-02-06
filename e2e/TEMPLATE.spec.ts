/**
 * E2E Tests: [Feature Name]
 *
 * Description of what this test suite covers
 *
 * @example
 * // Run this test suite
 * npx playwright test e2e/TEMPLATE.spec.ts
 *
 * // Run in headed mode
 * npx playwright test e2e/TEMPLATE.spec.ts --headed
 *
 * // Run in debug mode
 * npx playwright test e2e/TEMPLATE.spec.ts --debug
 */

import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/auth';
import { createUserWithOnboarding } from './fixtures/database';
import { TEST_USER } from './fixtures/test-data';
import { waitForConvexSync } from './utils/convex-helpers';
import { navigateTo } from './utils/navigation';

/**
 * Test suite for [Feature Name]
 */
test.describe('[Feature Name]', () => {
  /**
   * Setup: Run before each test
   */
  test.beforeEach(async ({ page }) => {
    // Authenticate user
    await setupAuth(page);

    // Create user with completed onboarding
    await createUserWithOnboarding();

    // Optional: Navigate to the feature page
    // await navigateTo(page, 'feature-page');
  });

  /**
   * Cleanup: Run after each test (optional)
   */
  test.afterEach(async ({ page }) => {
    // Optional cleanup logic
  });

  /**
   * Test Case 1: Basic functionality
   *
   * Tests the basic happy path functionality
   */
  test('should perform basic action', async ({ page }) => {
    // Arrange: Set up test conditions
    await page.goto('/feature-page');

    // Act: Perform the action being tested
    await page.click('[data-testid="action-button"]');

    // Assert: Verify expected outcome
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });

  /**
   * Test Case 2: User interaction
   *
   * Tests user interaction with the feature
   */
  test('should handle user input', async ({ page }) => {
    await page.goto('/feature-page');

    // Fill form
    await page.fill('[data-testid="input-field"]', 'Test Value');

    // Submit
    await page.click('[data-testid="submit-button"]');

    // Wait for Convex mutation
    await waitForConvexSync(page);

    // Verify data saved
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  /**
   * Test Case 3: Validation
   *
   * Tests form validation and error handling
   */
  test('should validate required fields', async ({ page }) => {
    await page.goto('/feature-page');

    // Try to submit without filling required fields
    await page.click('[data-testid="submit-button"]');

    // Verify validation errors shown
    await expect(page.locator('text=/erforderlich|required/')).toBeVisible();
  });

  /**
   * Test Case 4: Data persistence
   *
   * Tests that data persists across page reloads
   */
  test('should persist data across page reload', async ({ page }) => {
    await page.goto('/feature-page');

    // Save data
    await page.fill('[data-testid="input-field"]', 'Persistent Value');
    await page.click('[data-testid="submit-button"]');
    await waitForConvexSync(page);

    // Reload page
    await page.reload();

    // Verify data persisted
    await expect(page.locator('[data-testid="saved-value"]')).toContainText('Persistent Value');
  });

  /**
   * Test Case 5: Edge case
   *
   * Tests edge case or boundary condition
   */
  test('should handle edge case', async ({ page }) => {
    await page.goto('/feature-page');

    // Test edge case
    await page.fill('[data-testid="input-field"]', 'A'.repeat(1000)); // Very long input

    await page.click('[data-testid="submit-button"]');

    // Verify appropriate handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  /**
   * Test Group: Related functionality
   */
  test.describe('Related Feature', () => {
    test('should do related thing', async ({ page }) => {
      // Test related functionality
    });
  });

  /**
   * Conditional test: Only run in certain conditions
   */
  test.skip('conditional test', async ({ page }) => {
    // This test is skipped
    // Remove .skip when ready to run
  });

  /**
   * Focused test: Only run this test (for debugging)
   */
  test.only.skip('focused test for debugging', async ({ page }) => {
    // Remove .only before committing
    // This will be the only test that runs when .only is active
  });
});

/**
 * Example using Page Object Model
 */
test.describe('[Feature Name] with Page Object', () => {
  test('should use page object model', async ({ page }) => {
    // Example of how to use a page object
    // Uncomment and implement when you create the page object

    // const featurePage = new FeaturePage(page);
    // await featurePage.goto();
    // await featurePage.performAction();
    // await featurePage.verifyResult();
  });
});

/**
 * Example with custom fixtures
 */
test.describe('[Feature Name] with Custom Data', () => {
  test('should use test data', async ({ page }) => {
    // Import test data from fixtures/test-data.ts
    // const testData = TEST_CUSTOM_DATA;

    // Use test data in test
    // await page.fill('[data-testid="field"]', testData.value);
  });
});

/**
 * Best Practices Checklist:
 *
 * ✓ Use data-testid selectors
 * ✓ Wait for Convex sync after mutations
 * ✓ Keep tests independent
 * ✓ Use descriptive test names
 * ✓ Follow Arrange-Act-Assert pattern
 * ✓ Test both happy paths and edge cases
 * ✓ Add comments for complex logic
 * ✓ Use Page Object Model for complex pages
 * ✓ Clean up test data after tests
 * ✓ Use realistic test data from fixtures
 */
