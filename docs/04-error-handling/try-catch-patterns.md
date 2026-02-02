# Try-Catch Patterns

## Overview

Try-catch blocks are the fundamental mechanism for handling synchronous errors in JavaScript and TypeScript. This document covers best practices for using try-catch patterns effectively, including when to use them, how to structure them, and common pitfalls to avoid.

## Core Principles

### 1. Catch Specific Errors

Always catch specific error types rather than using generic catch blocks.

**✅ Good Specific Catch:**
```javascript
function processUserInput(data) {
  try {
    const validatedData = validateInput(data);
    const result = processData(validatedData);
    return result;
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Input validation failed:', error.message);
      return { success: false, error: 'Invalid input data' };
    }
    
    if (error instanceof ProcessingError) {
      console.error('Processing failed:', error.message);
      return { success: false, error: 'Failed to process data' };
    }
    
    // Re-throw unexpected errors
    throw error;
  }
}

// Specific error classes
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class ProcessingError extends Error {
  constructor(message, operation) {
    super(message);
    this.name = 'ProcessingError';
    this.operation = operation;
  }
}
```

**❌ Bad Generic Catch:**
```javascript
function processUserInput(data) {
  try {
    const validatedData = validateInput(data);
    const result = processData(validatedData);
    return result;
  } catch (error) {
    // Generic catch - what kind of error is this?
    console.error('Something went wrong:', error.message);
    return { success: false, error: 'An error occurred' };
  }
}
```

### 2. Use Finally for Cleanup

Always use finally blocks for cleanup operations that must run regardless of success or failure.

**✅ Good Finally Usage:**
```javascript
class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.transactionActive = false;
  }
  
  async executeQuery(query, params = []) {
    let result;
    
    try {
      await this.connect();
      await this.beginTransaction();
      this.transactionActive = true;
      
      result = await this.connection.query(query, params);
      
      await this.commitTransaction();
      return result;
    } catch (error) {
      if (this.transactionActive) {
        await this.rollbackTransaction();
      }
      throw error;
    } finally {
      // Always clean up
      if (this.transactionActive) {
        this.transactionActive = false;
      }
      await this.disconnect();
    }
  }
  
  async connect() {
    // Connection logic
  }
  
  async disconnect() {
    // Disconnection logic
  }
  
  async beginTransaction() {
    // Begin transaction logic
  }
  
  async commitTransaction() {
    // Commit transaction logic
  }
  
  async rollbackTransaction() {
    // Rollback transaction logic
  }
}

// File operations with cleanup
function processFile(filePath) {
  let fileHandle = null;
  
  try {
    fileHandle = openFile(filePath);
    const data = readFile(fileHandle);
    const processedData = processData(data);
    writeFile(fileHandle, processedData);
    return { success: true, data: processedData };
  } catch (error) {
    if (error instanceof FileError) {
      console.error('File operation failed:', error.message);
      return { success: false, error: 'File operation failed' };
    }
    throw error;
  } finally {
    // Always close file handle
    if (fileHandle) {
      closeFile(fileHandle);
    }
  }
}
```

**❌ Missing Cleanup:**
```javascript
function processFile(filePath) {
  let fileHandle = null;
  
  try {
    fileHandle = openFile(filePath);
    const data = readFile(fileHandle);
    const processedData = processData(data);
    writeFile(fileHandle, processedData);
    return { success: true, data: processedData };
  } catch (error) {
    // File handle might not be closed if an error occurs
    console.error('Error:', error.message);
    return { success: false, error: 'Operation failed' };
  }
  // No finally block - resource leak potential
}
```

### 3. Don't Catch What You Can't Handle

Only catch errors that you can meaningfully handle or recover from.

**✅ Don't Catch Unhandleable Errors:**
```javascript
function calculateTotal(items) {
  // Don't catch programming errors
  if (!Array.isArray(items)) {
    throw new TypeError('Items must be an array'); // Let this bubble up
  }
  
  try {
    return items.reduce((total, item) => {
      if (typeof item.price !== 'number') {
        throw new Error(`Invalid price for item: ${item.name}`); // Let this bubble up
      }
      return total + item.price;
    }, 0);
  } catch (error) {
    // Only catch what we can handle
    if (error instanceof RangeError) {
      console.warn('Calculation resulted in overflow, using safe default');
      return 0;
    }
    throw error; // Re-throw unhandleable errors
  }
}

// Better approach - validate inputs early
function calculateTotal(items) {
  // Early validation
  if (!Array.isArray(items)) {
    throw new TypeError('Items must be an array');
  }
  
  // Validate each item
  for (const item of items) {
    if (typeof item.price !== 'number' || item.price < 0) {
      throw new Error(`Invalid price for item: ${item.name}`);
    }
  }
  
  // Safe to calculate
  return items.reduce((total, item) => total + item.price, 0);
}
```

**❌ Catching Everything:**
```javascript
function calculateTotal(items) {
  try {
    // This catches programming errors that should bubble up
    return items.reduce((total, item) => total + item.price, 0);
  } catch (error) {
    // Catching TypeError, ReferenceError, etc. - bad idea
    console.error('Calculation failed:', error.message);
    return 0; // Silent failure - hides bugs
  }
}
```

## TypeScript-Specific Considerations

### 1. Type-Safe Error Handling

Use TypeScript to create type-safe error handling patterns.

**✅ Type-Safe Error Handling:**
```typescript
interface AppError {
  name: string;
  message: string;
  code: string;
  timestamp: string;
}

class ValidationError extends Error implements AppError {
  name = 'ValidationError';
  code = 'VALIDATION_ERROR';
  timestamp = new Date().toISOString();
  
  constructor(message: string, public field?: string) {
    super(message);
  }
}

class NetworkError extends Error implements AppError {
  name = 'NetworkError';
  code = 'NETWORK_ERROR';
  timestamp = new Date().toISOString();
  
  constructor(message: string, public statusCode?: number) {
    super(message);
  }
}

// Type-safe error handling
function handleSpecificError(error: unknown): string {
  if (error instanceof ValidationError) {
    return `Validation failed for field "${error.field}": ${error.message}`;
  }
  
  if (error instanceof NetworkError) {
    return `Network error (${error.statusCode}): ${error.message}`;
  }
  
  if (error instanceof Error) {
    return `Generic error: ${error.message}`;
  }
  
  return 'Unknown error occurred';
}

// Usage
function processUserData(userData: unknown) {
  try {
    validateUserData(userData);
    return { success: true, data: userData };
  } catch (error) {
    const errorMessage = handleSpecificError(error);
    return { success: false, error: errorMessage };
  }
}
```

**❌ Non-Type-Safe Approach:**
```typescript
// Generic error handling without type safety
function processUserData(userData: unknown) {
  try {
    validateUserData(userData);
    return { success: true, data: userData };
  } catch (error: any) {
    // 'error' could be anything - no type safety
    return { success: false, error: error?.message || 'Unknown error' };
  }
}
```

### 2. Async Try-Catch Patterns

Handle async operations properly with try-catch blocks.

**✅ Async Try-Catch:**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchUserData(userId: string): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`, response.status);
    }
    
    const userData = await response.json();
    const validatedUser = validateUser(userData);
    
    return { success: true, data: validatedUser };
  } catch (error) {
    if (error instanceof NetworkError) {
      return { success: false, error: `Network error: ${error.message}` };
    }
    
    if (error instanceof ValidationError) {
      return { success: false, error: `Validation error: ${error.message}` };
    }
    
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Multiple async operations
async function processOrder(orderData: OrderData): Promise<ApiResponse<OrderResult>> {
  let paymentResult: PaymentResult | null = null;
  
  try {
    // Validate order
    const validatedOrder = validateOrder(orderData);
    
    // Check inventory
    await checkInventory(validatedOrder.items);
    
    // Process payment
    paymentResult = await processPayment(validatedOrder.payment);
    
    // Create order
    const order = await createOrder(validatedOrder, paymentResult);
    
    return { success: true, data: order };
  } catch (error) {
    // Rollback payment if it was processed
    if (paymentResult) {
      try {
        await refundPayment(paymentResult.transactionId);
      } catch (refundError) {
        console.error('Failed to refund payment:', refundError);
      }
    }
    
    if (error instanceof ValidationError) {
      return { success: false, error: `Order validation failed: ${error.message}` };
    }
    
    if (error instanceof PaymentError) {
      return { success: false, error: `Payment processing failed: ${error.message}` };
    }
    
    return { success: false, error: 'Order processing failed' };
  }
}
```

**❌ Poor Async Error Handling:**
```typescript
// Not handling async errors properly
async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const userData = await response.json(); // No error checking
    return userData;
  } catch (error) {
    // Generic error handling
    throw new Error('Failed to fetch user data');
  }
}

// Mixing sync and async error handling
function processOrder(orderData: OrderData) {
  try {
    // Synchronous validation
    validateOrder(orderData);
    
    // Asynchronous operations without proper error handling
    checkInventory(orderData.items)
      .then(() => processPayment(orderData.payment))
      .then(() => createOrder(orderData))
      .catch(error => {
        // Error handling in .catch() instead of try-catch
        console.error('Order processing failed:', error);
      });
  } catch (error) {
    // This won't catch async errors
    console.error('Validation failed:', error);
  }
}
```

### 3. Error Union Types

Use union types to represent functions that can throw specific errors.

**✅ Error Union Types:**
```typescript
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

// Function that can return specific error types
function divide(a: number, b: number): Result<number, ValidationError> {
  if (b === 0) {
    return {
      success: false,
      error: new ValidationError('Division by zero is not allowed', 'divisor')
    };
  }
  
  return {
    success: true,
    data: a / b
  };
}

// Async function with error union
async function fetchUser(id: string): Promise<Result<User, NetworkError | ValidationError>> {
  try {
    if (!id) {
      return {
        success: false,
        error: new ValidationError('User ID is required', 'id')
      };
    }
    
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      return {
        success: false,
        error: new NetworkError(`HTTP ${response.status}: ${response.statusText}`, response.status)
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
function handleUserFetch(id: string) {
  fetchUser(id).then(result => {
    if (result.success) {
      console.log('User:', result.data.name);
    } else {
      if (result.error instanceof ValidationError) {
        console.error('Validation error:', result.error.message);
      } else if (result.error instanceof NetworkError) {
        console.error('Network error:', result.error.message);
      }
    }
  });
}
```

**❌ No Error Union Types:**
```typescript
// Function that throws errors without clear type information
async function fetchUser(id: string): Promise<User> {
  if (!id) {
    throw new Error('User ID is required'); // No type information
  }
  
  const response = await fetch(`/api/users/${id}`);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`); // No type information
  }
  
  return response.json();
}

// Caller has no way to know what errors might be thrown
try {
  const user = await fetchUser('123');
  console.log(user.name);
} catch (error) {
  // 'error' could be any Error - no type safety
  console.error('Error:', error.message);
}
```

## Common Patterns

### 1. Resource Management Pattern

Use try-finally for proper resource management.

**✅ Resource Management:**
```javascript
class ResourceManager {
  constructor() {
    this.resources = new Map();
  }
  
  async withResource(resourceId, operation) {
    let resource = null;
    
    try {
      resource = await this.acquireResource(resourceId);
      this.resources.set(resourceId, resource);
      
      const result = await operation(resource);
      return result;
    } finally {
      if (resource) {
        await this.releaseResource(resourceId, resource);
        this.resources.delete(resourceId);
      }
    }
  }
  
  async acquireResource(id) {
    // Resource acquisition logic
    return { id, connection: 'active' };
  }
  
  async releaseResource(id, resource) {
    // Resource cleanup logic
  }
}

// Usage
const resourceManager = new ResourceManager();

async function processData() {
  return await resourceManager.withResource('database', async (db) => {
    const result = await db.query('SELECT * FROM users');
    return result;
  });
}
```

### 2. Retry Pattern

Implement retry logic with exponential backoff.

**✅ Retry Pattern:**
```javascript
class RetryManager {
  constructor(maxRetries = 3, baseDelay = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }
  
  async withRetry(operation, shouldRetry = () => true) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (!shouldRetry(error) || attempt === this.maxRetries) {
          throw error;
        }
        
        const delay = this.baseDelay * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await this.delay(delay);
      }
    }
    
    throw lastError;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const retryManager = new RetryManager(3, 1000);

async function fetchDataWithRetry() {
  return await retryManager.withRetry(
    async () => {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new NetworkError(`HTTP ${response.status}`, response.status);
      }
      return response.json();
    },
    error => error instanceof NetworkError && error.statusCode >= 500
  );
}
```

### 3. Circuit Breaker Pattern

Implement circuit breaker pattern for fault tolerance.

**✅ Circuit Breaker Pattern:**
```javascript
class CircuitBreaker {
  constructor(failureThreshold = 5, recoveryTimeout = 60000) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeout = recoveryTimeout;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }
  
  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        console.log('Circuit breaker: transitioning to HALF_OPEN');
      } else {
        throw new Error('Circuit breaker is OPEN');
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
  }
  
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log('Circuit breaker: transitioning to OPEN');
    }
  }
}

// Usage
const circuitBreaker = new CircuitBreaker(3, 30000);

async function fetchDataWithCircuitBreaker() {
  return await circuitBreaker.execute(async () => {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new NetworkError(`HTTP ${response.status}`, response.status);
    }
    return response.json();
  });
}
```

## Common Pitfalls and Solutions

### 1. Silent Failures

**❌ Bad:**
```javascript
function processData(data) {
  try {
    return complexOperation(data);
  } catch (error) {
    // Silent failure - hides bugs
    return null;
  }
}
```

**✅ Good:**
```javascript
function processData(data) {
  try {
    return complexOperation(data);
  } catch (error) {
    console.error('Process failed:', error);
    throw error; // Re-throw or return meaningful error
  }
}
```

### 2. Catching Too Broadly

**❌ Bad:**
```javascript
function calculateTotal(items) {
  try {
    return items.reduce((total, item) => total + item.price, 0);
  } catch (error) {
    // Catches TypeError, ReferenceError, etc.
    return 0; // Silent failure
  }
}
```

**✅ Good:**
```javascript
function calculateTotal(items) {
  if (!Array.isArray(items)) {
    throw new TypeError('Items must be an array');
  }
  
  try {
    return items.reduce((total, item) => {
      if (typeof item.price !== 'number') {
        throw new Error(`Invalid price for item: ${item.name}`);
      }
      return total + item.price;
    }, 0);
  } catch (error) {
    if (error instanceof RangeError) {
      console.warn('Calculation overflow, using safe default');
      return 0;
    }
    throw error; // Re-throw programming errors
  }
}
```

### 3. Nested Try-Catch

**❌ Bad:**
```javascript
function complexOperation(data) {
  try {
    try {
      try {
        // Deeply nested try-catch
        const result1 = operation1(data);
        const result2 = operation2(result1);
        return operation3(result2);
      } catch (error) {
        console.error('Operation 3 failed:', error);
        throw error;
      }
    } catch (error) {
      console.error('Operation 2 failed:', error);
      throw error;
    }
  } catch (error) {
    console.error('Operation 1 failed:', error);
    throw error;
  }
}
```

**✅ Good:**
```javascript
function complexOperation(data) {
  try {
    const result1 = operation1(data);
    const result2 = operation2(result1);
    return operation3(result2);
  } catch (error) {
    // Handle at the appropriate level
    if (error instanceof ValidationError) {
      console.error('Validation failed:', error.message);
      throw new ProcessingError('Input validation failed', 'complexOperation');
    }
    
    if (error instanceof NetworkError) {
      console.error('Network operation failed:', error.message);
      throw new ProcessingError('Network operation failed', 'complexOperation');
    }
    
    throw error; // Re-throw unexpected errors
  }
}
```

## Best Practices Summary

1. **Catch specific errors**: Use instanceof checks for specific error types
2. **Use finally for cleanup**: Always clean up resources in finally blocks
3. **Don't catch unhandleable errors**: Let programming errors bubble up
4. **Log errors appropriately**: Include context for debugging
5. **Use meaningful error messages**: Help with debugging and user experience
6. **Implement retry logic**: Handle transient failures gracefully
7. **Use circuit breakers**: Prevent cascading failures
8. **Avoid silent failures**: Always handle or re-throw errors
9. **Keep try blocks small**: Minimize the scope of try blocks
10. **Test error scenarios**: Ensure error handling works correctly

## Examples in Context

### E-commerce Application
```javascript
class OrderProcessor {
  constructor(paymentService, inventoryService, notificationService) {
    this.paymentService = paymentService;
    this.inventoryService = inventoryService;
    this.notificationService = notificationService;
  }
  
  async processOrder(orderData) {
    let paymentResult = null;
    
    try {
      // Validate order
      const validatedOrder = this.validateOrder(orderData);
      
      // Check inventory
      await this.inventoryService.reserveItems(validatedOrder.items);
      
      // Process payment
      paymentResult = await this.paymentService.processPayment(validatedOrder.payment);
      
      // Create order
      const order = await this.createOrder(validatedOrder, paymentResult);
      
      // Send confirmation
      await this.notificationService.sendConfirmation(order);
      
      return { success: true, order };
    } catch (error) {
      // Rollback payment if it was processed
      if (paymentResult) {
        try {
          await this.paymentService.refundPayment(paymentResult.transactionId);
        } catch (refundError) {
          console.error('Failed to refund payment:', refundError);
        }
      }
      
      // Handle specific error types
      if (error instanceof ValidationError) {
        return { success: false, error: 'Order validation failed' };
      }
      
      if (error instanceof InventoryError) {
        return { success: false, error: 'Insufficient inventory' };
      }
      
      if (error instanceof PaymentError) {
        return { success: false, error: 'Payment processing failed' };
      }
      
      return { success: false, error: 'Order processing failed' };
    }
  }
  
  validateOrder(orderData) {
    if (!orderData.items || orderData.items.length === 0) {
      throw new ValidationError('Order must contain items', 'items');
    }
    
    if (!orderData.payment) {
      throw new ValidationError('Payment information is required', 'payment');
    }
    
    return orderData;
  }
}
```

### API Development
```javascript
class ApiController {
  constructor(service, logger) {
    this.service = service;
    this.logger = logger;
  }
  
  async handleRequest(req, res, operation) {
    const startTime = Date.now();
    
    try {
      const result = await operation(req);
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
        error: error.message,
        stack: error.stack
      });
      
      if (error instanceof ValidationError) {
        res.status(400).json({
          error: 'Validation failed',
          message: error.message,
          field: error.field
        });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({
          error: 'Not found',
          message: error.message
        });
      } else if (error instanceof ConflictError) {
        res.status(409).json({
          error: 'Conflict',
          message: error.message
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred'
        });
      }
    }
  }
  
  async getAll(req, res) {
    await this.handleRequest(req, res, async (request) => {
      const options = {
        page: parseInt(request.query.page) || 1,
        limit: parseInt(request.query.limit) || 20
      };
      
      return await this.service.findAll(options);
    });
  }
  
  async getById(req, res) {
    await this.handleRequest(req, res, async (request) => {
      const { id } = request.params;
      
      if (!id) {
        throw new ValidationError('ID parameter is required', 'id');
      }
      
      return await this.service.findById(id);
    });
  }
  
  async create(req, res) {
    await this.handleRequest(req, res, async (request) => {
      const validation = this.validateInput(request.body);
      if (!validation.valid) {
        throw new ValidationError(validation.message, validation.field);
      }
      
      return await this.service.create(request.body);
    });
  }
}
```

### Data Processing
```javascript
class DataProcessor {
  constructor() {
    this.validators = [];
    this.transformers = [];
    this.formatters = [];
  }
  
  async processBatch(records) {
    const results = {
      success: [],
      failed: [],
      errors: []
    };
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      try {
        let processedRecord = record;
        
        // Validate
        for (const validator of this.validators) {
          await validator.validate(processedRecord);
        }
        
        // Transform
        for (const transformer of this.transformers) {
          processedRecord = await transformer.transform(processedRecord);
        }
        
        // Format
        for (const formatter of this.formatters) {
          processedRecord = await formatter.format(processedRecord);
        }
        
        results.success.push(processedRecord);
      } catch (error) {
        results.failed.push(record);
        results.errors.push({
          index: i,
          error: error.message,
          type: error.constructor.name
        });
      }
    }
    
    return results;
  }
  
  addValidator(validator) {
    this.validators.push(validator);
    return this;
  }
  
  addTransformer(transformer) {
    this.transformers.push(transformer);
    return this;
  }
  
  addFormatter(formatter) {
    this.formatters.push(formatter);
    return this;
  }
}

// Usage with error handling
async function processDataPipeline() {
  const processor = new DataProcessor()
    .addValidator(new SchemaValidator(schema))
    .addTransformer(new DataTransformer())
    .addFormatter(new JsonFormatter());
  
  try {
    const results = await processor.processBatch(data);
    
    if (results.failed.length > 0) {
      console.warn(`Processed ${results.success.length} records, ${results.failed.length} failed`);
      console.error('Failed records:', results.errors);
    }
    
    return results;
  } catch (error) {
    console.error('Pipeline failed:', error);
    throw new ProcessingError('Data processing pipeline failed', 'processBatch');
  }
}
```

Remember: Try-catch patterns are essential for robust error handling. Use them judiciously, catch specific errors, always clean up resources, and never hide programming errors that should be fixed.