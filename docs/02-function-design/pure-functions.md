# Pure Functions

## Overview

Pure functions are functions that always produce the same output for the same input and have no side effects. They are a fundamental concept in functional programming and lead to more predictable, testable, and maintainable code.

## Core Principles

### 1. Deterministic Output

A pure function always returns the same result when given the same arguments.

**❌ Bad (Not Pure):**
```javascript
let counter = 0;

function addWithCounter(value) {
  return value + counter++; // Different output each time
}

function getCurrentTime() {
  return new Date(); // Different output each time
}

function getRandomNumber() {
  return Math.random(); // Different output each time
}
```

**✅ Good (Pure):**
```javascript
function add(a, b) {
  return a + b; // Always same output for same inputs
}

function multiplyByTwo(value) {
  return value * 2; // Always same output for same input
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // Same output for same input
}
```

### 2. No Side Effects

Pure functions don't modify external state or perform I/O operations.

**❌ Bad (Has Side Effects):**
```javascript
let globalState = {};

function updateUser(name, email) {
  globalState.user = { name, email }; // Modifies global state
  localStorage.setItem('user', JSON.stringify({ name, email })); // I/O operation
  console.log('User updated'); // I/O operation
  return { name, email };
}

function saveToDatabase(user) {
  database.save('users', user); // I/O operation
  return user;
}
```

**✅ Good (No Side Effects):**
```javascript
function createUser(name, email) {
  return { name, email, createdAt: new Date() }; // No external modifications
}

function validateUser(user) {
  return {
    valid: user.name && user.email && user.email.includes('@'),
    errors: []
  };
}
```

### 3. No External Dependencies

Pure functions don't depend on external variables or state.

**❌ Bad (External Dependencies):**
```javascript
const taxRate = 0.08;

function calculateTotalWithTax(amount) {
  return amount * (1 + taxRate); // Depends on external variable
}

function getConfigValue(key) {
  return config[key]; // Depends on external config
}

function getCurrentUser() {
  return this.currentUser; // Depends on external state
}
```

**✅ Good (No External Dependencies):**
```javascript
function calculateTotalWithTax(amount, taxRate) {
  return amount * (1 + taxRate); // All dependencies passed as parameters
}

function getConfigValue(config, key) {
  return config[key]; // Config passed as parameter
}

function getCurrentUser(session) {
  return session.user; // Session passed as parameter
}
```

## Benefits of Pure Functions

### 1. Predictability

Pure functions are predictable and easier to reason about.

**✅ Example:**
```javascript
function calculateDiscount(price, discountRate) {
  return price * discountRate;
}

// These calls will always produce the same results
const discount1 = calculateDiscount(100, 0.1); // 10
const discount2 = calculateDiscount(100, 0.1); // 10
const discount3 = calculateDiscount(100, 0.1); // 10
```

### 2. Testability

Pure functions are easy to test because they don't require setup or teardown.

**✅ Example:**
```javascript
// Pure function
function formatCurrency(amount, currency = 'USD') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  });
  return formatter.format(amount);
}

// Easy to test
describe('formatCurrency', () => {
  test('formats USD correctly', () => {
    expect(formatCurrency(100)).toBe('$100.00');
    expect(formatCurrency(99.99)).toBe('$99.99');
  });
  
  test('formats EUR correctly', () => {
    expect(formatCurrency(100, 'EUR')).toBe('€100.00');
  });
});
```

### 3. Memoization

Pure functions can be memoized for performance optimization.

**✅ Example:**
```javascript
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

const memoizedFibonacci = memoize((n) => {
  if (n <= 1) return n;
  return memoizedFibonacci(n - 1) + memoizedFibonacci(n - 2);
});

// Fast computation due to memoization
console.log(memoizedFibonacci(50)); // Computed quickly
```

### 4. Parallelization

Pure functions can be safely executed in parallel.

**✅ Example:**
```javascript
function processItem(item) {
  return {
    id: item.id,
    processed: true,
    value: item.value * 2
  };
}

// Can be safely parallelized
const results = items.map(processItem);

// Or with Promise.all for async operations
const asyncResults = await Promise.all(
  items.map(async (item) => processItem(item))
);
```

## Converting Impure to Pure Functions

### 1. Remove External Dependencies

**Before:**
```javascript
const config = { taxRate: 0.08, discountRate: 0.1 };

function calculateTotal(amount) {
  return amount * (1 + config.taxRate) - config.discountRate;
}
```

**After:**
```javascript
function calculateTotal(amount, taxRate, discountRate) {
  return amount * (1 + taxRate) - discountRate;
}

// Usage
const total = calculateTotal(100, 0.08, 0.1);
```

### 2. Eliminate Side Effects

**Before:**
```javascript
let userHistory = [];

function createUser(name, email) {
  const user = { id: generateId(), name, email, createdAt: new Date() };
  userHistory.push(user); // Side effect
  return user;
}
```

**After:**
```javascript
function createUser(name, email) {
  return { id: generateId(), name, email, createdAt: new Date() };
}

function addUserToHistory(user, history) {
  return [...history, user]; // Returns new array instead of mutating
}

// Usage
const user = createUser('John', 'john@example.com');
userHistory = addUserToHistory(user, userHistory);
```

### 3. Make Dependencies Explicit

**Before:**
```javascript
function processOrder(order) {
  const tax = order.total * TAX_RATE; // External dependency
  saveToDatabase(order); // Side effect
  sendEmail(order.user.email); // Side effect
  return order.total + tax;
}
```

**After:**
```javascript
function calculateOrderTotal(order, taxRate) {
  return order.total * (1 + taxRate);
}

function processOrder(order, taxRate, database, emailService) {
  const total = calculateOrderTotal(order, taxRate);
  const processedOrder = { ...order, total };
  
  return {
    order: processedOrder,
    actions: [
      () => database.save('orders', processedOrder),
      () => emailService.send(processedOrder.user.email, 'Order processed')
    ]
  };
}
```

## Pure Function Patterns

### 1. Data Transformation

**✅ Examples:**
```javascript
function mapArray(array, mapper) {
  return array.map(mapper);
}

function filterArray(array, predicate) {
  return array.filter(predicate);
}

function sortArray(array, comparator) {
  return [...array].sort(comparator);
}

function reduceArray(array, reducer, initialValue) {
  return array.reduce(reducer, initialValue);
}

// Usage
const numbers = [1, 2, 3, 4, 5];
const doubled = mapArray(numbers, x => x * 2); // [2, 4, 6, 8, 10]
const evens = filterArray(numbers, x => x % 2 === 0); // [2, 4]
const sorted = sortArray(numbers, (a, b) => b - a); // [5, 4, 3, 2, 1]
const sum = reduceArray(numbers, (acc, x) => acc + x, 0); // 15
```

### 2. Validation

**✅ Examples:**
```javascript
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    valid: emailRegex.test(email),
    errors: emailRegex.test(email) ? [] : ['Invalid email format']
  };
}

function validateUser(user) {
  const errors = [];
  
  if (!user.name || user.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  if (!user.email || !validateEmail(user.email).valid) {
    errors.push('Invalid email');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// Usage
const result = validateUser({ name: 'John', email: 'john@example.com' });
console.log(result.valid); // true
```

### 3. Calculations

**✅ Examples:**
```javascript
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function calculateTax(amount, rate) {
  return amount * rate;
}

function calculateDiscount(amount, percentage) {
  return amount * (percentage / 100);
}

function calculateShipping(weight, distance, rate) {
  return weight * distance * rate;
}

// Usage
const items = [
  { price: 10, quantity: 2 },
  { price: 5, quantity: 3 }
];
const subtotal = calculateTotal(items); // 35
const tax = calculateTax(subtotal, 0.08); // 2.8
const total = subtotal + tax; // 37.8
```

## TypeScript-Specific Considerations

### 1. Type Annotations

Use types to enforce purity constraints.

**✅ Examples:**
```typescript
// Pure function type
type PureFunction<T, U> = (input: T) => U;

// Function that takes dependencies as parameters
type PureWithDependencies<T, U, D> = (input: T, dependencies: D) => U;

// Example usage
const calculateTotal: PureFunction<Item[], number> = (items) => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

const validateUser: PureWithDependencies<User, ValidationResult, ValidationRules> = 
  (user, rules) => {
    // Implementation
    return { valid: true, errors: [] };
  };
```

### 2. Readonly Types

Use readonly types to prevent mutations.

**✅ Examples:**
```typescript
interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

// Pure function with readonly input
function processUser(user: Readonly<User>): ProcessedUser {
  return {
    id: user.id,
    name: user.name.toUpperCase(),
    email: user.email.toLowerCase(),
    processedAt: new Date()
  };
}
```

### 3. Immutability

Use immutable data structures and operations.

**✅ Examples:**
```typescript
// Immutable update
function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates };
}

// Immutable array operations
function addItem<T>(array: readonly T[], item: T): T[] {
  return [...array, item];
}

function removeItem<T>(array: readonly T[], index: number): T[] {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

// Usage
const users: readonly User[] = [{ id: '1', name: 'John', email: 'john@example.com' }];
const updatedUsers = addItem(users, { id: '2', name: 'Jane', email: 'jane@example.com' });
```

## Common Pitfalls and Solutions

### 1. Accidental Mutations

**❌ Bad:**
```javascript
function addItemToArray(array, item) {
  array.push(item); // Mutates input
  return array;
}
```

**✅ Good:**
```javascript
function addItemToArray(array, item) {
  return [...array, item]; // Returns new array
}
```

### 2. Hidden Dependencies

**❌ Bad:**
```javascript
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }); // Depends on system locale
}
```

**✅ Good:**
```javascript
function formatDate(date, locale = 'en-US', options = {}) {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  });
}
```

### 3. Async Operations

**❌ Bad:**
```javascript
async function fetchUserData(id) {
  const response = await fetch(`/api/users/${id}`);
  return response.json(); // I/O operation
}
```

**✅ Good:**
```javascript
function createFetchUserData(fetchFn) {
  return async function fetchUserData(id) {
    const response = await fetchFn(`/api/users/${id}`);
    return response.json();
  };
}

// Usage
const fetchUserData = createFetchUserData(fetch);
```

### 4. Randomness

**❌ Bad:**
```javascript
function generateId() {
  return Math.random().toString(36).substr(2, 9); // Not deterministic
}
```

**✅ Good:**
```javascript
function generateId(randomFn = Math.random) {
  return randomFn().toString(36).substr(2, 9);
}

// For testing
const mockRandom = () => 0.5;
const testId = generateId(mockRandom); // Predictable
```

## Best Practices Summary

1. **Deterministic output**: Same input always produces same output
2. **No side effects**: Don't modify external state or perform I/O
3. **No external dependencies**: Pass all dependencies as parameters
4. **Immutable data**: Don't mutate input parameters
5. **Clear contracts**: Use type annotations and documentation
6. **Testable**: Easy to test with simple input/output assertions
7. **Composable**: Can be combined with other pure functions
8. **Memoizable**: Can be cached for performance

## Examples in Context

### E-commerce Application
```javascript
// Pure functions for e-commerce
function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function calculateTax(amount, taxRate) {
  return amount * taxRate;
}

function calculateDiscount(amount, discountRate) {
  return amount * discountRate;
}

function calculateShipping(weight, distance, baseRate) {
  return weight * distance * baseRate;
}

function calculateOrderTotal(items, taxRate, discountRate, shippingConfig) {
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal, taxRate);
  const discount = calculateDiscount(subtotal, discountRate);
  const shipping = calculateShipping(
    shippingConfig.weight, 
    shippingConfig.distance, 
    shippingConfig.baseRate
  );
  
  return {
    subtotal,
    tax,
    discount,
    shipping,
    total: subtotal + tax - discount + shipping
  };
}

// Usage
const items = [
  { price: 25.99, quantity: 2 },
  { price: 15.50, quantity: 1 }
];

const pricing = calculateOrderTotal(items, 0.08, 0.1, {
  weight: 2.5,
  distance: 100,
  baseRate: 0.01
});

console.log(pricing.total); // Deterministic result
```

### API Development
```javascript
// Pure functions for API processing
function validateRequest(request, schema) {
  const errors = [];
  
  for (const [field, validator] of Object.entries(schema)) {
    if (!validator(request[field])) {
      errors.push(`${field} is invalid`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

function transformRequest(request, transformers) {
  return Object.entries(request).reduce((result, [key, value]) => {
    const transformer = transformers[key];
    result[key] = transformer ? transformer(value) : value;
    return result;
  }, {});
}

function buildResponse(data, status = 200, message = 'Success') {
  return {
    status,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

// Usage in API endpoint
function handleUserRequest(request) {
  const validation = validateRequest(request.body, {
    email: (email) => email && email.includes('@'),
    name: (name) => name && name.length >= 2
  });
  
  if (!validation.valid) {
    return buildResponse(null, 400, 'Validation failed');
  }
  
  const userData = transformRequest(request.body, {
    email: (email) => email.toLowerCase(),
    name: (name) => name.trim()
  });
  
  const user = createUser(userData);
  return buildResponse(user, 201, 'User created successfully');
}
```

### Data Processing
```javascript
// Pure functions for data processing
function filterData(data, predicate) {
  return data.filter(predicate);
}

function mapData(data, mapper) {
  return data.map(mapper);
}

function sortData(data, comparator) {
  return [...data].sort(comparator);
}

function aggregateData(data, aggregator, initialValue) {
  return data.reduce(aggregator, initialValue);
}

function processData(rawData, options = {}) {
  const {
    filters = [],
    mappers = [],
    sorters = [],
    aggregators = []
  } = options;
  
  let result = rawData;
  
  // Apply filters
  if (filters.length > 0) {
    result = filterData(result, item => filters.every(filter => filter(item)));
  }
  
  // Apply mappers
  if (mappers.length > 0) {
    result = mapData(result, item => mappers.reduce((acc, mapper) => mapper(acc), item));
  }
  
  // Apply sorters
  if (sorters.length > 0) {
    result = sortData(result, (a, b) => {
      for (const sorter of sorters) {
        const comparison = sorter(a, b);
        if (comparison !== 0) return comparison;
      }
      return 0;
    });
  }
  
  // Apply aggregators
  if (aggregators.length > 0) {
    result = aggregators.reduce((acc, aggregator) => aggregator(acc), result);
  }
  
  return result;
}

// Usage
const processedData = processData(rawData, {
  filters: [item => item.status === 'active'],
  mappers: [
    item => ({ ...item, formattedDate: formatDate(item.date) }),
    item => ({ ...item, displayName: `${item.firstName} ${item.lastName}` })
  ],
  sorters: [sortByDate, sortByName],
  aggregators: [calculateTotal, calculateAverage]
});
```

Remember: Pure functions are the foundation of reliable, testable, and maintainable code. Strive to make as many functions pure as possible, and isolate side effects when they're necessary.