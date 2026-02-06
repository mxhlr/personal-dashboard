/**
 * E2E Tests: Full User Journey
 *
 * Complete end-to-end test of main user workflows using Page Object Model
 */

import { test, expect } from '@playwright/test';
import { setupAuth } from './fixtures/auth';
import { resetUserToOnboarding } from './fixtures/database';
import {
  TEST_USER,
  TEST_NORTH_STARS,
  TEST_MILESTONES,
  TEST_COACH_TONE,
  TEST_HABITS,
} from './fixtures/test-data';
import { OnboardingPage } from './pages/onboarding.page';
import { HabitsPage } from './pages/habits.page';

test.describe('Full User Journey', () => {
  test('complete user journey from onboarding to habit completion', async ({ page }) => {
    // Setup: Authenticate and reset to onboarding state
    await setupAuth(page);
    await resetUserToOnboarding();

    // ===== PHASE 1: Complete Onboarding =====
    const onboarding = new OnboardingPage(page);

    await onboarding.completeFullOnboarding({
      name: TEST_USER.name,
      role: TEST_USER.role,
      mainProject: TEST_USER.mainProject,
      northStars: TEST_NORTH_STARS,
      milestones: TEST_MILESTONES,
      coachTone: TEST_COACH_TONE,
    });

    // Verify landed on dashboard
    await expect(page).toHaveURL('/');
    await expect(page.locator('main')).toBeVisible();

    // ===== PHASE 2: Navigate to Habits =====
    const habits = new HabitsPage(page);
    await habits.goto();

    // Verify habits dashboard loaded
    await expect(habits.dashboard).toBeVisible();

    // ===== PHASE 3: Complete Some Habits =====
    const initialXP = await habits.getCurrentXP();

    // Complete first habit if available
    const habitCount = await habits.habitItems.count();

    if (habitCount > 0) {
      // Get first habit name
      const firstHabitName = await habits.habitItems
        .first()
        .locator('[data-testid="habit-name"]')
        .textContent();

      if (firstHabitName) {
        // Complete the habit
        await habits.completeHabit(firstHabitName);

        // Verify XP increased
        const newXP = await habits.getCurrentXP();
        expect(newXP).toBeGreaterThan(initialXP);

        // Verify XP notification
        await habits.verifyXPNotification();

        // Verify habit is marked complete
        await habits.verifyHabitCompleted(firstHabitName);
      }
    }

    // ===== PHASE 4: Test Habit Management =====
    // Add a new custom habit
    const customHabit = {
      name: 'E2E Test Habit',
      xp: 100,
      category: 'Health',
      description: 'Created during E2E test',
    };

    await habits.addHabit(customHabit);

    // Verify habit appears in list
    await expect(habits.getHabitByName(customHabit.name)).toBeVisible();

    // Complete the new habit
    await habits.completeHabit(customHabit.name);

    // Verify completion
    await habits.verifyHabitCompleted(customHabit.name);

    // ===== PHASE 5: Complete All Habits for Bonus =====
    const xpBeforeBonus = await habits.getCurrentXP();

    await habits.completeAllHabits();

    // Verify all habits complete
    await expect(habits.habitItems.first().locator('[data-testid="habit-checkbox"]')).toBeChecked();

    // Verify bonus notification
    await habits.verifyDailyBonus();

    // Verify XP increased significantly
    const xpAfterBonus = await habits.getCurrentXP();
    expect(xpAfterBonus).toBeGreaterThan(xpBeforeBonus);

    // ===== PHASE 6: Verify Persistence =====
    // Reload page
    await page.reload();

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify habits still completed
    await expect(habits.habitItems.first().locator('[data-testid="habit-checkbox"]')).toBeChecked();

    // Verify XP persisted
    const persistedXP = await habits.getCurrentXP();
    expect(persistedXP).toBe(xpAfterBonus);

    // ===== SUCCESS: Complete User Journey =====
    console.log('✓ Full user journey completed successfully!');
    console.log(`  - Onboarding: ✓`);
    console.log(`  - Habit completion: ✓`);
    console.log(`  - XP earning: ${persistedXP} XP`);
    console.log(`  - Data persistence: ✓`);
  });

  test('user journey with habit filtering and categories', async ({ page }) => {
    await setupAuth(page);

    const habits = new HabitsPage(page);
    await habits.goto();

    // Verify categories exist
    const categoryCount = await habits.habitCategories.count();
    expect(categoryCount).toBeGreaterThan(0);

    if (categoryCount > 0) {
      // Get first category name
      const firstCategory = await habits.habitCategories
        .first()
        .locator('[data-testid="category-name"]')
        .textContent();

      if (firstCategory) {
        // Filter by category
        await habits.filterByCategory(firstCategory);

        // Verify only habits from that category are shown
        const visibleHabits = habits.page.locator('[data-testid="habit-item"]:visible');
        const visibleCount = await visibleHabits.count();

        if (visibleCount > 0) {
          // All visible habits should be from the selected category
          for (let i = 0; i < visibleCount; i++) {
            const categoryBadge = visibleHabits
              .nth(i)
              .locator('[data-testid="habit-category"]');

            await expect(categoryBadge).toContainText(firstCategory);
          }
        }

        // Clear filter
        await habits.clearFilter();

        // Verify all habits shown again
        const allHabitsCount = await habits.habitItems.count();
        expect(allHabitsCount).toBeGreaterThanOrEqual(visibleCount);
      }
    }
  });

  test('user journey with streak tracking', async ({ page }) => {
    await setupAuth(page);

    const habits = new HabitsPage(page);
    await habits.goto();

    // Find habits with streak tracking
    const streakHabits = page.locator('[data-testid="habit-streak"]');
    const streakCount = await streakHabits.count();

    if (streakCount > 0) {
      // Get first habit with streak
      const habitWithStreak = streakHabits.first();
      const parentHabit = habitWithStreak.locator('xpath=ancestor::*[@data-testid="habit-item"]');

      const habitName = await parentHabit
        .locator('[data-testid="habit-name"]')
        .textContent();

      const initialStreak = await habits.getHabitStreak(habitName!);

      // Complete the habit
      await habits.completeHabit(habitName!);

      // Streak should be maintained or increased
      const newStreak = await habits.getHabitStreak(habitName!);
      expect(newStreak).toBeGreaterThanOrEqual(initialStreak);
    }
  });
});
