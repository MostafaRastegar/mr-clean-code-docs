# Functions and Methods

## Overview

Functions and methods are the verbs of your code - they perform actions and operations. Good naming makes their purpose and behavior clear to other developers.

## Core Principles

### 1. Use Verb Phrases

Function names should describe what the function does using action words.

**❌ Bad:**
```javascript
function user() { /* ... */ }
function data() { /* ... */ }
function process() { /* ... */ }
```

**✅ Good:**
```javascript
function getUser() { /* ... */ }
function saveUserData() { /* ... */ }
function processData() { /* ... */ }
```

### 2. Be Specific About the Action

Avoid generic verbs when more specific ones are available.

**❌ Bad:**
```javascript
function handle() { /* ... */ }
function manage() { /* ... */ }
function process() { /* ... */ }
function get() { /* ... */ }
```

**✅ Good:**
```javascript
function handleSubmit() { /* ... */ }
function manageUserSession() { /* ... */ }
function processDataBatch() { /* ... */ }
function getUserById() { /* ... */ }
```

### 3. Use Clear Return Value Indicators

Functions that return values should indicate what they return.

**✅ Examples:**
```javascript
function calculateTotal(items) { /* ... */ }
function formatCurrency(amount) { /* ... */ }
function validateEmail(email) { /* ... */ }
function getUserPreferences() { /* ... */ }
```

### 4. Use Boolean Indicators for Predicates

Functions that return boolean values should start with `is`, `has`, `can`, `should`, etc.

**✅ Examples:**
```javascript
function isValid(email) { /* ... */ }
function hasPermission(user, resource) { /* ... */ }
function canEdit(user, document) { /* ... */ }
function shouldRetry(error) { /* ... */ }
function isEmpty(array) { /* ... */ }
function isExpired(date) { /* ... */ }
```

## Function Naming Patterns

### 1. CRUD Operations

Use standard CRUD terminology for data operations.

**✅ Examples:**
```javascript
// Create
function createUser(userData) { /* ... */ }
function addProductToCart(product) { /* ... */ }
function insertRecord(data) { /* ... */ }

// Read
function getUserById(id) { /* ... */ }
function fetchUserProfile(userId) { /* ... */ }
function findProductByName(name) { /* ... */ }

// Update
function updateUser(id, updates) { /* ... */ }
function saveUserPreferences(userId, preferences) { /* ... */ }
function updateInventory(productId, quantity) { /* ... */ }

// Delete
function deleteUser(id) { /* ... */ }
function removeProductFromCart(productId) { /* ... */ }
function deleteRecord(id) { /* ... */ }
```

### 2. Transformation Functions

Use clear verbs that indicate the transformation.

**✅ Examples:**
```javascript
function formatDate(date) { /* ... */ }
function capitalizeFirstLetter(string) { /* ... */ }
function convertToUpperCase(text) { /* ... */ }
function parseJsonString(jsonString) { /* ... */ }
function sanitizeInput(input) { /* ... */ }
function normalizeData(data) { /* ... */ }
```

### 3. Utility Functions

Use descriptive names that indicate the utility's purpose.

**✅ Examples:**
```javascript
function debounce(func, delay) { /* ... */ }
function throttle(func, limit) { /* ... */ }
function memoize(func) { /* ... */ }
function deepClone(obj) { /* ... */ }
function generateUniqueId() { /* ... */ }
function shuffleArray(array) { /* ... */ }
```

### 4. Event Handlers

Use `handle` prefix with specific event descriptions.

**✅ Examples:**
```javascript
function handleClick(event) { /* ... */ }
function handleSubmitForm(event) { /* ... */ }
function handleKeyPress(event) { /* ... */ }
function handleFileUpload(file) { /* ... */ }
function handleUserLogout() { /* ... */ }
function handleWindowResize() { /* ... */ }
```

## Method Naming in Classes

### 1. Instance Methods

Use verbs that describe what the instance does.

**✅ Examples:**
```javascript
class ShoppingCart {
  addItem(product) { /* ... */ }
  removeItem(productId) { /* ... */ }
  calculateTotal() { /* ... */ }
  checkout() { /* ... */ }
  clear() { /* ... */ }
}

class User {
  login(credentials) { /* ... */ }
  logout() { /* ... */ }
  updateProfile(data) { /* ... */ }
  changePassword(oldPassword, newPassword) { /* ... */ }
  hasPermission(permission) { /* ... */ }
}
```

### 2. Static Methods

Use descriptive names that indicate the class-level operation.

**✅ Examples:**
```javascript
class Database {
  static connect(connectionString) { /* ... */ }
  static disconnect() { /* ... */ }
  static migrate() { /* ... */ }
  static seed() { /* ... */ }
}

class Validator {
  static validateEmail(email) { /* ... */ }
  static validatePassword(password) { /* ... */ }
  static validatePhoneNumber(phone) { /* ... */ }
}
```

### 3. Getter and Setter Methods

Use `get` and `set` prefixes for property accessors.

**✅ Examples:**
```javascript
class User {
  get name() {
    return this._name;
  }

  set name(value) {
    if (typeof value !== 'string') {
      throw new Error('Name must be a string');
    }
    this._name = value;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  setFullName(fullName) {
    const [firstName, lastName] = fullName.split(' ');
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
```

## Higher-Order Functions

### 1. Function Generators

Use names that indicate what kind of function they create.

**✅ Examples:**
```javascript
function createLogger(prefix) {
  return function(message) {
    console.log(`[${prefix}] ${message}`);
  };
}

function createValidator(regex) {
  return function(value) {
    return regex.test(value);
  };
}

function createMiddleware(handler) {
  return function(request, response, next) {
    // Middleware logic
    return handler(request, response, next);
  };
}
```

### 2. Function Composers

Use names that indicate composition or combination.

**✅ Examples:**
```javascript
function compose(...functions) {
  return function(value) {
    return functions.reduceRight((acc, fn) => fn(acc), value);
  };
}

function pipe(...functions) {
  return function(value) {
    return functions.reduce((acc, fn) => fn(acc), value);
  };
}

function combineValidators(...validators) {
  return function(value) {
    return validators.every(validator => validator(value));
  };
}
```

## TypeScript-Specific Considerations

### 1. Async Function Naming

Use `async` suffix or `Promise` in the name to indicate asynchronous behavior.

**✅ Examples:**
```typescript
async function fetchUserData(userId: string): Promise<User> {
  // Implementation
}

async function saveUserToDatabase(user: User): Promise<void> {
  // Implementation
}

function createAsyncValidator<T>(
  validator: (value: T) => boolean
): (value: T) => Promise<boolean> {
  return async function(value: T): Promise<boolean> {
    return new Promise(resolve => {
      setTimeout(() => resolve(validator(value)), 100);
    });
  };
}
```

### 2. Generic Function Naming

Use descriptive names that work well with type parameters.

**✅ Examples:**
```typescript
function mapArray<T, U>(
  array: T[],
  mapper: (item: T) => U
): U[] {
  return array.map(mapper);
}

function filterArray<T>(
  array: T[],
  predicate: (item: T) => boolean
): T[] {
  return array.filter(predicate);
}

function findFirst<T>(
  array: T[],
  predicate: (item: T) => boolean
): T | undefined {
  return array.find(predicate);
}
```

### 3. Overloaded Function Naming

Use consistent names for overloaded functions.

**✅ Examples:**
```typescript
function createElement(tagName: string): HTMLElement;
function createElement(tagName: string, attributes: Record<string, string>): HTMLElement;
function createElement(tagName: string, attributes?: Record<string, string>): HTMLElement {
  const element = document.createElement(tagName);
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  return element;
}
```

## Common Pitfalls and Solutions

### 1. Too Generic Names

**❌ Bad:**
```javascript
function process() { /* What kind of processing? */ }
function handle() { /* What are we handling? */ }
function manage() { /* What are we managing? */ }
```

**✅ Good:**
```javascript
function processOrder() { /* Specific processing */ }
function handleUserInput() { /* Specific handling */ }
function manageUserSession() { /* Specific management */ }
```

### 2. Too Long Names

**❌ Bad:**
```javascript
function processUserRegistrationAndSendWelcomeEmail() { /* Too long */ }
function validateUserInputAndFormatForDatabaseStorage() { /* Too long */ }
```

**✅ Good:**
```javascript
function registerUser() { /* Shorter but clear */ }
function validateAndFormatInput() { /* Shorter but clear */ }
```

### 3. Inconsistent Naming

**❌ Bad:**
```javascript
function getUser() { /* camelCase */ }
function deleteUserRecord() { /* camelCase */ }
function save_user_preferences() { /* snake_case */ }
function UPDATE_USER() { /* UPPER_CASE */ }
```

**✅ Good:**
```javascript
function getUser() { /* All camelCase */ }
function deleteUserRecord() { /* All camelCase */ }
function saveUserPreferences() { /* All camelCase */ }
function updateUser() { /* All camelCase */ }
```

### 4. Misleading Names

**❌ Bad:**
```javascript
function calculateTotal() {
  // Actually just returns a cached value, doesn't calculate
  return this.cachedTotal;
}

function validateEmail() {
  // Actually sends an email, doesn't just validate
  sendVerificationEmail(this.email);
  return true;
}
```

**✅ Good:**
```javascript
function getTotal() {
  return this.cachedTotal;
}

function validateAndSendEmail() {
  sendVerificationEmail(this.email);
  return true;
}
```

## Best Practices Summary

1. **Use verb phrases**: `getUser`, `saveData`, `processOrder`
2. **Be specific**: `handleSubmitForm` instead of `handle`
3. **Indicate return values**: `calculateTotal`, `formatDate`
4. **Use boolean prefixes**: `isValid`, `hasPermission`, `canEdit`
5. **Follow CRUD conventions**: `create`, `read`, `update`, `delete`
6. **Use consistent patterns**: Stick to one naming convention
7. **Avoid abbreviations**: `calculateTotal` instead of `calcTot`
8. **Be truthful**: Name should match what the function actually does

## Examples in Context

### E-commerce Application
```javascript
// User management
function registerUser(userData) { /* ... */ }
function authenticateUser(credentials) { /* ... */ }
function updateUserProfile(userId, updates) { /* ... */ }
function deleteUserAccount(userId) { /* ... */ }

// Product management
function addProductToCatalog(product) { /* ... */ }
function updateProductInventory(productId, quantity) { /* ... */ }
function removeProductFromCatalog(productId) { /* ... */ }
function searchProducts(query) { /* ... */ }

// Order processing
function createOrder(orderData) { /* ... */ }
function calculateOrderTotal(items) { /* ... */ }
function applyDiscount(order, discountCode) { /* ... */ }
function processPayment(order, paymentMethod) { /* ... */ }
function shipOrder(orderId) { /* ... */ }
```

### API Development
```javascript
// Request handling
function parseRequestBody(request) { /* ... */ }
function validateRequestSchema(request, schema) { /* ... */ }
function authenticateRequest(request) { /* ... */ }
function authorizeRequest(request, permissions) { /* ... */ }

// Response handling
function formatApiResponse(data, status) { /* ... */ }
function handleError(error, response) { /* ... */ }
function sendSuccessResponse(data, response) { /* ... */ }
function sendErrorResponse(error, response) { /* ... */ }

// Middleware
function logRequestMiddleware(request, response, next) { /* ... */ }
function corsMiddleware(request, response, next) { /* ... */ }
function compressionMiddleware(request, response, next) { /* ... */ }
```

Remember: Function names are contracts with other developers. They should clearly communicate what the function does, what it expects, and what it returns.