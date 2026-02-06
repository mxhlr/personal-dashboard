# E2E Testing Implementation Checklist

Use this checklist to complete the E2E testing setup and start running tests.

## Initial Setup (One-time)

### 1. Install Dependencies
- [x] Playwright installed via npm
- [ ] Install Chromium browser
  ```bash
  npx playwright install chromium
  ```

### 2. Environment Configuration
- [ ] Copy `.env.test.example` to `.env.test`
  ```bash
  cp .env.test.example .env.test
  ```
- [ ] Fill in test user credentials in `.env.test`

### 3. Test User Setup
- [ ] Create test user in Clerk Dashboard
  - Email matches `TEST_USER_EMAIL` in `.env.test`
  - Password matches `TEST_USER_PASSWORD` in `.env.test`
  - User is active and verified

### 4. Convex Setup (Optional but Recommended)
- [ ] Create separate test deployment
  ```bash
  npx convex deploy --name personal-dashboard-test
  ```
- [ ] Update `.env.test` with test deployment URL
- [ ] Add test deployment key to `.env.test`

## Verification Steps

### 1. Run Smoke Tests
- [ ] Start dev server: `npm run dev`
- [ ] Run smoke tests: `npm run test:e2e e2e/smoke.spec.ts`
- [ ] All smoke tests pass

### 2. Test Authentication
- [ ] Run onboarding test: `npm run test:e2e:headed e2e/onboarding.spec.ts`
- [ ] Verify Clerk login works
- [ ] Verify user can complete onboarding

### 3. Run Full Test Suite
- [ ] Run all tests: `npm run test:e2e`
- [ ] Check test results
- [ ] View test report: `npm run test:e2e:report`

## Implementation Tasks

### Phase 1: Core Infrastructure ✓
- [x] Playwright configuration
- [x] Test directory structure
- [x] NPM scripts
- [x] Environment setup
- [x] CI/CD workflow

### Phase 2: Test Utilities ✓
- [x] Authentication helpers
- [x] Navigation helpers
- [x] Convex helpers
- [x] Test data fixtures
- [x] Database utilities

### Phase 3: Page Object Models ✓
- [x] Onboarding page
- [x] Habits page
- [ ] Weekly Review page (future)
- [ ] Monthly Review page (future)
- [ ] OKR page (future)
- [ ] Visionboard page (future)
- [ ] Settings page (future)

### Phase 4: Test Suites ✓
- [x] Smoke tests
- [x] Onboarding tests
- [x] Daily habits tests
- [x] Weekly review tests
- [x] Goals tests
- [x] Visionboard tests
- [x] Full journey tests

### Phase 5: Database Integration
- [ ] Implement `seedDatabase()` in `fixtures/database.ts`
- [ ] Implement `cleanupDatabase()` in `fixtures/database.ts`
- [ ] Implement `resetUserToOnboarding()` in `fixtures/database.ts`
- [ ] Implement `createUserWithOnboarding()` in `fixtures/database.ts`
- [ ] Test database seeding works
- [ ] Test database cleanup works

### Phase 6: Documentation ✓
- [x] Main README
- [x] Setup guide
- [x] Quick start guide
- [x] Test template
- [x] Implementation summary

## Next Steps

### Immediate (Required to Run Tests)
1. [ ] Install Playwright browsers
2. [ ] Create `.env.test` file
3. [ ] Create test user in Clerk
4. [ ] Run smoke tests to verify setup

### Short Term (1-2 weeks)
1. [ ] Implement database helper functions
2. [ ] Add more Page Object Models
3. [ ] Expand test coverage
4. [ ] Add component-level data-testid attributes
5. [ ] Set up CI/CD secrets in GitHub

### Medium Term (1-2 months)
1. [ ] Add visual regression tests
2. [ ] Add accessibility tests (axe-core)
3. [ ] Add performance tests
4. [ ] Create test data factories
5. [ ] Implement test database reset strategy

### Long Term (3+ months)
1. [ ] Cross-browser testing
2. [ ] Mobile testing
3. [ ] Load testing
4. [ ] Test coverage reporting
5. [ ] Automatic test generation

## CI/CD Setup

### GitHub Secrets
Configure in: Settings → Secrets and variables → Actions

- [ ] `TEST_USER_EMAIL` - Test user email
- [ ] `TEST_USER_PASSWORD` - Test user password
- [ ] `TEST_CONVEX_URL` - Test Convex deployment URL
- [ ] `TEST_CONVEX_DEPLOY_KEY` - Test Convex deployment key

### Workflow Configuration
- [x] E2E test workflow created
- [ ] Test secrets configured
- [ ] Workflow tested on PR
- [ ] Artifacts verified

## Component Updates Needed

To make tests more reliable, add data-testid attributes to components:

### Onboarding Components
- [ ] `[data-testid="setup-wizard"]` to SetupWizard
- [ ] `[data-testid="coach-tone-{tone}"]` to coach tone buttons
- [ ] `[data-testid="add-milestone-{area}"]` to milestone buttons

### Habit Components
- [ ] `[data-testid="habit-dashboard"]` to HabitDashboard
- [ ] `[data-testid="habit-category"]` to HabitCategory
- [ ] `[data-testid="habit-item"]` to HabitItem
- [ ] `[data-testid="habit-checkbox"]` to habit checkbox
- [ ] `[data-testid="habit-name"]` to habit name
- [ ] `[data-testid="habit-streak"]` to streak display
- [ ] `[data-testid="manage-habits-button"]` to manage button
- [ ] `[data-testid="user-xp"]` to XP display
- [ ] `[data-testid="user-level"]` to level display

### Review Components
- [ ] `[data-testid="weekly-review-form"]` to WeeklyReviewForm
- [ ] `[data-testid="review-week-number"]` to week display
- [ ] `[data-testid="highlights-input"]` to highlights textarea
- [ ] `[data-testid="challenges-input"]` to challenges textarea
- [ ] `[data-testid="insights-input"]` to insights textarea
- [ ] `[data-testid="save-review-button"]` to save button

### OKR Components
- [ ] `[data-testid="okr-overview"]` to OKROverview
- [ ] `[data-testid="north-stars-section"]` to North Stars section
- [ ] `[data-testid="north-star-{area}"]` to each North Star
- [ ] `[data-testid="milestone-item"]` to milestone items
- [ ] `[data-testid="milestone-checkbox"]` to milestone checkbox

### Visionboard Components
- [ ] `[data-testid="visionboard"]` to Visionboard
- [ ] `[data-testid="visionboard-list"]` to visionboard lists
- [ ] `[data-testid="visionboard-item"]` to visionboard items
- [ ] `[data-testid="add-item-button"]` to add item button

### Navigation Components
- [ ] `[data-testid="user-menu"]` to user menu
- [ ] `[data-testid="settings-button"]` to settings button
- [ ] `[data-testid="coach-toggle"]` to coach toggle button

## Troubleshooting Checklist

### Tests Won't Run
- [ ] Dev server is running on port 3000
- [ ] Playwright installed: `npx playwright install chromium`
- [ ] `.env.test` exists and has correct values
- [ ] No other process using port 3000

### Authentication Fails
- [ ] Test user exists in Clerk
- [ ] Email/password correct in `.env.test`
- [ ] Test user is verified
- [ ] Delete `e2e/.auth/` and try again

### Tests Are Flaky
- [ ] Added `waitForConvexSync()` after mutations
- [ ] Using `data-testid` selectors
- [ ] Increased timeouts if needed
- [ ] Checking for race conditions

### Database Issues
- [ ] Test deployment separate from dev
- [ ] Database helpers implemented
- [ ] Cleanup running after tests
- [ ] Seed data is correct

## Success Criteria

Your E2E testing setup is complete when:

- [x] All infrastructure files created
- [x] All test suites written
- [x] Documentation complete
- [ ] `.env.test` configured
- [ ] Test user created
- [ ] Smoke tests pass
- [ ] At least one full test suite passes
- [ ] CI/CD workflow runs successfully
- [ ] Team trained on running tests

## Resources

- [Playwright Documentation](https://playwright.dev)
- [E2E README](./README.md)
- [Setup Guide](./SETUP.md)
- [Quick Start](./QUICK_START.md)
- [Test Template](./TEMPLATE.spec.ts)

## Getting Help

If you encounter issues:

1. Check [SETUP.md](./SETUP.md) troubleshooting section
2. Review [QUICK_START.md](./QUICK_START.md) common issues
3. Run with `--debug` flag to step through test
4. Check Playwright documentation
5. Review test examples in `e2e/` directory

---

**Last Updated**: 2026-02-06
**Status**: Infrastructure Complete, Ready for Testing Setup
