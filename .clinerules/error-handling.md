---
paths:
  - "src/**/*.js"
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "**/*.js"
  - "**/*.ts"
  - "**/*.tsx"
---

# Error Handling

Proper error handling is crucial for creating reliable, maintainable, and user-friendly applications.

## Core Principles

- Fail fast: Detect and report errors as early as possible
- Be specific: Use specific error types and messages
- Log appropriately: Log errors with sufficient context for debugging
- Recover gracefully: Provide fallbacks and recovery mechanisms
- User-friendly: Show meaningful error messages to users
- Monitor proactively: Track errors to identify and fix issues quickly

## Error Types and Classification

### ✅ Good Examples
```javascript
// Custom error types for specific scenarios
class ValidationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

class NetworkError extends Error {
  constructor(message, statusCode, url) {
    super(message);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    this.url = url;
  }
}

class DatabaseError extends Error {
  constructor(message, operation, query) {
    super(message);
    this.name = 'DatabaseError';
    this.operation = operation;
    this.query = query;
  }
}
```

### ❌ Bad Examples
```javascript
// Generic error handling
function processOrder(order) {
  try {
    // Process order
  } catch (error) {
    throw new Error('Something went wrong'); // Too generic
  }
}

// No error types
function fetchData() {
  const response = await fetch('/api/data');
  if (!response.ok) {
    throw 'Request failed'; // String error, not an Error object
  }
}
```

## Try-Catch Patterns

### ✅ Good Examples
```javascript
// Specific error handling with proper cleanup
async function processFile(filePath) {
  let fileHandle;
  try {
    fileHandle = await openFile(filePath);
    const data = await readFile(fileHandle);
    return await processData(data);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation failed:', error.message);
      throw new UserFriendlyError('Please check your input and try again');
    } else if (error instanceof NetworkError) {
      console.error('Network issue:', error.message);
      throw new UserFriendlyError('Unable to connect to server');
    } else {
      console.error('Unexpected error:', error);
      throw error;
    }
  } finally {
    // Always clean up resources
    if (fileHandle) {
      await closeFile(fileHandle);
    }
  }
}

// Async error handling with Promise chains
function fetchUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then(response => {
      if (!response.ok) {
        throw new NetworkError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.url
        );
      }
      return response.json();
    })
    .catch(error => {
      if (error instanceof NetworkError) {
        console.error('Network error:', error.message);
        throw new UserFriendlyError('Unable to fetch user data');
      }
      throw error;
    });
}
```

### ❌ Bad Examples
```javascript
// Empty catch blocks
async function processOrder(order) {
  try {
    await saveOrder(order);
  } catch (error) {
    // Silent failure - error is ignored
  }
}

// Catch-all without specific handling
function fetchData() {
  try {
    return fetch('/api/data').then(r => r.json());
  } catch (error) {
    console.log(error); // Generic logging
    throw error; // Re-throwing without context
  }
}
```

## Async Error Handling

### ✅ Good Examples
```javascript
// Async/await with proper error handling
class ApiService {
  async fetchUser(id) {
    try {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new NetworkError(
          `Failed to fetch user: ${response.status}`,
          response.status,
          response.url
        );
      }
      return await response.json();
    } catch (error) {
      if (error instanceof NetworkError) {
        this.logError('API call failed', error);
        throw new UserFriendlyError('Unable to load user data');
      }
      throw error;
    }
  }

  async fetchWithRetry(url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new NetworkError('Request failed', response.status, url);
        }
        return await response.json();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        await this.delay(1000 * attempt); // Exponential backoff
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  logError(message, error) {
    console.error(`${message}:`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
```

### ❌ Bad Examples
```javascript
// Unhandled promise rejections
function fetchData() {
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      // Success handling
    });
  // Missing .catch() - unhandled rejections
}

// Nested async/await without proper error handling
async function complexOperation() {
  const data1 = await fetch('/api/data1');
  const data2 = await fetch('/api/data2');
  const data3 = await fetch('/api/data3');
  // If any fetch fails, the entire operation fails
  return { data1, data2, data3 };
}
```

## Error Boundaries (React)

### ✅ Good Examples
```javascript
// React error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state to show fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Report to error tracking service
    this.reportError(error, errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  reportError(error, errorInfo) {
    // Send to error tracking service
    if (window.errorTracker) {
      window.errorTracker.captureException(error, {
        extra: errorInfo
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Error Details</summary>
              <pre>{this.state.error && this.state.error.toString()}</pre>
              <pre>{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary>
      <MainContent />
    </ErrorBoundary>
  );
}
```

### ❌ Bad Examples
```javascript
// Generic error boundary without proper error handling
class GenericErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Silent error handling
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}
```

## Logging and Monitoring

### ✅ Good Examples
```javascript
// Structured logging with context
class Logger {
  static logError(message, context = {}) {
    const logEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getCurrentUserId()
      }
    };
    
    console.error(JSON.stringify(logEntry));
    
    // Send to external logging service
    if (window.loggingService) {
      window.loggingService.send(logEntry);
    }
  }

  static logPerformance(metric, value, context = {}) {
    const logEntry = {
      level: 'info',
      type: 'performance',
      metric,
      value,
      timestamp: new Date().toISOString(),
      context
    };
    
    console.log(JSON.stringify(logEntry));
  }
}

// Usage in error handling
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new NetworkError('Failed to fetch user', response.status, response.url);
    }
    return await response.json();
  } catch (error) {
    Logger.logError('Failed to fetch user data', {
      userId,
      errorType: error.constructor.name,
      errorMessage: error.message
    });
    throw error;
  }
}
```

### ❌ Bad Examples
```javascript
// Poor logging practices
function processOrder(order) {
  try {
    // Process order
  } catch (error) {
    console.log(error); // Generic logging without context
  }
}

// No structured logging
function fetchData() {
  try {
    return fetch('/api/data').then(r => r.json());
  } catch (error) {
    console.error('Error:', error.message); // Missing context
  }
}
```

## Graceful Degradation

### ✅ Good Examples
```javascript
// Feature detection and graceful degradation
class FeatureManager {
  static async loadOptionalFeature(featureName) {
    try {
      const module = await import(`./features/${featureName}`);
      return module.default;
    } catch (error) {
      console.warn(`Feature ${featureName} not available:`, error.message);
      return null; // Graceful degradation
    }
  }

  static async initializeApp() {
    const app = new App();
    
    // Load core features (required)
    await app.loadCoreFeatures();
    
    // Load optional features (graceful degradation)
    const optionalFeatures = ['analytics', 'notifications', 'darkMode'];
    for (const feature of optionalFeatures) {
      const Feature = await this.loadOptionalFeature(feature);
      if (Feature) {
        app.addFeature(new Feature());
      }
    }
    
    return app;
  }
}

// Fallback implementations
class DataProvider {
  async fetchUserData(userId) {
    try {
      return await this.fetchFromAPI(userId);
    } catch (error) {
      console.warn('API unavailable, using cached data:', error.message);
      return this.fetchFromCache(userId);
    }
  }

  async fetchFromAPI(userId) {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new NetworkError('API request failed', response.status);
    }
    const data = await response.json();
    this.cacheData(userId, data);
    return data;
  }

  fetchFromCache(userId) {
    const cached = localStorage.getItem(`user_${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }
    throw new Error('No cached data available');
  }

  cacheData(userId, data) {
    localStorage.setItem(`user_${userId}`, JSON.stringify(data));
  }
}
```

### ❌ Bad Examples
```javascript
// No graceful degradation
class App {
  async initialize() {
    const data = await this.fetchRequiredData();
    this.render(data); // Fails if data fetch fails
  }

  async fetchRequiredData() {
    const response = await fetch('/api/data');
    return response.json(); // No error handling
  }
}
```

## Code Review Checklist

- [ ] Use specific error types for different scenarios
- [ ] Provide meaningful error messages with context
- [ ] Log errors with appropriate context for debugging
- [ ] Implement proper error boundaries in React
- [ ] Handle async errors with try-catch or .catch()
- [ ] Use finally blocks for cleanup operations
- [ ] Implement graceful degradation strategies
- [ ] Test error scenarios thoroughly
- [ ] Monitor and alert on critical errors
- [ ] Document error handling strategies