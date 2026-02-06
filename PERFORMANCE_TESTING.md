# Performance Testing with Lighthouse CI

This document provides comprehensive guidance on performance testing for the Personal Dashboard application using Lighthouse CI.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Performance Budgets](#performance-budgets)
5. [Running Tests](#running-tests)
6. [CI/CD Integration](#cicd-integration)
7. [Interpreting Results](#interpreting-results)
8. [Performance Dashboard](#performance-dashboard)
9. [Optimization Guidelines](#optimization-guidelines)
10. [Troubleshooting](#troubleshooting)

## Overview

Lighthouse CI is integrated into this project to automatically test and monitor web performance metrics. The configuration includes:

- Automated performance testing on every build
- Core Web Vitals monitoring
- Performance budgets with strict thresholds
- CI/CD integration for continuous monitoring
- Visual performance dashboard
- Detailed report parsing and analysis

## Quick Start

### 1. Install Dependencies

All dependencies are already included in `package.json`. If you need to reinstall:

```bash
npm install
```

### 2. Run Performance Tests

Run a complete performance test suite:

```bash
npm run perf:test
```

This command will:
1. Build the application
2. Start the production server
3. Run Lighthouse tests on all configured URLs
4. Generate detailed reports
5. Check against performance budgets

### 3. View Results

Parse and view the latest Lighthouse report:

```bash
npm run perf:parse
```

Or open the interactive Lighthouse viewer:

```bash
npm run perf:report
```

## Configuration

### Lighthouse Configuration (`lighthouserc.js`)

The configuration file defines:

#### URLs to Test

```javascript
url: [
  'http://localhost:3000',              // Homepage
  'http://localhost:3000/daily-log',    // Daily Log
  'http://localhost:3000/goals',        // Goals
  'http://localhost:3000/habits',       // Habits
  'http://localhost:3000/weekly-review', // Weekly Review
  'http://localhost:3000/monthly-review', // Monthly Review
]
```

#### Test Settings

- **Number of Runs**: 3 (median value used)
- **Preset**: Desktop
- **Throttling**: Minimal (fast 3G simulation)
- **Screen Size**: 1350x940

#### Performance Budgets

See [Performance Budgets](#performance-budgets) section below.

## Performance Budgets

### Core Web Vitals

These are the primary metrics for user experience:

| Metric | Target | Severity | Description |
|--------|--------|----------|-------------|
| **First Contentful Paint (FCP)** | < 1.5s | Error | Time until first content is painted |
| **Largest Contentful Paint (LCP)** | < 2.5s | Error | Time until largest content is painted |
| **Total Blocking Time (TBT)** | < 200ms | Error | Sum of blocking time periods |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Error | Visual stability metric |
| **Speed Index** | < 3.0s | Error | How quickly content is visually displayed |

### Category Scores

Minimum acceptable scores (0-100):

| Category | Minimum Score | Severity |
|----------|---------------|----------|
| Performance | 90 | Error |
| Accessibility | 90 | Warning |
| Best Practices | 90 | Warning |
| SEO | 90 | Warning |

### Resource Budgets

| Resource Type | Maximum Size | Severity |
|---------------|--------------|----------|
| JavaScript | 500 KB | Warning |
| CSS | 100 KB | Warning |
| Images | 1 MB | Warning |
| Fonts | 200 KB | Warning |

### Additional Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| Time to Interactive (TTI) | < 3.5s | When page becomes fully interactive |
| Max Potential FID | < 100ms | Maximum First Input Delay |
| DOM Size | < 1500 nodes | Total DOM elements |
| Bootup Time | < 3s | JavaScript execution time |
| Main Thread Work | < 4s | Total main thread blocking |

## Running Tests

### Available Commands

```bash
# Run complete test suite (recommended)
npm run perf:test

# Only collect metrics (no assertions)
npm run perf:collect

# Only run assertions on existing reports
npm run perf:assert

# Upload reports to storage
npm run perf:upload

# Open interactive report viewer
npm run perf:report

# Parse latest report to terminal
npm run perf:parse

# Run in CI/CD mode
npm run perf:ci
```

### Test Workflow

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Run Lighthouse Tests**
   ```bash
   npm run perf:test
   ```

3. **Review Results**
   ```bash
   npm run perf:parse
   ```

### Custom URL Testing

To test a specific URL:

1. Start your server:
   ```bash
   npm run build && npm start
   ```

2. In another terminal, run Lighthouse:
   ```bash
   npx lhci collect --url=http://localhost:3000/your-page
   ```

## CI/CD Integration

### GitHub Actions

A GitHub Actions workflow is configured at `.github/workflows/lighthouse-ci.yml`.

#### Triggers

- Push to `main` branch
- Pull requests to `main` branch

#### Workflow Steps

1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Build application
5. Run Lighthouse CI
6. Upload reports as artifacts
7. Comment on PR with results (for pull requests)

#### Required Secrets

Add these to your GitHub repository secrets:

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex backend URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk authentication key |
| `LHCI_GITHUB_APP_TOKEN` | (Optional) Lighthouse CI GitHub app token |

#### Viewing Results

1. **In GitHub Actions**: Navigate to the workflow run and view the console output
2. **PR Comments**: Automated comments show key metrics on pull requests
3. **Artifacts**: Download full reports from the Actions artifacts

### Local CI Simulation

Test the CI configuration locally:

```bash
npm run perf:ci
```

## Interpreting Results

### Score Ranges

| Score | Rating | Color | Action |
|-------|--------|-------|--------|
| 90-100 | Good | Green | Maintain current performance |
| 50-89 | Needs Improvement | Orange | Investigate and optimize |
| 0-49 | Poor | Red | Urgent optimization required |

### Core Web Vitals Interpretation

#### First Contentful Paint (FCP)

- **Good**: < 1.8s
- **Needs Improvement**: 1.8s - 3.0s
- **Poor**: > 3.0s

Measures when the first text or image is painted.

**Common Issues**:
- Render-blocking resources
- Large JavaScript bundles
- Slow server response time

#### Largest Contentful Paint (LCP)

- **Good**: < 2.5s
- **Needs Improvement**: 2.5s - 4.0s
- **Poor**: > 4.0s

Measures when the largest content element is rendered.

**Common Issues**:
- Large images not optimized
- Slow server response
- Render-blocking JavaScript/CSS

#### Total Blocking Time (TBT)

- **Good**: < 200ms
- **Needs Improvement**: 200ms - 600ms
- **Poor**: > 600ms

Sum of all time periods where the main thread was blocked.

**Common Issues**:
- Long-running JavaScript
- Large third-party scripts
- Heavy client-side rendering

#### Cumulative Layout Shift (CLS)

- **Good**: < 0.1
- **Needs Improvement**: 0.1 - 0.25
- **Poor**: > 0.25

Measures visual stability of page content.

**Common Issues**:
- Images without dimensions
- Dynamic content insertion
- Web fonts causing layout shifts

#### Speed Index

- **Good**: < 3.4s
- **Needs Improvement**: 3.4s - 5.8s
- **Poor**: > 5.8s

How quickly content is visually displayed.

**Common Issues**:
- Slow resource loading
- Render-blocking resources
- Large above-the-fold content

### Report Sections

#### Opportunities

Lists optimization opportunities with estimated time savings:

- **Serve images in next-gen formats**: Use WebP/AVIF instead of PNG/JPG
- **Eliminate render-blocking resources**: Defer non-critical CSS/JS
- **Minify JavaScript/CSS**: Reduce file sizes
- **Properly size images**: Don't serve oversized images
- **Enable text compression**: Use gzip/brotli

#### Diagnostics

Technical details about page performance:

- **Avoid enormous network payloads**: Reduce total download size
- **Minimize main-thread work**: Optimize JavaScript execution
- **Reduce JavaScript execution time**: Profile and optimize code
- **Avoid chaining critical requests**: Optimize resource loading order

## Performance Dashboard

### Using the Dashboard Component

A React component is available for visualizing performance metrics:

```typescript
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';

export default function PerformancePage() {
  return <PerformanceDashboard />;
}
```

### Dashboard Features

- **Overview Tab**: Category scores and summary metrics
- **Core Web Vitals Tab**: Detailed view of each vital metric
- **Categories Tab**: In-depth category analysis

### Integrating Real Data

To display actual Lighthouse data:

1. Parse Lighthouse JSON reports
2. Extract metrics and scores
3. Pass as props to `PerformanceDashboard`

Example:

```typescript
const report = JSON.parse(fs.readFileSync('report.json', 'utf8'));

const metrics = [
  {
    name: 'First Contentful Paint',
    value: report.audits['first-contentful-paint'].numericValue,
    target: 1500,
    unit: 'ms',
    status: 'pass',
    description: 'Time until first content is painted',
  },
  // ... more metrics
];

<PerformanceDashboard metrics={metrics} />
```

## Optimization Guidelines

### General Performance Best Practices

1. **Code Splitting**
   - Use dynamic imports for large components
   - Implement route-based code splitting
   - Lazy load below-the-fold content

2. **Image Optimization**
   - Use Next.js Image component
   - Serve WebP/AVIF formats
   - Implement lazy loading
   - Provide proper width/height attributes

3. **JavaScript Optimization**
   - Minimize bundle size
   - Remove unused dependencies
   - Use tree shaking
   - Defer non-critical scripts

4. **CSS Optimization**
   - Remove unused CSS
   - Use critical CSS
   - Minimize stylesheet size
   - Defer non-critical styles

5. **Caching Strategy**
   - Implement proper Cache-Control headers
   - Use service workers for offline support
   - Cache static assets aggressively

### Next.js Specific Optimizations

1. **Static Generation**
   ```typescript
   export const getStaticProps = async () => {
     // Pre-render at build time
   };
   ```

2. **Image Component**
   ```typescript
   import Image from 'next/image';

   <Image
     src="/image.jpg"
     width={800}
     height={600}
     alt="Description"
     loading="lazy"
   />
   ```

3. **Font Optimization**
   ```typescript
   import { Inter } from 'next/font/google';

   const inter = Inter({ subsets: ['latin'] });
   ```

4. **Dynamic Imports**
   ```typescript
   const HeavyComponent = dynamic(() => import('@/components/Heavy'), {
     loading: () => <p>Loading...</p>,
   });
   ```

### Convex Backend Optimization

1. **Query Optimization**
   - Use indexes for frequently queried fields
   - Paginate large result sets
   - Cache query results when appropriate

2. **Action Optimization**
   - Minimize external API calls
   - Use batch operations
   - Implement proper error handling

## Troubleshooting

### Common Issues

#### Issue: Tests Timing Out

**Solution**: Increase timeout in `lighthouserc.js`:

```javascript
startServerReadyTimeout: 120000, // Increase to 2 minutes
```

#### Issue: Build Fails in CI

**Solution**: Ensure all environment variables are set in GitHub Secrets

#### Issue: Inconsistent Results

**Solution**:
- Increase `numberOfRuns` to 5 for more stable median
- Ensure no other processes are running during tests
- Use consistent network conditions

#### Issue: Performance Budget Failures

**Solution**:
1. Run `npm run perf:parse` to see which metrics failed
2. Review the "Opportunities" section for quick wins
3. Implement optimizations from the [Optimization Guidelines](#optimization-guidelines)
4. Re-run tests to verify improvements

#### Issue: Reports Not Generated

**Solution**:
1. Check that the server started successfully
2. Verify URLs are accessible
3. Check file permissions in `lighthouse-reports/` directory

### Debug Mode

Enable verbose logging:

```bash
LHCI_LOG_LEVEL=verbose npm run perf:test
```

### Manual Lighthouse Run

For debugging, run Lighthouse manually:

```bash
# Start server
npm run build && npm start

# In another terminal
npx lighthouse http://localhost:3000 --view
```

## Best Practices

1. **Regular Testing**
   - Run performance tests before every deploy
   - Monitor trends over time
   - Set up alerts for regressions

2. **Performance Budget Maintenance**
   - Review budgets quarterly
   - Adjust based on real user metrics
   - Keep budgets challenging but achievable

3. **Optimization Workflow**
   - Measure before optimizing
   - Focus on Core Web Vitals first
   - Test after each optimization
   - Monitor production metrics

4. **Documentation**
   - Document significant performance changes
   - Share optimization learnings with team
   - Update budgets when architecture changes

## Additional Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Documentation](https://github.com/GoogleChrome/lighthouse)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Core Web Vitals Guide](https://web.dev/learn-web-vitals/)

## Metrics Glossary

| Metric | Abbreviation | Description |
|--------|--------------|-------------|
| First Contentful Paint | FCP | Time to first text/image render |
| Largest Contentful Paint | LCP | Time to largest content render |
| Total Blocking Time | TBT | Sum of main thread blocking periods |
| Cumulative Layout Shift | CLS | Visual stability score |
| Time to Interactive | TTI | Time until fully interactive |
| Speed Index | SI | Visual display speed |
| First Input Delay | FID | Interactivity responsiveness |

## Support

For issues or questions:

1. Check this documentation
2. Review Lighthouse CI logs
3. Consult the [Troubleshooting](#troubleshooting) section
4. Check GitHub Actions workflow logs
5. Review bundle analysis reports

---

**Last Updated**: February 6, 2026
**Version**: 1.0.0
