import { test, expect } from '@playwright/test';
import { waitForPageStable, hideDynamicContent, setTestDateTime } from './fixtures/test-data';

test.describe('AI Coach Panel Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await setTestDateTime(page);
    await page.goto('/');
    await waitForPageStable(page);
    await hideDynamicContent(page);
  });

  test('coach toggle button - closed state', async ({ page }) => {
    const coachToggle = await page.locator('[data-testid="coach-toggle"]').first().catch(() => {
      return page.locator('button:has-text("Coach")').first();
    });

    if (await coachToggle.count() > 0) {
      await expect(coachToggle).toHaveScreenshot('coach-toggle-closed.png');
    }
  });

  test('coach panel - default view', async ({ page }) => {
    // Find and click the coach toggle button
    const coachToggle = await page.locator('[data-testid="coach-toggle"]').first().catch(() => {
      return page.locator('button:has-text("Coach")').first();
    });

    if (await coachToggle.count() > 0) {
      await coachToggle.click();
      await page.waitForTimeout(500); // Wait for slide-in animation

      const coachPanel = await page.locator('[data-testid="coach-panel"]').first().catch(() => {
        return page.locator('.coach-panel').first();
      });

      await expect(coachPanel).toHaveScreenshot('coach-panel-default.png');
    }
  });

  test('coach panel - open state full view', async ({ page }) => {
    const coachToggle = await page.locator('[data-testid="coach-toggle"]').first().catch(() => {
      return page.locator('button:has-text("Coach")').first();
    });

    if (await coachToggle.count() > 0) {
      await coachToggle.click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('coach-panel-open-full.png', {
        fullPage: false,
      });
    }
  });

  test('coach panel - with conversation', async ({ page }) => {
    const coachToggle = await page.locator('[data-testid="coach-toggle"]').first().catch(() => {
      return page.locator('button:has-text("Coach")').first();
    });

    if (await coachToggle.count() > 0) {
      await coachToggle.click();
      await page.waitForTimeout(500);

      // Try to send a message
      const input = await page.locator('[data-testid="coach-input"]').first().catch(() => {
        return page.locator('input[placeholder*="message"]').first();
      });

      if (await input.count() > 0) {
        await input.fill('How can I improve my morning routine?');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000); // Wait for response

        const coachPanel = await page.locator('[data-testid="coach-panel"]').first().catch(() => {
          return page.locator('.coach-panel').first();
        });

        await expect(coachPanel).toHaveScreenshot('coach-panel-conversation.png');
      }
    }
  });

  test('coach panel - closed state', async ({ page }) => {
    const coachToggle = await page.locator('[data-testid="coach-toggle"]').first().catch(() => {
      return page.locator('button:has-text("Coach")').first();
    });

    if (await coachToggle.count() > 0) {
      // First open it
      await coachToggle.click();
      await page.waitForTimeout(500);

      // Then close it
      await coachToggle.click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('coach-panel-closed.png');
    }
  });

  test('coach toggle - hover state', async ({ page }) => {
    const coachToggle = await page.locator('[data-testid="coach-toggle"]').first().catch(() => {
      return page.locator('button:has-text("Coach")').first();
    });

    if (await coachToggle.count() > 0) {
      await coachToggle.hover();
      await page.waitForTimeout(200);

      await expect(coachToggle).toHaveScreenshot('coach-toggle-hover.png');
    }
  });
});
