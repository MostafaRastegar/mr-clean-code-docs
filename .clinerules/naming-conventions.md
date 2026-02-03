---
paths:
  - "src/**/*.js"
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "**/*.js"
  - "**/*.ts"
  - "**/*.tsx"
---

# Naming Conventions

Proper naming is crucial for code readability and maintainability. Good names make code self-documenting and reduce the need for comments.

## Core Principles

- Use intention-revealing names
- Avoid disinformation
- Use pronounceable names
- Use searchable names
- Avoid encodings (Hungarian notation, etc.)
- Use solution domain names
- Use problem domain names
- Avoid mental mapping

## Variables and Constants

### ✅ Good Examples
```javascript
// Use descriptive names
const userAge = 25;
const isUserLoggedIn = true;
const MAX_RETRY_ATTEMPTS = 3;

// Use pronounceable names
const customerName = 'John Doe';
const emailAddress = 'john@example.com';

// Use searchable names
const SECONDS_IN_MINUTE = 60;
const RETRY_DELAY_MS = 1000;
```

### ❌ Bad Examples
```javascript
// Unclear abbreviations
const uAge = 25;
const isLoggedIn = true;

// Magic numbers
const result = value * 1.08;

// Non-descriptive names
const data = fetchUserData();
const temp = calculateTotal();
```

## Functions and Methods

### ✅ Good Examples
```javascript
// Use verb-noun pairs
function calculateTotalPrice(subtotal, taxRate) {
  return subtotal + (subtotal * taxRate);
}

// Use descriptive names for boolean functions
function isValidEmail(email) {
  return email.includes('@');
}

// Use clear action names
function fetchUserData(userId) {
  return fetch(`/api/users/${userId}`);
}
```

### ❌ Bad Examples
```javascript
// Vague function names
function process(data) {
  return data * 2;
}

// Unclear boolean functions
function check(value) {
  return value > 0;
}

// Abbreviated names
function calc(x, y) {
  return x + y;
}
```

## Classes and Interfaces

### ✅ Good Examples
```javascript
// Use noun phrases for classes
class UserManager {
  constructor() {
    this.users = [];
  }
}

class EmailValidator {
  validate(email) {
    return email.includes('@');
  }
}

// Use descriptive interface names
interface User {
  id: string;
  name: string;
  email: string;
}

interface UserService {
  getUser(id: string): Promise<User>;
  createUser(userData: Partial<User>): Promise<User>;
}
```

### ❌ Bad Examples
```javascript
// Unclear class names
class Manager {
  constructor() {
    this.data = [];
  }
}

class Validator {
  validate(value) {
    return value !== null;
  }
}

// Non-descriptive interfaces
interface Data {
  id: string;
  name: string;
}

interface Service {
  get(id: string): Promise<any>;
}
```

## Files and Modules

### ✅ Good Examples
```javascript
// Use kebab-case for file names
// user-manager.js
// email-validator.js
// api-client.js

// Use descriptive module names
export class UserManager {
  // ...
}

export function validateEmail(email) {
  // ...
}
```

### ❌ Bad Examples
```javascript
// Unclear file names
// um.js
// val.js
// api.js

// Non-descriptive exports
export class Manager {
  // ...
}

export function check(value) {
  // ...
}
```

## TypeScript Specific

### ✅ Good Examples
```typescript
// Use descriptive type names
type UserCredentials = {
  username: string;
  password: string;
};

type ApiResponse<T> = {
  data: T;
  status: 'success' | 'error';
  message?: string;
};

// Use clear enum names
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

// Use descriptive generic names
function processItems<T extends User>(items: T[]): T[] {
  return items.filter(item => item.isActive);
}
```

### ❌ Bad Examples
```typescript
// Unclear type names
type Data = {
  id: string;
  name: string;
};

type Response = {
  data: any;
  status: string;
};

// Non-descriptive enums
enum Role {
  A = 'admin',
  U = 'user',
  G = 'guest'
}

// Vague generic names
function process<T>(items: T[]): T[] {
  return items.filter(item => item !== null);
}
```

## Code Review Checklist

- [ ] Variable names reveal intent and purpose
- [ ] Function names describe what they do
- [ ] Class names are nouns or noun phrases
- [ ] Interface names are descriptive and clear
- [ ] File names are kebab-case and descriptive
- [ ] Constants are in UPPER_SNAKE_CASE
- [ ] No abbreviations or acronyms without explanation
- [ ] No magic numbers or strings
- [ ] TypeScript types have clear, descriptive names
- [ ] Enum values are self-explanatory