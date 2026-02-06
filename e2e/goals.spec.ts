/**
 * E2E Tests: Goal Setting and Tracking
 *
 * Tests goal creation, OKR management, and milestone tracking
 */

import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/auth';
import { createUserWithOnboarding } from './fixtures/database';
import { TEST_GOAL, TEST_MILESTONES } from './fixtures/test-data';
import { waitForConvexSync } from './utils/convex-helpers';
import { navigateTo } from './utils/navigation';

test.describe('Goal Setting and Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await createUserWithOnboarding();
  });

  test('should view North Stars', async ({ page }) => {
    await navigateTo(page, 'okr');

    // Verify OKR overview is displayed
    await expect(page.locator('[data-testid="okr-overview"]')).toBeVisible();

    // Verify North Stars section exists
    await expect(page.locator('[data-testid="north-stars-section"]')).toBeVisible();

    // Verify all 4 life areas are shown
    await expect(page.locator('[data-testid="north-star-wealth"]')).toBeVisible();
    await expect(page.locator('[data-testid="north-star-health"]')).toBeVisible();
    await expect(page.locator('[data-testid="north-star-love"]')).toBeVisible();
    await expect(page.locator('[data-testid="north-star-happiness"]')).toBeVisible();
  });

  test('should edit North Star', async ({ page }) => {
    await navigateTo(page, 'okr');

    // Click edit on wealth North Star
    await page.click('[data-testid="edit-north-star-wealth"]');

    // Update the North Star
    const updatedNorthStar = 'Updated: Build a billion-dollar company';
    await page.fill('[data-testid="north-star-input"]', updatedNorthStar);

    // Save
    await page.click('[data-testid="save-north-star"]');

    await waitForConvexSync(page);

    // Verify updated North Star is displayed
    await expect(page.locator('[data-testid="north-star-wealth"]')).toContainText(
      updatedNorthStar
    );
  });

  test('should view quarterly milestones', async ({ page }) => {
    await navigateTo(page, 'okr');

    // Verify milestones section is visible
    await expect(page.locator('[data-testid="milestones-section"]')).toBeVisible();

    // Verify current quarter milestones are shown
    await expect(page.locator('[data-testid="milestone-item"]')).toHaveCount({
      min: 1,
    });
  });

  test('should complete a milestone', async ({ page }) => {
    await navigateTo(page, 'okr');

    // Find first uncompleted milestone
    const milestone = page.locator('[data-testid="milestone-item"]').first();

    // Get milestone text for verification
    const milestoneText = await milestone.locator('[data-testid="milestone-text"]').textContent();

    // Mark as complete
    await milestone.locator('[data-testid="milestone-checkbox"]').click();

    await waitForConvexSync(page);

    // Verify milestone is marked complete
    await expect(milestone.locator('[data-testid="milestone-checkbox"]')).toBeChecked();

    // Verify completion date is shown
    await expect(milestone.locator('[data-testid="completion-date"]')).toBeVisible();

    // Verify celebration animation/feedback
    await expect(page.locator('[data-testid="milestone-celebration"]')).toBeVisible();
  });

  test('should add new milestone', async ({ page }) => {
    await navigateTo(page, 'okr');

    // Click add milestone for wealth area
    await page.click('[data-testid="add-milestone-wealth"]');

    // Fill milestone details
    await page.fill('[data-testid="milestone-input"]', 'New test milestone');

    // Save
    await page.click('[data-testid="save-milestone"]');

    await waitForConvexSync(page);

    // Verify new milestone appears
    await expect(page.locator('text=New test milestone')).toBeVisible();
  });

  test('should create OKR with key results', async ({ page }) => {
    await navigateTo(page, 'okr');

    // Click to create new OKR
    await page.click('[data-testid="create-okr-button"]');

    // Fill objective
    await page.fill('[data-testid="okr-objective-input"]', TEST_GOAL.title);
    await page.fill('[data-testid="okr-description-input"]', TEST_GOAL.description);

    // Select area
    await page.selectOption('[data-testid="okr-area-select"]', TEST_GOAL.area);

    // Set target date
    await page.fill('[data-testid="okr-target-date"]', TEST_GOAL.targetDate.split('T')[0]);

    // Add key results
    for (const kr of TEST_GOAL.keyResults) {
      await page.click('[data-testid="add-key-result"]');

      const krForm = page.locator('[data-testid="key-result-form"]').last();
      await krForm.locator('[data-testid="kr-description"]').fill(kr.description);
      await krForm.locator('[data-testid="kr-target"]').fill(kr.target.toString());
      await krForm.locator('[data-testid="kr-current"]').fill(kr.current.toString());
    }

    // Save OKR
    await page.click('[data-testid="save-okr"]');

    await waitForConvexSync(page);

    // Verify OKR appears in list
    await expect(page.locator(`text=${TEST_GOAL.title}`)).toBeVisible();
  });

  test('should update key result progress', async ({ page }) => {
    await navigateTo(page, 'okr');

    // Find first OKR with key results
    const okr = page.locator('[data-testid="okr-item"]').first();

    // Click to expand/view details
    await okr.click();

    // Find first key result
    const keyResult = page.locator('[data-testid="key-result-item"]').first();

    // Click to update progress
    await keyResult.locator('[data-testid="update-kr-progress"]').click();

    // Update current value
    await page.fill('[data-testid="kr-current-input"]', '50');

    // Save
    await page.click('[data-testid="save-kr-progress"]');

    await waitForConvexSync(page);

    // Verify progress bar updated
    await expect(keyResult.locator('[data-testid="kr-progress-bar"]')).toHaveAttribute(
      'aria-valuenow',
      /5[0-9]/
    );
  });

  test('should filter milestones by area', async ({ page }) => {
    await navigateTo(page, 'okr');

    // Click wealth filter
    await page.click('[data-testid="filter-area-wealth"]');

    // Verify only wealth milestones are shown
    const visibleMilestones = page.locator('[data-testid="milestone-item"]:visible');

    const count = await visibleMilestones.count();
    for (let i = 0; i < count; i++) {
      await expect(visibleMilestones.nth(i)).toContainText(/wealth|Wealth/);
    }

    // Clear filter
    await page.click('[data-testid="clear-filters"]');

    // Verify all milestones shown again
    await expect(page.locator('[data-testid="milestone-item"]')).toHaveCount({
      min: count,
    });
  });

  test('should show milestone completion rate', async ({ page }) => {
    await navigateTo(page, 'okr');

    // Verify completion stats are displayed
    await expect(page.locator('[data-testid="milestone-completion-rate"]')).toBeVisible();

    // Verify percentage is shown
    const completionText = await page
      .locator('[data-testid="milestone-completion-rate"]')
      .textContent();

    expect(completionText).toMatch(/\d+%/);
  });

  test('should archive completed milestones', async ({ page }) => {
    await navigateTo(page, 'okr');

    // Complete a milestone first
    const milestone = page.locator('[data-testid="milestone-item"]').first();
    await milestone.locator('[data-testid="milestone-checkbox"]').click();
    await waitForConvexSync(page);

    // Open milestone menu
    await milestone.locator('[data-testid="milestone-menu"]').click();

    // Click archive
    await page.click('[data-testid="archive-milestone"]');

    await waitForConvexSync(page);

    // Verify milestone is no longer in active list
    const milestoneText = await milestone.locator('[data-testid="milestone-text"]').textContent();
    await expect(page.locator(`text=${milestoneText}`)).not.toBeVisible();

    // Navigate to archived view
    await page.click('[data-testid="show-archived"]');

    // Verify milestone appears in archived list
    await expect(page.locator(`text=${milestoneText}`)).toBeVisible();
  });

  test('should link milestones to habits', async ({ page }) => {
    await navigateTo(page, 'okr');

    // Open a milestone
    const milestone = page.locator('[data-testid="milestone-item"]').first();
    await milestone.click();

    // Click to link habits
    await page.click('[data-testid="link-habits-button"]');

    // Select habits to link
    await page.click('[data-testid="habit-checkbox-0"]');
    await page.click('[data-testid="habit-checkbox-1"]');

    // Save links
    await page.click('[data-testid="save-habit-links"]');

    await waitForConvexSync(page);

    // Verify habits are linked
    await expect(milestone.locator('[data-testid="linked-habits"]')).toBeVisible();
    await expect(milestone.locator('[data-testid="linked-habit-item"]')).toHaveCount(2);
  });
});
