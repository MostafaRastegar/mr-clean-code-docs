# Rendering Optimization

## Overview

Rendering optimization focuses on improving how your application displays content to users. This involves optimizing the critical rendering path, reducing layout thrashing, and implementing efficient rendering strategies for better performance and user experience.

## Critical Rendering Path Optimization

### Understanding the Critical Rendering Path

The critical rendering path is the sequence of steps the browser takes to convert HTML, CSS, and JavaScript into pixels on the screen. Optimizing this path reduces the time to first paint and improves perceived performance.

**Key Steps:**
1. **Parse HTML** → Construct DOM
2. **Parse CSS** → Construct CSSOM
3. **Combine DOM + CSSOM** → Render Tree
4. **Layout** → Calculate positions
5. **Paint** → Render pixels

### Optimizing CSS Delivery

**Inline Critical CSS:**
```html
<head>
  <!-- Inline critical CSS for above-the-fold content -->
  <style>
    /* Critical styles needed for initial render */
    .header { /* styles */ }
    .hero { /* styles */ }
    .navigation { /* styles */ }
  </style>
  
  <!-- Load non-critical CSS asynchronously -->
  <link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="styles.css"></noscript>
</head>
```

**CSS Media Queries for Conditional Loading:**
```html
<!-- Load print styles only when printing -->
<link rel="stylesheet" href="print.css" media="print">

<!-- Load mobile styles conditionally -->
<link rel="stylesheet" href="mobile.css" media="(max-width: 768px)">
```

### JavaScript Loading Optimization

**Async and Defer Attributes:**
```html
<!-- Async: Download in parallel, execute immediately when downloaded -->
<script async src="analytics.js"></script>

<!-- Defer: Download in parallel, execute after DOM parsing -->
<script defer src="app.js"></script>

<!-- Critical JS: Inline for immediate execution -->
<script>
  // Critical JavaScript for initial rendering
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize critical functionality
  });
</script>
```

**Dynamic Import for Non-Critical JavaScript:**
```javascript
// Load non-critical features on demand
document.getElementById('advanced-features').addEventListener('click', async () => {
  const { initAdvancedFeatures } = await import('./advanced-features.js');
  initAdvancedFeatures();
});
```

## Virtualization Techniques

### List Virtualization

**React Virtualization Example:**
```tsx
import { FixedSizeList as List } from 'react-window';

interface ItemData {
  items: any[];
  renderItem: (item: any) => React.ReactNode;
}

const Row = ({ index, style, data }: { index: number; style: any; data: ItemData }) => (
  <div style={style}>
    {data.renderItem(data.items[index])}
  </div>
);

function VirtualizedList({ items, renderItem, itemHeight = 50, height = 400 }) {
  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      itemData={{ items, renderItem }}
    >
      {Row}
    </List>
  );
}
```

**Custom Virtualization Implementation:**
```javascript
class VirtualList {
  constructor(container, items, itemHeight, visibleItems = 10) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleItems = visibleItems;
    this.scrollTop = 0;
    
    this.render();
    this.setupScrollHandler();
  }

  render() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + this.visibleItems + 2, // +2 for buffer
      this.items.length
    );

    this.container.innerHTML = '';
    
    for (let i = startIndex; i < endIndex; i++) {
      const item = document.createElement('div');
      item.style.position = 'absolute';
      item.style.top = `${i * this.itemHeight}px`;
      item.style.height = `${this.itemHeight}px`;
      item.innerHTML = this.renderItem(this.items[i]);
      this.container.appendChild(item);
    }
  }

  setupScrollHandler() {
    this.container.addEventListener('scroll', () => {
      this.scrollTop = this.container.scrollTop;
      this.render();
    });
  }

  renderItem(item) {
    return `<div class="list-item">${item.name}</div>`;
  }
}
```

### Grid Virtualization

```tsx
import { FixedSizeGrid as Grid } from 'react-window';

function VirtualizedGrid({ items, columnCount, rowCount, columnWidth, rowHeight }) {
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    const item = items[index];
    
    return (
      <div style={style}>
        {item && (
          <div className="grid-item">
            <img src={item.thumbnail} alt={item.name} />
            <span>{item.name}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Grid
      columnCount={columnCount}
      rowCount={rowCount}
      columnWidth={columnWidth}
      rowHeight={rowHeight}
      height={600}
      width={800}
    >
      {Cell}
    </Grid>
  );
}
```

## Efficient DOM Manipulation

### Batch DOM Updates

**Using DocumentFragment:**
```javascript
function batchDOMUpdates(items) {
  const fragment = document.createDocumentFragment();
  
  items.forEach(item => {
    const element = document.createElement('div');
    element.textContent = item.name;
    element.className = 'list-item';
    fragment.appendChild(element);
  });
  
  document.getElementById('container').appendChild(fragment);
}
```

**Using requestAnimationFrame:**
```javascript
function updateDOMEfficiently(updates) {
  let scheduled = false;
  
  function performUpdates() {
    scheduled = false;
    updates.forEach(update => {
      // Perform DOM update
      update.element.textContent = update.value;
    });
  }
  
  return function scheduleUpdate(update) {
    updates.push(update);
    
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(performUpdates);
    }
  };
}
```

### Minimizing Layout Thrashing

**Avoiding Layout Triggers:**
```javascript
// ❌ Bad: Triggers layout multiple times
function badExample(element) {
  element.style.height = '100px';
  console.log(element.offsetHeight); // Forces layout
  element.style.width = '200px';
  console.log(element.offsetWidth);  // Forces layout again
}

// ✅ Good: Batch layout reads and writes
function goodExample(element) {
  // Read layout properties first
  const currentHeight = element.offsetHeight;
  const currentWidth = element.offsetWidth;
  
  // Then write properties
  element.style.height = `${currentHeight + 50}px`;
  element.style.width = `${currentWidth + 100}px`;
}
```

**Using getBoundingClientRect Efficiently:**
```javascript
function measureElements(elements) {
  // Batch all measurements
  const measurements = elements.map(el => el.getBoundingClientRect());
  
  // Use measurements for calculations
  measurements.forEach((rect, index) => {
    console.log(`Element ${index}:`, rect);
  });
  
  return measurements;
}
```

## CSS-in-JS Performance

### Style Component Optimization

**Styled Components Best Practices:**
```tsx
import styled from 'styled-components';

// ✅ Good: Create components outside render
const Button = styled.button`
  background-color: ${props => props.theme.primaryColor};
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  
  &:hover {
    background-color: ${props => props.theme.primaryColorHover};
  }
`;

// ❌ Bad: Creating styled components inside render
function BadComponent() {
  const DynamicButton = styled.button`
    background-color: ${Math.random() > 0.5 ? 'red' : 'blue'};
  `;
  
  return <DynamicButton>Click me</DynamicButton>;
}
```

**CSS Modules Optimization:**
```css
/* styles.module.css */
.container {
  display: flex;
  flex-direction: column;
}

.item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.item:hover {
  background-color: #f5f5f5;
}
```

```tsx
import styles from './styles.module.css';

function OptimizedComponent() {
  return (
    <div className={styles.container}>
      {items.map(item => (
        <div key={item.id} className={styles.item}>
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

### CSS Performance Tips

**Avoid Expensive CSS Properties:**
```css
/* ❌ Expensive properties that trigger layout/paint */
.expensive {
  width: calc(100% - 20px);  /* Layout trigger */
  transform: translateZ(0);  /* Can cause layer creation */
  box-shadow: 0 4px 6px rgba(0,0,0,0.1); /* Paint trigger */
}

/* ✅ More performant alternatives */
.performant {
  width: 100%;
  transform: translateY(0); /* Uses existing layer */
  box-shadow: none; /* Avoid when possible */
}
```

**Use CSS Containment:**
```css
.widget {
  contain: layout style paint;
}

.performance-critical {
  contain: strict; /* Maximum containment */
}
```

## Image Optimization

### Lazy Loading Images

**Native Lazy Loading:**
```html
<img src="image.jpg" alt="Description" loading="lazy" />
```

**Intersection Observer for Custom Lazy Loading:**
```javascript
class LazyImageLoader {
  constructor() {
    this.imageObserver = new IntersectionObserver(this.handleIntersection.bind(this));
    this.images = document.querySelectorAll('img[data-src]');
    
    this.images.forEach(img => this.imageObserver.observe(img));
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        this.imageObserver.unobserve(img);
      }
    });
  }
}

// Initialize
new LazyImageLoader();
```

**React Lazy Image Component:**
```tsx
import { useState, useRef, useEffect } from 'react';

function LazyImage({ src, alt, placeholder, ...props }) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState();
  const loaded = useRef(false);

  useEffect(() => {
    let observer;
    
    if (imageRef && imageSrc !== src) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !loaded.current) {
              loaded.current = true;
              setImageSrc(src);
              observer.unobserve(imageRef);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(imageRef);
    }

    return () => {
      if (observer && observer.unobserve) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, imageSrc, src]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      {...props}
    />
  );
}
```

### Responsive Images

**Using srcset and sizes:**
```html
<img 
  src="image-400.jpg" 
  srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
  alt="Responsive image"
/>
```

**Picture Element for Art Direction:**
```html
<picture>
  <source media="(max-width: 600px)" srcset="mobile-image.jpg">
  <source media="(max-width: 1200px)" srcset="tablet-image.jpg">
  <img src="desktop-image.jpg" alt="Art directed image">
</picture>
```

## Component Rendering Optimization

### Memoization Techniques

**React.memo for Component Memoization:**
```tsx
import { memo, useMemo, useCallback } from 'react';

const ExpensiveComponent = memo(({ data, onUpdate }) => {
  // Expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computed: expensiveCalculation(item)
    }));
  }, [data]);

  // Memoized callback
  const handleUpdate = useCallback((id, value) => {
    onUpdate(id, value);
  }, [onUpdate]);

  return (
    <div>
      {processedData.map(item => (
        <ItemComponent 
          key={item.id} 
          item={item} 
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
});
```

**Custom Memoization Hook:**
```tsx
import { useRef } from 'react';

function useMemoizedCallback(callback, dependencies) {
  const ref = useRef();
  
  return useCallback((...args) => {
    if (!ref.current || !shallowEqual(ref.current.dependencies, dependencies)) {
      ref.current = {
        callback,
        dependencies,
        memoizedCallback: callback
      };
    }
    return ref.current.memoizedCallback(...args);
  }, dependencies);
}
```

### Virtualization for Large Lists

**Windowing Implementation:**
```tsx
function useVirtualization(items, itemHeight, containerHeight) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e) => setScrollTop(e.target.scrollTop)
  };
}
```

## Animation Performance

### CSS Animations vs JavaScript

**Preferred: CSS Animations**
```css
/* ✅ Hardware accelerated */
.animated-element {
  transform: translateX(100px);
  transition: transform 0.3s ease;
}

.animated-element:hover {
  transform: translateX(0);
}

/* ✅ Use transform and opacity only */
.performance-animation {
  will-change: transform, opacity;
}
```

**Avoid: JavaScript Layout Animations**
```javascript
// ❌ Triggers layout on every frame
function badAnimation(element) {
  let position = 0;
  const animate = () => {
    position += 1;
    element.style.left = `${position}px`; // Triggers layout
    if (position < 100) {
      requestAnimationFrame(animate);
    }
  };
  requestAnimationFrame(animate);
}
```

### RequestAnimationFrame Optimization

```javascript
class AnimationController {
  constructor() {
    this.animations = new Map();
    this.rafId = null;
  }

  addAnimation(id, callback) {
    this.animations.set(id, callback);
    this.start();
  }

  removeAnimation(id) {
    this.animations.delete(id);
    if (this.animations.size === 0) {
      this.stop();
    }
  }

  start() {
    if (this.rafId) return;
    
    const animate = (timestamp) => {
      this.animations.forEach(callback => callback(timestamp));
      this.rafId = requestAnimationFrame(animate);
    };
    
    this.rafId = requestAnimationFrame(animate);
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
```

## Performance Monitoring

### Measuring Render Performance

```javascript
class RenderPerformanceMonitor {
  static measureRenderTime(element, callback) {
    const startTime = performance.now();
    
    callback();
    
    // Force layout to measure actual render time
    element.offsetHeight;
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    console.log(`Render time: ${renderTime.toFixed(2)}ms`);
    
    return renderTime;
  }

  static measureVirtualizationPerformance(listComponent) {
    const measurements = [];
    
    // Measure different list sizes
    [100, 1000, 10000].forEach(size => {
      const start = performance.now();
      
      // Render list
      listComponent.render(size);
      
      // Force layout
      document.body.offsetHeight;
      
      const end = performance.now();
      measurements.push({
        size,
        time: end - start
      });
    });
    
    return measurements;
  }
}
```

### Performance Budgets

```javascript
class PerformanceBudget {
  constructor(budgets) {
    this.budgets = budgets;
  }

  checkBudgets() {
    const results = {};
    
    Object.entries(this.budgets).forEach(([metric, limit]) => {
      const value = this.getMetricValue(metric);
      results[metric] = {
        value,
        limit,
        passed: value <= limit
      };
    });
    
    return results;
  }

  getMetricValue(metric) {
    switch (metric) {
      case 'first-contentful-paint':
        return performance.getEntriesByType('paint')
          .find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      
      case 'largest-contentful-paint':
        return performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0;
      
      default:
        return 0;
    }
  }
}

// Usage
const budget = new PerformanceBudget({
  'first-contentful-paint': 1800,
  'largest-contentful-paint': 2500,
  'cumulative-layout-shift': 0.1
});

const results = budget.checkBudgets();
console.log('Performance budget results:', results);
```

## Best Practices Summary

### 1. Critical Rendering Path
- Inline critical CSS and JavaScript
- Defer non-critical resources
- Optimize resource loading order

### 2. Virtualization
- Use virtualization for long lists
- Implement efficient scroll handling
- Batch DOM updates

### 3. DOM Manipulation
- Minimize layout thrashing
- Batch DOM reads and writes
- Use efficient selectors

### 4. CSS Performance
- Avoid expensive CSS properties
- Use CSS containment
- Optimize animations

### 5. Image Optimization
- Implement lazy loading
- Use responsive images
- Optimize image formats

### 6. Component Optimization
- Use memoization appropriately
- Implement efficient re-rendering
- Monitor render performance

Remember: Always measure performance before and after optimizations. Use browser developer tools to identify bottlenecks and validate improvements. Focus on user-perceived performance metrics like Core Web Vitals.