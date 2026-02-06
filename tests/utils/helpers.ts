import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Utility functions for Playwright tests
 */

/**
 * Wait for an element to be visible and stable
 */
export async function waitForElement(
  page: Page,
  selector: string,
  options?: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' }
): Promise<Locator> {
  const element = page.locator(selector);
  await element.waitFor({ ...options, state: options?.state || 'visible' });
  return element;
}

/**
 * Fill a form field and verify the value
 */
export async function fillAndVerify(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  await page.fill(selector, value);
  const actualValue = await page.inputValue(selector);
  expect(actualValue).toBe(value);
}

/**
 * Click and wait for navigation
 */
export async function clickAndNavigate(
  page: Page,
  selector: string,
  waitForUrl?: string | RegExp
): Promise<void> {
  await Promise.all([
    waitForUrl ? page.waitForURL(waitForUrl) : page.waitForLoadState('networkidle'),
    page.click(selector),
  ]);
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  action: () => Promise<void>
): Promise<any> {
  const responsePromise = page.waitForResponse(
    (response) =>
      typeof urlPattern === 'string'
        ? response.url().includes(urlPattern)
        : urlPattern.test(response.url())
  );

  await action();

  const response = await responsePromise;
  return response.json();
}

/**
 * Take a screenshot with a meaningful name
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  options?: { fullPage?: boolean }
): Promise<void> {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: options?.fullPage || false,
  });
}

/**
 * Scroll to element
 */
export async function scrollToElement(
  page: Page,
  selector: string
): Promise<void> {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Wait for element to contain text
 */
export async function waitForText(
  page: Page,
  selector: string,
  text: string | RegExp,
  options?: { timeout?: number }
): Promise<void> {
  await page.locator(selector).filter({ hasText: text }).waitFor({
    state: 'visible',
    timeout: options?.timeout || 10000,
  });
}

/**
 * Clear and fill input
 */
export async function clearAndFill(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  await page.locator(selector).clear();
  await page.locator(selector).fill(value);
  await page.waitForTimeout(100); // Small delay to ensure the value is set
}

/**
 * Select dropdown option by label
 */
export async function selectByLabel(
  page: Page,
  selector: string,
  label: string
): Promise<void> {
  await page.locator(selector).click();
  await page.locator(`[role="option"]:has-text("${label}")`).click();
}

/**
 * Check if element is visible
 */
export async function isVisible(
  page: Page,
  selector: string
): Promise<boolean> {
  try {
    await page.locator(selector).waitFor({ state: 'visible', timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for loading to complete
 */
export async function waitForLoading(
  page: Page,
  options?: { timeout?: number }
): Promise<void> {
  // Wait for any loading spinners to disappear
  await page.waitForSelector('[data-testid="loading"], [aria-busy="true"]', {
    state: 'hidden',
    timeout: options?.timeout || 10000,
  }).catch(() => {
    // Ignore if no loading indicator found
  });

  await page.waitForLoadState('networkidle');
}

/**
 * Retry an action until it succeeds or times out
 */
export async function retry<T>(
  action: () => Promise<T>,
  options?: {
    retries?: number;
    delay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  }
): Promise<T> {
  const retries = options?.retries || 3;
  const delay = options?.delay || 1000;

  for (let i = 0; i < retries; i++) {
    try {
      return await action();
    } catch (error) {
      if (i === retries - 1) throw error;
      if (options?.onRetry) {
        options.onRetry(i + 1, error as Error);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Retry failed');
}
