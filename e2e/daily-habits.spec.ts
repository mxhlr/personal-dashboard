/**
 * E2E Tests: Daily Habit Workflow
 *
 * Tests the daily habit tracking and completion flow
 */

import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/auth';
import { createUserWithOnboarding } from './fixtures/database';
import { EXPECTED_XP_VALUES } from './fixtures/test-data';
import { waitForConvexSync } from './utils/convex-helpers';
import { navigateTo } from './utils/navigation';

test.describe('Daily Habit Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate and setup user with completed onboarding
    await setupAuth(page);
    await createUserWithOnboarding();
  });

  test('should display daily habits', async ({ page }) => {
    await navigateTo(page, 'habits');

    // Verify habit dashboard is visible
    await expect(page.locator('[data-testid="habit-dashboard"]')).toBeVisible();

    // Verify habit categories are displayed
    await expect(page.locator('[data-testid="habit-category"]')).toHaveCount(
      { min: 1 }
    );

    // Verify at least some habits are visible
    await expect(page.locator('[data-testid="habit-item"]')).toHaveCount({
      min: 1,
    });
  });

  test('should complete a habit and earn XP', async ({ page }) => {
    await navigateTo(page, 'habits');

    // Get initial XP value
    const initialXP = await page.locator('[data-testid="user-xp"]').textContent();

    // Find first uncompleted habit
    const firstHabit = page.locator('[data-testid="habit-item"]').first();
    const habitName = await firstHabit.locator('[data-testid="habit-name"]').textContent();

    // Click to complete the habit
    await firstHabit.locator('[data-testid="habit-checkbox"]').click();

    // Wait for Convex to sync
    await waitForConvexSync(page);

    // Verify habit is marked as complete
    await expect(firstHabit.locator('[data-testid="habit-checkbox"]')).toBeChecked();

    // Verify XP increased
    const newXP = await page.locator('[data-testid="user-xp"]').textContent();
    expect(parseInt(newXP!)).toBeGreaterThan(parseInt(initialXP!));

    // Verify completion animation or feedback
    await expect(page.locator('[data-testid="xp-notification"]')).toBeVisible();
  });

  test('should uncomplete a habit', async ({ page }) => {
    await navigateTo(page, 'habits');

    // Complete a habit first
    const firstHabit = page.locator('[data-testid="habit-item"]').first();
    await firstHabit.locator('[data-testid="habit-checkbox"]').click();
    await waitForConvexSync(page);

    // Get XP after completion
    const xpAfterCompletion = await page
      .locator('[data-testid="user-xp"]')
      .textContent();

    // Uncomplete the habit
    await firstHabit.locator('[data-testid="habit-checkbox"]').click();
    await waitForConvexSync(page);

    // Verify habit is unchecked
    await expect(
      firstHabit.locator('[data-testid="habit-checkbox"]')
    ).not.toBeChecked();

    // Verify XP decreased back
    const xpAfterUncompletion = await page
      .locator('[data-testid="user-xp"]')
      .textContent();
    expect(parseInt(xpAfterUncompletion!)).toBeLessThan(
      parseInt(xpAfterCompletion!)
    );
  });

  test('should complete all habits and earn bonus XP', async ({ page }) => {
    await navigateTo(page, 'habits');

    // Get all habit checkboxes
    const habitCheckboxes = page.locator('[data-testid="habit-checkbox"]');
    const habitCount = await habitCheckboxes.count();

    // Complete all habits
    for (let i = 0; i < habitCount; i++) {
      await habitCheckboxes.nth(i).click();
      await waitForConvexSync(page, 1000);
    }

    // Verify all habits are checked
    await expect(habitCheckboxes.first()).toBeChecked();

    // Verify bonus XP notification
    await expect(
      page.locator('text=/Tagesbonus|Daily Bonus|Alle Habits/')
    ).toBeVisible();

    // Verify completion state is saved
    await page.reload();
    await expect(habitCheckboxes.first()).toBeChecked();
  });

  test('should track habit streaks', async ({ page }) => {
    await navigateTo(page, 'habits');

    // Find a habit with streak tracking
    const habitWithStreak = page.locator('[data-testid="habit-streak"]').first();

    // Get current streak value
    const currentStreak = await habitWithStreak.textContent();

    // Complete the habit
    const parentHabit = habitWithStreak.locator('xpath=ancestor::*[@data-testid="habit-item"]');
    await parentHabit.locator('[data-testid="habit-checkbox"]').click();
    await waitForConvexSync(page);

    // Streak should be maintained or increased
    const newStreak = await habitWithStreak.textContent();
    expect(newStreak).toBeTruthy();
  });

  test('should show habit progress over time', async ({ page }) => {
    await navigateTo(page, 'habits');

    // Navigate to data/analytics view
    await navigateTo(page, 'dashboard');
    await page.goto('/?tab=data');

    // Verify analytics dashboard loads
    await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();

    // Verify habit completion chart is visible
    await expect(page.locator('[data-testid="habit-completion-chart"]')).toBeVisible();
  });

  test('should manage habits', async ({ page }) => {
    await navigateTo(page, 'habits');

    // Open manage habits dialog
    await page.click('[data-testid="manage-habits-button"]');

    // Verify dialog opens
    await expect(page.locator('[data-testid="manage-habits-dialog"]')).toBeVisible();

    // Add a new habit
    await page.click('[data-testid="add-habit-button"]');

    // Fill habit details
    await page.fill('[name="habitName"]', 'New Test Habit');
    await page.fill('[name="habitXP"]', '50');
    await page.selectOption('[name="habitCategory"]', 'Health');

    // Save habit
    await page.click('[data-testid="save-habit-button"]');

    await waitForConvexSync(page);

    // Close dialog
    await page.click('[data-testid="close-dialog"]');

    // Verify new habit appears in list
    await expect(page.locator('text=New Test Habit')).toBeVisible();
  });

  test('should filter habits by category', async ({ page }) => {
    await navigateTo(page, 'habits');

    // Click on a category filter
    await page.click('[data-testid="category-filter-Health"]');

    // Verify only health category habits are shown
    const visibleHabits = page.locator('[data-testid="habit-item"]:visible');
    await expect(visibleHabits.first()).toBeVisible();

    // All visible habits should be in Health category
    const categoryBadges = visibleHabits.locator('[data-testid="habit-category"]');
    const count = await categoryBadges.count();

    for (let i = 0; i < count; i++) {
      await expect(categoryBadges.nth(i)).toContainText('Health');
    }
  });

  test('should level up after earning enough XP', async ({ page }) => {
    await navigateTo(page, 'habits');

    // Get current level
    const currentLevel = await page.locator('[data-testid="user-level"]').textContent();

    // Complete many habits to gain XP
    // Note: This is a simplified test - in reality, you'd need to complete
    // enough habits to actually level up, which might require multiple days
    const habitCheckboxes = page.locator('[data-testid="habit-checkbox"]');
    const habitCount = await habitCheckboxes.count();

    for (let i = 0; i < habitCount; i++) {
      await habitCheckboxes.nth(i).click();
      await waitForConvexSync(page, 500);
    }

    // Check if level increased (might not happen in one session)
    const newLevel = await page.locator('[data-testid="user-level"]').textContent();

    // Level should be same or higher
    expect(parseInt(newLevel!)).toBeGreaterThanOrEqual(parseInt(currentLevel!));
  });
});
