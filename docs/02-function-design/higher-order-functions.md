# Higher-Order Functions

## Overview

Higher-order functions are functions that take other functions as arguments or return functions as results. They are a powerful concept in functional programming that enables code reuse, abstraction, and composition.

## Core Principles

### 1. Functions as First-Class Citizens

In JavaScript/TypeScript, functions are first-class objects that can be assigned to variables, passed as arguments, and returned from other functions.

**✅ Examples:**
```javascript
// Assign function to variable
const greet = function(name) {
  return `Hello, ${name}!`;
};

// Pass function as argument
function processUser(user, processor) {
  return processor(user);
}

const result = processUser({ name: 'John' }, greet); // "Hello, John!"

// Return function from function
function createMultiplier(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

### 2. Function Composition

Combine simple functions to build more complex operations.

**✅ Examples:**
```javascript
// Simple functions
function addOne(x) {
  return x + 1;
}

function multiplyByTwo(x) {
  return x * 2;
}

function square(x) {
  return x * x;
}

// Composition function
function compose(...functions) {
  return function(value) {
    return functions.reduceRight((acc, fn) => fn(acc), value);
  };
}

// Create composed function
const processNumber = compose(square, multiplyByTwo, addOne);

console.log(processNumber(3)); // ((3 + 1) * 2)² = 64

// Alternative: pipe (left-to-right composition)
function pipe(...functions) {
  return function(value) {
    return functions.reduce((acc, fn) => fn(acc), value);
  };
}

const processNumberPipe = pipe(addOne, multiplyByTwo, square);
console.log(processNumberPipe(3)); // ((3 + 1) * 2)² = 64
```

### 3. Currying

Transform functions with multiple arguments into a sequence of single-argument functions.

**✅ Examples:**
```javascript
// Original function
function add(a, b, c) {
  return a + b + c;
}

// Curried version
function curryAdd(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

// Usage
const add5 = curryAdd(5);
const add5And10 = add5(10);
console.log(add5And10(3)); // 18

// More practical example
function createValidator(predicate, errorMessage) {
  return function(value) {
    if (predicate(value)) {
      return { valid: true, value: value };
    } else {
      return { valid: false, error: errorMessage };
    }
  };
}

const validateEmail = createValidator(
  email => email.includes('@'),
  'Invalid email format'
);

const validateAge = createValidator(
  age => age >= 18,
  'Must be at least 18 years old'
);

console.log(validateEmail('user@example.com')); // { valid: true, value: 'user@example.com' }
console.log(validateAge(16)); // { valid: false, error: 'Must be at least 18 years old' }
```

### 4. Partial Application

Create new functions by pre-filling some arguments of an existing function.

**✅ Examples:**
```javascript
// Original function
function calculateTotal(basePrice, taxRate, discount) {
  return basePrice * (1 + taxRate) - discount;
}

// Partial application using bind
const calculateWithTax = calculateTotal.bind(null, 100, 0.08);
console.log(calculateWithTax(5)); // 100 * 1.08 - 5 = 103

// Partial application using closure
function partial(fn, ...presetArgs) {
  return function(...remainingArgs) {
    return fn(...presetArgs, ...remainingArgs);
  };
}

const calculateWithBasePrice = partial(calculateTotal, 100);
console.log(calculateWithBasePrice(0.08, 5)); // 103

// Practical example: API endpoint creation
function createApiEndpoint(baseUrl, headers) {
  return function(endpoint, method = 'GET', data = null) {
    const url = `${baseUrl}${endpoint}`;
    const config = { method, headers };
    
    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }
    
    return fetch(url, config);
  };
}

const api = createApiEndpoint('https://api.example.com', {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer token123'
});

const getUser = api.bind(null, '/users', 'GET');
const createUser = api.bind(null, '/users', 'POST');
```

## Common Higher-Order Functions

### 1. Array Methods

JavaScript's built-in array methods are excellent examples of higher-order functions.

**✅ Examples:**
```javascript
const numbers = [1, 2, 3, 4, 5];

// map: transform each element
const doubled = numbers.map(x => x * 2); // [2, 4, 6, 8, 10]

// filter: select elements based on condition
const evens = numbers.filter(x => x % 2 === 0); // [2, 4]

// reduce: accumulate values
const sum = numbers.reduce((acc, x) => acc + x, 0); // 15

// find: find first matching element
const firstEven = numbers.find(x => x % 2 === 0); // 2

// some: check if any element matches
const hasNegative = numbers.some(x => x < 0); // false

// every: check if all elements match
const allPositive = numbers.every(x => x > 0); // true

// sort: sort elements
const sorted = numbers.slice().sort((a, b) => b - a); // [5, 4, 3, 2, 1]
```

### 2. Custom Higher-Order Functions

Create your own higher-order functions for specific use cases.

**✅ Examples:**
```javascript
// Retry function with exponential backoff
function withRetry(fn, maxRetries = 3, delay = 1000) {
  return async function(...args) {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn(...args);
      } catch (error) {
        if (i === maxRetries) throw error;
        
        console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  };
}

// Usage
const fetchWithRetry = withRetry(fetch, 3, 1000);
const response = await fetchWithRetry('https://api.example.com/data');

// Debounce function
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Usage
const debouncedSearch = debounce(searchFunction, 300);
input.addEventListener('input', debouncedSearch);

// Throttle function
function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Usage
const throttledScroll = throttle(handleScroll, 100);
window.addEventListener('scroll', throttledScroll);
```

### 3. Function Factories

Create functions that generate other functions.

**✅ Examples:**
```javascript
// Logger factory
function createLogger(prefix) {
  return function(message, level = 'info') {
    console.log(`[${new Date().toISOString()}] [${prefix}] [${level.toUpperCase()}] ${message}`);
  };
}

const userLogger = createLogger('USER');
const paymentLogger = createLogger('PAYMENT');

userLogger('User logged in'); // [2023-01-01T12:00:00.000Z] [USER] [INFO] User logged in
paymentLogger('Payment processed', 'error'); // [2023-01-01T12:00:00.000Z] [PAYMENT] [ERROR] Payment processed

// Validator factory
function createValidator(rules) {
  return function(value) {
    const errors = [];
    
    for (const [ruleName, rule] of Object.entries(rules)) {
      if (!rule(value)) {
        errors.push(ruleName);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  };
}

const emailValidator = createValidator({
  required: value => value && value.length > 0,
  format: value => value.includes('@'),
  domain: value => value.endsWith('@company.com')
});

console.log(emailValidator('user@company.com')); // { valid: true, errors: [] }
console.log(emailValidator('invalid-email')); // { valid: false, errors: ['format', 'domain'] }

// Cache factory
function createCache(maxSize = 100) {
  const cache = new Map();
  
  return {
    get(key) {
      return cache.get(key);
    },
    
    set(key, value) {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
      return value;
    },
    
    has(key) {
      return cache.has(key);
    },
    
    clear() {
      cache.clear();
    },
    
    size() {
      return cache.size;
    }
  };
}

const userCache = createCache(50);
const productCache = createCache(100);
```

## TypeScript-Specific Considerations

### 1. Type Annotations for Higher-Order Functions

Use proper type annotations to maintain type safety.

**✅ Examples:**
```typescript
// Function that takes a function as parameter
function processArray<T, U>(
  array: T[],
  processor: (item: T) => U
): U[] {
  return array.map(processor);
}

// Function that returns a function
function createAdder(base: number): (value: number) => number {
  return function(value: number): number {
    return base + value;
  };
}

// Generic higher-order function
type Predicate<T> = (item: T) => boolean;

function filterArray<T>(array: T[], predicate: Predicate<T>): T[] {
  return array.filter(predicate);
}

// Usage
const numbers: number[] = [1, 2, 3, 4, 5];
const evenNumbers = filterArray(numbers, x => x % 2 === 0);
```

### 2. Function Overloading

Use overloading for higher-order functions with different signatures.

**✅ Examples:**
```typescript
// Overloaded map function
function map<T, U>(array: T[], callback: (item: T, index: number) => U): U[];
function map<T, U>(object: Record<string, T>, callback: (value: T, key: string) => U): U[];
function map<T, U>(
  input: T[] | Record<string, T>,
  callback: (item: T, indexOrKey: number | string) => U
): U[] {
  if (Array.isArray(input)) {
    return input.map(callback as (item: T, index: number) => U);
  } else {
    return Object.entries(input).map(([key, value]) => 
      callback(value, key)
    );
  }
}

// Usage
const numbers = [1, 2, 3];
const doubled = map(numbers, x => x * 2); // [2, 4, 6]

const userScores = { john: 85, jane: 92, bob: 78 };
const gradedScores = map(userScores, (score, name) => `${name}: ${score >= 90 ? 'A' : 'B'}`);
```

### 3. Generic Constraints

Use constraints to ensure type safety in generic higher-order functions.

**✅ Examples:**
```typescript
interface Comparable<T> {
  compareTo(other: T): number;
}

function sortArray<T extends Comparable<T>>(array: T[]): T[] {
  return array.sort((a, b) => a.compareTo(b));
}

interface User {
  id: string;
  name: string;
  email: string;
}

function createFilter<T extends Record<string, any>>(
  field: keyof T,
  value: any
): (item: T) => boolean {
  return (item: T) => item[field] === value;
}

// Usage
const users: User[] = [
  { id: '1', name: 'John', email: 'john@example.com' },
  { id: '2', name: 'Jane', email: 'jane@example.com' }
];

const filterByName = createFilter<User>('name', 'John');
const johnUsers = users.filter(filterByName); // [{ id: '1', name: 'John', email: 'john@example.com' }]
```

## Common Patterns and Use Cases

### 1. Middleware Pattern

Use higher-order functions to create middleware chains.

**✅ Examples:**
```javascript
// Middleware factory
function createMiddleware(name, handler) {
  return function(next) {
    return async function(context) {
      console.log(`Starting ${name}`);
      const result = await handler(context);
      const nextResult = await next(result);
      console.log(`Finished ${name}`);
      return nextResult;
    };
  };
}

// Middleware functions
const authMiddleware = createMiddleware('auth', async (context) => {
  if (!context.user) {
    throw new Error('Authentication required');
  }
  return context;
});

const loggingMiddleware = createMiddleware('logging', async (context) => {
  console.log(`Processing request for ${context.user?.name}`);
  return context;
});

const validationMiddleware = createMiddleware('validation', async (context) => {
  if (!context.data || Object.keys(context.data).length === 0) {
    throw new Error('Invalid request data');
  }
  return context;
});

// Chain middleware
function composeMiddleware(...middlewares) {
  return middlewares.reduceRight((next, middleware) => middleware(next), (context) => context);
}

const pipeline = composeMiddleware(
  authMiddleware,
  loggingMiddleware,
  validationMiddleware
);

// Usage
const requestHandler = async (context) => {
  return { success: true, data: 'Processed successfully' };
};

const finalHandler = pipeline(requestHandler);
```

### 2. Strategy Pattern

Use higher-order functions to implement the strategy pattern.

**✅ Examples:**
```javascript
// Strategy factory
function createSortStrategy(comparator) {
  return function(array) {
    return [...array].sort(comparator);
  };
}

// Different strategies
const sortByAge = createSortStrategy((a, b) => a.age - b.age);
const sortByName = createSortStrategy((a, b) => a.name.localeCompare(b.name));
const sortByDate = createSortStrategy((a, b) => new Date(a.date) - new Date(b.date));

// Usage
const users = [
  { name: 'John', age: 30, date: '2023-01-15' },
  { name: 'Jane', age: 25, date: '2023-01-10' },
  { name: 'Bob', age: 35, date: '2023-01-20' }
];

console.log(sortByAge(users)); // Sorted by age
console.log(sortByName(users)); // Sorted by name
console.log(sortByDate(users)); // Sorted by date

// Payment strategy
function createPaymentProcessor(processor) {
  return function(amount, currency) {
    return processor.process(amount, currency);
  };
}

const paypalProcessor = createPaymentProcessor({
  process: (amount, currency) => `Processing ${amount} ${currency} via PayPal`
});

const stripeProcessor = createPaymentProcessor({
  process: (amount, currency) => `Processing ${amount} ${currency} via Stripe`
});

console.log(paypalProcessor(100, 'USD')); // Processing 100 USD via PayPal
console.log(stripeProcessor(50, 'EUR')); // Processing 50 EUR via Stripe
```

### 3. Decorator Pattern

Use higher-order functions to create decorators that enhance function behavior.

**✅ Examples:**
```javascript
// Timing decorator
function withTiming(fn) {
  return function(...args) {
    const start = performance.now();
    const result = fn.apply(this, args);
    const end = performance.now();
    console.log(`${fn.name} took ${end - start}ms`);
    return result;
  };
}

// Usage
const expensiveCalculation = withTiming(function(n) {
  let result = 0;
  for (let i = 0; i < n; i++) {
    result += Math.random();
  }
  return result;
});

expensiveCalculation(1000000); // Logs timing information

// Retry decorator
function withRetry(maxRetries = 3, delay = 1000) {
  return function(targetFn) {
    return async function(...args) {
      for (let i = 0; i <= maxRetries; i++) {
        try {
          return await targetFn.apply(this, args);
        } catch (error) {
          if (i === maxRetries) throw error;
          
          console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    };
  };
}

// Usage
const fetchWithRetry = withRetry(3, 1000)(fetch);
const response = await fetchWithRetry('https://api.example.com/data');

// Validation decorator
function withValidation(validator) {
  return function(targetFn) {
    return function(...args) {
      const validationResult = validator(...args);
      if (!validationResult.valid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }
      return targetFn.apply(this, args);
    };
  };
}

const validateUserInput = withValidation((name, email) => ({
  valid: name && name.length > 0 && email && email.includes('@'),
  errors: []
}));

const createUser = validateUserInput(function(name, email) {
  return { name, email, id: Math.random().toString(36) };
});
```

## Best Practices Summary

1. **Use built-in array methods**: Leverage map, filter, reduce, etc.
2. **Create reusable functions**: Design higher-order functions for common patterns
3. **Maintain type safety**: Use TypeScript for proper type annotations
4. **Compose functions**: Build complex operations from simple functions
5. **Use currying for partial application**: Create specialized functions from general ones
6. **Implement middleware patterns**: Use for request processing, validation, etc.
7. **Create decorators**: Enhance function behavior without modifying original code
8. **Document function signatures**: Clearly indicate what functions expect and return

## Examples in Context

### E-commerce Application
```javascript
// Higher-order functions for e-commerce
function createDiscountCalculator(baseRate) {
  return function(items, user) {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const discountRate = user.isPremium ? baseRate * 1.5 : baseRate;
    return subtotal * discountRate;
  };
}

const calculateStandardDiscount = createDiscountCalculator(0.1);
const calculatePremiumDiscount = createDiscountCalculator(0.15);

function createShippingCalculator(baseRate) {
  return function(weight, distance, user) {
    const rate = user.isPremium ? baseRate * 0.8 : baseRate;
    return weight * distance * rate;
  };
}

const calculateStandardShipping = createShippingCalculator(0.01);
const calculatePremiumShipping = createShippingCalculator(0.008);

// Order processor factory
function createOrderProcessor(discountCalculator, shippingCalculator) {
  return function(order) {
    const discount = discountCalculator(order.items, order.user);
    const shipping = shippingCalculator(order.weight, order.distance, order.user);
    const subtotal = order.items.reduce((sum, item) => sum + item.price, 0);
    const total = subtotal - discount + shipping;
    
    return {
      ...order,
      discount,
      shipping,
      total
    };
  };
}

const processStandardOrder = createOrderProcessor(
  calculateStandardDiscount,
  calculateStandardShipping
);

const processPremiumOrder = createOrderProcessor(
  calculatePremiumDiscount,
  calculatePremiumShipping
);

// Usage
const order = {
  items: [{ price: 100 }, { price: 50 }],
  user: { isPremium: true },
  weight: 5,
  distance: 100
};

const processedOrder = processPremiumOrder(order);
```

### API Development
```javascript
// Higher-order functions for API middleware
function createAuthMiddleware(requiredRoles) {
  return function(next) {
    return async function(request) {
      const user = await authenticateUser(request.headers.authorization);
      
      if (!user) {
        return { status: 401, body: { error: 'Authentication required' } };
      }
      
      if (requiredRoles.length > 0 && !requiredRoles.some(role => user.roles.includes(role))) {
        return { status: 403, body: { error: 'Insufficient permissions' } };
      }
      
      return next({ ...request, user });
    };
  };
}

function createValidationMiddleware(schema) {
  return function(next) {
    return async function(request) {
      const validation = validateRequest(request.body, schema);
      
      if (!validation.valid) {
        return {
          status: 400,
          body: { error: 'Validation failed', details: validation.errors }
        };
      }
      
      return next(request);
    };
  };
}

function createLoggingMiddleware(logger) {
  return function(next) {
    return async function(request) {
      const startTime = Date.now();
      logger.info(`Request: ${request.method} ${request.path}`);
      
      const result = await next(request);
      
      const duration = Date.now() - startTime;
      logger.info(`Response: ${result.status} - ${duration}ms`);
      
      return result;
    };
  };
}

// Compose middleware
function composeMiddleware(...middlewares) {
  return middlewares.reduceRight((next, middleware) => middleware(next), (request) => request);
}

// Usage
const apiPipeline = composeMiddleware(
  createLoggingMiddleware(console),
  createValidationMiddleware(userSchema),
  createAuthMiddleware(['admin'])
);

const handleUserRequest = async (request) => {
  // Actual request handling logic
  return { status: 200, body: { message: 'Success' } };
};

const finalHandler = apiPipeline(handleUserRequest);
```

### Data Processing
```javascript
// Higher-order functions for data processing
function createDataProcessor(transformers) {
  return function(data) {
    return transformers.reduce((result, transformer) => transformer(result), data);
  };
}

const normalizeData = createDataProcessor([
  data => data.map(item => ({ ...item, name: item.name.trim() })),
  data => data.filter(item => item.active),
  data => data.sort((a, b) => a.name.localeCompare(b.name))
]);

function createAggregator(aggregationFn) {
  return function(data, key) {
    return data.reduce((result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  };
}

const groupByCategory = createAggregator((data, key) => data.reduce((result, item) => {
  const groupKey = item[key];
  if (!result[groupKey]) {
    result[groupKey] = [];
  }
  result[groupKey].push(item);
  return result;
}, {}));

function createAnalyzer(analyzers) {
  return function(data) {
    return analyzers.reduce((result, analyzer) => {
      return { ...result, ...analyzer(data) };
    }, {});
  };
}

const analyzeData = createAnalyzer([
  data => ({ count: data.length }),
  data => ({ average: data.reduce((sum, item) => sum + item.value, 0) / data.length }),
  data => ({ min: Math.min(...data.map(item => item.value)) }),
  data => ({ max: Math.max(...data.map(item => item.value)) })
]);

// Usage
const rawData = [
  { name: '  John  ', value: 100, category: 'A', active: true },
  { name: 'Jane', value: 200, category: 'B', active: true },
  { name: 'Bob', value: 150, category: 'A', active: false }
];

const processedData = normalizeData(rawData);
const groupedData = groupByCategory(processedData, 'category');
const analysis = analyzeData(processedData);
```

Remember: Higher-order functions enable powerful abstractions and code reuse. Use them to create flexible, composable, and maintainable code.