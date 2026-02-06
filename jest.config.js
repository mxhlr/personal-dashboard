const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test environment
  testEnvironment: 'jest-environment-jsdom',

  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Coverage configuration
  collectCoverageFrom: [
    'lib/performance.ts',
    'lib/utils.ts',
    'lib/constants/**/*.ts',
    'lib/errors/errorTypes.ts',
    'lib/errors/errorHandler.ts',
    'lib/validations/habitSchemas.ts',
    'lib/validations/profileSchemas.ts',
    'lib/validations/trackingSchemas.ts',
    'lib/validations/reviewSchemas.ts',
    '!lib/**/*.d.ts',
    '!lib/**/index.ts',
  ],

  // Coverage thresholds
  // Note: These apply only to files explicitly listed in collectCoverageFrom
  coverageThreshold: {
    global: {
      branches: 70, // Slightly lower due to complex conditional logic
      functions: 85,
      lines: 80,
      statements: 75,
    },
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/__tests__/utils/', // Ignore test utilities directory
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
