# Lighthouse CI Quick Reference

## Quick Commands

```bash
# Run full performance test suite
npm run perf:test

# Parse latest report
npm run perf:parse

# Open interactive viewer
npm run perf:report

# Run in CI mode
npm run perf:ci
```

## Performance Budgets

| Metric | Target | Status |
|--------|--------|--------|
| First Contentful Paint | < 1.5s | Critical |
| Largest Contentful Paint | < 2.5s | Critical |
| Total Blocking Time | < 200ms | Critical |
| Cumulative Layout Shift | < 0.1 | Critical |
| Speed Index | < 3.0s | Critical |

## Score Thresholds

- 90-100: Good (Green)
- 50-89: Needs Improvement (Orange)
- 0-49: Poor (Red)

## Files & Directories

- `lighthouserc.js` - Main configuration
- `lighthouse-reports/` - Generated reports (gitignored)
- `.github/workflows/lighthouse-ci.yml` - CI/CD workflow
- `scripts/parse-lighthouse-report.js` - Report parser
- `components/performance/` - Dashboard components

## See Also

- [PERFORMANCE_TESTING.md](../PERFORMANCE_TESTING.md) - Full documentation
- [GitHub Actions Workflow](../.github/workflows/lighthouse-ci.yml)
- [Performance Dashboard](../components/performance/)
