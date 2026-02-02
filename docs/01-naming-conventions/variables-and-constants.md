# Variables and Constants

## Overview

Proper naming of variables and constants is fundamental to writing readable and maintainable code. Good names make code self-documenting and reduce the need for comments.

## Core Principles

### 1. Use Intention-Revealing Names

Names should clearly communicate the purpose and meaning of the variable.

**❌ Bad:**
```javascript
let d; // elapsed time in days
let s; // status code
let data; // user information
```

**✅ Good:**
```javascript
let elapsedTimeInDays;
let statusCode;
let userInfo;
```

### 2. Avoid Disinformation

Don't use names that are misleading or don't accurately represent the data.

**❌ Bad:**
```javascript
let accountList = {}; // Actually an object, not an array
let userCollection = []; // Actually an array, not a collection class
let temp = calculateTotal(); // Not actually temporary
```

**✅ Good:**
```javascript
let accountMap = {};
let userList = [];
let totalAmount = calculateTotal();
```

### 3. Use Pronounceable Names

Names should be easy to say and remember when discussing code.

**❌ Bad:**
```javascript
let genymdhms; // Generation timestamp
let modymdhms; // Modification timestamp
let pszqint = "user"; // Some identifier
```

**✅ Good:**
```javascript
let generationTimestamp;
let modificationTimestamp;
let userIdentifier = "user";
```

### 4. Use Searchable Names

Single-letter variables and numeric constants are difficult to search for.

**❌ Bad:**
```javascript
for (let i = 0; i < 34; i++) {
  // What is 34? Where else is it used?
}
```

**✅ Good:**
```javascript
const MAX_RETRIES = 34;
for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
  // Clear intent and searchable
}
```

### 5. Avoid Encodings

Don't use Hungarian notation, member prefixes, or interface prefixes.

**❌ Bad:**
```javascript
let strName = "John"; // Hungarian notation
let m_userName = "John"; // Member prefix
let IUserService = {}; // Interface prefix
let kMaxSize = 100; // Magic constant prefix
```

**✅ Good:**
```javascript
let userName = "John";
let userService = {};
let maxSize = 100;
```

## Variable Naming Patterns

### 1. Use Nouns for Variables

Variables represent things, so use noun phrases.

**✅ Examples:**
```javascript
let user;
let accountBalance;
let productList;
let configurationSettings;
```

### 2. Use Verbs for Booleans

Boolean variables should answer a question.

**✅ Examples:**
```javascript
let isValid = true;
let isLoading = false;
let hasPermission = true;
let canEdit = false;
```

### 3. Use Past Tense for State Changes

When tracking state changes, use past tense.

**✅ Examples:**
```javascript
let wasSubmitted = false;
let hasInitialized = true;
let wasDeleted = false;
```

### 4. Use Collections Appropriately

Be clear about whether you're dealing with single items or collections.

**✅ Examples:**
```javascript
let user = getUser(); // Single user
let users = getUsers(); // Array of users
let userMap = new Map(); // Map of users
let userSet = new Set(); // Set of users
```

## Constant Naming

### 1. Use UPPER_SNAKE_CASE for Constants

Constants should be clearly identifiable.

**✅ Examples:**
```javascript
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;
const API_ENDPOINT = "https://api.example.com";
const HTTP_STATUS_OK = 200;
```

### 2. Use Descriptive Names for Magic Numbers

Replace magic numbers with named constants.

**❌ Bad:**
```javascript
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * 0.08, 0);
}
```

**✅ Good:**
```javascript
const SALES_TAX_RATE = 0.08;

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * SALES_TAX_RATE, 0);
}
```

### 3. Group Related Constants

Use objects or enums to group related constants.

**✅ Examples:**
```javascript
// Using object
const HTTP_STATUS = {
  OK: 200,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

// Using enum (TypeScript)
enum HttpStatus {
  OK = 200,
  NOT_FOUND = 404,
  SERVER_ERROR = 500
}

// Using object for configuration
const CONFIG = {
  API_BASE_URL: "https://api.example.com",
  TIMEOUT: 5000,
  RETRY_ATTEMPTS: 3
};
```

## TypeScript-Specific Considerations

### 1. Use Type Information to Inform Names

Let TypeScript's type system help you choose appropriate names.

**✅ Examples:**
```typescript
// Instead of generic names, be specific about what the type represents
let userId: string; // Clear that this is an ID, not just any string
let userNames: string[]; // Clear that this is an array of names
let userMap: Map<string, User>; // Clear structure and types
```

### 2. Avoid Redundant Type Information in Names

Don't include type information that's already clear from the type annotation.

**❌ Bad:**
```typescript
let userString: string; // Redundant - we know it's a string
let userListArray: User[]; // Redundant - we know it's an array
```

**✅ Good:**
```typescript
let userJson: string; // OK - specifies JSON format
let userList: User[]; // OK - "List" describes the semantic meaning
```

### 3. Use Interface and Type Names Carefully

Interface and type names should describe capabilities, not implementations.

**✅ Examples:**
```typescript
interface UserValidator {
  validate(user: User): ValidationResult;
}

interface DataProvider {
  fetch<T>(query: Query): Promise<T[]>;
}

type EventHandler = (event: Event) => void;
type AsyncFunction<T> = () => Promise<T>;
```

## Common Pitfalls and Solutions

### 1. Abbreviations and Acronyms

**❌ Bad:**
```javascript
let usrNm = "John"; // Unclear abbreviation
let cfg = {}; // Unclear what this configures
```

**✅ Good:**
```javascript
let userName = "John";
let config = {};
let http = {}; // OK - HTTP is a well-known acronym
let url = "https://example.com"; // OK - URL is a well-known acronym
```

### 2. Misleading Names

**❌ Bad:**
```javascript
let activeUsers = []; // Actually contains all users, not just active ones
let pendingTasks = getCompletedTasks(); // Name doesn't match what it contains
```

**✅ Good:**
```javascript
let allUsers = [];
let completedTasks = getCompletedTasks();
```

### 3. Context-Dependent Names

**❌ Bad:**
```javascript
// In a user management context
let name = "John"; // What kind of name?
let id = "123"; // What kind of ID?
```

**✅ Good:**
```javascript
let userName = "John";
let userId = "123";
```

## Best Practices Summary

1. **Be Specific**: `userEmail` instead of `email` when context allows
2. **Be Consistent**: Use the same naming patterns throughout your codebase
3. **Be Descriptive**: `isUserAuthenticated` instead of `auth`
4. **Be Pronounceable**: `generationTimestamp` instead of `genymdhms`
5. **Be Searchable**: `MAX_RETRY_ATTEMPTS` instead of `34`
6. **Avoid Abbreviations**: `configuration` instead of `cfg`
7. **Use Problem Domain Names**: `accountBalance` instead of `data1`

## Examples in Context

### E-commerce Application
```javascript
// Product management
const MAX_PRODUCTS_PER_PAGE = 20;
let selectedProductIds = new Set();
let productInventory = new Map();

// Order processing
const ORDER_STATUS_PENDING = "pending";
const ORDER_STATUS_SHIPPED = "shipped";
let pendingOrders = [];
let orderProcessingQueue = new Queue();

// User management
let activeUserSessions = new Map();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
```

### API Development
```javascript
// HTTP constants
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// API endpoints
const API_ENDPOINTS = {
  USERS: "/api/users",
  PRODUCTS: "/api/products",
  ORDERS: "/api/orders"
};

// Request/response handling
let pendingRequests = new Set();
const MAX_CONCURRENT_REQUESTS = 10;
let requestRetryCount = 0;
```

Remember: Good variable and constant names are investments in code readability and maintainability. They pay dividends every time someone reads your code.