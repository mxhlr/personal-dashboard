# Visual Regression Testing Configuration Guide

This guide covers all configuration options for visual regression testing.

## Table of Contents

- [Playwright Configuration](#playwright-configuration)
- [Screenshot Comparison Settings](#screenshot-comparison-settings)
- [Browser Configuration](#browser-configuration)
- [CI/CD Configuration](#cicd-configuration)
- [Environment Variables](#environment-variables)
- [Advanced Settings](#advanced-settings)

## Playwright Configuration

The main configuration file is `playwright.config.ts` at the project root.

### Basic Structure

```typescript
export default defineConfig({
  testDir: './visual-regression',
  timeout: 30 * 1000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});
```

### Key Options

| Option | Description | Default | Recommended |
|--------|-------------|---------|-------------|
| `testDir` | Directory containing tests | `./visual-regression` | Keep default |
| `timeout` | Test timeout in milliseconds | `30000` | `30000-60000` |
| `fullyParallel` | Run tests in parallel | `true` | `true` |
| `retries` | Number of retries on failure | `0` (local), `2` (CI) | Keep default |
| `workers` | Number of parallel workers | CPU cores | `1` (CI), `undefined` (local) |

## Screenshot Comparison Settings

### Comparison Thresholds

Located in `playwright.config.ts` under `expect.toHaveScreenshot`:

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,     // Maximum pixel differences
    threshold: 0.2,          // Pixel difference threshold (0-1)
    animations: 'disabled',  // Disable animations
    scale: 'css',           // Scale factor
  }
}
```

### Threshold Guidelines

| Visual Change | maxDiffPixels | threshold |
|---------------|---------------|-----------|
| Exact match | 0 | 0.0 |
| Minor changes (fonts, anti-aliasing) | 50-100 | 0.1-0.2 |
| Moderate changes (colors, spacing) | 100-300 | 0.2-0.3 |
| Major changes | 300+ | 0.3+ |

### Per-Test Overrides

Override thresholds for specific tests:

```typescript
test('relaxed comparison', async ({ page }) => {
  await expect(page).toHaveScreenshot('name.png', {
    maxDiffPixels: 500,
    threshold: 0.4,
  });
});
```

## Browser Configuration

### Desktop Browsers

```typescript
projects: [
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width: 1920, height: 1080 },
    },
  },
  {
    name: 'firefox',
    use: {
      ...devices['Desktop Firefox'],
      viewport: { width: 1920, height: 1080 },
    },
  },
  {
    name: 'webkit',
    use: {
      ...devices['Desktop Safari'],
      viewport: { width: 1920, height: 1080 },
    },
  },
]
```

### Mobile Devices

```typescript
{
  name: 'mobile-chrome',
  use: {
    ...devices['Pixel 5'],
    // or custom viewport
    viewport: { width: 393, height: 851 },
    userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5)...',
  },
}
```

### Custom Viewports

```typescript
{
  name: 'tablet',
  use: {
    viewport: { width: 768, height: 1024 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
}
```

## CI/CD Configuration

### GitHub Actions

The included workflow file `.github/workflows/visual-regression.yml` runs tests on:
- Push to main/develop
- Pull requests

#### Customization

**Run on specific branches:**
```yaml
on:
  push:
    branches: [main, develop, staging]
```

**Run on schedule:**
```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
```

**Add Slack notifications:**
```yaml
- name: Slack Notification
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

### Other CI Systems

#### CircleCI

```yaml
version: 2.1
jobs:
  visual-regression:
    docker:
      - image: mcr.microsoft.com/playwright:v1.40.0
    steps:
      - checkout
      - run: npm ci
      - run: npm run test:visual
      - store_artifacts:
          path: visual-regression/test-results
```

#### GitLab CI

```yaml
visual-regression:
  image: mcr.microsoft.com/playwright:v1.40.0
  script:
    - npm ci
    - npm run test:visual
  artifacts:
    when: on_failure
    paths:
      - visual-regression/test-results/
```

## Environment Variables

### Application Configuration

Set in `.env.local`:

```bash
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Test mode
NEXT_PUBLIC_TEST_MODE=true
```

### Playwright Environment

Set in CI or locally:

```bash
# Run in CI mode
CI=true

# Increase timeout for slow machines
PLAYWRIGHT_TIMEOUT=60000

# Custom browser path
PLAYWRIGHT_BROWSERS_PATH=/custom/path
```

### Using in Tests

```typescript
test('conditional test', async ({ page }) => {
  const isCI = process.env.CI === 'true';

  if (isCI) {
    // Use stricter settings in CI
    await expect(page).toHaveScreenshot('name.png', {
      threshold: 0.1,
    });
  } else {
    // More relaxed locally
    await expect(page).toHaveScreenshot('name.png', {
      threshold: 0.3,
    });
  }
});
```

## Advanced Settings

### Custom Web Server

If not using the default dev server:

```typescript
webServer: {
  command: 'npm run preview',  // Production build
  url: 'http://localhost:4173',
  reuseExistingServer: !process.env.CI,
  timeout: 120 * 1000,
  env: {
    NODE_ENV: 'production',
  },
}
```

### Multiple Web Servers

Test against different environments:

```typescript
webServer: [
  {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    port: 3000,
  },
  {
    command: 'npm run backend',
    url: 'http://localhost:8080',
    port: 8080,
  },
]
```

### Authentication

Configure global auth setup:

```typescript
{
  // ...other config
  projects: [
    // Setup project
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // Use setup project as dependency
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'visual-regression/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ]
}
```

### Custom Reporter

Add custom reporters:

```typescript
reporter: [
  ['html', { outputFolder: 'visual-regression/test-results/html-report' }],
  ['json', { outputFile: 'visual-regression/test-results/results.json' }],
  ['junit', { outputFile: 'visual-regression/test-results/junit.xml' }],
  ['./custom-reporter.ts'],
]
```

### Screenshot Options

Global screenshot settings:

```typescript
use: {
  screenshot: {
    mode: 'only-on-failure',
    fullPage: true,
  },
}
```

Per-test screenshot options:

```typescript
await page.screenshot({
  path: 'screenshot.png',
  fullPage: true,
  clip: { x: 0, y: 0, width: 100, height: 100 },
  omitBackground: true,
  type: 'jpeg',
  quality: 90,
});
```

### Network Mocking

Mock API responses for consistent tests:

```typescript
use: {
  baseURL: 'http://localhost:3000',
  extraHTTPHeaders: {
    'Accept': 'application/json',
  },
}
```

In tests:

```typescript
await page.route('**/api/**', (route) => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: 'mock data' }),
  });
});
```

### Performance Optimization

Speed up tests:

```typescript
{
  use: {
    // Reduce wait times
    navigationTimeout: 10000,
    actionTimeout: 5000,

    // Disable CSS
    bypassCSP: true,

    // Block unnecessary resources
    serviceWorkers: 'block',
  }
}
```

### Test Sharding

Split tests across multiple machines:

```typescript
// On machine 1
npx playwright test --shard=1/3

// On machine 2
npx playwright test --shard=2/3

// On machine 3
npx playwright test --shard=3/3
```

## Debugging Configuration

### Debug Mode

```typescript
use: {
  trace: 'on',           // Always collect trace
  video: 'on',           // Record video
  screenshot: 'on',      // Take screenshots
  launchOptions: {
    slowMo: 100,         // Slow down actions
    headless: false,     // Show browser
  },
}
```

### Verbose Logging

```bash
DEBUG=pw:api npx playwright test
```

## Best Practices

1. **Use consistent viewports** - Set fixed viewport sizes for reproducible results
2. **Disable animations** - Set `animations: 'disabled'` globally
3. **Hide dynamic content** - Create reusable functions to hide time, random data, etc.
4. **Set fixed dates** - Use `setTestDateTime()` helper
5. **Wait for stability** - Use `waitForPageStable()` helper
6. **Configure for CI** - Use stricter settings in CI environment
7. **Version control baselines** - Commit baseline screenshots to git
8. **Regular updates** - Update baselines when making intentional UI changes
9. **Organize tests** - Group related tests in describe blocks
10. **Document overrides** - Comment why you're using custom thresholds

## Troubleshooting

### Tests too strict

```typescript
// Increase thresholds
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 200,
    threshold: 0.3,
  }
}
```

### Tests too flaky

```typescript
// Add more retries
retries: 3,

// Increase timeouts
timeout: 60 * 1000,

// Disable parallel execution
fullyParallel: false,
```

### Font rendering differences

```typescript
// Wait for fonts
await page.evaluate(() => document.fonts.ready);

// Or use font smoothing
use: {
  launchOptions: {
    args: ['--font-render-hinting=none'],
  },
}
```

## Resources

- [Playwright Configuration](https://playwright.dev/docs/test-configuration)
- [Screenshot Options](https://playwright.dev/docs/api/class-page#page-screenshot)
- [CI Configuration](https://playwright.dev/docs/ci)
