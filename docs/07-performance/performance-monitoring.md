# Performance Monitoring

## Overview

Performance monitoring is essential for understanding how your application performs in real-world conditions and identifying areas for improvement. This document covers comprehensive performance monitoring strategies including Core Web Vitals, Real User Monitoring (RUM), performance budgets, and automated performance testing.

## Core Web Vitals Monitoring

### Understanding Core Web Vitals

Core Web Vitals are Google's standardized metrics for measuring user experience:

**1. Largest Contentful Paint (LCP)**
- Measures loading performance
- Should occur within 2.5 seconds of page load
- Represents when the main content is visible

**2. First Input Delay (FID)**
- Measures interactivity
- Should be less than 100 milliseconds
- Represents the time from first user interaction to browser response

**3. Cumulative Layout Shift (CLS)**
- Measures visual stability
- Should be less than 0.1
- Represents unexpected layout shifts

### Implementing Core Web Vitals Monitoring

**Basic Core Web Vitals Collection:**
```javascript
class CoreWebVitalsMonitor {
  constructor() {
    this.metrics = {};
    this.observers = [];
  }

  init() {
    this.measureLCP();
    this.measureFID();
    this.measureCLS();
  }

  measureLCP() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.metrics.lcp = {
        value: lastEntry.startTime,
        rating: this.getRating(lastEntry.startTime, 2500, 4000),
        id: lastEntry.id,
        url: lastEntry.url
      };
      
      this.reportMetric('lcp', this.metrics.lcp);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }

  measureFID() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      
      entries.forEach((entry) => {
        this.metrics.fid = {
          value: entry.processingStart - entry.startTime,
          rating: this.getRating(entry.processingStart - entry.startTime, 100, 300)
        };
        
        this.reportMetric('fid', this.metrics.fid);
      });
    }).observe({ entryTypes: ['first-input'] });
  }

  measureCLS() {
    let clsValue = 0;
    
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.metrics.cls = {
            value: clsValue,
            rating: this.getRating(clsValue, 0.1, 0.25)
          };
        }
      }
      
      this.reportMetric('cls', this.metrics.cls);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  getRating(value, goodThreshold, poorThreshold) {
    if (value <= goodThreshold) return 'good';
    if (value <= poorThreshold) return 'needs-improvement';
    return 'poor';
  }

  reportMetric(name, metric) {
    // Send to analytics service
    this.sendToAnalytics({
      name: `web-vital-${name}`,
      value: metric.value,
      rating: metric.rating,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  }

  sendToAnalytics(data) {
    // Implementation depends on your analytics provider
    // Example with Google Analytics
    if (window.gtag) {
      window.gtag('event', data.name, {
        event_category: 'Web Vitals',
        value: Math.round(data.value),
        metric_rating: data.rating
      });
    }
    
    // Example with custom endpoint
    fetch('/api/performance-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(console.error);
  }
}

// Initialize monitoring
const monitor = new CoreWebVitalsMonitor();
monitor.init();
```

**Advanced Core Web Vitals with Context:**
```javascript
class AdvancedWebVitalsMonitor extends CoreWebVitalsMonitor {
  constructor() {
    super();
    this.context = this.collectContext();
  }

  collectContext() {
    return {
      connection: this.getConnectionInfo(),
      device: this.getDeviceInfo(),
      viewport: this.getViewportInfo(),
      timing: this.getTimingInfo()
    };
  }

  getConnectionInfo() {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    return null;
  }

  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  }

  getViewportInfo() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      }
    };
  }

  getTimingInfo() {
    const timing = performance.timing;
    return {
      navigationStart: timing.navigationStart,
      loadEventEnd: timing.loadEventEnd,
      domContentLoaded: timing.domContentLoadedEventEnd,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint()
    };
  }

  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fpEntry = paintEntries.find(entry => entry.name === 'first-paint');
    return fpEntry ? fpEntry.startTime : null;
  }

  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : null;
  }

  reportMetric(name, metric) {
    this.sendToAnalytics({
      name: `web-vital-${name}`,
      value: metric.value,
      rating: metric.rating,
      timestamp: Date.now(),
      url: window.location.href,
      context: this.context
    });
  }
}
```

## Real User Monitoring (RUM)

### RUM Implementation Strategy

**Comprehensive RUM Setup:**
```javascript
class RealUserMonitoring {
  constructor(config = {}) {
    this.config = {
      endpoint: config.endpoint || '/api/rum',
      sampleRate: config.sampleRate || 1.0,
      enableConsoleLogging: config.enableConsoleLogging || false,
      ...config
    };
    
    this.metrics = {
      navigation: {},
      resources: [],
      errors: [],
      interactions: [],
      custom: {}
    };
    
    this.init();
  }

  init() {
    this.collectNavigationMetrics();
    this.collectResourceMetrics();
    this.collectErrorMetrics();
    this.collectInteractionMetrics();
    this.setupPageVisibilityTracking();
    
    // Send metrics on page unload
    window.addEventListener('beforeunload', () => {
      this.sendMetrics();
    });
    
    // Send metrics periodically
    setInterval(() => {
      this.sendMetrics();
    }, 30000);
  }

  collectNavigationMetrics() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      this.metrics.navigation = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ssl: navigation.secureConnectionStart > 0 ? 
             navigation.connectEnd - navigation.secureConnectionStart : 0,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domParse: navigation.domContentLoadedEventStart - navigation.responseEnd,
        domReady: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      };
    }
  }

  collectResourceMetrics() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.metrics.resources.push({
              name: entry.name,
              type: entry.initiatorType,
              duration: entry.duration,
              size: entry.transferSize,
              cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
              timestamp: Date.now()
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  }

  collectErrorMetrics() {
    window.addEventListener('error', (event) => {
      this.metrics.errors.push({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now()
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.errors.push({
        type: 'promise',
        message: event.reason.toString(),
        timestamp: Date.now()
      });
    });
  }

  collectInteractionMetrics() {
    let interactionStartTime = 0;
    
    ['click', 'keydown', 'scroll'].forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        interactionStartTime = performance.now();
        
        // Measure interaction response time
        requestAnimationFrame(() => {
          const responseTime = performance.now() - interactionStartTime;
          
          this.metrics.interactions.push({
            type: eventType,
            responseTime,
            timestamp: Date.now(),
            target: event.target.tagName
          });
        });
      }, { passive: true });
    });
  }

  setupPageVisibilityTracking() {
    let visibilityStartTime = Date.now();
    
    document.addEventListener('visibilitychange', () => {
      const duration = Date.now() - visibilityStartTime;
      
      this.metrics.custom.pageVisibility = {
        hidden: document.hidden,
        duration,
        timestamp: Date.now()
      };
      
      visibilityStartTime = Date.now();
    });
  }

  addCustomMetric(name, value, metadata = {}) {
    this.metrics.custom[name] = {
      value,
      metadata,
      timestamp: Date.now()
    };
  }

  sendMetrics() {
    if (Math.random() > this.config.sampleRate) return;
    
    const payload = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: this.getConnectionInfo(),
      metrics: this.metrics
    };

    if (this.config.enableConsoleLogging) {
      console.log('RUM Metrics:', payload);
    }

    // Send to server
    this.sendToServer(payload);
    
    // Reset metrics
    this.metrics = {
      navigation: this.metrics.navigation, // Keep navigation metrics
      resources: [],
      errors: [],
      interactions: [],
      custom: {}
    };
  }

  sendToServer(payload) {
    // Use sendBeacon if available for better reliability
    if ('sendBeacon' in navigator) {
      navigator.sendBeacon(this.config.endpoint, JSON.stringify(payload));
    } else {
      fetch(this.config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(console.error);
    }
  }

  getConnectionInfo() {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      };
    }
    return null;
  }
}

// Initialize RUM
const rum = new RealUserMonitoring({
  endpoint: '/api/performance-metrics',
  sampleRate: 0.1, // Sample 10% of users
  enableConsoleLogging: process.env.NODE_ENV === 'development'
});
```

### Performance Budget Monitoring

**Performance Budget Implementation:**
```javascript
class PerformanceBudget {
  constructor(budgets) {
    this.budgets = budgets;
    this.violations = [];
  }

  checkBudgets() {
    this.violations = [];
    
    Object.entries(this.budgets).forEach(([metric, budget]) => {
      const actualValue = this.getMetricValue(metric);
      const violation = this.checkMetric(metric, actualValue, budget);
      
      if (violation) {
        this.violations.push(violation);
      }
    });
    
    return this.violations;
  }

  getMetricValue(metric) {
    switch (metric) {
      case 'first-contentful-paint':
        return this.getFirstContentfulPaint();
      
      case 'largest-contentful-paint':
        return this.getLargestContentfulPaint();
      
      case 'first-input-delay':
        return this.getFirstInputDelay();
      
      case 'cumulative-layout-shift':
        return this.getCumulativeLayoutShift();
      
      case 'total-blocking-time':
        return this.getTotalBlockingTime();
      
      case 'bundle-size':
        return this.getBundleSize();
      
      default:
        return 0;
    }
  }

  checkMetric(metric, value, budget) {
    const exceeded = value > budget.limit;
    
    if (exceeded) {
      return {
        metric,
        value,
        limit: budget.limit,
        exceeded: true,
        severity: budget.severity || 'warning',
        message: `${metric} exceeded budget: ${value} > ${budget.limit}`
      };
    }
    
    return null;
  }

  getFirstContentfulPaint() {
    const entries = performance.getEntriesByType('paint');
    const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }

  getLargestContentfulPaint() {
    const entries = performance.getEntriesByType('largest-contentful-paint');
    return entries.length > 0 ? entries[entries.length - 1].startTime : 0;
  }

  getFirstInputDelay() {
    // This would be collected from FID observer
    return window.__FID_VALUE || 0;
  }

  getCumulativeLayoutShift() {
    // This would be collected from CLS observer
    return window.__CLS_VALUE || 0;
  }

  getTotalBlockingTime() {
    const entries = performance.getEntriesByType('measure');
    const tbtEntries = entries.filter(entry => entry.name === 'total-blocking-time');
    return tbtEntries.length > 0 ? tbtEntries[0].duration : 0;
  }

  getBundleSize() {
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(r => r.name.endsWith('.js'));
    return jsResources.reduce((total, resource) => total + (resource.transferSize || 0), 0);
  }

  reportViolations() {
    const violations = this.checkBudgets();
    
    if (violations.length > 0) {
      console.warn('Performance budget violations:', violations);
      
      // Send to monitoring service
      this.sendViolations(violations);
    }
    
    return violations;
  }

  sendViolations(violations) {
    fetch('/api/performance-budget-violations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: Date.now(),
        url: window.location.href,
        violations,
        userAgent: navigator.userAgent
      })
    }).catch(console.error);
  }
}

// Define performance budgets
const budgets = {
  'first-contentful-paint': {
    limit: 1800, // 1.8 seconds
    severity: 'error'
  },
  'largest-contentful-paint': {
    limit: 2500, // 2.5 seconds
    severity: 'error'
  },
  'first-input-delay': {
    limit: 100, // 100ms
    severity: 'warning'
  },
  'cumulative-layout-shift': {
    limit: 0.1,
    severity: 'warning'
  },
  'total-blocking-time': {
    limit: 300, // 300ms
    severity: 'warning'
  },
  'bundle-size': {
    limit: 500 * 1024, // 500KB
    severity: 'error'
  }
};

// Initialize budget monitoring
const budget = new PerformanceBudget(budgets);

// Check budgets on page load
window.addEventListener('load', () => {
  setTimeout(() => {
    budget.reportViolations();
  }, 1000);
});
```

## Automated Performance Testing

### Lighthouse CI Integration

**Lighthouse CI Configuration:**
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/profile'
      ],
      startServerCommand: 'npm start',
      startServerReadyPattern: 'ready',
      startServerReadyTimeout: 20000,
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Resource limits
        'resource-summary:document:size': ['error', { maxNumericValue: 50000 }],
        'resource-summary:script:size': ['error', { maxNumericValue: 500000 }],
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 100000 }],
        'resource-summary:image:size': ['warn', { maxNumericValue: 1000000 }],
        
        // Best practices
        'uses-responsive-images': 'error',
        'uses-optimized-images': 'error',
        'uses-text-compression': 'error',
        'render-blocking-resources': 'warn',
        'unminified-css': 'error',
        'unminified-javascript': 'error'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

**Custom Performance Testing Script:**
```javascript
// performance-test.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

class PerformanceTester {
  constructor(config) {
    this.config = {
      urls: config.urls || ['http://localhost:3000'],
      thresholds: config.thresholds || {},
      outputDir: config.outputDir || './performance-reports',
      ...config
    };
  }

  async runTests() {
    const browser = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const results = [];

    try {
      for (const url of this.config.urls) {
        console.log(`Testing: ${url}`);
        
        const result = await this.runLighthouse(url, browser.port);
        results.push({
          url,
          ...result
        });
      }
      
      this.generateReport(results);
      this.checkThresholds(results);
      
    } finally {
      await browser.kill();
    }
  }

  async runLighthouse(url, port) {
    const runnerResult = await lighthouse(url, {
      port,
      output: 'json',
      logLevel: 'info',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
    });

    return {
      scores: {
        performance: runnerResult.lhr.categories.performance.score * 100,
        accessibility: runnerResult.lhr.categories.accessibility.score * 100,
        bestPractices: runnerResult.lhr.categories['best-practices'].score * 100,
        seo: runnerResult.lhr.categories.seo.score * 100
      },
      metrics: {
        firstContentfulPaint: runnerResult.lhr.audits['first-contentful-paint'].numericValue,
        largestContentfulPaint: runnerResult.lhr.audits['largest-contentful-paint'].numericValue,
        cumulativeLayoutShift: runnerResult.lhr.audits['cumulative-layout-shift'].numericValue,
        totalBlockingTime: runnerResult.lhr.audits['total-blocking-time'].numericValue,
        speedIndex: runnerResult.lhr.audits['speed-index'].numericValue
      },
      opportunities: runnerResult.lhr.audits,
      timestamp: Date.now()
    };
  }

  generateReport(results) {
    const report = {
      timestamp: Date.now(),
      summary: this.generateSummary(results),
      details: results
    };

    // Save JSON report
    const jsonPath = path.join(this.config.outputDir, `performance-report-${Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Save HTML report
    const htmlPath = path.join(this.config.outputDir, `performance-report-${Date.now()}.html`);
    fs.writeFileSync(htmlPath, this.generateHTMLReport(report));

    console.log(`Reports saved to ${this.config.outputDir}`);
  }

  generateSummary(results) {
    const summary = {
      averageScores: {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0
      },
      averageMetrics: {
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        totalBlockingTime: 0,
        speedIndex: 0
      },
      violations: []
    };

    // Calculate averages
    results.forEach(result => {
      Object.keys(summary.averageScores).forEach(key => {
        summary.averageScores[key] += result.scores[key];
      });
      
      Object.keys(summary.averageMetrics).forEach(key => {
        summary.averageMetrics[key] += result.metrics[key];
      });
    });

    Object.keys(summary.averageScores).forEach(key => {
      summary.averageScores[key] /= results.length;
    });

    Object.keys(summary.averageMetrics).forEach(key => {
      summary.averageMetrics[key] /= results.length;
    });

    // Check for violations
    results.forEach(result => {
      Object.entries(this.config.thresholds).forEach(([metric, threshold]) => {
        if (result.metrics[metric] && result.metrics[metric] > threshold) {
          summary.violations.push({
            url: result.url,
            metric,
            value: result.metrics[metric],
            threshold
          });
        }
      });
    });

    return summary;
  }

  checkThresholds(results) {
    const violations = [];
    
    results.forEach(result => {
      Object.entries(this.config.thresholds).forEach(([metric, threshold]) => {
        if (result.metrics[metric] && result.metrics[metric] > threshold) {
          violations.push({
            url: result.url,
            metric,
            value: result.metrics[metric],
            threshold,
            exceeded: result.metrics[metric] - threshold
          });
        }
      });
    });

    if (violations.length > 0) {
      console.error('Performance threshold violations:');
      violations.forEach(v => {
        console.error(`  ${v.url}: ${v.metric} = ${v.value} (threshold: ${v.threshold})`);
      });
      
      process.exit(1);
    }
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
        .metric { display: inline-block; margin-right: 20px; }
        .violation { color: red; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Performance Test Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <div class="metric">Average Performance: ${report.summary.averageScores.performance.toFixed(2)}</div>
        <div class="metric">Average Accessibility: ${report.summary.averageScores.accessibility.toFixed(2)}</div>
        <div class="metric">Average Best Practices: ${report.summary.averageScores.bestPractices.toFixed(2)}</div>
        <div class="metric">Average SEO: ${report.summary.averageScores.seo.toFixed(2)}</div>
    </div>
    
    <h2>Violations</h2>
    ${report.summary.violations.length === 0 ? '<p>No violations found.</p>' : 
      `<ul>${report.summary.violations.map(v => `<li class="violation">${v.url}: ${v.metric} exceeded threshold</li>`).join('')}</ul>`}
    
    <h2>Details</h2>
    <table>
        <tr>
            <th>URL</th>
            <th>Performance</th>
            <th>FCP</th>
            <th>LCP</th>
            <th>CLS</th>
            <th>TBT</th>
        </tr>
        ${report.details.map(d => `
        <tr>
            <td>${d.url}</td>
            <td>${d.scores.performance.toFixed(2)}</td>
            <td>${d.metrics.firstContentfulPaint.toFixed(2)}</td>
            <td>${d.metrics.largestContentfulPaint.toFixed(2)}</td>
            <td>${d.metrics.cumulativeLayoutShift.toFixed(3)}</td>
            <td>${d.metrics.totalBlockingTime.toFixed(2)}</td>
        </tr>
        `).join('')}
    </table>
</body>
</html>
    `;
  }
}

// Usage
const tester = new PerformanceTester({
  urls: [
    'http://localhost:3000',
    'http://localhost:3000/dashboard',
    'http://localhost:3000/profile'
  ],
  thresholds: {
    firstContentfulPaint: 1800,
    largestContentfulPaint: 2500,
    cumulativeLayoutShift: 0.1,
    totalBlockingTime: 300
  },
  outputDir: './performance-reports'
});

tester.runTests().catch(console.error);
```

## Performance Dashboards

### Custom Performance Dashboard

**Performance Dashboard Backend:**
```javascript
// dashboard-server.js
const express = require('express');
const app = express();

// In-memory storage (use database in production)
let performanceData = [];

app.use(express.json());

// API endpoint to receive performance data
app.post('/api/performance-metrics', (req, res) => {
  performanceData.push({
    ...req.body,
    receivedAt: Date.now()
  });
  
  res.status(200).json({ success: true });
});

// API endpoint to get performance analytics
app.get('/api/performance-analytics', (req, res) => {
  const analytics = {
    webVitals: calculateWebVitalsStats(),
    performanceTrends: calculatePerformanceTrends(),
    errorRates: calculateErrorRates(),
    userExperience: calculateUserExperience()
  };
  
  res.json(analytics);
});

function calculateWebVitalsStats() {
  const recentData = performanceData.filter(d => d.timestamp > Date.now() - 24 * 60 * 60 * 1000);
  
  return {
    lcp: calculatePercentiles(recentData.map(d => d.metrics?.lcp?.value).filter(Boolean)),
    fid: calculatePercentiles(recentData.map(d => d.metrics?.fid?.value).filter(Boolean)),
    cls: calculatePercentiles(recentData.map(d => d.metrics?.cls?.value).filter(Boolean))
  };
}

function calculatePercentiles(values) {
  if (values.length === 0) return { p50: 0, p75: 0, p95: 0, p99: 0 };
  
  values.sort((a, b) => a - b);
  
  return {
    p50: values[Math.floor(values.length * 0.5)],
    p75: values[Math.floor(values.length * 0.75)],
    p95: values[Math.floor(values.length * 0.95)],
    p99: values[Math.floor(values.length * 0.99)]
  };
}

function calculatePerformanceTrends() {
  // Group data by hour and calculate averages
  const hourlyData = {};
  
  performanceData.forEach(d => {
    const hour = new Date(d.timestamp).getHours();
    if (!hourlyData[hour]) hourlyData[hour] = [];
    hourlyData[hour].push(d);
  });
  
  return Object.entries(hourlyData).map(([hour, data]) => ({
    hour: parseInt(hour),
    averageLCP: calculateAverage(data.map(d => d.metrics?.lcp?.value).filter(Boolean)),
    averageFID: calculateAverage(data.map(d => d.metrics?.fid?.value).filter(Boolean)),
    averageCLS: calculateAverage(data.map(d => d.metrics?.cls?.value).filter(Boolean))
  }));
}

function calculateAverage(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculateErrorRates() {
  const totalSessions = performanceData.length;
  const errorSessions = performanceData.filter(d => d.metrics?.errors?.length > 0).length;
  
  return {
    errorRate: totalSessions > 0 ? (errorSessions / totalSessions) * 100 : 0,
    totalErrors: performanceData.reduce((sum, d) => sum + (d.metrics?.errors?.length || 0), 0),
    errorTypes: countErrorTypes()
  };
}

function countErrorTypes() {
  const errorCounts = {};
  
  performanceData.forEach(d => {
    d.metrics?.errors?.forEach(error => {
      errorCounts[error.type] = (errorCounts[error.type] || 0) + 1;
    });
  });
  
  return errorCounts;
}

function calculateUserExperience() {
  const goodLCP = performanceData.filter(d => d.metrics?.lcp?.rating === 'good').length;
  const goodFID = performanceData.filter(d => d.metrics?.fid?.rating === 'good').length;
  const goodCLS = performanceData.filter(d => d.metrics?.cls?.rating === 'good').length;
  
  return {
    goodLCPPercentage: (goodLCP / performanceData.length) * 100,
    goodFIDPercentage: (goodFID / performanceData.length) * 100,
    goodCLSPercentage: (goodCLS / performanceData.length) * 100
  };
}

app.listen(3001, () => {
  console.log('Performance dashboard server running on port 3001');
});
```

**Performance Dashboard Frontend:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Performance Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .dashboard-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
        .metric-value { font-size: 2em; font-weight: bold; }
        .metric-label { color: #666; margin-top: 5px; }
    </style>
</head>
<body>
    <h1>Performance Dashboard</h1>
    
    <div class="dashboard-grid">
        <div class="card">
            <h3>LCP (Largest Contentful Paint)</h3>
            <div class="metric-value" id="lcp-value">--</div>
            <div class="metric-label">Good: <span id="lcp-good">--</span>%</div>
        </div>
        
        <div class="card">
            <h3>FID (First Input Delay)</h3>
            <div class="metric-value" id="fid-value">--</div>
            <div class="metric-label">Good: <span id="fid-good">--</span>%</div>
        </div>
        
        <div class="card">
            <h3>CLS (Cumulative Layout Shift)</h3>
            <div class="metric-value" id="cls-value">--</div>
            <div class="metric-label">Good: <span id="cls-good">--</span>%</div>
        </div>
    </div>
    
    <div style="margin-top: 20px;">
        <canvas id="trends-chart" width="400" height="200"></canvas>
    </div>

    <script>
        class PerformanceDashboard {
            constructor() {
                this.charts = {};
                this.init();
            }

            async init() {
                await this.loadAnalytics();
                this.setupCharts();
                this.startPolling();
            }

            async loadAnalytics() {
                try {
                    const response = await fetch('/api/performance-analytics');
                    const data = await response.json();
                    
                    this.updateMetrics(data);
                    this.updateCharts(data);
                } catch (error) {
                    console.error('Failed to load analytics:', error);
                }
            }

            updateMetrics(data) {
                // Update LCP metrics
                const lcp = data.webVitals.lcp;
                document.getElementById('lcp-value').textContent = `${lcp.p75}ms`;
                document.getElementById('lcp-good').textContent = data.userExperience.goodLCPPercentage.toFixed(1);

                // Update FID metrics
                const fid = data.webVitals.fid;
                document.getElementById('fid-value').textContent = `${fid.p75}ms`;
                document.getElementById('fid-good').textContent = data.userExperience.goodFIDPercentage.toFixed(1);

                // Update CLS metrics
                const cls = data.webVitals.cls;
                document.getElementById('cls-value').textContent = cls.p75.toFixed(3);
                document.getElementById('cls-good').textContent = data.userExperience.goodCLSPercentage.toFixed(1);
            }

            setupCharts() {
                const ctx = document.getElementById('trends-chart').getContext('2d');
                
                this.charts.trends = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [
                            {
                                label: 'LCP (ms)',
                                data: [],
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            },
                            {
                                label: 'FID (ms)',
                                data: [],
                                borderColor: 'rgb(255, 99, 132)',
                                tension: 0.1
                            },
                            {
                                label: 'CLS',
                                data: [],
                                borderColor: 'rgb(255, 205, 86)',
                                tension: 0.1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            updateCharts(data) {
                const trends = data.performanceTrends;
                
                this.charts.trends.data.labels = trends.map(t => `${t.hour}:00`);
                this.charts.trends.data.datasets[0].data = trends.map(t => t.averageLCP);
                this.charts.trends.data.datasets[1].data = trends.map(t => t.averageFID);
                this.charts.trends.data.datasets[2].data = trends.map(t => t.averageCLS);
                
                this.charts.trends.update();
            }

            startPolling() {
                setInterval(() => {
                    this.loadAnalytics();
                }, 30000); // Update every 30 seconds
            }
        }

        // Initialize dashboard
        new PerformanceDashboard();
    </script>
</body>
</html>
```

## Best Practices Summary

### 1. Core Web Vitals Monitoring
- Implement real-time Core Web Vitals collection
- Add context (connection, device, viewport) to metrics
- Set up automated alerting for poor performance
- Track trends over time

### 2. Real User Monitoring
- Collect comprehensive performance data
- Monitor errors and user interactions
- Implement sampling for high-traffic sites
- Use sendBeacon for reliable data transmission

### 3. Performance Budgets
- Define clear performance budgets
- Automate budget checking in CI/CD
- Set appropriate thresholds for different metrics
- Monitor budget violations and trends

### 4. Automated Testing
- Integrate Lighthouse CI into your workflow
- Test multiple pages and user flows
- Set up performance regression detection
- Generate detailed performance reports

### 5. Performance Dashboards
- Create real-time performance dashboards
- Visualize trends and patterns
- Set up alerting for performance degradation
- Share performance data with stakeholders

### 6. Performance Monitoring Checklist
- [ ] Core Web Vitals monitoring implemented
- [ ] Real User Monitoring (RUM) in place
- [ ] Performance budgets defined and monitored
- [ ] Automated performance testing in CI/CD
- [ ] Performance dashboard created
- [ ] Alerting configured for performance issues
- [ ] Regular performance reviews scheduled

Remember: Performance monitoring is an ongoing process. Regularly review your metrics, update your budgets, and optimize based on real user data to maintain excellent performance over time.