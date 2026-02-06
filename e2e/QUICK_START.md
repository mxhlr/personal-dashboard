# E2E Testing Quick Start

Get started with E2E testing in 5 minutes.

## Prerequisites

- Node.js 20+ installed
- Repository cloned
- Development server can start (`npm run dev`)

## Setup (First Time)

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Playwright

```bash
npx playwright install chromium
```

### 3. Create Test Environment File

```bash
cp .env.test.example .env.test
```

Edit `.env.test`:

```env
TEST_USER_EMAIL=your-test-email@example.com
TEST_USER_PASSWORD=your-test-password
BASE_URL=http://localhost:3000
```

### 4. Create Test User in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new user with the email from `.env.test`
3. Set password to match `.env.test`

## Running Tests

### Quick Test (Smoke Tests)

```bash
npm run test:e2e e2e/smoke.spec.ts
```

### All Tests

```bash
npm run test:e2e
```

### Watch Mode (See Browser)

```bash
npm run test:e2e:headed
```

### Debug Mode

```bash
npm run test:e2e:debug
```

### Interactive UI Mode

```bash
npm run test:e2e:ui
```

## Test Files

- `smoke.spec.ts` - Quick sanity checks (run this first)
- `onboarding.spec.ts` - User onboarding flow
- `daily-habits.spec.ts` - Habit tracking
- `weekly-review.spec.ts` - Weekly reviews
- `goals.spec.ts` - Goal and milestone tracking
- `visionboard.spec.ts` - Visionboard management
- `full-journey.spec.ts` - Complete user journey

## Common Commands

```bash
# Run specific test file
npx playwright test e2e/onboarding.spec.ts

# Run tests matching pattern
npx playwright test -g "should complete onboarding"

# Run in specific browser
npm run test:e2e:chromium

# View test report
npm run test:e2e:report

# Generate code for new tests
npm run test:codegen
```

## Troubleshooting

### Tests fail with "Page not found"

Make sure dev server is running:

```bash
npm run dev
```

### Authentication fails

1. Check `.env.test` credentials
2. Verify test user exists in Clerk
3. Try deleting `e2e/.auth/` directory

### Tests timeout

Increase timeout in `playwright.config.ts`:

```typescript
timeout: 90 * 1000, // 90 seconds
```

### Port already in use

Kill process on port 3000:

```bash
lsof -ti:3000 | xargs kill -9
```

## Next Steps

1. Read [SETUP.md](./SETUP.md) for detailed setup
2. Read [README.md](./README.md) for testing strategy
3. Check [Page Objects](./pages/) for reusable components
4. Review test fixtures in `fixtures/` directory

## Getting Help

- [Playwright Docs](https://playwright.dev)
- Check test examples in `e2e/` directory
- Use `npx playwright test --help` for CLI options
