import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Authentication fixture for tests
 * Extends Playwright's base test with authenticated user context
 */

type AuthFixtures = {
  authenticatedPage: Page;
};

/**
 * Helper function to login with Clerk
 * Note: You'll need to set CLERK_TEST_EMAIL and CLERK_TEST_PASSWORD in .env.local
 */
async function login(page: Page) {
  // Check if we're already logged in
  const isLoggedIn = await page.locator('[data-testid="user-button"]').isVisible().catch(() => false);

  if (isLoggedIn) {
    return;
  }

  // Navigate to login page
  await page.goto('/');

  // Wait for Clerk to load and check if we need to sign in
  await page.waitForLoadState('networkidle');

  // If already authenticated, return
  const hasUserButton = await page.locator('[data-testid="user-button"]').isVisible().catch(() => false);
  if (hasUserButton) {
    return;
  }

  // Click sign in button if it exists
  const signInButton = page.locator('button:has-text("Sign in"), a:has-text("Sign in")').first();
  const hasSignInButton = await signInButton.isVisible().catch(() => false);

  if (hasSignInButton) {
    await signInButton.click();
  }

  // Fill in credentials
  // Note: Adjust selectors based on your Clerk configuration
  const email = process.env.CLERK_TEST_EMAIL || 'test@example.com';
  const password = process.env.CLERK_TEST_PASSWORD || 'testpassword123';

  await page.fill('input[name="identifier"], input[type="email"]', email);
  await page.click('button:has-text("Continue"), button[type="submit"]');

  await page.fill('input[name="password"], input[type="password"]', password);
  await page.click('button:has-text("Continue"), button[type="submit"]');

  // Wait for authentication to complete
  await page.waitForURL('/', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

/**
 * Extended test with authenticated page
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await login(page);
    await use(page);
  },
});

export { expect };
