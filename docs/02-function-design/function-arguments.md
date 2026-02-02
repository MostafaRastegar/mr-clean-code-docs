# Function Arguments

## Overview

Function arguments are the inputs that functions receive to perform their operations. Well-designed function arguments make functions more flexible, testable, and maintainable. This section covers best practices for designing function parameters.

## Core Principles

### 1. Minimize Argument Count

The fewer arguments a function takes, the easier it is to understand, test, and use.

**❌ Bad:**
```javascript
function createUser(name, email, password, role, department, managerId, startDate, permissions, preferences) {
  // Function with too many arguments
}
```

**✅ Good:**
```javascript
function createUser(userData) {
  // Function with single argument object
}
```

### 2. Use Argument Objects for Related Parameters

Group related parameters into objects to improve readability and maintainability.

**❌ Bad:**
```javascript
function createOrder(userId, productId, quantity, shippingAddress, paymentMethod, couponCode, notes) {
  // Too many individual parameters
}
```

**✅ Good:**
```javascript
function createOrder(orderData) {
  const { userId, productId, quantity, shippingAddress, paymentMethod, couponCode, notes } = orderData;
  // Single parameter object
}

// Usage
createOrder({
  userId: 'user123',
  productId: 'prod456',
  quantity: 2,
  shippingAddress: {
    street: '123 Main St',
    city: 'Anytown',
    country: 'USA'
  },
  paymentMethod: 'credit_card',
  couponCode: 'SAVE10',
  notes: 'Leave at front door'
});
```

### 3. Use Default Parameters

Provide sensible defaults for optional parameters to reduce the number of arguments callers need to provide.

**✅ Examples:**
```javascript
function createUser(name, email, options = {}) {
  const {
    role = 'user',
    department = 'general',
    permissions = [],
    isActive = true
  } = options;
  
  return {
    id: generateId(),
    name,
    email,
    role,
    department,
    permissions,
    isActive,
    createdAt: new Date()
  };
}

// Usage
const user1 = createUser('John Doe', 'john@example.com');
const user2 = createUser('Jane Smith', 'jane@example.com', {
  role: 'admin',
  department: 'engineering'
});
```

### 4. Order Arguments Logically

Place required arguments first, followed by optional ones with defaults.

**✅ Examples:**
```javascript
// Good - required first, optional with defaults
function calculateTotal(items, taxRate = 0.08, discount = 0, shipping = 5.00) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 + taxRate) - discount + shipping;
}

// Good - primary argument first
function formatDate(date, format = 'YYYY-MM-DD', locale = 'en-US') {
  // Implementation
}

// Good - callback last (common convention)
function processData(data, options, callback) {
  // Implementation
}
```

## Argument Patterns

### 1. Options Object Pattern

Use an options object for functions with many optional parameters.

**✅ Examples:**
```javascript
function createUser(name, email, options = {}) {
  const defaultOptions = {
    role: 'user',
    department: 'general',
    permissions: [],
    isActive: true,
    sendWelcomeEmail: true,
    requireApproval: false
  };
  
  const config = { ...defaultOptions, ...options };
  
  // Implementation using config
  return {
    id: generateId(),
    name,
    email,
    ...config
  };
}

// Usage
createUser('John Doe', 'john@example.com');
createUser('Jane Smith', 'jane@example.com', {
  role: 'admin',
  sendWelcomeEmail: false
});
```

### 2. Builder Pattern

For complex objects, use a builder pattern to construct arguments.

**✅ Examples:**
```javascript
class OrderBuilder {
  constructor() {
    this.order = {
      items: [],
      shippingAddress: {},
      paymentMethod: null,
      couponCode: null
    };
  }
  
  addItem(product, quantity) {
    this.order.items.push({ product, quantity });
    return this;
  }
  
  setShippingAddress(address) {
    this.order.shippingAddress = address;
    return this;
  }
  
  setPaymentMethod(method) {
    this.order.paymentMethod = method;
    return this;
  }
  
  setCouponCode(code) {
    this.order.couponCode = code;
    return this;
  }
  
  build() {
    return this.order;
  }
}

// Usage
const order = new OrderBuilder()
  .addItem(product1, 2)
  .addItem(product2, 1)
  .setShippingAddress(address)
  .setPaymentMethod('credit_card')
  .setCouponCode('SAVE10')
  .build();

createOrder(order);
```

### 3. Callback Pattern

Use callbacks for asynchronous operations or when you need to customize behavior.

**✅ Examples:**
```javascript
function processData(data, options, callback) {
  try {
    const result = performProcessing(data, options);
    callback(null, result);
  } catch (error) {
    callback(error, null);
  }
}

// Usage
processData(data, options, (error, result) => {
  if (error) {
    console.error('Processing failed:', error);
  } else {
    console.log('Processing successful:', result);
  }
});

// Modern async/await version
async function processDataAsync(data, options) {
  try {
    const result = await performProcessingAsync(data, options);
    return result;
  } catch (error) {
    throw error;
  }
}
```

### 4. Strategy Pattern

Use function arguments to inject different behaviors.

**✅ Examples:**
```javascript
function sortData(data, comparator) {
  return data.sort(comparator);
}

// Different sorting strategies
const sortByAge = (a, b) => a.age - b.age;
const sortByName = (a, b) => a.name.localeCompare(b.name);
const sortByDate = (a, b) => new Date(a.date) - new Date(b.date);

// Usage
sortData(users, sortByAge);
sortData(users, sortByName);
sortData(users, sortByDate);

// Validation strategies
function validateData(data, validators) {
  return validators.map(validator => validator(data));
}

const emailValidator = (data) => /\S+@\S+\.\S+/.test(data.email);
const ageValidator = (data) => data.age >= 18;
const nameValidator = (data) => data.name.length > 0;

// Usage
validateData(userData, [emailValidator, ageValidator, nameValidator]);
```

## TypeScript-Specific Considerations

### 1. Type Annotations

Use clear type annotations for function arguments.

**✅ Examples:**
```typescript
function createUser(name: string, email: string, options?: CreateUserOptions): User {
  // Implementation
}

interface CreateUserOptions {
  role?: string;
  department?: string;
  permissions?: string[];
  isActive?: boolean;
}

function calculateTotal(items: Product[], taxRate: number = 0.08): number {
  return items.reduce((sum, item) => sum + item.price, 0) * (1 + taxRate);
}
```

### 2. Optional Parameters

Use optional parameters and default values appropriately.

**✅ Examples:**
```typescript
function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US',
  options?: CurrencyOptions
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    ...options
  });
  
  return formatter.format(amount);
}

interface CurrencyOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}
```

### 3. Rest Parameters

Use rest parameters for functions that accept variable numbers of arguments.

**✅ Examples:**
```typescript
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

function combineStrings(separator: string, ...strings: string[]): string {
  return strings.join(separator);
}

function logMessages(level: LogLevel, ...messages: any[]): void {
  console.log(`[${level}]`, ...messages);
}

type LogLevel = 'info' | 'warn' | 'error';
```

### 4. Function Overloading

Use overloading for functions with different argument patterns.

**✅ Examples:**
```typescript
function createLogger(name: string): Logger;
function createLogger(name: string, level: LogLevel): Logger;
function createLogger(name: string, config: LoggerConfig): Logger;
function createLogger(name: string, levelOrConfig?: LogLevel | LoggerConfig): Logger {
  if (typeof levelOrConfig === 'string') {
    return new Logger(name, levelOrConfig);
  } else {
    return new Logger(name, levelOrConfig?.level, levelOrConfig);
  }
}

interface LoggerConfig {
  level: LogLevel;
  format: string;
  destination: string;
}
```

## Common Pitfalls and Solutions

### 1. Too Many Arguments

**❌ Bad:**
```javascript
function createReport(title, data, format, includeCharts, includeSummary, sortBy, filterBy, groupBy, limit, offset) {
  // Function with too many arguments
}
```

**✅ Good:**
```javascript
function createReport(reportConfig) {
  const { title, data, format, includeCharts, includeSummary, sortBy, filterBy, groupBy, limit, offset } = reportConfig;
  // Single argument object
}

// Usage
createReport({
  title: 'Monthly Sales',
  data: salesData,
  format: 'PDF',
  includeCharts: true,
  includeSummary: true,
  sortBy: 'date',
  filterBy: { region: 'North' },
  groupBy: 'product',
  limit: 100,
  offset: 0
});
```

### 2. Inconsistent Parameter Order

**❌ Bad:**
```javascript
function createUser(name, email, options);
function updateUser(id, name, email, options);
function deleteUser(id, options, email); // Inconsistent order
```

**✅ Good:**
```javascript
function createUser(name, email, options);
function updateUser(id, name, email, options);
function deleteUser(id, options); // Consistent pattern
```

### 3. Boolean Arguments

**❌ Bad:**
```javascript
function createOrder(userId, items, true, false, true); // What do these booleans mean?
```

**✅ Good:**
```javascript
function createOrder(orderConfig) {
  const { userId, items, includeShipping, includeInsurance, sendConfirmation } = orderConfig;
  // Clear parameter names
}

// Usage
createOrder({
  userId: 'user123',
  items: products,
  includeShipping: true,
  includeInsurance: false,
  sendConfirmation: true
});
```

### 4. Null/Undefined Arguments

**❌ Bad:**
```javascript
function processPayment(amount, currency, null, null, callback); // Unclear what nulls represent
```

**✅ Good:**
```javascript
function processPayment(paymentConfig) {
  const { amount, currency, paymentMethod = 'credit_card', billingAddress, callback } = paymentConfig;
  // Clear defaults and optional parameters
}
```

## Best Practices Summary

1. **Minimize arguments**: 3-4 parameters maximum
2. **Use argument objects**: Group related parameters
3. **Provide defaults**: Use default parameters for optional values
4. **Order logically**: Required first, optional with defaults
5. **Use descriptive names**: Clear parameter names
6. **Avoid boolean flags**: Use named parameters instead
7. **Use rest parameters**: For variable argument lists
8. **Type annotations**: Use TypeScript for better documentation

## Examples in Context

### E-commerce Application
```javascript
// Good function design for e-commerce
function createOrder(orderData) {
  const {
    userId,
    items,
    shippingAddress,
    paymentMethod,
    couponCode,
    notes = '',
    sendConfirmation = true
  } = orderData;
  
  validateOrderData(orderData);
  const total = calculateOrderTotal(items, couponCode);
  const order = saveOrder({ userId, items, total, shippingAddress, paymentMethod, notes });
  
  if (sendConfirmation) {
    sendOrderConfirmation(order);
  }
  
  return order;
}

// Usage
createOrder({
  userId: 'user123',
  items: [
    { productId: 'prod1', quantity: 2, price: 25.00 },
    { productId: 'prod2', quantity: 1, price: 15.00 }
  ],
  shippingAddress: {
    street: '123 Main St',
    city: 'Anytown',
    country: 'USA'
  },
  paymentMethod: 'credit_card',
  couponCode: 'SAVE10',
  notes: 'Leave at front door',
  sendConfirmation: true
});
```

### API Development
```javascript
// Good function design for API endpoints
async function handleRequest(request, response, next) {
  try {
    const { userId, action, data, options = {} } = parseRequest(request);
    
    const user = await getUser(userId);
    if (!user) {
      return sendError(response, 'User not found', 404);
    }
    
    const permissions = await getUserPermissions(userId);
    if (!hasPermission(permissions, action)) {
      return sendError(response, 'Permission denied', 403);
    }
    
    const result = await executeAction(action, data, options);
    sendSuccess(response, result);
    
  } catch (error) {
    next(error);
  }
}

function parseRequest(request) {
  return {
    userId: request.headers['x-user-id'],
    action: {
      type: request.method,
      resource: request.path,
      data: request.body
    },
    data: request.body,
    options: {
      includeDetails: request.query.includeDetails === 'true',
      format: request.query.format || 'json',
      timeout: parseInt(request.query.timeout) || 30000
    }
  };
}
```

### Data Processing
```javascript
// Good function design for data processing
function processData(data, options = {}) {
  const {
    filters = [],
    sorters = [],
    transformers = [],
    aggregators = [],
    limit = null,
    offset = 0
  } = options;
  
  let result = data;
  
  // Apply filters
  if (filters.length > 0) {
    result = result.filter(item => filters.every(filter => filter(item)));
  }
  
  // Apply sorters
  if (sorters.length > 0) {
    result = result.sort((a, b) => {
      for (const sorter of sorters) {
        const comparison = sorter(a, b);
        if (comparison !== 0) return comparison;
      }
      return 0;
    });
  }
  
  // Apply transformers
  if (transformers.length > 0) {
    result = result.map(item => transformers.reduce((acc, transformer) => transformer(acc), item));
  }
  
  // Apply limit and offset
  if (limit !== null) {
    result = result.slice(offset, offset + limit);
  }
  
  // Apply aggregators
  if (aggregators.length > 0) {
    result = aggregators.reduce((acc, aggregator) => aggregator(acc), result);
  }
  
  return result;
}

// Usage
const processedData = processData(rawData, {
  filters: [
    item => item.status === 'active',
    item => item.createdAt > startDate
  ],
  sorters: [
    (a, b) => a.name.localeCompare(b.name),
    (a, b) => a.createdAt - b.createdAt
  ],
  transformers: [
    item => ({ ...item, formattedDate: formatDate(item.createdAt) }),
    item => ({ ...item, displayName: `${item.firstName} ${item.lastName}` })
  ],
  limit: 100,
  offset: 0
});
```

Remember: Well-designed function arguments make your code more readable, testable, and maintainable. Choose parameter patterns that clearly communicate intent and reduce cognitive load for developers using your functions.