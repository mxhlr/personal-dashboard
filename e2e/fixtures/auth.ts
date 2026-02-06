/**
 * Authentication Helpers for E2E Tests
 *
 * Handles Clerk authentication flow for testing
 */

import { Page } from '@playwright/test';
import { TEST_USER } from './test-data';

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Sign in to the application using Clerk
   */
  async signIn() {
    // Navigate to the app - it should redirect to Clerk sign-in
    await this.page.goto('/');

    // Wait for Clerk sign-in form to load
    await this.page.waitForSelector('input[name="identifier"]', { timeout: 10000 });

    // Fill in email
    await this.page.fill('input[name="identifier"]', TEST_USER.email);

    // Click continue button
    await this.page.click('button:has-text("Continue")');

    // Wait for password field
    await this.page.waitForSelector('input[name="password"]', { timeout: 10000 });

    // Fill in password
    await this.page.fill('input[name="password"]', TEST_USER.password);

    // Click sign in button
    await this.page.click('button:has-text("Continue")');

    // Wait for successful authentication - either redirected to setup or dashboard
    await this.page.waitForURL(/\/(setup|$)/, { timeout: 15000 });
  }

  /**
   * Sign out of the application
   */
  async signOut() {
    // Click user menu
    await this.page.click('[data-testid="user-menu"]');

    // Click sign out
    await this.page.click('button:has-text("Sign out")');

    // Wait for redirect to sign-in page
    await this.page.waitForURL(/sign-in/, { timeout: 10000 });
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Check for presence of user menu or authenticated content
      const userMenu = await this.page.locator('[data-testid="user-menu"]').count();
      return userMenu > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get authentication storage state for reuse
   */
  async getStorageState() {
    return await this.page.context().storageState();
  }

  /**
   * Set authentication storage state
   */
  async setStorageState(state: any) {
    await this.page.context().addCookies(state.cookies);

    // Set localStorage and sessionStorage
    for (const origin of state.origins || []) {
      await this.page.goto(origin.origin);

      // Set localStorage
      for (const item of origin.localStorage || []) {
        await this.page.evaluate(
          ({ name, value }) => localStorage.setItem(name, value),
          item
        );
      }
    }
  }
}

/**
 * Setup authenticated context for tests
 */
export async function setupAuth(page: Page): Promise<void> {
  const auth = new AuthHelper(page);

  // Check if already authenticated
  if (await auth.isAuthenticated()) {
    return;
  }

  // Sign in
  await auth.signIn();
}

/**
 * Teardown authentication
 */
export async function teardownAuth(page: Page): Promise<void> {
  const auth = new AuthHelper(page);

  if (await auth.isAuthenticated()) {
    await auth.signOut();
  }
}
