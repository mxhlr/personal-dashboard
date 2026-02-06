# Visual Regression Testing - Quick Start Guide

Get started with visual regression testing in 5 minutes.

## Step 1: Install Playwright Browsers

```bash
npx playwright install
```

This installs Chrome, Firefox, and Safari browsers for testing.

## Step 2: Start Your Development Server

In one terminal, start the app:

```bash
npm run dev
```

Wait for the app to be accessible at http://localhost:3000

## Step 3: Generate Baseline Screenshots

In another terminal, generate the initial baseline screenshots:

```bash
npm run test:visual:update
```

This will:
1. Run all visual regression tests
2. Take screenshots of every view
3. Save them as baseline images for future comparisons

Expected output:
```
Running 30+ tests across dashboard, habits, reviews, settings, coach, and visionboard
✅ All tests completed
✅ Baseline screenshots saved
```

## Step 4: Run Visual Regression Tests

Now that you have baselines, run the tests:

```bash
npm run test:visual
```

This compares current screenshots against baselines. On first run, all tests should pass.

## Step 5: View Test Results

If any tests fail (which they shouldn't on first run):

```bash
npm run test:visual:report
```

This opens an HTML report showing:
- Which tests passed/failed
- Visual diffs for failed tests
- Screenshots with highlights of differences

## Common Workflows

### Making UI Changes

1. Make your changes to the code
2. Run tests: `npm run test:visual`
3. Review failures in the report
4. If changes are intentional, update baselines: `npm run test:visual:update`

### Testing Specific Views

```bash
# Test only dashboard
npx playwright test visual-regression/dashboard.spec.ts

# Test only habits
npx playwright test visual-regression/habits.spec.ts
```

### Testing Specific Browsers

```bash
# Chrome only
npm run test:visual:chromium

# All mobile devices
npm run test:visual:mobile
```

### Debug Mode

Run tests with Playwright Inspector for debugging:

```bash
npm run test:visual:debug
```

### UI Mode (Interactive)

Run tests in interactive UI mode:

```bash
npm run test:visual:ui
```

This opens a GUI where you can:
- Run tests individually
- See live screenshots
- Debug failures
- Update baselines

## Understanding Test Results

### All Tests Pass ✅

```
Running 35 tests using 3 workers
  35 passed (1m)
```

No visual regressions detected. Your UI looks good!

### Tests Fail ❌

```
Running 35 tests using 3 workers
  33 passed
  2 failed

  dashboard.spec.ts:10:1 › dashboard - full view
    Error: Screenshot comparison failed
    Expected: dashboard-full.png
    Received: dashboard-full-actual.png
    Diff: dashboard-full-diff.png
```

This means the dashboard view has visual changes. Review the diff image.

## Troubleshooting

### "Browser not installed" error

```bash
npx playwright install chromium
```

### Tests are flaky (sometimes pass, sometimes fail)

1. Check if there are animations: Increase wait times
2. Check for dynamic content: Add to `hideDynamicContent()`
3. Adjust thresholds in `playwright.config.ts`

### Authentication issues

Update `visual-regression/fixtures/auth.setup.ts` with your auth flow.

### All tests failing after small change

The threshold might be too strict. Adjust in `playwright.config.ts`:

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 200,  // Increase from 100
    threshold: 0.3,      // Increase from 0.2
  }
}
```

## Next Steps

1. Review the main [README.md](./README.md) for detailed documentation
2. Customize test data in `fixtures/test-data.ts`
3. Add more tests for new features
4. Set up CI/CD with the included GitHub Actions workflow

## Tips

1. **Run tests regularly**: Before committing changes
2. **Keep baselines in git**: So team members have the same reference
3. **Review diffs carefully**: Not all visual changes are bad
4. **Use mobile tests**: Test responsive designs
5. **Update baselines deliberately**: Only when changes are intentional

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run test:visual` | Run all visual regression tests |
| `npm run test:visual:update` | Update baseline screenshots |
| `npm run test:visual:report` | View test results report |
| `npm run test:visual:ui` | Run in interactive UI mode |
| `npm run test:visual:debug` | Run in debug mode |
| `npm run test:visual:chromium` | Test Chrome only |
| `npm run test:visual:mobile` | Test mobile devices only |

## Need Help?

- Check the [README.md](./README.md) for comprehensive documentation
- Review [Playwright Documentation](https://playwright.dev)
- Look at existing test files for examples
- Check the test report for detailed failure information
