/**
 * Utilities for parsing and working with Lighthouse CI reports
 */

export interface LighthouseReport {
  categories: {
    performance: { score: number };
    accessibility: { score: number };
    'best-practices': { score: number };
    seo: { score: number };
  };
  audits: {
    [key: string]: {
      score: number | null;
      numericValue?: number;
      displayValue?: string;
      title: string;
      description: string;
    };
  };
}

export interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'pass' | 'warn' | 'fail';
  description: string;
}

export interface CategoryScore {
  name: string;
  score: number;
  description: string;
}

/**
 * Get status based on value and target
 */
export function getMetricStatus(
  value: number,
  target: number,
  warnThreshold = 0.9
): 'pass' | 'warn' | 'fail' {
  if (value <= target) return 'pass';
  if (value <= target / warnThreshold) return 'warn';
  return 'fail';
}

/**
 * Parse Lighthouse report into performance metrics
 */
export function parsePerformanceMetrics(report: LighthouseReport): PerformanceMetric[] {
  const metrics: PerformanceMetric[] = [];

  // First Contentful Paint
  const fcp = report.audits['first-contentful-paint'];
  if (fcp && fcp.numericValue !== undefined) {
    metrics.push({
      name: 'First Contentful Paint',
      value: Math.round(fcp.numericValue),
      target: 1500,
      unit: 'ms',
      status: getMetricStatus(fcp.numericValue, 1500),
      description: 'Time until first content is painted',
    });
  }

  // Largest Contentful Paint
  const lcp = report.audits['largest-contentful-paint'];
  if (lcp && lcp.numericValue !== undefined) {
    metrics.push({
      name: 'Largest Contentful Paint',
      value: Math.round(lcp.numericValue),
      target: 2500,
      unit: 'ms',
      status: getMetricStatus(lcp.numericValue, 2500),
      description: 'Time until largest content is painted',
    });
  }

  // Total Blocking Time
  const tbt = report.audits['total-blocking-time'];
  if (tbt && tbt.numericValue !== undefined) {
    metrics.push({
      name: 'Total Blocking Time',
      value: Math.round(tbt.numericValue),
      target: 200,
      unit: 'ms',
      status: getMetricStatus(tbt.numericValue, 200),
      description: 'Sum of blocking time periods',
    });
  }

  // Cumulative Layout Shift
  const cls = report.audits['cumulative-layout-shift'];
  if (cls && cls.numericValue !== undefined) {
    metrics.push({
      name: 'Cumulative Layout Shift',
      value: Math.round(cls.numericValue * 1000) / 1000,
      target: 0.1,
      unit: '',
      status: getMetricStatus(cls.numericValue, 0.1),
      description: 'Visual stability metric',
    });
  }

  // Speed Index
  const si = report.audits['speed-index'];
  if (si && si.numericValue !== undefined) {
    metrics.push({
      name: 'Speed Index',
      value: Math.round(si.numericValue),
      target: 3000,
      unit: 'ms',
      status: getMetricStatus(si.numericValue, 3000),
      description: 'How quickly content is visually displayed',
    });
  }

  return metrics;
}

/**
 * Parse Lighthouse report into category scores
 */
export function parseCategoryScores(report: LighthouseReport): CategoryScore[] {
  const categories: CategoryScore[] = [];

  if (report.categories.performance) {
    categories.push({
      name: 'Performance',
      score: Math.round(report.categories.performance.score * 100),
      description: 'Overall performance score',
    });
  }

  if (report.categories.accessibility) {
    categories.push({
      name: 'Accessibility',
      score: Math.round(report.categories.accessibility.score * 100),
      description: 'Accessibility compliance',
    });
  }

  if (report.categories['best-practices']) {
    categories.push({
      name: 'Best Practices',
      score: Math.round(report.categories['best-practices'].score * 100),
      description: 'Web development best practices',
    });
  }

  if (report.categories.seo) {
    categories.push({
      name: 'SEO',
      score: Math.round(report.categories.seo.score * 100),
      description: 'Search engine optimization',
    });
  }

  return categories;
}

/**
 * Get overall performance summary
 */
export function getPerformanceSummary(report: LighthouseReport) {
  const metrics = parsePerformanceMetrics(report);
  const categories = parseCategoryScores(report);

  const passedMetrics = metrics.filter((m) => m.status === 'pass').length;
  const totalMetrics = metrics.length;

  const avgScore =
    categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length;

  return {
    metrics,
    categories,
    passedMetrics,
    totalMetrics,
    passRate: (passedMetrics / totalMetrics) * 100,
    avgScore,
    status:
      avgScore >= 90 ? 'excellent' : avgScore >= 50 ? 'good' : 'needs-improvement',
  };
}

/**
 * Format metric value for display
 */
export function formatMetricValue(value: number, unit: string): string {
  if (unit === 'ms') {
    return value >= 1000 ? `${(value / 1000).toFixed(2)}s` : `${value}ms`;
  }
  if (unit === '') {
    return value.toFixed(3);
  }
  return `${value}${unit}`;
}

/**
 * Get color class based on score
 */
export function getScoreColorClass(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 50) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get status color class
 */
export function getStatusColorClass(status: 'pass' | 'warn' | 'fail'): string {
  switch (status) {
    case 'pass':
      return 'text-green-600';
    case 'warn':
      return 'text-orange-600';
    case 'fail':
      return 'text-red-600';
  }
}
