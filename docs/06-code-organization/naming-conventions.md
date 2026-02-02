# Naming Conventions

## Overview

Consistent naming conventions are essential for writing readable, maintainable, and professional JavaScript and TypeScript code. This document provides comprehensive guidelines for naming files, directories, variables, functions, classes, and other code elements.

## File and Directory Naming

### 1. File Naming Conventions

**Use kebab-case for file names:**
```bash
# ✅ Good file names
user-profile.ts
shopping-cart.vue
api-client.js
date-helpers.ts

# ❌ Avoid these patterns
UserProfile.ts          # PascalCase
user_profile.ts         # snake_case
userProfile.ts          # camelCase
```

**File naming by content type:**
```bash
# Components
button.component.ts
modal.component.vue
card.component.jsx

# Services
user.service.ts
api.service.js
notification.service.ts

# Utilities
date.utils.ts
string.helpers.js
validation.utils.ts

# Tests
user.service.test.ts
button.component.spec.ts
api.utils.test.js

# Configuration
webpack.config.js
tsconfig.json
eslint.config.js
```

**Special file naming patterns:**
```bash
# Entry points
index.ts
main.js
app.ts

# Configuration files
.env.development
.env.production
.env.staging

# Build artifacts
dist/
build/
out/
```

### 2. Directory Naming Conventions

**Use kebab-case for directories:**
```bash
# ✅ Good directory structure
src/
├── components/
│   ├── user-profile/
│   ├── shopping-cart/
│   └── navigation-menu/
├── services/
│   ├── api-client/
│   └── notification-service/
├── utils/
│   ├── date-helpers/
│   └── validation-utils/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

**Directory naming by purpose:**
```bash
# Feature-based directories
features/
├── authentication/
├── dashboard/
└── user-management/

# Layer-based directories
src/
├── presentation/
├── application/
├── domain/
└── infrastructure/

# Type-based directories
components/
services/
utils/
types/
hooks/
```

## Variable Naming

### 1. Basic Variable Naming Rules

**Use camelCase for variables:**
```typescript
// ✅ Good variable names
const userName = 'John Doe';
const isUserLoggedIn = true;
const userProfileData = { /* ... */ };
const maxRetriesCount = 3;

// ❌ Avoid these patterns
const user_name = 'John Doe';        // snake_case
const UserName = 'John Doe';         // PascalCase
const user-name = 'John Doe';        // kebab-case
const un = 'John Doe';               // Too short
```

**Use descriptive and meaningful names:**
```typescript
// ✅ Descriptive names
const emailAddress = 'user@example.com';
const isSubscriptionActive = true;
const maximumLoginAttempts = 5;
const shoppingCartItems = [];

// ❌ Non-descriptive names
const email = 'user@example.com';    // Too generic
const active = true;                 // Unclear what it refers to
const max = 5;                       // Missing context
const items = [];                    // Missing context
```

### 2. Boolean Variable Naming

**Use prefixes for boolean variables:**
```typescript
// ✅ Good boolean naming
const isLoading = false;
const hasPermission = true;
const isUserAuthenticated = false;
const canEditProfile = true;
const shouldShowModal = false;

// ❌ Avoid these patterns
const loading = false;               // Missing 'is' prefix
const permission = true;             // Missing 'has' prefix
const authenticated = false;         // Missing 'is' prefix
const editProfile = true;            // Missing 'can' prefix
const showModal = false;             // Missing 'should' prefix
```

### 3. Constants Naming

**Use UPPER_SNAKE_CASE for constants:**
```typescript
// ✅ Good constant naming
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_TIMEOUT = 5000;
const SUPPORTED_FORMATS = ['jpg', 'png', 'gif'];

// ❌ Avoid these patterns
const maxRetryAttempts = 3;          // Should be UPPER_SNAKE_CASE
const apiBaseUrl = 'https://api.example.com';  // Should be UPPER_SNAKE_CASE
const defaultTimeout = 5000;         // Should be UPPER_SNAKE_CASE
```

**Special case for exported constants:**
```typescript
// For exported constants, consider using PascalCase
export const ApiBaseUrl = 'https://api.example.com';
export const MaxRetryAttempts = 3;
export const DefaultTimeout = 5000;
```

### 4. Array and Collection Naming

**Use plural names for arrays and collections:**
```typescript
// ✅ Good collection naming
const users = [];
const shoppingCartItems = [];
const errorMessages = [];
const selectedProducts = new Set();

// ❌ Avoid these patterns
const user = [];                     // Should be plural
const shoppingCartItem = [];         // Should be plural
const errorMessage = [];             // Should be plural
```

**Use descriptive names for collections:**
```typescript
// ✅ Descriptive collection names
const activeUsers = [];
const pendingOrders = [];
const completedTasks = [];
const favoriteProducts = new Map();

// ❌ Non-descriptive names
const list = [];                     // Too generic
const data = [];                     // Too generic
const items = [];                    // Too generic
```

## Function Naming

### 1. Function Naming Conventions

**Use camelCase for function names:**
```typescript
// ✅ Good function naming
function calculateTotalPrice(items) {
  // Implementation
}

function validateEmail(email) {
  // Implementation
}

function formatUserName(user) {
  // Implementation
}

function getUserProfile(userId) {
  // Implementation
}

// ❌ Avoid these patterns
function CalculateTotalPrice(items) {  // PascalCase
function calculate_total_price(items) { // snake_case
function calculate-total-price(items) { // kebab-case
```

### 2. Function Naming by Purpose

**Use verbs for function names:**
```typescript
// ✅ Action-oriented function names
function createUser(userData) { /* ... */ }
function deleteUser(userId) { /* ... */ }
function updateUserProfile(data) { /* ... */ }
function validateForm(formData) { /* ... */ }
function formatCurrency(amount) { /* ... */ }
function parseJsonString(jsonString) { /* ... */ }

// ❌ Avoid noun-based function names
function user(userData) { /* ... */ }
function deletion(userId) { /* ... */ }
function profile(data) { /* ... */ }
```

**Use specific verbs:**
```typescript
// ✅ Specific action verbs
function fetchUserData() { /* ... */ }
function saveUserProfile() { /* ... */ }
function updateSettings() { /* ... */ }
function deleteAccount() { /* ... */ }
function submitForm() { /* ... */ }
function resetPassword() { /* ... */ }

// ❌ Avoid generic verbs
function doSomething() { /* ... */ }
function handleData() { /* ... */ }
function processData() { /* ... */ }
function manageUser() { /* ... */ }
```

### 3. Async Function Naming

**Use 'async' suffix or 'get' prefix for async functions:**
```typescript
// ✅ Clear async function naming
async function fetchUserDataAsync() {
  // Implementation
}

async function getUserProfile() {
  // Implementation
}

async function loadConfiguration() {
  // Implementation
}

// ❌ Avoid unclear async naming
async function userData() { /* ... */ }
async function profile() { /* ... */ }
async function config() { /* ... */ }
```

### 4. Event Handler Naming

**Use 'handle' prefix for event handlers:**
```typescript
// ✅ Good event handler naming
function handleClick(event) {
  // Implementation
}

function handleSubmit(formData) {
  // Implementation
}

function handleInputChange(value) {
  // Implementation
}

function handleUserLogin(user) {
  // Implementation
}

// ❌ Avoid unclear event handler names
function click(event) { /* ... */ }
function submit(formData) { /* ... */ }
function inputChange(value) { /* ... */ }
```

## Class Naming

### 1. Class Naming Conventions

**Use PascalCase for class names:**
```typescript
// ✅ Good class naming
class UserService {
  // Implementation
}

class UserProfile {
  // Implementation
}

class ShoppingCart {
  // Implementation
}

class ApiClient {
  // Implementation
}

// ❌ Avoid these patterns
class userService { /* ... */ }      // camelCase
class user_service { /* ... */ }     // snake_case
class user-service { /* ... */ }     // kebab-case
```

### 2. Class Naming by Purpose

**Use nouns for class names:**
```typescript
// ✅ Noun-based class names
class User {
  // Implementation
}

class Product {
  // Implementation
}

class ShoppingCart {
  // Implementation
}

class DatabaseConnection {
  // Implementation
}

// ❌ Avoid verb-based class names
class CreateUser { /* ... */ }
class ManageUser { /* ... */ }
class HandleProduct { /* ... */ }
```

**Use descriptive class names:**
```typescript
// ✅ Descriptive class names
class UserProfileManager {
  // Implementation
}

class ShoppingCartService {
  // Implementation
}

class ApiAuthenticationClient {
  // Implementation
}

class DatabaseConnectionPool {
  // Implementation
}

// ❌ Non-descriptive class names
class Manager { /* ... */ }
class Service { /* ... */ }
class Client { /* ... */ }
class Pool { /* ... */ }
```

### 3. Interface Naming

**Use PascalCase for interfaces:**
```typescript
// ✅ Good interface naming
interface UserService {
  // Interface definition
}

interface UserProfile {
  // Interface definition
}

interface ShoppingCart {
  // Interface definition
}

// ❌ Avoid 'I' prefix (TypeScript convention)
interface IUserService { /* ... */ } // C# style
interface IUserProfile { /* ... */ } // C# style
```

**Use descriptive interface names:**
```typescript
// ✅ Descriptive interface names
interface UserProfileData {
  id: string;
  name: string;
  email: string;
}

interface ShoppingCartItem {
  productId: string;
  quantity: number;
  price: number;
}

interface ApiConfiguration {
  baseUrl: string;
  timeout: number;
  retries: number;
}

// ❌ Non-descriptive interface names
interface Data { /* ... */ }
interface Item { /* ... */ }
interface Config { /* ... */ }
```

## TypeScript-Specific Naming

### 1. Type Alias Naming

**Use PascalCase for type aliases:**
```typescript
// ✅ Good type alias naming
type UserProfile = {
  id: string;
  name: string;
  email: string;
};

type ShoppingCartItem = {
  productId: string;
  quantity: number;
  price: number;
};

type ApiError = {
  code: string;
  message: string;
  details?: any;
};

// ❌ Avoid these patterns
type userProfile = { /* ... */ };     // camelCase
type user_profile = { /* ... */ };    // snake_case
```

### 2. Enum Naming

**Use PascalCase for enum names and UPPER_SNAKE_CASE for enum values:**
```typescript
// ✅ Good enum naming
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

enum HttpStatus {
  OK = 200,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

// ❌ Avoid these patterns
enum userRole { /* ... */ }           // camelCase
enum UserRole {                       // PascalCase values
  admin = 'admin',
  user = 'user'
}
```

### 3. Generic Type Parameters

**Use descriptive names for generic type parameters:**
```typescript
// ✅ Good generic naming
function processArray<T>(items: T[]): T[] {
  // Implementation
}

class Repository<T, ID> {
  findById(id: ID): T | null {
    // Implementation
  }
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// ❌ Avoid single letter generics (except in simple cases)
function processArray<T>(items: T[]): T[] { /* ... */ } // Acceptable
function processArray<Item>(items: Item[]): Item[] { /* ... */ } // Better
```

## Component Naming (React/Vue/Angular)

### 1. Component Naming Conventions

**Use PascalCase for component names:**
```tsx
// ✅ Good component naming
function UserProfile({ user }: UserProfileProps) {
  // Implementation
}

function ShoppingCart({ items }: ShoppingCartProps) {
  // Implementation
}

const Dashboard = () => {
  // Implementation
};

// ❌ Avoid these patterns
function userProfile({ user }: UserProfileProps) { /* ... */ } // camelCase
function user_profile({ user }: UserProfileProps) { /* ... */ } // snake_case
```

### 2. Component File Naming

**Match component name with file name:**
```tsx
// UserProfile.tsx
export function UserProfile({ user }: UserProfileProps) {
  // Implementation
}

// ShoppingCart.tsx
export function ShoppingCart({ items }: ShoppingCartProps) {
  // Implementation
}

// Dashboard.tsx
export const Dashboard = () => {
  // Implementation
};
```

### 3. Component Props Naming

**Use PascalCase for props interfaces:**
```tsx
// ✅ Good props naming
interface UserProfileProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}

interface ShoppingCartProps {
  items: ShoppingCartItem[];
  onAddItem: (item: Product) => void;
  onRemoveItem: (itemId: string) => void;
}

// ❌ Avoid these patterns
interface userProfileProps { /* ... */ } // camelCase
interface user_profile_props { /* ... */ } // snake_case
```

## Hook Naming (React)

### 1. Custom Hook Naming

**Use 'use' prefix for custom hooks:**
```tsx
// ✅ Good hook naming
function useAuth() {
  // Implementation
}

function useLocalStorage(key: string, initialValue: any) {
  // Implementation
}

function useApi<T>(url: string) {
  // Implementation
}

function useDebounce<T>(value: T, delay: number) {
  // Implementation
}

// ❌ Avoid these patterns
function auth() { /* ... */ }         // Missing 'use' prefix
function localStorageHook() { /* ... */ } // Not following convention
function apiHook() { /* ... */ }      // Not following convention
```

### 2. Hook Return Value Naming

**Use descriptive names for hook return values:**
```tsx
// ✅ Good return value naming
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const login = async (credentials: LoginCredentials) => {
    // Implementation
  };
  
  const logout = () => {
    // Implementation
  };
  
  return {
    user,
    isLoading,
    login,
    logout
  };
}

// ❌ Avoid generic return value names
function useAuth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  return {
    data,
    loading,
    action1: () => {},
    action2: () => {}
  };
}
```

## Test Naming

### 1. Test File Naming

**Use .test.ts or .spec.ts suffix:**
```typescript
// ✅ Good test file naming
user.service.test.ts
shopping-cart.component.spec.ts
api.utils.test.ts
date.helpers.spec.ts

// ❌ Avoid these patterns
user.test.ts                      // Missing context
test.user.service.ts              // Wrong order
user-service-test.ts              // kebab-case
```

### 2. Test Case Naming

**Use descriptive test names:**
```typescript
// ✅ Good test naming
describe('UserService', () => {
  it('should create a new user with valid data', () => {
    // Test implementation
  });

  it('should throw error when email is invalid', () => {
    // Test implementation
  });

  it('should return null when user not found', () => {
    // Test implementation
  });
});

// ❌ Avoid generic test names
describe('UserService', () => {
  it('test1', () => { /* ... */ });
  it('test2', () => { /* ... */ });
  it('should work', () => { /* ... */ });
});
```

### 3. Test Variable Naming

**Use clear and descriptive test variable names:**
```typescript
// ✅ Good test variable naming
describe('UserService', () => {
  let userService: UserService;
  let mockEmailService: MockEmailService;
  let validUserData: CreateUserDto;
  let invalidUserData: CreateUserDto;

  beforeEach(() => {
    mockEmailService = new MockEmailService();
    userService = new UserService(mockEmailService);
    validUserData = {
      email: 'test@example.com',
      name: 'Test User'
    };
    invalidUserData = {
      email: 'invalid-email',
      name: ''
    };
  });
});

// ❌ Avoid unclear test variable names
describe('UserService', () => {
  let service: any;
  let mock: any;
  let data: any;
  let badData: any;
});
```

## Best Practices Summary

### 1. Consistency

**Maintain consistency across your codebase:**
- Use the same naming conventions throughout
- Follow established patterns in your team/project
- Document your naming conventions

### 2. Clarity

**Prioritize clarity over brevity:**
- Use descriptive names that explain purpose
- Avoid abbreviations unless they're well-known
- Make names self-documenting

### 3. Context

**Consider the context when naming:**
- Use domain-specific terminology when appropriate
- Follow framework/library conventions
- Consider the audience (team members, external contributors)

### 4. Avoid Confusion

**Avoid names that can cause confusion:**
- Don't use similar names for different purposes
- Avoid names that are too generic
- Don't use names that could be confused with built-in types

### 5. Examples of Good vs Bad Naming

```typescript
// ✅ Good naming examples
const MAX_RETRY_ATTEMPTS = 3;
const isUserAuthenticated = false;
const shoppingCartItems = [];
const userProfileData = { /* ... */ };

function calculateTotalPrice(items: Product[]) {
  // Implementation
}

function validateEmail(email: string): boolean {
  // Implementation
}

class UserService {
  // Implementation
}

interface UserProfile {
  // Interface definition
}

// ❌ Bad naming examples
const max = 3;                       // Too generic
const auth = false;                  // Unclear
const items = [];                    // Missing context
const data = { /* ... */ };          // Too generic

function calc(items: Product[]) {    // Too short
  // Implementation
}

function email(email: string): boolean { // Confusing parameter name
  // Implementation
}

class Service {                      // Too generic
  // Implementation
}

interface Data {                     // Too generic
  // Interface definition
}
```

Remember: Good naming conventions make your code more readable, maintainable, and professional. They help other developers (and your future self) understand your code more quickly and reduce the likelihood of bugs and misunderstandings.