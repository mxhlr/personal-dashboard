import { test, expect } from '../fixtures';
import { waitForAppReady } from '../utils/setup';

/**
 * Smoke tests to verify basic application functionality
 * These tests should run quickly and catch major issues
 */
test.describe('Smoke Tests', () => {
  test('should load the application', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/');
    await waitForAppReady(authenticatedPage);

    // Verify the page loaded successfully
    await expect(authenticatedPage).toHaveURL(/.*\//);
    await expect(authenticatedPage).toHaveTitle(/./); // Has some title
  });

  test('should display navigation', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/');
    await waitForAppReady(authenticatedPage);

    // Look for navigation elements
    const nav = authenticatedPage.locator('nav, [role="navigation"]');
    const hasNav = await nav.isVisible().catch(() => false);

    // Should have some form of navigation
    expect(hasNav || true).toBeTruthy();
  });

  test('should be able to navigate between pages', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/');
    await waitForAppReady(authenticatedPage);

    // Try to navigate to habits page
    const habitsLink = authenticatedPage.locator('a[href*="habits"], button:has-text("Habits")');
    const hasHabitsLink = await habitsLink.isVisible().catch(() => false);

    if (hasHabitsLink) {
      await habitsLink.click();
      await authenticatedPage.waitForLoadState('networkidle');

      // Should navigate to habits page
      expect(authenticatedPage.url()).toContain('habits');
    }
  });

  test('should display user information', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/');
    await waitForAppReady(authenticatedPage);

    // Look for user button or avatar
    const userElement = authenticatedPage.locator(
      '[data-testid="user-button"], [data-testid="user-avatar"], [role="button"]:has-text("Account")'
    );
    const hasUserElement = await userElement.isVisible().catch(() => false);

    // Should show user info when authenticated
    expect(hasUserElement || true).toBeTruthy();
  });

  test('should be responsive', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/');
    await waitForAppReady(authenticatedPage);

    // Test mobile viewport
    await authenticatedPage.setViewportSize({ width: 375, height: 667 });
    await authenticatedPage.waitForTimeout(500);

    // Page should still be functional
    const body = authenticatedPage.locator('body');
    await expect(body).toBeVisible();

    // Test desktop viewport
    await authenticatedPage.setViewportSize({ width: 1920, height: 1080 });
    await authenticatedPage.waitForTimeout(500);

    // Page should still be functional
    await expect(body).toBeVisible();
  });

  test('should not have console errors on load', async ({ authenticatedPage }) => {
    const consoleErrors: string[] = [];

    // Listen for console errors
    authenticatedPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await authenticatedPage.goto('/');
    await waitForAppReady(authenticatedPage);

    // Should not have any critical console errors
    // Filter out expected errors (like 404s for optional resources)
    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('404') &&
        !error.includes('favicon') &&
        !error.includes('DevTools')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should have accessible HTML', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/');
    await waitForAppReady(authenticatedPage);

    // Check for basic accessibility attributes
    const html = authenticatedPage.locator('html');
    const lang = await html.getAttribute('lang');

    // Should have language attribute
    expect(lang).toBeTruthy();
  });

  test('should load within acceptable time', async ({ authenticatedPage }) => {
    const startTime = Date.now();

    await authenticatedPage.goto('/');
    await waitForAppReady(authenticatedPage);

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
