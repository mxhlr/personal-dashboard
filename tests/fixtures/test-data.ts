/**
 * Test data for integration tests
 */

export const testHabit = {
  name: 'Test Meditation Habit',
  category: 'Wellness',
  timeOfDay: 'morning' as const,
  difficulty: 'medium' as const,
};

export const testDailyLog = {
  gratitude: 'Test gratitude entry for automated testing',
  wins: 'Successfully completed automated test',
  challenges: 'Setting up test infrastructure',
  learnings: 'Playwright is a powerful testing framework',
  energy: 7,
  mood: 'focused' as const,
};

export const testWeeklyReview = {
  weekHighlight: 'Test week highlight',
  progressTowardGoals: 'Making good progress on test automation',
  challengesFaced: 'Learning Playwright and test patterns',
  lessonsLearned: 'Testing is crucial for quality',
  nextWeekFocus: 'Complete all integration tests',
  rating: 8,
};

export const testMonthlyReview = {
  monthHighlight: 'Test month highlight',
  majorAccomplishments: 'Set up comprehensive testing suite',
  challengesFaced: 'Learning curve with Playwright',
  lessonsLearned: 'Invest in testing early',
  nextMonthGoals: 'Expand test coverage',
  rating: 9,
};

export const testQuarterlyReview = {
  quarterHighlight: 'Test quarter highlight',
  majorMilestones: 'Launched personal dashboard with testing',
  keyInsights: 'Quality matters more than speed',
  areasForImprovement: 'Test coverage and documentation',
  nextQuarterOKRs: 'Achieve 90% test coverage',
  rating: 8,
};

export const testSettings = {
  displayName: 'Test User',
  email: 'testuser@example.com',
  notifications: {
    dailyReminder: true,
    weeklyReview: true,
    monthlyReview: false,
  },
};

/**
 * Helper to generate unique test data
 */
export function generateUniqueTestData<T extends Record<string, any>>(
  base: T,
  suffix: string = Date.now().toString()
): T {
  const result = { ...base } as T & { name?: string };
  if ('name' in result && typeof result.name === 'string') {
    result.name = `${result.name} ${suffix}`;
  }
  return result as T;
}
