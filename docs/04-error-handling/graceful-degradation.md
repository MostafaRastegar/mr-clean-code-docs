# Graceful Degradation

## Overview

Graceful degradation is the practice of designing applications to continue functioning, even if at a reduced level of capability, when components fail or external dependencies become unavailable. This document covers strategies for implementing graceful degradation in JavaScript and TypeScript applications.

## Core Principles

### 1. Design for Failure

Assume that external services, APIs, and components will fail, and design your application to handle these failures gracefully.

**✅ Good Graceful Degradation:**
```javascript
class UserService {
  constructor(apiService, cacheService, fallbackService) {
    this.apiService = apiService;
    this.cacheService = cacheService;
    this.fallbackService = fallbackService;
  }

  async getUser(userId) {
    try {
      // Try primary service first
      const user = await this.apiService.getUser(userId);
      this.cacheService.set(`user:${userId}`, user);
      return user;
    } catch (error) {
      console.warn('Primary API failed, trying cache:', error.message);
      
      try {
        // Try cache as fallback
        const cachedUser = await this.cacheService.get(`user:${userId}`);
        if (cachedUser) {
          console.log('Returning cached user data');
          return cachedUser;
        }
      } catch (cacheError) {
        console.warn('Cache also failed:', cacheError.message);
      }
      
      try {
        // Try fallback service
        const fallbackUser = await this.fallbackService.getUser(userId);
        console.log('Using fallback service');
        return fallbackUser;
      } catch (fallbackError) {
        console.error('All services failed, returning default user');
        return this.getDefaultUser(userId);
      }
    }
  }

  getDefaultUser(userId) {
    return {
      id: userId,
      name: 'User',
      email: 'user@example.com',
      status: 'offline',
      avatar: '/default-avatar.png'
    };
  }
}

// Usage
const userService = new UserService(
  new PrimaryApiService(),
  new RedisCacheService(),
  new FallbackApiService()
);

async function displayUserProfile(userId) {
  try {
    const user = await userService.getUser(userId);
    renderUserProfile(user);
  } catch (error) {
    console.error('Failed to load user profile:', error);
    renderDefaultProfile();
  }
}
```

**❌ Bad No Degradation:**
```javascript
class UserService {
  constructor(apiService) {
    this.apiService = apiService;
  }

  async getUser(userId) {
    // No fallback - will fail completely if API is down
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  }
}

// Usage - will break completely if service fails
async function displayUserProfile(userId) {
  const user = await userService.getUser(userId); // Can throw
  renderUserProfile(user);
}
```

### 2. Implement Circuit Breakers

Use circuit breakers to prevent cascading failures and allow services time to recover.

**✅ Circuit Breaker Implementation:**
```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconds
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.successCount = 0;
    this.monitoringStartTime = Date.now();
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        console.log('Circuit breaker: transitioning to HALF_OPEN');
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 3) {
        console.log('Circuit breaker: transitioning to CLOSED');
        this.state = 'CLOSED';
      }
    }
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      console.log('Circuit breaker: transitioning to OPEN');
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Usage with circuit breaker
class ResilientService {
  constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      recoveryTimeout: 30000,
      monitoringPeriod: 10000
    });
  }

  async fetchData() {
    return await this.circuitBreaker.execute(async () => {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    });
  }

  async getDataWithFallback() {
    try {
      return await this.fetchData();
    } catch (error) {
      console.warn('Primary service failed, using cached data:', error.message);
      return await this.getCachedData();
    }
  }

  async getCachedData() {
    // Return cached or default data
    return { data: 'cached', timestamp: Date.now() };
  }
}
```

**❌ No Circuit Breaker:**
```javascript
class FragileService {
  async fetchData() {
    // No protection - will keep trying even if service is down
    const response = await fetch('/api/data');
    return response.json();
  }
}

// Usage - will keep failing and potentially overload the system
class Client {
  async processData() {
    while (true) {
      try {
        const data = await this.service.fetchData(); // Will keep failing
        this.process(data);
      } catch (error) {
        console.error('Service failed:', error);
        // No backoff or circuit breaker
      }
    }
  }
}
```

### 3. Provide Fallback Content

Always have fallback content or functionality when primary features are unavailable.

**✅ Fallback Content Strategy:**
```javascript
class ContentService {
  constructor() {
    this.primaryContent = new PrimaryContentProvider();
    this.secondaryContent = new SecondaryContentProvider();
    this.staticContent = new StaticContentProvider();
  }

  async getContent(contentId) {
    try {
      // Try primary content first
      const content = await this.primaryContent.getContent(contentId);
      return { ...content, source: 'primary' };
    } catch (error) {
      console.warn('Primary content failed, trying secondary:', error.message);
      
      try {
        // Try secondary content
        const content = await this.secondaryContent.getContent(contentId);
        return { ...content, source: 'secondary' };
      } catch (secondaryError) {
        console.warn('Secondary content failed, using static content:', secondaryError.message);
        
        // Use static/fallback content
        const content = this.staticContent.getContent(contentId);
        return { ...content, source: 'static', warning: 'Using fallback content' };
      }
    }
  }

  async getRecommendedContent(userId) {
    try {
      // Try personalized recommendations
      const recommendations = await this.primaryContent.getRecommendations(userId);
      return { recommendations, type: 'personalized' };
    } catch (error) {
      console.warn('Personalized recommendations failed, using general recommendations');
      
      try {
        // Try general recommendations
        const recommendations = await this.secondaryContent.getGeneralRecommendations();
        return { recommendations, type: 'general' };
      } catch (secondaryError) {
        // Use static recommendations
        const recommendations = this.staticContent.getPopularContent();
        return { 
          recommendations, 
          type: 'static', 
          warning: 'Showing popular content instead of personalized recommendations' 
        };
      }
    }
  }
}

// UI component that handles degraded content
function ContentDisplay({ contentId }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    async function loadContent() {
      try {
        const result = await contentService.getContent(contentId);
        setContent(result);
        
        if (result.source !== 'primary') {
          setDegraded(true);
          showNotification(`Content loaded from ${result.source} source`);
        }
      } catch (error) {
        console.error('Failed to load content:', error);
        setContent({
          title: 'Content Unavailable',
          body: 'We are experiencing technical difficulties. Please try again later.',
          source: 'error'
        });
        setDegraded(true);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [contentId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`content-display ${degraded ? 'degraded' : ''}`}>
      {degraded && (
        <div className="degradation-notice">
          ⚠️ Showing fallback content due to service issues
        </div>
      )}
      
      <h1>{content.title}</h1>
      <div className="content-body">{content.body}</div>
      
      {content.source && content.source !== 'primary' && (
        <div className="content-source">
          Source: {content.source}
        </div>
      )}
    </div>
  );
}
```

**❌ No Fallback Content:**
```javascript
class ContentService {
  async getContent(contentId) {
    // No fallback - will fail completely
    const response = await fetch(`/api/content/${contentId}`);
    return response.json();
  }
}

// UI component that breaks when content fails
function ContentDisplay({ contentId }) {
  const [content, setContent] = useState(null);

  useEffect(() => {
    // Will throw if content fails to load
    contentService.getContent(contentId).then(setContent);
  }, [contentId]);

  // Will break if content is null
  return (
    <div>
      <h1>{content.title}</h1>
      <div>{content.body}</div>
    </div>
  );
}
```

## TypeScript-Specific Considerations

### 1. Type-Safe Degradation

Use TypeScript to ensure type safety even when degrading functionality.

**✅ Type-Safe Degradation:**
```typescript
interface Content {
  id: string;
  title: string;
  body: string;
  author: string;
  publishedAt: Date;
}

interface DegradedContent extends Content {
  source: 'primary' | 'secondary' | 'static';
  warning?: string;
}

interface FallbackContent {
  id: string;
  title: 'Content Unavailable';
  body: string;
  author: 'System';
  publishedAt: Date;
  source: 'fallback';
  error: string;
}

type ContentResult = DegradedContent | FallbackContent;

class TypeSafeContentService {
  async getContent(contentId: string): Promise<ContentResult> {
    try {
      // Primary content
      const content = await this.fetchPrimaryContent(contentId);
      return { ...content, source: 'primary' };
    } catch (error) {
      try {
        // Secondary content
        const content = await this.fetchSecondaryContent(contentId);
        return { 
          ...content, 
          source: 'secondary',
          warning: 'Using secondary content source'
        };
      } catch (secondaryError) {
        // Static/fallback content
        return {
          id: contentId,
          title: 'Content Unavailable',
          body: 'We are experiencing technical difficulties. Please try again later.',
          author: 'System',
          publishedAt: new Date(),
          source: 'fallback',
          error: secondaryError.message
        };
      }
    }
  }

  private async fetchPrimaryContent(id: string): Promise<Content> {
    const response = await fetch(`/api/content/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  private async fetchSecondaryContent(id: string): Promise<Content> {
    const response = await fetch(`/api/backup/content/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
}

// Component with type-safe content handling
function ContentDisplay({ contentId }: { contentId: string }) {
  const [content, setContent] = useState<ContentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        const result = await contentService.getContent(contentId);
        setContent(result);
      } catch (error) {
        // This should not happen with proper degradation
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [contentId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!content) {
    return <div>Failed to load content</div>;
  }

  // TypeScript ensures we handle both content types safely
  if (content.source === 'fallback') {
    return (
      <div className="error-content">
        <h1>{content.title}</h1>
        <p>{content.body}</p>
        <p className="error-details">Error: {content.error}</p>
      </div>
    );
  }

  return (
    <div className={`content ${content.source !== 'primary' ? 'degraded' : ''}`}>
      {content.warning && (
        <div className="warning-banner">
          ⚠️ {content.warning}
        </div>
      )}
      
      <h1>{content.title}</h1>
      <div className="content-body">{content.body}</div>
      <div className="content-meta">
        <span>Author: {content.author}</span>
        <span>Source: {content.source}</span>
      </div>
    </div>
  );
}
```

**❌ Non-Type-Safe Degradation:**
```typescript
// Generic content without proper typing for degradation
interface GenericContent {
  [key: string]: any;
}

class NonTypeSafeService {
  async getContent(contentId: string): Promise<GenericContent> {
    try {
      return await this.fetchContent(contentId);
    } catch (error) {
      // Returning different structure - breaks type safety
      return {
        error: true,
        message: 'Content unavailable',
        // Missing required fields
      };
    }
  }
}

// Component that can break due to type inconsistencies
function ContentDisplay({ contentId }: { contentId: string }) {
  const [content, setContent] = useState<GenericContent | null>(null);

  useEffect(() => {
    contentService.getContent(contentId).then(setContent);
  }, [contentId]);

  // Can break if content doesn't have expected properties
  return (
    <div>
      <h1>{content.title}</h1> {/* content might not have title */}
      <div>{content.body}</div>  {/* content might not have body */}
    </div>
  );
}
```

### 2. Degradation State Management

Use TypeScript to manage application state during degradation scenarios.

**✅ State Management with Degradation:**
```typescript
interface AppState {
  status: 'loading' | 'healthy' | 'degraded' | 'error';
  features: {
    primaryFeature: 'enabled' | 'disabled' | 'fallback';
    secondaryFeature: 'enabled' | 'disabled' | 'fallback';
    tertiaryFeature: 'enabled' | 'disabled' | 'fallback';
  };
  lastDegradationTime?: Date;
  degradationReason?: string;
}

class AppStateManager {
  private state: AppState = {
    status: 'loading',
    features: {
      primaryFeature: 'enabled',
      secondaryFeature: 'enabled',
      tertiaryFeature: 'enabled'
    }
  };

  setState(newState: Partial<AppState>): void {
    this.state = { ...this.state, ...newState };
    this.notifyStateChange();
  }

  degradeFeature(feature: keyof AppState['features'], reason: string): void {
    this.state.features[feature] = 'fallback';
    
    // Check if overall app should be degraded
    const fallbackCount = Object.values(this.state.features).filter(
      status => status === 'fallback'
    ).length;

    if (fallbackCount > 0 && this.state.status !== 'error') {
      this.setState({
        status: 'degraded',
        lastDegradationTime: new Date(),
        degradationReason: reason
      });
    }

    console.warn(`Feature ${feature} degraded: ${reason}`);
  }

  restoreFeature(feature: keyof AppState['features']): void {
    this.state.features[feature] = 'enabled';
    
    // Check if app should be restored to healthy
    const fallbackCount = Object.values(this.state.features).filter(
      status => status === 'fallback'
    ).length;

    if (fallbackCount === 0 && this.state.status === 'degraded') {
      this.setState({
        status: 'healthy',
        lastDegradationTime: undefined,
        degradationReason: undefined
      });
    }

    console.log(`Feature ${feature} restored`);
  }

  getState(): Readonly<AppState> {
    return { ...this.state };
  }

  private notifyStateChange(): void {
    // Notify components of state change
    document.dispatchEvent(new CustomEvent('appStateChange', {
      detail: this.state
    }));
  }
}

// Usage in components
function useAppState() {
  const [state, setState] = useState<AppState>({
    status: 'loading',
    features: {
      primaryFeature: 'enabled',
      secondaryFeature: 'enabled',
      tertiaryFeature: 'enabled'
    }
  });

  useEffect(() => {
    const handler = (event: CustomEvent) => {
      setState(event.detail);
    };

    document.addEventListener('appStateChange', handler as EventListener);
    return () => document.removeEventListener('appStateChange', handler as EventListener);
  }, []);

  return state;
}

function App() {
  const state = useAppState();
  
  return (
    <div className={`app ${state.status}`}>
      {state.status === 'degraded' && (
        <div className="degradation-banner">
          ⚠️ Some features are currently unavailable
          <span className="reason">{state.degradationReason}</span>
        </div>
      )}
      
      <PrimaryFeature enabled={state.features.primaryFeature} />
      <SecondaryFeature enabled={state.features.secondaryFeature} />
      <TertiaryFeature enabled={state.features.tertiaryFeature} />
    </div>
  );
}

function PrimaryFeature({ enabled }: { enabled: 'enabled' | 'disabled' | 'fallback' }) {
  if (enabled === 'disabled') {
    return <div>Primary feature is currently unavailable</div>;
  }

  if (enabled === 'fallback') {
    return <div>Using simplified version of primary feature</div>;
  }

  return <div>Full primary feature functionality</div>;
}
```

**❌ Poor State Management:**
```typescript
// No structured state management for degradation
interface SimpleState {
  loading: boolean;
  error?: string;
}

class PoorStateManager {
  private state: SimpleState = { loading: true };

  updateState(newState: Partial<SimpleState>): void {
    this.state = { ...this.state, ...newState };
  }

  // No feature-specific degradation tracking
  handleError(error: string): void {
    this.state = { loading: false, error };
  }
}

// Components don't know about specific feature states
function App() {
  const [state, setState] = useState<SimpleState>({ loading: true });

  return (
    <div>
      {state.error && <div className="error">{state.error}</div>}
      {/* All features show the same error state */}
      <Feature1 />
      <Feature2 />
      <Feature3 />
    </div>
  );
}
```

### 3. Error Recovery with TypeScript

Implement type-safe error recovery mechanisms.

**✅ Error Recovery:**
```typescript
interface RecoveryStrategy<T> {
  name: string;
  canRecover: (error: Error) => boolean;
  recover: (error: Error) => Promise<T>;
}

class RecoveryManager<T> {
  private strategies: RecoveryStrategy<T>[] = [];

  addStrategy(strategy: RecoveryStrategy<T>): void {
    this.strategies.push(strategy);
  }

  async executeWithRecovery(
    operation: () => Promise<T>,
    fallback: () => T
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.warn('Operation failed, attempting recovery:', error);

      for (const strategy of this.strategies) {
        if (strategy.canRecover(error)) {
          try {
            console.log(`Attempting recovery with ${strategy.name}`);
            const result = await strategy.recover(error);
            console.log(`Recovery successful with ${strategy.name}`);
            return result;
          } catch (recoveryError) {
            console.warn(`Recovery failed with ${strategy.name}:`, recoveryError);
            continue;
          }
        }
      }

      console.error('All recovery strategies failed, using fallback');
      return fallback();
    }
  }
}

// Specific recovery strategies
class CacheRecoveryStrategy<T> implements RecoveryStrategy<T> {
  name = 'Cache Recovery';
  
  constructor(private cache: CacheService) {}

  canRecover(error: Error): boolean {
    return error.message.includes('Network') || 
           error.message.includes('Timeout') ||
           error.message.includes('Service Unavailable');
  }

  async recover(error: Error): Promise<T> {
    console.log('Attempting cache recovery');
    // Implementation would fetch from cache
    return this.cache.get('fallback-data') as T;
  }
}

class DefaultDataRecoveryStrategy<T> implements RecoveryStrategy<T> {
  name = 'Default Data Recovery';
  
  constructor(private defaultData: T) {}

  canRecover(error: Error): boolean {
    return true; // Can always provide default data
  }

  async recover(error: Error): Promise<T> {
    console.log('Providing default data');
    return this.defaultData;
  }
}

// Usage
const recoveryManager = new RecoveryManager<UserData>();

recoveryManager.addStrategy(
  new CacheRecoveryStrategy(new CacheService())
);

recoveryManager.addStrategy(
  new DefaultDataRecoveryStrategy({
    id: 'default',
    name: 'Default User',
    email: 'user@example.com'
  })
);

async function loadUserData(userId: string): Promise<UserData> {
  return await recoveryManager.executeWithRecovery(
    () => userService.getUser(userId),
    () => ({
      id: 'error',
      name: 'Error User',
      email: 'error@example.com'
    })
  );
}
```

**❌ Poor Error Recovery:**
```typescript
// Generic error handling without recovery strategies
class PoorRecoveryManager {
  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    fallback: T
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error('Operation failed:', error);
      return fallback; // Simple fallback, no recovery strategies
    }
  }
}

// Usage - no intelligent recovery
const manager = new PoorRecoveryManager();

async function loadUserData(userId: string): Promise<UserData> {
  return await manager.executeWithRecovery(
    () => userService.getUser(userId),
    { id: 'fallback', name: 'Fallback User', email: 'fallback@example.com' }
  );
}
```

## Common Patterns

### 1. Progressive Enhancement

Build features that work at basic levels and enhance when services are available.

**✅ Progressive Enhancement:**
```javascript
class FeatureManager {
  constructor() {
    this.services = {
      primary: new PrimaryService(),
      secondary: new SecondaryService(),
      offline: new OfflineService()
    };
  }

  async initializeFeature(featureName) {
    const feature = this.createBasicFeature(featureName);
    
    // Try to enhance with primary service
    try {
      const enhancedFeature = await this.enhanceWithService(feature, this.services.primary);
      return this.enhanceWithSecondary(enhancedFeature);
    } catch (primaryError) {
      console.warn('Primary service unavailable, using secondary enhancement');
      
      try {
        const enhancedFeature = await this.enhanceWithService(feature, this.services.secondary);
        return enhancedFeature;
      } catch (secondaryError) {
        console.warn('Secondary service unavailable, using basic feature');
        return feature;
      }
    }
  }

  createBasicFeature(name) {
    // Create basic version that works without external services
    return {
      name,
      type: 'basic',
      functionality: this.getBasicFunctionality(name),
      enhanced: false
    };
  }

  async enhanceWithService(feature, service) {
    const enhancedData = await service.enhanceFeature(feature.name);
    return {
      ...feature,
      ...enhancedData,
      enhanced: true,
      enhancementLevel: service.level
    };
  }

  async enhanceWithSecondary(feature) {
    try {
      const secondaryData = await this.services.secondary.addSecondaryFeatures(feature.name);
      return {
        ...feature,
        ...secondaryData,
        hasSecondaryFeatures: true
      };
    } catch (error) {
      console.warn('Secondary features unavailable');
      return feature;
    }
  }

  getBasicFunctionality(name) {
    // Return basic functionality that doesn't depend on external services
    const basicFeatures = {
      'user-profile': ['display-basic-info', 'edit-basic-info'],
      'content-display': ['display-content', 'basic-navigation'],
      'search': ['basic-search', 'simple-filtering']
    };
    
    return basicFeatures[name] || [];
  }
}

// Usage
const featureManager = new FeatureManager();

async function initializeUserProfile() {
  const userProfile = await featureManager.initializeFeature('user-profile');
  
  if (userProfile.enhanced) {
    console.log('Full user profile features available');
  } else {
    console.log('Basic user profile features only');
  }
  
  return userProfile;
}
```

### 2. Service Degradation Levels

Implement different levels of service degradation based on severity.

**✅ Service Degradation Levels:**
```javascript
class ServiceDegradationManager {
  constructor() {
    this.degradationLevel = 'normal'; // normal, degraded, severely-degraded, offline
    this.services = new Map();
  }

  registerService(serviceName, service) {
    this.services.set(serviceName, {
      service,
      status: 'healthy',
      degradationLevel: 0
    });
  }

  async executeService(serviceName, operation) {
    const serviceInfo = this.services.get(serviceName);
    if (!serviceInfo) {
      throw new Error(`Service ${serviceName} not registered`);
    }

    try {
      const result = await operation(serviceInfo.service);
      this.updateServiceStatus(serviceName, 'healthy');
      return result;
    } catch (error) {
      this.handleServiceFailure(serviceName, error);
      throw error;
    }
  }

  handleServiceFailure(serviceName, error) {
    const serviceInfo = this.services.get(serviceName);
    
    serviceInfo.degradationLevel++;
    
    if (serviceInfo.degradationLevel >= 5) {
      serviceInfo.status = 'failed';
      this.updateOverallDegradation();
    } else if (serviceInfo.degradationLevel >= 3) {
      serviceInfo.status = 'degraded';
    }
    
    console.warn(`Service ${serviceName} degraded: ${error.message}`);
  }

  updateOverallDegradation() {
    const failedServices = Array.from(this.services.values())
      .filter(service => service.status === 'failed').length;
    
    const totalServices = this.services.size;
    const failureRate = failedServices / totalServices;

    if (failureRate >= 0.8) {
      this.degradationLevel = 'offline';
    } else if (failureRate >= 0.5) {
      this.degradationLevel = 'severely-degraded';
    } else if (failureRate >= 0.2) {
      this.degradationLevel = 'degraded';
    } else {
      this.degradationLevel = 'normal';
    }

    this.notifyDegradationChange();
  }

  notifyDegradationChange() {
    document.dispatchEvent(new CustomEvent('degradationChange', {
      detail: {
        level: this.degradationLevel,
        services: Array.from(this.services.entries()).map(([name, info]) => ({
          name,
          status: info.status,
          degradationLevel: info.degradationLevel
        }))
      }
    }));
  }

  getDegradationLevel() {
    return this.degradationLevel;
  }
}

// Usage
const degradationManager = new ServiceDegradationManager();

degradationManager.registerService('user-api', new UserService());
degradationManager.registerService('content-api', new ContentService());
degradationManager.registerService('recommendation-api', new RecommendationService());

async function getUserProfile(userId) {
  return await degradationManager.executeService('user-api', async (service) => {
    return await service.getUser(userId);
  });
}

// Listen for degradation changes
document.addEventListener('degradationChange', (event) => {
  const { level, services } = event.detail;
  console.log(`System degradation level: ${level}`);
  
  if (level === 'offline') {
    showOfflineMode();
  } else if (level === 'severely-degraded') {
    showLimitedFunctionality();
  }
});
```

### 3. Graceful Feature Disabling

Disable features gracefully when dependencies become unavailable.

**✅ Graceful Feature Disabling:**
```javascript
class FeatureFlagManager {
  constructor() {
    this.features = new Map();
    this.dependencies = new Map();
  }

  defineFeature(name, config) {
    this.features.set(name, {
      ...config,
      enabled: true,
      dependencies: config.dependencies || []
    });
  }

  defineDependency(name, healthCheck) {
    this.dependencies.set(name, {
      healthCheck,
      healthy: true,
      lastCheck: null
    });
  }

  async checkDependencies() {
    for (const [name, dependency] of this.dependencies) {
      try {
        const isHealthy = await dependency.healthCheck();
        dependency.healthy = isHealthy;
        dependency.lastCheck = Date.now();
      } catch (error) {
        dependency.healthy = false;
        dependency.lastCheck = Date.now();
        console.warn(`Dependency ${name} is unhealthy:`, error);
      }
    }
  }

  updateFeatureStates() {
    for (const [name, feature] of this.features) {
      const dependenciesHealthy = feature.dependencies.every(depName => {
        const dep = this.dependencies.get(depName);
        return dep && dep.healthy;
      });

      if (!dependenciesHealthy && feature.enabled) {
        feature.enabled = false;
        this.notifyFeatureDisabled(name, feature.dependencies);
      } else if (dependenciesHealthy && !feature.enabled) {
        feature.enabled = true;
        this.notifyFeatureEnabled(name);
      }
    }
  }

  isFeatureEnabled(name) {
    const feature = this.features.get(name);
    return feature ? feature.enabled : false;
  }

  getAvailableFeatures() {
    return Array.from(this.features.entries())
      .filter(([name, feature]) => feature.enabled)
      .map(([name]) => name);
  }

  notifyFeatureDisabled(featureName, dependencies) {
    console.log(`Feature ${featureName} disabled due to unhealthy dependencies:`, dependencies);
    
    // Show user notification
    showNotification({
      type: 'warning',
      message: `Feature "${featureName}" is temporarily unavailable`
    });
  }

  notifyFeatureEnabled(featureName) {
    console.log(`Feature ${featureName} re-enabled`);
    
    // Show user notification
    showNotification({
      type: 'success',
      message: `Feature "${featureName}" is now available`
    });
  }
}

// Usage
const featureManager = new FeatureFlagManager();

// Define dependencies
featureManager.defineDependency('user-api', async () => {
  const response = await fetch('/api/health/user');
  return response.ok;
});

featureManager.defineDependency('recommendation-api', async () => {
  const response = await fetch('/api/health/recommendations');
  return response.ok;
});

// Define features with dependencies
featureManager.defineFeature('user-profile', {
  dependencies: ['user-api']
});

featureManager.defineFeature('personalized-recommendations', {
  dependencies: ['user-api', 'recommendation-api']
});

featureManager.defineFeature('advanced-search', {
  dependencies: ['user-api']
});

// Periodic health checks
setInterval(async () => {
  await featureManager.checkDependencies();
  featureManager.updateFeatureStates();
}, 30000);

// Component that respects feature flags
function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (featureManager.isFeatureEnabled('user-profile')) {
      loadUserProfile().then(setUser).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!featureManager.isFeatureEnabled('user-profile')) {
    return <div>User profile feature is currently unavailable</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      {/* Profile content */}
    </div>
  );
}
```

## Common Pitfalls and Solutions

### 1. Cascading Failures

**❌ Bad:**
```javascript
// Services that don't protect against cascading failures
class OrderService {
  async processOrder(order) {
    const user = await userService.getUser(order.userId); // Can fail
    const inventory = await inventoryService.checkInventory(order.items); // Can fail
    const payment = await paymentService.processPayment(order.payment); // Can fail
    const notification = await notificationService.sendNotification(user.email); // Can fail
    
    return { user, inventory, payment, notification };
  }
}
```

**✅ Good:**
```javascript
// Services with protection against cascading failures
class ResilientOrderService {
  async processOrder(order) {
    // Use circuit breakers and timeouts
    const user = await this.withCircuitBreaker(
      () => userService.getUser(order.userId),
      'user-service'
    ).catch(() => this.getFallbackUser(order.userId));

    const inventory = await this.withCircuitBreaker(
      () => inventoryService.checkInventory(order.items),
      'inventory-service'
    ).catch(() => this.getFallbackInventory(order.items));

    const payment = await this.withCircuitBreaker(
      () => paymentService.processPayment(order.payment),
      'payment-service'
    ).catch(() => this.getFallbackPayment(order.payment));

    // Notifications are non-critical, don't let them fail the order
    this.sendNotification(user.email).catch(error => {
      console.warn('Notification failed:', error);
    });

    return { user, inventory, payment };
  }

  async withCircuitBreaker(operation, serviceName) {
    // Implementation with circuit breaker
    return await circuitBreakers[serviceName].execute(operation);
  }

  getFallbackUser(userId) {
    return { id: userId, name: 'User', email: 'user@example.com' };
  }

  getFallbackInventory(items) {
    return items.map(item => ({ ...item, available: false }));
  }

  getFallbackPayment(payment) {
    return { ...payment, status: 'pending', method: 'fallback' };
  }

  async sendNotification(email) {
    // Non-critical operation
    await notificationService.sendNotification(email);
  }
}
```

### 2. Poor User Experience During Degradation

**❌ Bad:**
```javascript
// Poor user experience - shows errors to users
function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiService.getDashboardData().then(setData).catch(error => {
      setData({ error: true, message: error.message }); // Show technical error to user
    });
  }, []);

  if (data?.error) {
    return <div>Error: {data.message}</div>; // Technical error message
  }

  return <div>Dashboard content</div>;
}
```

**✅ Good:**
```javascript
// Good user experience - graceful degradation
function Dashboard() {
  const [data, setData] = useState(null);
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const result = await resilientApiService.getDashboardData();
      setData(result);
    } catch (error) {
      console.warn('Dashboard data unavailable, using cached data');
      const cachedData = await cacheService.getDashboardData();
      if (cachedData) {
        setData(cachedData);
        setDegraded(true);
      } else {
        setData(getDefaultDashboardData());
        setDegraded(true);
      }
    }
  }

  if (degraded) {
    return (
      <div className="dashboard degraded">
        <div className="degradation-notice">
          ⚠️ Showing cached data due to service issues
        </div>
        <DashboardContent data={data} />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <DashboardContent data={data} />
    </div>
  );
}

function getDefaultDashboardData() {
  return {
    metrics: [],
    recentActivity: [],
    recommendations: []
  };
}
```

### 3. No Monitoring of Degradation

**❌ Bad:**
```javascript
// No monitoring of degradation events
class Service {
  async getData() {
    try {
      return await this.primaryService.getData();
    } catch (error) {
      return await this.fallbackService.getData(); // Silent fallback
    }
  }
}
```

**✅ Good:**
```javascript
// Monitoring degradation events
class MonitoredService {
  constructor() {
    this.metrics = new MetricsCollector();
  }

  async getData() {
    try {
      return await this.primaryService.getData();
    } catch (error) {
      this.metrics.increment('service.fallback_used', {
        service: 'primary',
        error: error.message
      });
      
      console.warn('Primary service failed, using fallback:', error);
      
      return await this.fallbackService.getData();
    }
  }
}

// Metrics collection
class MetricsCollector {
  increment(metricName, tags = {}) {
    // Send metrics to monitoring system
    console.log(`Metric: ${metricName}`, tags);
    
    // Could send to Prometheus, DataDog, etc.
    this.sendToMonitoring(metricName, 1, tags);
  }

  sendToMonitoring(metricName, value, tags) {
    // Implementation for sending to monitoring system
  }
}
```

## Best Practices Summary

1. **Design for failure**: Assume services will fail and plan accordingly
2. **Implement circuit breakers**: Prevent cascading failures
3. **Provide fallback content**: Always have alternatives when primary features fail
4. **Use type-safe degradation**: Maintain type safety even when degrading
5. **Monitor degradation events**: Track when and why degradation occurs
6. **Communicate with users**: Inform users about degraded functionality
7. **Implement progressive enhancement**: Build features that work at basic levels
8. **Use feature flags**: Control feature availability based on dependencies
9. **Test degradation scenarios**: Ensure degradation works as expected
10. **Plan for recovery**: Implement mechanisms to restore full functionality

## Examples in Context

### E-commerce Application
```javascript
class EcommerceResilienceManager {
  constructor() {
    this.circuitBreakers = {
      payment: new CircuitBreaker({ failureThreshold: 3 }),
      inventory: new CircuitBreaker({ failureThreshold: 5 }),
      recommendations: new CircuitBreaker({ failureThreshold: 10 })
    };
  }

  async processCheckout(order) {
    try {
      // Try primary payment processing
      const paymentResult = await this.circuitBreakers.payment.execute(() =>
        this.paymentService.processPayment(order.payment)
      );
      
      // Try inventory reservation
      const inventoryResult = await this.circuitBreakers.inventory.execute(() =>
        this.inventoryService.reserveItems(order.items)
      );
      
      return {
        success: true,
        payment: paymentResult,
        inventory: inventoryResult,
        recommendations: await this.getRecommendations(order.userId)
      };
    } catch (error) {
      // Fallback: process order without inventory check or recommendations
      console.warn('Primary checkout failed, using fallback:', error);
      
      const paymentResult = await this.processPaymentFallback(order.payment);
      
      return {
        success: true,
        payment: paymentResult,
        inventory: { status: 'skipped', reason: 'service unavailable' },
        recommendations: { items: [], source: 'static' },
        degraded: true,
        warning: 'Some features are temporarily unavailable'
      };
    }
  }

  async getRecommendations(userId) {
    try {
      return await this.circuitBreakers.recommendations.execute(() =>
        this.recommendationService.getRecommendations(userId)
      );
    } catch (error) {
      console.warn('Recommendations unavailable, using popular items');
      return {
        items: await this.getPopularItems(),
        source: 'popular'
      };
    }
  }

  async processPaymentFallback(payment) {
    // Simplified payment processing
    return {
      status: 'pending',
      transactionId: `fallback-${Date.now()}`,
      method: payment.method,
      amount: payment.amount
    };
  }

  async getPopularItems() {
    // Return cached popular items
    return [
      { id: 'item1', name: 'Popular Item 1' },
      { id: 'item2', name: 'Popular Item 2' }
    ];
  }
}
```

### API Development
```javascript
class ApiResilienceMiddleware {
  constructor() {
    this.rateLimiters = new Map();
    this.circuitBreakers = new Map();
  }

  createRateLimiter(maxRequests, windowMs) {
    return {
      requests: [],
      maxRequests,
      windowMs,
      
      isAllowed() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        
        if (this.requests.length >= this.maxRequests) {
          return false;
        }
        
        this.requests.push(now);
        return true;
      }
    };
  }

  rateLimit(maxRequests = 100, windowMs = 60000) {
    return (req, res, next) => {
      const ip = req.ip;
      if (!this.rateLimiters.has(ip)) {
        this.rateLimiters.set(ip, this.createRateLimiter(maxRequests, windowMs));
      }

      const limiter = this.rateLimiters.get(ip);
      if (!limiter.isAllowed()) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      next();
    };
  }

  circuitBreaker(serviceName, options = {}) {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, new CircuitBreaker(options));
    }

    const breaker = this.circuitBreakers.get(serviceName);

    return async (req, res, next) => {
      req.circuitBreaker = breaker;
      next();
    };
  }

  async callExternalService(serviceName, operation) {
    const breaker = this.circuitBreakers.get(serviceName);
    if (!breaker) {
      throw new Error(`Circuit breaker for ${serviceName} not found`);
    }

    return await breaker.execute(operation);
  }
}

// Usage in Express app
const app = express();
const resilience = new ApiResilienceMiddleware();

// Apply rate limiting
app.use(resilience.rateLimit(100, 60000));

// Apply circuit breaker to specific routes
app.use('/api/external', resilience.circuitBreaker('external-api', {
  failureThreshold: 5,
  recoveryTimeout: 30000
}));

app.get('/api/external/data', async (req, res) => {
  try {
    const data = await resilience.callExternalService('external-api', async () => {
      const response = await fetch('https://external-api.com/data');
      return response.json();
    });
    
    res.json(data);
  } catch (error) {
    res.status(503).json({
      error: 'External service unavailable',
      message: 'Please try again later'
    });
  }
});
```

### Data Processing
```javascript
class DataProcessingPipeline {
  constructor() {
    this.stages = [];
    this.fallbackStrategies = new Map();
  }

  addStage(name, processor, options = {}) {
    this.stages.push({
      name,
      processor,
      required: options.required !== false,
      timeout: options.timeout || 30000
    });
  }

  setFallbackStrategy(stageName, strategy) {
    this.fallbackStrategies.set(stageName, strategy);
  }

  async process(data) {
    let result = data;
    const processingLog = [];

    for (const stage of this.stages) {
      try {
        const startTime = Date.now();
        const processed = await this.executeWithTimeout(
          stage.processor,
          result,
          stage.timeout
        );
        
        result = processed;
        processingLog.push({
          stage: stage.name,
          status: 'success',
          duration: Date.now() - startTime
        });
      } catch (error) {
        processingLog.push({
          stage: stage.name,
          status: 'failed',
          error: error.message
        });

        if (stage.required) {
          throw new Error(`Required stage ${stage.name} failed: ${error.message}`);
        }

        // Try fallback strategy
        const fallbackStrategy = this.fallbackStrategies.get(stage.name);
        if (fallbackStrategy) {
          try {
            result = await fallbackStrategy(result, error);
            processingLog.push({
              stage: stage.name,
              status: 'fallback',
              strategy: fallbackStrategy.name
            });
          } catch (fallbackError) {
            console.warn(`Fallback strategy failed for ${stage.name}:`, fallbackError);
            // Continue with original result
          }
        }
      }
    }

    return {
      result,
      log: processingLog,
      degraded: processingLog.some(entry => entry.status !== 'success')
    };
  }

  async executeWithTimeout(processor, data, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Stage timeout after ${timeout}ms`));
      }, timeout);

      processor(data)
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
}

// Usage
const pipeline = new DataProcessingPipeline();

// Add processing stages
pipeline.addStage('validation', (data) => validateData(data), { required: true });
pipeline.addStage('transformation', (data) => transformData(data), { required: true });
pipeline.addStage('enrichment', (data) => enrichData(data), { required: false });
pipeline.addStage('formatting', (data) => formatData(data), { required: true });

// Set fallback strategies
pipeline.setFallbackStrategy('enrichment', {
  name: 'static-enrichment',
  async execute(data, error) {
    console.warn('Enrichment failed, using static data:', error);
    return {
      ...data,
      enrichment: {
        source: 'static',
        data: getStaticEnrichmentData()
      }
    };
  }
});

// Process data with graceful degradation
async function processData(inputData) {
  try {
    const result = await pipeline.process(inputData);
    
    if (result.degraded) {
      console.warn('Pipeline completed with degradation:', result.log);
      showDegradationWarning(result.log);
    }
    
    return result.result;
  } catch (error) {
    console.error('Pipeline failed completely:', error);
    return getFallbackResult(inputData);
  }
}
```

Remember: Graceful degradation is about maintaining user experience even when things go wrong. Design your applications to fail safely and provide meaningful functionality even in degraded states.