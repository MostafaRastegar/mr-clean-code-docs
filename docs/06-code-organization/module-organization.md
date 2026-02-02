# Module Organization

## Overview

Module organization is a critical aspect of writing maintainable and scalable JavaScript and TypeScript applications. Proper module design promotes code reusability, testability, and separation of concerns. This document provides comprehensive guidelines for organizing modules effectively.

## Module Design Principles

### 1. Single Responsibility Principle (SRP)

Each module should have one, and only one, reason to change. Focus on a single, well-defined purpose.

**✅ Good Module Design:**
```typescript
// userValidator.ts - Single responsibility: validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

**❌ Bad Module Design:**
```typescript
// userUtils.ts - Too many responsibilities
export function validateEmail(email: string): boolean { /* ... */ }
export function hashPassword(password: string): string { /* ... */ }
export function sendEmail(to: string, subject: string, body: string): Promise<void> { /* ... */ }
export function createUser(userData: any): Promise<User> { /* ... */ }
export function formatUserName(user: User): string { /* ... */ }
```

### 2. High Cohesion, Low Coupling

**High Cohesion:** Related functionality should be grouped together within the same module.

**Low Coupling:** Modules should depend on as few other modules as possible.

**✅ Good Cohesion Example:**
```typescript
// paymentProcessor.ts
export class PaymentProcessor {
  private gateway: PaymentGateway;
  private validator: PaymentValidator;
  private logger: Logger;

  constructor(gateway: PaymentGateway, validator: PaymentValidator, logger: Logger) {
    this.gateway = gateway;
    this.validator = validator;
    this.logger = logger;
  }

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    const validation = this.validator.validate(paymentData);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }

    return this.gateway.charge(paymentData);
  }
}
```

**❌ Bad Coupling Example:**
```typescript
// tightlyCoupled.ts - Direct dependencies everywhere
import { Database } from './database';
import { EmailService } from './emailService';
import { Logger } from './logger';
import { Cache } from './cache';

export class UserManager {
  private db = new Database();
  private emailService = new EmailService();
  private logger = new Logger();
  private cache = new Cache();

  // Direct instantiation creates tight coupling
}
```

### 3. Dependency Inversion

Depend on abstractions, not concretions. Use dependency injection to reduce coupling.

**✅ Using Dependency Injection:**
```typescript
// interfaces.ts
export interface ILogger {
  log(message: string): void;
  error(message: string): void;
}

export interface IEmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

// userService.ts
export class UserService {
  constructor(
    private logger: ILogger,
    private emailService: IEmailService
  ) {}

  async createUser(userData: CreateUserDto): Promise<User> {
    this.logger.log('Creating user...');
    // ... implementation
    await this.emailService.send(userData.email, 'Welcome!', 'Welcome message');
    return user;
  }
}

// container.ts - Dependency injection container
export class Container {
  private services = new Map<string, any>();

  register<T>(token: string, implementation: T): void {
    this.services.set(token, implementation);
  }

  resolve<T>(token: string): T {
    return this.services.get(token);
  }
}
```

## Import/Export Strategies

### 1. Named Exports vs Default Exports

**Prefer Named Exports:**
```typescript
// utils.ts
export function formatDate(date: Date): string { /* ... */ }
export function parseDate(dateString: string): Date { /* ... */ }
export const DEFAULT_FORMAT = 'YYYY-MM-DD';

// Usage
import { formatDate, parseDate, DEFAULT_FORMAT } from './utils';
```

**Avoid Default Exports:**
```typescript
// ❌ Avoid this pattern
export default function formatDate(date: Date): string { /* ... */ }

// Usage becomes less explicit
import formatDate from './utils';
```

### 2. Barrel Exports

Create index files to provide clean import paths and control the public API.

**✅ Barrel Export Pattern:**
```typescript
// components/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
export { Card } from './Card';

// Usage
import { Button, Input, Modal, Card } from './components';
```

**❌ Avoid Wildcard Exports:**
```typescript
// ❌ Don't do this
export * from './Button';
export * from './Input';
// This exposes everything, including internals
```

### 3. Re-exports with Aliases

Use re-exports when you need to rename exports or provide different names for different contexts.

```typescript
// legacy/index.ts
export { formatDate as formatLegacyDate } from '../utils/date';
export { parseDate as parseLegacyDate } from '../utils/date';
```

## Circular Dependency Prevention

### 1. Identify Circular Dependencies

Use tools to detect circular dependencies:

```bash
# Using madge
npx madge --circular src/

# Using webpack
webpack --stats-circular
```

### 2. Break Circular Dependencies

**Strategy 1: Extract Shared Dependencies**
```typescript
// Before: Circular dependency
// userService.ts
import { OrderService } from './orderService';

// orderService.ts
import { UserService } from './userService';

// After: Extract shared interface
// interfaces.ts
export interface IUserService {
  getUser(id: string): Promise<User>;
}

export interface IOrderService {
  getOrders(userId: string): Promise<Order[]>;
}

// userService.ts
export class UserService implements IUserService {
  constructor(private orderService: IOrderService) {}
}

// orderService.ts
export class OrderService implements IOrderService {
  constructor(private userService: IUserService) {}
}
```

**Strategy 2: Use Dependency Injection**
```typescript
// container.ts
export class ServiceContainer {
  private services = new Map<string, any>();

  register<T>(token: string, factory: () => T): void {
    this.services.set(token, factory());
  }

  resolve<T>(token: string): T {
    return this.services.get(token);
  }
}

// bootstrap.ts
const container = new ServiceContainer();
container.register('userService', () => new UserService());
container.register('orderService', () => new OrderService(
  container.resolve('userService')
));
```

**Strategy 3: Event-Driven Architecture**
```typescript
// events.ts
export class EventBus {
  private listeners = new Map<string, Function[]>();

  emit(event: string, data: any): void {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  on(event: string, handler: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }
}

// userService.ts
export class UserService {
  constructor(private eventBus: EventBus) {}

  async createUser(userData: any): Promise<User> {
    const user = await this.createUserInDatabase(userData);
    this.eventBus.emit('user:created', user);
    return user;
  }
}

// notificationService.ts
export class NotificationService {
  constructor(private eventBus: EventBus) {
    this.eventBus.on('user:created', (user) => {
      this.sendWelcomeEmail(user);
    });
  }
}
```

## Module Boundaries and Encapsulation

### 1. Public vs Private APIs

Clearly define what should be exposed outside the module.

```typescript
// utils/index.ts - Public API
export { formatDate } from './date';
export { validateEmail } from './validation';
// Don't export internal utilities

// utils/date.ts - Internal implementation
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Don't export this - it's internal
function parseIsoDate(dateString: string): Date {
  return new Date(dateString);
}
```

### 2. Module Facade Pattern

Create a single entry point that exposes only what's needed.

```typescript
// payment/index.ts - Facade
export { PaymentProcessor } from './processor';
export { PaymentValidator } from './validator';
export type { PaymentData, PaymentResult } from './types';

// Internal modules are not exported
// payment/gateway.ts - Not exported
// payment/logger.ts - Not exported
```

### 3. Information Hiding

Use TypeScript's access modifiers and module structure to hide implementation details.

```typescript
// logger.ts
export class Logger {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  // Public API
  log(message: string): void {
    this.addLog('info', message);
  }

  error(message: string): void {
    this.addLog('error', message);
  }

  // Private implementation
  private addLog(level: 'info' | 'error', message: string): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message
    };
    
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }
}
```

## Module Organization Patterns

### 1. Feature-Based Organization

Group related modules by feature rather than by type.

```typescript
// features/user/
├── index.ts              # Feature exports
├── components/
│   ├── UserProfile.tsx
│   └── UserSettings.tsx
├── services/
│   ├── userService.ts
│   └── userApi.ts
├── types/
│   ├── user.ts
│   └── api.ts
├── hooks/
│   ├── useUser.ts
│   └── useUserPreferences.ts
└── utils/
    ├── userHelpers.ts
    └── userValidators.ts

// features/order/
├── index.ts
├── components/
├── services/
├── types/
├── hooks/
└── utils/
```

### 2. Layer-Based Organization

Organize by architectural layers.

```typescript
// src/
├── presentation/
│   ├── components/
│   ├── pages/
│   └── layouts/
├── application/
│   ├── services/
│   ├── useCases/
│   └── dtos/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── services/
└── infrastructure/
    ├── database/
    ├── external-apis/
    └── config/
```

### 3. Domain-Driven Design (DDD)

Organize around business domains and bounded contexts.

```typescript
// src/
├── domains/
│   ├── user-management/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   └── repositories/
│   │   ├── application/
│   │   │   ├── services/
│   │   │   └── use-cases/
│   │   └── infrastructure/
│   │       ├── persistence/
│   │       └── external-services/
│   └── order-processing/
│       ├── domain/
│       ├── application/
│       └── infrastructure/
└── shared-kernel/
    ├── common/
    ├── events/
    └── types/
```

## Module Loading Strategies

### 1. Eager Loading

Load all modules at application startup.

```typescript
// main.ts
import { UserService } from './services/userService';
import { OrderService } from './services/orderService';
import { PaymentService } from './services/paymentService';

// All services are loaded immediately
const userService = new UserService();
const orderService = new OrderService();
const paymentService = new PaymentService();
```

### 2. Lazy Loading

Load modules only when needed.

```typescript
// lazyLoader.ts
export class LazyLoader<T> {
  private instance: T | null = null;
  private factory: () => Promise<T>;

  constructor(factory: () => Promise<T>) {
    this.factory = factory;
  }

  async getInstance(): Promise<T> {
    if (!this.instance) {
      this.instance = await this.factory();
    }
    return this.instance;
  }
}

// services.ts
export const userService = new LazyLoader(() => import('./userService').then(m => m.UserService));
export const orderService = new LazyLoader(() => import('./orderService').then(m => m.OrderService));

// Usage
const user = await (await userService.getInstance()).getUser('123');
```

### 3. Dynamic Imports

Use dynamic imports for code splitting and on-demand loading.

```typescript
// router.ts
const routes = [
  {
    path: '/dashboard',
    component: () => import('./components/Dashboard')
  },
  {
    path: '/profile',
    component: () => import('./components/Profile')
  }
];

// Component.tsx
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

## Module Testing Strategies

### 1. Unit Testing Modules

Test each module in isolation with mocked dependencies.

```typescript
// userService.test.ts
import { UserService } from './userService';
import { mock, MockProxy } from 'jest-mock-extended';
import { IEmailService } from './interfaces';

describe('UserService', () => {
  let userService: UserService;
  let mockEmailService: MockProxy<IEmailService>;

  beforeEach(() => {
    mockEmailService = mock<IEmailService>();
    userService = new UserService(mockEmailService);
  });

  it('should create user and send welcome email', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' };
    
    await userService.createUser(userData);

    expect(mockEmailService.send).toHaveBeenCalledWith(
      'test@example.com',
      'Welcome!',
      expect.any(String)
    );
  });
});
```

### 2. Integration Testing

Test module interactions without mocking external dependencies.

```typescript
// integration.test.ts
import { UserService } from './userService';
import { EmailService } from './emailService';
import { Database } from './database';

describe('User Integration', () => {
  let userService: UserService;
  let emailService: EmailService;
  let database: Database;

  beforeEach(async () => {
    database = new Database(process.env.TEST_DB_URL);
    emailService = new EmailService(process.env.SMTP_CONFIG);
    userService = new UserService(emailService);
    
    await database.connect();
  });

  afterEach(async () => {
    await database.disconnect();
  });

  it('should create user and send email in real scenario', async () => {
    const userData = { email: 'integration@test.com', name: 'Integration User' };
    
    const user = await userService.createUser(userData);

    expect(user.email).toBe('integration@test.com');
    // Verify email was actually sent
  });
});
```

### 3. Module Boundary Testing

Test that modules don't leak internal implementation details.

```typescript
// module-boundary.test.ts
import * as userModule from './user';

describe('User Module Boundary', () => {
  it('should only export expected public APIs', () => {
    const publicExports = Object.keys(userModule);
    const expectedExports = ['UserService', 'User', 'createUserDto'];
    
    expect(publicExports).toEqual(expect.arrayContaining(expectedExports));
    expect(publicExports.length).toBe(expectedExports.length);
  });

  it('should not export internal utilities', () => {
    const publicExports = Object.keys(userModule);
    const internalUtilities = ['_validateEmail', '_hashPassword'];
    
    internalUtilities.forEach(util => {
      expect(publicExports).not.toContain(util);
    });
  });
});
```

## Performance Considerations

### 1. Tree Shaking

Ensure your modules are tree-shakeable by avoiding side effects in imports.

```typescript
// ❌ Bad: Side effects in module scope
import { registerPlugin } from './pluginSystem';
registerPlugin('myPlugin'); // Side effect

// ✅ Good: No side effects
export { registerPlugin } from './pluginSystem';
// Let consumers decide when to call registerPlugin
```

### 2. Bundle Size Optimization

Use selective imports and avoid importing entire libraries.

```typescript
// ❌ Bad: Imports entire library
import _ from 'lodash';
const result = _.map(array, fn);

// ✅ Good: Selective import
import { map } from 'lodash';
const result = map(array, fn);

// ✅ Better: Use native methods when possible
const result = array.map(fn);
```

### 3. Module Splitting

Split large modules into smaller, focused modules.

```typescript
// ❌ Bad: Large monolithic module
// utils.ts - 1000+ lines of various utilities

// ✅ Good: Split by concern
// dateUtils.ts - Date-related utilities
// stringUtils.ts - String manipulation utilities
// arrayUtils.ts - Array utilities
// validationUtils.ts - Validation utilities
```

## Common Module Organization Patterns

### 1. Repository Pattern

Separate data access logic from business logic.

```typescript
// repositories/userRepository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

export class UserRepository implements IUserRepository {
  constructor(private database: Database) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.database.query('SELECT * FROM users WHERE id = ?', [id]);
    return result.length > 0 ? result[0] : null;
  }

  // ... other methods
}

// services/userService.ts
export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async getUser(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }
}
```

### 2. Factory Pattern

Use factories to create complex objects or handle object creation logic.

```typescript
// factories/userFactory.ts
export class UserFactory {
  static create(userData: CreateUserDto): User {
    return {
      id: generateId(),
      email: userData.email,
      name: userData.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: userData.role || 'user',
      isActive: true
    };
  }

  static createFromLegacyData(legacyData: LegacyUserData): User {
    return {
      id: legacyData.userId,
      email: legacyData.emailAddress,
      name: `${legacyData.firstName} ${legacyData.lastName}`,
      createdAt: new Date(legacyData.createdDate),
      updatedAt: new Date(legacyData.lastModifiedDate),
      role: legacyData.userRole,
      isActive: legacyData.activeStatus === 'Y'
    };
  }
}
```

### 3. Strategy Pattern

Use strategies to encapsulate different algorithms or behaviors.

```typescript
// strategies/paymentStrategy.ts
export interface IPaymentStrategy {
  processPayment(amount: number, paymentData: any): Promise<PaymentResult>;
  validatePaymentData(paymentData: any): boolean;
}

export class CreditCardStrategy implements IPaymentStrategy {
  processPayment(amount: number, paymentData: CreditCardData): Promise<PaymentResult> {
    // Credit card processing logic
  }

  validatePaymentData(paymentData: CreditCardData): boolean {
    return !!paymentData.cardNumber && !!paymentData.cvv;
  }
}

export class PayPalStrategy implements IPaymentStrategy {
  processPayment(amount: number, paymentData: PayPalData): Promise<PaymentResult> {
    // PayPal processing logic
  }

  validatePaymentData(paymentData: PayPalData): boolean {
    return !!paymentData.email && !!paymentData.token;
  }
}

// context.ts
export class PaymentContext {
  constructor(private strategy: IPaymentStrategy) {}

  setStrategy(strategy: IPaymentStrategy): void {
    this.strategy = strategy;
  }

  async processPayment(amount: number, paymentData: any): Promise<PaymentResult> {
    if (!this.strategy.validatePaymentData(paymentData)) {
      throw new Error('Invalid payment data');
    }
    return this.strategy.processPayment(amount, paymentData);
  }
}
```

## Module Documentation

### 1. JSDoc Comments

Document your modules with JSDoc comments.

```typescript
/**
 * User service for managing user operations
 * 
 * @example
 * ```typescript
 * const userService = new UserService(emailService);
 * const user = await userService.createUser({
 *   email: 'user@example.com',
 *   name: 'John Doe'
 * });
 * ```
 */
export class UserService {
  /**
   * Creates a new user
   * @param userData - User data to create
   * @returns Promise resolving to the created user
   * @throws ValidationError if user data is invalid
   */
  async createUser(userData: CreateUserDto): Promise<User> {
    // Implementation
  }
}
```

### 2. Module README Files

Create README files for complex modules.

```markdown
# User Module

Handles all user-related operations including creation, authentication, and management.

## Exports

- `UserService` - Main service for user operations
- `User` - User entity type
- `CreateUserDto` - Data transfer object for user creation

## Dependencies

- `EmailService` - For sending welcome emails
- `Database` - For user persistence

## Usage

```typescript
import { UserService } from './user';

const userService = new UserService(emailService);
const user = await userService.createUser(userData);
```
```

### 3. Architecture Documentation

Document module relationships and architecture decisions.

```markdown
# Module Architecture

## Overview

The application is organized into feature-based modules with clear boundaries.

## Module Relationships

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │   Order     │    │  Payment    │
│   Module    │───▶│   Module    │───▶│   Module    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Database   │    │   Email     │    │   Gateway   │
│ Repository  │    │  Service    │    │   Service   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Dependencies

- User module depends on Email service for notifications
- Order module depends on User module for user validation
- Payment module depends on Order module for order details
```

## Migration Strategies

### 1. From Monolithic to Modular

**Step 1: Identify Module Boundaries**
```typescript
// Before: Monolithic file
// app.ts - 2000+ lines of mixed functionality

// After: Identify boundaries
// userModule/
// orderModule/
// paymentModule/
```

**Step 2: Extract Modules**
```typescript
// Extract user-related functionality
// userModule/userService.ts
export class UserService { /* ... */ }

// userModule/userRepository.ts
export class UserRepository { /* ... */ }

// userModule/types.ts
export interface User { /* ... */ }
```

**Step 3: Update Dependencies**
```typescript
// Update imports
// Before
import { UserService, UserRepository, User } from './app';

// After
import { UserService } from './userModule/userService';
import { UserRepository } from './userModule/userRepository';
import { User } from './userModule/types';
```

### 2. From CommonJS to ES Modules

**Update package.json:**
```json
{
  "type": "module"
}
```

**Convert imports/exports:**
```javascript
// Before: CommonJS
const express = require('express');
const { UserService } = require('./userService');
module.exports = { App };

// After: ES Modules
import express from 'express';
import { UserService } from './userService';
export { App };
```

### 3. From Script Tags to Module System

**Before:**
```html
<script src="utils.js"></script>
<script src="userService.js"></script>
<script src="app.js"></script>
```

**After:**
```typescript
// app.ts
import { UserService } from './userService';
import { formatDate } from './utils';

const userService = new UserService();
```

Remember: Good module organization is essential for maintainable, scalable applications. Focus on clear boundaries, loose coupling, and high cohesion. Document your module structure and enforce consistency through code reviews and automated tools.