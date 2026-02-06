# Visual Regression Testing - Documentation Index

Complete guide to all documentation and resources for visual regression testing.

## Getting Started

### For First-Time Users
1. **[QUICKSTART.md](./QUICKSTART.md)** - Get up and running in 5 minutes
   - Installation steps
   - First test run
   - Common workflows
   - Quick reference commands

2. **[SUMMARY.md](./SUMMARY.md)** - Overview of the entire setup
   - What's included
   - File structure
   - Key features
   - Metrics and coverage

### For Configuration
3. **[CONFIGURATION.md](./CONFIGURATION.md)** - Complete configuration reference
   - Playwright settings
   - Screenshot thresholds
   - Browser configuration
   - CI/CD setup
   - Environment variables
   - Advanced settings

### For Comprehensive Documentation
4. **[README.md](./README.md)** - Full documentation (7,700+ words)
   - Complete setup guide
   - Running tests
   - Test structure
   - Best practices
   - Troubleshooting
   - CI/CD integration

## Test Files

### Core Test Suites
- **[dashboard.spec.ts](./dashboard.spec.ts)** - Dashboard view tests
- **[habits.spec.ts](./habits.spec.ts)** - Habit list and items
- **[reviews.spec.ts](./reviews.spec.ts)** - Review forms (weekly, monthly, etc.)
- **[settings.spec.ts](./settings.spec.ts)** - Settings modal
- **[coach.spec.ts](./coach.spec.ts)** - AI Coach panel
- **[visionboard.spec.ts](./visionboard.spec.ts)** - Visionboard carousel

### Examples
- **[examples/advanced-patterns.spec.ts](./examples/advanced-patterns.spec.ts)** - 15 advanced testing patterns

## Utilities

### Fixtures
- **[fixtures/auth.setup.ts](./fixtures/auth.setup.ts)** - Authentication setup
- **[fixtures/test-data.ts](./fixtures/test-data.ts)** - Test data and helper functions
  - `waitForPageStable()` - Wait for page to be ready
  - `hideDynamicContent()` - Hide changing elements
  - `setTestDateTime()` - Set fixed date/time

### Helpers
- **[helpers/screenshot-manager.ts](./helpers/screenshot-manager.ts)** - Screenshot utilities
  - `ScreenshotManager` class
  - Image loading utilities
  - Element visibility controls

## Configuration Files

### Main Configuration
- **[../playwright.config.ts](../playwright.config.ts)** - Main Playwright configuration
  - Browser projects
  - Screenshot settings
  - Timeouts and retries
  - Web server configuration

### CI/CD
- **[../.github/workflows/visual-regression.yml](../.github/workflows/visual-regression.yml)** - GitHub Actions workflow
  - Automated testing on push/PR
  - Multi-browser testing
  - Artifact uploads
  - PR comments

### Project Configuration
- **[../package.json](../package.json)** - NPM scripts
  - `test:visual` - Run tests
  - `test:visual:update` - Update baselines
  - `test:visual:ui` - Interactive mode
  - And more...

## Quick Reference

### Common Commands
```bash
# Setup
npx playwright install                # Install browsers

# Running Tests
npm run test:visual                   # Run all tests
npm run test:visual:update            # Update baselines
npm run test:visual:ui                # Interactive UI mode
npm run test:visual:debug             # Debug mode
npm run test:visual:report            # View HTML report

# Specific Browsers
npm run test:visual:chromium          # Chrome only
npm run test:visual:firefox           # Firefox only
npm run test:visual:webkit            # Safari only
npm run test:visual:mobile            # Mobile devices

# Specific Tests
npx playwright test dashboard.spec.ts # Test dashboard
npx playwright test habits.spec.ts    # Test habits
```

### Verification
```bash
./visual-regression/verify-setup.sh   # Verify setup
```

## Documentation Map

### By Experience Level

#### Beginner
1. Start with [QUICKSTART.md](./QUICKSTART.md)
2. Read [SUMMARY.md](./SUMMARY.md) for overview
3. Run the verify script
4. Generate first baseline
5. Run first test

#### Intermediate
1. Review [README.md](./README.md) sections:
   - Running Tests
   - Test Structure
   - Best Practices
2. Explore [examples/advanced-patterns.spec.ts](./examples/advanced-patterns.spec.ts)
3. Customize [fixtures/test-data.ts](./fixtures/test-data.ts)

#### Advanced
1. Study [CONFIGURATION.md](./CONFIGURATION.md)
2. Review [helpers/screenshot-manager.ts](./helpers/screenshot-manager.ts)
3. Customize [playwright.config.ts](../playwright.config.ts)
4. Set up CI/CD with [visual-regression.yml](../.github/workflows/visual-regression.yml)

### By Task

#### Setting Up
1. [QUICKSTART.md](./QUICKSTART.md) - Installation
2. [verify-setup.sh](./verify-setup.sh) - Verification
3. [CONFIGURATION.md](./CONFIGURATION.md) - Customization

#### Writing Tests
1. Existing test files for patterns
2. [fixtures/test-data.ts](./fixtures/test-data.ts) - Helpers
3. [examples/advanced-patterns.spec.ts](./examples/advanced-patterns.spec.ts) - Advanced examples

#### Running Tests
1. [QUICKSTART.md](./QUICKSTART.md) - Basic commands
2. [README.md](./README.md) - All options
3. [CONFIGURATION.md](./CONFIGURATION.md) - Advanced settings

#### Debugging
1. [README.md](./README.md) - Troubleshooting section
2. [CONFIGURATION.md](./CONFIGURATION.md) - Debug settings
3. Test report: `npm run test:visual:report`

#### CI/CD
1. [README.md](./README.md) - CI/CD Integration section
2. [CONFIGURATION.md](./CONFIGURATION.md) - CI Configuration
3. [../.github/workflows/visual-regression.yml](../.github/workflows/visual-regression.yml) - Workflow file

## File Organization

```
visual-regression/
├── INDEX.md                          # This file - navigation
├── SUMMARY.md                        # Overview and quick reference
├── QUICKSTART.md                     # 5-minute setup guide
├── README.md                         # Complete documentation
├── CONFIGURATION.md                  # Configuration reference
│
├── Test Files (Core)
│   ├── dashboard.spec.ts             # Dashboard tests
│   ├── habits.spec.ts                # Habits tests
│   ├── reviews.spec.ts               # Reviews tests
│   ├── settings.spec.ts              # Settings tests
│   ├── coach.spec.ts                 # Coach panel tests
│   └── visionboard.spec.ts           # Visionboard tests
│
├── Utilities
│   ├── fixtures/
│   │   ├── auth.setup.ts             # Auth setup
│   │   └── test-data.ts              # Test data & helpers
│   ├── helpers/
│   │   └── screenshot-manager.ts     # Screenshot utilities
│   └── examples/
│       └── advanced-patterns.spec.ts # Advanced examples
│
├── Scripts
│   └── verify-setup.sh               # Setup verification
│
└── Generated (gitignored)
    ├── screenshots/                  # Screenshot storage
    ├── test-results/                 # Test results
    └── .auth/                        # Auth state
```

## External Resources

### Playwright Documentation
- [Official Docs](https://playwright.dev)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [CI/CD](https://playwright.dev/docs/ci)

### Related Tools
- [Playwright Test](https://playwright.dev/docs/intro)
- [GitHub Actions](https://docs.github.com/en/actions)

## Maintenance

### Regular Tasks
1. **Before commits** - Run `npm run test:visual`
2. **After UI changes** - Update baselines with `npm run test:visual:update`
3. **Weekly** - Review test coverage
4. **Monthly** - Update Playwright: `npm update @playwright/test`

### Adding New Tests
1. Create new `.spec.ts` file
2. Follow patterns from existing tests
3. Use helpers from `fixtures/test-data.ts`
4. Generate baseline: `npm run test:visual:update`
5. Document in test file

### Updating Configuration
1. Edit `playwright.config.ts` for global changes
2. Override in specific tests for local changes
3. Update documentation if needed
4. Test changes: `npm run test:visual`

## Support

### Troubleshooting Guide
1. Check [README.md](./README.md) - Troubleshooting section
2. Review [CONFIGURATION.md](./CONFIGURATION.md)
3. Run verify script: `./visual-regression/verify-setup.sh`
4. Check Playwright docs: https://playwright.dev

### Common Issues
- **Tests failing** → Check [README.md](./README.md) Troubleshooting
- **Flaky tests** → Adjust thresholds in [CONFIGURATION.md](./CONFIGURATION.md)
- **Setup issues** → Run `./visual-regression/verify-setup.sh`
- **CI failures** → Check [../.github/workflows/visual-regression.yml](../.github/workflows/visual-regression.yml)

## Version History

- **v1.0.0** (2026-02-06) - Initial setup
  - 6 core test suites
  - 30+ test cases
  - Multi-browser support
  - Mobile testing
  - CI/CD integration
  - Comprehensive documentation

## Next Steps

### For New Users
1. Read [QUICKSTART.md](./QUICKSTART.md)
2. Install browsers: `npx playwright install`
3. Generate baselines: `npm run test:visual:update`
4. Run first test: `npm run test:visual`
5. Explore [examples/advanced-patterns.spec.ts](./examples/advanced-patterns.spec.ts)

### For Existing Users
1. Review [SUMMARY.md](./SUMMARY.md) for updates
2. Check [CONFIGURATION.md](./CONFIGURATION.md) for new options
3. Explore advanced patterns
4. Customize for your workflow

---

**Last Updated:** 2026-02-06
**Version:** 1.0.0
**Status:** ✅ Complete
