# Memory Management

## Overview

Effective memory management is crucial for JavaScript and TypeScript applications to prevent memory leaks, optimize performance, and ensure long-term stability. This document covers memory management best practices, garbage collection optimization, and techniques for detecting and preventing memory issues.

## Understanding JavaScript Memory Model

### Memory Allocation in JavaScript

JavaScript engines use automatic memory management through garbage collection, but understanding how memory is allocated and managed helps write more efficient code.

**Memory Lifecycle:**
1. **Allocation**: Memory is allocated when objects are created
2. **Usage**: Memory is read and written during program execution
3. **Deallocation**: Memory is freed when no longer needed (garbage collection)

### Memory Types

**Stack Memory:**
- Stores primitive values and function call frames
- Fast allocation and deallocation
- Limited size
- LIFO (Last In, First Out) structure

**Heap Memory:**
- Stores objects, arrays, and complex data structures
- Dynamic allocation
- Managed by garbage collector
- Larger but slower than stack

### Garbage Collection Mechanisms

**Mark-and-Sweep Algorithm:**
```javascript
// Objects are marked as reachable from root objects
// Unmarked objects are considered garbage and collected

function example() {
  const obj1 = { name: 'object1' };
  const obj2 = { name: 'object2' };
  
  obj1.ref = obj2;  // obj2 is reachable through obj1
  obj2.ref = obj1;  // Circular reference, but both are garbage if function exits
  
  return obj1;
}

const result = example(); // obj1 is reachable, obj2 is not (unless referenced elsewhere)
```

**Generational Garbage Collection:**
- New objects are in the "young generation"
- Long-lived objects move to "old generation"
- Different collection strategies for each generation

## Memory Leak Prevention

### Common Memory Leak Patterns

**1. Event Listeners Not Removed:**
```javascript
// ❌ Memory leak: Event listeners not removed
class Component {
  constructor() {
    this.element = document.getElementById('my-element');
    this.handleClick = this.handleClick.bind(this);
    this.element.addEventListener('click', this.handleClick);
    // Never removed!
  }
  
  handleClick() {
    console.log('Clicked');
  }
}

// ✅ Fixed: Proper cleanup
class Component {
  constructor() {
    this.element = document.getElementById('my-element');
    this.handleClick = this.handleClick.bind(this);
    this.element.addEventListener('click', this.handleClick);
  }
  
  destroy() {
    this.element.removeEventListener('click', this.handleClick);
  }
  
  handleClick() {
    console.log('Clicked');
  }
}
```

**2. Timers Not Cleared:**
```javascript
// ❌ Memory leak: Timer never cleared
class TimerComponent {
  constructor() {
    this.timer = setInterval(() => {
      this.update();
    }, 1000);
    // Timer continues even after component is destroyed
  }
  
  update() {
    console.log('Updating...');
  }
}

// ✅ Fixed: Clear timer on cleanup
class TimerComponent {
  constructor() {
    this.timer = setInterval(() => {
      this.update();
    }, 1000);
  }
  
  destroy() {
    clearInterval(this.timer);
  }
  
  update() {
    console.log('Updating...');
  }
}
```

**3. Closures Holding References:**
```javascript
// ❌ Memory leak: Closure holds reference to large object
function createHandler() {
  const largeData = new Array(1000000).fill('data');
  
  return function handler() {
    console.log('Handler called');
    // largeData is kept in memory due to closure
  };
}

// ✅ Fixed: Don't create unnecessary closures
function createHandler() {
  return function handler() {
    console.log('Handler called');
  };
}

// Or explicitly clear references
function createHandler() {
  let largeData = new Array(1000000).fill('data');
  
  return function handler() {
    console.log('Handler called');
    largeData = null; // Clear reference
  };
}
```

**4. DOM References:**
```javascript
// ❌ Memory leak: DOM references not cleared
let globalCache = {};

function cacheElement(id) {
  const element = document.getElementById(id);
  globalCache[id] = element; // Element won't be garbage collected
}

// ✅ Fixed: Use WeakMap for DOM references
const elementCache = new WeakMap();

function cacheElement(element) {
  elementCache.set(element, { cached: true });
  // Element can be garbage collected when removed from DOM
}
```

### Memory-Efficient Data Structures

**Use Appropriate Data Structures:**
```javascript
// ❌ Inefficient: Large arrays with sparse data
const sparseArray = new Array(1000000);
sparseArray[500000] = 'value';

// ✅ Better: Use Map for sparse data
const sparseMap = new Map();
sparseMap.set(500000, 'value');

// ❌ Inefficient: Nested objects for simple data
const userData = {
  users: {
    'user1': { name: 'John', age: 30 },
    'user2': { name: 'Jane', age: 25 }
  }
};

// ✅ Better: Use Map for dynamic key access
const userData = new Map([
  ['user1', { name: 'John', age: 30 }],
  ['user2', { name: 'Jane', age: 25 }]
]);
```

**WeakMap and WeakSet:**
```javascript
// Use WeakMap for metadata without preventing garbage collection
const metadata = new WeakMap();

class Component {
  constructor(element) {
    this.element = element;
    metadata.set(element, { created: Date.now() });
  }
  
  getCreationTime() {
    return metadata.get(this.element)?.created;
  }
}

// When element is removed from DOM, metadata is automatically cleaned up
```

## Memory Optimization Techniques

### Object Pooling

**Implementing Object Pool:**
```javascript
class ObjectPool {
  constructor(createFn, resetFn, maxSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
    this.pool = [];
  }
  
  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.createFn();
  }
  
  release(obj) {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
  
  clear() {
    this.pool.length = 0;
  }
}

// Usage example
const vectorPool = new ObjectPool(
  () => ({ x: 0, y: 0, z: 0 }),
  (obj) => { obj.x = 0; obj.y = 0; obj.z = 0; }
);

function calculateVector(a, b) {
  const result = vectorPool.acquire();
  result.x = a.x + b.x;
  result.y = a.y + b.y;
  result.z = a.z + b.z;
  return result;
}

function releaseVector(vector) {
  vectorPool.release(vector);
}
```

### Lazy Loading and Initialization

**Lazy Property Initialization:**
```javascript
class HeavyObject {
  constructor() {
    this._expensiveData = null;
    this._isInitialized = false;
  }
  
  get expensiveData() {
    if (!this._isInitialized) {
      this._expensiveData = this.initializeExpensiveData();
      this._isInitialized = true;
    }
    return this._expensiveData;
  }
  
  initializeExpensiveData() {
    // Expensive initialization logic
    return new Array(1000000).fill(0).map((_, i) => i * 2);
  }
}
```

**Chunked Processing:**
```javascript
function processLargeArray(array, chunkSize = 1000) {
  return new Promise((resolve) => {
    let index = 0;
    
    function processChunk() {
      const chunk = array.slice(index, index + chunkSize);
      // Process chunk
      index += chunkSize;
      
      if (index < array.length) {
        // Yield control to prevent blocking
        setTimeout(processChunk, 0);
      } else {
        resolve();
      }
    }
    
    processChunk();
  });
}
```

### Memory-Efficient Algorithms

**Streaming Data Processing:**
```javascript
// ❌ Memory-intensive: Load all data at once
async function processAllData() {
  const data = await fetchLargeDataset();
  return data.map(transform).filter(validate).reduce(aggregate);
}

// ✅ Memory-efficient: Process in streams
async function* streamData() {
  const response = await fetch('/large-dataset');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    // Process chunks as they arrive
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      yield JSON.parse(line);
    }
  }
}

async function processStream() {
  for await (const item of streamData()) {
    // Process each item individually
    transform(item);
  }
}
```

## Memory Monitoring and Debugging

### Performance APIs

**Memory Usage Monitoring:**
```javascript
class MemoryMonitor {
  static getMemoryInfo() {
    if ('memory' in performance) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }
  
  static logMemoryUsage(label = '') {
    const info = this.getMemoryInfo();
    if (info) {
      console.log(`${label} Memory Usage:`, {
        used: `${(info.used / 1024 / 1024).toFixed(2)} MB`,
        total: `${(info.total / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(info.limit / 1024 / 1024).toFixed(2)} MB`,
        percentage: `${info.percentage.toFixed(2)}%`
      });
    }
  }
  
  static monitorMemoryGrowth(threshold = 50 * 1024 * 1024) { // 50MB
    let baseline = this.getMemoryInfo()?.used || 0;
    
    setInterval(() => {
      const current = this.getMemoryInfo()?.used || 0;
      const growth = current - baseline;
      
      if (growth > threshold) {
        console.warn(`Memory growth detected: ${(growth / 1024 / 1024).toFixed(2)} MB`);
        baseline = current;
      }
    }, 5000);
  }
}

// Usage
MemoryMonitor.logMemoryUsage('Initial');
MemoryMonitor.monitorMemoryGrowth();
```

**Performance Observer for Memory Events:**
```javascript
class MemoryObserver {
  constructor() {
    this.setupObserver();
  }
  
  setupObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'measure') {
            console.log(`Performance measure: ${entry.name} - ${entry.duration}ms`);
          }
        });
      });
      
      observer.observe({ entryTypes: ['measure'] });
    }
  }
  
  measureOperation(name, operation) {
    performance.mark(`${name}-start`);
    const result = operation();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    return result;
  }
}
```

### Memory Leak Detection

**Reference Tracking:**
```javascript
class ReferenceTracker {
  constructor() {
    this.references = new Map();
    this.weakRefs = new WeakMap();
  }
  
  trackReference(key, obj) {
    this.references.set(key, obj);
    this.weakRefs.set(obj, key);
  }
  
  checkLeaks() {
    const leaked = [];
    
    this.references.forEach((obj, key) => {
      if (!this.weakRefs.has(obj)) {
        leaked.push(key);
      }
    });
    
    if (leaked.length > 0) {
      console.warn('Potential memory leaks detected:', leaked);
    }
    
    return leaked;
  }
  
  clear() {
    this.references.clear();
    this.weakRefs = new WeakMap();
  }
}
```

**Custom Memory Profiler:**
```javascript
class MemoryProfiler {
  constructor() {
    this.snapshots = [];
    this.tracking = false;
  }
  
  startTracking() {
    this.tracking = true;
    this.takeSnapshot('start');
  }
  
  stopTracking() {
    this.takeSnapshot('end');
    this.tracking = false;
    this.analyzeResults();
  }
  
  takeSnapshot(label) {
    if (!this.tracking) return;
    
    const snapshot = {
      label,
      timestamp: Date.now(),
      memory: this.getMemoryInfo(),
      heap: this.getHeapSnapshot()
    };
    
    this.snapshots.push(snapshot);
  }
  
  getMemoryInfo() {
    return {
      used: performance.memory?.usedJSHeapSize || 0,
      total: performance.memory?.totalJSHeapSize || 0,
      limit: performance.memory?.jsHeapSizeLimit || 0
    };
  }
  
  getHeapSnapshot() {
    // This would require Chrome DevTools Protocol
    // For now, return a placeholder
    return { size: 0, objects: 0 };
  }
  
  analyzeResults() {
    if (this.snapshots.length < 2) return;
    
    const start = this.snapshots[0];
    const end = this.snapshots[this.snapshots.length - 1];
    
    const memoryGrowth = end.memory.used - start.memory.used;
    
    console.log('Memory analysis:', {
      startTime: new Date(start.timestamp),
      endTime: new Date(end.timestamp),
      duration: end.timestamp - start.timestamp,
      memoryGrowth: `${(memoryGrowth / 1024 / 1024).toFixed(2)} MB`,
      memoryPercentage: ((memoryGrowth / end.memory.limit) * 100).toFixed(2) + '%'
    });
  }
}
```

## Framework-Specific Memory Management

### React Memory Management

**Component Cleanup:**
```tsx
import { useEffect, useRef, useState } from 'react';

function MemoryEfficientComponent() {
  const [data, setData] = useState([]);
  const intervalRef = useRef<number>();
  const observerRef = useRef<IntersectionObserver>();
  
  useEffect(() => {
    // Setup
    intervalRef.current = window.setInterval(() => {
      setData(prev => [...prev, Math.random()]);
    }, 1000);
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
  
  return <div>{data.length} items</div>;
}
```

**Memoization Best Practices:**
```tsx
import { useMemo, useCallback } from 'react';

function ExpensiveComponent({ items, filter, sort }) {
  // ✅ Memoize expensive calculations
  const filteredItems = useMemo(() => {
    return items.filter(item => item.name.includes(filter));
  }, [items, filter]);
  
  // ✅ Memoize callbacks to prevent unnecessary re-renders
  const handleSort = useCallback((field) => {
    // Sorting logic
  }, [sort]);
  
  // ❌ Don't memoize simple calculations
  const itemCount = useMemo(() => items.length, [items]); // Unnecessary
  
  return (
    <div>
      {filteredItems.map(item => (
        <Item key={item.id} item={item} onSort={handleSort} />
      ))}
    </div>
  );
}
```

### Vue.js Memory Management

**Lifecycle Hooks:**
```javascript
export default {
  data() {
    return {
      timer: null,
      observer: null
    };
  },
  
  mounted() {
    this.timer = setInterval(() => {
      this.updateData();
    }, 1000);
    
    this.observer = new IntersectionObserver(this.handleIntersection);
    this.observer.observe(this.$el);
  },
  
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  
  methods: {
    updateData() {
      // Update logic
    },
    
    handleIntersection(entries) {
      // Intersection logic
    }
  }
};
```

## Best Practices Summary

### 1. Prevent Memory Leaks
- Always remove event listeners
- Clear timers and intervals
- Break circular references
- Use WeakMap/WeakSet for metadata

### 2. Optimize Memory Usage
- Implement object pooling for frequently created objects
- Use lazy loading for expensive operations
- Process large datasets in chunks
- Choose appropriate data structures

### 3. Monitor Memory Usage
- Use Performance APIs to track memory
- Implement memory leak detection
- Monitor memory growth over time
- Use browser developer tools for profiling

### 4. Framework Best Practices
- Follow component lifecycle for cleanup
- Use memoization appropriately
- Avoid unnecessary object creation in render cycles
- Implement proper state management

### 5. Code Review Checklist
- [ ] Are all event listeners removed?
- [ ] Are all timers cleared?
- [ ] Are closures avoiding memory leaks?
- [ ] Are DOM references properly managed?
- [ ] Is object pooling used where appropriate?
- [ ] Are large datasets processed efficiently?
- [ ] Is memory usage monitored in production?

Remember: Good memory management is essential for application performance and stability. Regularly monitor memory usage, implement proper cleanup patterns, and use appropriate data structures for your use cases.