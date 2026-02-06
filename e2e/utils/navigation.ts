/**
 * Navigation Helpers for E2E Tests
 *
 * Common navigation patterns across the application
 */

import { Page, expect } from '@playwright/test';

export class NavigationHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to dashboard
   */
  async gotoDashboard() {
    await this.page.goto('/');
    await expect(this.page).toHaveURL('/');
  }

  /**
   * Navigate to habits page
   */
  async gotoHabits() {
    await this.page.goto('/habits');
    await expect(this.page).toHaveURL('/habits');
  }

  /**
   * Navigate to daily log page
   */
  async gotoDailyLog() {
    await this.page.goto('/daily-log');
    await expect(this.page).toHaveURL('/daily-log');
  }

  /**
   * Navigate to setup/onboarding page
   */
  async gotoSetup() {
    await this.page.goto('/setup');
    await expect(this.page).toHaveURL('/setup');
  }

  /**
   * Navigate to visionboard tab
   */
  async gotoVisionboard() {
    await this.page.goto('/?tab=visionboard');
    await this.page.waitForSelector('[data-testid="visionboard"]', { timeout: 10000 });
  }

  /**
   * Navigate to weekly review
   */
  async gotoWeeklyReview() {
    await this.page.goto('/?tab=planning');
    await this.page.click('[data-testid="review-selector"]');
    await this.page.click('text=Weekly Review');
    await this.page.waitForSelector('[data-testid="weekly-review-form"]', { timeout: 10000 });
  }

  /**
   * Navigate to monthly review
   */
  async gotoMonthlyReview() {
    await this.page.goto('/?tab=planning');
    await this.page.click('[data-testid="review-selector"]');
    await this.page.click('text=Monthly Review');
    await this.page.waitForSelector('[data-testid="monthly-review-form"]', { timeout: 10000 });
  }

  /**
   * Navigate to OKR page
   */
  async gotoOKR() {
    await this.page.goto('/?tab=okr');
    await this.page.waitForSelector('[data-testid="okr-overview"]', { timeout: 10000 });
  }

  /**
   * Open settings modal
   */
  async openSettings() {
    await this.page.click('[data-testid="settings-button"]');
    await this.page.waitForSelector('[data-testid="settings-modal"]', { timeout: 5000 });
  }

  /**
   * Open AI coach panel
   */
  async openCoach() {
    await this.page.click('[data-testid="coach-toggle"]');
    await this.page.waitForSelector('[data-testid="coach-panel"]', { timeout: 5000 });
  }

  /**
   * Wait for page to be ready
   */
  async waitForPageReady() {
    // Wait for main content to be visible
    await this.page.waitForSelector('main', { timeout: 10000 });

    // Wait for any loading spinners to disappear
    await this.page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 15000 })
      .catch(() => {
        // Loading spinner might not exist, that's OK
      });
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
  }
}

/**
 * Common navigation actions
 */
export async function navigateTo(page: Page, destination: string) {
  const nav = new NavigationHelper(page);

  switch (destination) {
    case 'dashboard':
      await nav.gotoDashboard();
      break;
    case 'habits':
      await nav.gotoHabits();
      break;
    case 'daily-log':
      await nav.gotoDailyLog();
      break;
    case 'setup':
      await nav.gotoSetup();
      break;
    case 'visionboard':
      await nav.gotoVisionboard();
      break;
    case 'weekly-review':
      await nav.gotoWeeklyReview();
      break;
    case 'monthly-review':
      await nav.gotoMonthlyReview();
      break;
    case 'okr':
      await nav.gotoOKR();
      break;
    default:
      throw new Error(`Unknown destination: ${destination}`);
  }

  await nav.waitForPageReady();
}
