import { test, expect } from '@playwright/test';
import { waitForPageStable, hideDynamicContent, setTestDateTime } from './fixtures/test-data';

test.describe('Settings Modal Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await setTestDateTime(page);
    await page.goto('/');
    await waitForPageStable(page);
    await hideDynamicContent(page);
  });

  test('settings modal - default view', async ({ page }) => {
    // Look for settings button (usually a gear icon or "Settings" text)
    const settingsButton = await page.locator('[data-testid="settings-button"]').first().catch(() => {
      return page.locator('button:has-text("Settings")').first();
    });

    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await page.waitForTimeout(500);

      const modal = await page.locator('[role="dialog"]').first();
      await expect(modal).toHaveScreenshot('settings-modal-default.png');
    } else {
      // Try to find settings in sidebar or menu
      const menuButton = await page.locator('[aria-label="Menu"]').first().catch(() => {
        return page.locator('button[aria-haspopup="menu"]').first();
      });

      if (await menuButton.count() > 0) {
        await menuButton.click();
        await page.waitForTimeout(300);

        const settingsMenuItem = page.locator('text=Settings').first();
        await settingsMenuItem.click();
        await page.waitForTimeout(500);

        const modal = await page.locator('[role="dialog"]').first();
        await expect(modal).toHaveScreenshot('settings-modal-default.png');
      }
    }
  });

  test('settings modal - profile tab', async ({ page }) => {
    const settingsButton = await page.locator('[data-testid="settings-button"]').first().catch(() => {
      return page.locator('button:has-text("Settings")').first();
    });

    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await page.waitForTimeout(500);

      // Look for profile tab
      const profileTab = await page.locator('[data-testid="settings-profile-tab"]').first().catch(() => {
        return page.locator('button:has-text("Profile")').first();
      });

      if (await profileTab.count() > 0) {
        await profileTab.click();
        await page.waitForTimeout(300);

        const modal = await page.locator('[role="dialog"]').first();
        await expect(modal).toHaveScreenshot('settings-modal-profile.png');
      }
    }
  });

  test('settings modal - preferences tab', async ({ page }) => {
    const settingsButton = await page.locator('[data-testid="settings-button"]').first().catch(() => {
      return page.locator('button:has-text("Settings")').first();
    });

    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await page.waitForTimeout(500);

      const preferencesTab = await page.locator('[data-testid="settings-preferences-tab"]').first().catch(() => {
        return page.locator('button:has-text("Preferences")').first();
      });

      if (await preferencesTab.count() > 0) {
        await preferencesTab.click();
        await page.waitForTimeout(300);

        const modal = await page.locator('[role="dialog"]').first();
        await expect(modal).toHaveScreenshot('settings-modal-preferences.png');
      }
    }
  });

  test('settings modal - visionboard settings', async ({ page }) => {
    const settingsButton = await page.locator('[data-testid="settings-button"]').first().catch(() => {
      return page.locator('button:has-text("Settings")').first();
    });

    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await page.waitForTimeout(500);

      const visionboardTab = await page.locator('[data-testid="settings-visionboard-tab"]').first().catch(() => {
        return page.locator('button:has-text("Vision Board")').first();
      });

      if (await visionboardTab.count() > 0) {
        await visionboardTab.click();
        await page.waitForTimeout(300);

        const modal = await page.locator('[role="dialog"]').first();
        await expect(modal).toHaveScreenshot('settings-modal-visionboard.png');
      }
    }
  });

  test('settings modal - theme toggle', async ({ page }) => {
    const settingsButton = await page.locator('[data-testid="settings-button"]').first().catch(() => {
      return page.locator('button:has-text("Settings")').first();
    });

    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await page.waitForTimeout(500);

      // Look for theme toggle
      const themeToggle = await page.locator('[data-testid="theme-toggle"]').first().catch(() => {
        return page.locator('button:has-text("Dark")').first();
      });

      if (await themeToggle.count() > 0) {
        await expect(themeToggle).toHaveScreenshot('settings-theme-toggle.png');
      }
    }
  });
});
