# Visual Regression Testing - Summary

Quick overview of the visual regression testing setup for the Personal Dashboard.

## What We've Set Up

### 1. Core Infrastructure
- **Playwright Test Framework** - Industry-standard browser automation
- **Screenshot Comparison** - Automated visual diff detection
- **Multi-Browser Support** - Chrome, Firefox, Safari
- **Mobile Testing** - iOS Safari, Android Chrome
- **CI/CD Integration** - GitHub Actions workflow

### 2. Test Coverage

#### Dashboard (`dashboard.spec.ts`)
- Full page view
- Above-fold view
- Weekly progress widget
- Stoic quote widget
- Win condition banner
- Review notifications
- Mobile responsive view

#### Habits (`habits.spec.ts`)
- Full habits page
- Expanded category states
- Collapsed category states
- Individual habit items
- Completed vs uncompleted states
- Stats bar
- Level progress bar
- Category sections
- Sprint timer modal
- Manage habits dialog

#### Reviews (`reviews.spec.ts`)
- Weekly review form
- Monthly review form
- Quarterly review form
- Annual review form
- Empty states
- Filled states
- Review notification bar

#### Settings (`settings.spec.ts`)
- Settings modal (all tabs)
- Profile tab
- Preferences tab
- Visionboard settings tab
- Theme toggle

#### AI Coach (`coach.spec.ts`)
- Toggle button (closed/open)
- Coach panel default view
- Panel with conversation
- Hover states

#### Visionboard (`visionboard.spec.ts`)
- Carousel default view
- Empty state
- With images loaded
- Navigation between slides
- Fullscreen view
- Image hover states
- Grid layout

### 3. Test Utilities

#### Fixtures (`fixtures/`)
- **auth.setup.ts** - Authentication setup
- **test-data.ts** - Test data and helpers
  - `waitForPageStable()` - Ensures page is ready
  - `hideDynamicContent()` - Hides changing elements
  - `setTestDateTime()` - Fixed date/time

#### Helpers (`helpers/`)
- **screenshot-manager.ts** - Advanced screenshot utilities
  - `ScreenshotManager` class
  - `waitForImages()` - Wait for image loading
  - `scrollToElement()` - Smooth scrolling
  - `hideElements()` - Hide specific elements
  - `setElementText()` - Set consistent text

#### Examples (`examples/`)
- **advanced-patterns.spec.ts** - 15 advanced testing patterns
  - Theme switching
  - Responsive layouts
  - Interactive states
  - Modal states
  - Error states
  - Loading states
  - And more...

### 4. Configuration

#### Main Config (`playwright.config.ts`)
- Test directory: `./visual-regression`
- Timeout: 30 seconds per test
- Screenshot thresholds: 100 pixels, 0.2 difference
- Multiple browser projects
- Web server auto-start
- Retry on CI: 2 attempts

#### Package Scripts
```bash
npm run test:visual           # Run all tests
npm run test:visual:update    # Update baselines
npm run test:visual:ui        # Interactive UI mode
npm run test:visual:debug     # Debug mode
npm run test:visual:report    # View HTML report
npm run test:visual:chromium  # Chrome only
npm run test:visual:firefox   # Firefox only
npm run test:visual:webkit    # Safari only
npm run test:visual:mobile    # Mobile devices
```

### 5. CI/CD Integration

#### GitHub Actions (`.github/workflows/visual-regression.yml`)
- Runs on push to main/develop
- Runs on pull requests
- Tests all browsers in parallel
- Uploads failure artifacts
- Posts results to PR comments
- 30-day artifact retention

### 6. Documentation

- **README.md** - Comprehensive guide (7,700+ words)
- **QUICKSTART.md** - 5-minute setup guide
- **CONFIGURATION.md** - All config options
- **SUMMARY.md** - This file

## File Structure

```
visual-regression/
├── README.md                      # Main documentation
├── QUICKSTART.md                  # Quick start guide
├── CONFIGURATION.md               # Configuration reference
├── SUMMARY.md                     # This summary
├── dashboard.spec.ts              # Dashboard tests
├── habits.spec.ts                 # Habits tests
├── reviews.spec.ts                # Reviews tests
├── settings.spec.ts               # Settings tests
├── coach.spec.ts                  # Coach panel tests
├── visionboard.spec.ts            # Visionboard tests
├── fixtures/
│   ├── auth.setup.ts              # Authentication setup
│   └── test-data.ts               # Test data & helpers
├── helpers/
│   └── screenshot-manager.ts      # Screenshot utilities
├── examples/
│   └── advanced-patterns.spec.ts  # Advanced patterns
└── screenshots/                   # Screenshot storage
```

## Key Features

### 1. Consistent Screenshots
- Fixed date/time across tests
- Hidden dynamic content
- Disabled animations
- Consistent viewports
- Font loading checks

### 2. Multi-Browser Testing
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 13)

### 3. Smart Thresholds
- 100px max difference
- 0.2 threshold (20%)
- Configurable per-test
- Separate CI settings

### 4. Comprehensive Coverage
- 6 major screen types
- 30+ individual tests
- Desktop + mobile views
- All component states
- Empty, filled, error states

### 5. Developer Experience
- Interactive UI mode
- Debug mode with inspector
- HTML reports with diffs
- Fast local development
- Parallel execution

## Quick Start

### 1. Install browsers
```bash
npx playwright install
```

### 2. Generate baselines
```bash
npm run dev  # In one terminal
npm run test:visual:update  # In another
```

### 3. Run tests
```bash
npm run test:visual
```

### 4. View results
```bash
npm run test:visual:report
```

## Common Commands

| Task | Command |
|------|---------|
| Run all tests | `npm run test:visual` |
| Update baselines | `npm run test:visual:update` |
| Interactive mode | `npm run test:visual:ui` |
| Debug mode | `npm run test:visual:debug` |
| View report | `npm run test:visual:report` |
| Chrome only | `npm run test:visual:chromium` |
| Mobile only | `npm run test:visual:mobile` |

## Maintenance

### When to Update Baselines

Update baselines when you make intentional UI changes:
```bash
npm run test:visual:update
```

### Adding New Tests

1. Create new `.spec.ts` file in `visual-regression/`
2. Follow existing patterns
3. Generate baseline: `npm run test:visual:update`
4. Commit both test and baseline screenshots

### Adjusting Thresholds

If tests are too strict or loose:

**Global:** Edit `playwright.config.ts`
```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 200,  // Adjust this
    threshold: 0.3,       // And this
  }
}
```

**Per-test:** Override in test
```typescript
await expect(page).toHaveScreenshot('name.png', {
  maxDiffPixels: 300,
});
```

## Best Practices

1. Run tests before committing UI changes
2. Review diffs carefully in the HTML report
3. Update baselines only for intentional changes
4. Keep test data consistent with fixtures
5. Hide dynamic content (time, random data)
6. Wait for page stability before screenshots
7. Test both desktop and mobile views
8. Document custom thresholds with comments

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests too flaky | Increase wait times, adjust thresholds |
| All tests failing | Check if app is running on correct port |
| Font differences | Wait for fonts: `await page.evaluate(() => document.fonts.ready)` |
| Authentication errors | Update `fixtures/auth.setup.ts` |
| Slow tests | Reduce browser count, use headless mode |

## Resources

- Main docs: [README.md](./README.md)
- Quick start: [QUICKSTART.md](./QUICKSTART.md)
- Configuration: [CONFIGURATION.md](./CONFIGURATION.md)
- Playwright docs: https://playwright.dev
- Screenshot testing: https://playwright.dev/docs/test-snapshots

## Metrics

- **Total test files:** 6 core + 1 examples
- **Total tests:** 30+ individual test cases
- **Coverage:** 6 major screen types
- **Browsers:** 5 (3 desktop + 2 mobile)
- **Viewports:** Multiple breakpoints
- **Documentation:** 15,000+ words

## Next Steps

1. Review the [QUICKSTART.md](./QUICKSTART.md) guide
2. Generate your first baseline screenshots
3. Run your first visual regression test
4. Explore advanced patterns in `examples/`
5. Customize configuration for your needs
6. Set up CI/CD with GitHub Actions

## Support

For detailed information on any topic:
- Setup issues → See [QUICKSTART.md](./QUICKSTART.md)
- Configuration → See [CONFIGURATION.md](./CONFIGURATION.md)
- General usage → See [README.md](./README.md)
- Advanced patterns → See [examples/advanced-patterns.spec.ts](./examples/advanced-patterns.spec.ts)

---

**Status:** ✅ Setup Complete
**Version:** 1.0.0
**Last Updated:** 2026-02-06
