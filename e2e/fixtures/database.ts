/**
 * Database Seeding and Cleanup for E2E Tests
 *
 * Utilities for managing test data in Convex database
 */

import { TEST_USER, TEST_HABITS, TEST_HABIT_CATEGORIES } from './test-data';

/**
 * Seed the database with test data
 */
export async function seedDatabase() {
  // In a real implementation, this would:
  // 1. Call Convex mutations to insert test data
  // 2. Create test user profile
  // 3. Set up habit categories and templates
  // 4. Initialize gamification stats

  console.log('Seeding database with test data...');

  // Note: This is a placeholder. Actual implementation would use
  // Convex client or API calls to seed data

  // Example of what this might look like:
  // const convexClient = new ConvexClient(process.env.CONVEX_URL!);
  // await convexClient.mutation(api.userProfile.createUserProfile, {
  //   name: TEST_USER.name,
  //   role: TEST_USER.role,
  //   mainProject: TEST_USER.mainProject,
  //   ...
  // });
}

/**
 * Clean up test data from database
 */
export async function cleanupDatabase() {
  console.log('Cleaning up test data...');

  // In a real implementation, this would:
  // 1. Delete all test user data
  // 2. Remove habit completions
  // 3. Clear gamification stats
  // 4. Reset to clean state

  // Note: This is a placeholder. Actual implementation would use
  // Convex client or API calls to delete test data
}

/**
 * Reset user to fresh state (no onboarding completed)
 */
export async function resetUserToOnboarding() {
  console.log('Resetting user to onboarding state...');

  // In a real implementation, this would:
  // 1. Delete user profile
  // 2. Keep authentication but remove all user data
  // 3. Force user back to setup flow
}

/**
 * Create a user with completed onboarding
 */
export async function createUserWithOnboarding() {
  console.log('Creating user with completed onboarding...');

  // In a real implementation, this would:
  // 1. Create user profile with all required fields
  // 2. Set setupCompleted = true
  // 3. Create initial habit categories and templates
  // 4. Initialize gamification stats
}

/**
 * Get test user data from database
 */
export async function getTestUserData() {
  // In a real implementation, this would query the database
  // and return the current user data

  return {
    userId: 'test-user-id',
    setupCompleted: false,
    xp: 0,
    level: 1,
  };
}

/**
 * Verify database state matches expected
 */
export async function verifyDatabaseState(expected: any) {
  console.log('Verifying database state...', expected);

  // In a real implementation, this would:
  // 1. Query database for actual state
  // 2. Compare with expected state
  // 3. Throw error if mismatch
}
