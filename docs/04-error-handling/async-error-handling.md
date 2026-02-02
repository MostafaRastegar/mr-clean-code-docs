# Async Error Handling

## Overview

Asynchronous operations are fundamental to JavaScript and TypeScript applications, but they introduce unique challenges for error handling. This document covers best practices for handling errors in async/await, Promises, and other asynchronous patterns.

## Core Principles

### 1. Always Handle Async Errors

Every async operation should have proper error handling, either with try-catch or .catch().

**✅ Good Async Error Handling:**
```javascript
// Using async/await with try-catch
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

// Using Promise with .catch()
function fetchUserDataPromise(userId) {
  return fetch(`/api/users/${userId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('Failed to fetch user data:', error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    });
}

// Multiple async operations
async function processUserWorkflow(userId) {
  try {
    const user = await fetchUserData(userId);
    const permissions = await fetchUserPermissions(userId);
    const settings = await fetchUserSettings(userId);
    
    return {
      user,
      permissions,
      settings
    };
  } catch (error) {
    console.error('User workflow failed:', error);
    throw error;
  }
}
```

**❌ Bad Async Error Handling:**
```javascript
// Missing error handling
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  const userData = await response.json();
  return userData;
}

// Partial error handling
async function processUserWorkflow(userId) {
  const user = await fetchUserData(userId); // No error handling
  const permissions = await fetchUserPermissions(userId).catch(error => {
    console.error('Failed to fetch permissions:', error);
    return null; // Silent failure
  });
  const settings = await fetchUserSettings(userId);
  
  return { user, permissions, settings };
}
```

### 2. Handle Promise Rejection Properly

Always handle Promise rejections, whether using .then()/.catch() or async/await.

**✅ Proper Promise Handling:**
```javascript
// Using .then()/.catch() chain
function processOrder(orderData) {
  return validateOrder(orderData)
    .then(validatedOrder => checkInventory(validatedOrder))
    .then(inventoryResult => processPayment(inventoryResult))
    .then(paymentResult => createOrder(paymentResult))
    .then(order => sendConfirmation(order))
    .catch(error => {
      console.error('Order processing failed:', error);
      return { success: false, error: error.message };
    });
}

// Using Promise.all with error handling
async function fetchMultipleResources(userIds) {
  try {
    const promises = userIds.map(id => fetchUserData(id));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Failed to fetch multiple users:', error);
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

// Using Promise.allSettled for partial failures
async function fetchMultipleResourcesWithPartialFailure(userIds) {
  const promises = userIds.map(id => fetchUserData(id));
  const results = await Promise.allSettled(promises);
  
  const successful = [];
  const failed = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successful.push(result.value);
    } else {
      failed.push({
        userId: userIds[index],
        error: result.reason
      });
    }
  });
  
  return {
    successful,
    failed,
    successRate: successful.length / userIds.length
  };
}
```

**❌ Poor Promise Handling:**
```javascript
// Missing .catch() - unhandled promise rejection
function processOrder(orderData) {
  return validateOrder(orderData)
    .then(validatedOrder => checkInventory(validatedOrder))
    .then(inventoryResult => processPayment(inventoryResult))
    .then(paymentResult => createOrder(paymentResult))
    .then(order => sendConfirmation(order));
    // Missing .catch()
}

// Inconsistent error handling
async function fetchMultipleResources(userIds) {
  const promises = userIds.map(id => fetchUserData(id));
  
  try {
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    // Only handles the first failure
    console.error('Failed to fetch users:', error);
    return []; // Silent failure
  }
}
```

### 3. Use Async Iteration with Error Handling

Handle errors properly when working with async iterators and loops.

**✅ Async Iteration Error Handling:**
```javascript
// Async forEach with error handling
async function processUserBatch(userIds) {
  const results = [];
  const errors = [];
  
  for (const userId of userIds) {
    try {
      const user = await fetchUserData(userId);
      results.push(user);
    } catch (error) {
      console.error(`Failed to process user ${userId}:`, error);
      errors.push({
        userId,
        error: error.message
      });
    }
  }
  
  return {
    results,
    errors,
    successRate: results.length / userIds.length
  };
}

// Async map with error handling
async function processUserBatchMap(userIds) {
  const results = await Promise.allSettled(
    userIds.map(async (userId) => {
      try {
        return await fetchUserData(userId);
      } catch (error) {
        throw new Error(`Failed to fetch user ${userId}: ${error.message}`);
      }
    })
  );
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return { success: true, data: result.value };
    } else {
      return { 
        success: false, 
        userId: userIds[index], 
        error: result.reason.message 
      };
    }
  });
}

// Async generator with error handling
async function* processLargeDataset(data) {
  for (const item of data) {
    try {
      const processed = await processItem(item);
      yield processed;
    } catch (error) {
      console.error(`Failed to process item:`, error);
      // Continue processing other items
      continue;
    }
  }
}

// Usage
async function handleLargeDataset() {
  const results = [];
  
  for await (const item of processLargeDataset(largeData)) {
    results.push(item);
  }
  
  return results;
}
```

**❌ Poor Async Iteration Handling:**
```javascript
// No error handling in async iteration
async function processUserBatch(userIds) {
  const results = [];
  
  for (const userId of userIds) {
    const user = await fetchUserData(userId); // Can throw
    results.push(user);
  }
  
  return results;
}

// Breaking on first error
async function processUserBatchMap(userIds) {
  return await Promise.all(
    userIds.map(async (userId) => {
      const user = await fetchUserData(userId); // Can throw
      return user;
    })
  );
}
```

## TypeScript-Specific Considerations

### 1. Type-Safe Async Error Handling

Use TypeScript to create type-safe async error handling patterns.

**✅ Type-Safe Async Patterns:**
```typescript
interface AsyncResult<T> {
  success: true;
  data: T;
} | {
  success: false;
  error: Error;
};

// Type-safe async function
async function fetchUser(id: string): Promise<AsyncResult<User>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const userData = await response.json();
    return { success: true, data: userData };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

// Type-safe Promise.all
async function fetchMultipleUsers(ids: string[]): Promise<AsyncResult<User>[]> {
  const promises = ids.map(id => fetchUser(id));
  return await Promise.all(promises);
}

// Type-safe error handling in loops
async function processUsers(userIds: string[]): Promise<{
  successful: User[];
  failed: { id: string; error: string }[];
}> {
  const successful: User[] = [];
  const failed: { id: string; error: string }[] = [];
  
  for (const id of userIds) {
    const result = await fetchUser(id);
    
    if (result.success) {
      successful.push(result.data);
    } else {
      failed.push({
        id,
        error: result.error.message
      });
    }
  }
  
  return { successful, failed };
}

// Usage with type safety
async function handleUserProcessing() {
  const userIds = ['1', '2', '3'];
  const results = await processUsers(userIds);
  
  results.successful.forEach(user => {
    console.log(`Successfully processed user: ${user.name}`);
  });
  
  results.failed.forEach(failure => {
    console.error(`Failed to process user ${failure.id}: ${failure.error}`);
  });
}
```

**❌ Non-Type-Safe Async Patterns:**
```typescript
// Generic Promise without type safety
async function fetchUser(id: string): Promise<any> {
  const response = await fetch(`/api/users/${id}`);
  return response.json(); // No type safety
}

// Error handling without type safety
async function processUsers(userIds: string[]) {
  const results = [];
  
  for (const id of userIds) {
    try {
      const user = await fetchUser(id);
      results.push(user);
    } catch (error: any) {
      // 'error' could be anything
      console.error(`Failed to process user ${id}:`, error?.message);
    }
  }
  
  return results;
}
```

### 2. Async Error Union Types

Use union types to represent async operations that can fail.

**✅ Async Error Union Types:**
```typescript
type AsyncResult<T, E = Error> = Promise<{
  success: true;
  data: T;
} | {
  success: false;
  error: E;
}>;

// Async function with specific error types
async function authenticateUser(
  credentials: Credentials
): AsyncResult<User, AuthenticationError | NetworkError> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: new AuthenticationError('Invalid credentials')
        };
      }
      return {
        success: false,
        error: new NetworkError(`HTTP ${response.status}`, response.status)
      };
    }
    
    const userData = await response.json();
    return {
      success: true,
      data: userData
    };
  } catch (error) {
    return {
      success: false,
      error: new NetworkError('Network request failed', 0)
    };
  }
}

// Usage with type-safe error handling
async function handleUserAuthentication(credentials: Credentials) {
  const result = await authenticateUser(credentials);
  
  if (result.success) {
    console.log('Authentication successful:', result.data.name);
    return result.data;
  } else {
    if (result.error instanceof AuthenticationError) {
      console.error('Authentication failed:', result.error.message);
    } else if (result.error instanceof NetworkError) {
      console.error('Network error:', result.error.message);
    }
    throw result.error;
  }
}
```

**❌ No Error Union Types:**
```typescript
// Function that throws without clear error types
async function authenticateUser(credentials: Credentials): Promise<User> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Caller has no way to know what errors might be thrown
try {
  const user = await authenticateUser(credentials);
  console.log('Authentication successful:', user.name);
} catch (error) {
  // 'error' could be any Error
  console.error('Authentication failed:', error);
}
```

### 3. Async Generator Error Handling

Handle errors in async generators properly.

**✅ Async Generator Error Handling:**
```typescript
interface ProcessingResult<T> {
  success: true;
  data: T;
} | {
  success: false;
  error: Error;
  item: any;
};

async function* processItems<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>
): AsyncGenerator<ProcessingResult<R>> {
  for (const item of items) {
    try {
      const result = await processor(item);
      yield { success: true, data: result };
    } catch (error) {
      yield {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
        item
      };
    }
  }
}

// Usage
async function processLargeDataset<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>
): Promise<{
  successful: R[];
  failed: Array<{ item: T; error: string }>;
}> {
  const successful: R[] = [];
  const failed: Array<{ item: T; error: string }> = [];
  
  for await (const result of processItems(items, processor)) {
    if (result.success) {
      successful.push(result.data);
    } else {
      failed.push({
        item: result.item,
        error: result.error.message
      });
    }
  }
  
  return { successful, failed };
}

// Example usage
async function processUserRecords(userRecords: UserRecord[]) {
  const results = await processLargeDataset(
    userRecords,
    async (record) => {
      const user = await validateUser(record);
      return await createUser(user);
    }
  );
  
  console.log(`Processed ${results.successful.length} users successfully`);
  console.log(`Failed to process ${results.failed.length} users`);
  
  return results;
}
```

**❌ Poor Async Generator Error Handling:**
```typescript
// Async generator without error handling
async function* processItems<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>
): AsyncGenerator<R> {
  for (const item of items) {
    const result = await processor(item); // Can throw
    yield result;
  }
}

// Usage that doesn't handle generator errors
async function processLargeDataset(items: any[]) {
  const results = [];
  
  for await (const result of processItems(items, processItem)) {
    results.push(result); // Generator errors not handled
  }
  
  return results;
}
```

## Common Async Patterns

### 1. Sequential vs Parallel Processing

Choose the right approach based on your requirements.

**✅ Sequential Processing:**
```javascript
// Sequential processing - one at a time
async function processSequentially(items) {
  const results = [];
  
  for (const item of items) {
    try {
      const result = await processItem(item);
      results.push(result);
    } catch (error) {
      console.error('Sequential processing failed:', error);
      // Decide whether to continue or stop
      throw error; // Stop on first error
    }
  }
  
  return results;
}

// With continue on error
async function processSequentiallyWithContinue(items) {
  const results = [];
  const errors = [];
  
  for (const item of items) {
    try {
      const result = await processItem(item);
      results.push(result);
    } catch (error) {
      console.error('Item processing failed:', error);
      errors.push({ item, error: error.message });
      // Continue processing other items
    }
  }
  
  return { results, errors };
}
```

**✅ Parallel Processing:**
```javascript
// Parallel processing - all at once
async function processParallel(items) {
  try {
    const promises = items.map(item => processItem(item));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Parallel processing failed:', error);
    throw error; // First error stops everything
  }
}

// Parallel with partial success
async function processParallelWithPartialSuccess(items) {
  const promises = items.map(async (item) => {
    try {
      const result = await processItem(item);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message, item };
    }
  });
  
  const results = await Promise.all(promises);
  
  const successful = results.filter(r => r.success).map(r => r.data);
  const failed = results.filter(r => !r.success);
  
  return {
    successful,
    failed,
    successRate: successful.length / items.length
  };
}
```

### 2. Timeout Handling

Implement timeouts for async operations to prevent hanging.

**✅ Timeout Handling:**
```javascript
// Timeout wrapper
function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeout}ms`)), timeout);
    })
  ]);
}

// Usage
async function fetchUserDataWithTimeout(userId: string, timeout = 5000) {
  try {
    const response = await withTimeout(
      fetch(`/api/users/${userId}`),
      timeout
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.message.includes('timed out')) {
      console.error('Request timed out');
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

// AbortController for fetch timeout
async function fetchWithAbortController(url: string, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request was aborted due to timeout');
    }
    
    throw error;
  }
}
```

**❌ No Timeout Handling:**
```javascript
// Can hang indefinitely
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  return await response.json();
}

// No timeout for long-running operations
async function processLargeDataset(data) {
  const results = [];
  
  for (const item of data) {
    const result = await processItem(item); // Can take very long
    results.push(result);
  }
  
  return results;
}
```

### 3. Retry Logic for Async Operations

Implement retry logic for transient failures.

**✅ Async Retry Logic:**
```javascript
class AsyncRetryManager {
  constructor(
    private maxRetries = 3,
    private baseDelay = 1000,
    private maxDelay = 10000
  ) {}
  
  async withRetry<T>(
    operation: () => Promise<T>,
    shouldRetry?: (error: Error) => boolean
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (!shouldRetry || !shouldRetry(error) || attempt === this.maxRetries) {
          throw error;
        }
        
        const delay = Math.min(
          this.baseDelay * Math.pow(2, attempt),
          this.maxDelay
        );
        
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await this.delay(delay);
      }
    }
    
    throw lastError!;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const retryManager = new AsyncRetryManager(3, 1000, 5000);

async function fetchUserDataWithRetry(userId: string) {
  return await retryManager.withRetry(
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    },
    error => {
      // Only retry on network errors or server errors
      return error.message.includes('HTTP 5') || 
             error.message.includes('fetch') ||
             error.message.includes('timeout');
    }
  );
}

// Exponential backoff with jitter
async function withExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 1000; // Add randomness
      const totalDelay = delay + jitter;
      
      console.log(`Attempt ${attempt + 1} failed, retrying in ${totalDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }
  
  throw lastError!;
}
```

**❌ No Retry Logic:**
```javascript
// No retry on transient failures
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return await response.json();
}

// Immediate failure on any error
async function processOrder(orderData) {
  const result = await validateOrder(orderData);
  const inventory = await checkInventory(result);
  const payment = await processPayment(inventory);
  return await createOrder(payment);
}
```

## Common Pitfalls and Solutions

### 1. Unhandled Promise Rejections

**❌ Bad:**
```javascript
// Unhandled promise rejection
async function processUser(userId) {
  fetchUserData(userId).then(user => {
    console.log(user.name);
  });
  // No .catch() - unhandled rejection if fetch fails
}

// Async function without await
function processUsers(userIds) {
  userIds.forEach(async (id) => {
    const user = await fetchUserData(id); // Unhandled if this throws
    console.log(user.name);
  });
}
```

**✅ Good:**
```javascript
// Proper error handling
async function processUser(userId) {
  try {
    const user = await fetchUserData(userId);
    console.log(user.name);
  } catch (error) {
    console.error('Failed to process user:', error);
  }
}

// Handle each async operation
async function processUsers(userIds) {
  for (const id of userIds) {
    try {
      const user = await fetchUserData(id);
      console.log(user.name);
    } catch (error) {
      console.error(`Failed to process user ${id}:`, error);
    }
  }
}
```

### 2. Race Conditions

**❌ Bad:**
```javascript
// Race condition - multiple async operations modifying shared state
let globalState = {};

async function updateUserState(userId) {
  const user = await fetchUserData(userId);
  const permissions = await fetchUserPermissions(userId);
  
  // Race condition: multiple operations might modify globalState simultaneously
  globalState[userId] = {
    ...globalState[userId],
    user,
    permissions
  };
}
```

**✅ Good:**
```javascript
// Proper state management
class StateManager {
  constructor() {
    this.state = new Map();
    this.locks = new Map();
  }
  
  async updateUserState(userId) {
    // Acquire lock to prevent race conditions
    if (this.locks.has(userId)) {
      await this.locks.get(userId);
    }
    
    const lock = this.createLock();
    this.locks.set(userId, lock);
    
    try {
      const user = await fetchUserData(userId);
      const permissions = await fetchUserPermissions(userId);
      
      this.state.set(userId, {
        user,
        permissions,
        lastUpdated: Date.now()
      });
    } finally {
      this.locks.delete(userId);
      lock.resolve();
    }
  }
  
  createLock() {
    let resolve: () => void;
    const promise = new Promise<void>(r => resolve = r);
    return { promise, resolve: resolve! };
  }
}
```

### 3. Memory Leaks in Async Operations

**❌ Bad:**
```javascript
// Potential memory leak - accumulating unresolved promises
class DataProcessor {
  constructor() {
    this.pendingOperations = new Map();
  }
  
  async processLargeDataset(data) {
    for (const item of data) {
      const operationId = Math.random().toString();
      const promise = this.processItem(item);
      
      this.pendingOperations.set(operationId, promise);
      // Never clean up completed operations
    }
    
    return Promise.all(this.pendingOperations.values());
  }
}
```

**✅ Good:**
```javascript
// Proper cleanup of async operations
class DataProcessor {
  constructor() {
    this.pendingOperations = new Map();
  }
  
  async processLargeDataset(data) {
    const results = [];
    
    for (const item of data) {
      const operationId = Math.random().toString();
      const promise = this.processItem(item);
      
      this.pendingOperations.set(operationId, promise);
      
      try {
        const result = await promise;
        results.push(result);
      } finally {
        // Clean up completed operation
        this.pendingOperations.delete(operationId);
      }
    }
    
    return results;
  }
  
  // Cleanup method for external use
  cleanup() {
    for (const [id, promise] of this.pendingOperations) {
      // Cancel or handle pending operations
      this.pendingOperations.delete(id);
    }
  }
}
```

## Best Practices Summary

1. **Always handle async errors**: Use try-catch or .catch() for every async operation
2. **Choose appropriate error handling strategy**: Decide between fail-fast vs graceful degradation
3. **Use type-safe patterns**: Leverage TypeScript for better async error handling
4. **Implement timeouts**: Prevent operations from hanging indefinitely
5. **Add retry logic**: Handle transient failures gracefully
6. **Handle partial failures**: Use Promise.allSettled() when appropriate
7. **Avoid race conditions**: Use proper synchronization for shared state
8. **Prevent memory leaks**: Clean up async operations and resources
9. **Use async iteration carefully**: Handle errors in async loops and generators
10. **Test error scenarios**: Ensure async error handling works correctly

## Examples in Context

### E-commerce Application
```javascript
class OrderProcessor {
  constructor() {
    this.retryManager = new AsyncRetryManager(3, 1000);
  }
  
  async processOrder(orderData) {
    let paymentResult = null;
    
    try {
      // Validate order with retry
      const validatedOrder = await this.retryManager.withRetry(
        () => this.validateOrder(orderData),
        error => error instanceof ValidationError
      );
      
      // Check inventory with timeout
      const inventoryResult = await withTimeout(
        this.checkInventory(validatedOrder.items),
        5000
      );
      
      // Process payment with retry
      paymentResult = await this.retryManager.withRetry(
        () => this.processPayment(validatedOrder.payment),
        error => error instanceof PaymentError
      );
      
      // Create order
      const order = await this.createOrder(validatedOrder, paymentResult);
      
      return { success: true, order };
    } catch (error) {
      // Rollback payment if it was processed
      if (paymentResult) {
        try {
          await this.refundPayment(paymentResult.transactionId);
        } catch (refundError) {
          console.error('Failed to refund payment:', refundError);
        }
      }
      
      return { success: false, error: error.message };
    }
  }
  
  async processMultipleOrders(orderDataList) {
    const results = await Promise.allSettled(
      orderDataList.map(async (orderData) => {
        return await this.processOrder(orderData);
      })
    );
    
    const successful = results
      .filter(r => r.status === 'fulfilled' && r.value.success)
      .map(r => r.value.order);
    
    const failed = results
      .filter(r => r.status === 'rejected' || !r.value.success)
      .map((r, index) => ({
        orderData: orderDataList[index],
        error: r.status === 'rejected' ? r.reason : r.value.error
      }));
    
    return {
      successful,
      failed,
      successRate: successful.length / orderDataList.length
    };
  }
}
```

### API Development
```javascript
class ApiController {
  constructor(service, logger) {
    this.service = service;
    this.logger = logger;
    this.timeout = 30000; // 30 seconds
  }
  
  async handleRequest(req, res, operation) {
    const startTime = Date.now();
    
    try {
      const result = await withTimeout(
        operation(req),
        this.timeout
      );
      
      const duration = Date.now() - startTime;
      this.logger.info('Request completed', {
        method: req.method,
        url: req.url,
        duration,
        success: true
      });
      
      res.json(result);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error('Request failed', {
        method: req.method,
        url: req.url,
        duration,
        error: error.message
      });
      
      if (error.message.includes('timeout')) {
        res.status(408).json({
          error: 'Request timeout',
          message: 'The request took too long to complete'
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred'
        });
      }
    }
  }
  
  async batchOperation(req, res) {
    const { operations } = req.body;
    
    if (!Array.isArray(operations)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Operations must be an array'
      });
    }
    
    const results = await Promise.allSettled(
      operations.map(async (operation) => {
        return await this.handleSingleOperation(operation);
      })
    );
    
    const successful = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);
    
    const failed = results
      .filter(r => r.status === 'rejected')
      .map((r, index) => ({
        operation: operations[index],
        error: r.reason.message
      }));
    
    res.json({
      successful,
      failed,
      successRate: successful.length / operations.length
    });
  }
  
  async handleSingleOperation(operation) {
    // Implementation for single operation
    return this.service.execute(operation);
  }
}
```

### Data Processing
```javascript
class DataPipeline {
  constructor() {
    this.validators = [];
    this.transformers = [];
    this.processors = [];
  }
  
  async processStream(dataStream) {
    const results = [];
    const errors = [];
    
    try {
      for await (const chunk of dataStream) {
        try {
          let processedChunk = chunk;
          
          // Validate chunk
          for (const validator of this.validators) {
            processedChunk = await validator.validate(processedChunk);
          }
          
          // Transform chunk
          for (const transformer of this.transformers) {
            processedChunk = await transformer.transform(processedChunk);
          }
          
          // Process chunk
          for (const processor of this.processors) {
            processedChunk = await processor.process(processedChunk);
          }
          
          results.push(processedChunk);
        } catch (error) {
          errors.push({
            chunk,
            error: error.message,
            timestamp: new Date().toISOString()
          });
          
          // Continue processing other chunks
        }
      }
      
      return {
        results,
        errors,
        successRate: results.length / (results.length + errors.length)
      };
    } catch (error) {
      console.error('Stream processing failed:', error);
      throw new Error(`Stream processing failed: ${error.message}`);
    }
  }
  
  async processBatch(data) {
    const batchSize = 100;
    const results = [];
    const errors = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(async (item) => {
          return await this.processItem(item);
        })
      );
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          errors.push({
            item: batch[index],
            error: result.reason.message
          });
        }
      });
    }
    
    return {
      results,
      errors,
      successRate: results.length / (results.length + errors.length)
    };
  }
  
  async processItem(item) {
    let processedItem = item;
    
    for (const validator of this.validators) {
      processedItem = await validator.validate(processedItem);
    }
    
    for (const transformer of this.transformers) {
      processedItem = await transformer.transform(processedItem);
    }
    
    for (const processor of this.processors) {
      processedItem = await processor.process(processedItem);
    }
    
    return processedItem;
  }
}
```

Remember: Async error handling requires careful consideration of timing, partial failures, and resource management. Always handle errors appropriately and choose the right strategy based on your application's requirements.