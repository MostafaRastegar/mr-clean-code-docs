# Classes and Interfaces

## Overview

Classes and interfaces define the blueprints for objects in your application. Good naming helps developers understand the purpose, responsibilities, and relationships between different parts of your system.

## Core Principles

### 1. Use Noun Phrases

Classes represent things or concepts, so use noun phrases that clearly describe what they are.

**❌ Bad:**
```javascript
class UserManagement { /* Too generic */ }
class DataHandler { /* Too generic */ }
class Process { /* Too generic */ }
```

**✅ Good:**
```javascript
class UserManager { /* Specific responsibility */ }
class UserDataProcessor { /* Specific purpose */ }
class OrderProcessor { /* Specific domain */ }
```

### 2. Be Specific and Descriptive

Avoid generic names that don't convey the class's specific purpose.

**❌ Bad:**
```javascript
class Service { /* What kind of service? */ }
class Manager { /* What does it manage? */ }
class Handler { /* What does it handle? */ }
class Processor { /* What does it process? */ }
```

**✅ Good:**
```javascript
class EmailService { /* Specific service */ }
class UserManager { /* Specific manager */ }
class PaymentHandler { /* Specific handler */ }
class DataProcessor { /* Specific processor */ }
```

### 3. Use Problem Domain Names

Use terminology from your business domain rather than technical jargon.

**❌ Bad:**
```javascript
class DataObject { /* Technical term */ }
class BusinessObject { /* Technical term */ }
class Entity { /* Technical term */ }
```

**✅ Good:**
```javascript
class Customer { /* Business domain */ }
class Order { /* Business domain */ }
class Product { /* Business domain */ }
```

### 4. Indicate Responsibility

Class names should indicate what the class is responsible for.

**✅ Examples:**
```javascript
class ShoppingCart { /* Manages shopping cart */ }
class PaymentProcessor { /* Processes payments */ }
class UserValidator { /* Validates users */ }
class ReportGenerator { /* Generates reports */ }
class ConfigurationLoader { /* Loads configuration */ }
```

## Class Naming Patterns

### 1. Entity Classes

Represent business entities or domain objects.

**✅ Examples:**
```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

class Product {
  constructor(id, name, price) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
}

class Order {
  constructor(id, items, customer) {
    this.id = id;
    this.items = items;
    this.customer = customer;
    this.createdAt = new Date();
  }
}
```

### 2. Service Classes

Provide business logic and operations.

**✅ Examples:**
```javascript
class EmailService {
  sendWelcomeEmail(user) { /* ... */ }
  sendOrderConfirmation(order) { /* ... */ }
  sendPasswordResetEmail(user) { /* ... */ }
}

class PaymentService {
  processPayment(amount, method) { /* ... */ }
  refundPayment(transactionId) { /* ... */ }
  validatePaymentMethod(method) { /* ... */ }
}

class NotificationService {
  sendPushNotification(user, message) { /* ... */ }
  sendSMS(phone, message) { /* ... */ }
  sendEmail(recipient, subject, body) { /* ... */ }
```

### 3. Manager Classes

Coordinate and manage other objects or resources.

**✅ Examples:**
```javascript
class UserManager {
  createUser(userData) { /* ... */ }
  updateUser(id, updates) { /* ... */ }
  deleteUser(id) { /* ... */ }
  getUserById(id) { /* ... */ }
}

class DatabaseManager {
  connect(connectionString) { /* ... */ }
  disconnect() { /* ... */ }
  executeQuery(query) { /* ... */ }
  beginTransaction() { /* ... */ }
}

class CacheManager {
  set(key, value, ttl) { /* ... */ }
  get(key) { /* ... */ }
  delete(key) { /* ... */ }
  clear() { /* ... */ }
}
```

### 4. Factory Classes

Create and configure other objects.

**✅ Examples:**
```javascript
class UserFactory {
  static createUser(userData) {
    return new User(userData.name, userData.email);
  }

  static createAdminUser(userData) {
    const user = new User(userData.name, userData.email);
    user.role = 'admin';
    return user;
  }
}

class PaymentMethodFactory {
  static createPaymentMethod(type, config) {
    switch (type) {
      case 'credit_card':
        return new CreditCardPayment(config);
      case 'paypal':
        return new PayPalPayment(config);
      case 'bank_transfer':
        return new BankTransferPayment(config);
      default:
        throw new Error(`Unknown payment type: ${type}`);
    }
  }
}
```

### 5. Utility Classes

Provide helper functions and utilities.

**✅ Examples:**
```javascript
class StringUtils {
  static capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  static truncate(string, maxLength) {
    return string.length > maxLength ? string.slice(0, maxLength) + '...' : string;
  }
}

class DateUtils {
  static format(date, format) { /* ... */ }
  static isWeekend(date) { /* ... */ }
  static addDays(date, days) { /* ... */ }
  static getAge(birthDate) { /* ... */ }
}

class MathUtils {
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  static randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
```

## Interface Naming

### 1. Use Adjectives for Behavioral Interfaces

Interfaces that describe capabilities should use adjectives.

**✅ Examples:**
```javascript
interface Drawable {
  draw(): void;
}

interface Serializable {
  serialize(): string;
}

interface Validatable {
  validate(): ValidationResult;
}

interface Comparable<T> {
  compareTo(other: T): number;
}
```

### 2. Use Nouns for Data Interfaces

Interfaces that describe data structures should use nouns.

**✅ Examples:**
```javascript
interface User {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
}
```

### 3. Use -able Suffix for Capability Interfaces

Interfaces that describe what an object can do should use the `-able` suffix.

**✅ Examples:**
```javascript
interface Configurable {
  configure(options: ConfigOptions): void;
}

interface Connectable {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

interface Observable<T> {
  subscribe(callback: (value: T) => void): Subscription;
  unsubscribe(callback: (value: T) => void): void;
}
```

### 4. Use -er Suffix for Service Interfaces

Interfaces that describe services should use the `-er` suffix.

**✅ Examples:**
```javascript
interface Logger {
  log(message: string): void;
  error(message: string): void;
  warn(message: string): void;
}

interface Validator<T> {
  validate(value: T): ValidationResult;
}

interface Processor<T, U> {
  process(input: T): U;
}
```

## TypeScript-Specific Considerations

### 1. Interface vs Type Aliases

Use interfaces for object shapes and types for other constructs.

**✅ Examples:**
```typescript
// Use interface for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// Use type for unions, primitives, etc.
type UserId = string;
type UserRole = 'admin' | 'user' | 'guest';
type Nullable<T> = T | null;
```

### 2. Generic Interfaces

Use descriptive names for generic type parameters.

**✅ Examples:**
```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

interface EventHandler<T extends Event> {
  handle(event: T): void;
}

interface Mapper<T, U> {
  map(source: T): U;
}
```

### 3. Abstract Classes

Use abstract classes for shared implementation with required overrides.

**✅ Examples:**
```typescript
abstract class BaseService<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract save(entity: T): Promise<T>;

  async create(entity: T): Promise<T> {
    // Common creation logic
    return this.save(entity);
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    
    // Common update logic
    return this.save({ ...existing, ...updates });
  }
}

abstract class Shape {
  abstract calculateArea(): number;
  abstract calculatePerimeter(): number;

  getArea(): number {
    return this.calculateArea();
  }
}
```

## Common Pitfalls and Solutions

### 1. Too Generic Names

**❌ Bad:**
```javascript
class Manager { /* What does it manage? */ }
class Handler { /* What does it handle? */ }
class Processor { /* What does it process? */ }
```

**✅ Good:**
```javascript
class UserManager { /* Specific management */ }
class PaymentHandler { /* Specific handling */ }
class DataProcessor { /* Specific processing */ }
```

### 2. Implementation Details in Names

**❌ Bad:**
```javascript
class UserArrayManager { /* Implementation detail */ }
class DatabaseConnectionHandler { /* Implementation detail */ }
class JsonParser { /* Implementation detail */ }
```

**✅ Good:**
```javascript
class UserManager { /* Focus on responsibility */ }
class ConnectionHandler { /* Focus on responsibility */ }
class DataParser { /* Focus on responsibility */ }
```

### 3. Inconsistent Naming Patterns

**❌ Bad:**
```javascript
class UserService { /* Service pattern */ }
class UserHandler { /* Handler pattern */ }
class UserProcessor { /* Processor pattern */ }
class User { /* Entity pattern */ }
```

**✅ Good:**
```javascript
class UserService { /* All services */ }
class EmailService { /* All services */ }
class PaymentService { /* All services */ }
class NotificationService { /* All services */ }
```

### 4. Misleading Names

**❌ Bad:**
```javascript
class UserManager {
  // Actually just validates users, doesn't manage them
  validateUser(user) { /* ... */ }
}

class DataProcessor {
  // Actually just stores data, doesn't process it
  saveData(data) { /* ... */ }
}
```

**✅ Good:**
```javascript
class UserValidator {
  validateUser(user) { /* ... */ }
}

class DataStorage {
  saveData(data) { /* ... */ }
}
```

## Best Practices Summary

1. **Use noun phrases**: `User`, `Order`, `PaymentService`
2. **Be specific**: `EmailService` instead of `Service`
3. **Use domain language**: `Customer` instead of `DataObject`
4. **Indicate responsibility**: `PaymentProcessor` instead of `Processor`
5. **Use consistent patterns**: Stick to one naming convention per category
6. **Avoid implementation details**: Focus on what, not how
7. **Use appropriate suffixes**: `-able` for capabilities, `-er` for services
8. **Be truthful**: Name should match the class's actual purpose

## Examples in Context

### E-commerce Application
```javascript
// Entities
class Customer {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

class Product {
  constructor(id, name, price, inventory) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.inventory = inventory;
  }
}

class ShoppingCart {
  constructor(customerId) {
    this.customerId = customerId;
    this.items = [];
  }
}

// Services
class PaymentService {
  async processPayment(amount, method) { /* ... */ }
  async refundPayment(transactionId) { /* ... */ }
}

class InventoryService {
  async checkAvailability(productId, quantity) { /* ... */ }
  async reserveItems(items) { /* ... */ }
  async releaseReservation(reservationId) { /* ... */ }
}

class ShippingService {
  async calculateShippingCost(address, items) { /* ... */ }
  async createShipment(order) { /* ... */ }
}

// Interfaces
interface PaymentMethod {
  processPayment(amount: number): Promise<PaymentResult>;
  validate(): boolean;
}

interface ShippingProvider {
  calculateCost(address: Address, weight: number): Promise<number>;
  createShipment(shipment: Shipment): Promise<ShipmentResult>;
}
```

### API Development
```javascript
// Request/Response classes
class ApiRequest {
  constructor(method, url, headers, body) {
    this.method = method;
    this.url = url;
    this.headers = headers;
    this.body = body;
  }
}

class ApiResponse {
  constructor(status, data, headers) {
    this.status = status;
    this.data = data;
    this.headers = headers;
  }
}

// Middleware classes
class AuthenticationMiddleware {
  authenticate(request) { /* ... */ }
}

class ValidationMiddleware {
  validate(request, schema) { /* ... */ }
}

class LoggingMiddleware {
  log(request, response) { /* ... */ }
}

// Interfaces
interface RequestHandler {
  handle(request: ApiRequest): Promise<ApiResponse>;
}

interface Middleware {
  process(request: ApiRequest, next: RequestHandler): Promise<ApiResponse>;
}
```

Remember: Class and interface names are the vocabulary of your application. Choose names that clearly communicate purpose, responsibility, and relationships within your system.