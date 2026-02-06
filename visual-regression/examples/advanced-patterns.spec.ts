/**
 * Advanced Visual Regression Testing Patterns
 *
 * This file demonstrates advanced techniques for visual regression testing.
 * Use these patterns as examples for your own tests.
 */

import { test, expect } from '@playwright/test';
import { waitForPageStable, hideDynamicContent, setTestDateTime } from '../fixtures/test-data';
import { waitForImages, hideElements, scrollToElement } from '../helpers/screenshot-manager';

test.describe('Advanced Patterns', () => {
  test.beforeEach(async ({ page }) => {
    await setTestDateTime(page);
    await page.goto('/');
    await waitForPageStable(page);
  });

  /**
   * Pattern 1: Testing Dark/Light Mode
   */
  test('theme switching - light to dark', async ({ page }) => {
    // Capture light mode
    await expect(page).toHaveScreenshot('theme-light.png');

    // Switch to dark mode
    const themeToggle = await page.locator('[data-testid="theme-toggle"]').first();
    if (await themeToggle.count() > 0) {
      await themeToggle.click();
      await page.waitForTimeout(500);

      // Capture dark mode
      await expect(page).toHaveScreenshot('theme-dark.png');
    }
  });

  /**
   * Pattern 2: Testing Responsive Layouts
   */
  test('responsive layout - multiple breakpoints', async ({ page }) => {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'wide', width: 2560, height: 1440 },
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot(`responsive-${breakpoint.name}.png`, {
        fullPage: true,
      });
    }
  });

  /**
   * Pattern 3: Testing Interactive States
   */
  test('button states - hover, focus, active', async ({ page }) => {
    const button = await page.locator('button').first();

    if (await button.count() > 0) {
      // Default state
      await expect(button).toHaveScreenshot('button-default.png');

      // Hover state
      await button.hover();
      await page.waitForTimeout(200);
      await expect(button).toHaveScreenshot('button-hover.png');

      // Focus state
      await button.focus();
      await page.waitForTimeout(200);
      await expect(button).toHaveScreenshot('button-focus.png');

      // Active state (during click)
      await page.mouse.move(0, 0);
      await button.dispatchEvent('mousedown');
      await page.waitForTimeout(100);
      await expect(button).toHaveScreenshot('button-active.png');
    }
  });

  /**
   * Pattern 4: Testing Scrolled States
   */
  test('page sections after scrolling', async ({ page }) => {
    // Scroll to specific sections
    const sections = ['header', 'main', 'footer'];

    for (const section of sections) {
      const element = await page.locator(section).first();
      if (await element.count() > 0) {
        await scrollToElement(page, section);
        await expect(page).toHaveScreenshot(`section-${section}.png`);
      }
    }
  });

  /**
   * Pattern 5: Testing Modal/Dialog States
   */
  test('modal states - open, filled, validation', async ({ page }) => {
    const openButton = await page.locator('[data-testid="open-modal"]').first();

    if (await openButton.count() > 0) {
      // Open modal
      await openButton.click();
      await page.waitForTimeout(500);

      const modal = await page.locator('[role="dialog"]').first();

      // Empty state
      await expect(modal).toHaveScreenshot('modal-empty.png');

      // Filled state
      const inputs = await modal.locator('input[type="text"]').all();
      for (const input of inputs) {
        await input.fill('Test data');
      }
      await expect(modal).toHaveScreenshot('modal-filled.png');

      // Validation error state
      const submitButton = await modal.locator('button[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(500);
        await expect(modal).toHaveScreenshot('modal-validation-errors.png');
      }
    }
  });

  /**
   * Pattern 6: Testing with Data Variations
   */
  test('list states - empty, partial, full', async ({ page }) => {
    // This would typically use test data fixtures or API mocking
    // For example purposes, we'll just capture different list states

    const list = await page.locator('[data-testid="item-list"]').first();

    if (await list.count() > 0) {
      await expect(list).toHaveScreenshot('list-current-state.png');
    }
  });

  /**
   * Pattern 7: Hiding Dynamic Content
   */
  test('hide dynamic elements', async ({ page }) => {
    // Hide elements that change on every render
    await hideElements(page, [
      '[data-testid="current-time"]',
      '[data-testid="random-quote"]',
      '.loading-spinner',
      '.animated-counter',
    ]);

    await expect(page).toHaveScreenshot('page-without-dynamic-content.png');
  });

  /**
   * Pattern 8: Testing Loading States
   */
  test('loading states', async ({ page }) => {
    // Intercept network requests to control loading state
    await page.route('**/api/**', (route) => {
      // Delay response to capture loading state
      setTimeout(() => route.continue(), 5000);
    });

    const loadingTrigger = await page.locator('[data-testid="fetch-data"]').first();

    if (await loadingTrigger.count() > 0) {
      await loadingTrigger.click();
      await page.waitForTimeout(100); // Brief wait to see loader

      const loadingIndicator = await page.locator('[data-testid="loading"]').first();
      if (await loadingIndicator.count() > 0) {
        await expect(loadingIndicator).toHaveScreenshot('loading-state.png');
      }
    }
  });

  /**
   * Pattern 9: Testing Animations (Mid-state)
   */
  test('animation mid-state', async ({ page }) => {
    const animatedElement = await page.locator('[data-testid="animated"]').first();

    if (await animatedElement.count() > 0) {
      // Trigger animation
      await animatedElement.click();

      // Capture at different points
      await page.waitForTimeout(100);
      await expect(animatedElement).toHaveScreenshot('animation-start.png');

      await page.waitForTimeout(250);
      await expect(animatedElement).toHaveScreenshot('animation-mid.png');

      await page.waitForTimeout(500);
      await expect(animatedElement).toHaveScreenshot('animation-end.png');
    }
  });

  /**
   * Pattern 10: Testing with Mock Data
   */
  test('with mocked API data', async ({ page }) => {
    // Mock API responses for consistent data
    await page.route('**/api/habits', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, title: 'Test Habit 1', completed: false },
          { id: 2, title: 'Test Habit 2', completed: true },
        ]),
      });
    });

    await page.reload();
    await waitForPageStable(page);

    await expect(page).toHaveScreenshot('page-with-mock-data.png');
  });

  /**
   * Pattern 11: Testing Specific Component States
   */
  test('component isolation', async ({ page }) => {
    // Test a specific component in different states
    const component = await page.locator('[data-testid="habit-card"]').first();

    if (await component.count() > 0) {
      // Default state
      await expect(component).toHaveScreenshot('component-default.png');

      // Hover state
      await component.hover();
      await page.waitForTimeout(200);
      await expect(component).toHaveScreenshot('component-hover.png');

      // Selected state
      await component.click();
      await page.waitForTimeout(200);
      await expect(component).toHaveScreenshot('component-selected.png');
    }
  });

  /**
   * Pattern 12: Testing with Different User Permissions
   */
  test('admin vs regular user view', async ({ page }) => {
    // This would typically involve different auth states
    // For example, you might have different auth fixtures

    // Regular user view
    await expect(page).toHaveScreenshot('view-regular-user.png');

    // Switch to admin (this is pseudo-code, implement based on your auth)
    // await switchToAdminUser(page);
    // await page.reload();
    // await waitForPageStable(page);
    // await expect(page).toHaveScreenshot('view-admin-user.png');
  });

  /**
   * Pattern 13: Testing Error States
   */
  test('error states', async ({ page }) => {
    // Mock an API error
    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    const errorTrigger = await page.locator('[data-testid="fetch-data"]').first();

    if (await errorTrigger.count() > 0) {
      await errorTrigger.click();
      await page.waitForTimeout(500);

      const errorMessage = await page.locator('[data-testid="error-message"]').first();
      if (await errorMessage.count() > 0) {
        await expect(errorMessage).toHaveScreenshot('error-state.png');
      }
    }
  });

  /**
   * Pattern 14: Testing Tooltips and Popovers
   */
  test('tooltip and popover states', async ({ page }) => {
    const tooltipTrigger = await page.locator('[data-testid="has-tooltip"]').first();

    if (await tooltipTrigger.count() > 0) {
      // Hover to show tooltip
      await tooltipTrigger.hover();
      await page.waitForTimeout(500); // Wait for tooltip animation

      const tooltip = await page.locator('[role="tooltip"]').first();
      if (await tooltip.count() > 0) {
        await expect(tooltip).toHaveScreenshot('tooltip-visible.png');
      }
    }
  });

  /**
   * Pattern 15: Testing Print Styles
   */
  test('print layout', async ({ page }) => {
    // Emulate print media
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('print-layout.png', {
      fullPage: true,
    });
  });
});
