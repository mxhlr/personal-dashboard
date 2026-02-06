module.exports = {
  ci: {
    collect: {
      // Collect performance metrics from local dev server
      startServerCommand: 'npm run build && npm run start',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 60000,
      url: [
        'http://localhost:3000',
        'http://localhost:3000/daily-log',
        'http://localhost:3000/goals',
        'http://localhost:3000/habits',
        'http://localhost:3000/weekly-review',
        'http://localhost:3000/monthly-review',
      ],
      numberOfRuns: 3, // Run Lighthouse 3 times and take median
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10 * 1024,
          cpuSlowdownMultiplier: 1,
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
      },
    },
    assert: {
      // Performance budgets based on Core Web Vitals
      assertions: {
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }], // < 1.5s
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // < 2.5s
        'total-blocking-time': ['error', { maxNumericValue: 200 }], // < 200ms
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // < 0.1
        'speed-index': ['error', { maxNumericValue: 3000 }], // < 3.0s

        // Additional Performance Metrics
        'interactive': ['warn', { maxNumericValue: 3500 }], // Time to Interactive < 3.5s
        'max-potential-fid': ['warn', { maxNumericValue: 100 }], // < 100ms

        // Overall scores (0-1 scale, where 1 is best)
        'categories:performance': ['error', { minScore: 0.9 }], // Performance score > 90
        'categories:accessibility': ['warn', { minScore: 0.9 }], // Accessibility score > 90
        'categories:best-practices': ['warn', { minScore: 0.9 }], // Best Practices score > 90
        'categories:seo': ['warn', { minScore: 0.9 }], // SEO score > 90

        // Resource optimization
        'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }], // < 500KB JS
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 100000 }], // < 100KB CSS
        'resource-summary:image:size': ['warn', { maxNumericValue: 1000000 }], // < 1MB images
        'resource-summary:font:size': ['warn', { maxNumericValue: 200000 }], // < 200KB fonts

        // Network optimization
        'uses-responsive-images': 'warn',
        'offscreen-images': 'warn',
        'unminified-css': 'error',
        'unminified-javascript': 'error',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'modern-image-formats': 'warn',
        'uses-optimized-images': 'warn',
        'uses-text-compression': 'error',
        'uses-long-cache-ttl': 'warn',

        // Rendering performance
        'dom-size': ['warn', { maxNumericValue: 1500 }], // < 1500 DOM nodes
        'bootup-time': ['warn', { maxNumericValue: 3000 }], // < 3s bootup time
        'mainthread-work-breakdown': ['warn', { maxNumericValue: 4000 }], // < 4s main thread work

        // Best practices
        'no-document-write': 'error',
        'uses-passive-event-listeners': 'warn',
        'no-vulnerable-libraries': 'error',
        'js-libraries': 'off', // Don't enforce specific library versions

        // Accessibility
        'color-contrast': 'warn',
        'image-alt': 'warn',
        'label': 'warn',
        'link-name': 'warn',
      },
    },
    upload: {
      // Store results locally (can be configured for remote storage later)
      target: 'filesystem',
      outputDir: './lighthouse-reports',
      reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%.report.%%EXTENSION%%',
    },
  },
};
