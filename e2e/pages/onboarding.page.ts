/**
 * Page Object Model: Onboarding
 *
 * Encapsulates the onboarding wizard UI and interactions
 */

import { Page, expect } from '@playwright/test';
import { waitForConvexSync } from '../utils/convex-helpers';

export class OnboardingPage {
  constructor(private page: Page) {}

  /**
   * Navigate to the onboarding page
   */
  async goto() {
    await this.page.goto('/setup');
    await expect(this.page.locator('h1')).toContainText('Willkommen');
  }

  /**
   * Click the "Get Started" button on welcome screen
   */
  async clickGetStarted() {
    await this.page.click('button:has-text("Los geht\'s")');
    await this.page.waitForTimeout(500);
  }

  /**
   * Fill in the "About You" step
   */
  async fillAboutYou(data: { name: string; role: string; mainProject: string }) {
    await expect(this.page.locator('h2')).toContainText('Über dich');

    await this.page.fill('[name="name"]', data.name);
    await this.page.fill('[name="role"]', data.role);
    await this.page.fill('[name="mainProject"]', data.mainProject);
  }

  /**
   * Fill in the North Stars step
   */
  async fillNorthStars(northStars: {
    wealth: string;
    health: string;
    love: string;
    happiness: string;
  }) {
    await expect(this.page.locator('h2')).toContainText('North Stars');

    await this.page.fill('[name="northStars.wealth"]', northStars.wealth);
    await this.page.fill('[name="northStars.health"]', northStars.health);
    await this.page.fill('[name="northStars.love"]', northStars.love);
    await this.page.fill('[name="northStars.happiness"]', northStars.happiness);
  }

  /**
   * Add milestones for each area
   */
  async addMilestones(milestones: {
    wealth: string[];
    health: string[];
    love: string[];
    happiness: string[];
  }) {
    await expect(this.page.locator('h2')).toContainText('Milestones');

    for (const area of ['wealth', 'health', 'love', 'happiness'] as const) {
      const areaMilestones = milestones[area];

      for (const milestone of areaMilestones) {
        await this.page.fill(`[name="milestone-${area}"]`, milestone);
        await this.page.click(`button[data-testid="add-milestone-${area}"]`);
        await this.page.waitForTimeout(200);
      }
    }
  }

  /**
   * Skip the tracking fields step (use defaults)
   */
  async skipTracking() {
    await expect(this.page.locator('h2')).toContainText('Tracking');
    // Just click next to use defaults
  }

  /**
   * Select coach tone
   */
  async selectCoachTone(tone: string) {
    await expect(this.page.locator('h2')).toContainText('Coach');
    await this.page.click(`[data-testid="coach-tone-${tone}"]`);
  }

  /**
   * Click Next button
   */
  async clickNext() {
    await this.page.click('button:has-text("Weiter")');
    await this.page.waitForTimeout(500);
  }

  /**
   * Click Back button
   */
  async clickBack() {
    await this.page.click('button:has-text("Zurück")');
    await this.page.waitForTimeout(500);
  }

  /**
   * Complete the setup
   */
  async completeSetup() {
    await this.page.click('button:has-text("Setup abschließen")');
    await waitForConvexSync(this.page, 5000);
  }

  /**
   * Click to go to dashboard from completion screen
   */
  async goToDashboard() {
    await expect(this.page.locator('h2')).toContainText('Bereit');
    await this.page.click('button:has-text("Dashboard")');
    await expect(this.page).toHaveURL('/');
  }

  /**
   * Complete full onboarding flow
   */
  async completeFullOnboarding(data: {
    name: string;
    role: string;
    mainProject: string;
    northStars: {
      wealth: string;
      health: string;
      love: string;
      happiness: string;
    };
    milestones: {
      wealth: string[];
      health: string[];
      love: string[];
      happiness: string[];
    };
    coachTone: string;
  }) {
    await this.goto();

    // Step 1: Welcome
    await this.clickGetStarted();

    // Step 2: About You
    await this.fillAboutYou({
      name: data.name,
      role: data.role,
      mainProject: data.mainProject,
    });
    await this.clickNext();

    // Step 3: North Stars
    await this.fillNorthStars(data.northStars);
    await this.clickNext();

    // Step 4: Milestones
    await this.addMilestones(data.milestones);
    await this.clickNext();

    // Step 5: Tracking (skip)
    await this.skipTracking();
    await this.clickNext();

    // Step 6: Coach
    await this.selectCoachTone(data.coachTone);
    await this.completeSetup();

    // Step 7: Done
    await this.goToDashboard();
  }

  /**
   * Verify onboarding step is displayed
   */
  async verifyStep(stepNumber: number, expectedTitle: string) {
    const heading = this.page.locator('h2');
    await expect(heading).toContainText(expectedTitle);
  }

  /**
   * Verify validation errors are shown
   */
  async verifyValidationErrors() {
    await expect(this.page.locator('text=erforderlich')).toBeVisible();
  }
}
