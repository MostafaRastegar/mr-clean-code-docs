# Function Length and Complexity

## Overview

Function length and complexity are critical factors in code maintainability. Short, focused functions are easier to understand, test, and debug. This section covers principles for writing functions that are the right size and complexity.

## Core Principles

### 1. Functions Should Be Small

The ideal function should be short enough to fit on one screen without scrolling.

**❌ Bad:**
```javascript
function processOrder(orderData) {
  // 50+ lines of complex logic
  // Validation
  if (!orderData.userId) {
    throw new Error('User ID is required');
  }
  if (!orderData.items || orderData.items.length === 0) {
    throw new Error('Order must have items');
  }
  
  // Calculate totals
  let subtotal = 0;
  for (let i = 0; i < orderData.items.length; i++) {
    const item = orderData.items[i];
    if (!item.productId || !item.quantity) {
      throw new Error('Invalid item');
    }
    // ... more complex logic
  }
  
  // Apply discounts
  let discount = 0;
  if (orderData.couponCode) {
    // ... complex discount logic
  }
  
  // Calculate taxes
  let tax = 0;
  // ... complex tax calculation
  
  // Save to database
  // ... database logic
  
  // Send notifications
  // ... notification logic
  
  return { orderId, total: subtotal - discount + tax };
}
```

**✅ Good:**
```javascript
function processOrder(orderData) {
  validateOrderData(orderData);
  
  const subtotal = calculateSubtotal(orderData.items);
  const discount = calculateDiscount(orderData.couponCode, subtotal);
  const tax = calculateTax(orderData.shippingAddress, subtotal - discount);
  
  const total = subtotal - discount + tax;
  const order = saveOrder(orderData, total);
  
  sendOrderConfirmation(order);
  
  return order;
}
```

### 2. Do One Thing

Each function should have a single responsibility and do it well.

**✅ Examples:**
```javascript
// Good - each function has a single responsibility
function validateOrderData(orderData) {
  if (!orderData.userId) {
    throw new Error('User ID is required');
  }
  if (!orderData.items || orderData.items.length === 0) {
    throw new Error('Order must have items');
  }
  orderData.items.forEach(validateOrderItem);
}

function calculateSubtotal(items) {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function calculateDiscount(couponCode, subtotal) {
  if (!couponCode) return 0;
  
  const discountRate = getDiscountRate(couponCode);
  return subtotal * discountRate;
}

function saveOrder(orderData, total) {
  const order = {
    id: generateOrderId(),
    userId: orderData.userId,
    items: orderData.items,
    total,
    createdAt: new Date()
  };
  
  return database.save('orders', order);
}
```

### 3. Use the 20-Line Rule

As a general guideline, functions should not exceed 20 lines of code.

**✅ Examples:**
```javascript
// Good - under 20 lines
function formatCurrency(amount, currency = 'USD') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  });
  
  return formatter.format(amount);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function capitalizeFirstLetter(string) {
  if (!string || string.length === 0) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}
```

## Function Complexity Guidelines

### 1. Cyclomatic Complexity

Keep cyclomatic complexity low by minimizing branching.

**❌ Bad (High Complexity):**
```javascript
function calculateShippingCost(order) {
  if (order.weight <= 0) {
    return 0;
  } else if (order.weight <= 1) {
    if (order.destination === 'local') {
      return 5.00;
    } else if (order.destination === 'national') {
      return 10.00;
    } else {
      return 20.00;
    }
  } else if (order.weight <= 5) {
    if (order.destination === 'local') {
      return 8.00;
    } else if (order.destination === 'national') {
      return 15.00;
    } else {
      return 30.00;
    }
  } else {
    if (order.destination === 'local') {
      return 12.00;
    } else if (order.destination === 'national') {
      return 25.00;
    } else {
      return 50.00;
    }
  }
}
```

**✅ Good (Lower Complexity):**
```javascript
function calculateShippingCost(order) {
  if (order.weight <= 0) return 0;
  
  const baseCost = getBaseShippingCost(order.weight);
  const multiplier = getDestinationMultiplier(order.destination);
  
  return baseCost * multiplier;
}

function getBaseShippingCost(weight) {
  if (weight <= 1) return 5.00;
  if (weight <= 5) return 8.00;
  return 12.00;
}

function getDestinationMultiplier(destination) {
  const multipliers = {
    local: 1.0,
    national: 2.0,
    international: 4.0
  };
  
  return multipliers[destination] || 1.0;
}
```

### 2. Nesting Depth

Limit nesting to 2-3 levels maximum.

**❌ Bad (Too Deep):**
```javascript
function processUserAction(user, action, data) {
  if (user) {
    if (user.isActive) {
      if (user.permissions) {
        if (user.permissions.includes(action.type)) {
          if (data) {
            if (validateData(data)) {
              return executeAction(user, action, data);
            } else {
              throw new Error('Invalid data');
            }
          } else {
            throw new Error('No data provided');
          }
        } else {
          throw new Error('Permission denied');
        }
      } else {
        throw new Error('No permissions defined');
      }
    } else {
      throw new Error('User is not active');
    }
  } else {
    throw new Error('User not found');
  }
}
```

**✅ Good (Shallow):**
```javascript
function processUserAction(user, action, data) {
  validateUser(user);
  validateAction(action, user);
  validateData(data);
  
  return executeAction(user, action, data);
}

function validateUser(user) {
  if (!user) throw new Error('User not found');
  if (!user.isActive) throw new Error('User is not active');
  if (!user.permissions) throw new Error('No permissions defined');
}

function validateAction(action, user) {
  if (!user.permissions.includes(action.type)) {
    throw new Error('Permission denied');
  }
}

function validateData(data) {
  if (!data) throw new Error('No data provided');
  if (!validateData(data)) throw new Error('Invalid data');
}
```

### 3. Parameter Count

Limit function parameters to 3-4 maximum.

**❌ Bad (Too Many Parameters):**
```javascript
function createUser(name, email, password, role, department, managerId, startDate, permissions) {
  // Complex function with many parameters
}
```

**✅ Good (Fewer Parameters):**
```javascript
function createUser(userData) {
  validateUserData(userData);
  const user = buildUser(userData);
  return saveUser(user);
}

function buildUser(userData) {
  return {
    id: generateId(),
    name: userData.name,
    email: userData.email,
    password: hashPassword(userData.password),
    role: userData.role,
    department: userData.department,
    managerId: userData.managerId,
    startDate: userData.startDate,
    permissions: userData.permissions || []
  };
}
```

## Refactoring Large Functions

### 1. Extract Method

Break down large functions into smaller, focused functions.

**Before:**
```javascript
function generateReport(data) {
  // 50+ lines of mixed logic
  const filteredData = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].status === 'active') {
      filteredData.push(data[i]);
    }
  }
  
  const sortedData = filteredData.sort((a, b) => a.date - b.date);
  
  let total = 0;
  for (let i = 0; i < sortedData.length; i++) {
    total += sortedData[i].amount;
  }
  
  return {
    data: sortedData,
    total: total,
    average: total / sortedData.length
  };
}
```

**After:**
```javascript
function generateReport(data) {
  const activeData = filterActiveItems(data);
  const sortedData = sortDataByDate(activeData);
  const total = calculateTotal(sortedData);
  const average = calculateAverage(total, sortedData.length);
  
  return {
    data: sortedData,
    total: total,
    average: average
  };
}

function filterActiveItems(data) {
  return data.filter(item => item.status === 'active');
}

function sortDataByDate(data) {
  return data.sort((a, b) => a.date - b.date);
}

function calculateTotal(data) {
  return data.reduce((sum, item) => sum + item.amount, 0);
}

function calculateAverage(total, count) {
  return count > 0 ? total / count : 0;
}
```

### 2. Extract Class

When a function has too many related variables, consider creating a class.

**Before:**
```javascript
function processOrder(orderData) {
  let subtotal = 0;
  let tax = 0;
  let shipping = 0;
  let discount = 0;
  let total = 0;
  
  // Complex calculations with many variables
  // ...
  
  return { subtotal, tax, shipping, discount, total };
}
```

**After:**
```javascript
class OrderProcessor {
  constructor(orderData) {
    this.orderData = orderData;
    this.subtotal = 0;
    this.tax = 0;
    this.shipping = 0;
    this.discount = 0;
    this.total = 0;
  }
  
  process() {
    this.calculateSubtotal();
    this.calculateTax();
    this.calculateShipping();
    this.calculateDiscount();
    this.calculateTotal();
    
    return this.getResult();
  }
  
  calculateSubtotal() {
    this.subtotal = this.orderData.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );
  }
  
  // ... other methods
}
```

### 3. Use Data Objects

Group related parameters into objects.

**Before:**
```javascript
function createUser(name, email, password, role, department, managerId, startDate) {
  // Function with many parameters
}
```

**After:**
```javascript
function createUser(userData) {
  const { name, email, password, role, department, managerId, startDate } = userData;
  // Function with single parameter object
}

// Usage
createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securepassword',
  role: 'developer',
  department: 'engineering',
  managerId: 'mgr123',
  startDate: new Date()
});
```

## TypeScript-Specific Considerations

### 1. Function Overloading

Use overloading to provide multiple function signatures.

**✅ Examples:**
```typescript
function formatValue(value: string): string;
function formatValue(value: number): string;
function formatValue(value: Date): string;
function formatValue(value: string | number | Date): string {
  if (typeof value === 'string') {
    return value.toUpperCase();
  } else if (typeof value === 'number') {
    return value.toFixed(2);
  } else {
    return value.toISOString();
  }
}
```

### 2. Generic Functions

Use generics to create reusable functions.

**✅ Examples:**
```typescript
function findFirst<T>(array: T[], predicate: (item: T) => boolean): T | undefined {
  return array.find(predicate);
}

function mapArray<T, U>(array: T[], mapper: (item: T) => U): U[] {
  return array.map(mapper);
}

function filterArray<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(predicate);
}
```

### 3. Type Guards

Use type guards to narrow types within functions.

**✅ Examples:**
```typescript
function isString(value: any): value is string {
  return typeof value === 'string';
}

function processValue(value: string | number | boolean): string {
  if (isString(value)) {
    return value.toUpperCase();
  } else if (typeof value === 'number') {
    return value.toString();
  } else {
    return value ? 'true' : 'false';
  }
}
```

## Common Pitfalls and Solutions

### 1. Too Many Responsibilities

**❌ Bad:**
```javascript
function handleUserRegistration(userData) {
  // Validate user data
  // Hash password
  // Save to database
  // Send welcome email
  // Create user session
  // Log the registration
}
```

**✅ Good:**
```javascript
function handleUserRegistration(userData) {
  validateUserData(userData);
  const hashedPassword = hashPassword(userData.password);
  const user = createUser(userData, hashedPassword);
  sendWelcomeEmail(user);
  createSession(user);
  logRegistration(user);
}
```

### 2. Long Parameter Lists

**❌ Bad:**
```javascript
function createOrder(userId, productId, quantity, shippingAddress, paymentMethod, couponCode, notes) {
  // Function with too many parameters
}
```

**✅ Good:**
```javascript
function createOrder(orderData) {
  const { userId, productId, quantity, shippingAddress, paymentMethod, couponCode, notes } = orderData;
  // Function with single parameter object
}
```

### 3. Deep Nesting

**❌ Bad:**
```javascript
function processPayment(paymentData) {
  if (paymentData) {
    if (paymentData.amount > 0) {
      if (paymentData.method === 'credit_card') {
        if (paymentData.card) {
          // Deep nesting
        }
      }
    }
  }
}
```

**✅ Good:**
```javascript
function processPayment(paymentData) {
  validatePaymentData(paymentData);
  validateAmount(paymentData.amount);
  validatePaymentMethod(paymentData.method);
  
  if (paymentData.method === 'credit_card') {
    processCreditCardPayment(paymentData);
  }
}
```

## Best Practices Summary

1. **Keep functions short**: Aim for 20 lines or less
2. **Do one thing**: Each function should have a single responsibility
3. **Limit parameters**: 3-4 parameters maximum
4. **Reduce nesting**: 2-3 levels maximum
5. **Extract methods**: Break down large functions
6. **Use data objects**: Group related parameters
7. **Use early returns**: Avoid deep nesting
8. **Be consistent**: Follow the same patterns throughout your codebase

## Examples in Context

### E-commerce Application
```javascript
// Good function design for e-commerce
function calculateOrderTotal(order) {
  const subtotal = calculateSubtotal(order.items);
  const tax = calculateTax(order.shippingAddress, subtotal);
  const shipping = calculateShipping(order.shippingAddress, order.items);
  const discount = calculateDiscount(order.couponCode, subtotal);
  
  return subtotal + tax + shipping - discount;
}

function calculateSubtotal(items) {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function calculateTax(address, amount) {
  const taxRate = getTaxRate(address.state);
  return amount * taxRate;
}

function calculateShipping(address, items) {
  const weight = calculateTotalWeight(items);
  const distance = calculateDistance(address);
  return weight * distance * 0.01;
}

function calculateDiscount(couponCode, subtotal) {
  if (!couponCode) return 0;
  
  const discountRate = getDiscountRate(couponCode);
  return Math.min(subtotal * discountRate, getMaxDiscount(couponCode));
}
```

### API Development
```javascript
// Good function design for API endpoints
async function handleUserRequest(request) {
  const userId = extractUserId(request);
  const user = await getUserById(userId);
  
  if (!user) {
    return createErrorResponse('User not found', 404);
  }
  
  const permissions = await getUserPermissions(userId);
  const action = parseAction(request);
  
  if (!hasPermission(permissions, action)) {
    return createErrorResponse('Permission denied', 403);
  }
  
  const result = await executeAction(action, user);
  return createSuccessResponse(result);
}

function extractUserId(request) {
  return request.headers['x-user-id'] || request.query.userId;
}

function parseAction(request) {
  return {
    type: request.method,
    resource: request.path,
    data: request.body
  };
}

function hasPermission(permissions, action) {
  return permissions.some(p => 
    p.resource === action.resource && p.actions.includes(action.type)
  );
}
```

Remember: Small, focused functions are the building blocks of maintainable code. They make your code easier to understand, test, and modify.