/**
 * E2E Tests: Weekly Review Workflow
 *
 * Tests the weekly review and reflection process
 */

import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/auth';
import { createUserWithOnboarding } from './fixtures/database';
import { TEST_WEEKLY_REVIEW, EXPECTED_XP_VALUES } from './fixtures/test-data';
import { waitForConvexSync } from './utils/convex-helpers';
import { navigateTo } from './utils/navigation';

test.describe('Weekly Review Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await createUserWithOnboarding();
  });

  test('should navigate to weekly review', async ({ page }) => {
    await navigateTo(page, 'weekly-review');

    // Verify weekly review form is displayed
    await expect(page.locator('[data-testid="weekly-review-form"]')).toBeVisible();

    // Verify current week is displayed
    await expect(page.locator('[data-testid="review-week-number"]')).toBeVisible();
  });

  test('should complete weekly review', async ({ page }) => {
    await navigateTo(page, 'weekly-review');

    // Fill highlights
    const highlightsTextarea = page.locator('[data-testid="highlights-input"]');
    await highlightsTextarea.fill(TEST_WEEKLY_REVIEW.highlights.join('\n'));

    // Fill challenges
    const challengesTextarea = page.locator('[data-testid="challenges-input"]');
    await challengesTextarea.fill(TEST_WEEKLY_REVIEW.challenges.join('\n'));

    // Fill insights
    const insightsTextarea = page.locator('[data-testid="insights-input"]');
    await insightsTextarea.fill(TEST_WEEKLY_REVIEW.insights);

    // Fill next week focus
    const nextWeekTextarea = page.locator('[data-testid="next-week-focus-input"]');
    await nextWeekTextarea.fill(TEST_WEEKLY_REVIEW.nextWeekFocus);

    // Save review
    await page.click('[data-testid="save-review-button"]');

    // Wait for save
    await waitForConvexSync(page);

    // Verify success message
    await expect(page.locator('text=/Gespeichert|Saved/')).toBeVisible();

    // Verify XP was earned
    const xpNotification = page.locator('[data-testid="xp-notification"]');
    await expect(xpNotification).toBeVisible();
  });

  test('should save draft and restore', async ({ page }) => {
    await navigateTo(page, 'weekly-review');

    // Fill partial data
    const highlightsTextarea = page.locator('[data-testid="highlights-input"]');
    await highlightsTextarea.fill('Draft highlight');

    // Navigate away
    await navigateTo(page, 'dashboard');

    // Navigate back
    await navigateTo(page, 'weekly-review');

    // Verify data was auto-saved
    await expect(highlightsTextarea).toHaveValue('Draft highlight');
  });

  test('should display goal progress in review', async ({ page }) => {
    await navigateTo(page, 'weekly-review');

    // Verify goals section is visible
    await expect(page.locator('[data-testid="goals-section"]')).toBeVisible();

    // Verify at least one goal is displayed
    await expect(page.locator('[data-testid="goal-item"]')).toHaveCount({
      min: 1,
    });

    // Verify goal progress bars are visible
    await expect(page.locator('[data-testid="goal-progress"]')).toBeVisible();
  });

  test('should update goal progress during review', async ({ page }) => {
    await navigateTo(page, 'weekly-review');

    // Find first goal
    const firstGoal = page.locator('[data-testid="goal-item"]').first();

    // Click to update progress
    await firstGoal.locator('[data-testid="update-progress-button"]').click();

    // Update progress value
    await page.fill('[data-testid="progress-input"]', '75');

    // Save progress
    await page.click('[data-testid="save-progress-button"]');

    await waitForConvexSync(page);

    // Verify progress updated
    await expect(firstGoal.locator('[data-testid="goal-progress"]')).toContainText('75');
  });

  test('should view previous weekly reviews', async ({ page }) => {
    await navigateTo(page, 'weekly-review');

    // Click on previous week navigation
    await page.click('[data-testid="previous-week-button"]');

    // Week number should change
    const weekNumber = await page.locator('[data-testid="review-week-number"]').textContent();

    // Navigate back to current week
    await page.click('[data-testid="current-week-button"]');

    // Should show current week again
    const currentWeek = await page.locator('[data-testid="review-week-number"]').textContent();
    expect(currentWeek).not.toBe(weekNumber);
  });

  test('should require all fields for completion', async ({ page }) => {
    await navigateTo(page, 'weekly-review');

    // Try to save without filling fields
    await page.click('[data-testid="save-review-button"]');

    // Should show validation errors
    await expect(page.locator('text=/erforderlich|required/')).toBeVisible();

    // Fill only highlights
    await page.fill('[data-testid="highlights-input"]', 'Some highlights');

    // Try to save again
    await page.click('[data-testid="save-review-button"]');

    // Should still show validation errors for other fields
    await expect(page.locator('text=/erforderlich|required/')).toBeVisible();
  });

  test('should show habit completion stats in review', async ({ page }) => {
    await navigateTo(page, 'weekly-review');

    // Verify habit stats section is visible
    await expect(page.locator('[data-testid="habit-stats"]')).toBeVisible();

    // Verify completion percentage is shown
    await expect(page.locator('[data-testid="habit-completion-rate"]')).toBeVisible();

    // Verify streak information is shown
    await expect(page.locator('[data-testid="habit-streaks"]')).toBeVisible();
  });

  test('should integrate with AI coach for review insights', async ({ page }) => {
    await navigateTo(page, 'weekly-review');

    // Fill review data
    await page.fill('[data-testid="highlights-input"]', TEST_WEEKLY_REVIEW.highlights.join('\n'));
    await page.fill('[data-testid="challenges-input"]', TEST_WEEKLY_REVIEW.challenges.join('\n'));

    // Click to get AI insights
    await page.click('[data-testid="get-ai-insights-button"]');

    // Verify AI coach panel opens
    await expect(page.locator('[data-testid="coach-panel"]')).toBeVisible();

    // Verify context is passed to coach
    await expect(page.locator('[data-testid="coach-messages"]')).toContainText(/week|Woche/);
  });
});
