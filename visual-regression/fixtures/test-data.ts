/**
 * Test data fixtures for visual regression tests
 * Provides consistent data for repeatable screenshot comparisons
 */

export const TEST_USER = {
  email: 'test@example.com',
  name: 'Test User',
};

export const MOCK_HABITS = [
  {
    id: 'habit-1',
    title: 'Morning Meditation',
    category: 'Wellness',
    streak: 15,
    completed: false,
    timeBlock: '06:00',
  },
  {
    id: 'habit-2',
    title: 'Exercise',
    category: 'Health',
    streak: 7,
    completed: true,
    timeBlock: '07:00',
  },
  {
    id: 'habit-3',
    title: 'Read for 30 minutes',
    category: 'Learning',
    streak: 22,
    completed: false,
    timeBlock: '21:00',
  },
];

export const MOCK_GOALS = [
  {
    id: 'goal-1',
    title: 'Launch new project',
    progress: 65,
    dueDate: '2026-03-01',
  },
  {
    id: 'goal-2',
    title: 'Complete certification',
    progress: 40,
    dueDate: '2026-04-15',
  },
];

export const MOCK_REVIEW_DATA = {
  weekly: {
    wins: ['Completed all morning routines', 'Finished project milestone'],
    challenges: ['Struggled with time management on Thursday'],
    insights: ['Morning routine sets positive tone for the day'],
  },
  monthly: {
    goals: ['Increase meditation streak', 'Launch side project'],
    achievements: ['30-day exercise streak', 'Read 3 books'],
    areasForImprovement: ['Better evening routine'],
  },
};

/**
 * Wait for page to be in a stable state for screenshots
 */
export async function waitForPageStable(page: any) {
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');

  // Wait for any animations to complete
  await page.waitForTimeout(500);

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
}

/**
 * Hide dynamic content that changes on every render
 */
export async function hideDynamicContent(page: any) {
  await page.addStyleTag({
    content: `
      /* Hide elements that change frequently */
      [data-testid="current-time"],
      [data-testid="dynamic-date"],
      .animated-counter,
      .loading-spinner {
        visibility: hidden !important;
      }

      /* Disable animations for consistent screenshots */
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
 * Set a consistent date/time for tests
 */
export async function setTestDateTime(page: any) {
  // Set a fixed date for consistent screenshots
  const testDate = new Date('2026-02-06T10:00:00Z');

  await page.addInitScript(`
    Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          super(${testDate.getTime()});
        } else {
          super(...args);
        }
      }

      static now() {
        return ${testDate.getTime()};
      }
    }
  `);
}
