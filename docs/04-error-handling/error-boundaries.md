# Error Boundaries

## Overview

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of the component tree that crashed. This document covers best practices for implementing error boundaries in React applications.

## Core Principles

### 1. Catch Errors in Component Tree

Error boundaries catch errors during rendering, in lifecycle methods, and in constructors of the whole tree below them.

**✅ Good Error Boundary Implementation:**
```jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    
    // You can also log the error to an error reporting service here
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
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
    <div>
      <Header />
      <ErrorBoundary>
        <MainContent />
      </ErrorBoundary>
      <Footer />
    </div>
  );
}
```

**❌ Bad Error Boundary Implementation:**
```jsx
// Error boundary that doesn't properly handle errors
class BadErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Just logging without state update
    console.error(error);
  }

  render() {
    // Not checking state - will always render children
    return this.props.children;
  }
}

// Error boundary that catches too broadly
class TooBroadErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      // Blank fallback - not user-friendly
      return null;
    }
    return this.props.children;
  }
}
```

### 2. Place Error Boundaries Strategically

Position error boundaries at appropriate levels in your component tree based on your application's architecture.

**✅ Strategic Error Boundary Placement:**
```jsx
// App-level error boundary
class AppErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App error:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error">
          <h1>Application Error</h1>
          <p>The application encountered an unexpected error.</p>
          <button onClick={() => window.location.reload()}>
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Feature-level error boundary
class FeatureErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Feature error:', error, errorInfo);
    // Log feature-specific error
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="feature-error">
          <h3>Feature Unavailable</h3>
          <p>This feature is temporarily unavailable.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Component-level error boundary
class ComponentErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="component-error">Component failed to load</div>;
    }
    return this.props.children;
  }
}

// Usage in component hierarchy
function App() {
  return (
    <AppErrorBoundary>
      <Router>
        <Header />
        <main>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/settings" component={Settings} />
        </main>
        <Footer />
      </Router>
    </AppErrorBoundary>
  );
}

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <FeatureErrorBoundary>
        <WidgetContainer />
      </FeatureErrorBoundary>
    </div>
  );
}

function WidgetContainer() {
  return (
    <div>
      <ComponentErrorBoundary>
        <ChartWidget />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary>
        <DataWidget />
      </ComponentErrorBoundary>
    </div>
  );
}
```

**❌ Poor Error Boundary Placement:**
```jsx
// Too many error boundaries - overkill
function App() {
  return (
    <div>
      <ErrorBoundary><Header /></ErrorBoundary>
      <ErrorBoundary><Navigation /></ErrorBoundary>
      <ErrorBoundary><MainContent /></ErrorBoundary>
      <ErrorBoundary><Sidebar /></ErrorBoundary>
      <ErrorBoundary><Footer /></ErrorBoundary>
    </div>
  );
}

// Too few error boundaries - not granular enough
function App() {
  return (
    <ErrorBoundary>
      <div>
        <Header />
        <Navigation />
        <MainContent />
        <Sidebar />
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
```

### 3. Provide Meaningful Fallback UI

Create user-friendly fallback interfaces that help users understand what happened and what they can do.

**✅ Meaningful Fallback UI:**
```jsx
class UserFriendlyErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log error with context
    this.logError(error, errorInfo);
  }

  logError(error, errorInfo) {
    // Send to error reporting service with user context
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId // If available
    };
    
    console.error('Error report:', errorReport);
    // Send to error reporting service
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  handleReport = () => {
    // Open error reporting dialog or send error details
    const errorDetails = {
      error: this.state.error,
      errorInfo: this.state.errorInfo,
      timestamp: new Date().toISOString()
    };
    
    console.log('User reported error:', errorDetails);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>
            We're sorry, but we encountered an unexpected error. 
            Don't worry, your data is safe.
          </p>
          
          <div className="error-actions">
            <button onClick={this.handleRetry} className="retry-btn">
              Try Again
            </button>
            <button onClick={this.handleReport} className="report-btn">
              Report Issue
            </button>
            <button onClick={() => window.location.href = '/'} className="home-btn">
              Go Home
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="error-details">
              <summary>Error Details (Development)</summary>
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
```

**❌ Poor Fallback UI:**
```jsx
class PoorErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      // Not helpful to users
      return <div>Something broke.</div>;
    }
    return this.props.children;
  }
}
```

## TypeScript-Specific Considerations

### 1. Type-Safe Error Boundaries

Use TypeScript to create type-safe error boundary implementations.

**✅ Type-Safe Error Boundary:**
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  userId?: string;
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo;
  onRetry: () => void;
  onReport: () => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log error with context
    this.logError(error, errorInfo);
  }

  private logError(error: Error, errorInfo: React.ErrorInfo): void {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId
    };
    
    console.error('Error report:', errorReport);
    // Send to error reporting service
  }

  private handleRetry = (): void => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  }

  private handleReport = (): void => {
    if (this.state.error && this.state.errorInfo) {
      const errorDetails = {
        error: this.state.error,
        errorInfo: this.state.errorInfo,
        timestamp: new Date().toISOString()
      };
      
      console.log('User reported error:', errorDetails);
      // Send to error reporting service
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onReport={this.handleReport}
        />
      );
    }

    return this.props.children;
  }
}

// Default fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  errorInfo, 
  onRetry, 
  onReport 
}) => (
  <div className="error-fallback">
    <div className="error-icon">⚠️</div>
    <h2>Something went wrong</h2>
    <p>We're sorry, but we encountered an unexpected error.</p>
    
    <div className="error-actions">
      <button onClick={onRetry} className="retry-btn">
        Try Again
      </button>
      <button onClick={onReport} className="report-btn">
        Report Issue
      </button>
    </div>
    
    {process.env.NODE_ENV === 'development' && (
      <details className="error-details">
        <summary>Error Details (Development)</summary>
        <pre>{error.toString()}</pre>
        <pre>{errorInfo.componentStack}</pre>
      </details>
    )}
  </div>
);

// Usage with TypeScript
const App: React.FC = () => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('App error:', error, errorInfo);
    // Custom error handling logic
  };

  return (
    <ErrorBoundary
      onError={handleError}
      userId="user123"
    >
      <Router>
        <Header />
        <main>
          <Route path="/dashboard" component={Dashboard} />
        </main>
      </Router>
    </ErrorBoundary>
  );
};
```

**❌ Non-Type-Safe Error Boundary:**
```typescript
// Generic error boundary without proper typing
class GenericErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}
```

### 2. Custom Error Fallback Components

Create reusable error fallback components with proper TypeScript typing.

**✅ Custom Error Fallback Components:**
```typescript
// Different types of error fallbacks
interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo;
  onRetry: () => void;
  onReport: () => void;
}

// Full page error fallback
export const FullPageErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onRetry,
  onReport
}) => (
  <div className="full-page-error">
    <div className="error-content">
      <h1>Application Error</h1>
      <p>We're experiencing technical difficulties.</p>
      <div className="error-actions">
        <button onClick={onRetry}>Try Again</button>
        <button onClick={onReport}>Report Issue</button>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    </div>
  </div>
);

// Inline error fallback
export const InlineErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry
}) => (
  <div className="inline-error">
    <span>Failed to load component</span>
    <button onClick={onRetry}>Retry</button>
  </div>
);

// Widget error fallback
export const WidgetErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry
}) => (
  <div className="widget-error">
    <div className="error-icon">⚠️</div>
    <h3>Widget Unavailable</h3>
    <p>This widget failed to load.</p>
    <button onClick={onRetry}>Reload Widget</button>
  </div>
);

// Usage with different fallbacks
const Dashboard: React.FC = () => (
  <div>
    <ErrorBoundary fallback={FullPageErrorFallback}>
      <Header />
      <ErrorBoundary fallback={WidgetErrorFallback}>
        <ChartWidget />
      </ErrorBoundary>
      <ErrorBoundary fallback={InlineErrorFallback}>
        <DataWidget />
      </ErrorBoundary>
    </ErrorBoundary>
  </div>
);
```

**❌ Poor Error Fallback Components:**
```typescript
// Generic fallback without customization
const GenericErrorFallback: React.FC = () => (
  <div>Something went wrong.</div>
);

// No fallback customization
const App: React.FC = () => (
  <ErrorBoundary>
    <Component />
  </ErrorBoundary>
);
```

## Common Patterns

### 1. Route-Level Error Boundaries

Implement error boundaries at the route level to handle navigation errors.

**✅ Route-Level Error Boundaries:**
```jsx
import { Route, Switch } from 'react-router-dom';

class RouteErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Route error:', error, errorInfo);
    // Log route-specific errors
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="route-error">
          <h2>Page Not Available</h2>
          <p>The page you're trying to access is temporarily unavailable.</p>
          <button onClick={() => window.location.href = '/'}>
            Go to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <Router>
      <div>
        <Header />
        <main>
          <Switch>
            <Route path="/dashboard">
              <RouteErrorBoundary>
                <Dashboard />
              </RouteErrorBoundary>
            </Route>
            <Route path="/profile">
              <RouteErrorBoundary>
                <Profile />
              </RouteErrorBoundary>
            </Route>
            <Route path="/settings">
              <RouteErrorBoundary>
                <Settings />
              </RouteErrorBoundary>
            </Route>
            <Route path="*">
              <NotFound />
            </Route>
          </Switch>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
```

### 2. Async Error Boundaries

Handle errors in async operations within components.

**✅ Async Error Boundaries:**
```jsx
class AsyncErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      loading: false 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Async error:', error, errorInfo);
  }

  handleAsyncError = (error) => {
    this.setState({ hasError: true, error });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="async-error">
          <h3>Operation Failed</h3>
          <p>{this.state.error.message}</p>
          <button onClick={this.handleRetry}>Try Again</button>
        </div>
      );
    }

    return React.cloneElement(this.props.children, {
      onError: this.handleAsyncError
    });
  }
}

// Component that uses async operations
class AsyncComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: null, loading: true };
  }

  async componentDidMount() {
    try {
      const data = await this.props.fetchData();
      this.setState({ data, loading: false });
    } catch (error) {
      if (this.props.onError) {
        this.props.onError(error);
      } else {
        throw error; // Let error boundary handle it
      }
    }
  }

  render() {
    if (this.state.loading) {
      return <div>Loading...</div>;
    }
    
    return <div>{JSON.stringify(this.state.data)}</div>;
  }
}

// Usage
<AsyncErrorBoundary>
  <AsyncComponent fetchData={() => fetch('/api/data')} />
</AsyncErrorBoundary>
```

### 3. Error Boundary with State Reset

Implement error boundaries that can reset component state when retrying.

**✅ State-Reset Error Boundary:**
```jsx
class StateResetErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('State reset error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="state-reset-error">
          <h3>Component Error</h3>
          <p>The component encountered an error and needs to reset.</p>
          <div className="error-stats">
            <p>Retry count: {this.state.retryCount}</p>
            <p>Error: {this.state.error.message}</p>
          </div>
          <div className="error-actions">
            <button onClick={this.handleRetry}>Reset Component</button>
            <button onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return React.cloneElement(this.props.children, {
      key: this.state.retryCount // Force re-mount on retry
    });
  }
}
```

## Common Pitfalls and Solutions

### 1. Not Catching All Error Types

**❌ Bad:**
```jsx
class LimitedErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Only logs, doesn't update state properly
    console.error(error);
  }

  render() {
    // Doesn't check for error state properly
    return this.props.children;
  }
}
```

**✅ Good:**
```jsx
class CompleteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.renderFallback();
    }
    return this.props.children;
  }

  renderFallback() {
    return (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <button onClick={() => this.setState({ hasError: false })}>
          Try again
        </button>
      </div>
    );
  }
}
```

### 2. Error Boundaries Themselves Throwing Errors

**❌ Bad:**
```jsx
class ErrorProneErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    // This can throw if error is null or undefined
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error, errorInfo) {
    // This can throw if errorInfo is null
    console.error(errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // This can throw if errorMessage is undefined
      return <div>{this.state.errorMessage}</div>;
    }
    return this.props.children;
  }
}
```

**✅ Good:**
```jsx
class RobustErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Safe handling of error
    return { 
      hasError: true, 
      error: error || new Error('Unknown error occurred')
    };
  }

  componentDidCatch(error, errorInfo) {
    // Safe handling of errorInfo
    this.setState({ 
      errorInfo: errorInfo || { componentStack: 'No component stack available' }
    });
    
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.renderSafeFallback();
    }
    return this.props.children;
  }

  renderSafeFallback() {
    return (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <p>{this.state.error.message || 'An unknown error occurred'}</p>
        <button onClick={() => this.setState({ hasError: false })}>
          Try again
        </button>
      </div>
    );
  }
}
```

### 3. Not Handling Async Errors

**❌ Bad:**
```jsx
class SyncOnlyErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return <div>Error occurred</div>;
    }
    return this.props.children;
  }
}

// Component with async error that won't be caught
class AsyncComponent extends React.Component {
  async componentDidMount() {
    const data = await fetch('/api/data'); // Can throw
    this.setState({ data });
  }
}
```

**✅ Good:**
```jsx
class AsyncAwareErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  handleAsyncError = (error) => {
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return React.cloneElement(this.props.children, {
      onError: this.handleAsyncError
    });
  }
}

// Component that properly handles async errors
class AsyncComponent extends React.Component {
  async componentDidMount() {
    try {
      const data = await fetch('/api/data');
      this.setState({ data });
    } catch (error) {
      if (this.props.onError) {
        this.props.onError(error);
      } else {
        throw error; // Let error boundary handle it
      }
    }
  }
}
```

## Best Practices Summary

1. **Place error boundaries strategically**: At app, feature, and component levels as needed
2. **Provide meaningful fallback UI**: Help users understand what happened and what to do
3. **Log errors properly**: Include context for debugging and monitoring
4. **Handle both sync and async errors**: Error boundaries only catch sync errors by default
5. **Use TypeScript for type safety**: Create type-safe error boundary implementations
6. **Don't overuse error boundaries**: Place them where they make sense, not everywhere
7. **Test error scenarios**: Ensure error boundaries work as expected
8. **Consider user experience**: Make error states helpful and not frustrating
9. **Implement retry mechanisms**: Allow users to recover from errors
10. **Monitor error patterns**: Track errors to identify and fix issues

## Examples in Context

### E-commerce Application
```jsx
// App-level error boundary
class AppErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App error:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error">
          <h1>Store Unavailable</h1>
          <p>We're experiencing technical difficulties. Please try again later.</p>
          <button onClick={() => window.location.reload()}>
            Reload Store
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Product page error boundary
class ProductPageErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Product page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="product-error">
          <h2>Product Unavailable</h2>
          <p>This product page is temporarily unavailable.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
          <button onClick={() => window.location.href = '/products'}>
            Browse Products
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Shopping cart error boundary
class CartErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Cart error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="cart-error">
          <h3>Cart Error</h3>
          <p>There was an issue with your shopping cart.</p>
          <div className="cart-actions">
            <button onClick={() => this.setState({ hasError: false })}>
              Refresh Cart
            </button>
            <button onClick={() => window.location.href = '/cart'}>
              View Cart
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <AppErrorBoundary>
      <Router>
        <Header />
        <Switch>
          <Route path="/products/:id">
            <ProductPageErrorBoundary>
              <ProductPage />
            </ProductPageErrorBoundary>
          </Route>
          <Route path="/cart">
            <CartErrorBoundary>
              <ShoppingCart />
            </CartErrorBoundary>
          </Route>
        </Switch>
      </Router>
    </AppErrorBoundary>
  );
}
```

### Dashboard Application
```jsx
// Dashboard error boundary
class DashboardErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="dashboard-error">
          <h2>Dashboard Error</h2>
          <p>The dashboard encountered an error and needs to reload.</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()}>
              Reload Dashboard
            </button>
            <button onClick={() => this.setState({ hasError: false })}>
              Continue
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Widget error boundary
class WidgetErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Widget error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="widget-error">
          <div className="error-icon">⚠️</div>
          <h3>Widget Failed</h3>
          <p>This widget failed to load.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Retry Widget
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage
function Dashboard() {
  return (
    <DashboardErrorBoundary>
      <div className="dashboard">
        <h1>Analytics Dashboard</h1>
        <div className="widget-grid">
          <WidgetErrorBoundary>
            <ChartWidget />
          </WidgetErrorBoundary>
          <WidgetErrorBoundary>
            <DataWidget />
          </WidgetErrorBoundary>
          <WidgetErrorBoundary>
            <MetricWidget />
          </WidgetErrorBoundary>
        </div>
      </div>
    </DashboardErrorBoundary>
  );
}
```

### API Integration
```jsx
// API error boundary with retry logic
class ApiErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('API error:', error, errorInfo);
  }

  handleRetry = async () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1
    }));
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="api-error">
          <h3>API Error</h3>
          <p>Failed to fetch data from the server.</p>
          <div className="error-stats">
            <p>Retry count: {this.state.retryCount}</p>
            <p>Error: {this.state.error.message}</p>
          </div>
          <div className="error-actions">
            <button onClick={this.handleRetry}>Retry</button>
            <button onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return React.cloneElement(this.props.children, {
      key: this.state.retryCount
    });
  }
}

// Data fetching component
class DataComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: null, loading: true };
  }

  async componentDidMount() {
    try {
      const response = await fetch(this.props.endpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      this.setState({ data, loading: false });
    } catch (error) {
      if (this.props.onError) {
        this.props.onError(error);
      } else {
        throw error;
      }
    }
  }

  render() {
    if (this.state.loading) {
      return <div>Loading...</div>;
    }
    return <div>{JSON.stringify(this.state.data)}</div>;
  }
}

// Usage
<ApiErrorBoundary>
  <DataComponent endpoint="/api/data" />
</ApiErrorBoundary>
```

Remember: Error boundaries are essential for creating robust React applications. Use them strategically, provide helpful fallback UI, and always test your error handling to ensure a good user experience when things go wrong.