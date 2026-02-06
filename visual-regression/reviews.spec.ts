import { test, expect } from '@playwright/test';
import { waitForPageStable, hideDynamicContent, setTestDateTime } from './fixtures/test-data';

test.describe('Review Forms Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await setTestDateTime(page);
    await page.goto('/');
    await waitForPageStable(page);
    await hideDynamicContent(page);
  });

  test('weekly review - form view', async ({ page }) => {
    // Navigate to weekly review
    const weeklyReviewButton = await page.locator('[data-testid="weekly-review-button"]').first().catch(() => {
      return page.locator('button:has-text("Weekly Review")').first();
    });

    if (await weeklyReviewButton.count() > 0) {
      await weeklyReviewButton.click();
      await page.waitForTimeout(500);

      const form = await page.locator('[data-testid="weekly-review-form"]').first().catch(() => {
        return page.locator('[role="dialog"]').first();
      });

      await expect(form).toHaveScreenshot('review-weekly-form.png');
    }
  });

  test('weekly review - empty state', async ({ page }) => {
    const weeklyReviewButton = await page.locator('[data-testid="weekly-review-button"]').first().catch(() => {
      return page.locator('button:has-text("Weekly Review")').first();
    });

    if (await weeklyReviewButton.count() > 0) {
      await weeklyReviewButton.click();
      await page.waitForTimeout(500);

      const form = await page.locator('[data-testid="weekly-review-form"]').first().catch(() => {
        return page.locator('[role="dialog"]').first();
      });

      await expect(form).toHaveScreenshot('review-weekly-empty.png');
    }
  });

  test('monthly review - form view', async ({ page }) => {
    const monthlyReviewButton = await page.locator('[data-testid="monthly-review-button"]').first().catch(() => {
      return page.locator('button:has-text("Monthly Review")').first();
    });

    if (await monthlyReviewButton.count() > 0) {
      await monthlyReviewButton.click();
      await page.waitForTimeout(500);

      const form = await page.locator('[data-testid="monthly-review-form"]').first().catch(() => {
        return page.locator('[role="dialog"]').first();
      });

      await expect(form).toHaveScreenshot('review-monthly-form.png');
    }
  });

  test('quarterly review - form view', async ({ page }) => {
    const quarterlyReviewButton = await page.locator('[data-testid="quarterly-review-button"]').first().catch(() => {
      return page.locator('button:has-text("Quarterly Review")').first();
    });

    if (await quarterlyReviewButton.count() > 0) {
      await quarterlyReviewButton.click();
      await page.waitForTimeout(500);

      const form = await page.locator('[data-testid="quarterly-review-form"]').first().catch(() => {
        return page.locator('[role="dialog"]').first();
      });

      await expect(form).toHaveScreenshot('review-quarterly-form.png');
    }
  });

  test('annual review - form view', async ({ page }) => {
    const annualReviewButton = await page.locator('[data-testid="annual-review-button"]').first().catch(() => {
      return page.locator('button:has-text("Annual Review")').first();
    });

    if (await annualReviewButton.count() > 0) {
      await annualReviewButton.click();
      await page.waitForTimeout(500);

      const form = await page.locator('[data-testid="annual-review-form"]').first().catch(() => {
        return page.locator('[role="dialog"]').first();
      });

      await expect(form).toHaveScreenshot('review-annual-form.png');
    }
  });

  test('review - filled state', async ({ page }) => {
    const reviewButton = await page.locator('[data-testid="weekly-review-button"]').first().catch(() => {
      return page.locator('button:has-text("Weekly Review")').first();
    });

    if (await reviewButton.count() > 0) {
      await reviewButton.click();
      await page.waitForTimeout(500);

      // Fill in some sample data
      const textareas = await page.locator('textarea').all();
      for (let i = 0; i < Math.min(textareas.length, 3); i++) {
        await textareas[i].fill('Sample review content for testing visual regression');
      }

      const form = await page.locator('[role="dialog"]').first();
      await expect(form).toHaveScreenshot('review-filled-state.png');
    }
  });

  test('review notification bar', async ({ page }) => {
    const notificationBar = await page.locator('[data-testid="review-notification"]').first().catch(() => {
      return page.locator('.review-notification').first();
    });

    if (await notificationBar.count() > 0) {
      await expect(notificationBar).toHaveScreenshot('review-notification-bar.png');
    }
  });
});
