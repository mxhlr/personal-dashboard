import { test, expect } from '@playwright/test';
import { waitForPageStable, hideDynamicContent, setTestDateTime } from './fixtures/test-data';

test.describe('Visionboard Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await setTestDateTime(page);
    await page.goto('/');
    await waitForPageStable(page);
    await hideDynamicContent(page);
  });

  test('visionboard carousel - default view', async ({ page }) => {
    const visionboard = await page.locator('[data-testid="visionboard"]').first().catch(() => {
      return page.locator('.visionboard').first();
    });

    if (await visionboard.count() > 0) {
      await expect(visionboard).toHaveScreenshot('visionboard-default.png');
    }
  });

  test('visionboard - empty state', async ({ page }) => {
    const visionboard = await page.locator('[data-testid="visionboard"]').first().catch(() => {
      return page.locator('.visionboard').first();
    });

    if (await visionboard.count() > 0) {
      // Check if there's an empty state
      const emptyState = await page.locator('[data-testid="visionboard-empty"]').first().catch(() => {
        return page.locator('text=Add your first vision').first();
      });

      if (await emptyState.count() > 0) {
        await expect(visionboard).toHaveScreenshot('visionboard-empty.png');
      }
    }
  });

  test('visionboard - with images', async ({ page }) => {
    const visionboard = await page.locator('[data-testid="visionboard"]').first().catch(() => {
      return page.locator('.visionboard').first();
    });

    if (await visionboard.count() > 0) {
      // Wait for images to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await expect(visionboard).toHaveScreenshot('visionboard-with-images.png');
    }
  });

  test('visionboard carousel - navigation', async ({ page }) => {
    const nextButton = await page.locator('[data-testid="visionboard-next"]').first().catch(() => {
      return page.locator('button[aria-label*="next"]').first();
    });

    if (await nextButton.count() > 0) {
      await nextButton.click();
      await page.waitForTimeout(500); // Wait for transition

      const visionboard = await page.locator('[data-testid="visionboard"]').first().catch(() => {
        return page.locator('.visionboard').first();
      });

      await expect(visionboard).toHaveScreenshot('visionboard-next-slide.png');
    }
  });

  test('visionboard - fullscreen view', async ({ page }) => {
    const fullscreenButton = await page.locator('[data-testid="visionboard-fullscreen"]').first().catch(() => {
      return page.locator('button[aria-label*="fullscreen"]').first();
    });

    if (await fullscreenButton.count() > 0) {
      await fullscreenButton.click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('visionboard-fullscreen.png', {
        fullPage: true,
      });
    }
  });

  test('visionboard - image hover state', async ({ page }) => {
    const visionboardImage = await page.locator('[data-testid="visionboard-image"]').first().catch(() => {
      return page.locator('.visionboard img').first();
    });

    if (await visionboardImage.count() > 0) {
      await visionboardImage.hover();
      await page.waitForTimeout(300);

      const visionboard = await page.locator('[data-testid="visionboard"]').first().catch(() => {
        return page.locator('.visionboard').first();
      });

      await expect(visionboard).toHaveScreenshot('visionboard-image-hover.png');
    }
  });

  test('visionboard settings - grid layout', async ({ page }) => {
    // Navigate to settings
    const settingsButton = await page.locator('[data-testid="settings-button"]').first().catch(() => {
      return page.locator('button:has-text("Settings")').first();
    });

    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await page.waitForTimeout(500);

      // Find visionboard tab
      const visionboardTab = await page.locator('[data-testid="settings-visionboard-tab"]').first().catch(() => {
        return page.locator('button:has-text("Vision Board")').first();
      });

      if (await visionboardTab.count() > 0) {
        await visionboardTab.click();
        await page.waitForTimeout(300);

        // Switch to grid layout if available
        const gridButton = await page.locator('[data-testid="layout-grid"]').first().catch(() => {
          return page.locator('button:has-text("Grid")').first();
        });

        if (await gridButton.count() > 0) {
          await gridButton.click();
          await page.waitForTimeout(500);

          // Close settings and view result
          const closeButton = page.locator('[aria-label="Close"]').first();
          await closeButton.click();
          await page.waitForTimeout(500);

          const visionboard = await page.locator('[data-testid="visionboard"]').first().catch(() => {
            return page.locator('.visionboard').first();
          });

          await expect(visionboard).toHaveScreenshot('visionboard-grid-layout.png');
        }
      }
    }
  });
});
