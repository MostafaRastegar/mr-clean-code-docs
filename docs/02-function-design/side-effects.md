# Side Effects

## Overview

Side effects occur when a function modifies state outside of its local scope or has observable interactions with the outside world. While sometimes necessary, uncontrolled side effects make code unpredictable, hard to test, and difficult to reason about.

## Core Principles

### 1. Minimize Side Effects

Functions should ideally be pure - they should only compute and return values without modifying external state.

**❌ Bad (Side Effects):**
```javascript
let currentUser = null;
let userHistory = [];

function authenticateUser(credentials) {
  // Side effect: modifying global state
  currentUser = findUser(credentials.email);
  
  // Side effect: modifying external array
  userHistory.push({
    user: currentUser,
    timestamp: new Date(),
    action: 'login'
  });
  
  // Side effect: updating UI
  document.getElementById('user-display').textContent = currentUser.name;
  
  return currentUser;
}
```

**✅ Good (Pure Function):**
```javascript
function authenticateUser(credentials, users) {
  const user = findUser(credentials.email, users);
  
  if (user && user.password === credentials.password) {
    return {
      success: true,
      user: user,
      session: {
        userId: user.id,
        timestamp: new Date()
      }
    };
  }
  
  return {
    success: false,
    error: 'Invalid credentials'
  };
}

// Separate functions for side effects
function updateCurrentUser(user) {
  currentUser = user;
}

function logUserAction(action, user) {
  userHistory.push({
    user: user,
    timestamp: new Date(),
    action: action
  });
}

function updateUI(user) {
  document.getElementById('user-display').textContent = user.name;
}
```

### 2. Isolate Side Effects

When side effects are necessary, isolate them in specific functions.

**✅ Examples:**
```javascript
// Pure function - no side effects
function calculateTotal(items, taxRate, discount) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax - discount;
  
  return {
    subtotal: subtotal,
    tax: tax,
    discount: discount,
    total: total
  };
}

// Side effect functions - clearly separated
function saveOrderToDatabase(order) {
  return database.save('orders', order);
}

function sendConfirmationEmail(order) {
  return emailService.send({
    to: order.user.email,
    subject: 'Order Confirmation',
    body: `Your order ${order.id} has been placed successfully.`
  });
}

function updateInventory(items) {
  return Promise.all(
    items.map(item => 
      inventoryService.update(item.productId, { reserved: item.quantity })
    )
  );
}

// Orchestrator function
async function processOrder(orderData) {
  // Pure calculation
  const pricing = calculateTotal(orderData.items, orderData.taxRate, orderData.discount);
  
  // Side effects isolated
  const order = await saveOrderToDatabase({
    ...orderData,
    total: pricing.total
  });
  
  await Promise.all([
    sendConfirmationEmail(order),
    updateInventory(orderData.items)
  ]);
  
  return order;
}
```

### 3. Make Side Effects Explicit

Clearly indicate when functions have side effects through naming and documentation.

**✅ Examples:**
```javascript
// Clear naming indicates side effects
function updateUserInDatabase(user) {
  return database.update('users', user.id, user);
}

function logUserActivity(activity) {
  console.log(`[${new Date().toISOString()}] ${activity}`);
}

function sendNotification(message, userId) {
  return notificationService.send(userId, message);
}

function clearCache() {
  cache.clear();
  logUserActivity('Cache cleared');
}

// Documentation makes side effects clear
/**
 * Saves user to database and sends welcome email
 * @param {User} user - User to save
 * @returns {Promise<User>} Saved user
 * @sideEffect Saves to database, sends email, logs activity
 */
async function createUserWithSideEffects(user) {
  const savedUser = await database.save('users', user);
  await emailService.sendWelcomeEmail(savedUser);
  logUserActivity(`User ${savedUser.id} created`);
  return savedUser;
}
```

### 4. Avoid Hidden Side Effects

Don't perform side effects as a byproduct of other operations.

**❌ Bad:**
```javascript
function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
    
    // Hidden side effect: updating inventory
    inventory[item.productId].reserved += item.quantity;
    
    // Hidden side effect: logging
    console.log(`Added ${item.name} to total`);
  }
  
  return total;
}
```

**✅ Good:**
```javascript
function calculateTotal(items) {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function reserveInventory(items) {
  for (const item of items) {
    inventory[item.productId].reserved += item.quantity;
  }
}

function logItems(items) {
  items.forEach(item => {
    console.log(`Added ${item.name} to total`);
  });
}

// Clear separation of concerns
function processItems(items) {
  const total = calculateTotal(items);
  reserveInventory(items);
  logItems(items);
  return total;
}
```

## Side Effect Patterns

### 1. Command Pattern

Use command objects to encapsulate side effects.

**✅ Examples:**
```javascript
class UpdateUserCommand {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }
  
  async execute(userId, updates) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const updatedUser = { ...user, ...updates };
    await this.userRepository.update(userId, updatedUser);
    
    if (updates.email && updates.email !== user.email) {
      await this.emailService.sendEmailChangeNotification(user, updates.email);
    }
    
    return updatedUser;
  }
}

// Usage
const command = new UpdateUserCommand(userRepository, emailService);
const result = await command.execute('user123', { name: 'New Name', email: 'new@example.com' });
```

### 2. Event-Driven Pattern

Use events to handle side effects asynchronously.

**✅ Examples:**
```javascript
class EventBus {
  constructor() {
    this.listeners = new Map();
  }
  
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  async publish(event, data) {
    const callbacks = this.listeners.get(event) || [];
    await Promise.all(callbacks.map(callback => callback(data)));
  }
}

const eventBus = new EventBus();

// Pure function that publishes events
function processOrder(order) {
  const result = validateAndProcessOrder(order);
  
  if (result.success) {
    eventBus.publish('order:created', result.order);
    eventBus.publish('inventory:reserved', result.order.items);
    eventBus.publish('payment:charged', result.order.payment);
  }
  
  return result;
}

// Side effect handlers
eventBus.subscribe('order:created', async (order) => {
  await saveOrderToDatabase(order);
  await sendConfirmationEmail(order);
});

eventBus.subscribe('inventory:reserved', async (items) => {
  await updateInventory(items);
});

eventBus.subscribe('payment:charged', async (payment) => {
  await chargeCustomer(payment);
  await logPayment(payment);
});
```

### 3. Repository Pattern

Use repositories to isolate data access side effects.

**✅ Examples:**
```javascript
class UserRepository {
  constructor(database) {
    this.database = database;
  }
  
  async findById(id) {
    const data = await this.database.query('SELECT * FROM users WHERE id = ?', [id]);
    return data.length > 0 ? this.mapToUser(data[0]) : null;
  }
  
  async save(user) {
    const data = this.mapFromUser(user);
    await this.database.query(
      'INSERT INTO users (id, name, email, created_at) VALUES (?, ?, ?, ?)',
      [data.id, data.name, data.email, data.createdAt]
    );
    return user;
  }
  
  async update(id, updates) {
    const data = this.mapFromUser(updates);
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    
    await this.database.query(
      `UPDATE users SET ${fields} WHERE id = ?`,
      [...values, id]
    );
    
    return await this.findById(id);
  }
  
  mapToUser(data) {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      createdAt: new Date(data.created_at)
    };
  }
  
  mapFromUser(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.createdAt.toISOString()
    };
  }
}

// Usage
const userRepository = new UserRepository(database);
const user = await userRepository.findById('user123');
const updatedUser = await userRepository.update(user.id, { name: 'New Name' });
```

## TypeScript-Specific Considerations

### 1. Type Annotations for Side Effects

Use types to indicate functions with side effects.

**✅ Examples:**
```typescript
// Pure function type
type PureFunction<T, U> = (input: T) => U;

// Function that may have side effects
type EffectfulFunction<T, U> = (input: T) => Promise<U>;

// Function that definitely has side effects
type SideEffectFunction<T> = (input: T) => void;

// Example usage
const calculateTotal: PureFunction<Item[], number> = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

const saveUser: EffectfulFunction<User, User> = async (user) => {
  return await database.save('users', user);
};

const logActivity: SideEffectFunction<string> = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};
```

### 2. Readonly Types

Use readonly types to prevent accidental mutations.

**✅ Examples:**
```typescript
interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly createdAt: Date;
}

interface Order {
  readonly id: string;
  readonly items: readonly OrderItem[];
  readonly total: number;
  readonly status: OrderStatus;
}

// Function that shouldn't modify input
function processOrder(order: Readonly<Order>): ProcessResult {
  // TypeScript will prevent mutations to order
  return {
    success: true,
    processedOrder: { ...order, status: 'processed' as OrderStatus }
  };
}
```

### 3. Immutability Helpers

Use utility types to enforce immutability.

**✅ Examples:**
```typescript
// Deep readonly type
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Immutable update function
function updateObject<T extends object>(
  obj: DeepReadonly<T>,
  updates: Partial<T>
): T {
  return { ...obj, ...updates };
}

// Usage
const user: DeepReadonly<User> = { id: '123', name: 'John', email: 'john@example.com' };
const updatedUser = updateObject(user, { name: 'Jane' });
// user remains unchanged, updatedUser is a new object
```

## Common Pitfalls and Solutions

### 1. Accidental Mutations

**❌ Bad:**
```javascript
function addItemToCart(cart, item) {
  cart.items.push(item); // Mutating input
  cart.total += item.price; // Mutating input
  return cart;
}
```

**✅ Good:**
```javascript
function addItemToCart(cart, item) {
  return {
    ...cart,
    items: [...cart.items, item],
    total: cart.total + item.price
  };
}
```

### 2. Global State Modification

**❌ Bad:**
```javascript
let appState = { theme: 'light', language: 'en' };

function setTheme(theme) {
  appState.theme = theme; // Modifying global state
  localStorage.setItem('theme', theme); // Side effect
}
```

**✅ Good:**
```javascript
function updateTheme(currentState, theme) {
  return {
    ...currentState,
    theme: theme
  };
}

function saveThemeToStorage(theme) {
  localStorage.setItem('theme', theme);
}

// Usage
appState = updateTheme(appState, 'dark');
saveThemeToStorage('dark');
```

### 3. Hidden Async Side Effects

**❌ Bad:**
```javascript
function processUser(user) {
  const result = validateUser(user);
  
  if (result.valid) {
    // Hidden async side effect
    database.save('users', user).then(() => {
      emailService.sendWelcomeEmail(user);
    });
  }
  
  return result;
}
```

**✅ Good:**
```javascript
async function processUser(user) {
  const result = validateUser(user);
  
  if (result.valid) {
    await saveUserToDatabase(user);
    await sendWelcomeEmail(user);
  }
  
  return result;
}

async function saveUserToDatabase(user) {
  return database.save('users', user);
}

async function sendWelcomeEmail(user) {
  return emailService.sendWelcomeEmail(user);
}
```

### 4. Callback Side Effects

**❌ Bad:**
```javascript
function processData(data, callback) {
  const result = transformData(data);
  callback(result); // Side effect through callback
  
  // More processing that depends on callback side effects
  return finalizeResult(result);
}
```

**✅ Good:**
```javascript
function processData(data) {
  const result = transformData(data);
  return result;
}

function handleProcessedData(result, callback) {
  callback(result); // Clear separation
  return finalizeResult(result);
}

// Usage
const result = processData(data);
const finalResult = handleProcessedData(result, callback);
```

## Best Practices Summary

1. **Prefer pure functions**: Functions that only compute and return values
2. **Isolate side effects**: Put side effects in dedicated functions
3. **Make side effects explicit**: Clear naming and documentation
4. **Avoid hidden side effects**: Don't perform side effects as byproducts
5. **Use patterns**: Command, Event-Driven, Repository patterns
6. **Immutable data**: Avoid mutating input parameters
7. **Type annotations**: Use TypeScript to indicate side effects
8. **Testability**: Pure functions are easier to test

## Examples in Context

### E-commerce Application
```javascript
// Good side effect management for e-commerce
class OrderProcessor {
  constructor(database, emailService, inventoryService, paymentService) {
    this.database = database;
    this.emailService = emailService;
    this.inventoryService = inventoryService;
    this.paymentService = paymentService;
  }
  
  // Pure function - no side effects
  calculateOrderTotal(items, taxRate, discount) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax - discount;
    
    return { subtotal, tax, discount, total };
  }
  
  // Side effect: database operation
  async saveOrder(order) {
    return await this.database.save('orders', order);
  }
  
  // Side effect: email sending
  async sendConfirmationEmail(order) {
    return await this.emailService.send({
      to: order.user.email,
      subject: 'Order Confirmation',
      body: `Your order ${order.id} has been placed successfully.`
    });
  }
  
  // Side effect: inventory update
  async reserveInventory(items) {
    return await Promise.all(
      items.map(item => 
        this.inventoryService.reserve(item.productId, item.quantity)
      )
    );
  }
  
  // Side effect: payment processing
  async processPayment(order) {
    return await this.paymentService.charge(order.user.id, order.total);
  }
  
  // Orchestrator - coordinates side effects
  async processOrder(orderData) {
    // Pure calculation
    const pricing = this.calculateOrderTotal(
      orderData.items, 
      orderData.taxRate, 
      orderData.discount
    );
    
    // Create order object
    const order = {
      id: generateOrderId(),
      user: orderData.user,
      items: orderData.items,
      total: pricing.total,
      status: 'pending'
    };
    
    // Execute side effects
    await Promise.all([
      this.saveOrder(order),
      this.reserveInventory(order.items),
      this.processPayment(order)
    ]);
    
    // Final side effect
    await this.sendConfirmationEmail(order);
    
    return order;
  }
}
```

### API Development
```javascript
// Good side effect management for API endpoints
class UserController {
  constructor(userService, logger, metrics) {
    this.userService = userService;
    this.logger = logger;
    this.metrics = metrics;
  }
  
  // Pure function - validation
  validateUserData(userData) {
    const errors = [];
    
    if (!userData.email || !isValidEmail(userData.email)) {
      errors.push('Invalid email');
    }
    
    if (!userData.name || userData.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
  
  // Side effect: database operation
  async createUser(userData) {
    return await this.userService.create(userData);
  }
  
  // Side effect: logging
  logUserAction(action, userId, details) {
    this.logger.info(`User ${userId}: ${action}`, details);
  }
  
  // Side effect: metrics
  recordUserMetric(action, duration) {
    this.metrics.record(`user.${action}`, duration);
  }
  
  // Orchestrator for API endpoint
  async createUserEndpoint(request, response) {
    const startTime = Date.now();
    
    try {
      // Pure validation
      const validation = this.validateUserData(request.body);
      
      if (!validation.valid) {
        this.logUserAction('create_user_failed', 'unknown', { errors: validation.errors });
        return response.status(400).json({ errors: validation.errors });
      }
      
      // Side effect: create user
      const user = await this.createUser(request.body);
      
      // Side effects: logging and metrics
      this.logUserAction('create_user_success', user.id, { email: user.email });
      this.recordUserMetric('create_user', Date.now() - startTime);
      
      return response.status(201).json({ user: user });
      
    } catch (error) {
      // Side effect: error logging
      this.logUserAction('create_user_error', 'unknown', { error: error.message });
      this.recordUserMetric('create_user_error', Date.now() - startTime);
      
      return response.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

### Data Processing
```javascript
// Good side effect management for data processing
class DataProcessor {
  constructor(database, cache, logger) {
    this.database = database;
    this.cache = cache;
    this.logger = logger;
  }
  
  // Pure function - data transformation
  transformData(rawData, transformers) {
    return rawData.map(item => 
      transformers.reduce((acc, transformer) => transformer(acc), item)
    );
  }
  
  // Pure function - data validation
  validateData(data, validators) {
    return data.filter(item => 
      validators.every(validator => validator(item))
    );
  }
  
  // Side effect: database save
  async saveProcessedData(data) {
    return await this.database.bulkInsert('processed_data', data);
  }
  
  // Side effect: cache update
  updateCache(key, data) {
    this.cache.set(key, data, 3600); // 1 hour TTL
  }
  
  // Side effect: logging
  logProcessingStats(stats) {
    this.logger.info('Data processing completed', stats);
  }
  
  // Orchestrator
  async processBatch(batchData, options = {}) {
    const startTime = Date.now();
    
    // Pure transformations
    const transformedData = this.transformData(batchData, options.transformers || []);
    const validatedData = this.validateData(transformedData, options.validators || []);
    
    // Side effects
    const savedData = await this.saveProcessedData(validatedData);
    this.updateCache(`batch_${Date.now()}`, savedData);
    
    // Side effect: logging with statistics
    const stats = {
      inputCount: batchData.length,
      transformedCount: transformedData.length,
      validatedCount: validatedData.length,
      savedCount: savedData.length,
      processingTime: Date.now() - startTime
    };
    
    this.logProcessingStats(stats);
    
    return {
      success: true,
      stats: stats,
      data: savedData
    };
  }
}
```

Remember: Side effects are often necessary, but they should be controlled, isolated, and made explicit. This makes your code more predictable, testable, and maintainable.