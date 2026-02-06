'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Clock,
  Gauge,
  Image,
  Layout,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'pass' | 'warn' | 'fail';
  description: string;
}

interface CategoryScore {
  name: string;
  score: number;
  description: string;
}

interface PerformanceDashboardProps {
  metrics?: PerformanceMetric[];
  categories?: CategoryScore[];
  lastRun?: string;
}

const defaultMetrics: PerformanceMetric[] = [
  {
    name: 'First Contentful Paint',
    value: 1200,
    target: 1500,
    unit: 'ms',
    status: 'pass',
    description: 'Time until first content is painted',
  },
  {
    name: 'Largest Contentful Paint',
    value: 2200,
    target: 2500,
    unit: 'ms',
    status: 'pass',
    description: 'Time until largest content is painted',
  },
  {
    name: 'Total Blocking Time',
    value: 150,
    target: 200,
    unit: 'ms',
    status: 'pass',
    description: 'Sum of blocking time periods',
  },
  {
    name: 'Cumulative Layout Shift',
    value: 0.05,
    target: 0.1,
    unit: '',
    status: 'pass',
    description: 'Visual stability metric',
  },
  {
    name: 'Speed Index',
    value: 2800,
    target: 3000,
    unit: 'ms',
    status: 'pass',
    description: 'How quickly content is visually displayed',
  },
];

const defaultCategories: CategoryScore[] = [
  { name: 'Performance', score: 95, description: 'Overall performance score' },
  { name: 'Accessibility', score: 92, description: 'Accessibility compliance' },
  { name: 'Best Practices', score: 96, description: 'Web development best practices' },
  { name: 'SEO', score: 100, description: 'Search engine optimization' },
];

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 50) return 'text-orange-600';
  return 'text-red-600';
};

const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
  if (score >= 90) return 'default';
  if (score >= 50) return 'secondary';
  return 'destructive';
};

const getStatusIcon = (status: 'pass' | 'warn' | 'fail') => {
  switch (status) {
    case 'pass':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'warn':
      return <AlertCircle className="h-5 w-5 text-orange-600" />;
    case 'fail':
      return <XCircle className="h-5 w-5 text-red-600" />;
  }
};

const getMetricIcon = (name: string) => {
  if (name.includes('Paint')) return <Image className="h-5 w-5" aria-label="Paint metric" />;
  if (name.includes('Blocking')) return <Clock className="h-5 w-5" aria-label="Blocking metric" />;
  if (name.includes('Layout')) return <Layout className="h-5 w-5" aria-label="Layout metric" />;
  if (name.includes('Speed')) return <Zap className="h-5 w-5" aria-label="Speed metric" />;
  return <Activity className="h-5 w-5" aria-label="Performance metric" />;
};

export function PerformanceDashboard({
  metrics = defaultMetrics,
  categories = defaultCategories,
  lastRun = 'Never',
}: PerformanceDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">Monitor your application&apos;s performance metrics</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Last Run</p>
          <p className="text-sm font-medium">{lastRun}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Card key={category.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{category.score}</div>
                  <Progress value={category.score} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>
                Overview of all performance metrics and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.map((metric) => (
                  <div key={metric.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(metric.status)}
                      <div className="flex items-center gap-2">
                        {getMetricIcon(metric.name)}
                        <span className="font-medium">{metric.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {metric.value}
                        {metric.unit} / {metric.target}
                        {metric.unit}
                      </span>
                      <Badge
                        variant={
                          metric.status === 'pass'
                            ? 'default'
                            : metric.status === 'warn'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {metric.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          {metrics.map((metric) => (
            <Card key={metric.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getMetricIcon(metric.name)}
                    <div>
                      <CardTitle>{metric.name}</CardTitle>
                      <CardDescription>{metric.description}</CardDescription>
                    </div>
                  </div>
                  {getStatusIcon(metric.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current: {metric.value}{metric.unit}</span>
                    <span>Target: &lt; {metric.target}{metric.unit}</span>
                  </div>
                  <Progress
                    value={Math.min((metric.value / metric.target) * 100, 100)}
                    className={
                      metric.status === 'pass'
                        ? '[&>div]:bg-green-600'
                        : metric.status === 'warn'
                          ? '[&>div]:bg-orange-600'
                          : '[&>div]:bg-red-600'
                    }
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {metric.value <= metric.target
                        ? `${((1 - metric.value / metric.target) * 100).toFixed(1)}% under budget`
                        : `${((metric.value / metric.target - 1) * 100).toFixed(1)}% over budget`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((category) => (
              <Card key={category.name}>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-4xl font-bold ${getScoreColor(category.score)}`}>
                        {category.score}
                      </span>
                      <Badge variant={getScoreBadgeVariant(category.score)}>
                        {category.score >= 90 ? 'GOOD' : category.score >= 50 ? 'NEEDS IMPROVEMENT' : 'POOR'}
                      </Badge>
                    </div>
                    <Progress value={category.score} />
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>
                        <div className="h-2 w-full bg-red-600 rounded" />
                        <span>0-49</span>
                      </div>
                      <div>
                        <div className="h-2 w-full bg-orange-600 rounded" />
                        <span>50-89</span>
                      </div>
                      <div>
                        <div className="h-2 w-full bg-green-600 rounded" />
                        <span>90-100</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
