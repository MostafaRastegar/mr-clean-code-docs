# Network Optimization

## Overview

Network optimization focuses on improving the performance of data transfer between your application and servers. This includes optimizing HTTP requests, implementing efficient caching strategies, reducing bundle sizes, and leveraging modern networking protocols to deliver faster, more responsive applications.

## HTTP/2 and HTTP/3 Optimization

### HTTP/2 Benefits and Implementation

**HTTP/2 Features:**
- **Multiplexing**: Multiple requests over a single connection
- **Header Compression**: Reduces overhead with HPACK compression
- **Server Push**: Proactively send resources to clients
- **Binary Protocol**: More efficient than text-based HTTP/1.1

**Enabling HTTP/2:**
```javascript
// Node.js with HTTPS
const https = require('https');
const http2 = require('http2');
const fs = require('fs');

const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem')
};

const server = http2.createSecureServer(options, (req, res) => {
  // HTTP/2 server logic
  res.setHeader('content-type', 'text/html');
  res.end('<h1>HTTP/2 Server</h1>');
});

server.listen(443);
```

**Server Push Implementation:**
```javascript
const server = http2.createSecureServer(options, (req, res) => {
  // Push critical resources
  const stream = res.pushStream('/critical.css', {
    'content-type': 'text/css'
  });
  
  stream.respondWithFile('./public/critical.css', {
    'content-type': 'text/css'
  });
  
  // Serve main page
  res.end('<html><link rel="stylesheet" href="/critical.css"></html>');
});
```

### HTTP/3 and QUIC Protocol

**HTTP/3 Benefits:**
- **UDP-based**: Reduces connection overhead
- **Improved Multiplexing**: No head-of-line blocking
- **Faster Handshakes**: 0-RTT connection establishment
- **Better Mobile Performance**: Handles network changes better

**HTTP/3 Implementation:**
```javascript
// Using Node.js with experimental HTTP/3 support
const http3 = require('http3');
const fs = require('fs');

const server = http3.createSecureServer({
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem')
});

server.on('request', (req, res) => {
  res.end('HTTP/3 Response');
});

server.listen(443);
```

## Caching Strategies

### Browser Caching

**Cache Headers Configuration:**
```javascript
// Express.js middleware for cache headers
function cacheHeaders(maxAge, staleWhileRevalidate = 86400) {
  return (req, res, next) => {
    res.set({
      'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
      'ETag': `"${Date.now()}"`,
      'Last-Modified': new Date().toUTCString()
    });
    next();
  };
}

// Apply to static assets
app.use('/static', cacheHeaders(31536000)); // 1 year
app.use('/images', cacheHeaders(2592000));  // 30 days
app.use('/js', cacheHeaders(604800));       // 7 days
```

**Service Worker Caching:**
```javascript
// service-worker.js
const CACHE_NAME = 'app-cache-v1';
const urlsToCache = [
  '/',
  '/static/js/main.js',
  '/static/css/main.css',
  '/images/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            if (!response || response.status !== 200) {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseToCache));
            
            return response;
          }
        );
      })
  );
});
```

### CDN Implementation

**CDN Configuration:**
```javascript
// CDN middleware for Express
function cdnMiddleware(options = {}) {
  const {
    cdnUrl = 'https://cdn.example.com',
    assetsPath = '/assets',
    maxAge = 31536000
  } = options;

  return (req, res, next) => {
    // Serve assets from CDN
    if (req.path.startsWith(assetsPath)) {
      res.set({
        'Cache-Control': `public, max-age=${maxAge}`,
        'CDN-Cache-Control': 'public, max-age=31536000'
      });
      
      // Redirect to CDN
      res.redirect(`${cdnUrl}${req.path}`);
    } else {
      next();
    }
  };
}

app.use(cdnMiddleware({
  cdnUrl: 'https://your-cdn.com',
  assetsPath: '/static'
}));
```

**Asset Preloading:**
```html
<!-- Preload critical resources -->
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/main.js" as="script">
<link rel="preload" href="/hero-image.jpg" as="image">

<!-- DNS prefetching -->
<link rel="dns-prefetch" href="//cdn.example.com">
<link rel="dns-prefetch" href="//api.example.com">

<!-- Preconnect to important origins -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://api.example.com">
```

## Bundle Size Reduction

### Tree Shaking

**Webpack Tree Shaking Configuration:**
```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                modules: false, // Keep ES modules for tree shaking
                useBuiltIns: 'usage',
                corejs: 3
              }]
            ]
          }
        }
      }
    ]
  }
};
```

**Package.json sideEffects:**
```json
{
  "name": "my-app",
  "sideEffects": false,
  "scripts": {
    "build": "webpack --mode=production"
  }
}
```

### Code Splitting

**Dynamic Imports:**
```javascript
// Route-based splitting
const routes = [
  {
    path: '/dashboard',
    component: () => import('./components/Dashboard')
  },
  {
    path: '/profile',
    component: () => import('./components/Profile')
  }
];

// Component-based splitting
function LazyComponent() {
  const [Component, setComponent] = useState(null);
  
  useEffect(() => {
    import('./HeavyComponent').then(module => {
      setComponent(() => module.default);
    });
  }, []);
  
  return Component ? <Component /> : <div>Loading...</div>;
}
```

**Webpack Code Splitting:**
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
};
```

### Bundle Analysis

**Bundle Analysis Script:**
```javascript
// analyze-bundle.js
const { execSync } = require('child_process');
const fs = require('fs');

function analyzeBundle() {
  try {
    // Generate bundle analysis
    execSync('npx webpack-bundle-analyzer dist/static/js/*.js --mode static --report bundle-report.html', {
      stdio: 'inherit'
    });
    
    // Analyze bundle composition
    const bundleFiles = fs.readdirSync('dist/static/js');
    const totalSize = bundleFiles.reduce((total, file) => {
      const stats = fs.statSync(`dist/static/js/${file}`);
      return total + stats.size;
    }, 0);
    
    console.log(`Total bundle size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('Bundle analysis failed:', error);
  }
}

analyzeBundle();
```

## API Response Optimization

### Response Compression

**Gzip Compression:**
```javascript
const compression = require('compression');
const express = require('express');

const app = express();

// Enable compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Compression level (1-9)
  threshold: 1024 // Only compress responses larger than 1KB
}));

// Serve compressed assets
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js') || path.endsWith('.css')) {
      res.setHeader('Content-Encoding', 'gzip');
    }
  }
}));
```

**Brotli Compression:**
```javascript
const brotli = require('brotli');
const fs = require('fs');

function compressWithBrotli(filePath) {
  const content = fs.readFileSync(filePath);
  const compressed = brotli.compress(content, {
    quality: 11, // Compression quality (0-11)
    mode: 0,     // 0=generic, 1=text, 2=font
    lgwin: 22,   // Window size
    lgblock: 0   // Block size
  });
  
  fs.writeFileSync(`${filePath}.br`, compressed);
}
```

### Data Transfer Optimization

**GraphQL Query Optimization:**
```javascript
// Efficient GraphQL queries
const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: ID!) {
    user(id: $userId) {
      id
      name
      email
      profile {
        avatar
        bio
      }
      posts(limit: 10) {
        id
        title
        createdAt
      }
    }
  }
`;

// Avoid over-fetching
const GET_USER_BASIC = gql`
  query GetUserBasic($userId: ID!) {
    user(id: $userId) {
      id
      name
    }
  }
`;
```

**REST API Optimization:**
```javascript
// Field selection
app.get('/api/users', (req, res) => {
  const fields = req.query.fields?.split(',') || ['id', 'name', 'email'];
  const select = fields.join(' ');
  
  User.find({}, select)
    .then(users => res.json(users))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Pagination
app.get('/api/posts', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  Post.find()
    .skip(offset)
    .limit(limit)
    .then(posts => res.json(posts))
    .catch(err => res.status(500).json({ error: err.message }));
});
```

## Performance Monitoring

### Network Performance Metrics

**Custom Performance Monitor:**
```javascript
class NetworkPerformanceMonitor {
  constructor() {
    this.metrics = [];
  }
  
  measureResourceLoad(resourceUrl) {
    const startTime = performance.now();
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        this.metrics.push({
          type: 'image',
          url: resourceUrl,
          loadTime,
          timestamp: Date.now()
        });
        
        resolve(loadTime);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load ${resourceUrl}`));
      };
      
      img.src = resourceUrl;
    });
  }
  
  measureAPIResponse(endpoint, method = 'GET', data = null) {
    const startTime = performance.now();
    
    return fetch(endpoint, {
      method,
      body: data ? JSON.stringify(data) : null,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.metrics.push({
        type: 'api',
        endpoint,
        method,
        responseTime,
        status: response.status,
        timestamp: Date.now()
      });
      
      return response;
    });
  }
  
  getMetrics() {
    return this.metrics;
  }
  
  generateReport() {
    const apiMetrics = this.metrics.filter(m => m.type === 'api');
    const imageMetrics = this.metrics.filter(m => m.type === 'image');
    
    return {
      api: {
        averageResponseTime: this.calculateAverage(apiMetrics.map(m => m.responseTime)),
        successRate: this.calculateSuccessRate(apiMetrics),
        slowestEndpoint: this.findSlowestEndpoint(apiMetrics)
      },
      images: {
        averageLoadTime: this.calculateAverage(imageMetrics.map(m => m.loadTime)),
        slowestImage: this.findSlowestImage(imageMetrics)
      }
    };
  }
  
  calculateAverage(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  calculateSuccessRate(metrics) {
    const successful = metrics.filter(m => m.status >= 200 && m.status < 300);
    return (successful.length / metrics.length) * 100;
  }
  
  findSlowestEndpoint(metrics) {
    return metrics.reduce((slowest, current) => {
      return current.responseTime > slowest.responseTime ? current : slowest;
    });
  }
  
  findSlowestImage(metrics) {
    return metrics.reduce((slowest, current) => {
      return current.loadTime > slowest.loadTime ? current : slowest;
    });
  }
}
```

### Real User Monitoring (RUM)

**RUM Implementation:**
```javascript
class RealUserMonitoring {
  constructor() {
    this.metrics = {};
    this.startTime = performance.timing.navigationStart;
  }
  
  collectCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        this.metrics.fid = entry.processingStart - entry.startTime;
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.metrics.cls = clsValue;
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }
  
  collectNavigationTiming() {
    const timing = performance.timing;
    
    this.metrics.navigation = {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      ssl: timing.secureConnectionStart > 0 ? timing.connectEnd - timing.secureConnectionStart : 0,
      ttfb: timing.responseStart - timing.requestStart,
      download: timing.responseEnd - timing.responseStart,
      domParse: timing.domContentLoadedEventStart - timing.responseEnd,
      domReady: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
      loadComplete: timing.loadEventEnd - timing.loadEventStart
    };
  }
  
  sendMetrics() {
    // Send to analytics endpoint
    fetch('/api/performance-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        metrics: this.metrics
      })
    }).catch(console.error);
  }
  
  init() {
    this.collectCoreWebVitals();
    this.collectNavigationTiming();
    
    // Send metrics when page unloads
    window.addEventListener('beforeunload', () => {
      this.sendMetrics();
    });
    
    // Send metrics after 5 seconds
    setTimeout(() => {
      this.sendMetrics();
    }, 5000);
  }
}

// Initialize RUM
const rum = new RealUserMonitoring();
rum.init();
```

## Best Practices Summary

### 1. HTTP/2 and HTTP/3
- Enable HTTP/2 on your server
- Use server push for critical resources
- Consider HTTP/3 for improved performance
- Implement proper SSL/TLS configuration

### 2. Caching Strategies
- Configure appropriate cache headers
- Implement service worker caching
- Use CDN for global distribution
- Implement cache invalidation strategies

### 3. Bundle Optimization
- Enable tree shaking
- Implement code splitting
- Use dynamic imports
- Analyze bundle composition regularly

### 4. API Optimization
- Compress responses with gzip/brotli
- Implement field selection
- Use pagination for large datasets
- Cache API responses appropriately

### 5. Performance Monitoring
- Monitor Core Web Vitals
- Track network performance metrics
- Implement RUM for real-user data
- Set up performance budgets

### 6. Network Optimization Checklist
- [ ] HTTP/2 enabled on production
- [ ] Appropriate cache headers configured
- [ ] CDN implemented for static assets
- [ ] Bundle size optimized and monitored
- [ ] API responses compressed
- [ ] Performance monitoring in place
- [ ] Core Web Vitals tracked
- [ ] Performance budgets established

Remember: Network optimization is an ongoing process. Regularly monitor performance metrics, analyze user behavior, and implement optimizations based on real data and user needs.