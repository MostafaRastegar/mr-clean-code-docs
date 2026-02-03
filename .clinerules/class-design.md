---
paths:
  - "src/**/*.js"
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "**/*.js"
  - "**/*.ts"
  - "**/*.tsx"
---

# Class Design

Classes are the foundation of object-oriented programming in JavaScript/TypeScript. Good class design leads to maintainable, extensible code.

## Core Principles

- Single responsibility
- High cohesion
- Low coupling
- Proper encapsulation
- Favor composition over inheritance
- Clear interfaces

## Single Responsibility Principle

### ✅ Good Examples
```javascript
// Each class has a single, clear responsibility
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async createUser(userData) {
    const user = new User(userData);
    return this.userRepository.save(user);
  }

  async getUserById(id) {
    return this.userRepository.findById(id);
  }
}

class EmailService {
  constructor(emailProvider) {
    this.emailProvider = emailProvider;
  }

  async sendWelcomeEmail(user) {
    const template = this.getWelcomeTemplate(user);
    return this.emailProvider.send(user.email, template);
  }

  getWelcomeTemplate(user) {
    return `Welcome ${user.name}!`;
  }
}
```

### ❌ Bad Examples
```javascript
// Class doing too many things
class UserManager {
  constructor() {
    this.users = [];
    this.emailProvider = new EmailProvider();
    this.logger = new Logger();
  }

  // User management
  createUser(userData) {
    const user = new User(userData);
    this.users.push(user);
    this.logger.log('User created');
    return user;
  }

  // Email sending
  sendWelcomeEmail(user) {
    this.emailProvider.send(user.email, 'Welcome!');
  }

  // Logging
  logUserAction(action, userId) {
    this.logger.log(`${action} for user ${userId}`);
  }

  // Data export
  exportUsers() {
    return JSON.stringify(this.users);
  }
}
```

## Encapsulation

### ✅ Good Examples
```javascript
class BankAccount {
  #balance = 0;
  #transactionHistory = [];

  constructor(initialBalance = 0) {
    this.#balance = initialBalance;
  }

  get balance() {
    return this.#balance;
  }

  deposit(amount) {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }
    this.#balance += amount;
    this.#addTransaction('deposit', amount);
  }

  withdraw(amount) {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    if (amount > this.#balance) {
      throw new Error('Insufficient funds');
    }
    this.#balance -= amount;
    this.#addTransaction('withdrawal', amount);
  }

  #addTransaction(type, amount) {
    this.#transactionHistory.push({
      type,
      amount,
      timestamp: new Date()
    });
  }

  getTransactionHistory() {
    return [...this.#transactionHistory];
  }
}
```

### ❌ Bad Examples
```javascript
class BankAccount {
  constructor() {
    this.balance = 0; // Public property
    this.transactionHistory = []; // Public property
  }

  // Direct property access
  updateBalance(amount) {
    this.balance += amount; // No validation
  }

  // Exposing internal state
  getBalance() {
    return this.balance;
  }

  // No encapsulation of internal logic
  addTransaction(type, amount) {
    this.transactionHistory.push({ type, amount }); // Direct manipulation
  }
}
```

## Inheritance vs Composition

### ✅ Good Examples
```javascript
// Composition over inheritance
class Engine {
  start() {
    console.log('Engine started');
  }
}

class Car {
  constructor() {
    this.engine = new Engine();
  }

  start() {
    this.engine.start();
    console.log('Car is ready to drive');
  }
}

// Strategy pattern with composition
class PaymentProcessor {
  constructor(paymentStrategy) {
    this.paymentStrategy = paymentStrategy;
  }

  processPayment(amount) {
    return this.paymentStrategy.charge(amount);
  }
}

class CreditCardStrategy {
  charge(amount) {
    // Credit card logic
  }
}

class PayPalStrategy {
  charge(amount) {
    // PayPal logic
  }
}
```

### ❌ Bad Examples
```javascript
// Deep inheritance hierarchy
class Vehicle {
  start() {}
  stop() {}
}

class MotorizedVehicle extends Vehicle {
  refuel() {}
}

class Car extends MotorizedVehicle {
  openDoors() {}
}

class SportsCar extends Car {
  turboBoost() {}
}

// Inheritance leads to fragile base class problem
class Bird {
  fly() {
    console.log('Flying');
  }
}

class Penguin extends Bird {
  // Penguins can't fly, but inheritance forces this
  fly() {
    throw new Error('Penguins cannot fly');
  }
}
```

## Access Modifiers

### ✅ Good Examples
```typescript
class UserService {
  private userRepository: UserRepository;
  protected logger: Logger;
  public readonly maxRetries: number = 3;

  constructor(userRepository: UserRepository, logger: Logger) {
    this.userRepository = userRepository;
    this.logger = logger;
  }

  // Public method - part of the interface
  public async createUser(userData: CreateUserDto): Promise<User> {
    try {
      const user = new User(userData);
      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error('Failed to create user', error);
      throw error;
    }
  }

  // Private method - internal implementation
  private validateUserData(userData: CreateUserDto): void {
    if (!userData.email) {
      throw new Error('Email is required');
    }
  }

  // Protected method - available to subclasses
  protected async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
```

### ❌ Bad Examples
```typescript
class UserService {
  // Everything is public
  public userRepository: UserRepository;
  public logger: Logger;
  public maxRetries: number = 3;

  constructor(userRepository: UserRepository, logger: Logger) {
    this.userRepository = userRepository;
    this.logger = logger;
  }

  // No access control
  async createUser(userData: CreateUserDto): Promise<User> {
    // Internal logic exposed
    const user = new User(userData);
    return await this.userRepository.save(user);
  }

  // Internal methods exposed
  validateUserData(userData: CreateUserDto): void {
    if (!userData.email) {
      throw new Error('Email is required');
    }
  }
}
```

## Method Organization

### ✅ Good Examples
```javascript
class ShoppingCart {
  // Static methods first
  static createEmptyCart() {
    return new ShoppingCart();
  }

  // Constructor
  constructor() {
    this.items = [];
    this.discount = 0;
  }

  // Public methods (interface)
  addItem(product, quantity) {
    this.validateProduct(product);
    this.items.push({ product, quantity });
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.product.id !== productId);
  }

  calculateTotal() {
    const subtotal = this.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    return subtotal - this.discount;
  }

  // Private methods (implementation)
  validateProduct(product) {
    if (!product || !product.price) {
      throw new Error('Invalid product');
    }
  }

  applyDiscount(amount) {
    this.discount = amount;
  }
}
```

### ❌ Bad Examples
```javascript
class ShoppingCart {
  constructor() {
    this.items = [];
    this.discount = 0;
  }

  // Methods scattered without organization
  validateProduct(product) {
    if (!product || !product.price) {
      throw new Error('Invalid product');
    }
  }

  addItem(product, quantity) {
    this.validateProduct(product);
    this.items.push({ product, quantity });
  }

  applyDiscount(amount) {
    this.discount = amount;
  }

  calculateTotal() {
    const subtotal = this.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    return subtotal - this.discount;
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.product.id !== productId);
  }
}
```

## Code Review Checklist

- [ ] Each class has a single, clear responsibility
- [ ] Classes are focused and don't do too many things
- [ ] Proper encapsulation with private/protected members
- [ ] Composition is preferred over inheritance
- [ ] Access modifiers are used appropriately
- [ ] Methods are organized logically (public first, then private)
- [ ] Classes follow SOLID principles
- [ ] Dependencies are injected, not hardcoded
- [ ] Interfaces are clear and well-defined
- [ ] Classes are easily testable in isolation