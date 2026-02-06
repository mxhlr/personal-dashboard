import { test as setup } from '@playwright/test';

const authFile = 'visual-regression/.auth/user.json';

/**
 * Authentication setup for visual regression tests
 * This runs once before all tests to establish an authenticated session
 */
setup('authenticate', async ({ page }) => {
  // TODO: Replace with your actual authentication flow
  // This is a placeholder - you'll need to implement based on your Clerk setup

  // Example: Navigate to your app
  await page.goto('/');

  // Example: Wait for authentication redirect or login
  // You may need to:
  // 1. Use Clerk's test mode
  // 2. Create a test user account
  // 3. Use environment variables for test credentials

  // For now, we'll assume the app is accessible without auth in test mode
  // Or you can manually authenticate once and save the state

  // Wait for the page to be ready
  await page.waitForLoadState('networkidle');

  // Save signed-in state to be reused in all tests
  await page.context().storageState({ path: authFile });
});
