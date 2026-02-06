import { test, expect } from '@playwright/test';
import { waitForPageStable, hideDynamicContent, setTestDateTime } from './fixtures/test-data';

test.describe('Habits Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await setTestDateTime(page);
    await page.goto('/habits');
    await waitForPageStable(page);
    await hideDynamicContent(page);
  });

  test('habits page - full view', async ({ page }) => {
    await page.waitForSelector('main');

    await expect(page).toHaveScreenshot('habits-full.png', {
      fullPage: true,
    });
  });

  test('habit list - expanded categories', async ({ page }) => {
    // Try to expand all categories
    const expandButtons = await page.locator('[data-testid="category-expand"]').all();

    for (const button of expandButtons) {
      await button.click().catch(() => {});
      await page.waitForTimeout(200);
    }

    await waitForPageStable(page);

    await expect(page).toHaveScreenshot('habits-expanded.png', {
      fullPage: true,
    });
  });

  test('habit list - collapsed categories', async ({ page }) => {
    // Try to collapse all categories
    const collapseButtons = await page.locator('[data-testid="category-collapse"]').all();

    for (const button of collapseButtons) {
      await button.click().catch(() => {});
      await page.waitForTimeout(200);
    }

    await waitForPageStable(page);

    await expect(page).toHaveScreenshot('habits-collapsed.png', {
      fullPage: true,
    });
  });

  test('habit item - default state', async ({ page }) => {
    const habitItem = await page.locator('[data-testid="habit-item"]').first().catch(() => {
      return page.locator('.habit-item').first();
    });

    if (await habitItem.count() > 0) {
      await expect(habitItem).toHaveScreenshot('habit-item-default.png');
    }
  });

  test('habit item - completed state', async ({ page }) => {
    const habitCheckbox = await page.locator('[data-testid="habit-checkbox"]').first().catch(() => {
      return page.locator('input[type="checkbox"]').first();
    });

    if (await habitCheckbox.count() > 0) {
      await habitCheckbox.check();
      await page.waitForTimeout(500); // Wait for completion animation

      const habitItem = await page.locator('[data-testid="habit-item"]').first().catch(() => {
        return page.locator('.habit-item').first();
      });

      await expect(habitItem).toHaveScreenshot('habit-item-completed.png');
    }
  });

  test('habit stats bar', async ({ page }) => {
    const statsBar = await page.locator('[data-testid="stats-bar"]').first().catch(() => {
      return page.locator('.stats-bar').first();
    });

    if (await statsBar.count() > 0) {
      await expect(statsBar).toHaveScreenshot('habit-stats-bar.png');
    }
  });

  test('habit level progress', async ({ page }) => {
    const levelProgress = await page.locator('[data-testid="level-progress"]').first().catch(() => {
      return page.locator('.level-progress').first();
    });

    if (await levelProgress.count() > 0) {
      await expect(levelProgress).toHaveScreenshot('habit-level-progress.png');
    }
  });

  test('habit category section', async ({ page }) => {
    const category = await page.locator('[data-testid="habit-category"]').first().catch(() => {
      return page.locator('.habit-category').first();
    });

    if (await category.count() > 0) {
      await expect(category).toHaveScreenshot('habit-category.png');
    }
  });

  test('sprint timer modal', async ({ page }) => {
    // Look for sprint timer button
    const sprintButton = await page.locator('[data-testid="sprint-timer-button"]').first().catch(() => {
      return page.locator('button:has-text("Sprint")').first();
    });

    if (await sprintButton.count() > 0) {
      await sprintButton.click();
      await page.waitForTimeout(500);

      const modal = await page.locator('[role="dialog"]').first();
      await expect(modal).toHaveScreenshot('habit-sprint-timer.png');
    }
  });

  test('manage habits dialog', async ({ page }) => {
    // Look for manage habits button
    const manageButton = await page.locator('[data-testid="manage-habits-button"]').first().catch(() => {
      return page.locator('button:has-text("Manage")').first();
    });

    if (await manageButton.count() > 0) {
      await manageButton.click();
      await page.waitForTimeout(500);

      const dialog = await page.locator('[role="dialog"]').first();
      await expect(dialog).toHaveScreenshot('habit-manage-dialog.png');
    }
  });
});
