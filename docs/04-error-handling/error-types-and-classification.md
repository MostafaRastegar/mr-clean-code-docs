# Error Types and Classification

## Overview

Understanding different types of errors and classifying them appropriately is crucial for implementing effective error handling strategies. This document covers the various error types you'll encounter in JavaScript and TypeScript applications and how to categorize them for better error management.

## Core Principles

### 1. Distinguish Between Error Types

Different types of errors require different handling strategies. Proper classification helps you respond appropriately to each situation.

**✅ Good Error Classification:**
```javascript
// Application-specific error types
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = 'VALIDATION_ERROR';
  }
}

class NetworkError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    this.code = 'NETWORK_ERROR';
  }
}

class DatabaseError extends Error {
  constructor(message, operation) {
    super(message);
    this.name = 'DatabaseError';
    this.operation = operation;
    this.code = 'DATABASE_ERROR';
  }
}

// Usage
function validateUserInput(data) {
  if (!data.email) {
    throw new ValidationError('Email is required', 'email');
  }
  if (!data.password || data.password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters', 'password');
  }
}

async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new NetworkError('Failed to fetch user', response.status);
    }
    return response.json();
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error('Network issue:', error.message);
      // Retry logic or fallback
    }
    throw error;
  }
}
```

**❌ Bad Error Classification:**
```javascript
// Generic errors without context
function processUser(data) {
  if (!data.email) {
    throw new Error('Invalid input'); // Too generic
  }
  
  try {
    // Some operation
  } catch (error) {
    throw new Error('Something went wrong'); // No context
  }
}
```

### 2. Use Error Codes for Programmatic Handling

Error codes allow for programmatic error handling and better user experience.

**✅ Good Error Codes:**
```javascript
class AppError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Specific error types with codes
class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', details = {}) {
    super(message, 'AUTH_ERROR', details);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied', details = {}) {
    super(message, 'AUTHZ_ERROR', details);
  }
}

class NotFoundError extends AppError {
  constructor(resource, details = {}) {
    super(`${resource} not found`, 'NOT_FOUND', details);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details = {}) {
    super(message, 'CONFLICT', details);
  }
}

// Usage
function authenticateUser(credentials) {
  if (!credentials.email || !credentials.password) {
    throw new AuthenticationError('Missing credentials', {
      missing: !credentials.email ? ['email'] : ['password']
    });
  }
  
  // Authentication logic
  if (!isValidUser(credentials)) {
    throw new AuthenticationError('Invalid credentials', {
      attemptedEmail: credentials.email
    });
  }
}

function updateUser(userId, data) {
  const user = findUser(userId);
  if (!user) {
    throw new NotFoundError('User', { userId });
  }
  
  if (user.email !== data.email && emailExists(data.email)) {
    throw new ConflictError('Email already exists', {
      conflictingEmail: data.email
    });
  }
  
  // Update logic
}
```

**❌ Poor Error Codes:**
```javascript
// Non-descriptive error codes
class GenericError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code; // What does 'ERR_001' mean?
  }
}

// Inconsistent error handling
function processOrder(order) {
  if (!order.items || order.items.length === 0) {
    throw new Error('Invalid order'); // No code
  }
  
  if (order.total <= 0) {
    throw new GenericError('Invalid total', 'ERR_001'); // Unclear code
  }
}
```

### 3. Include Context and Metadata

Provide sufficient context to understand and debug errors.

**✅ Good Error Context:**
```javascript
class BusinessLogicError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = 'BusinessLogicError';
    this.context = {
      timestamp: new Date().toISOString(),
      userId: context.userId,
      sessionId: context.sessionId,
      action: context.action,
      data: context.data,
      stack: this.stack
    };
  }
}

class ExternalServiceError extends Error {
  constructor(service, operation, originalError) {
    super(`External service ${service} failed during ${operation}`);
    this.name = 'ExternalServiceError';
    this.service = service;
    this.operation = operation;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

// Usage with rich context
function processPayment(amount, paymentMethod, context) {
  try {
    // Payment processing logic
    if (amount <= 0) {
      throw new BusinessLogicError('Invalid payment amount', {
        ...context,
        amount,
        paymentMethod,
        action: 'processPayment'
      });
    }
    
    const result = paymentGateway.charge(amount, paymentMethod);
    return result;
  } catch (error) {
    if (error instanceof ExternalServiceError) {
      // Handle external service failure
      logger.error('Payment gateway failure', {
        error: error.message,
        service: error.service,
        operation: error.operation,
        context
      });
      
      // Return user-friendly error
      throw new BusinessLogicError('Payment processing temporarily unavailable', {
        ...context,
        originalError: error.message
      });
    }
    
    throw error;
  }
}
```

**❌ Poor Error Context:**
```javascript
// Missing context
function saveUser(userData) {
  try {
    // Save logic
  } catch (error) {
    // What happened? Where? When? Why?
    throw new Error('Save failed');
  }
}

// Too much context (performance impact)
function processLargeDataset(data) {
  try {
    // Processing logic
  } catch (error) {
    // Including entire dataset in error - bad for memory/performance
    throw new Error('Processing failed', {
      error: error.message,
      fullDataset: data, // This could be huge!
      stack: error.stack
    });
  }
}
```

## TypeScript-Specific Considerations

### 1. Type-Safe Error Handling

Use TypeScript to create type-safe error handling patterns.

**✅ Type-Safe Error Types:**
```typescript
interface ErrorContext {
  userId?: string;
  sessionId?: string;
  timestamp: string;
  action?: string;
  metadata?: Record<string, any>;
}

abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  
  constructor(
    message: string,
    public readonly context: ErrorContext = { timestamp: new Date().toISOString() }
  ) {
    super(message);
    this.name = this.constructor.name;
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context
    };
  }
}

class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  
  constructor(
    message: string,
    public readonly field?: string,
    context?: ErrorContext
  ) {
    super(message, context);
  }
}

class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
  
  constructor(
    resource: string,
    context?: ErrorContext
  ) {
    super(`${resource} not found`, context);
  }
}

// Type-safe error handling
function handleAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message);
  }
  
  return new AppError('Unknown error occurred');
}

// Usage
function updateUser(id: string, data: UpdateUserData): User {
  if (!data.email) {
    throw new ValidationError('Email is required', 'email', {
      userId: id,
      action: 'updateUser'
    });
  }
  
  const user = findUser(id);
  if (!user) {
    throw new NotFoundError('User', {
      userId: id,
      action: 'updateUser'
    });
  }
  
  // Update logic
  return user;
}
```

**❌ Non-Type-Safe Approach:**
```typescript
// Generic error handling without types
function processRequest(data: any) {
  try {
    // Processing logic
  } catch (error: any) {
    // No type safety, could be anything
    throw new Error(error.message || 'Unknown error');
  }
}

// Inconsistent error types
class GenericError extends Error {
  constructor(message: string, public code: any) {
    // 'code' could be any type
    super(message);
  }
}
```

### 2. Union Types for Error Results

Use union types to represent operations that can either succeed or fail.

**✅ Union Types for Results:**
```typescript
type Result<T, E = AppError> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

// Generic result type
function safeDivide(a: number, b: number): Result<number> {
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

// Usage
const result = safeDivide(10, 2);
if (result.success) {
  console.log(`Result: ${result.data}`);
} else {
  console.error(`Error: ${result.error.message}`);
}

// Async result type
type AsyncResult<T, E = AppError> = Promise<Result<T, E>>;

async function fetchUser(id: string): AsyncResult<User> {
  try {
    const user = await database.users.findById(id);
    if (!user) {
      return {
        success: false,
        error: new NotFoundError('User', { userId: id })
      };
    }
    
    return {
      success: true,
      data: user
    };
  } catch (error) {
    return {
      success: false,
      error: new AppError('Database query failed')
    };
  }
}

// Usage
const userResult = await fetchUser('123');
if (userResult.success) {
  console.log(`User: ${userResult.data.name}`);
} else {
  console.error(`Failed to fetch user: ${userResult.error.message}`);
}
```

**❌ Poor Result Handling:**
```typescript
// Throwing errors instead of returning results
async function fetchUser(id: string): Promise<User> {
  const user = await database.users.findById(id);
  if (!user) {
    throw new Error('User not found'); // Forces caller to use try-catch
  }
  return user;
}

// Caller must handle errors
try {
  const user = await fetchUser('123');
  console.log(user.name);
} catch (error) {
  console.error('Failed to fetch user');
}
```

### 3. Error Type Guards

Create type guards to safely check error types.

**✅ Error Type Guards:**
```typescript
// Type guards for error checking
function isValidationError(error: AppError): error is ValidationError {
  return error.code === 'VALIDATION_ERROR';
}

function isNotFoundError(error: AppError): error is NotFoundError {
  return error.code === 'NOT_FOUND';
}

function isNetworkError(error: AppError): error is NetworkError {
  return error.code === 'NETWORK_ERROR';
}

// Usage with type guards
function handleUserError(error: AppError) {
  if (isValidationError(error)) {
    // TypeScript knows this is ValidationError
    console.log(`Validation error in field: ${error.field}`);
    return { type: 'validation', field: error.field };
  }
  
  if (isNotFoundError(error)) {
    // TypeScript knows this is NotFoundError
    console.log(`Resource not found: ${error.message}`);
    return { type: 'not_found' };
  }
  
  if (isNetworkError(error)) {
    // TypeScript knows this is NetworkError
    console.log(`Network error: ${error.message}`);
    return { type: 'network', statusCode: error.statusCode };
  }
  
  // Fallback for unknown error types
  console.log(`Unknown error: ${error.message}`);
  return { type: 'unknown' };
}

// Usage
try {
  await updateUser('123', { email: '' });
} catch (error) {
  if (error instanceof AppError) {
    const errorInfo = handleUserError(error);
    console.log(`Error type: ${errorInfo.type}`);
  }
}
```

**❌ No Type Guards:**
```typescript
// Manual type checking without guards
function handleUserError(error: AppError) {
  if (error.code === 'VALIDATION_ERROR') {
    // TypeScript doesn't know this is ValidationError
    // Accessing error.field might cause type errors
    console.log(`Validation error in field: ${error.field}`); // Error: Property 'field' does not exist on type 'AppError'
  }
}
```

## Common Error Patterns

### 1. Validation Errors

Handle input validation errors with specific feedback.

**✅ Validation Error Pattern:**
```javascript
class ValidationErrors extends Error {
  constructor(message, errors) {
    super(message);
    this.name = 'ValidationErrors';
    this.errors = errors; // Array of field-specific errors
    this.code = 'VALIDATION_ERRORS';
  }
}

function validateUserRegistration(data) {
  const errors = [];
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address',
      code: 'INVALID_EMAIL'
    });
  }
  
  if (!data.password || data.password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters long',
      code: 'WEAK_PASSWORD'
    });
  }
  
  if (data.password !== data.confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Passwords do not match',
      code: 'PASSWORD_MISMATCH'
    });
  }
  
  if (errors.length > 0) {
    throw new ValidationErrors('Validation failed', errors);
  }
  
  return { valid: true };
}

// Usage
try {
  validateUserRegistration({
    email: 'invalid-email',
    password: '123',
    confirmPassword: '456'
  });
} catch (error) {
  if (error instanceof ValidationErrors) {
    error.errors.forEach(validationError => {
      console.log(`${validationError.field}: ${validationError.message}`);
    });
  }
}
```

### 2. Business Logic Errors

Handle business rule violations with clear messaging.

**✅ Business Logic Error Pattern:**
```javascript
class BusinessRuleError extends Error {
  constructor(message, rule, context = {}) {
    super(message);
    this.name = 'BusinessRuleError';
    this.rule = rule;
    this.context = context;
    this.code = 'BUSINESS_RULE_VIOLATION';
  }
}

class InsufficientFundsError extends BusinessRuleError {
  constructor(amount, balance, context = {}) {
    super(
      `Insufficient funds: trying to withdraw $${amount}, but balance is $${balance}`,
      'INSUFFICIENT_FUNDS',
      { ...context, amount, balance }
    );
  }
}

class AccountLockedError extends BusinessRuleError {
  constructor(lockReason, context = {}) {
    super(
      `Account is locked: ${lockReason}`,
      'ACCOUNT_LOCKED',
      { ...context, lockReason }
    );
  }
}

// Usage
function withdrawFromAccount(accountId, amount) {
  const account = getAccount(accountId);
  
  if (account.status === 'locked') {
    throw new AccountLockedError('Security violation detected', {
      accountId,
      amount
    });
  }
  
  if (account.balance < amount) {
    throw new InsufficientFundsError(amount, account.balance, {
      accountId,
      amount
    });
  }
  
  // Withdrawal logic
  account.balance -= amount;
  return account;
}
```

### 3. External Service Errors

Handle failures from external services gracefully.

**✅ External Service Error Pattern:**
```javascript
class ExternalServiceError extends Error {
  constructor(serviceName, operation, originalError, retryable = false) {
    super(`External service ${serviceName} failed during ${operation}`);
    this.name = 'ExternalServiceError';
    this.serviceName = serviceName;
    this.operation = operation;
    this.originalError = originalError;
    this.retryable = retryable;
    this.code = 'EXTERNAL_SERVICE_ERROR';
    this.timestamp = new Date().toISOString();
  }
}

class TimeoutError extends ExternalServiceError {
  constructor(serviceName, operation, timeout) {
    super(
      serviceName,
      operation,
      new Error(`Request timed out after ${timeout}ms`),
      true // Timeout errors are usually retryable
    );
    this.name = 'TimeoutError';
    this.timeout = timeout;
  }
}

// Usage
async function callExternalAPI(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      timeout: 5000
    });
    
    if (!response.ok) {
      throw new ExternalServiceError(
        'API Service',
        'HTTP Request',
        new Error(`HTTP ${response.status}: ${response.statusText}`),
        response.status >= 500 // Server errors might be retryable
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ExternalServiceError(
        'Network',
        'Connection',
        error,
        true // Network errors are usually retryable
      );
    }
    
    throw error;
  }
}

// Error handling with retry logic
async function callWithRetry(fn, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (error instanceof ExternalServiceError && error.retryable && i < maxRetries) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`Retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      break; // Don't retry or max retries reached
    }
  }
  
  throw lastError;
}
```

## Best Practices Summary

1. **Create specific error types**: Don't use generic Error objects
2. **Use meaningful error codes**: Enable programmatic error handling
3. **Include context**: Provide sufficient information for debugging
4. **Maintain error hierarchy**: Use inheritance for related error types
5. **Use type-safe patterns**: Leverage TypeScript for better error handling
6. **Implement error boundaries**: Catch and handle errors at appropriate levels
7. **Log errors appropriately**: Include context without sensitive data
8. **Provide user-friendly messages**: Show meaningful errors to users
9. **Implement retry logic**: Handle transient failures gracefully
10. **Monitor error patterns**: Track and analyze errors for improvements

## Examples in Context

### E-commerce Application
```javascript
// E-commerce specific error types
class PaymentError extends AppError {
  constructor(message, paymentMethod, context = {}) {
    super(message, { ...context, paymentMethod });
    this.name = 'PaymentError';
    this.code = 'PAYMENT_ERROR';
  }
}

class InventoryError extends AppError {
  constructor(productIds, context = {}) {
    super('Insufficient inventory for one or more items', {
      ...context,
      productIds
    });
    this.name = 'InventoryError';
    this.code = 'INVENTORY_ERROR';
  }
}

class ShippingError extends AppError {
  constructor(address, context = {}) {
    super('Unable to ship to the specified address', {
      ...context,
      address
    });
    this.name = 'ShippingError';
    this.code = 'SHIPPING_ERROR';
  }
}

// Usage in checkout flow
async function processCheckout(cart, paymentInfo, shippingAddress) {
  try {
    // Validate inventory
    const available = await checkInventory(cart.items);
    if (!available) {
      throw new InventoryError(cart.items.map(item => item.productId));
    }
    
    // Process payment
    const paymentResult = await processPayment(paymentInfo);
    if (!paymentResult.success) {
      throw new PaymentError(paymentResult.message, paymentInfo.method, {
        cartId: cart.id,
        amount: cart.total
      });
    }
    
    // Validate shipping
    const shippingValid = await validateShippingAddress(shippingAddress);
    if (!shippingValid) {
      throw new ShippingError(shippingAddress, {
        cartId: cart.id,
        userId: cart.userId
      });
    }
    
    // Complete order
    return await createOrder(cart, paymentResult, shippingAddress);
  } catch (error) {
    // Handle specific error types
    if (error instanceof InventoryError) {
      return { success: false, error: 'Some items are out of stock' };
    }
    
    if (error instanceof PaymentError) {
      return { success: false, error: 'Payment processing failed' };
    }
    
    if (error instanceof ShippingError) {
      return { success: false, error: 'Shipping address is not valid' };
    }
    
    throw error; // Re-throw unexpected errors
  }
}
```

### API Development
```javascript
// API-specific error types
class APIError extends AppError {
  constructor(message, statusCode, context = {}) {
    super(message, context);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = 'API_ERROR';
  }
}

class RateLimitError extends APIError {
  constructor(limit, resetTime, context = {}) {
    super('Rate limit exceeded', 429, {
      ...context,
      limit,
      resetTime
    });
    this.name = 'RateLimitError';
    this.code = 'RATE_LIMIT_EXCEEDED';
  }
}

class AuthenticationError extends APIError {
  constructor(message = 'Authentication required', context = {}) {
    super(message, 401, context);
    this.name = 'AuthenticationError';
    this.code = 'AUTH_REQUIRED';
  }
}

// API error middleware
function createErrorMiddleware() {
  return (error, req, res, next) => {
    // Log error with context
    logger.error('API Error', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      userId: req.user?.id,
      ip: req.ip
    });
    
    // Handle specific error types
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: {
          code: error.code,
          message: error.message,
          field: error.field,
          context: error.context
        }
      });
    }
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({
        error: {
          code: error.code,
          message: error.message,
          context: error.context
        }
      });
    }
    
    if (error instanceof RateLimitError) {
      return res.status(429).json({
        error: {
          code: error.code,
          message: error.message,
          limit: error.limit,
          resetTime: error.resetTime
        }
      });
    }
    
    // Generic server error
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        requestId: req.id
      }
    });
  };
}
```

### Data Processing
```javascript
// Data processing error types
class DataValidationError extends AppError {
  constructor(message, record, field, context = {}) {
    super(message, {
      ...context,
      record,
      field,
      timestamp: new Date().toISOString()
    });
    this.name = 'DataValidationError';
    this.code = 'DATA_VALIDATION_ERROR';
  }
}

class DataTransformationError extends AppError {
  constructor(transformer, originalError, context = {}) {
    super(`Data transformation failed in ${transformer}`, {
      ...context,
      transformer,
      originalError: originalError.message
    });
    this.name = 'DataTransformationError';
    this.code = 'DATA_TRANSFORMATION_ERROR';
  }
}

class DataImportError extends AppError {
  constructor(source, recordCount, failedRecords, context = {}) {
    super(`Failed to import ${failedRecords.length} out of ${recordCount} records from ${source}`, {
      ...context,
      source,
      recordCount,
      failedRecords,
      successRate: ((recordCount - failedRecords.length) / recordCount) * 100
    });
    this.name = 'DataImportError';
    this.code = 'DATA_IMPORT_ERROR';
  }
}

// Usage in data pipeline
class DataProcessor {
  constructor() {
    this.validators = [];
    this.transformers = [];
  }
  
  addValidator(validator) {
    this.validators.push(validator);
    return this;
  }
  
  addTransformer(transformer) {
    this.transformers.push(transformer);
    return this;
  }
  
  async processRecords(records) {
    const results = {
      success: [],
      failed: [],
      errors: []
    };
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      let processedRecord = record;
      
      try {
        // Validate record
        for (const validator of this.validators) {
          const validation = await validator.validate(record);
          if (!validation.valid) {
            throw new DataValidationError(
              validation.message,
              record,
              validation.field,
              { recordIndex: i }
            );
          }
        }
        
        // Transform record
        for (const transformer of this.transformers) {
          try {
            processedRecord = await transformer.transform(processedRecord);
          } catch (error) {
            throw new DataTransformationError(
              transformer.name,
              error,
              { recordIndex: i, originalRecord: record }
            );
          }
        }
        
        results.success.push(processedRecord);
      } catch (error) {
        results.failed.push(record);
        results.errors.push({
          recordIndex: i,
          error: error.message,
          code: error.code,
          context: error.context
        });
      }
    }
    
    if (results.failed.length > 0) {
      throw new DataImportError(
        'data_processor',
        records.length,
        results.failed,
        { processedAt: new Date().toISOString() }
      );
    }
    
    return results.success;
  }
}
```

Remember: Proper error classification and handling is essential for building robust applications. Use specific error types, provide meaningful context, and implement appropriate recovery strategies to create a better user experience and easier debugging.