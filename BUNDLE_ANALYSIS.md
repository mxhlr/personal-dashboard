# Bundle Analysis Report

Generated: February 6, 2026

## Setup

Bundle analysis has been configured using `@next/bundle-analyzer`. The configuration enables detailed webpack bundle visualization when running the analyze command.

### How to Run Analysis

```bash
npm run analyze
```

This will:
1. Create a production build with `ANALYZE=true`
2. Generate three HTML reports in `.next/analyze/`:
   - `client.html` - Client-side JavaScript bundles
   - `nodejs.html` - Server-side Node.js bundles
   - `edge.html` - Edge runtime bundles
3. Automatically open the reports in your browser for interactive exploration

## Current Bundle Sizes

### Route Analysis (First Load JS)

| Route | Size | First Load JS | Notes |
|-------|------|---------------|-------|
| `/` | 30.2 kB | 241 kB | Main dashboard page (largest) |
| `/daily-log` | 7.68 kB | 229 kB | Daily logging interface |
| `/setup` | 10.4 kB | 178 kB | Setup wizard |
| `/habits` | 1.76 kB | 195 kB | Habits management |
| `/habits-demo` | 1.76 kB | 195 kB | Habits demo page |
| `/test-custom-field` | 1.95 kB | 138 kB | Custom field testing |
| `/cleanup-now` | 1.66 kB | 113 kB | Cleanup utility |
| `/font-test` | 130 B | 102 kB | Font testing page |
| `/api/cleanup-fields` | 130 B | 102 kB | API route |
| `/api/fix-custom-fields` | 130 B | 102 kB | API route |
| `/_not-found` | 992 B | 103 kB | 404 page |

### Shared Bundles

- **Total Shared JS**: 102 kB
  - `chunks/255-35bf8c00c5dde345.js`: 46 kB
  - `chunks/4bd1b696-c023c6e3521b1417.js`: 54.2 kB
  - Other shared chunks: 2.15 kB

### Middleware

- **Size**: 86.8 kB

## Analysis Findings

### Largest Pages

1. **Home Page (`/`)**: 241 kB First Load JS
   - This is the main dashboard and likely includes most UI components
   - Consider code splitting if certain features are not immediately needed

2. **Daily Log (`/daily-log`)**: 229 kB First Load JS
   - Second largest page
   - May benefit from lazy loading of complex components

3. **Habits Pages**: 195 kB First Load JS
   - Both `/habits` and `/habits-demo` have identical sizes
   - Good candidate for shared component optimization

### Key Observations

1. **Shared Chunks**: 102 kB of shared JavaScript across all routes
   - This is cached across page navigations, which is good
   - The split is reasonable with two main chunks (~46 kB and ~54 kB)

2. **Route-Specific Code**: Varies from 130 B to 30.2 kB
   - Most routes have small individual bundles (< 2 kB)
   - The home page is an outlier at 30.2 kB

3. **Middleware Size**: 86.8 kB
   - This affects all routes as it runs on every request
   - Consider reviewing authentication and routing logic

## Optimization Recommendations

### High Priority

1. **Analyze Home Page Components**
   - The 30.2 kB route-specific code on `/` suggests heavy component usage
   - Review if all components need to be loaded immediately
   - Consider lazy loading modals, settings panels, or secondary features

2. **Review Large Dependencies**
   - Open the interactive reports to identify the largest npm packages
   - Common culprits: date libraries, chart libraries, icon sets
   - Check if any large dependencies can be:
     - Replaced with lighter alternatives
     - Tree-shaken more effectively
     - Lazy loaded on demand

3. **Code Splitting Opportunities**
   - Settings modal and coach panel could be lazy loaded
   - Vision board and advanced features could load on demand
   - Consider dynamic imports for heavy UI components

### Medium Priority

4. **Shared Chunk Optimization**
   - Review the 54.2 kB shared chunk for optimization opportunities
   - Check if any rarely-used libraries are included in shared bundles
   - Consider splitting into more granular chunks if beneficial

5. **Icon Library Optimization**
   - The app uses both `lucide-react` and `@tabler/icons-react`
   - Consider consolidating to one icon library
   - Use tree-shaking to only import used icons

6. **Date Library Review**
   - `date-fns` is imported - ensure only needed functions are used
   - Consider replacing with native `Intl` APIs where possible

### Low Priority

7. **Middleware Optimization**
   - Review Clerk authentication middleware for optimization
   - Consider if all middleware logic is necessary

8. **Font Loading**
   - Review custom font loading strategy
   - Consider using `font-display: swap` for better performance

## Dependency Analysis

### Large Dependencies to Review

Based on package.json, these libraries likely contribute significantly to bundle size:

1. **UI Libraries**
   - `@radix-ui/*` components (multiple packages)
   - `@tabler/icons-react` (icon library)
   - `lucide-react` (icon library)
   - Consider: Consolidate icon libraries, use tree-shaking

2. **Data/Chart Libraries**
   - `recharts` (charting library)
   - `@tanstack/react-table` (table library)
   - Consider: Lazy load charts, evaluate if full library is needed

3. **DnD Libraries**
   - `@dnd-kit/*` (drag and drop)
   - Consider: Lazy load if DnD is not core to initial render

4. **Authentication**
   - `@clerk/nextjs`, `@clerk/clerk-react`, `@clerk/themes`
   - Note: Required for auth, but review if all features are needed

5. **Date Handling**
   - `date-fns`
   - Consider: Import only specific functions, use native APIs

## Monitoring Strategy

### Regular Checks

1. **After Major Feature Additions**
   - Run `npm run analyze` after adding new dependencies
   - Review impact on bundle size before merging

2. **Monthly Reviews**
   - Check bundle sizes monthly to catch creep
   - Compare with previous reports to track trends

3. **Performance Budget**
   - Current baseline: ~240 kB First Load JS for main pages
   - Recommended: Keep First Load JS under 300 kB
   - Alert if any page exceeds 350 kB

### CI/CD Integration (Future)

Consider adding bundle size checks to CI/CD pipeline:
- Fail builds if bundle size increases by > 10%
- Post bundle size comparison comments on PRs
- Track bundle size over time with visualization

## Specific Optimization Opportunities

### 1. Icon Library Consolidation

**Current State:**
- Using both `lucide-react` and `@tabler/icons-react`
- Two icon libraries increase bundle size unnecessarily

**Recommendation:**
```typescript
// Choose one icon library (lucide-react is recommended as it's more modern)
// Replace Tabler icons with Lucide equivalents
// Example migration:
import { IconSettings } from '@tabler/icons-react'; // Remove
import { Settings } from 'lucide-react'; // Use this instead
```

**Expected Savings:** ~20-40 kB (depending on usage)

### 2. Code Splitting for Heavy Components

**Components to Lazy Load:**

```typescript
// In app/page.tsx or layout
import dynamic from 'next/dynamic';

// Settings modal - only loaded when user clicks settings
const SettingsModal = dynamic(() =>
  import('@/components/settings/SettingsModal').then(mod => ({ default: mod.SettingsModal })),
  { loading: () => <div>Loading...</div> }
);

// Coach panel - only loaded when user opens coach
const CoachPanel = dynamic(() =>
  import('@/components/coach/CoachPanel').then(mod => ({ default: mod.CoachPanel })),
  { loading: () => <div>Loading...</div> }
);

// Vision board - only loaded on specific pages
const VisionBoard = dynamic(() =>
  import('@/components/vision-board/VisionBoard'),
  { ssr: false } // Vision board doesn't need SSR
);
```

**Expected Savings:** ~30-50 kB initial load, moved to on-demand loading

### 3. Chart Library Optimization

**Current State:**
- Using `recharts` for data visualization
- Recharts is relatively heavy (~100 kB+)

**Recommendation:**
```typescript
// Lazy load charts only when needed
import dynamic from 'next/dynamic';

const HabitChart = dynamic(() =>
  import('@/components/analytics/HabitChart'),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse bg-muted" />
  }
);

// Or consider switching to a lighter alternative like:
// - Chart.js (smaller footprint)
// - Victory (more modular)
// - Custom SVG charts for simple visualizations
```

**Expected Savings:** ~40-60 kB if lazy loaded, more if using custom SVGs for simple charts

### 4. Date Library Optimization

**Current State:**
- Using `date-fns` (good choice, but could be optimized)

**Recommendation:**
```typescript
// Only import specific functions you need
import { format, parseISO, addDays } from 'date-fns'; // Good
// Instead of:
import * as dateFns from 'date-fns'; // Bad

// For simple operations, use native APIs:
const today = new Date().toLocaleDateString('de-DE');
const timestamp = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit'
}).format(new Date());
```

**Expected Savings:** ~10-20 kB

### 5. Radix UI Optimization

**Current State:**
- Using 11 different `@radix-ui` packages
- Each package adds to bundle size

**Recommendation:**
- Radix UI is well tree-shaken, keep using it
- Ensure you're importing components correctly:

```typescript
// Correct (tree-shakeable)
import { Dialog } from '@radix-ui/react-dialog';

// Avoid if possible (imports everything)
import * as Dialog from '@radix-ui/react-dialog';
```

**Expected Impact:** Minimal if already using correct imports

### 6. DnD Kit Optimization

**Current State:**
- Using `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`, `@dnd-kit/utilities`

**Recommendation:**
```typescript
// Only load DnD on pages that need it
// If DnD is only used in specific features, lazy load them
const SortableHabitList = dynamic(() =>
  import('@/components/habits/SortableHabitList')
);
```

**Expected Savings:** ~15-25 kB if lazy loaded

### 7. Remove Unused Dependencies

**Potential Candidates:**
- `radix-ui` (1.4.3) - Check if this is used separately from `@radix-ui/*` packages
- Check if all DnD kit packages are necessary

**Action:**
```bash
# Audit unused dependencies
npx depcheck

# Remove unused dependencies
npm uninstall <package-name>
```

## Implementation Priority Matrix

| Optimization | Effort | Impact | Savings | Priority |
|--------------|--------|--------|---------|----------|
| Icon library consolidation | Medium | High | 20-40 kB | 1 |
| Lazy load settings/coach | Low | High | 30-50 kB | 1 |
| Lazy load charts | Low | Medium | 40-60 kB | 2 |
| Date-fns optimization | Low | Low | 10-20 kB | 3 |
| Lazy load DnD | Medium | Medium | 15-25 kB | 3 |
| Remove unused deps | Low | Low | 5-10 kB | 4 |

**Total Potential Savings:** 120-205 kB (could reduce First Load JS from 241 kB to ~120-160 kB)

## Next Steps

1. Open the interactive HTML reports:
   ```bash
   open .next/analyze/client.html
   open .next/analyze/nodejs.html
   open .next/analyze/edge.html
   ```

2. Verify the largest packages in each bundle match these recommendations

3. Implement optimizations in priority order:
   - Week 1: Icon library consolidation + lazy load modals
   - Week 2: Lazy load charts and analytics
   - Week 3: Date library optimization + cleanup
   - Week 4: Review and measure improvements

4. After each optimization:
   ```bash
   npm run analyze
   # Compare bundle sizes before/after
   ```

5. Document improvements in this file

## Tools Reference

### Bundle Analyzer Configuration

Location: `/Users/michaelhuller/Komand/Projects/personal-dashboard/next.config.ts`

```typescript
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
```

### NPM Script

Location: `/Users/michaelhuller/Komand/Projects/personal-dashboard/package.json`

```json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build"
  }
}
```

## Related Documentation

- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Next.js Optimizing](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev - Code Splitting](https://web.dev/code-splitting-suspense/)
