---
paths:
  - "src/**/*.js"
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "**/*.js"
  - "**/*.ts"
  - "**/*.tsx"
---

# Performance

This directory contains comprehensive guidelines and best practices for optimizing JavaScript and TypeScript applications for maximum performance.

## Performance Principles

1. **Measure First**: Always measure performance before and after optimizations
2. **User-Centric**: Focus on metrics that matter to users (Core Web Vitals)
3. **Progressive Enhancement**: Build for performance from the start
4. **Continuous Monitoring**: Implement ongoing performance monitoring
5. **Balanced Approach**: Balance performance with maintainability and features

## Rendering Optimization

### ✅ Good Examples
```javascript
// Virtualization for long lists
import { FixedSizeList as List } from 'react-window';

function LongList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      Item {items[index].name}
    </div>
  );

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  );
}

// Efficient DOM manipulation
function updateList(items) {
  const fragment = document.createDocumentFragment();
  
  items.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item.name;
    fragment.appendChild(div);
  });
  
  listContainer.appendChild(fragment);
}

// CSS-in-JS performance considerations
const useStyles = makeStyles({
  root: {
    // Use transform instead of top/left for animations
    transform: 'translateY(0)',
    transition: 'transform 0.3s ease'
  }
});

// Image optimization and lazy loading
function ImageGallery({ images }) {
  return (
    <div>
      {images.map((image, index) => (
        <img
          key={image.id}
          src={image.thumbnail}
          data-src={image.fullSize}
          loading={index > 5 ? 'lazy' : 'eager'}
          alt={image.alt}
          className="lazyload"
        />
      ))}
    </div>
  );
}

// Component rendering optimization
function ExpensiveComponent({ data }) {
  const expensiveValue = useMemo(() => {
    return data.reduce((acc, item) => acc + item.value, 0);
  }, [data]);

  const handleClick = useCallback((id) => {
    // Handle click
  }, []);

  return (
    <div>
      <p>Total: {expensiveValue}</p>
      {data.map(item => (
        <button key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </button>
      ))}
    </div>
  );
}
```

### ❌ Bad Examples
```javascript
// Rendering long lists without virtualization
function LongList({ items }) {
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          {item.name}
        </div>
      ))}
    </div>
  );
}

// Inefficient DOM manipulation
function updateList(items) {
  items.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item.name;
    document.getElementById('list').appendChild(div); // DOM reflow on each append
  });
}

// CSS-in-JS performance issues
const useStyles = makeStyles({
  root: {
    // Using top/left instead of transform
    top: 0,
    left: 0,
    // Expensive box-shadow
    boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
  }
});

// Image optimization issues
function ImageGallery({ images }) {
  return (
    <div>
      {images.map(image => (
        <img
          key={image.id}
          src={image.fullSize} // Loading all images at once
          alt={image.alt}
        />
      ))}
    </div>
  );
}

// Component rendering issues
function ExpensiveComponent({ data }) {
  const expensiveValue = data.reduce((acc, item) => acc + item.value, 0); // Recalculated on every render

  const handleClick = (id) => {
    // Handle click - new function on every render
  };

  return (
    <div>
      <p>Total: {expensiveValue}</p>
      {data.map(item => (
        <button key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </button>
      ))}
    </div>
  );
}
```

## Memory Management

### ✅ Good Examples
```javascript
// Understanding JavaScript memory model
class DataProcessor {
  constructor() {
    this.cache = new Map();
    this.eventListeners = new Set();
  }

  processData(data) {
    // Use efficient data structures
    const result = new Map();
    
    for (const [key, value] of Object.entries(data)) {
      if (!this.cache.has(key)) {
        this.cache.set(key, this.expensiveComputation(value));
      }
      result.set(key, this.cache.get(key));
    }
    
    return result;
  }

  cleanup() {
    // Proper cleanup
    this.cache.clear();
    this.eventListeners.forEach(listener => listener.remove());
    this.eventListeners.clear();
  }
}

// Garbage collection optimization
function createLargeArray() {
  const array = new Array(1000000).fill(0);
  
  // Process array
  const result = array.map(item => item * 2);
  
  // Clear reference to help GC
  array.length = 0;
  
  return result;
}

// Memory leak prevention
class Component {
  constructor() {
    this.timer = null;
    this.eventListeners = [];
  }

  mount() {
    this.timer = setInterval(() => {
      // Update component
    }, 1000);

    const handler = () => {
      // Handle event
    };
    
    window.addEventListener('resize', handler);
    this.eventListeners.push({ target: window, type: 'resize', handler });
  }

  unmount() {
    // Cleanup to prevent memory leaks
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.eventListeners.forEach(({ target, type, handler }) => {
      target.removeEventListener(type, handler);
    });
    this.eventListeners = [];
  }
}

// Efficient data structures and algorithms
function findUserById(users, id) {
  // Use Map for O(1) lookup instead of Array.find() O(n)
  const userMap = new Map(users.map(user => [user.id, user]));
  return userMap.get(id);
}

// Resource cleanup best practices
class ResourceManager {
  constructor() {
    this.resources = new Set();
  }

  acquireResource() {
    const resource = new Resource();
    this.resources.add(resource);
    return resource;
  }

  releaseResource(resource) {
    resource.cleanup();
    this.resources.delete(resource);
  }

  cleanup() {
    this.resources.forEach(resource => resource.cleanup());
    this.resources.clear();
  }
}
```

### ❌ Bad Examples
```javascript
// Memory leaks
class Component {
  constructor() {
    this.data = [];
  }

  mount() {
    // Creating interval without cleanup
    setInterval(() => {
      this.data.push(new Date());
    }, 1000);

    // Adding event listeners without cleanup
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }
}

// Inefficient data structures
function findUserById(users, id) {
  // O(n) lookup
  return users.find(user => user.id === id);
}

// Not cleaning up resources
function processLargeData(data) {
  const result = [];
  
  for (let i = 0; i < data.length; i++) {
    result.push(expensiveOperation(data[i]));
  }
  
  // Not clearing intermediate data
  return result;
}

// Creating closures that hold references
function createHandlers(items) {
  return items.map(item => {
    return function handler() {
      console.log(item); // item is kept in memory
    };
  });
}
```

## Network Optimization

### ✅ Good Examples
```javascript
// HTTP/2 and HTTP/3 optimization strategies
// Use multiplexing - multiple requests over single connection
async function fetchMultipleResources() {
  const [user, posts, comments] = await Promise.all([
    fetch('/api/user'),
    fetch('/api/posts'),
    fetch('/api/comments')
  ]);
  
  return {
    user: await user.json(),
    posts: await posts.json(),
    comments: await comments.json()
  };
}

// Caching strategies and implementation
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.maxAge = 5 * 60 * 1000; // 5 minutes
  }

  async get(key, fetcher) {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  clear() {
    this.cache.clear();
  }
}

// Bundle size reduction techniques
// Use dynamic imports for code splitting
const LazyComponent = lazy(() => import('./HeavyComponent'));

// Tree shaking - only import what you need
import { debounce } from 'lodash-es'; // Specific function
// Instead of: import _ from 'lodash';

// CDN usage and optimization
function loadImageWithCDN(imageUrl) {
  const cdnUrl = imageUrl.replace('https://mydomain.com', 'https://cdn.mydomain.com');
  
  return fetch(cdnUrl)
    .then(response => response.blob())
    .then(blob => URL.createObjectURL(blob));
}

// API response optimization
async function fetchPaginatedData(endpoint, page = 1) {
  const response = await fetch(`${endpoint}?page=${page}&limit=20`);
  const data = await response.json();
  
  // Cache responses
  cacheResponse(`${endpoint}?page=${page}`, data);
  
  return data;
}
```

### ❌ Bad Examples
```javascript
// Sequential requests instead of parallel
async function fetchMultipleResources() {
  const user = await fetch('/api/user');
  const posts = await fetch('/api/posts');
  const comments = await fetch('/api/comments');
  
  return {
    user: await user.json(),
    posts: await posts.json(),
    comments: await comments.json()
  };
}

// No caching strategy
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json(); // Always fetches fresh data
}

// Importing entire libraries
import _ from 'lodash'; // Imports everything
import moment from 'moment'; // Large library

// No CDN usage
function loadImage(imageUrl) {
  return fetch(imageUrl) // Using origin server
    .then(response => response.blob())
    .then(blob => URL.createObjectURL(blob));
}

// No pagination
async function fetchAllData() {
  const response = await fetch('/api/data'); // Fetches all data at once
  return response.json();
}
```

## Build Optimization

### ✅ Good Examples
```javascript
// Webpack optimization techniques
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        }
      }
    },
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
};

// Tree shaking and dead code elimination
// Only export what's actually used
export function usedFunction() {
  return 'This is used';
}

// Don't export unused functions
// export function unusedFunction() {
//   return 'This is not used';
// }

// Code splitting strategies
// Route-based splitting
const routes = [
  {
    path: '/dashboard',
    component: lazy(() => import('./pages/Dashboard'))
  },
  {
    path: '/profile',
    component: lazy(() => import('./pages/Profile'))
  }
];

// Component-based splitting
function ProductList() {
  const [showDetails, setShowDetails] = useState(false);
  
  if (showDetails) {
    const ProductDetails = lazy(() => import('./ProductDetails'));
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <ProductDetails />
      </Suspense>
    );
  }
  
  return <div>Product list</div>;
}

// Bundle analysis and monitoring
// package.json
{
  "scripts": {
    "analyze": "webpack-bundle-analyzer dist/stats.json"
  }
}

// Development build optimization
module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  optimization: {
    minimize: false
  }
};
```

### ❌ Bad Examples
```javascript
// No build optimization
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
};

// No tree shaking
export function usedFunction() {
  return 'This is used';
}

export function unusedFunction() {
  return 'This is not used'; // Dead code
}

export function anotherUnusedFunction() {
  return 'This is also not used'; // Dead code
}

// No code splitting
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  return (
    <div>
      <Dashboard />
      <Profile />
      <Settings />
    </div>
  );
}

// No bundle analysis
// No way to monitor bundle size

// Development build with production optimizations
module.exports = {
  mode: 'development',
  optimization: {
    minimize: true // Slows down development builds
  }
};
```

## Performance Monitoring

### ✅ Good Examples
```javascript
// Performance metrics and measurement
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }

  measureRenderTime(componentName) {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const renderTime = end - start;
      
      this.metrics[componentName] = renderTime;
      
      // Send to monitoring service
      this.reportMetric('render_time', {
        component: componentName,
        duration: renderTime
      });
    };
  }

  measureApiCall(endpoint) {
    const start = performance.now();
    
    return (response) => {
      const end = performance.now();
      const duration = end - start;
      
      this.reportMetric('api_call', {
        endpoint,
        duration,
        status: response.status
      });
    };
  }

  reportMetric(type, data) {
    // Send to performance monitoring service
    if (window.performanceTracker) {
      window.performanceTracker.track(type, data);
    }
  }
}

// Real User Monitoring (RUM) implementation
class RUM {
  constructor() {
    this.metrics = {};
  }

  trackPageLoad() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      this.metrics.pageLoad = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        tls: navigation.secureConnectionStart > 0 ? 
             navigation.connectEnd - navigation.secureConnectionStart : 0,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domParse: navigation.domContentLoadedEventStart - navigation.responseEnd,
        domReady: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart
      };

      this.metrics.paint = {
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
      };

      this.reportMetrics();
    });
  }

  trackUserInteractions() {
    ['click', 'scroll', 'resize'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        const start = performance.now();
        
        // Track interaction response time
        requestAnimationFrame(() => {
          const end = performance.now();
          this.reportMetric('interaction', {
            type: eventType,
            responseTime: end - start
          });
        });
      });
    });
  }

  reportMetrics() {
    fetch('/api/performance-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.metrics)
    });
  }
}

// Performance budgets and thresholds
const PERFORMANCE_BUDGETS = {
  bundleSize: 250 * 1024, // 250KB
  firstContentfulPaint: 1800, // 1.8s
  largestContentfulPaint: 2500, // 2.5s
  firstInputDelay: 100, // 100ms
  cumulativeLayoutShift: 0.1
};

class BudgetChecker {
  checkBundleSize(bundle) {
    if (bundle.size > PERFORMANCE_BUDGETS.bundleSize) {
      console.warn(`Bundle size exceeds budget: ${bundle.size} > ${PERFORMANCE_BUDGETS.bundleSize}`);
      return false;
    }
    return true;
  }

  checkCoreWebVitals() {
    const vitals = this.getCoreWebVitals();
    
    Object.entries(PERFORMANCE_BUDGETS).forEach(([metric, budget]) => {
      if (metric !== 'bundleSize' && vitals[metric] > budget) {
        console.warn(`${metric} exceeds budget: ${vitals[metric]} > ${budget}`);
      }
    });
  }

  getCoreWebVitals() {
    return {
      firstContentfulPaint: performance.getEntriesByType('paint')
        .find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      largestContentfulPaint: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0,
      firstInputDelay: performance.getEntriesByType('first-input')[0]?.processingStart - 
                       performance.getEntriesByType('first-input')[0]?.startTime || 0,
      cumulativeLayoutShift: this.calculateCLS()
    };
  }

  calculateCLS() {
    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries = 0;
    let sessionStartTime = performance.timeOrigin;

    function entryHandler(entry) {
      if (!entry.hadRecentInput) {
        const firstSessionEntry = sessionEntries === 0;
        const newEntryToSameSession = 
          entry.startTime < sessionStartTime + 1000 && 
          entry.startTime >= sessionStartTime;

        if (firstSessionEntry || newEntryToSameSession) {
          sessionValue += entry.value;
          sessionEntries += 1;
        } else {
          sessionStartTime = entry.startTime;
          sessionValue = entry.value;
          sessionEntries = 1;
        }
      }

      if (sessionValue > clsValue) {
        clsValue = sessionValue;
      }
    }

    const po = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        entryHandler(entry);
      }
    });

    po.observe({ type: 'layout-shift', buffered: true });

    return clsValue;
  }
}

// Profiling tools and techniques
class Profiler {
  static profileFunction(fn, name) {
    return function(...args) {
      const start = performance.now();
      const result = fn.apply(this, args);
      const end = performance.now();
      
      console.log(`${name} took ${end - start}ms`);
      return result;
    };
  }

  static profileMemory() {
    if (performance.memory) {
      console.log('Memory usage:', {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
        total: Math.round(performance.memory.totalJSHeapSize / 1048576) + 'MB',
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + 'MB'
      });
    }
  }

  static profileRender(component) {
    const originalRender = component.prototype.render;
    
    component.prototype.render = function(...args) {
      const start = performance.now();
      const result = originalRender.apply(this, args);
      const end = performance.now();
      
      console.log(`${component.name} render took ${end - start}ms`);
      return result;
    };
  }
}

// Performance regression detection
class RegressionDetector {
  constructor() {
    this.baseline = {};
    this.current = {};
  }

  setBaseline(metrics) {
    this.baseline = metrics;
  }

  compare(metrics) {
    this.current = metrics;
    
    Object.entries(metrics).forEach(([metric, value]) => {
      const baseline = this.baseline[metric];
      if (baseline) {
        const change = ((value - baseline) / baseline) * 100;
        
        if (Math.abs(change) > 10) { // 10% threshold
          console.warn(`Performance regression detected in ${metric}: ${change.toFixed(2)}%`);
        }
      }
    });
  }
}
```

### ❌ Bad Examples
```javascript
// No performance monitoring
function fetchData() {
  return fetch('/api/data').then(r => r.json());
}

// No RUM implementation
// No tracking of user interactions
// No performance budgets
// No profiling
// No regression detection
```

## Key Performance Metrics

- **Largest Contentful Paint (LCP)**: Measures loading performance
- **First Input Delay (FID)**: Measures interactivity
- **Cumulative Layout Shift (CLS)**: Measures visual stability
- **Time to First Byte (TTFB)**: Measures server response time
- **First Contentful Paint (FCP)**: Measures initial rendering time

## Performance Tools

- **Lighthouse**: Google's performance auditing tool
- **WebPageTest**: Comprehensive website performance testing
- **Chrome DevTools**: Browser-based performance analysis
- **Bundle Analyzer**: Visualize bundle composition and size
- **Performance APIs**: Browser APIs for performance measurement

## Code Review Checklist

- [ ] Virtualization implemented for long lists
- [ ] Efficient DOM manipulation techniques used
- [ ] CSS-in-JS performance considerations applied
- [ ] Image optimization and lazy loading implemented
- [ ] Component rendering optimized with memoization
- [ ] Memory leaks prevented with proper cleanup
- [ ] Efficient data structures and algorithms used
- [ ] Network requests optimized (parallel, cached)
- [ ] Bundle size minimized with tree shaking
- [ ] Code splitting implemented for performance
- [ ] Performance monitoring and metrics in place
- [ ] Performance budgets defined and enforced