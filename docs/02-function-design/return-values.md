# Return Values

## Overview

Return values are how functions communicate their results back to the caller. Well-designed return values make functions predictable, testable, and easy to use. This section covers best practices for designing function return values.

## Core Principles

### 1. Be Consistent with Return Types

Functions should always return the same type of value to make them predictable.

**❌ Bad:**
```javascript
function findUser(id) {
  const user = database.find(id);
  if (user) {
    return user; // Returns object
  } else {
    return null; // Returns null
  }
}

function processOrder(order) {
  if (order.isValid) {
    return order.id; // Returns string
  } else {
    return false; // Returns boolean
  }
}
```

**✅ Good:**
```javascript
function findUser(id) {
  const user = database.find(id);
  return user || null; // Always returns User | null
}

function processOrder(order) {
  if (order.isValid) {
    return { success: true, orderId: order.id }; // Always returns object
  } else {
    return { success: false, error: 'Invalid order' }; // Always returns object
  }
}
```

### 2. Return Early and Often

Use early returns to reduce nesting and improve readability.

**❌ Bad:**
```javascript
function validateUser(user) {
  if (user) {
    if (user.isActive) {
      if (user.email) {
        if (isValidEmail(user.email)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}
```

**✅ Good:**
```javascript
function validateUser(user) {
  if (!user) return false;
  if (!user.isActive) return false;
  if (!user.email) return false;
  if (!isValidEmail(user.email)) return false;
  
  return true;
}
```

### 3. Use Meaningful Return Values

Return values should clearly indicate the result and provide useful information.

**❌ Bad:**
```javascript
function createUser(userData) {
  // ... validation and processing
  if (success) {
    return true; // What does true mean?
  } else {
    return false; // What went wrong?
  }
}
```

**✅ Good:**
```javascript
function createUser(userData) {
  // ... validation and processing
  if (success) {
    return {
      success: true,
      user: createdUser,
      message: 'User created successfully'
    };
  } else {
    return {
      success: false,
      error: 'Email already exists',
      code: 'EMAIL_EXISTS'
    };
  }
}
```

### 4. Avoid Side Effects in Return Values

Functions should not modify external state as part of their return value.

**❌ Bad:**
```javascript
function calculateTotal(items) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  
  // Side effect: modifying external state
  this.lastCalculatedTotal = total;
  this.updateUI(total);
  
  return total;
}
```

**✅ Good:**
```javascript
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Separate function for side effects
function updateCalculationUI(total) {
  this.lastCalculatedTotal = total;
  this.updateUI(total);
}
```

## Return Value Patterns

### 1. Result Pattern

Return a consistent structure that indicates success/failure and provides relevant data.

**✅ Examples:**
```javascript
function findUser(id) {
  try {
    const user = database.find(id);
    if (user) {
      return {
        success: true,
        data: user,
        message: 'User found'
      };
    } else {
      return {
        success: false,
        data: null,
        message: 'User not found'
      };
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      message: 'Database error',
      error: error.message
    };
  }
}

// Usage
const result = findUser('user123');
if (result.success) {
  console.log('Found user:', result.data);
} else {
  console.error('Error:', result.message);
}
```

### 2. Optional Pattern

Use null/undefined to indicate absence of a value.

**✅ Examples:**
```javascript
function findProductById(id) {
  return products.find(product => product.id === id) || null;
}

function getConfigValue(key) {
  return config[key] || null;
}

function getCurrentUser() {
  return this.currentUser || null;
}

// Usage with optional chaining
const userName = findUser('user123')?.name;
const configValue = getConfigValue('theme') || 'default';
```

### 3. Promise Pattern

For asynchronous operations, always return promises.

**✅ Examples:**
```javascript
function fetchUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('User not found');
      }
      return response.json();
    })
    .then(data => ({
      success: true,
      data: data,
      message: 'User data fetched successfully'
    }))
    .catch(error => ({
      success: false,
      data: null,
      message: 'Failed to fetch user data',
      error: error.message
    }));
}

// Usage
fetchUserData('user123')
  .then(result => {
    if (result.success) {
      console.log('User:', result.data);
    } else {
      console.error('Error:', result.message);
    }
  });
```

### 4. Generator Pattern

Use generators for functions that produce multiple values.

**✅ Examples:**
```javascript
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

function* filterArray(array, predicate) {
  for (const item of array) {
    if (predicate(item)) {
      yield item;
    }
  }
}

// Usage
const fibSequence = fibonacci();
console.log(fibSequence.next().value); // 0
console.log(fibSequence.next().value); // 1
console.log(fibSequence.next().value); // 1

const evenNumbers = filterArray([1, 2, 3, 4, 5, 6], x => x % 2 === 0);
for (const num of evenNumbers) {
  console.log(num); // 2, 4, 6
}
```

## TypeScript-Specific Considerations

### 1. Type Annotations

Use clear type annotations for return values.

**✅ Examples:**
```typescript
function findUser(id: string): User | null {
  return users.find(user => user.id === id) || null;
}

function createUser(userData: CreateUserRequest): CreateUserResult {
  // Implementation
  return {
    success: true,
    user: createdUser,
    message: 'User created successfully'
  };
}

interface CreateUserResult {
  success: boolean;
  user: User;
  message: string;
}

function calculateTotal(items: Product[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### 2. Union Types

Use union types to indicate multiple possible return types.

**✅ Examples:**
```typescript
type ValidationResult = 
  | { success: true; data: ValidData }
  | { success: false; error: string };

function validateInput(input: string): ValidationResult {
  if (input.length > 0) {
    return { success: true, data: { value: input } };
  } else {
    return { success: false, error: 'Input cannot be empty' };
  }
}

// Usage with type guards
function processInput(input: string) {
  const result = validateInput(input);
  if (result.success) {
    // TypeScript knows result.data is ValidData here
    console.log('Valid input:', result.data.value);
  } else {
    // TypeScript knows result.error is string here
    console.error('Invalid input:', result.error);
  }
}
```

### 3. Async Return Types

Use proper async return types for asynchronous functions.

**✅ Examples:**
```typescript
async function fetchUserData(id: string): Promise<User | null> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) return null;
  return response.json();
}

async function processOrder(order: Order): Promise<ProcessResult> {
  try {
    const result = await saveOrder(order);
    await sendConfirmationEmail(order);
    return { success: true, orderId: result.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

interface ProcessResult {
  success: boolean;
  orderId?: string;
  error?: string;
}
```

### 4. Never Type

Use `never` type for functions that never return.

**✅ Examples:**
```typescript
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {
    // Do something forever
  }
}

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

// Usage in exhaustive checks
type Shape = 'circle' | 'square' | 'triangle';

function getArea(shape: Shape): number {
  switch (shape) {
    case 'circle':
      return Math.PI * 10 * 10;
    case 'square':
      return 10 * 10;
    case 'triangle':
      return 0.5 * 10 * 10;
    default:
      return assertNever(shape); // TypeScript error if new shape added
  }
}
```

## Common Pitfalls and Solutions

### 1. Inconsistent Return Types

**❌ Bad:**
```javascript
function processPayment(amount) {
  if (amount > 0) {
    return true; // Boolean
  } else {
    return 'Invalid amount'; // String
  }
}
```

**✅ Good:**
```javascript
function processPayment(amount) {
  if (amount > 0) {
    return { success: true, amount: amount };
  } else {
    return { success: false, error: 'Invalid amount' };
  }
}
```

### 2. Returning Undefined

**❌ Bad:**
```javascript
function findItem(items, predicate) {
  for (const item of items) {
    if (predicate(item)) {
      return item;
    }
  }
  // Implicit undefined return
}
```

**✅ Good:**
```javascript
function findItem(items, predicate) {
  for (const item of items) {
    if (predicate(item)) {
      return item;
    }
  }
  return null; // Explicit null return
}
```

### 3. Complex Return Objects

**❌ Bad:**
```javascript
function processOrder(order) {
  return {
    success: true,
    orderId: '123',
    user: { id: 'user123', name: 'John' },
    items: [{ id: 'item1', name: 'Product' }],
    total: 100,
    tax: 8,
    shipping: 5,
    discount: 0,
    createdAt: new Date(),
    status: 'pending'
    // Too much information in return value
  };
}
```

**✅ Good:**
```javascript
function processOrder(order) {
  const result = {
    success: true,
    orderId: '123',
    total: 100,
    status: 'pending'
  };
  
  // Use separate functions for detailed information
  logOrderDetails(order, result);
  notifyOrderCreated(order, result);
  
  return result;
}
```

### 4. Side Effects in Return

**❌ Bad:**
```javascript
function calculateTotal(items) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  
  // Side effect in return
  this.lastTotal = total;
  this.updateDisplay(total);
  
  return total;
}
```

**✅ Good:**
```javascript
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

function updateDisplayWithTotal(total) {
  this.lastTotal = total;
  this.updateDisplay(total);
}
```

## Best Practices Summary

1. **Consistent return types**: Always return the same type
2. **Early returns**: Use guard clauses to reduce nesting
3. **Meaningful values**: Return useful information, not just booleans
4. **No side effects**: Return values should not modify external state
5. **Handle errors gracefully**: Return error information, don't throw
6. **Use appropriate patterns**: Result, Optional, Promise, or Generator patterns
7. **Type annotations**: Use TypeScript for better documentation
8. **Document return values**: Add JSDoc comments for complex returns

## Examples in Context

### E-commerce Application
```javascript
// Good return value design for e-commerce
function checkout(cartData) {
  const validation = validateCart(cartData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
      code: 'INVALID_CART'
    };
  }
  
  const pricing = calculatePricing(cartData);
  const order = createOrder(cartData, pricing);
  
  return {
    success: true,
    orderId: order.id,
    total: pricing.total,
    items: order.items.length,
    estimatedDelivery: order.estimatedDelivery
  };
}

function validateCart(cartData) {
  if (!cartData.items || cartData.items.length === 0) {
    return { success: false, error: 'Cart is empty' };
  }
  
  if (!cartData.shippingAddress) {
    return { success: false, error: 'Shipping address required' };
  }
  
  return { success: true };
}

// Usage
const result = checkout(cartData);
if (result.success) {
  console.log(`Order ${result.orderId} placed successfully for $${result.total}`);
} else {
  console.error(`Checkout failed: ${result.error}`);
}
```

### API Development
```javascript
// Good return value design for API endpoints
async function handleUserRequest(request) {
  const userId = extractUserId(request);
  
  if (!userId) {
    return {
      success: false,
      status: 400,
      error: 'User ID required',
      data: null
    };
  }
  
  const user = await getUserById(userId);
  
  if (!user) {
    return {
      success: false,
      status: 404,
      error: 'User not found',
      data: null
    };
  }
  
  return {
    success: true,
    status: 200,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

// Usage in route handler
app.get('/api/users/:id', async (req, res) => {
  const result = await handleUserRequest(req);
  
  if (result.success) {
    res.status(result.status).json(result.data);
  } else {
    res.status(result.status).json({ error: result.error });
  }
});
```

### Data Processing
```javascript
// Good return value design for data processing
function processData(data, options = {}) {
  const {
    filters = [],
    sorters = [],
    transformers = [],
    aggregators = []
  } = options;
  
  let result = data;
  let metadata = {
    originalCount: data.length,
    filteredCount: 0,
    errors: []
  };
  
  // Apply filters
  if (filters.length > 0) {
    const filtered = [];
    for (const item of result) {
      try {
        if (filters.every(filter => filter(item))) {
          filtered.push(item);
        }
      } catch (error) {
        metadata.errors.push(`Filter error: ${error.message}`);
      }
    }
    result = filtered;
    metadata.filteredCount = result.length;
  }
  
  // Apply sorters
  if (sorters.length > 0) {
    try {
      result.sort((a, b) => {
        for (const sorter of sorters) {
          const comparison = sorter(a, b);
          if (comparison !== 0) return comparison;
        }
        return 0;
      });
    } catch (error) {
      metadata.errors.push(`Sort error: ${error.message}`);
    }
  }
  
  // Apply transformers
  if (transformers.length > 0) {
    const transformed = [];
    for (const item of result) {
      try {
        const transformedItem = transformers.reduce((acc, transformer) => transformer(acc), item);
        transformed.push(transformedItem);
      } catch (error) {
        metadata.errors.push(`Transform error: ${error.message}`);
      }
    }
    result = transformed;
  }
  
  return {
    success: metadata.errors.length === 0,
    data: result,
    metadata: metadata
  };
}

// Usage
const result = processData(rawData, {
  filters: [item => item.status === 'active'],
  sorters: [sortByDate],
  transformers: [addFormattedDate]
});

if (result.success) {
  console.log('Processed data:', result.data);
} else {
  console.warn('Processing completed with errors:', result.metadata.errors);
}
```

Remember: Return values are the contract between your function and its callers. Design them carefully to make your functions predictable, testable, and easy to use.