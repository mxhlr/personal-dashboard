/**
 * Convex Database Helpers for E2E Tests
 *
 * Utilities for interacting with Convex backend during tests
 */

import { Page } from '@playwright/test';

export class ConvexHelper {
  constructor(private page: Page) {}

  /**
   * Wait for a Convex query to return a specific result
   */
  async waitForQuery(queryName: string, expectedResult: any, timeout = 10000) {
    // Wait for the query result to match expected
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const result = await this.page.evaluate(
        async (qName) => {
          // Access Convex client from window (if exposed)
          // This is a simplified example
          return (window as any).__convexQueryResults?.[qName];
        },
        queryName
      );

      if (JSON.stringify(result) === JSON.stringify(expectedResult)) {
        return;
      }

      // Wait a bit before checking again
      await this.page.waitForTimeout(100);
    }

    throw new Error(`Query ${queryName} did not return expected result within ${timeout}ms`);
  }

  /**
   * Wait for a Convex mutation to complete
   */
  async waitForMutation(mutationName: string, timeout = 10000) {
    // Listen for network responses that match the mutation
    const responsePromise = this.page.waitForResponse(
      (response) => {
        const url = response.url();
        return url.includes('/api/mutations') && url.includes(mutationName);
      },
      { timeout }
    );

    await responsePromise;
  }

  /**
   * Wait for real-time update
   */
  async waitForRealtimeUpdate(timeout = 5000) {
    // Wait for Convex websocket messages
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Get current user stats from page context
   */
  async getUserStats() {
    return await this.page.evaluate(() => {
      // This would access the Convex client state
      return (window as any).__userStats || { xp: 0, level: 1, streak: 0 };
    });
  }

  /**
   * Verify data persisted to Convex
   */
  async verifyDataPersisted(tableName: string, condition: (data: any) => boolean) {
    // Poll the page state to verify data
    const startTime = Date.now();
    const timeout = 10000;

    while (Date.now() - startTime < timeout) {
      const data = await this.page.evaluate(
        (table) => (window as any).__convexData?.[table],
        tableName
      );

      if (data && condition(data)) {
        return true;
      }

      await this.page.waitForTimeout(100);
    }

    throw new Error(`Data in ${tableName} did not match condition within ${timeout}ms`);
  }
}

/**
 * Wait for Convex to sync data
 */
export async function waitForConvexSync(page: Page, timeout = 3000) {
  // Wait for any pending mutations to complete
  await page.waitForLoadState('networkidle', { timeout });

  // Additional buffer for Convex real-time sync
  await page.waitForTimeout(500);
}

/**
 * Intercept and log Convex mutations for debugging
 */
export async function logConvexMutations(page: Page) {
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('/api/mutations')) {
      console.log('Convex Mutation:', request.method(), url);
    }
  });

  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('/api/mutations')) {
      console.log('Mutation Response:', response.status(), url);
    }
  });
}
