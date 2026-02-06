import type { Page } from '@playwright/test';

/**
 * Setup utilities for test environment
 */

/**
 * Clear all test data for a clean slate
 * Use with caution - only for test environments
 */
export async function clearTestData(page: Page): Promise<void> {
  // This would need to be implemented based on your app's data structure
  // For now, it's a placeholder for future implementation

  // Example: Clear local storage and session storage
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Setup test user with initial data
 */
export async function setupTestUser(
  page: Page,
  options?: {
    skipOnboarding?: boolean;
    addSampleHabits?: boolean;
  }
): Promise<void> {
  const { skipOnboarding = true, addSampleHabits = false } = options || {};

  // Navigate to home page
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Check if onboarding is needed
  const isOnboarding = page.url().includes('setup') || page.url().includes('onboarding');

  if (isOnboarding && skipOnboarding) {
    // Skip onboarding by completing it quickly
    // This would need to be customized based on your onboarding flow
    await completeOnboarding(page);
  }

  if (addSampleHabits) {
    // Add sample habits for testing
    await addSampleTestHabits(page);
  }
}

/**
 * Complete onboarding flow
 */
async function completeOnboarding(page: Page): Promise<void> {
  // This is a placeholder - implement based on your onboarding flow
  const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")');

  // Keep clicking next until onboarding is complete
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const hasNextButton = await nextButton.first().isVisible().catch(() => false);

    if (!hasNextButton) {
      break;
    }

    await nextButton.first().click();
    await page.waitForTimeout(500);
    attempts++;
  }
}

/**
 * Add sample habits for testing
 */
async function addSampleTestHabits(page: Page): Promise<void> {
  // Navigate to habits page
  await page.goto('/habits');
  await page.waitForLoadState('networkidle');

  // Add a few test habits
  const sampleHabits = [
    { name: 'Test Morning Meditation', category: 'Wellness', timeOfDay: 'morning' },
    { name: 'Test Evening Reading', category: 'Learning', timeOfDay: 'evening' },
  ];

  for (const habit of sampleHabits) {
    // Check if habit already exists
    const existingHabit = page.locator(`text="${habit.name}"`);
    const exists = await existingHabit.isVisible().catch(() => false);

    if (!exists) {
      // Add the habit
      const addButton = page.locator('[data-testid="add-habit-button"], button:has-text("Add Habit")');
      const hasAddButton = await addButton.isVisible().catch(() => false);

      if (hasAddButton) {
        await addButton.click();
        await page.fill('input[name="name"]', habit.name);

        // Fill other fields if available
        const categorySelect = page.locator('select[name="category"]');
        const hasCategorySelect = await categorySelect.isVisible().catch(() => false);
        if (hasCategorySelect) {
          await categorySelect.selectOption(habit.category);
        }

        // Submit
        await page.click('button:has-text("Create"), button[type="submit"]');
        await page.waitForTimeout(500);
      }
    }
  }
}

/**
 * Take a screenshot for debugging
 */
export async function debugScreenshot(
  page: Page,
  name: string
): Promise<void> {
  await page.screenshot({
    path: `test-results/debug-${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Wait for app to be ready
 */
export async function waitForAppReady(page: Page): Promise<void> {
  // Wait for any loading indicators to disappear
  await page.waitForLoadState('networkidle');

  // Wait for the app shell to be visible
  const appShell = page.locator('body');
  await appShell.waitFor({ state: 'visible' });

  // Additional wait for hydration
  await page.waitForTimeout(500);
}

/**
 * Get current route
 */
export function getCurrentRoute(page: Page): string {
  return new URL(page.url()).pathname;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Check for user button or other auth indicator
  const userButton = page.locator('[data-testid="user-button"]');
  return userButton.isVisible().catch(() => false);
}

/**
 * Log console messages for debugging
 */
export function setupConsoleLogging(page: Page): void {
  page.on('console', (msg) => {
    const type = msg.type();
    if (['error', 'warning'].includes(type)) {
      console.log(`[Browser ${type}]:`, msg.text());
    }
  });

  page.on('pageerror', (error) => {
    console.log('[Page Error]:', error.message);
  });
}
