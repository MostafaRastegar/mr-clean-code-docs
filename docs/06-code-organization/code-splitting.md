# Code Splitting

## Overview

Code splitting is a technique that breaks down your application's code into smaller chunks that can be loaded on demand. This improves initial load times, reduces bundle size, and enhances user experience by only loading the code that's actually needed.

## Why Code Splitting Matters

### Performance Benefits

1. **Faster Initial Load**: Users only download the code needed for the current view
2. **Reduced Bundle Size**: Smaller initial bundles mean faster downloads
3. **Better Caching**: Smaller chunks can be cached more effectively
4. **Improved User Experience**: Faster perceived performance

### When to Use Code Splitting

- Large applications with multiple routes/views
- Applications with heavy libraries used infrequently
- Feature-rich applications with optional functionality
- Applications targeting users with slower internet connections

## Dynamic Imports

### Basic Dynamic Imports

**Traditional Static Import:**
```javascript
// This loads the entire module immediately
import { heavyFunction } from './heavy-module';

function useHeavyFunction() {
  return heavyFunction();
}
```

**Dynamic Import:**
```javascript
// This loads the module only when needed
async function useHeavyFunction() {
  const { heavyFunction } = await import('./heavy-module');
  return heavyFunction();
}
```

### Dynamic Imports with Error Handling

```javascript
async function loadModuleSafely(modulePath) {
  try {
    const module = await import(modulePath);
    return module;
  } catch (error) {
    console.error(`Failed to load module: ${modulePath}`, error);
    throw new Error(`Module loading failed: ${modulePath}`);
  }
}

// Usage
async function initializeFeature() {
  try {
    const featureModule = await loadModuleSafely('./feature-module');
    featureModule.initialize();
  } catch (error) {
    // Fallback or error handling
    console.log('Feature not available');
  }
}
```

## Route-Based Code Splitting

### React Router Implementation

```tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));

function App() {
  return (
    <div className="app">
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Suspense>
    </div>
  );
}
```

### Vue Router Implementation

```javascript
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/dashboard',
    component: () => import('./views/Dashboard.vue')
  },
  {
    path: '/profile',
    component: () => import('./views/Profile.vue')
  },
  {
    path: '/settings',
    component: () => import('./views/Settings.vue')
  },
  {
    path: '/analytics',
    component: () => import('./views/Analytics.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
```

### Angular Route-Based Splitting

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
  }
];
```

## Component-Based Code Splitting

### Lazy Loading Components

```tsx
import { lazy, Suspense, useState } from 'react';

// Lazy load heavy components
const HeavyChart = lazy(() => import('./components/HeavyChart'));
const DataGrid = lazy(() => import('./components/DataGrid'));
const ImageGallery = lazy(() => import('./components/ImageGallery'));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  return (
    <div className="dashboard">
      <button onClick={() => setShowChart(!showChart)}>
        Toggle Chart
      </button>
      <button onClick={() => setShowGrid(!showGrid)}>
        Toggle Data Grid
      </button>
      <button onClick={() => setShowGallery(!showGallery)}>
        Toggle Gallery
      </button>

      {showChart && (
        <Suspense fallback={<div>Loading Chart...</div>}>
          <HeavyChart />
        </Suspense>
      )}

      {showGrid && (
        <Suspense fallback={<div>Loading Data Grid...</div>}>
          <DataGrid />
        </Suspense>
      )}

      {showGallery && (
        <Suspense fallback={<div>Loading Gallery...</div>}>
          <ImageGallery />
        </Suspense>
      )}
    </div>
  );
}
```

### Conditional Loading Based on User Actions

```tsx
import { useState, useCallback } from 'react';

function FeatureToggle() {
  const [featureLoaded, setFeatureLoaded] = useState(false);
  const [FeatureComponent, setFeatureComponent] = useState<React.ComponentType | null>(null);

  const loadFeature = useCallback(async () => {
    if (featureLoaded) return;

    try {
      const module = await import('./expensive-feature');
      setFeatureComponent(() => module.default);
      setFeatureLoaded(true);
    } catch (error) {
      console.error('Failed to load feature:', error);
    }
  }, [featureLoaded]);

  return (
    <div>
      <button onClick={loadFeature} disabled={featureLoaded}>
        {featureLoaded ? 'Feature Loaded' : 'Load Expensive Feature'}
      </button>
      
      {FeatureComponent && <FeatureComponent />}
    </div>
  );
}
```

## Library-Based Code Splitting

### Tree Shaking with Libraries

**❌ Bad: Importing entire libraries**
```javascript
import _ from 'lodash';
import * as moment from 'moment';
import { Chart } from 'chart.js';

// This imports the entire lodash library
const result = _.map(array, fn);
```

**✅ Good: Selective imports**
```javascript
// Import only what you need
import map from 'lodash/map';
import { format } from 'date-fns';
import { Chart, LineElement, PointElement } from 'chart.js';

const result = map(array, fn);
```

### Dynamic Library Loading

```javascript
// Load heavy libraries only when needed
async function loadChartLibrary() {
  const { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } = 
    await import('chart.js');

  Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);
  
  return Chart;
}

// Usage
async function renderChart() {
  const Chart = await loadChartLibrary();
  // Create and render chart
}
```

## Bundle Analysis and Optimization

### Analyzing Bundle Size

**Using webpack-bundle-analyzer:**
```javascript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  // ... other config
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};
```

**Using source-map-explorer:**
```bash
npm install --save-dev source-map-explorer
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

### Identifying Large Dependencies

```javascript
// Create a bundle analysis script
const { execSync } = require('child_process');

function analyzeBundle() {
  try {
    execSync('npx webpack-bundle-analyzer build/static/js/*.js --mode static --report bundle-report.html', {
      stdio: 'inherit'
    });
    console.log('Bundle analysis complete. Open bundle-report.html to view results.');
  } catch (error) {
    console.error('Bundle analysis failed:', error);
  }
}

analyzeBundle();
```

## Performance Monitoring

### Measuring Code Splitting Impact

```javascript
// Performance monitoring utility
class PerformanceMonitor {
  static measureChunkLoadTime(chunkName) {
    const startTime = performance.now();
    
    return {
      end: () => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        console.log(`${chunkName} loaded in ${loadTime.toFixed(2)}ms`);
        
        // Send to analytics
        if (window.gtag) {
          window.gtag('event', 'chunk_load', {
            event_category: 'performance',
            event_label: chunkName,
            value: Math.round(loadTime)
          });
        }
      }
    };
  }

  static measureInitialLoad() {
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      console.log(`Initial page load: ${loadTime.toFixed(2)}ms`);
    });
  }
}

// Usage in dynamic imports
async function loadComponentWithMonitoring(componentPath, componentName) {
  const monitor = PerformanceMonitor.measureChunkLoadTime(componentName);
  
  try {
    const component = await import(componentPath);
    monitor.end();
    return component;
  } catch (error) {
    console.error(`Failed to load ${componentName}:`, error);
    throw error;
  }
}
```

### Loading States and UX

```tsx
import { useState, Suspense } from 'react';

// Custom loading component with progress
function LoadingSpinner({ message = 'Loading...' }) {
  const [progress, setProgress] = useState(0);

  // Simulate progress for better UX
  useState(() => {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    return () => clearInterval(interval);
  });

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>{message}</p>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

// Usage
function App() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
      <MainContent />
    </Suspense>
  );
}
```

## Advanced Code Splitting Strategies

### Preloading Strategies

```javascript
// Preload critical chunks
function preloadCriticalChunks() {
  // Preload chunks that will be needed soon
  const criticalChunks = [
    './components/CriticalComponent',
    './services/CriticalService'
  ];

  criticalChunks.forEach(chunk => {
    import(/* webpackPreload: true */ chunk).catch(error => {
      console.warn(`Failed to preload chunk: ${chunk}`, error);
    });
  });
}

// Preload on user interaction
function setupPreloading() {
  // Preload on hover
  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    if (target.dataset.preload) {
      import(/* webpackChunkName: "preload-[request]" */ `./${target.dataset.preload}`);
    }
  });

  // Preload on scroll
  window.addEventListener('scroll', () => {
    const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    
    if (scrollPercentage > 50) {
      import(/* webpackChunkName: "below-fold" */ './components/BelowFoldComponents');
    }
  });
}
```

### Conditional Loading Based on Environment

```javascript
// Environment-based loading
async function loadEnvironmentSpecificCode() {
  if (process.env.NODE_ENV === 'development') {
    // Load development tools
    const { whyDidYouRender } = await import('@welldone-software/why-did-you-render');
    whyDidYouRender(React);
  }

  if (process.env.NODE_ENV === 'production') {
    // Load production optimizations
    const { initGA } = await import('./analytics/ga');
    initGA();
  }
}
```

### Feature Flag Based Loading

```javascript
// Feature flag based code splitting
async function loadFeatureBasedOnFlag(featureName) {
  const featureFlags = await fetchFeatureFlags();
  
  if (featureFlags[featureName]) {
    switch (featureName) {
      case 'advancedAnalytics':
        return import('./features/AdvancedAnalytics');
      case 'premiumUI':
        return import('./features/PremiumUI');
      case 'experimentalFeatures':
        return import('./features/ExperimentalFeatures');
      default:
        throw new Error(`Unknown feature: ${featureName}`);
    }
  } else {
    console.log(`Feature ${featureName} is disabled`);
    return null;
  }
}
```

## Build Configuration

### Webpack Configuration

```javascript
// webpack.config.js
module.exports = {
  // ... other config
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
  }
};
```

### Vite Configuration

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          charts: ['recharts', 'd3-scale'],
        }
      }
    }
  }
};
```

### Next.js Configuration

```javascript
// next.config.js
module.exports = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        // Custom chunk splitting
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /node_modules/,
          priority: 20,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    };
    return config;
  },
};
```

## Best Practices

### 1. Strategic Splitting Points

```javascript
// Good candidates for code splitting
const splitPoints = [
  'Routes/views that are not immediately visible',
  'Heavy libraries used infrequently',
  'Feature modules behind feature flags',
  'Admin panels or dashboards',
  'Modals and dialogs',
  'Print or export functionality',
  'Advanced settings or configurations'
];

// Avoid splitting
const avoidSplitting = [
  'Core application logic',
  'Frequently used utilities',
  'Small components (< 1KB)',
  'Authentication and routing logic'
];
```

### 2. Error Boundaries for Dynamic Imports

```tsx
import { Component } from 'react';

class DynamicImportErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dynamic import error:', error, errorInfo);
    
    // Report to error tracking service
    if (window.sentry) {
      window.sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong loading this component</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<DynamicImportErrorBoundary>
  <Suspense fallback={<div>Loading...</div>}>
    <LazyComponent />
  </Suspense>
</DynamicImportErrorBoundary>
```

### 3. Caching Strategies

```javascript
// Implement caching for dynamic imports
const moduleCache = new Map();

async function cachedImport(modulePath) {
  if (moduleCache.has(modulePath)) {
    return moduleCache.get(modulePath);
  }

  try {
    const module = await import(modulePath);
    moduleCache.set(modulePath, module);
    return module;
  } catch (error) {
    console.error(`Failed to load module ${modulePath}:`, error);
    throw error;
  }
}

// Cache invalidation
function invalidateModuleCache(modulePath) {
  moduleCache.delete(modulePath);
}
```

### 4. Monitoring and Analytics

```javascript
// Track code splitting performance
class CodeSplittingMonitor {
  static trackChunkLoad(chunkName, loadTime) {
    // Send to analytics
    analytics.track('chunk_loaded', {
      chunk_name: chunkName,
      load_time: loadTime,
      timestamp: Date.now()
    });
  }

  static trackChunkError(chunkName, error) {
    analytics.track('chunk_error', {
      chunk_name: chunkName,
      error_message: error.message,
      timestamp: Date.now()
    });
  }
}

// Integration with dynamic imports
async function monitoredImport(modulePath, chunkName) {
  const startTime = performance.now();
  
  try {
    const module = await import(modulePath);
    const loadTime = performance.now() - startTime;
    
    CodeSplittingMonitor.trackChunkLoad(chunkName, loadTime);
    return module;
  } catch (error) {
    CodeSplittingMonitor.trackChunkError(chunkName, error);
    throw error;
  }
}
```

Remember: Code splitting is a powerful optimization technique, but it should be applied strategically. Focus on the user experience, measure the impact, and continuously monitor performance to ensure your splitting strategy is effective.