/**
 * E2E Tests: Onboarding Flow
 *
 * Tests the complete user onboarding/setup wizard
 */

import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/auth';
import { resetUserToOnboarding } from './fixtures/database';
import {
  TEST_USER,
  TEST_NORTH_STARS,
  TEST_MILESTONES,
  TEST_COACH_TONE,
} from './fixtures/test-data';
import { waitForConvexSync } from './utils/convex-helpers';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate the user
    await setupAuth(page);

    // Reset user to onboarding state
    await resetUserToOnboarding();
  });

  test('should complete full onboarding wizard', async ({ page }) => {
    // Navigate to setup page
    await page.goto('/setup');

    // Step 1: Welcome Screen
    await expect(page.locator('h1')).toContainText('Willkommen');
    await page.click('button:has-text("Los geht\'s")');

    // Step 2: About You
    await expect(page.locator('h2')).toContainText('Über dich');

    await page.fill('[name="name"]', TEST_USER.name);
    await page.fill('[name="role"]', TEST_USER.role);
    await page.fill('[name="mainProject"]', TEST_USER.mainProject);

    await page.click('button:has-text("Weiter")');

    // Wait for navigation to next step
    await page.waitForTimeout(500);

    // Step 3: North Stars
    await expect(page.locator('h2')).toContainText('North Stars');

    await page.fill('[name="northStars.wealth"]', TEST_NORTH_STARS.wealth);
    await page.fill('[name="northStars.health"]', TEST_NORTH_STARS.health);
    await page.fill('[name="northStars.love"]', TEST_NORTH_STARS.love);
    await page.fill('[name="northStars.happiness"]', TEST_NORTH_STARS.happiness);

    await page.click('button:has-text("Weiter")');
    await page.waitForTimeout(500);

    // Step 4: Milestones
    await expect(page.locator('h2')).toContainText('Milestones');

    // Add milestones for each area (simplified - add one per area)
    for (const area of ['wealth', 'health', 'love', 'happiness']) {
      const milestone = (TEST_MILESTONES as any)[area][0];
      await page.fill(`[name="milestone-${area}"]`, milestone);
      await page.click(`button[data-testid="add-milestone-${area}"]`);
    }

    await page.click('button:has-text("Weiter")');
    await page.waitForTimeout(500);

    // Step 5: Tracking (skip or use defaults)
    await expect(page.locator('h2')).toContainText('Tracking');

    // Use default tracking fields
    await page.click('button:has-text("Weiter")');
    await page.waitForTimeout(500);

    // Step 6: Coach Settings
    await expect(page.locator('h2')).toContainText('Coach');

    await page.click(`[data-testid="coach-tone-${TEST_COACH_TONE}"]`);

    await page.click('button:has-text("Setup abschließen")');

    // Wait for Convex mutation to complete
    await waitForConvexSync(page, 5000);

    // Step 7: Done screen
    await expect(page.locator('h2')).toContainText('Bereit');

    // Click to go to dashboard
    await page.click('button:has-text("Dashboard")');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/');

    // Verify user sees dashboard content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should allow navigation between steps', async ({ page }) => {
    await page.goto('/setup');

    // Skip welcome
    await page.click('button:has-text("Los geht\'s")');

    // On step 2, fill some data
    await page.fill('[name="name"]', TEST_USER.name);

    // Go to next step
    await page.click('button:has-text("Weiter")');
    await page.waitForTimeout(500);

    // Should be on step 3
    await expect(page.locator('h2')).toContainText('North Stars');

    // Go back
    await page.click('button:has-text("Zurück")');
    await page.waitForTimeout(500);

    // Should be back on step 2
    await expect(page.locator('h2')).toContainText('Über dich');

    // Verify data was preserved
    await expect(page.locator('[name="name"]')).toHaveValue(TEST_USER.name);
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/setup');

    // Skip welcome
    await page.click('button:has-text("Los geht\'s")');

    // Try to proceed without filling required fields
    await page.click('button:has-text("Weiter")');

    // Should show validation errors
    await expect(page.locator('text=erforderlich')).toBeVisible();

    // Fill required fields
    await page.fill('[name="name"]', TEST_USER.name);
    await page.fill('[name="role"]', TEST_USER.role);
    await page.fill('[name="mainProject"]', TEST_USER.mainProject);

    // Should now be able to proceed
    await page.click('button:has-text("Weiter")');
    await page.waitForTimeout(500);

    // Should be on next step
    await expect(page.locator('h2')).toContainText('North Stars');
  });

  test('should skip onboarding if already completed', async ({ page }) => {
    // First complete onboarding
    await page.goto('/setup');

    // Quick completion (simplified)
    await page.click('button:has-text("Los geht\'s")');

    await page.fill('[name="name"]', TEST_USER.name);
    await page.fill('[name="role"]', TEST_USER.role);
    await page.fill('[name="mainProject"]', TEST_USER.mainProject);
    await page.click('button:has-text("Weiter")');

    await page.waitForTimeout(500);

    // Fill North Stars
    await page.fill('[name="northStars.wealth"]', TEST_NORTH_STARS.wealth);
    await page.fill('[name="northStars.health"]', TEST_NORTH_STARS.health);
    await page.fill('[name="northStars.love"]', TEST_NORTH_STARS.love);
    await page.fill('[name="northStars.happiness"]', TEST_NORTH_STARS.happiness);
    await page.click('button:has-text("Weiter")');

    await page.waitForTimeout(500);

    // Skip milestones
    await page.click('button:has-text("Weiter")');
    await page.waitForTimeout(500);

    // Skip tracking
    await page.click('button:has-text("Weiter")');
    await page.waitForTimeout(500);

    // Select coach tone and complete
    await page.click(`[data-testid="coach-tone-${TEST_COACH_TONE}"]`);
    await page.click('button:has-text("Setup abschließen")');

    await waitForConvexSync(page, 5000);

    await page.click('button:has-text("Dashboard")');

    // Now try to go to /setup again
    await page.goto('/setup');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
  });
});
