# Error Handling

## Overview

Proper error handling is essential for building robust and maintainable applications. Good error handling makes your code more predictable, easier to debug, and provides better user experiences.

## Core Principles

### 1. Fail Fast and Fail Loudly

Detect and report errors as early as possible with clear, actionable messages.

**❌ Bad:**
```javascript
function processOrder(order) {
  // Silent failure - no error handling
  const user = database.findUser(order.userId);
  const product = database.findProduct(order.productId);
  
  // Continue processing even if user or product is null
  return {
    orderId: generateId(),
    total: product.price * order.quantity
  };
}
```

**✅ Good:**
```javascript
function processOrder(order) {
  if (!order.userId) {
    throw new Error('Order must have a valid userId');
  }
  
  if (!order.productId) {
    throw new Error('Order must have a valid productId');
  }
  
  if (!order.quantity || order.quantity <= 0) {
    throw new Error('Order quantity must be greater than 0');
  }
  
  const user = database.findUser(order.userId);
  if (!user) {
    throw new Error(`User with ID ${order.userId} not found`);
  }
  
  const product = database.findProduct(order.productId);
  if (!product) {
    throw new Error(`Product with ID ${order.productId} not found`);
  }
  
  if (product.inventory < order.quantity) {
    throw new Error(`Insufficient inventory for product ${product.name}. Available: ${product.inventory}, Requested: ${order.quantity}`);
  }
  
  return {
    orderId: generateId(),
    userId: user.id,
    productId: product.id,
    quantity: order.quantity,
    total: product.price * order.quantity
  };
}
```

### 2. Use Appropriate Error Types

Choose the right error type for the situation to enable proper error handling.

**✅ Examples:**
```javascript
// Custom error classes
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class NotFoundError extends Error {
  constructor(message, resource) {
    super(message);
    this.name = 'NotFoundError';
    this.resource = resource;
  }
}

class NetworkError extends Error {
  constructor(message, url) {
    super(message);
    this.name = 'NetworkError';
    this.url = url;
  }
}

// Usage
function validateEmail(email) {
  if (!email) {
    throw new ValidationError('Email is required', 'email');
  }
  
  if (!email.includes('@')) {
    throw new ValidationError('Invalid email format', 'email');
  }
  
  return email;
}

function findUser(id) {
  const user = database.find(id);
  if (!user) {
    throw new NotFoundError(`User with ID ${id} not found`, 'User');
  }
  return user;
}

async function fetchUserData(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new NetworkError(`Failed to fetch user data: ${response.status}`, `/api/users/${id}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError('Network error occurred', `/api/users/${id}`);
  }
}
```

### 3. Provide Meaningful Error Messages

Error messages should be clear, specific, and actionable.

**❌ Bad:**
```javascript
throw new Error('Something went wrong');
throw new Error('Error occurred');
throw new Error('Invalid input');
```

**✅ Good:**
```javascript
throw new Error('User authentication failed: invalid credentials');
throw new Error('Database connection timeout after 30 seconds');
throw new Error('File upload failed: file size exceeds 10MB limit');
throw new Error('Payment processing failed: insufficient funds in account');
```

### 4. Handle Errors at the Right Level

Catch and handle errors at the appropriate level of abstraction.

**❌ Bad:**
```javascript
// Too low level - handling database errors in business logic
function processOrder(order) {
  try {
    const user = database.findUser(order.userId);
    const product = database.findProduct(order.productId);
    // ... processing logic
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Database connection failed');
    } else if (error.code === 'ENOTFOUND') {
      console.error('Database server not found');
    }
    throw error;
  }
}
```

**✅ Good:**
```javascript
// High-level error handling
function processOrder(order) {
  try {
    const user = findUser(order.userId);
    const product = findProduct(order.productId);
    return createOrder(user, product, order.quantity);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new Error(`Order validation failed: ${error.message}`);
    } else if (error instanceof NotFoundError) {
      throw new Error(`Order processing failed: ${error.message}`);
    } else {
      throw new Error(`Unexpected error during order processing: ${error.message}`);
    }
  }
}

// Low-level error handling
function findUser(id) {
  try {
    return database.findUser(id);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new DatabaseError('Database connection failed', error);
    } else if (error.code === 'ENOTFOUND') {
      throw new DatabaseError('Database server not found', error);
    }
    throw error;
  }
}
```

## Error Handling Patterns

### 1. Try-Catch-Finally Pattern

Use try-catch blocks for synchronous error handling and finally for cleanup.

**✅ Examples:**
```javascript
function processFile(filename) {
  let fileHandle = null;
  
  try {
    fileHandle = openFile(filename);
    const data = readFile(fileHandle);
    const processedData = processData(data);
    saveToFile(processedData);
    
    return { success: true, data: processedData };
  } catch (error) {
    console.error(`Error processing file ${filename}:`, error.message);
    return { success: false, error: error.message };
  } finally {
    // Always clean up resources
    if (fileHandle) {
      closeFile(fileHandle);
    }
  }
}

// Async version
async function processFileAsync(filename) {
  let fileHandle = null;
  
  try {
    fileHandle = await openFileAsync(filename);
    const data = await readFileAsync(fileHandle);
    const processedData = await processDataAsync(data);
    await saveToFileAsync(processedData);
    
    return { success: true, data: processedData };
  } catch (error) {
    console.error(`Error processing file ${filename}:`, error.message);
    return { success: false, error: error.message };
  } finally {
    // Always clean up resources
    if (fileHandle) {
      await closeFileAsync(fileHandle);
    }
  }
}
```

### 2. Result Pattern

Return result objects instead of throwing errors for expected failures.

**✅ Examples:**
```javascript
// Result type definition
class Result {
  constructor(success, data = null, error = null) {
    this.success = success;
    this.data = data;
    this.error = error;
  }
  
  static success(data) {
    return new Result(true, data);
  }
  
  static failure(error) {
    return new Result(false, null, error);
  }
}

// Usage
function findUser(id) {
  try {
    const user = database.findUser(id);
    if (!user) {
      return Result.failure(new NotFoundError(`User ${id} not found`));
    }
    return Result.success(user);
  } catch (error) {
    return Result.failure(new DatabaseError('Failed to find user', error));
  }
}

function processOrder(order) {
  const userResult = findUser(order.userId);
  if (!userResult.success) {
    return Result.failure(new ValidationError(`Invalid user: ${userResult.error.message}`));
  }
  
  const productResult = findProduct(order.productId);
  if (!productResult.success) {
    return Result.failure(new ValidationError(`Invalid product: ${productResult.error.message}`));
  }
  
  try {
    const order = createOrder(userResult.data, productResult.data, order.quantity);
    return Result.success(order);
  } catch (error) {
    return Result.failure(new BusinessError('Failed to create order', error));
  }
}

// Usage
const orderResult = processOrder(orderData);
if (orderResult.success) {
  console.log('Order created:', orderResult.data);
} else {
  console.error('Order failed:', orderResult.error.message);
}
```

### 3. Promise-Based Error Handling

Use proper error handling with Promises and async/await.

**✅ Examples:**
```javascript
// Async function with proper error handling
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new HttpError(`HTTP ${response.status}: ${response.statusText}`, response.status);
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    
    if (error.name === 'TypeError') {
      throw new NetworkError('Network connection failed', `/api/users/${userId}`);
    }
    
    throw new ApplicationError('Failed to fetch user data', error);
  }
}

// Promise chain with error handling
function processUserOrder(userId, orderId) {
  return fetchUserData(userId)
    .then(user => {
      if (!user.active) {
        throw new ValidationError('User account is not active');
      }
      return fetchOrderData(orderId);
    })
    .then(order => {
      if (order.status !== 'pending') {
        throw new BusinessError('Order is not in pending status');
      }
      return processOrder(order);
    })
    .catch(error => {
      if (error instanceof ValidationError) {
        return { success: false, error: `Validation failed: ${error.message}` };
      } else if (error instanceof BusinessError) {
        return { success: false, error: `Business rule violation: ${error.message}` };
      } else {
        return { success: false, error: `System error: ${error.message}` };
      }
    });
}

// Multiple async operations with error handling
async function processMultipleOrders(orderIds) {
  const results = [];
  
  for (const orderId of orderIds) {
    try {
      const result = await processOrder(orderId);
      results.push({ orderId, success: true, data: result });
    } catch (error) {
      results.push({ orderId, success: false, error: error.message });
    }
  }
  
  return results;
}
```

### 4. Global Error Handling

Implement global error handlers for uncaught errors.

**✅ Examples:**
```javascript
// Node.js global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log error, cleanup resources, and exit gracefully
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log error and handle appropriately
});

// Browser global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send error to logging service
  logErrorToService(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Send error to logging service
  logErrorToService(event.reason);
  event.preventDefault(); // Prevent default browser behavior
});

// Express.js error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  // Log error details
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  // Send appropriate error response
  if (error instanceof ValidationError) {
    res.status(400).json({ error: 'Validation failed', details: error.message });
  } else if (error instanceof NotFoundError) {
    res.status(404).json({ error: 'Resource not found', details: error.message });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## TypeScript-Specific Considerations

### 1. Error Type Definitions

Use TypeScript to define and enforce error types.

**✅ Examples:**
```typescript
// Error type definitions
interface AppError {
  name: string;
  message: string;
  code?: string;
  details?: any;
}

class ValidationError extends Error implements AppError {
  name = 'ValidationError';
  code = 'VALIDATION_ERROR';
  
  constructor(message: string, public field?: string, public value?: any) {
    super(message);
  }
}

class NotFoundError extends Error implements AppError {
  name = 'NotFoundError';
  code = 'NOT_FOUND';
  
  constructor(message: string, public resource?: string) {
    super(message);
  }
}

// Function with typed error handling
function processUser(user: User): Result<User, ValidationError | NotFoundError> {
  if (!user.email) {
    return Result.failure(new ValidationError('Email is required', 'email'));
  }
  
  if (!isValidEmail(user.email)) {
    return Result.failure(new ValidationError('Invalid email format', 'email', user.email));
  }
  
  const existingUser = findUserByEmail(user.email);
  if (existingUser) {
    return Result.failure(new ValidationError('Email already exists', 'email', user.email));
  }
  
  try {
    const savedUser = saveUser(user);
    return Result.success(savedUser);
  } catch (error) {
    if (error instanceof DatabaseError) {
      return Result.failure(new NotFoundError('Failed to save user', 'User'));
    }
    throw error;
  }
}
```

### 2. Async Error Handling

Use proper typing for async error handling.

**✅ Examples:**
```typescript
// Async function with error handling
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new HttpError(`HTTP ${response.status}: ${response.statusText}`, response.status);
    }
    
    const userData = await response.json();
    return userData as User;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    
    throw new ApplicationError('Failed to fetch user', error);
  }
}

// Error handling with union types
type AsyncResult<T> = 
  | { success: true; data: T }
  | { success: false; error: AppError };

async function processOrder(order: Order): Promise<AsyncResult<Order>> {
  try {
    const user = await fetchUser(order.userId);
    const product = await fetchProduct(order.productId);
    
    if (!user.active) {
      return { success: false, error: new ValidationError('User account is not active') };
    }
    
    if (product.inventory < order.quantity) {
      return { success: false, error: new BusinessError('Insufficient inventory') };
    }
    
    const processedOrder = await saveOrder({ ...order, status: 'processed' });
    return { success: true, data: processedOrder };
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error };
    }
    
    return { success: false, error: new ApplicationError('Order processing failed', error) };
  }
}
```

### 3. Error Boundaries (React)

Use error boundaries for React applications.

**✅ Examples:**
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>Something went wrong.</h2>
          <p>Please try refreshing the page or contact support.</p>
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Error details</summary>
              <pre>{this.state.error?.toString()}</pre>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary
  fallback={<div>Loading failed. Please try again.</div>}
  onError={(error, errorInfo) => {
    // Send error to logging service
    logErrorToService(error, errorInfo);
  }}
>
  <MyComponent />
</ErrorBoundary>
```

## Common Pitfalls and Solutions

### 1. Silent Failures

**❌ Bad:**
```javascript
function processPayment(amount) {
  try {
    chargeCustomer(amount);
  } catch (error) {
    // Silent failure - error is ignored
  }
}
```

**✅ Good:**
```javascript
function processPayment(amount) {
  try {
    return chargeCustomer(amount);
  } catch (error) {
    console.error('Payment processing failed:', error);
    throw new PaymentError('Failed to process payment', error);
  }
}
```

### 2. Generic Error Messages

**❌ Bad:**
```javascript
try {
  saveToDatabase(data);
} catch (error) {
  throw new Error('Something went wrong');
}
```

**✅ Good:**
```javascript
try {
  saveToDatabase(data);
} catch (error) {
  if (error.code === 'DUPLICATE_KEY') {
    throw new ValidationError('Duplicate record found', 'data');
  } else if (error.code === 'CONNECTION_TIMEOUT') {
    throw new DatabaseError('Database connection timeout', error);
  } else {
    throw new DatabaseError('Failed to save data to database', error);
  }
}
```

### 3. Catching Too Broadly

**❌ Bad:**
```javascript
try {
  riskyOperation();
} catch (error) {
  // Catches all errors, including programming errors
  console.log('An error occurred');
}
```

**✅ Good:**
```javascript
try {
  riskyOperation();
} catch (error) {
  if (error instanceof ExpectedError) {
    // Handle expected errors
    handleExpectedError(error);
  } else {
    // Re-throw unexpected errors
    throw error;
  }
}
```

### 4. Not Cleaning Up Resources

**❌ Bad:**
```javascript
async function processFile(filename) {
  const fileHandle = await openFile(filename);
  
  try {
    const data = await readFile(fileHandle);
    return processData(data);
  } catch (error) {
    throw error; // File handle is not closed
  }
}
```

**✅ Good:**
```javascript
async function processFile(filename) {
  let fileHandle = null;
  
  try {
    fileHandle = await openFile(filename);
    const data = await readFile(fileHandle);
    return processData(data);
  } catch (error) {
    throw error;
  } finally {
    if (fileHandle) {
      await closeFile(fileHandle);
    }
  }
}
```

## Best Practices Summary

1. **Fail fast**: Detect and report errors early
2. **Use specific error types**: Create custom error classes for different scenarios
3. **Provide meaningful messages**: Error messages should be clear and actionable
4. **Handle at appropriate level**: Match error handling to the abstraction level
5. **Use try-catch-finally**: Always clean up resources
6. **Implement global handlers**: Catch unhandled errors
7. **Log errors appropriately**: Use structured logging for debugging
8. **Return results for expected failures**: Use result pattern for business logic errors
9. **Use TypeScript for type safety**: Define error types and use proper typing
10. **Test error scenarios**: Include error cases in your tests

## Examples in Context

### E-commerce Application
```javascript
// Error handling for e-commerce operations
class OrderError extends Error {
  constructor(message, orderData) {
    super(message);
    this.name = 'OrderError';
    this.orderData = orderData;
  }
}

class PaymentError extends Error {
  constructor(message, paymentData) {
    super(message);
    this.name = 'PaymentError';
    this.paymentData = paymentData;
  }
}

async function processOrder(orderData) {
  try {
    // Validate order
    const validationResult = validateOrder(orderData);
    if (!validationResult.valid) {
      throw new OrderError(`Order validation failed: ${validationResult.errors.join(', ')}`, orderData);
    }
    
    // Check inventory
    const inventoryResult = await checkInventory(orderData.items);
    if (!inventoryResult.available) {
      throw new OrderError(`Insufficient inventory for items: ${inventoryResult.unavailable.join(', ')}`, orderData);
    }
    
    // Process payment
    const paymentResult = await processPayment(orderData.payment);
    if (!paymentResult.success) {
      throw new PaymentError(`Payment failed: ${paymentResult.error}`, orderData.payment);
    }
    
    // Create order
    const order = await createOrder({
      ...orderData,
      paymentId: paymentResult.paymentId,
      status: 'completed'
    });
    
    // Send confirmation
    await sendConfirmationEmail(order);
    
    return { success: true, order };
    
  } catch (error) {
    // Log error with context
    logger.error('Order processing failed', {
      error: error.message,
      orderData,
      stack: error.stack
    });
    
    // Handle specific error types
    if (error instanceof ValidationError) {
      return { success: false, error: `Validation error: ${error.message}` };
    } else if (error instanceof PaymentError) {
      return { success: false, error: `Payment error: ${error.message}` };
    } else if (error instanceof InventoryError) {
      return { success: false, error: `Inventory error: ${error.message}` };
    } else {
      return { success: false, error: `System error: ${error.message}` };
    }
  }
}
```

### API Development
```javascript
// Error handling for API endpoints
class ApiError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

class ValidationError extends ApiError {
  constructor(message, field = null) {
    super(message, 400, { field });
    this.name = 'ValidationError';
  }
}

class NotFoundError extends ApiError {
  constructor(message, resource = null) {
    super(message, 404, { resource });
    this.name = 'NotFoundError';
  }
}

// Middleware for error handling
function errorHandler(err, req, res, next) {
  console.error('API Error:', err);
  
  // Log error details
  logger.error('API Error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Handle specific error types
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      field: err.details.field
    });
  }
  
  if (err instanceof NotFoundError) {
    return res.status(404).json({
      error: 'Not Found',
      message: err.message,
      resource: err.details.resource
    });
  }
  
  // Default error response
  res.status(err.statusCode || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
}

// Route handler with error handling
app.post('/api/users', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters long', 'name');
    }
    
    if (!email || !isValidEmail(email)) {
      throw new ValidationError('Invalid email format', 'email');
    }
    
    if (!password || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long', 'password');
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError('Email already registered', 'email');
    }
    
    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: await hashPassword(password)
    });
    
    await user.save();
    
    // Return success response
    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    next(error);
  }
});
```

### Data Processing
```javascript
// Error handling for data processing pipelines
class DataProcessingError extends Error {
  constructor(message, data = null) {
    super(message);
    this.name = 'DataProcessingError';
    this.data = data;
  }
}

class TransformationError extends DataProcessingError {
  constructor(message, transformation, data) {
    super(message, data);
    this.name = 'TransformationError';
    this.transformation = transformation;
  }
}

class ValidationDataError extends DataProcessingError {
  constructor(message, field, value) {
    super(message);
    this.name = 'ValidationDataError';
    this.field = field;
    this.value = value;
  }
}

class Pipeline {
  constructor() {
    this.steps = [];
    this.errors = [];
  }
  
  addStep(name, processor) {
    this.steps.push({ name, processor });
    return this;
  }
  
  async process(data) {
    let result = data;
    
    for (const step of this.steps) {
      try {
        result = await step.processor(result);
      } catch (error) {
        const processingError = new TransformationError(
          `Failed to process step "${step.name}": ${error.message}`,
          step.name,
          result
        );
        
        this.errors.push(processingError);
        
        // Decide whether to continue or stop based on error type
        if (error instanceof CriticalError) {
          throw processingError;
        }
        
        // For non-critical errors, continue with original data
        continue;
      }
    }
    
    return {
      success: this.errors.length === 0,
      data: result,
      errors: this.errors
    };
  }
}

// Usage
const pipeline = new Pipeline()
  .addStep('validate', validateData)
  .addStep('transform', transformData)
  .addStep('enrich', enrichData)
  .addStep('validate', validateTransformedData);

async function processData(data) {
  try {
    const result = await pipeline.process(data);
    
    if (result.success) {
      console.log('Data processed successfully:', result.data);
      return result.data;
    } else {
      console.warn('Data processed with errors:', result.errors);
      return result.data; // Return partial result
    }
  } catch (error) {
    console.error('Pipeline failed:', error);
    throw error;
  }
}
```

Remember: Good error handling makes your application more robust, user-friendly, and easier to debug. Always handle errors gracefully and provide meaningful feedback to users and developers.