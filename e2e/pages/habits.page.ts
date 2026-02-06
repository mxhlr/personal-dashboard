/**
 * Page Object Model: Habits
 *
 * Encapsulates the habit dashboard UI and interactions
 */

import { Page, expect, Locator } from '@playwright/test';
import { waitForConvexSync } from '../utils/convex-helpers';

export class HabitsPage {
  readonly dashboard: Locator;
  readonly habitCategories: Locator;
  readonly habitItems: Locator;
  readonly manageHabitsButton: Locator;
  readonly userXP: Locator;
  readonly userLevel: Locator;

  constructor(private page: Page) {
    this.dashboard = page.locator('[data-testid="habit-dashboard"]');
    this.habitCategories = page.locator('[data-testid="habit-category"]');
    this.habitItems = page.locator('[data-testid="habit-item"]');
    this.manageHabitsButton = page.locator('[data-testid="manage-habits-button"]');
    this.userXP = page.locator('[data-testid="user-xp"]');
    this.userLevel = page.locator('[data-testid="user-level"]');
  }

  /**
   * Navigate to habits page
   */
  async goto() {
    await this.page.goto('/habits');
    await expect(this.dashboard).toBeVisible();
  }

  /**
   * Get habit by name
   */
  getHabitByName(name: string): Locator {
    return this.page.locator(`[data-testid="habit-item"]:has-text("${name}")`);
  }

  /**
   * Complete a habit by name
   */
  async completeHabit(name: string) {
    const habit = this.getHabitByName(name);
    await habit.locator('[data-testid="habit-checkbox"]').click();
    await waitForConvexSync(this.page);
  }

  /**
   * Uncomplete a habit by name
   */
  async uncompleteHabit(name: string) {
    const habit = this.getHabitByName(name);
    await habit.locator('[data-testid="habit-checkbox"]').click();
    await waitForConvexSync(this.page);
  }

  /**
   * Complete all habits
   */
  async completeAllHabits() {
    const checkboxes = this.page.locator('[data-testid="habit-checkbox"]');
    const count = await checkboxes.count();

    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).click();
      await waitForConvexSync(this.page, 1000);
    }
  }

  /**
   * Get current XP value
   */
  async getCurrentXP(): Promise<number> {
    const xpText = await this.userXP.textContent();
    return parseInt(xpText || '0');
  }

  /**
   * Get current level
   */
  async getCurrentLevel(): Promise<number> {
    const levelText = await this.userLevel.textContent();
    return parseInt(levelText || '1');
  }

  /**
   * Verify habit is completed
   */
  async verifyHabitCompleted(name: string) {
    const habit = this.getHabitByName(name);
    await expect(habit.locator('[data-testid="habit-checkbox"]')).toBeChecked();
  }

  /**
   * Verify habit is not completed
   */
  async verifyHabitNotCompleted(name: string) {
    const habit = this.getHabitByName(name);
    await expect(habit.locator('[data-testid="habit-checkbox"]')).not.toBeChecked();
  }

  /**
   * Open manage habits dialog
   */
  async openManageHabits() {
    await this.manageHabitsButton.click();
    await expect(this.page.locator('[data-testid="manage-habits-dialog"]')).toBeVisible();
  }

  /**
   * Add a new habit
   */
  async addHabit(data: { name: string; xp: number; category: string; description?: string }) {
    await this.openManageHabits();

    await this.page.click('[data-testid="add-habit-button"]');

    await this.page.fill('[name="habitName"]', data.name);
    await this.page.fill('[name="habitXP"]', data.xp.toString());
    await this.page.selectOption('[name="habitCategory"]', data.category);

    if (data.description) {
      await this.page.fill('[name="habitDescription"]', data.description);
    }

    await this.page.click('[data-testid="save-habit-button"]');
    await waitForConvexSync(this.page);

    // Close dialog
    await this.page.click('[data-testid="close-dialog"]');
  }

  /**
   * Filter habits by category
   */
  async filterByCategory(category: string) {
    await this.page.click(`[data-testid="category-filter-${category}"]`);
    await waitForConvexSync(this.page, 1000);
  }

  /**
   * Clear category filter
   */
  async clearFilter() {
    await this.page.click('[data-testid="clear-category-filter"]');
    await waitForConvexSync(this.page, 1000);
  }

  /**
   * Get habit streak value
   */
  async getHabitStreak(name: string): Promise<number> {
    const habit = this.getHabitByName(name);
    const streakText = await habit.locator('[data-testid="habit-streak"]').textContent();
    return parseInt(streakText || '0');
  }

  /**
   * Verify XP notification is shown
   */
  async verifyXPNotification() {
    await expect(this.page.locator('[data-testid="xp-notification"]')).toBeVisible();
  }

  /**
   * Verify daily bonus notification
   */
  async verifyDailyBonus() {
    await expect(this.page.locator('text=/Tagesbonus|Daily Bonus/')).toBeVisible();
  }
}
