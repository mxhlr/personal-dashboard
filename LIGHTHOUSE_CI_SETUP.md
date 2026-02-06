# Lighthouse CI Setup Complete

This document summarizes the Lighthouse CI configuration and provides quick start instructions.

## What Was Installed

### 1. Dependencies

- **@lhci/cli** (v0.15.1) - Lighthouse CI command-line interface

### 2. Configuration Files

- **lighthouserc.js** - Main Lighthouse CI configuration with performance budgets
- **.github/workflows/lighthouse-ci.yml** - GitHub Actions CI/CD workflow
- **PERFORMANCE_TESTING.md** - Comprehensive documentation

### 3. Scripts

- **scripts/parse-lighthouse-report.js** - Terminal-based report parser
- Multiple npm scripts for testing and reporting

### 4. Components

- **components/performance/PerformanceDashboard.tsx** - React dashboard component
- **app/(protected)/performance/page.tsx** - Performance monitoring page
- **lib/lighthouse-utils.ts** - Utility functions for parsing reports

### 5. Documentation

- **PERFORMANCE_TESTING.md** - Full documentation (18+ pages)
- **components/performance/README.md** - Component usage guide
- **.lighthouse/README.md** - Quick reference card

## Quick Start

### 1. Run Your First Performance Test

```bash
# Build and test the application
npm run perf:test
```

This will:
- Build your Next.js application
- Start a production server
- Run Lighthouse tests on all configured pages
- Generate detailed reports
- Check against performance budgets

### 2. View Results

```bash
# Parse latest report in terminal
npm run perf:parse

# Or open interactive viewer
npm run perf:report
```

### 3. View Performance Dashboard

Navigate to `http://localhost:3000/performance` to see the visual dashboard (after running `npm run dev`).

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run perf:test` | Run complete test suite |
| `npm run perf:collect` | Collect metrics only |
| `npm run perf:assert` | Check against budgets |
| `npm run perf:upload` | Upload reports |
| `npm run perf:report` | Open interactive viewer |
| `npm run perf:parse` | Parse latest report to terminal |
| `npm run perf:ci` | Run in CI/CD mode |

## Performance Budgets Configured

### Core Web Vitals (All set to Error severity)

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Total Blocking Time | < 200ms |
| Cumulative Layout Shift | < 0.1 |
| Speed Index | < 3.0s |

### Category Scores (Error: Performance, Warning: Others)

| Category | Minimum Score |
|----------|---------------|
| Performance | 90% |
| Accessibility | 90% |
| Best Practices | 90% |
| SEO | 90% |

### Resource Budgets (All set to Warning severity)

| Resource | Maximum Size |
|----------|--------------|
| JavaScript | 500 KB |
| CSS | 100 KB |
| Images | 1 MB |
| Fonts | 200 KB |

## Pages Tested

The following pages are tested by default:

1. Homepage (`/`)
2. Daily Log (`/daily-log`)
3. Goals (`/goals`)
4. Habits (`/habits`)
5. Weekly Review (`/weekly-review`)
6. Monthly Review (`/monthly-review`)

To modify tested pages, edit `lighthouserc.js`.

## CI/CD Integration

### GitHub Actions Workflow

A workflow is configured at `.github/workflows/lighthouse-ci.yml` that:

- Runs on every push to `main` branch
- Runs on every pull request to `main` branch
- Builds the application
- Executes Lighthouse tests
- Uploads reports as artifacts
- Comments on PRs with results

### Required Secrets

Add these to your GitHub repository settings:

| Secret Name | Description |
|-------------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex backend URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk public key |
| `LHCI_GITHUB_APP_TOKEN` | (Optional) Lighthouse CI app token |

## Performance Dashboard

A visual dashboard is available at `/performance` route with:

- **Overview Tab**: All category scores at a glance
- **Core Web Vitals Tab**: Detailed metrics with progress bars
- **Categories Tab**: In-depth score analysis

### Using the Dashboard

```typescript
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';

// With default demo data
<PerformanceDashboard />

// With real Lighthouse data
<PerformanceDashboard
  metrics={parsedMetrics}
  categories={parsedCategories}
  lastRun={new Date().toLocaleString()}
/>
```

## Report Storage

Reports are stored in `lighthouse-reports/` directory (gitignored).

File naming pattern: `%%PATHNAME%%-%%DATETIME%%.report.%%EXTENSION%%`

Example: `root-2026-02-06_03-10-00.report.json`

## Troubleshooting

### Tests Time Out

Increase timeout in `lighthouserc.js`:

```javascript
startServerReadyTimeout: 120000, // 2 minutes
```

### Build Fails

Ensure environment variables are properly set:

```bash
# Check .env.local
cat .env.local

# Required variables
NEXT_PUBLIC_CONVEX_URL=your-url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-key
```

### No Reports Generated

1. Verify server starts: `npm run build && npm start`
2. Check URLs are accessible: `curl http://localhost:3000`
3. Check file permissions: `ls -la lighthouse-reports/`

### Performance Budget Failures

1. Run `npm run perf:parse` to see failures
2. Review "Opportunities" section
3. Implement optimizations
4. Re-run tests

## Next Steps

1. **Run Initial Baseline Test**
   ```bash
   npm run perf:test
   ```

2. **Review Results**
   ```bash
   npm run perf:parse
   ```

3. **Address Any Failures**
   - Check the opportunities section
   - Implement recommended optimizations
   - Re-test

4. **Set Up GitHub Secrets**
   - Go to your repository settings
   - Add required environment variables
   - Test the workflow

5. **Monitor Regularly**
   - Run tests before each deploy
   - Track trends over time
   - Update budgets as needed

## File Structure

```
personal-dashboard/
├── .github/
│   └── workflows/
│       └── lighthouse-ci.yml          # CI/CD workflow
├── .lighthouse/
│   └── README.md                      # Quick reference
├── app/
│   └── (protected)/
│       └── performance/
│           └── page.tsx               # Performance page
├── components/
│   ├── performance/
│   │   ├── PerformanceDashboard.tsx   # Dashboard component
│   │   └── README.md                  # Component docs
│   └── ui/
│       ├── badge.tsx                  # Badge component
│       ├── card.tsx                   # Card component
│       ├── progress.tsx               # Progress component
│       └── tabs.tsx                   # Tabs component
├── lib/
│   └── lighthouse-utils.ts            # Parsing utilities
├── lighthouse-reports/                # Reports (gitignored)
├── scripts/
│   └── parse-lighthouse-report.js     # Report parser
├── lighthouserc.js                    # Main config
└── PERFORMANCE_TESTING.md             # Full docs
```

## Resources

- **Full Documentation**: [PERFORMANCE_TESTING.md](./PERFORMANCE_TESTING.md)
- **Component Guide**: [components/performance/README.md](./components/performance/README.md)
- **Quick Reference**: [.lighthouse/README.md](./.lighthouse/README.md)
- **Lighthouse CI Docs**: https://github.com/GoogleChrome/lighthouse-ci
- **Web Vitals**: https://web.dev/vitals/

## Support

For detailed information on:
- Configuration options → See `PERFORMANCE_TESTING.md` § Configuration
- Interpreting results → See `PERFORMANCE_TESTING.md` § Interpreting Results
- Optimization tips → See `PERFORMANCE_TESTING.md` § Optimization Guidelines
- Troubleshooting → See `PERFORMANCE_TESTING.md` § Troubleshooting

---

**Setup Date**: February 6, 2026
**Version**: 1.0.0
**Status**: Ready for use
