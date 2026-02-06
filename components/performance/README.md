# Performance Dashboard Component

React component for visualizing Lighthouse CI performance metrics.

## Usage

```typescript
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';

export default function PerformancePage() {
  return <PerformanceDashboard />;
}
```

## Props

### `metrics` (optional)

Array of performance metrics with the following structure:

```typescript
interface PerformanceMetric {
  name: string;           // Metric name (e.g., "First Contentful Paint")
  value: number;          // Current value
  target: number;         // Target value
  unit: string;           // Unit of measurement (e.g., "ms", "")
  status: 'pass' | 'warn' | 'fail';  // Current status
  description: string;    // Metric description
}
```

### `categories` (optional)

Array of category scores:

```typescript
interface CategoryScore {
  name: string;           // Category name (e.g., "Performance")
  score: number;          // Score (0-100)
  description: string;    // Category description
}
```

### `lastRun` (optional)

String representing when the last test was run (e.g., "2026-02-06 03:30 PM").

## Example with Real Data

```typescript
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';
import lighthouseReport from './lighthouse-report.json';

const metrics = [
  {
    name: 'First Contentful Paint',
    value: lighthouseReport.audits['first-contentful-paint'].numericValue,
    target: 1500,
    unit: 'ms',
    status: lighthouseReport.audits['first-contentful-paint'].numericValue <= 1500 ? 'pass' : 'fail',
    description: 'Time until first content is painted',
  },
  // ... more metrics
];

const categories = [
  {
    name: 'Performance',
    score: Math.round(lighthouseReport.categories.performance.score * 100),
    description: 'Overall performance score',
  },
  // ... more categories
];

export default function PerformancePage() {
  return (
    <PerformanceDashboard
      metrics={metrics}
      categories={categories}
      lastRun={new Date().toLocaleString()}
    />
  );
}
```

## Features

- **Overview Tab**: Category scores and summary metrics
- **Core Web Vitals Tab**: Detailed breakdown of each performance metric
- **Categories Tab**: In-depth analysis of Lighthouse categories
- Color-coded status indicators
- Progress bars for visual representation
- Responsive design

## Dependencies

- `@/components/ui/card`
- `@/components/ui/badge`
- `@/components/ui/progress`
- `@/components/ui/tabs`
- `lucide-react` icons
