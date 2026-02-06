import { test, expect } from '@playwright/test';
import { waitForPageStable, hideDynamicContent, setTestDateTime } from './fixtures/test-data';

test.describe('Dashboard Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent date/time
    await setTestDateTime(page);

    // Navigate to dashboard
    await page.goto('/');

    // Wait for page to be stable
    await waitForPageStable(page);

    // Hide dynamic content
    await hideDynamicContent(page);
  });

  test('dashboard - full view', async ({ page }) => {
    // Wait for dashboard to load completely
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 }).catch(() => {
      // Fallback: wait for main content
      return page.waitForSelector('main');
    });

    await expect(page).toHaveScreenshot('dashboard-full.png', {
      fullPage: true,
    });
  });

  test('dashboard - above fold', async ({ page }) => {
    await page.waitForSelector('main');

    await expect(page).toHaveScreenshot('dashboard-above-fold.png', {
      fullPage: false,
    });
  });

  test('dashboard - weekly progress widget', async ({ page }) => {
    const weeklyProgress = await page.locator('[data-testid="weekly-progress"]').first().catch(() => {
      return page.locator('text=Weekly Progress').first();
    });

    if (await weeklyProgress.count() > 0) {
      await expect(weeklyProgress).toHaveScreenshot('dashboard-weekly-progress.png');
    }
  });

  test('dashboard - stoic quote widget', async ({ page }) => {
    const stoicQuote = await page.locator('[data-testid="stoic-quote"]').first().catch(() => {
      return page.locator('text=Daily Wisdom').first();
    });

    if (await stoicQuote.count() > 0) {
      await expect(stoicQuote).toHaveScreenshot('dashboard-stoic-quote.png');
    }
  });

  test('dashboard - win condition banner', async ({ page }) => {
    const winCondition = await page.locator('[data-testid="win-condition"]').first().catch(() => {
      return page.locator('text=Today\'s Win').first();
    });

    if (await winCondition.count() > 0) {
      await expect(winCondition).toHaveScreenshot('dashboard-win-condition.png');
    }
  });

  test('dashboard - review notification', async ({ page }) => {
    const reviewNotif = await page.locator('[data-testid="review-notification"]').first().catch(() => {
      return page.locator('text=Review').first();
    });

    if (await reviewNotif.count() > 0) {
      await expect(reviewNotif).toHaveScreenshot('dashboard-review-notification.png');
    }
  });

  test('dashboard - mobile view', async ({ page, viewport }) => {
    // Only run this test on mobile projects
    if (viewport && viewport.width < 768) {
      await page.waitForSelector('main');
      await expect(page).toHaveScreenshot('dashboard-mobile.png', {
        fullPage: true,
      });
    }
  });
});
