import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { waitForElement, fillAndVerify, clickAndNavigate } from './helpers';

/**
 * Page Object Models for consistent test interactions
 */

/**
 * Base Page Object
 */
export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string = '/') {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle() {
    return this.page.title();
  }

  async waitForUrl(url: string | RegExp) {
    await this.page.waitForURL(url);
  }
}

/**
 * Habits Page Object
 */
export class HabitsPage extends BasePage {
  // Selectors
  private readonly habitsList = '[data-testid="habits-list"]';
  private readonly addHabitButton = '[data-testid="add-habit-button"]';
  private readonly habitItem = '[data-testid="habit-item"]';
  private readonly completeHabitButton = '[data-testid="complete-habit"]';
  private readonly skipHabitButton = '[data-testid="skip-habit"]';
  private readonly manageHabitsButton = '[data-testid="manage-habits"]';

  async goto() {
    await super.goto('/habits');
  }

  async getHabitByName(name: string): Promise<Locator> {
    return this.page.locator(this.habitItem).filter({ hasText: name });
  }

  async completeHabit(habitName: string) {
    const habit = await this.getHabitByName(habitName);
    await habit.locator(this.completeHabitButton).click();
  }

  async skipHabit(habitName: string) {
    const habit = await this.getHabitByName(habitName);
    await habit.locator(this.skipHabitButton).click();
  }

  async isHabitCompleted(habitName: string): Promise<boolean> {
    const habit = await this.getHabitByName(habitName);
    const completedClass = await habit.getAttribute('class');
    return completedClass?.includes('completed') || false;
  }

  async openManageHabits() {
    await this.page.click(this.manageHabitsButton);
    await this.page.waitForSelector('[data-testid="manage-habits-dialog"]', {
      state: 'visible',
    });
  }

  async addHabit(habitData: {
    name: string;
    category?: string;
    timeOfDay?: string;
  }) {
    await this.page.click(this.addHabitButton);

    await fillAndVerify(
      this.page,
      'input[name="name"], input[placeholder*="habit name" i]',
      habitData.name
    );

    if (habitData.category) {
      await this.page.click('select[name="category"]');
      await this.page.click(`option:has-text("${habitData.category}")`);
    }

    if (habitData.timeOfDay) {
      await this.page.click('select[name="timeOfDay"]');
      await this.page.click(`option:has-text("${habitData.timeOfDay}")`);
    }

    await this.page.click('button:has-text("Create"), button[type="submit"]');
    await this.page.waitForLoadState('networkidle');
  }

  async getHabitCount(): Promise<number> {
    const habits = await this.page.locator(this.habitItem).all();
    return habits.length;
  }
}

/**
 * Daily Log Page Object
 */
export class DailyLogPage extends BasePage {
  private readonly gratitudeInput = 'textarea[name="gratitude"]';
  private readonly winsInput = 'textarea[name="wins"]';
  private readonly challengesInput = 'textarea[name="challenges"]';
  private readonly learningsInput = 'textarea[name="learnings"]';
  private readonly energySlider = 'input[name="energy"]';
  private readonly moodSelect = 'select[name="mood"]';
  private readonly submitButton = 'button:has-text("Submit"), button[type="submit"]';

  async goto() {
    await super.goto('/daily-log');
  }

  async fillDailyLog(data: {
    gratitude: string;
    wins: string;
    challenges: string;
    learnings: string;
    energy?: number;
    mood?: string;
  }) {
    await fillAndVerify(this.page, this.gratitudeInput, data.gratitude);
    await fillAndVerify(this.page, this.winsInput, data.wins);
    await fillAndVerify(this.page, this.challengesInput, data.challenges);
    await fillAndVerify(this.page, this.learningsInput, data.learnings);

    if (data.energy !== undefined) {
      await this.page.fill(this.energySlider, data.energy.toString());
    }

    if (data.mood) {
      await this.page.selectOption(this.moodSelect, data.mood);
    }
  }

  async submit() {
    await this.page.click(this.submitButton);
    await this.page.waitForLoadState('networkidle');
  }

  async isSubmitSuccessful(): Promise<boolean> {
    // Look for success message or redirect
    const hasSuccessMessage = await this.page
      .locator('text=/submitted|success/i')
      .isVisible()
      .catch(() => false);

    return hasSuccessMessage;
  }
}

/**
 * Review Form Page Object
 */
export class ReviewFormPage extends BasePage {
  private readonly submitButton = 'button:has-text("Submit"), button[type="submit"]';

  async fillWeeklyReview(data: {
    weekHighlight: string;
    progressTowardGoals: string;
    challengesFaced: string;
    lessonsLearned: string;
    nextWeekFocus: string;
    rating?: number;
  }) {
    await fillAndVerify(
      this.page,
      'textarea[name="weekHighlight"]',
      data.weekHighlight
    );
    await fillAndVerify(
      this.page,
      'textarea[name="progressTowardGoals"]',
      data.progressTowardGoals
    );
    await fillAndVerify(
      this.page,
      'textarea[name="challengesFaced"]',
      data.challengesFaced
    );
    await fillAndVerify(
      this.page,
      'textarea[name="lessonsLearned"]',
      data.lessonsLearned
    );
    await fillAndVerify(
      this.page,
      'textarea[name="nextWeekFocus"]',
      data.nextWeekFocus
    );

    if (data.rating !== undefined) {
      await this.page.fill('input[name="rating"]', data.rating.toString());
    }
  }

  async fillMonthlyReview(data: {
    monthHighlight: string;
    majorAccomplishments: string;
    challengesFaced: string;
    lessonsLearned: string;
    nextMonthGoals: string;
    rating?: number;
  }) {
    await fillAndVerify(
      this.page,
      'textarea[name="monthHighlight"]',
      data.monthHighlight
    );
    await fillAndVerify(
      this.page,
      'textarea[name="majorAccomplishments"]',
      data.majorAccomplishments
    );
    await fillAndVerify(
      this.page,
      'textarea[name="challengesFaced"]',
      data.challengesFaced
    );
    await fillAndVerify(
      this.page,
      'textarea[name="lessonsLearned"]',
      data.lessonsLearned
    );
    await fillAndVerify(
      this.page,
      'textarea[name="nextMonthGoals"]',
      data.nextMonthGoals
    );

    if (data.rating !== undefined) {
      await this.page.fill('input[name="rating"]', data.rating.toString());
    }
  }

  async submit() {
    await this.page.click(this.submitButton);
    await this.page.waitForLoadState('networkidle');
  }

  async isSubmitSuccessful(): Promise<boolean> {
    const hasSuccessMessage = await this.page
      .locator('text=/submitted|success|saved/i')
      .isVisible()
      .catch(() => false);

    return hasSuccessMessage;
  }
}

/**
 * Coach Panel Page Object
 */
export class CoachPanel extends BasePage {
  private readonly toggleButton = '[data-testid="coach-toggle"]';
  private readonly panel = '[data-testid="coach-panel"]';
  private readonly messageInput = '[data-testid="coach-message-input"]';
  private readonly sendButton = '[data-testid="coach-send-button"]';
  private readonly messagesContainer = '[data-testid="coach-messages"]';

  async open() {
    await this.page.click(this.toggleButton);
    await waitForElement(this.page, this.panel);
  }

  async close() {
    await this.page.click(this.toggleButton);
    await this.page.waitForSelector(this.panel, { state: 'hidden' });
  }

  async sendMessage(message: string) {
    await this.page.fill(this.messageInput, message);
    await this.page.click(this.sendButton);
    await this.page.waitForLoadState('networkidle');
  }

  async getLastMessage(): Promise<string> {
    const messages = this.page.locator(`${this.messagesContainer} > *`);
    const count = await messages.count();
    if (count === 0) return '';
    return messages.nth(count - 1).textContent() || '';
  }

  async isOpen(): Promise<boolean> {
    return this.page.locator(this.panel).isVisible();
  }
}

/**
 * Settings Modal Page Object
 */
export class SettingsModal extends BasePage {
  private readonly openButton = '[data-testid="settings-button"]';
  private readonly modal = '[data-testid="settings-modal"]';
  private readonly saveButton = 'button:has-text("Save")';
  private readonly closeButton = '[data-testid="close-settings"]';

  async open() {
    await this.page.click(this.openButton);
    await waitForElement(this.page, this.modal);
  }

  async close() {
    await this.page.click(this.closeButton);
    await this.page.waitForSelector(this.modal, { state: 'hidden' });
  }

  async updateSetting(name: string, value: string | boolean) {
    if (typeof value === 'boolean') {
      const checkbox = this.page.locator(`input[name="${name}"]`);
      const isChecked = await checkbox.isChecked();
      if (isChecked !== value) {
        await checkbox.click();
      }
    } else {
      await fillAndVerify(this.page, `input[name="${name}"]`, value);
    }
  }

  async save() {
    await this.page.click(this.saveButton);
    await this.page.waitForLoadState('networkidle');
  }
}
