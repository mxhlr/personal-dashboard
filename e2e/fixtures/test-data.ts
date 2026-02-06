/**
 * Test Data Constants
 *
 * Centralized test data used across E2E tests
 */

export const TEST_USER = {
  name: 'Test User',
  email: process.env.TEST_USER_EMAIL || 'e2e-test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'Test123!@#',
  role: 'Software Developer',
  mainProject: 'Personal Dashboard E2E Tests',
};

export const TEST_NORTH_STARS = {
  wealth: 'Build a successful SaaS product generating $100k MRR',
  health: 'Maintain optimal fitness and energy levels through consistent exercise',
  love: 'Build deep, meaningful relationships with family and friends',
  happiness: 'Find joy in daily practices and continuous personal growth',
};

export const TEST_MILESTONES = {
  wealth: [
    'Launch MVP and get first 10 paying customers',
    'Reach $10k MRR milestone',
    'Build automated marketing funnel',
    'Hire first team member',
  ],
  health: [
    'Exercise 5 days per week consistently',
    'Run a half marathon',
    'Meal prep healthy foods weekly',
    'Get 8 hours of sleep nightly',
  ],
  love: [
    'Schedule weekly date nights',
    'Plan quarterly family trips',
    'Host monthly friend gatherings',
    'Daily gratitude practice for loved ones',
  ],
  happiness: [
    'Practice daily meditation',
    'Learn a new skill each quarter',
    'Journal weekly reflections',
    'Volunteer monthly in community',
  ],
};

export const TEST_COACH_TONE = 'Direkt';

export const TEST_HABITS = [
  {
    name: 'Morning Exercise',
    xp: 50,
    category: 'Health',
    description: 'Complete 30 minutes of exercise',
  },
  {
    name: 'Meditation',
    xp: 30,
    category: 'Mental',
    description: '10 minutes of mindful meditation',
  },
  {
    name: 'Deep Work Session',
    xp: 75,
    category: 'Work',
    description: '90 minutes of focused work',
  },
  {
    name: 'Reading',
    xp: 40,
    category: 'Growth',
    description: 'Read for 20 minutes',
  },
  {
    name: 'Gratitude Journal',
    xp: 25,
    category: 'Happiness',
    description: 'Write 3 things you\'re grateful for',
  },
];

export const TEST_HABIT_CATEGORIES = [
  { name: 'Health', icon: '💪', color: '#22c55e' },
  { name: 'Mental', icon: '🧠', color: '#3b82f6' },
  { name: 'Work', icon: '💼', color: '#f59e0b' },
  { name: 'Growth', icon: '📚', color: '#8b5cf6' },
  { name: 'Happiness', icon: '😊', color: '#ec4899' },
];

export const TEST_VISIONBOARD_LISTS = [
  {
    name: 'Career Goals',
    items: [
      {
        title: 'Launch SaaS Product',
        description: 'Build and launch a successful SaaS application',
        imageUrl: null,
      },
      {
        title: 'Speak at Conference',
        description: 'Give a tech talk at a major conference',
        imageUrl: null,
      },
    ],
  },
  {
    name: 'Personal Growth',
    items: [
      {
        title: 'Learn Spanish',
        description: 'Achieve conversational fluency in Spanish',
        imageUrl: null,
      },
      {
        title: 'Complete Marathon',
        description: 'Run a full 26.2 mile marathon',
        imageUrl: null,
      },
    ],
  },
];

export const TEST_WEEKLY_REVIEW = {
  highlights: [
    'Completed all daily habits for 5 days',
    'Launched new feature at work',
    'Had meaningful conversation with mentor',
  ],
  challenges: [
    'Struggled with time management',
    'Skipped workouts on weekend',
  ],
  insights: 'Need to protect my morning routine better, especially on weekends.',
  nextWeekFocus: 'Focus on consistent morning routine and prepare for upcoming product launch.',
};

export const TEST_GOAL = {
  title: 'Launch MVP',
  description: 'Build and launch minimum viable product for new SaaS idea',
  targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
  area: 'wealth',
  keyResults: [
    { description: 'Complete user research with 20 potential customers', target: 20, current: 5 },
    { description: 'Build and deploy core features', target: 100, current: 30 },
    { description: 'Get 10 beta users', target: 10, current: 0 },
  ],
};

export const EXPECTED_XP_VALUES = {
  HABIT_COMPLETION: 50,
  DAILY_BONUS: 100,
  WEEKLY_REVIEW: 200,
  MONTHLY_REVIEW: 500,
};

export const EXPECTED_LEVELS = {
  LEVEL_1: 0,
  LEVEL_2: 500,
  LEVEL_3: 1500,
  LEVEL_4: 3000,
  LEVEL_5: 5000,
};
