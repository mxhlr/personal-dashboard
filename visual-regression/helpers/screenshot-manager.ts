/**
 * Screenshot Manager Helper
 * Utilities for managing visual regression test screenshots
 */

import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export class ScreenshotManager {
  private page: Page;
  private baseDir: string;

  constructor(page: Page) {
    this.page = page;
    this.baseDir = path.join(__dirname, '..');
  }

  /**
   * Take a screenshot with automatic naming based on test context
   */
  async capture(
    name: string,
    options?: {
      fullPage?: boolean;
      selector?: string;
      mask?: string[];
    }
  ) {
    const screenshotOptions = {
      fullPage: options?.fullPage ?? false,
      animations: 'disabled' as const,
    };

    if (options?.selector) {
      const element = await this.page.locator(options.selector);
      return await element.screenshot({ path: `screenshots/${name}.png` });
    }

    return await this.page.screenshot({
      ...screenshotOptions,
      path: `screenshots/${name}.png`,
    });
  }

  /**
   * Prepare page for consistent screenshots
   */
  async preparePage() {
    // Wait for page to be stable
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);

    // Wait for fonts to load
    await this.page.evaluate(() => document.fonts.ready);

    // Disable animations
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });
  }

  /**
   * Mask dynamic elements
   */
  async maskDynamicElements(selectors: string[]) {
    for (const selector of selectors) {
      await this.page.addStyleTag({
        content: `
          ${selector} {
            visibility: hidden !important;
          }
        `,
      });
    }
  }

  /**
   * Compare two screenshots
   */
  static async compareScreenshots(
    baseline: string,
    current: string
  ): Promise<boolean> {
    // This would use an image comparison library
    // For now, just check if files exist
    return fs.existsSync(baseline) && fs.existsSync(current);
  }

  /**
   * Clean up old screenshots
   */
  static async cleanupOldScreenshots(daysOld: number = 7) {
    const screenshotsDir = path.join(__dirname, '..', 'screenshots');

    if (!fs.existsSync(screenshotsDir)) {
      return;
    }

    const files = fs.readdirSync(screenshotsDir);
    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(screenshotsDir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
      }
    }
  }

  /**
   * Get screenshot diff report
   */
  static getScreenshotReport(testResultsPath: string): string {
    const reportPath = path.join(testResultsPath, 'html-report', 'index.html');

    if (fs.existsSync(reportPath)) {
      return reportPath;
    }

    return '';
  }
}

/**
 * Utility to wait for all images to load
 */
export async function waitForImages(page: Page) {
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((resolve) => {
              img.onload = img.onerror = resolve;
            })
        )
    );
  });
}

/**
 * Utility to scroll to element smoothly
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
}

/**
 * Utility to hide specific elements
 */
export async function hideElements(page: Page, selectors: string[]) {
  for (const selector of selectors) {
    await page
      .locator(selector)
      .evaluateAll((elements) => {
        elements.forEach((el) => {
          (el as HTMLElement).style.visibility = 'hidden';
        });
      })
      .catch(() => {
        // Element might not exist, ignore
      });
  }
}

/**
 * Utility to set element text content
 */
export async function setElementText(
  page: Page,
  selector: string,
  text: string
) {
  await page.locator(selector).evaluateAll(
    (elements, txt) => {
      elements.forEach((el) => {
        el.textContent = txt;
      });
    },
    text
  );
}
