# Error Recovery Strategies

## Overview

Error recovery strategies focus on how applications can automatically recover from errors and restore normal operation. This document covers techniques for implementing robust error recovery mechanisms in JavaScript and TypeScript applications.

## Core Principles

### 1. Automatic Retry with Exponential Backoff

Implement intelligent retry mechanisms that don't overwhelm failing services.

**✅ Good Retry Strategy:**
```javascript
class RetryManager {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 10000;
    this.jitter = options.jitter || true;
    this.retryableErrors = options.retryableErrors || [
      'NETWORK_ERROR',
      'TIMEOUT',
      'SERVICE_UNAVAILABLE',
      'TOO_MANY_REQUESTS'
    ];
  }

  async executeWithRetry(operation, context = {}) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === this.maxRetries) {
          throw error;
        }
        
        const delay = this.calculateDelay(attempt);
        const delayWithJitter = this.addJitter(delay);
        
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delayWithJitter}ms...`, {
          error: error.message,
          context
        });
        
        await this.sleep(delayWithJitter);
      }
    }
    
    throw lastError;
  }

  isRetryableError(error) {
    const errorType = this.getErrorType(error);
    return this.retryableErrors.includes(errorType);
  }

  getErrorType(error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    
    if (error.message.includes('timeout')) {
      return 'TIMEOUT';
    }
    
    if (error.message.includes('HTTP 5')) {
      return 'SERVICE_UNAVAILABLE';
    }
    
    if (error.message.includes('HTTP 429')) {
      return 'TOO_MANY_REQUESTS';
    }
    
    return 'UNKNOWN';
  }

  calculateDelay(attempt) {
    // Exponential backoff: baseDelay * 2^attempt
    let delay = this.baseDelay * Math.pow(2, attempt);
    
    // Cap the delay
    return Math.min(delay, this.maxDelay);
  }

  addJitter(delay) {
    if (!this.jitter) return delay;
    
    // Add random jitter (±25% of delay)
    const jitterRange = delay * 0.25;
    const jitter = Math.random() * jitterRange * 2 - jitterRange;
    
    return Math.max(0, delay + jitter);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const retryManager = new RetryManager({
  maxRetries: 5,
  baseDelay: 1000,
  maxDelay: 30000
});

async function fetchUserData(userId) {
  return await retryManager.executeWithRetry(
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    { userId, operation: 'fetchUserData' }
  );
}
```

**❌ Bad Retry Strategy:**
```javascript
// Simple retry without backoff - can cause thundering herd
async function badRetry(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 100)); // Fixed delay
    }
  }
}

// No error type checking - retries everything
async function retryEverything(operation) {
  let attempts = 0;
  while (attempts < 5) {
    try {
      return await operation();
    } catch (error) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 2. State Recovery and Rollback

Implement mechanisms to recover application state and rollback changes when errors occur.

**✅ State Recovery:**
```javascript
class StateRecoveryManager {
  constructor() {
    this.stateHistory = new Map();
    this.activeTransactions = new Map();
  }

  async executeWithRecovery(operation, rollbackOperation, context = {}) {
    const transactionId = this.generateTransactionId();
    
    try {
      // Save current state before operation
      const currentState = this.captureState(context);
      this.stateHistory.set(transactionId, currentState);
      
      // Execute operation
      const result = await operation();
      
      // Operation successful, clean up state history
      this.stateHistory.delete(transactionId);
      
      return result;
    } catch (error) {
      console.error('Operation failed, attempting rollback:', error);
      
      // Attempt rollback
      try {
        await this.executeRollback(rollbackOperation, transactionId, context);
        console.log('Rollback successful');
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
        // Try to restore from saved state
        await this.restoreFromState(transactionId, context);
      }
      
      throw error;
    }
  }

  captureState(context) {
    // Capture relevant application state
    return {
      timestamp: Date.now(),
      context,
      state: {
        // Application-specific state capture
        userSession: this.captureUserSession(),
        cacheState: this.captureCacheState(),
        pendingOperations: this.capturePendingOperations()
      }
    };
  }

  async executeRollback(rollbackOperation, transactionId, context) {
    if (typeof rollbackOperation === 'function') {
      await rollbackOperation();
    } else {
      // Default rollback behavior
      await this.restoreFromState(transactionId, context);
    }
  }

  async restoreFromState(transactionId, context) {
    const savedState = this.stateHistory.get(transactionId);
    if (!savedState) {
      throw new Error('No saved state found for rollback');
    }

    try {
      // Restore user session
      if (savedState.state.userSession) {
        await this.restoreUserSession(savedState.state.userSession);
      }

      // Restore cache state
      if (savedState.state.cacheState) {
        await this.restoreCacheState(savedState.state.cacheState);
      }

      // Restore pending operations
      if (savedState.state.pendingOperations) {
        await this.restorePendingOperations(savedState.state.pendingOperations);
      }

      console.log('State restoration completed');
    } catch (restoreError) {
      console.error('State restoration failed:', restoreError);
      throw restoreError;
    }
  }

  captureUserSession() {
    // Implementation depends on your session management
    return {
      userId: getCurrentUserId(),
      permissions: getCurrentUserPermissions(),
      lastActivity: getLastActivityTime()
    };
  }

  captureCacheState() {
    // Capture cache state
    return {
      userCache: getUserCacheSnapshot(),
      dataCache: getDataCacheSnapshot()
    };
  }

  capturePendingOperations() {
    // Capture pending operations
    return getPendingOperations();
  }

  async restoreUserSession(sessionData) {
    // Restore user session
    await restoreSession(sessionData);
  }

  async restoreCacheState(cacheData) {
    // Restore cache state
    setUserCache(cacheData.userCache);
    setDataCache(cacheData.dataCache);
  }

  async restorePendingOperations(operations) {
    // Restore pending operations
    restoreOperations(operations);
  }

  generateTransactionId() {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Usage
const recoveryManager = new StateRecoveryManager();

async function updateUserProfile(userId, updates) {
  return await recoveryManager.executeWithRecovery(
    async () => {
      // Primary operation
      const result = await userService.updateUser(userId, updates);
      
      // Update cache
      cacheService.updateUserCache(userId, updates);
      
      // Update session
      sessionService.updateUserSession(userId, updates);
      
      return result;
    },
    async () => {
      // Rollback operation
      await userService.rollbackUserUpdate(userId);
      cacheService.rollbackUserCache(userId);
      sessionService.rollbackUserSession(userId);
    },
    { userId, updates }
  );
}
```

**❌ Poor State Recovery:**
```javascript
// No state recovery - data corruption possible
async function updateUserProfile(userId, updates) {
  // Update database
  await userService.updateUser(userId, updates);
  
  // Update cache (can fail)
  cacheService.updateUserCache(userId, updates); // No rollback if this fails
  
  // Update session (can fail)
  sessionService.updateUserSession(userId, updates); // No rollback if this fails
  
  return { success: true };
}

// Simple rollback without state management
class PoorRecoveryManager {
  async executeWithRecovery(operation, rollbackOperation) {
    try {
      return await operation();
    } catch (error) {
      await rollbackOperation(); // No error handling for rollback
      throw error;
    }
  }
}
```

### 3. Circuit Breaker Recovery

Implement intelligent circuit breaker recovery mechanisms.

**✅ Circuit Breaker Recovery:**
```javascript
class AdvancedCircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000;
    this.halfOpenMaxCalls = options.halfOpenMaxCalls || 3;
    this.monitoringPeriod = options.monitoringPeriod || 10000;
    
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    this.halfOpenCallCount = 0;
    this.monitoringStartTime = Date.now();
    this.monitoringFailures = 0;
  }

  async execute(operation) {
    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        console.log('Circuit breaker: transitioning to HALF_OPEN');
        this.state = 'HALF_OPEN';
        this.successCount = 0;
        this.halfOpenCallCount = 0;
        this.monitoringFailures = 0;
        this.monitoringStartTime = Date.now();
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
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      this.halfOpenCallCount++;
      
      // If we've had enough successful calls in HALF_OPEN, go back to CLOSED
      if (this.successCount >= this.halfOpenMaxCalls) {
        console.log('Circuit breaker: transitioning to CLOSED');
        this.state = 'CLOSED';
      }
    } else {
      this.state = 'CLOSED';
    }
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.state === 'HALF_OPEN') {
      this.halfOpenCallCount++;
      this.monitoringFailures++;
      
      // If we exceed failures in HALF_OPEN, go back to OPEN
      if (this.monitoringFailures >= 2) {
        console.log('Circuit breaker: transitioning to OPEN (half-open failed)');
        this.state = 'OPEN';
      }
      
      // If we've made too many calls in HALF_OPEN without enough successes, go back to OPEN
      if (this.halfOpenCallCount >= this.halfOpenMaxCalls * 2 && this.successCount < this.halfOpenMaxCalls) {
        console.log('Circuit breaker: transitioning to OPEN (half-open timeout)');
        this.state = 'OPEN';
      }
    } else if (this.failureCount >= this.failureThreshold) {
      console.log('Circuit breaker: transitioning to OPEN');
      this.state = 'OPEN';
    }
  }

  // Advanced recovery with monitoring
  async executeWithMonitoring(operation) {
    // Additional monitoring logic
    const startTime = Date.now();
    
    try {
      const result = await this.execute(operation);
      const duration = Date.now() - startTime;
      
      // Monitor response time
      if (duration > 5000) { // 5 seconds
        console.warn('Slow response detected:', duration);
      }
      
      return result;
    } catch (error) {
      // Enhanced error monitoring
      this.monitorError(error);
      throw error;
    }
  }

  monitorError(error) {
    // Track error patterns
    const errorPattern = {
      type: error.constructor.name,
      message: error.message,
      timestamp: Date.now(),
      state: this.state
    };
    
    // Could send to monitoring system
    console.log('Error pattern:', errorPattern);
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      halfOpenCallCount: this.halfOpenCallCount,
      monitoringFailures: this.monitoringFailures
    };
  }

  // Adaptive recovery - adjust thresholds based on service behavior
  adaptRecovery() {
    const state = this.getState();
    const timeInCurrentState = Date.now() - this.lastFailureTime;
    
    // If we're frequently opening/closing, adjust thresholds
    if (timeInCurrentState < 30000) { // Less than 30 seconds
      if (this.failureThreshold < 10) {
        this.failureThreshold++;
        console.log('Adaptive: Increased failure threshold to', this.failureThreshold);
      }
    } else {
      // Reset to normal thresholds
      this.failureThreshold = 5;
    }
  }
}

// Usage
const advancedCircuitBreaker = new AdvancedCircuitBreaker({
  failureThreshold: 3,
  recoveryTimeout: 30000,
  halfOpenMaxCalls: 2
});

async function resilientApiCall() {
  return await advancedCircuitBreaker.executeWithMonitoring(async () => {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  });
}
```

**❌ Basic Circuit Breaker:**
```javascript
// Simple circuit breaker without advanced recovery
class BasicCircuitBreaker {
  constructor() {
    this.state = 'CLOSED';
    this.failureCount = 0;
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN');
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
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= 3) {
      this.state = 'OPEN';
    }
  }
}
```

## TypeScript-Specific Considerations

### 1. Type-Safe Recovery Operations

Use TypeScript to ensure recovery operations maintain type safety.

**✅ Type-Safe Recovery:**
```typescript
interface RecoveryOperation<T> {
  name: string;
  canRecover: (error: Error) => boolean;
  recover: (error: Error, context: RecoveryContext) => Promise<T>;
}

interface RecoveryContext {
  operation: string;
  timestamp: Date;
  attempt: number;
  originalError: Error;
}

interface RecoveryResult<T> {
  success: true;
  data: T;
  recoveryStrategy: string;
  attempts: number;
} | {
  success: false;
  error: Error;
  attempts: number;
}

class TypeSafeRecoveryManager<T> {
  private strategies: RecoveryOperation<T>[] = [];

  addStrategy(strategy: RecoveryOperation<T>): void {
    this.strategies.push(strategy);
  }

  async executeWithRecovery(
    operation: () => Promise<T>,
    maxAttempts: number = 3
  ): Promise<RecoveryResult<T>> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const data = await operation();
        return {
          success: true,
          data,
          recoveryStrategy: 'primary',
          attempts: attempt
        };
      } catch (error) {
        lastError = error as Error;
        
        // Try recovery strategies
        for (const strategy of this.strategies) {
          if (strategy.canRecover(error)) {
            try {
              const context: RecoveryContext = {
                operation: operation.name || 'unknown',
                timestamp: new Date(),
                attempt,
                originalError: error as Error
              };

              const data = await strategy.recover(error as Error, context);
              return {
                success: true,
                data,
                recoveryStrategy: strategy.name,
                attempts: attempt
              };
            } catch (recoveryError) {
              console.warn(`Recovery strategy ${strategy.name} failed:`, recoveryError);
              continue;
            }
          }
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxAttempts) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    return {
      success: false,
      error: lastError!,
      attempts: maxAttempts
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Specific recovery strategies with type safety
class CacheRecoveryStrategy<T> implements RecoveryOperation<T> {
  name = 'Cache Recovery';

  constructor(private cacheService: CacheService) {}

  canRecover(error: Error): boolean {
    return error.message.includes('Network') || 
           error.message.includes('Timeout') ||
           error.message.includes('Service Unavailable');
  }

  async recover(error: Error, context: RecoveryContext): Promise<T> {
    console.log(`Attempting cache recovery for ${context.operation}`);
    
    // Type-safe cache retrieval
    const cachedData = await this.cacheService.get<T>(context.operation);
    if (cachedData) {
      console.log('Cache recovery successful');
      return cachedData;
    }

    throw new Error('No cached data available');
  }
}

class DefaultDataRecoveryStrategy<T> implements RecoveryOperation<T> {
  name = 'Default Data Recovery';

  constructor(private defaultData: T) {}

  canRecover(error: Error): boolean {
    return true; // Can always provide default data
  }

  async recover(error: Error, context: RecoveryContext): Promise<T> {
    console.log(`Providing default data for ${context.operation}`);
    return this.defaultData;
  }
}

// Usage with type safety
interface UserData {
  id: string;
  name: string;
  email: string;
}

const recoveryManager = new TypeSafeRecoveryManager<UserData>();

recoveryManager.addStrategy(
  new CacheRecoveryStrategy<UserData>(cacheService)
);

recoveryManager.addStrategy(
  new DefaultDataRecoveryStrategy<UserData>({
    id: 'default',
    name: 'Default User',
    email: 'user@example.com'
  })
);

async function loadUserData(userId: string): Promise<UserData> {
  const result = await recoveryManager.executeWithRecovery(
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<UserData>;
    },
    3
  );

  if (result.success) {
    console.log(`Loaded user data using ${result.recoveryStrategy} strategy`);
    return result.data;
  } else {
    console.error('Failed to load user data after all recovery attempts');
    throw result.error;
  }
}
```

**❌ Non-Type-Safe Recovery:**
```typescript
// Generic recovery without type safety
class GenericRecoveryManager {
  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    fallback: T
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.warn('Operation failed, using fallback:', error);
      return fallback; // No type checking for fallback
    }
  }
}

// Usage - can break type safety
const manager = new GenericRecoveryManager();

async function loadUserData(userId: string): Promise<UserData> {
  return await manager.executeWithRecovery(
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    },
    { id: 'fallback', name: 'Fallback User' } // Missing email field - breaks UserData interface
  );
}
```

### 2. State Recovery with TypeScript

Implement type-safe state recovery mechanisms.

**✅ Type-Safe State Recovery:**
```typescript
interface ApplicationState {
  user: UserState;
  cache: CacheState;
  session: SessionState;
  pendingOperations: OperationState[];
}

interface UserState {
  id: string;
  name: string;
  permissions: string[];
  lastActivity: Date;
}

interface CacheState {
  users: Map<string, UserData>;
  data: Map<string, any>;
  timestamp: Date;
}

interface SessionState {
  sessionId: string;
  expiresAt: Date;
  data: Record<string, any>;
}

interface OperationState {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

class TypeSafeStateRecoveryManager {
  private stateHistory = new Map<string, ApplicationState>();
  private activeTransactions = new Map<string, TransactionState>();

  async executeWithStateRecovery<T>(
    operation: () => Promise<T>,
    rollbackOperation?: (state: ApplicationState) => Promise<void>
  ): Promise<T> {
    const transactionId = this.generateTransactionId();
    const currentState = this.captureCurrentState();

    try {
      // Save state before operation
      this.stateHistory.set(transactionId, currentState);

      // Execute operation
      const result = await operation();

      // Operation successful, clean up
      this.stateHistory.delete(transactionId);

      return result;
    } catch (error) {
      console.error('Operation failed, attempting state recovery:', error);

      try {
        // Try custom rollback first
        if (rollbackOperation) {
          await rollbackOperation(currentState);
        } else {
          // Default state recovery
          await this.restoreState(transactionId);
        }

        console.log('State recovery successful');
      } catch (recoveryError) {
        console.error('State recovery failed:', recoveryError);
        // Could trigger alert or emergency procedures
      }

      throw error;
    }
  }

  private captureCurrentState(): ApplicationState {
    return {
      user: this.captureUserState(),
      cache: this.captureCacheState(),
      session: this.captureSessionState(),
      pendingOperations: this.captureOperationState()
    };
  }

  private captureUserState(): UserState {
    return {
      id: getCurrentUserId(),
      name: getCurrentUserName(),
      permissions: getCurrentUserPermissions(),
      lastActivity: getLastActivityTime()
    };
  }

  private captureCacheState(): CacheState {
    return {
      users: new Map(getUserCache()),
      data: new Map(getDataCache()),
      timestamp: new Date()
    };
  }

  private captureSessionState(): SessionState {
    return {
      sessionId: getSessionId(),
      expiresAt: getSessionExpiry(),
      data: getSessionData()
    };
  }

  private captureOperationState(): OperationState[] {
    return getPendingOperations().map(op => ({
      id: op.id,
      type: op.type,
      data: op.data,
      timestamp: op.timestamp,
      status: op.status
    }));
  }

  private async restoreState(transactionId: string): Promise<void> {
    const savedState = this.stateHistory.get(transactionId);
    if (!savedState) {
      throw new Error('No saved state found for recovery');
    }

    try {
      // Restore user state
      await this.restoreUserState(savedState.user);

      // Restore cache state
      await this.restoreCacheState(savedState.cache);

      // Restore session state
      await this.restoreSessionState(savedState.session);

      // Restore operation state
      await this.restoreOperationState(savedState.pendingOperations);

      console.log('State restoration completed successfully');
    } catch (restoreError) {
      console.error('State restoration failed:', restoreError);
      throw restoreError;
    }
  }

  private async restoreUserState(userState: UserState): Promise<void> {
    await restoreUserSession(userState.id, {
      name: userState.name,
      permissions: userState.permissions
    });
  }

  private async restoreCacheState(cacheState: CacheState): Promise<void> {
    // Type-safe cache restoration
    for (const [key, value] of cacheState.users) {
      setUserCache(key, value);
    }

    for (const [key, value] of cacheState.data) {
      setDataCache(key, value);
    }
  }

  private async restoreSessionState(sessionState: SessionState): Promise<void> {
    await restoreSession(sessionState.sessionId, sessionState.data, sessionState.expiresAt);
  }

  private async restoreOperationState(operations: OperationState[]): Promise<void> {
    // Restore pending operations
    for (const operation of operations) {
      if (operation.status === 'IN_PROGRESS' || operation.status === 'PENDING') {
        await restoreOperation(operation);
      }
    }
  }

  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Usage
const stateRecoveryManager = new TypeSafeStateRecoveryManager();

async function updateUserWithRecovery(userId: string, updates: Partial<UserData>): Promise<UserData> {
  return await stateRecoveryManager.executeWithStateRecovery(
    async () => {
      // Primary operation
      const result = await userService.updateUser(userId, updates);
      
      // Update cache
      cacheService.updateUserCache(userId, updates);
      
      // Update session
      sessionService.updateUserSession(userId, updates);
      
      return result;
    },
    async (savedState) => {
      // Custom rollback operation
      await userService.rollbackUserUpdate(userId);
      await stateRecoveryManager.restoreStateFromObject(savedState);
    }
  );
}
```

**❌ Poor State Recovery:**
```typescript
// Generic state recovery without type safety
class PoorStateRecoveryManager {
  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    rollback: () => Promise<void>
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      await rollback(); // No error handling for rollback
      throw error;
    }
  }
}

// Usage - no type safety for state
const manager = new PoorStateRecoveryManager();

async function updateUser(userId: string, updates: any) {
  return await manager.executeWithRecovery(
    async () => {
      const result = await userService.updateUser(userId, updates);
      cacheService.updateCache(updates); // Can fail
      return result;
    },
    async () => {
      await userService.rollbackUpdate(userId); // Rollback might not handle all cases
    }
  );
}
```

### 3. Error Recovery with Union Types

Use TypeScript union types to represent different recovery states.

**✅ Union Types for Recovery States:**
```typescript
type RecoveryState<T> = 
  | { status: 'success'; data: T; strategy: string }
  | { status: 'retrying'; attempt: number; maxAttempts: number; error: Error }
  | { status: 'failed'; error: Error; attempts: number }
  | { status: 'fallback'; data: T; reason: string };

class UnionTypeRecoveryManager<T> {
  async executeWithUnionRecovery(
    operation: () => Promise<T>,
    fallbackData: T,
    maxAttempts: number = 3
  ): Promise<RecoveryState<T>> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const data = await operation();
        return {
          status: 'success' as const,
          data,
          strategy: 'primary'
        };
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxAttempts) {
          // Retry with exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await this.delay(delay);

          return {
            status: 'retrying' as const,
            attempt,
            maxAttempts,
            error: lastError
          };
        }
      }
    }

    // All retries failed, use fallback
    return {
      status: 'fallback' as const,
      data: fallbackData,
      reason: lastError?.message || 'Operation failed after maximum retries'
    };
  }

  async executeWithDetailedRecovery(
    operation: () => Promise<T>,
    recoveryStrategies: RecoveryStrategy<T>[],
    fallbackData: T
  ): Promise<RecoveryState<T>> {
    // Try primary operation
    try {
      const data = await operation();
      return {
        status: 'success' as const,
        data,
        strategy: 'primary'
      };
    } catch (primaryError) {
      // Try recovery strategies
      for (const strategy of recoveryStrategies) {
        try {
          const data = await strategy.recover(primaryError as Error);
          return {
            status: 'success' as const,
            data,
            strategy: strategy.name
          };
        } catch (recoveryError) {
          console.warn(`Recovery strategy ${strategy.name} failed:`, recoveryError);
          continue;
        }
      }

      // All recovery strategies failed
      return {
        status: 'failed' as const,
        error: primaryError as Error,
        attempts: recoveryStrategies.length + 1
      };
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Recovery strategy interface
interface RecoveryStrategy<T> {
  name: string;
  recover: (error: Error) => Promise<T>;
}

// Specific recovery strategies
class CacheRecoveryStrategy<T> implements RecoveryStrategy<T> {
  name = 'Cache Recovery';

  constructor(private cacheKey: string) {}

  async recover(error: Error): Promise<T> {
    const cachedData = await cacheService.get<T>(this.cacheKey);
    if (!cachedData) {
      throw new Error('No cached data available');
    }
    return cachedData;
  }
}

class DatabaseRecoveryStrategy<T> implements RecoveryStrategy<T> {
  name = 'Database Recovery';

  constructor(private fallbackQuery: string) {}

  async recover(error: Error): Promise<T> {
    const result = await databaseService.query<T>(this.fallbackQuery);
    if (!result) {
      throw new Error('Database fallback query failed');
    }
    return result;
  }
}

// Usage with union types
const recoveryManager = new UnionTypeRecoveryManager<UserData>();

async function loadUserDataWithUnionRecovery(userId: string): Promise<void> {
  const result = await recoveryManager.executeWithDetailedRecovery(
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<UserData>;
    },
    [
      new CacheRecoveryStrategy<UserData>(`user:${userId}`),
      new DatabaseRecoveryStrategy<UserData>(`SELECT * FROM users WHERE id = '${userId}'`)
    ],
    {
      id: 'fallback',
      name: 'Fallback User',
      email: 'fallback@example.com'
    }
  );

  // Handle different recovery states
  switch (result.status) {
    case 'success':
      console.log(`User loaded successfully using ${result.strategy} strategy`);
      displayUserData(result.data);
      break;

    case 'retrying':
      console.log(`Retrying operation, attempt ${result.attempt}/${result.maxAttempts}`);
      showRetryIndicator(result.attempt, result.maxAttempts);
      break;

    case 'failed':
      console.error('Operation failed after all recovery attempts:', result.error);
      showErrorMessage('Unable to load user data');
      break;

    case 'fallback':
      console.warn('Using fallback data:', result.reason);
      displayUserData(result.data);
      showFallbackNotice(result.reason);
      break;
  }
}
```

**❌ No Union Types:**
```typescript
// Generic recovery without union types
class GenericRecoveryManager {
  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    fallback: T
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.warn('Operation failed, using fallback:', error);
      return fallback;
    }
  }
}

// Usage - no way to distinguish between success and fallback
const manager = new GenericRecoveryManager();

async function loadUserData(userId: string): Promise<UserData> {
  const result = await manager.executeWithRecovery(
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    },
    { id: 'fallback', name: 'Fallback User', email: 'fallback@example.com' }
  );

  // Can't tell if this is real data or fallback data
  return result;
}
```

## Common Patterns

### 1. Transaction Recovery

Implement recovery mechanisms for database transactions and complex operations.

**✅ Transaction Recovery:**
```javascript
class TransactionRecoveryManager {
  constructor() {
    this.activeTransactions = new Map();
    this.transactionLog = [];
  }

  async executeTransaction(operations, options = {}) {
    const transactionId = this.generateTransactionId();
    const transaction = {
      id: transactionId,
      operations: operations.map(op => ({ ...op, status: 'pending' })),
      status: 'active',
      startTime: Date.now(),
      rollbackPoints: []
    };

    this.activeTransactions.set(transactionId, transaction);
    this.transactionLog.push({
      transactionId,
      type: 'start',
      timestamp: Date.now()
    });

    try {
      // Execute operations with rollback points
      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        
        // Create rollback point before each operation
        const rollbackPoint = await this.createRollbackPoint(transactionId, i);
        transaction.rollbackPoints.push(rollbackPoint);

        try {
          const result = await operation.execute();
          operation.status = 'completed';
          operation.result = result;
        } catch (error) {
          console.error(`Operation ${i} failed, rolling back...`);
          
          // Rollback all completed operations
          await this.rollbackTransaction(transaction, i);
          
          // Mark transaction as failed
          transaction.status = 'failed';
          transaction.error = error;
          
          this.transactionLog.push({
            transactionId,
            type: 'failed',
            error: error.message,
            timestamp: Date.now()
          });

          throw error;
        }
      }

      // All operations completed successfully
      transaction.status = 'completed';
      
      this.transactionLog.push({
        transactionId,
        type: 'completed',
        timestamp: Date.now()
      });

      return {
        transactionId,
        status: 'completed',
        results: operations.map(op => op.result)
      };

    } catch (error) {
      this.activeTransactions.delete(transactionId);
      throw error;
    }
  }

  async createRollbackPoint(transactionId, operationIndex) {
    // Create a snapshot of the current state
    return {
      transactionId,
      operationIndex,
      timestamp: Date.now(),
      stateSnapshot: await this.captureStateSnapshot()
    };
  }

  async captureStateSnapshot() {
    return {
      databaseState: await this.captureDatabaseState(),
      cacheState: await this.captureCacheState(),
      fileState: await this.captureFileState()
    };
  }

  async rollbackTransaction(transaction, failedOperationIndex) {
    // Rollback in reverse order
    for (let i = failedOperationIndex - 1; i >= 0; i--) {
      const operation = transaction.operations[i];
      if (operation.status === 'completed') {
        try {
          await this.rollbackOperation(operation);
          console.log(`Rolled back operation ${i}`);
        } catch (rollbackError) {
          console.error(`Failed to rollback operation ${i}:`, rollbackError);
          // Could trigger manual intervention
        }
      }
    }
  }

  async rollbackOperation(operation) {
    if (operation.rollback) {
      await operation.rollback();
    } else {
      // Default rollback behavior
      await this.restoreFromSnapshot(operation.rollbackPoint);
    }
  }

  async restoreFromSnapshot(snapshot) {
    // Restore database state
    if (snapshot.databaseState) {
      await this.restoreDatabaseState(snapshot.databaseState);
    }

    // Restore cache state
    if (snapshot.cacheState) {
      await this.restoreCacheState(snapshot.cacheState);
    }

    // Restore file state
    if (snapshot.fileState) {
      await this.restoreFileState(snapshot.fileState);
    }
  }

  getTransactionStatus(transactionId) {
    const transaction = this.activeTransactions.get(transactionId);
    if (!transaction) {
      return null;
    }

    return {
      id: transaction.id,
      status: transaction.status,
      operations: transaction.operations.map(op => ({
        index: op.index,
        status: op.status,
        type: op.type
      })),
      startTime: transaction.startTime,
      duration: Date.now() - transaction.startTime
    };
  }

  generateTransactionId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Usage
const transactionManager = new TransactionRecoveryManager();

async function processOrderWithRecovery(orderData) {
  const operations = [
    {
      type: 'validate',
      execute: () => validateOrder(orderData),
      rollback: () => rollbackValidation(orderData)
    },
    {
      type: 'reserve_inventory',
      execute: () => reserveInventory(orderData.items),
      rollback: () => releaseInventory(orderData.items)
    },
    {
      type: 'process_payment',
      execute: () => processPayment(orderData.payment),
      rollback: () => refundPayment(orderData.payment)
    },
    {
      type: 'create_order',
      execute: () => createOrder(orderData),
      rollback: () => cancelOrder(orderData.id)
    }
  ];

  return await transactionManager.executeTransaction(operations);
}
```

### 2. Service Recovery

Implement recovery mechanisms for external service failures.

**✅ Service Recovery:**
```javascript
class ServiceRecoveryManager {
  constructor() {
    this.serviceHealth = new Map();
    this.recoveryStrategies = new Map();
    this.circuitBreakers = new Map();
  }

  registerService(serviceName, config) {
    this.serviceHealth.set(serviceName, {
      status: 'healthy',
      lastCheck: Date.now(),
      failureCount: 0,
      recoveryCount: 0
    });

    this.circuitBreakers.set(serviceName, new CircuitBreaker(config.circuitBreaker));
  }

  registerRecoveryStrategy(serviceName, strategy) {
    if (!this.recoveryStrategies.has(serviceName)) {
      this.recoveryStrategies.set(serviceName, []);
    }
    this.recoveryStrategies.get(serviceName).push(strategy);
  }

  async callService(serviceName, operation) {
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    if (!circuitBreaker) {
      throw new Error(`Service ${serviceName} not registered`);
    }

    try {
      return await circuitBreaker.execute(operation);
    } catch (error) {
      // Service failed, try recovery strategies
      const recoveryStrategies = this.recoveryStrategies.get(serviceName) || [];
      
      for (const strategy of recoveryStrategies) {
        try {
          console.log(`Attempting recovery strategy: ${strategy.name}`);
          const result = await strategy.recover(error);
          
          // Recovery successful
          this.recordRecovery(serviceName);
          return result;
        } catch (recoveryError) {
          console.warn(`Recovery strategy ${strategy.name} failed:`, recoveryError);
          continue;
        }
      }

      // All recovery strategies failed
      this.recordServiceFailure(serviceName);
      throw error;
    }
  }

  async warmupService(serviceName) {
    const strategies = this.recoveryStrategies.get(serviceName) || [];
    
    for (const strategy of strategies) {
      try {
        await strategy.warmup();
        console.log(`Warmup successful for ${strategy.name}`);
      } catch (error) {
        console.warn(`Warmup failed for ${strategy.name}:`, error);
      }
    }
  }

  recordServiceFailure(serviceName) {
    const health = this.serviceHealth.get(serviceName);
    if (health) {
      health.status = 'unhealthy';
      health.failureCount++;
      health.lastCheck = Date.now();
    }
  }

  recordRecovery(serviceName) {
    const health = this.serviceHealth.get(serviceName);
    if (health) {
      health.status = 'healthy';
      health.recoveryCount++;
      health.lastCheck = Date.now();
      health.failureCount = 0; // Reset failure count on successful recovery
    }
  }

  getServiceHealth(serviceName) {
    return this.serviceHealth.get(serviceName);
  }

  async getRecoveryReport() {
    const report = {};
    
    for (const [serviceName, health] of this.serviceHealth) {
      report[serviceName] = {
        status: health.status,
        failureCount: health.failureCount,
        recoveryCount: health.recoveryCount,
        lastCheck: health.lastCheck,
        uptime: this.calculateUptime(serviceName)
      };
    }

    return report;
  }

  calculateUptime(serviceName) {
    // Calculate uptime based on failure/recovery patterns
    const health = this.serviceHealth.get(serviceName);
    if (!health) return 0;

    // Simple uptime calculation
    const totalChecks = health.failureCount + health.recoveryCount;
    if (totalChecks === 0) return 100;

    return Math.round((health.recoveryCount / totalChecks) * 100);
  }
}

// Recovery strategy implementations
class CacheRecoveryStrategy {
  constructor(serviceName, cacheService) {
    this.name = `${serviceName}-cache-recovery`;
    this.cacheService = cacheService;
    this.serviceName = serviceName;
  }

  async recover(error) {
    console.log(`Attempting cache recovery for ${this.serviceName}`);
    
    const cachedData = await this.cacheService.get(`recovery:${this.serviceName}`);
    if (cachedData) {
      console.log(`Cache recovery successful for ${this.serviceName}`);
      return cachedData;
    }

    throw new Error('No cached data available for recovery');
  }

  async warmup() {
    // Pre-populate cache with recovery data
    const recoveryData = await this.fetchRecoveryData();
    await this.cacheService.set(`recovery:${this.serviceName}`, recoveryData, 3600000); // 1 hour TTL
  }

  async fetchRecoveryData() {
    // Fetch data that can be used for recovery
    return {
      timestamp: Date.now(),
      data: 'recovery-data'
    };
  }
}

class FallbackServiceRecoveryStrategy {
  constructor(serviceName, fallbackService) {
    this.name = `${serviceName}-fallback-recovery`;
    this.fallbackService = fallbackService;
    this.serviceName = serviceName;
  }

  async recover(error) {
    console.log(`Attempting fallback service recovery for ${this.serviceName}`);
    
    try {
      const result = await this.fallbackService.call();
      console.log(`Fallback service recovery successful for ${this.serviceName}`);
      return result;
    } catch (fallbackError) {
      throw new Error(`Fallback service also failed: ${fallbackError.message}`);
    }
  }

  async warmup() {
    // Test fallback service connectivity
    await this.fallbackService.healthCheck();
  }
}

// Usage
const serviceRecoveryManager = new ServiceRecoveryManager();

// Register services
serviceRecoveryManager.registerService('user-api', {
  circuitBreaker: { failureThreshold: 3, recoveryTimeout: 30000 }
});

serviceRecoveryManager.registerService('payment-api', {
  circuitBreaker: { failureThreshold: 2, recoveryTimeout: 60000 }
});

// Register recovery strategies
serviceRecoveryManager.registerRecoveryStrategy('user-api', 
  new CacheRecoveryStrategy('user-api', cacheService)
);

serviceRecoveryManager.registerRecoveryStrategy('payment-api',
  new FallbackServiceRecoveryStrategy('payment-api', fallbackPaymentService)
);

// Use services with recovery
async function processPayment(amount, userId) {
  return await serviceRecoveryManager.callService('payment-api', async () => {
    const response = await fetch('/api/payment/process', {
      method: 'POST',
      body: JSON.stringify({ amount, userId })
    });
    return response.json();
  });
}
```

### 3. Data Recovery

Implement mechanisms to recover from data corruption or loss.

**✅ Data Recovery:**
```javascript
class DataRecoveryManager {
  constructor() {
    this.backupStrategies = new Map();
    this.recoveryPoints = new Map();
    this.dataIntegrityChecks = new Map();
  }

  registerBackupStrategy(dataType, strategy) {
    this.backupStrategies.set(dataType, strategy);
  }

  registerDataIntegrityCheck(dataType, checkFunction) {
    this.dataIntegrityChecks.set(dataType, checkFunction);
  }

  async saveDataWithRecovery(dataType, data, options = {}) {
    const backupStrategy = this.backupStrategies.get(dataType);
    if (!backupStrategy) {
      throw new Error(`No backup strategy registered for ${dataType}`);
    }

    try {
      // Save primary data
      const primaryResult = await this.savePrimaryData(dataType, data);

      // Create backup
      const backupResult = await backupStrategy.createBackup(data, options);

      // Create recovery point
      const recoveryPoint = {
        id: this.generateRecoveryPointId(),
        dataType,
        primaryLocation: primaryResult.location,
        backupLocation: backupResult.location,
        timestamp: Date.now(),
        checksum: this.calculateChecksum(data)
      };

      this.recoveryPoints.set(recoveryPoint.id, recoveryPoint);

      return {
        success: true,
        recoveryPointId: recoveryPoint.id,
        primaryResult,
        backupResult
      };

    } catch (error) {
      console.error('Data save failed, attempting recovery:', error);
      throw error;
    }
  }

  async loadDataWithRecovery(dataType, recoveryPointId) {
    let primaryData, backupData;

    try {
      // Try to load from primary location
      primaryData = await this.loadFromPrimary(dataType, recoveryPointId);
      
      // Verify data integrity
      if (await this.verifyDataIntegrity(dataType, primaryData)) {
        return primaryData;
      } else {
        console.warn('Primary data integrity check failed, trying backup');
      }
    } catch (primaryError) {
      console.warn('Failed to load from primary location:', primaryError);
    }

    try {
      // Try to load from backup
      backupData = await this.loadFromBackup(dataType, recoveryPointId);
      
      // Verify backup data integrity
      if (await this.verifyDataIntegrity(dataType, backupData)) {
        console.log('Successfully loaded from backup');
        return backupData;
      } else {
        console.error('Backup data integrity check failed');
      }
    } catch (backupError) {
      console.error('Failed to load from backup:', backupError);
    }

    // Try to reconstruct data
    const reconstructedData = await this.reconstructData(dataType, recoveryPointId);
    if (reconstructedData) {
      console.log('Successfully reconstructed data');
      return reconstructedData;
    }

    throw new Error('Unable to recover data from any source');
  }

  async verifyDataIntegrity(dataType, data) {
    const integrityCheck = this.dataIntegrityChecks.get(dataType);
    if (!integrityCheck) {
      return true; // No integrity check registered
    }

    try {
      return await integrityCheck(data);
    } catch (error) {
      console.error('Integrity check failed:', error);
      return false;
    }
  }

  async reconstructData(dataType, recoveryPointId) {
    const recoveryPoint = this.recoveryPoints.get(recoveryPointId);
    if (!recoveryPoint || recoveryPoint.dataType !== dataType) {
      return null;
    }

    // Try to reconstruct from partial data or logs
    try {
      const reconstructionStrategy = this.getReconstructionStrategy(dataType);
      return await reconstructionStrategy.reconstruct(recoveryPoint);
    } catch (error) {
      console.error('Data reconstruction failed:', error);
      return null;
    }
  }

  getReconstructionStrategy(dataType) {
    // Return appropriate reconstruction strategy
    return {
      reconstruct: async (recoveryPoint) => {
        // Implementation depends on data type
        throw new Error('Reconstruction not implemented');
      }
    };
  }

  calculateChecksum(data) {
    // Simple checksum calculation
    const dataString = JSON.stringify(data);
    let checksum = 0;
    for (let i = 0; i < dataString.length; i++) {
      checksum += dataString.charCodeAt(i);
    }
    return checksum.toString(16);
  }

  generateRecoveryPointId() {
    return `rp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async savePrimaryData(dataType, data) {
    // Save to primary storage (database, file system, etc.)
    return {
      location: `primary:${dataType}:${Date.now()}`,
      success: true
    };
  }

  async loadFromPrimary(dataType, recoveryPointId) {
    // Load from primary storage
    throw new Error('Primary data not found');
  }

  async loadFromBackup(dataType, recoveryPointId) {
    // Load from backup storage
    throw new Error('Backup data not found');
  }
}

// Backup strategy implementations
class DatabaseBackupStrategy {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  async createBackup(data, options) {
    const backupId = `backup_${Date.now()}`;
    
    // Create database backup
    await this.databaseService.createBackup(backupId, data);
    
    return {
      location: `database:${backupId}`,
      timestamp: Date.now(),
      size: JSON.stringify(data).length
    };
  }
}

class FileBackupStrategy {
  constructor(fileService) {
    this.fileService = fileService;
  }

  async createBackup(data, options) {
    const backupId = `backup_${Date.now()}`;
    const filename = `${backupId}.json`;
    
    // Save to file system
    await this.fileService.writeFile(filename, JSON.stringify(data));
    
    return {
      location: `file:${filename}`,
      timestamp: Date.now(),
      size: JSON.stringify(data).length
    };
  }
}

// Usage
const dataRecoveryManager = new DataRecoveryManager();

// Register backup strategies
dataRecoveryManager.registerBackupStrategy('user-data', 
  new DatabaseBackupStrategy(databaseService)
);

dataRecoveryManager.registerBackupStrategy('config-data',
  new FileBackupStrategy(fileService)
);

// Register integrity checks
dataRecoveryManager.registerDataIntegrityCheck('user-data', async (data) => {
  return data && data.id && data.email && data.name;
});

dataRecoveryManager.registerDataIntegrityCheck('config-data', async (data) => {
  return data && typeof data === 'object' && Object.keys(data).length > 0;
});

// Save data with recovery
async function saveUserData(userData) {
  return await dataRecoveryManager.saveDataWithRecovery('user-data', userData);
}

// Load data with recovery
async function loadUserData(recoveryPointId) {
  return await dataRecoveryManager.loadDataWithRecovery('user-data', recoveryPointId);
}
```

## Common Pitfalls and Solutions

### 1. Infinite Retry Loops

**❌ Bad:**
```javascript
// Can cause infinite loops
async function infiniteRetry(operation) {
  while (true) {
    try {
      return await operation();
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // No max retries - infinite loop possible
    }
  }
}
```

**✅ Good:**
```javascript
// Limited retries with exponential backoff
async function limitedRetry(operation, maxRetries = 5) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

### 2. State Inconsistency During Recovery

**❌ Bad:**
```javascript
// Can leave system in inconsistent state
async function poorRecovery(operation, rollback) {
  try {
    return await operation();
  } catch (error) {
    await rollback(); // Rollback might fail
    throw error;
  }
}
```

**✅ Good:**
```javascript
// Ensures consistent state during recovery
async function consistentRecovery(operation, rollback) {
  const stateSnapshot = captureState();
  
  try {
    return await operation();
  } catch (error) {
    try {
      await rollback();
    } catch (rollbackError) {
      await restoreFromSnapshot(stateSnapshot);
      throw new Error(`Operation failed and rollback also failed: ${rollbackError.message}`);
    }
    throw error;
  }
}
```

### 3. No Recovery Monitoring

**❌ Bad:**
```javascript
// No monitoring of recovery attempts
async function unmonitoredRecovery(operation) {
  try {
    return await operation();
  } catch (error) {
    // Silent recovery - no monitoring
    return getFallbackData();
  }
}
```

**✅ Good:**
```javascript
// Monitored recovery with metrics
async function monitoredRecovery(operation) {
  const startTime = Date.now();
  let recoveryAttempts = 0;
  
  try {
    return await operation();
  } catch (error) {
    recoveryAttempts++;
    
    // Log recovery attempt
    metrics.increment('recovery.attempt', {
      operation: operation.name,
      error: error.message
    });
    
    const result = getFallbackData();
    
    // Log successful recovery
    metrics.increment('recovery.success', {
      operation: operation.name,
      duration: Date.now() - startTime,
      attempts: recoveryAttempts
    });
    
    return result;
  }
}
```

## Best Practices Summary

1. **Implement exponential backoff**: Prevent overwhelming failing services
2. **Use circuit breakers**: Prevent cascading failures
3. **Capture state before operations**: Enable rollback and recovery
4. **Implement multiple recovery strategies**: Don't rely on single recovery method
5. **Monitor recovery attempts**: Track success/failure rates
6. **Test recovery scenarios**: Ensure recovery mechanisms work
7. **Use type-safe recovery**: Maintain type safety during recovery
8. **Implement transaction recovery**: Handle complex multi-step operations
9. **Create recovery points**: Enable point-in-time recovery
10. **Plan for data corruption**: Implement data integrity checks

## Examples in Context

### E-commerce Application
```javascript
class EcommerceRecoveryManager {
  constructor() {
    this.retryManager = new RetryManager({ maxRetries: 3, baseDelay: 1000 });
    this.circuitBreakers = {
      payment: new CircuitBreaker({ failureThreshold: 3 }),
      inventory: new CircuitBreaker({ failureThreshold: 5 }),
      shipping: new CircuitBreaker({ failureThreshold: 2 })
    };
    this.stateRecovery = new StateRecoveryManager();
  }

  async processOrderWithRecovery(orderData) {
    return await this.stateRecovery.executeWithRecovery(
      async () => {
        // Try primary processing
        const paymentResult = await this.retryManager.executeWithRetry(
          () => this.processPayment(orderData.payment),
          { operation: 'payment' }
        );

        const inventoryResult = await this.circuitBreakers.inventory.execute(
          () => this.reserveInventory(orderData.items)
        );

        const shippingResult = await this.circuitBreakers.shipping.execute(
          () => this.calculateShipping(orderData.address)
        );

        return {
          success: true,
          payment: paymentResult,
          inventory: inventoryResult,
          shipping: shippingResult,
          orderId: generateOrderId()
        };
      },
      async (savedState) => {
        // Rollback all operations
        await this.rollbackPayment(orderData.payment);
        await this.releaseInventory(orderData.items);
        // Shipping doesn't need rollback
      }
    );
  }

  async processPayment(paymentData) {
    const response = await fetch('/api/payment/process', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
    
    if (!response.ok) {
      throw new Error(`Payment failed: HTTP ${response.status}`);
    }
    
    return response.json();
  }

  async reserveInventory(items) {
    const response = await fetch('/api/inventory/reserve', {
      method: 'POST',
      body: JSON.stringify({ items })
    });
    
    if (!response.ok) {
      throw new Error(`Inventory reservation failed: HTTP ${response.status}`);
    }
    
    return response.json();
  }

  async calculateShipping(address) {
    const response = await fetch('/api/shipping/calculate', {
      method: 'POST',
      body: JSON.stringify({ address })
    });
    
    if (!response.ok) {
      throw new Error(`Shipping calculation failed: HTTP ${response.status}`);
    }
    
    return response.json();
  }

  async rollbackPayment(paymentData) {
    await fetch('/api/payment/rollback', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async releaseInventory(items) {
    await fetch('/api/inventory/release', {
      method: 'POST',
      body: JSON.stringify({ items })
    });
  }
}
```

### API Development
```javascript
class ApiRecoveryMiddleware {
  constructor() {
    this.recoveryManager = new RecoveryManager();
    this.metrics = new MetricsCollector();
  }

  recoveryMiddleware() {
    return async (req, res, next) => {
      const startTime = Date.now();
      const operationId = this.generateOperationId();

      try {
        // Execute the request
        await this.executeWithRecovery(req, res, operationId);
      } catch (error) {
        // Recovery failed, return error response
        const duration = Date.now() - startTime;
        
        this.metrics.increment('api.recovery_failed', {
          path: req.path,
          method: req.method,
          error: error.message,
          duration
        });

        res.status(503).json({
          error: 'Service temporarily unavailable',
          message: 'Please try again later',
          operationId,
          duration
        });
      }
    };
  }

  async executeWithRecovery(req, res, operationId) {
    // Try primary service
    try {
      const result = await this.callPrimaryService(req);
      res.json(result);
      
      this.metrics.increment('api.recovery_success', {
        path: req.path,
        method: req.method,
        strategy: 'primary',
        operationId
      });
      
    } catch (primaryError) {
      console.warn('Primary service failed, trying backup:', primaryError);

      // Try backup service
      try {
        const result = await this.callBackupService(req);
        res.json(result);
        
        this.metrics.increment('api.recovery_success', {
          path: req.path,
          method: req.method,
          strategy: 'backup',
          operationId
        });
        
      } catch (backupError) {
        console.error('Backup service also failed:', backupError);
        throw new Error('All services unavailable');
      }
    }
  }

  async callPrimaryService(req) {
    const response = await fetch(`${process.env.PRIMARY_API_URL}${req.path}`, {
      method: req.method,
      headers: req.headers,
      body: req.body
    });

    if (!response.ok) {
      throw new Error(`Primary service error: HTTP ${response.status}`);
    }

    return response.json();
  }

  async callBackupService(req) {
    const response = await fetch(`${process.env.BACKUP_API_URL}${req.path}`, {
      method: req.method,
      headers: req.headers,
      body: req.body
    });

    if (!response.ok) {
      throw new Error(`Backup service error: HTTP ${response.status}`);
    }

    return response.json();
  }

  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Usage in Express app
const app = express();
const recoveryMiddleware = new ApiRecoveryMiddleware();

app.use(recoveryMiddleware.recoveryMiddleware());

app.get('/api/data', async (req, res) => {
  // This route will automatically use recovery mechanisms
  const data = await getDataFromService();
  res.json(data);
});
```

### Data Processing
```javascript
class DataProcessingRecoveryManager {
  constructor() {
    this.checkpointManager = new CheckpointManager();
    this.recoveryStrategies = new Map();
  }

  async processWithRecovery(data, processingPipeline) {
    const pipelineId = this.generatePipelineId();
    let checkpointId = null;

    try {
      // Process data with checkpoints
      let result = data;

      for (let i = 0; i < processingPipeline.length; i++) {
        const stage = processingPipeline[i];

        // Create checkpoint before each stage
        checkpointId = await this.checkpointManager.createCheckpoint({
          pipelineId,
          stageIndex: i,
          inputData: result,
          timestamp: Date.now()
        });

        // Execute processing stage
        result = await stage.process(result);

        // Update checkpoint with result
        await this.checkpointManager.updateCheckpoint(checkpointId, {
          outputData: result,
          status: 'completed'
        });
      }

      // Processing completed successfully
      await this.checkpointManager.markPipelineCompleted(pipelineId);
      return result;

    } catch (error) {
      console.error('Processing failed, attempting recovery:', error);

      if (checkpointId) {
        // Try to recover from last successful checkpoint
        const recoveredResult = await this.recoverFromCheckpoint(checkpointId);
        return recoveredResult;
      } else {
        // No checkpoint available, try fallback processing
        return await this.fallbackProcessing(data, error);
      }
    }
  }

  async recoverFromCheckpoint(checkpointId) {
    const checkpoint = await this.checkpointManager.getCheckpoint(checkpointId);
    if (!checkpoint) {
      throw new Error('Checkpoint not found');
    }

    // Try to continue from checkpoint
    const remainingStages = await this.getRemainingStages(checkpoint.stageIndex);
    
    let result = checkpoint.outputData || checkpoint.inputData;

    for (const stage of remainingStages) {
      try {
        result = await stage.process(result);
      } catch (error) {
        console.error(`Recovery failed at stage ${stage.name}:`, error);
        
        // Try stage-specific recovery
        const recoveryStrategy = this.recoveryStrategies.get(stage.name);
        if (recoveryStrategy) {
          result = await recoveryStrategy.recover(error, result);
        } else {
          throw error;
        }
      }
    }

    return result;
  }

  async fallbackProcessing(data, originalError) {
    console.warn('Using fallback processing due to:', originalError.message);
    
    // Simplified processing that's more resilient
    return {
      data: data,
      processed: true,
      fallback: true,
      error: originalError.message,
      timestamp: Date.now()
    };
  }

  generatePipelineId() {
    return `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Checkpoint manager
class CheckpointManager {
  async createCheckpoint(checkpointData) {
    const checkpointId = `chk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save checkpoint to persistent storage
    await this.saveCheckpoint(checkpointId, checkpointData);
    
    return checkpointId;
  }

  async updateCheckpoint(checkpointId, updates) {
    await this.updateCheckpointData(checkpointId, updates);
  }

  async getCheckpoint(checkpointId) {
    return await this.loadCheckpoint(checkpointId);
  }

  async markPipelineCompleted(pipelineId) {
    // Mark pipeline as completed
    await this.markCompleted(pipelineId);
  }

  async saveCheckpoint(checkpointId, data) {
    // Implementation depends on storage system
  }

  async updateCheckpointData(checkpointId, updates) {
    // Implementation depends on storage system
  }

  async loadCheckpoint(checkpointId) {
    // Implementation depends on storage system
  }

  async markCompleted(pipelineId) {
    // Implementation depends on storage system
  }
}

// Usage
const recoveryManager = new DataProcessingRecoveryManager();

const processingPipeline = [
  { name: 'validation', process: (data) => validateData(data) },
  { name: 'transformation', process: (data) => transformData(data) },
  { name: 'enrichment', process: (data) => enrichData(data) },
  { name: 'formatting', process: (data) => formatData(data) }
];

async function processDataWithRecovery(inputData) {
  return await recoveryManager.processWithRecovery(inputData, processingPipeline);
}
```

Remember: Error recovery is about building resilient systems that can automatically recover from failures. Implement multiple layers of recovery, monitor recovery attempts, and always have fallback mechanisms in place.