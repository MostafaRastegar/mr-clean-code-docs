# Build Optimization

## Overview

Build optimization focuses on improving the efficiency and performance of your build process, reducing build times, and optimizing the output for production. This includes webpack configuration, bundling strategies, development build improvements, and continuous integration optimization.

## Webpack Optimization

### Basic Webpack Configuration

**Optimized Webpack Setup:**
```javascript
// webpack.config.js
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    publicPath: '/'
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      }),
      new OptimizeCSSAssetsPlugin()
    ],
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
                modules: false,
                useBuiltIns: 'usage',
                corejs: 3
              }]
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[contenthash].[ext]',
              outputPath: 'images/'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css'
    })
  ]
};
```

### Advanced Webpack Optimizations

**Module Resolution Optimization:**
```javascript
// webpack.config.js
module.exports = {
  resolve: {
    // Reduce module resolution time
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: ['node_modules'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  },
  
  // Cache build results
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },
  
  // Parallel processing
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: require('os').cpus().length - 1
            }
          },
          'babel-loader'
        ]
      }
    ]
  }
};
```

**Source Map Optimization:**
```javascript
module.exports = {
  devtool: process.env.NODE_ENV === 'production' 
    ? 'source-map' 
    : 'eval-source-map',
  
  // For production, use cheaper source maps
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
        terserOptions: {
          sourceMap: {
            filename: 'bundle.js.map',
            url: 'bundle.js.map'
          }
        }
      })
    ]
  }
};
```

## Tree Shaking and Dead Code Elimination

### ES6 Modules and Tree Shaking

**Ensure Tree Shaking Works:**
```javascript
// package.json
{
  "name": "my-app",
  "sideEffects": false,
  "scripts": {
    "build": "webpack --mode=production"
  }
}

// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false
  }
};
```

**Write Tree-Shakable Code:**
```javascript
// ❌ Bad: Side effects prevent tree shaking
import _ from 'lodash';
import './styles.css'; // Side effect

// ✅ Good: Pure imports
import { debounce } from 'lodash';
import styles from './styles.module.css';

// ❌ Bad: Named exports with side effects
export const utils = {
  format: (value) => value,
  validate: (value) => true
};

// ✅ Good: Individual named exports
export const format = (value) => value;
export const validate = (value) => true;
```

### Dead Code Elimination

**Babel Plugin for Dead Code Elimination:**
```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,
      targets: {
        browsers: ['> 1%', 'last 2 versions']
      }
    }]
  ],
  plugins: [
    ['babel-plugin-transform-remove-console', {
      exclude: ['error', 'warn']
    }],
    ['babel-plugin-transform-remove-debugger']
  ]
};
```

**Webpack Dead Code Elimination:**
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: false,
    concatenateModules: true, // Module concatenation
    flagIncludedChunks: true,
    innerGraph: true
  }
};
```

## Code Splitting Strategies

### Route-Based Code Splitting

**React Router with Code Splitting:**
```tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

**Vue Router with Code Splitting:**
```javascript
import { createRouter } from 'vue-router';

const routes = [
  {
    path: '/dashboard',
    component: () => import('./views/Dashboard.vue')
  },
  {
    path: '/profile',
    component: () => import('./views/Profile.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});
```

### Component-Based Code Splitting

**Dynamic Imports for Components:**
```tsx
import { useState, useEffect } from 'react';

function LazyComponent({ componentPath, fallback = 'Loading...' }) {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    import(componentPath)
      .then(module => setComponent(() => module.default))
      .catch(err => setError(err));
  }, [componentPath]);

  if (error) return <div>Error loading component</div>;
  if (!Component) return <div>{fallback}</div>;
  
  return <Component />;
}

// Usage
function App() {
  const [showHeavyComponent, setShowHeavyComponent] = useState(false);

  return (
    <div>
      <button onClick={() => setShowHeavyComponent(true)}>
        Load Heavy Component
      </button>
      
      {showHeavyComponent && (
        <LazyComponent 
          componentPath="./components/HeavyComponent"
          fallback="Loading heavy component..."
        />
      )}
    </div>
  );
}
```

### Vendor Bundle Optimization

**Separate Vendor Bundles:**
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Separate React and React-DOM
        react: {
          test: /[\\/]node_modules[\\/]react(-dom)?[\\/]/,
          name: 'react-vendor',
          chunks: 'all',
          priority: 20
        },
        
        // Separate other vendors
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true
        },
        
        // Common chunks
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          enforce: true
        }
      }
    }
  }
};
```

## Bundle Analysis and Monitoring

### Bundle Analysis Tools

**Webpack Bundle Analyzer:**
```javascript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
};
```

**Custom Bundle Analysis Script:**
```javascript
// analyze-bundle.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BundleAnalyzer {
  constructor(distPath = 'dist') {
    this.distPath = distPath;
  }

  analyze() {
    const files = this.getFiles();
    const analysis = {
      totalSize: 0,
      files: [],
      byType: {},
      largestFiles: []
    };

    files.forEach(file => {
      const stats = fs.statSync(file.path);
      const size = stats.size;
      const type = this.getFileType(file.name);

      analysis.totalSize += size;
      analysis.files.push({
        name: file.name,
        size: size,
        sizeFormatted: this.formatBytes(size),
        type: type
      });

      if (!analysis.byType[type]) {
        analysis.byType[type] = { count: 0, size: 0 };
      }
      analysis.byType[type].count++;
      analysis.byType[type].size += size;
    });

    analysis.files.sort((a, b) => b.size - a.size);
    analysis.largestFiles = analysis.files.slice(0, 10);

    return analysis;
  }

  getFiles() {
    const files = [];
    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else {
          files.push({
            name: item,
            path: fullPath,
            size: stat.size
          });
        }
      });
    };

    walkDir(this.distPath);
    return files;
  }

  getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.js') return 'JavaScript';
    if (ext === '.css') return 'CSS';
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) return 'Images';
    if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) return 'Fonts';
    return 'Other';
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generateReport() {
    const analysis = this.analyze();
    
    console.log('\n=== Bundle Analysis Report ===');
    console.log(`Total Size: ${this.formatBytes(analysis.totalSize)}`);
    console.log('\n--- By Type ---');
    
    Object.entries(analysis.byType).forEach(([type, data]) => {
      console.log(`${type}: ${data.count} files, ${this.formatBytes(data.size)}`);
    });

    console.log('\n--- Largest Files ---');
    analysis.largestFiles.forEach(file => {
      console.log(`${file.name}: ${file.sizeFormatted}`);
    });

    // Save detailed report
    fs.writeFileSync(
      'bundle-analysis.json',
      JSON.stringify(analysis, null, 2)
    );

    return analysis;
  }
}

// Usage
const analyzer = new BundleAnalyzer();
analyzer.generateReport();
```

### Performance Budgets

**Webpack Performance Budgets:**
```javascript
// webpack.config.js
module.exports = {
  performance: {
    maxAssetSize: 250000, // 250KB
    maxEntrypointSize: 250000, // 250KB
    hints: 'warning', // 'error' | 'warning' | false
    assetFilter: function(assetFilename) {
      return assetFilename.endsWith('.js');
    }
  }
};
```

**Custom Performance Budget Checker:**
```javascript
// check-budget.js
const fs = require('fs');
const path = require('path');

class PerformanceBudget {
  constructor(budgets) {
    this.budgets = budgets;
  }

  check() {
    const results = [];
    
    Object.entries(this.budgets).forEach(([name, budget]) => {
      const actualSize = this.getActualSize(budget.path);
      const exceeded = actualSize > budget.limit;
      
      results.push({
        name,
        actual: actualSize,
        limit: budget.limit,
        exceeded,
        percentage: (actualSize / budget.limit) * 100
      });
    });

    return results;
  }

  getActualSize(filePath) {
    if (!fs.existsSync(filePath)) return 0;
    
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      return this.getDirectorySize(filePath);
    }
    
    return stats.size;
  }

  getDirectorySize(dirPath) {
    let totalSize = 0;
    
    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else {
          totalSize += stat.size;
        }
      });
    };

    walkDir(dirPath);
    return totalSize;
  }

  generateReport() {
    const results = this.check();
    const failedBudgets = results.filter(r => r.exceeded);
    
    console.log('\n=== Performance Budget Report ===');
    
    results.forEach(result => {
      const status = result.exceeded ? '❌ EXCEEDED' : '✅ OK';
      console.log(`${status} ${result.name}: ${this.formatBytes(result.actual)} / ${this.formatBytes(result.limit)} (${result.percentage.toFixed(1)}%)`);
    });

    if (failedBudgets.length > 0) {
      console.log(`\n❌ ${failedBudgets.length} budget(s) exceeded!`);
      process.exit(1);
    } else {
      console.log('\n✅ All budgets within limits!');
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Usage
const budgets = {
  'Main Bundle': {
    path: 'dist/main.js',
    limit: 250 * 1024 // 250KB
  },
  'Vendor Bundle': {
    path: 'dist/vendors.js',
    limit: 500 * 1024 // 500KB
  },
  'Total Size': {
    path: 'dist',
    limit: 1024 * 1024 // 1MB
  }
};

const budgetChecker = new PerformanceBudget(budgets);
budgetChecker.generateReport();
```

## Development Build Optimization

### Hot Module Replacement (HMR)

**Webpack HMR Configuration:**
```javascript
// webpack.dev.js
module.exports = {
  mode: 'development',
  devServer: {
    hot: true,
    open: true,
    compress: true,
    historyApiFallback: true,
    port: 3000,
    overlay: {
      warnings: false,
      errors: true
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
```

**React HMR Setup:**
```tsx
// index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const rootElement = document.getElementById('root');

function render() {
  ReactDOM.render(<App />, rootElement);
}

render();

// Enable HMR
if (module.hot) {
  module.hot.accept('./App', () => {
    render();
  });
}
```

### Fast Refresh and Development Tools

**Babel Configuration for Fast Refresh:**
```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env'],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }],
    ['@babel/preset-typescript']
  ],
  plugins: [
    ['react-refresh/babel']
  ]
};
```

**Development Build Optimizations:**
```javascript
// webpack.dev.js
module.exports = {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false
            }
          }
        ]
      }
    ]
  }
};
```

## CI/CD Build Optimization

### Parallel Builds

**GitHub Actions Parallel Jobs:**
```yaml
# .github/workflows/build.yml
name: Build and Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm test

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  deploy:
    needs: [build, lint]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: npm run deploy
```

### Build Caching

**Docker Build Optimization:**
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (cached layer)
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build Cache Configuration:**
```javascript
// webpack.config.js
module.exports = {
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },
  
  optimization: {
    moduleIds: 'deterministic',
    chunkIds: 'deterministic'
  },
  
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js'
  }
};
```

## Best Practices Summary

### 1. Webpack Optimization
- Use appropriate optimization settings for production
- Implement proper code splitting
- Configure caching strategies
- Optimize module resolution

### 2. Tree Shaking
- Use ES6 modules consistently
- Mark side effects properly
- Remove dead code
- Use pure imports

### 3. Bundle Analysis
- Regularly analyze bundle composition
- Set up performance budgets
- Monitor bundle size growth
- Identify optimization opportunities

### 4. Development Optimization
- Enable HMR for faster development
- Use appropriate source maps
- Optimize development builds
- Implement fast refresh

### 5. CI/CD Optimization
- Use parallel builds
- Implement proper caching
- Optimize Docker builds
- Monitor build performance

### 6. Build Optimization Checklist
- [ ] Webpack optimization configured
- [ ] Tree shaking enabled
- [ ] Code splitting implemented
- [ ] Bundle analysis in place
- [ ] Performance budgets set
- [ ] HMR configured for development
- [ ] CI/CD optimized
- [ ] Build caching implemented

Remember: Build optimization is crucial for development velocity and production performance. Regularly monitor build times, implement caching strategies, and optimize your build pipeline for the best results.