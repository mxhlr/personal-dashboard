#!/usr/bin/env node

/**
 * Parse Lighthouse CI reports and generate a summary
 * Usage: node scripts/parse-lighthouse-report.js [report-file.json]
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function getScoreColor(score) {
  if (score >= 0.9) return 'green';
  if (score >= 0.5) return 'yellow';
  return 'red';
}

function getScoreEmoji(score) {
  if (score >= 0.9) return '✅';
  if (score >= 0.5) return '⚠️';
  return '❌';
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function parseReport(reportPath) {
  if (!fs.existsSync(reportPath)) {
    console.error(colorize(`Error: Report file not found: ${reportPath}`, 'red'));
    process.exit(1);
  }

  const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const { categories, audits } = reportData;

  console.log('\n' + colorize('='.repeat(80), 'cyan'));
  console.log(colorize('  LIGHTHOUSE CI PERFORMANCE REPORT', 'bold'));
  console.log(colorize('='.repeat(80), 'cyan') + '\n');

  // Display category scores
  console.log(colorize('CATEGORY SCORES', 'bold'));
  console.log('-'.repeat(80));

  Object.entries(categories).forEach(([key, category]) => {
    const score = Math.round(category.score * 100);
    const color = getScoreColor(category.score);
    const emoji = getScoreEmoji(category.score);

    console.log(
      `${emoji} ${category.title.padEnd(20)} ${colorize(score.toString().padStart(3), color)}%`
    );
  });

  // Display Core Web Vitals
  console.log('\n' + colorize('CORE WEB VITALS', 'bold'));
  console.log('-'.repeat(80));

  const coreWebVitals = [
    {
      key: 'first-contentful-paint',
      name: 'First Contentful Paint',
      target: 1500,
      unit: 'ms',
    },
    {
      key: 'largest-contentful-paint',
      name: 'Largest Contentful Paint',
      target: 2500,
      unit: 'ms',
    },
    {
      key: 'total-blocking-time',
      name: 'Total Blocking Time',
      target: 200,
      unit: 'ms',
    },
    {
      key: 'cumulative-layout-shift',
      name: 'Cumulative Layout Shift',
      target: 0.1,
      unit: '',
    },
    {
      key: 'speed-index',
      name: 'Speed Index',
      target: 3000,
      unit: 'ms',
    },
  ];

  coreWebVitals.forEach(({ key, name, target, unit }) => {
    const audit = audits[key];
    if (audit) {
      const value = audit.numericValue;
      const displayValue = audit.displayValue;
      const passed = value <= target;
      const emoji = passed ? '✅' : '❌';
      const color = passed ? 'green' : 'red';

      console.log(
        `${emoji} ${name.padEnd(30)} ${colorize(displayValue.padStart(12), color)} (target: < ${target}${unit})`
      );
    }
  });

  // Display Resource Summary
  console.log('\n' + colorize('RESOURCE SUMMARY', 'bold'));
  console.log('-'.repeat(80));

  const resourceAudit = audits['resource-summary'];
  if (resourceAudit && resourceAudit.details && resourceAudit.details.items) {
    resourceAudit.details.items.forEach((item) => {
      const size = formatBytes(item.size);
      const count = item.requestCount;

      console.log(
        `${item.resourceType.padEnd(20)} ${count.toString().padStart(4)} requests   ${size.padStart(12)}`
      );
    });
  }

  // Display Opportunities (top 5)
  console.log('\n' + colorize('TOP OPTIMIZATION OPPORTUNITIES', 'bold'));
  console.log('-'.repeat(80));

  const opportunities = Object.entries(audits)
    .filter(([, audit]) => audit.details && audit.details.type === 'opportunity')
    .sort((a, b) => (b[1].numericValue || 0) - (a[1].numericValue || 0))
    .slice(0, 5);

  if (opportunities.length > 0) {
    opportunities.forEach(([, audit]) => {
      const savings = audit.displayValue || 'N/A';
      const score = audit.score || 0;
      const emoji = score >= 0.9 ? '✅' : score >= 0.5 ? '⚠️' : '❌';

      console.log(`${emoji} ${audit.title}`);
      console.log(`   Potential savings: ${colorize(savings, 'yellow')}`);
      if (audit.description) {
        console.log(`   ${audit.description.substring(0, 100)}...`);
      }
      console.log('');
    });
  } else {
    console.log('No optimization opportunities found! 🎉\n');
  }

  // Display Diagnostics (important issues)
  console.log(colorize('IMPORTANT DIAGNOSTICS', 'bold'));
  console.log('-'.repeat(80));

  const diagnostics = Object.entries(audits)
    .filter(([, audit]) =>
      audit.score !== null &&
      audit.score < 1 &&
      audit.details &&
      audit.details.type === 'table'
    )
    .sort((a, b) => a[1].score - b[1].score)
    .slice(0, 5);

  if (diagnostics.length > 0) {
    diagnostics.forEach(([, audit]) => {
      const score = Math.round((audit.score || 0) * 100);
      const emoji = getScoreEmoji(audit.score || 0);

      console.log(`${emoji} ${audit.title} (Score: ${score}%)`);
      if (audit.description) {
        console.log(`   ${audit.description.substring(0, 100)}...`);
      }
      console.log('');
    });
  } else {
    console.log('No diagnostic issues found! 🎉\n');
  }

  console.log(colorize('='.repeat(80), 'cyan') + '\n');
}

// Get report file from command line argument or find latest
const reportArg = process.argv[2];
let reportPath;

if (reportArg) {
  reportPath = path.resolve(reportArg);
} else {
  // Find latest report in lighthouse-reports directory
  const reportsDir = path.join(process.cwd(), 'lighthouse-reports');

  if (!fs.existsSync(reportsDir)) {
    console.error(colorize('Error: No lighthouse-reports directory found', 'red'));
    console.error('Run Lighthouse CI first: npm run perf:test');
    process.exit(1);
  }

  const reports = fs.readdirSync(reportsDir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({
      name: f,
      path: path.join(reportsDir, f),
      time: fs.statSync(path.join(reportsDir, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  if (reports.length === 0) {
    console.error(colorize('Error: No Lighthouse reports found', 'red'));
    console.error('Run Lighthouse CI first: npm run perf:test');
    process.exit(1);
  }

  reportPath = reports[0].path;
  console.log(colorize(`Using latest report: ${reports[0].name}`, 'cyan'));
}

parseReport(reportPath);
