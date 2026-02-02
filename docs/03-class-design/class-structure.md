# Class Structure

## Overview

Class structure refers to how you organize the members (properties, methods, constructors) within a class. A well-structured class is easy to read, understand, and maintain. This document covers best practices for organizing class members and creating clean, readable class definitions.

## Core Principles

### 1. Consistent Member Ordering

Organize class members in a consistent, logical order to improve readability.

**✅ Recommended Order:**
```javascript
class User {
  // 1. Static properties
  static tableName = 'users';
  static defaultRole = 'user';
  
  // 2. Static methods
  static createFromData(data) {
    return new User(data.name, data.email);
  }
  
  // 3. Instance properties (public)
  name;
  email;
  
  // 4. Private properties (if using private fields)
  #password;
  #createdAt;
  
  // 5. Constructor
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.#password = password;
    this.#createdAt = new Date();
  }
  
  // 6. Public methods
  updateProfile(name, email) {
    this.name = name;
    this.email = email;
  }
  
  // 7. Private methods (if using private methods)
  #hashPassword(password) {
    return `hashed_${password}`;
  }
  
  // 8. Getters and setters
  get createdAt() {
    return this.#createdAt;
  }
  
  set password(newPassword) {
    this.#password = this.#hashPassword(newPassword);
  }
  
  // 9. Lifecycle methods (init, destroy, etc.)
  init() {
    // Initialization logic
  }
  
  destroy() {
    // Cleanup logic
  }
}
```

**❌ Inconsistent Order:**
```javascript
class User {
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.#password = password;
  }
  
  static tableName = 'users';
  
  updateProfile(name, email) {
    this.name = name;
    this.email = email;
  }
  
  #password;
  
  static createFromData(data) {
    return new User(data.name, data.email);
  }
  
  name;
  email;
  
  #hashPassword(password) {
    return `hashed_${password}`;
  }
}
```

### 2. Group Related Members

Keep related functionality together to improve code organization.

**✅ Good Grouping:**
```javascript
class ShoppingCart {
  // Properties
  #items = [];
  #discountCode = null;
  #taxRate = 0.08;
  
  // Constructor
  constructor() {
    this.#loadFromStorage();
  }
  
  // Item management
  addItem(product, quantity) {
    const existingItem = this.#items.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.#items.push({ product, quantity });
    }
    this.#saveToStorage();
  }
  
  removeItem(productId) {
    this.#items = this.#items.filter(item => item.product.id !== productId);
    this.#saveToStorage();
  }
  
  updateQuantity(productId, quantity) {
    const item = this.#items.find(item => item.product.id === productId);
    if (item) {
      item.quantity = quantity;
      this.#saveToStorage();
    }
  }
  
  // Discount management
  applyDiscount(code) {
    this.#discountCode = code;
    this.#saveToStorage();
  }
  
  removeDiscount() {
    this.#discountCode = null;
    this.#saveToStorage();
  }
  
  // Calculation methods
  getSubtotal() {
    return this.#items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }
  
  getDiscountAmount() {
    if (!this.#discountCode) return 0;
    const subtotal = this.getSubtotal();
    return subtotal * 0.1; // 10% discount
  }
  
  getTax() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    return (subtotal - discount) * this.#taxRate;
  }
  
  getTotal() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscountAmount();
    const tax = this.getTax();
    return subtotal - discount + tax;
  }
  
  // Storage methods
  #saveToStorage() {
    localStorage.setItem('cart', JSON.stringify({
      items: this.#items,
      discountCode: this.#discountCode
    }));
  }
  
  #loadFromStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) {
      const data = JSON.parse(saved);
      this.#items = data.items || [];
      this.#discountCode = data.discountCode || null;
    }
  }
  
  // Utility methods
  getItemCount() {
    return this.#items.reduce((count, item) => count + item.quantity, 0);
  }
  
  isEmpty() {
    return this.#items.length === 0;
  }
  
  clear() {
    this.#items = [];
    this.#discountCode = null;
    this.#saveToStorage();
  }
}
```

**❌ Poor Grouping:**
```javascript
class ShoppingCart {
  constructor() {
    this.#loadFromStorage();
  }
  
  #items = [];
  
  addItem(product, quantity) {
    // ... implementation
  }
  
  #discountCode = null;
  
  getSubtotal() {
    return this.#items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }
  
  #taxRate = 0.08;
  
  removeItem(productId) {
    // ... implementation
  }
  
  applyDiscount(code) {
    // ... implementation
  }
  
  getDiscountAmount() {
    // ... implementation
  }
  
  updateQuantity(productId, quantity) {
    // ... implementation
  }
  
  // ... other methods scattered throughout
}
```

### 3. Use Access Modifiers Appropriately

Control access to class members to maintain encapsulation.

**✅ Good Access Control:**
```javascript
class BankAccount {
  // Public properties (safe to expose)
  get accountNumber() {
    return this.#accountNumber;
  }
  
  get balance() {
    return this.#balance;
  }
  
  // Private properties (internal state)
  #accountNumber;
  #balance = 0;
  #transactionHistory = [];
  #pin;
  
  constructor(accountNumber, initialBalance = 0, pin) {
    this.#accountNumber = accountNumber;
    this.#balance = initialBalance;
    this.#pin = this.#hashPin(pin);
  }
  
  // Public methods (safe operations)
  deposit(amount) {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }
    this.#balance += amount;
    this.#addTransaction('deposit', amount);
  }
  
  withdraw(amount, pin) {
    if (!this.#verifyPin(pin)) {
      throw new Error('Invalid PIN');
    }
    
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    
    if (amount > this.#balance) {
      throw new Error('Insufficient funds');
    }
    
    this.#balance -= amount;
    this.#addTransaction('withdrawal', amount);
  }
  
  getTransactionHistory() {
    return [...this.#transactionHistory]; // Return copy to prevent mutation
  }
  
  // Private methods (internal operations)
  #hashPin(pin) {
    return `hashed_${pin}`;
  }
  
  #verifyPin(pin) {
    return this.#hashPin(pin) === this.#pin;
  }
  
  #addTransaction(type, amount) {
    this.#transactionHistory.push({
      type,
      amount,
      timestamp: new Date(),
      balance: this.#balance
    });
  }
}
```

**❌ Poor Access Control:**
```javascript
class BankAccount {
  // Exposing internal state
  accountNumber;
  balance = 0;
  transactionHistory = [];
  pin;
  
  constructor(accountNumber, initialBalance = 0, pin) {
    this.accountNumber = accountNumber;
    this.balance = initialBalance;
    this.pin = pin; // Exposed PIN!
  }
  
  // No validation or encapsulation
  deposit(amount) {
    this.balance += amount; // No validation
    this.transactionHistory.push({ type: 'deposit', amount }); // Direct access
  }
  
  withdraw(amount, pin) {
    if (pin !== this.pin) { // Direct PIN comparison
      throw new Error('Invalid PIN');
    }
    this.balance -= amount; // No validation
    this.transactionHistory.push({ type: 'withdrawal', amount }); // Direct access
  }
}
```

## TypeScript-Specific Considerations

### 1. Property Initialization

Use TypeScript's property initialization features for cleaner code.

**✅ Good Initialization:**
```typescript
class User {
  // Static properties
  static readonly ROLE_ADMIN = 'admin';
  static readonly ROLE_USER = 'user';
  
  // Instance properties with types
  readonly id: string;
  name: string;
  email: string;
  private password: string;
  private createdAt: Date;
  private updatedAt: Date;
  
  // Optional properties
  phoneNumber?: string;
  avatarUrl?: string;
  
  // Constructor with parameter properties
  constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    phoneNumber?: string,
    avatarUrl?: string
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = this.hashPassword(password);
    this.phoneNumber = phoneNumber;
    this.avatarUrl = avatarUrl;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
  
  // Alternative: Parameter properties (more concise)
  constructor(
    readonly id: string,
    public name: string,
    public email: string,
    private password: string,
    public phoneNumber?: string,
    public avatarUrl?: string
  ) {
    this.password = this.hashPassword(password);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
  
  // Methods
  updateProfile(updates: Partial<Pick<User, 'name' | 'email' | 'phoneNumber'>>) {
    Object.assign(this, updates);
    this.updatedAt = new Date();
  }
  
  private hashPassword(password: string): string {
    return `hashed_${password}`;
  }
}
```

**❌ Poor Initialization:**
```typescript
class User {
  // No types
  id;
  name;
  email;
  password;
  
  // No initialization
  createdAt;
  updatedAt;
  
  constructor(id, name, email, password) {
    // No type checking
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    // Missing initialization
  }
}
```

### 2. Access Modifiers

Use TypeScript's access modifiers for better encapsulation.

**✅ Good Access Modifiers:**
```typescript
class DatabaseConnection {
  // Public for external access
  public readonly host: string;
  public readonly port: number;
  
  // Private for internal use
  private connection: any;
  private isConnecting: boolean = false;
  private retryCount: number = 0;
  
  // Protected for inheritance
  protected maxRetries: number = 3;
  protected timeout: number = 5000;
  
  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
  }
  
  // Public interface
  public async connect(): Promise<void> {
    if (this.isConnecting) {
      throw new Error('Connection already in progress');
    }
    
    this.isConnecting = true;
    try {
      await this.#establishConnection();
    } finally {
      this.isConnecting = false;
    }
  }
  
  public async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }
  
  // Private implementation
  #establishConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Connection logic
    });
  }
  
  // Protected for subclasses
  protected async retryConnection(): Promise<void> {
    if (this.retryCount >= this.maxRetries) {
      throw new Error('Max retries exceeded');
    }
    
    this.retryCount++;
    await new Promise(resolve => setTimeout(resolve, this.timeout));
    return this.#establishConnection();
  }
}
```

**❌ Poor Access Modifiers:**
```typescript
class DatabaseConnection {
  // Everything public
  host: string;
  port: number;
  connection: any;
  isConnecting: boolean = false;
  retryCount: number = 0;
  maxRetries: number = 3;
  timeout: number = 5000;
  
  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
  }
  
  // No encapsulation
  async connect(): Promise<void> {
    this.isConnecting = true; // Direct access to internal state
    this.connection = await this.#establishConnection(); // Private method access
    this.isConnecting = false;
  }
  
  // Internal method exposed
  #establishConnection(): Promise<void> {
    // Implementation
  }
}
```

### 3. Readonly Properties

Use readonly for properties that shouldn't be modified after initialization.

**✅ Good Readonly Usage:**
```typescript
class Configuration {
  readonly apiEndpoint: string;
  readonly timeout: number;
  readonly retries: number;
  readonly version: string;
  
  constructor(config: {
    apiEndpoint: string;
    timeout?: number;
    retries?: number;
    version?: string;
  }) {
    this.apiEndpoint = config.apiEndpoint;
    this.timeout = config.timeout ?? 5000;
    this.retries = config.retries ?? 3;
    this.version = config.version ?? '1.0.0';
  }
  
  // Factory method for creating configurations
  static createDevelopment(): Configuration {
    return new Configuration({
      apiEndpoint: 'http://localhost:3000/api',
      timeout: 10000,
      retries: 5,
      version: 'dev'
    });
  }
  
  static createProduction(endpoint: string): Configuration {
    return new Configuration({
      apiEndpoint: endpoint,
      timeout: 3000,
      retries: 3,
      version: '1.0.0'
    });
  }
}

// Usage
const config = Configuration.createDevelopment();
// config.apiEndpoint = 'new endpoint'; // Error: Cannot assign to 'apiEndpoint' because it is a read-only property
```

**❌ Poor Readonly Usage:**
```typescript
class Configuration {
  // Mutable configuration - can be changed accidentally
  apiEndpoint: string;
  timeout: number;
  retries: number;
  version: string;
  
  constructor(apiEndpoint: string, timeout: number = 5000, retries: number = 3) {
    this.apiEndpoint = apiEndpoint;
    this.timeout = timeout;
    this.retries = retries;
    this.version = '1.0.0';
  }
}

// Usage
const config = new Configuration('http://localhost:3000/api');
config.apiEndpoint = 'http://production.com/api'; // Accidentally changed!
```

## Common Patterns

### 1. Builder Pattern Structure

**✅ Good Builder Structure:**
```javascript
class UserBuilder {
  // Private properties for building
  #name = '';
  #email = '';
  #age = 0;
  #address = null;
  #preferences = {};
  
  // Fluent interface methods
  withName(name) {
    this.#name = name;
    return this;
  }
  
  withEmail(email) {
    this.#email = email;
    return this;
  }
  
  withAge(age) {
    this.#age = age;
    return this;
  }
  
  withAddress(address) {
    this.#address = address;
    return this;
  }
  
  withPreferences(preferences) {
    this.#preferences = { ...preferences };
    return this;
  }
  
  // Build method
  build() {
    if (!this.#name || !this.#email) {
      throw new Error('Name and email are required');
    }
    
    return new User(
      this.#name,
      this.#email,
      this.#age,
      this.#address,
      this.#preferences
    );
  }
}

// Usage
const user = new UserBuilder()
  .withName('John Doe')
  .withEmail('john@example.com')
  .withAge(30)
  .withAddress({ street: '123 Main St', city: 'Anytown' })
  .withPreferences({ theme: 'dark', notifications: true })
  .build();
```

### 2. Factory Pattern Structure

**✅ Good Factory Structure:**
```javascript
class ShapeFactory {
  // Static factory methods
  static createCircle(radius) {
    return new Circle(radius);
  }
  
  static createRectangle(width, height) {
    return new Rectangle(width, height);
  }
  
  static createTriangle(base, height) {
    return new Triangle(base, height);
  }
  
  // Factory method with configuration
  static createShape(type, config) {
    switch (type) {
      case 'circle':
        return this.createCircle(config.radius);
      case 'rectangle':
        return this.createRectangle(config.width, config.height);
      case 'triangle':
        return this.createTriangle(config.base, config.height);
      default:
        throw new Error(`Unknown shape type: ${type}`);
    }
  }
  
  // Batch creation
  static createMultiple(shapes) {
    return shapes.map(shape => this.createShape(shape.type, shape.config));
  }
}

// Usage
const circle = ShapeFactory.createCircle(5);
const rectangle = ShapeFactory.createRectangle(10, 20);
const shapes = ShapeFactory.createMultiple([
  { type: 'circle', config: { radius: 3 } },
  { type: 'rectangle', config: { width: 5, height: 10 } }
]);
```

### 3. Singleton Pattern Structure

**✅ Good Singleton Structure:**
```javascript
class DatabaseManager {
  // Private static instance
  static #instance = null;
  
  // Private properties
  #connection = null;
  #isConnected = false;
  
  // Private constructor
  constructor() {
    if (DatabaseManager.#instance) {
      throw new Error('Use DatabaseManager.getInstance() instead');
    }
  }
  
  // Static factory method
  static getInstance() {
    if (!DatabaseManager.#instance) {
      DatabaseManager.#instance = new DatabaseManager();
    }
    return DatabaseManager.#instance;
  }
  
  // Public methods
  async connect(connectionString) {
    if (this.#isConnected) {
      return;
    }
    
    this.#connection = await this.#establishConnection(connectionString);
    this.#isConnected = true;
  }
  
  async disconnect() {
    if (this.#connection) {
      await this.#connection.close();
      this.#connection = null;
      this.#isConnected = false;
    }
  }
  
  async query(sql, params = []) {
    if (!this.#isConnected) {
      throw new Error('Database not connected');
    }
    
    return this.#connection.query(sql, params);
  }
  
  // Private methods
  async #establishConnection(connectionString) {
    // Connection logic
    return { query: async () => {} };
  }
}

// Usage
const db1 = DatabaseManager.getInstance();
const db2 = DatabaseManager.getInstance();
console.log(db1 === db2); // true - same instance
```

## Best Practices Summary

1. **Consistent ordering**: Follow a consistent order for class members
2. **Group related functionality**: Keep related methods and properties together
3. **Use access modifiers**: Control access to maintain encapsulation
4. **Initialize properties properly**: Use appropriate initialization patterns
5. **Use readonly for immutable properties**: Prevent accidental modification
6. **Follow naming conventions**: Use consistent naming for different member types
7. **Document public interfaces**: Clearly document what's intended for external use
8. **Keep constructors simple**: Avoid complex logic in constructors
9. **Use private methods for implementation details**: Hide internal logic
10. **Consider inheritance**: Design with inheritance in mind when appropriate

## Examples in Context

### E-commerce Application
```javascript
class Product {
  // Static properties
  static readonly STATUS_ACTIVE = 'active';
  static readonly STATUS_INACTIVE = 'inactive';
  static readonly STATUS_DISCONTINUED = 'discontinued';
  
  // Properties
  id;
  name;
  description;
  price;
  category;
  inventory;
  status;
  images;
  specifications;
  
  // Constructor
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.category = data.category;
    this.inventory = data.inventory || 0;
    this.status = data.status || Product.STATUS_ACTIVE;
    this.images = data.images || [];
    this.specifications = data.specifications || {};
  }
  
  // Public methods
  updatePrice(newPrice) {
    if (newPrice < 0) {
      throw new Error('Price cannot be negative');
    }
    this.price = newPrice;
  }
  
  updateInventory(quantity) {
    this.inventory += quantity;
  }
  
  isAvailable() {
    return this.status === Product.STATUS_ACTIVE && this.inventory > 0;
  }
  
  getDiscountedPrice(discountRate) {
    return this.price * (1 - discountRate);
  }
  
  // Getters
  get isInStock() {
    return this.inventory > 0;
  }
  
  get displayPrice() {
    return `$${this.price.toFixed(2)}`;
  }
}
```

### API Development
```javascript
class ApiController {
  // Static properties
  static readonly DEFAULT_PAGE_SIZE = 20;
  static readonly MAX_PAGE_SIZE = 100;
  
  // Properties
  #service;
  #logger;
  #validator;
  
  // Constructor
  constructor(service, logger, validator) {
    this.#service = service;
    this.#logger = logger;
    this.#validator = validator;
  }
  
  // Public methods
  async getAll(req, res) {
    try {
      const { page = 1, limit = ApiController.DEFAULT_PAGE_SIZE } = req.query;
      const options = {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), ApiController.MAX_PAGE_SIZE)
      };
      
      const result = await this.#service.findAll(options);
      res.json(result);
    } catch (error) {
      this.#logger.error('Error in getAll:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  async getById(req, res) {
    try {
      const { id } = req.params;
      const entity = await this.#service.findById(id);
      
      if (!entity) {
        return res.status(404).json({ error: 'Not found' });
      }
      
      res.json(entity);
    } catch (error) {
      this.#logger.error('Error in getById:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  async create(req, res) {
    try {
      const validation = this.#validator.validate(req.body);
      if (!validation.valid) {
        return res.status(400).json({ errors: validation.errors });
      }
      
      const entity = await this.#service.create(req.body);
      res.status(201).json(entity);
    } catch (error) {
      this.#logger.error('Error in create:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Private methods
  #handleError(res, error) {
    this.#logger.error('Controller error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Data Processing
```javascript
class DataProcessor {
  // Properties
  #inputData = [];
  #outputData = [];
  #transformers = [];
  #validators = [];
  #filters = [];
  
  // Constructor
  constructor() {
    this.#setupDefaultTransformers();
    this.#setupDefaultValidators();
  }
  
  // Public methods
  setInputData(data) {
    this.#inputData = Array.isArray(data) ? data : [data];
    return this;
  }
  
  addTransformer(transformer) {
    this.#transformers.push(transformer);
    return this;
  }
  
  addValidator(validator) {
    this.#validators.push(validator);
    return this;
  }
  
  addFilter(filter) {
    this.#filters.push(filter);
    return this;
  }
  
  async process() {
    let data = [...this.#inputData];
    
    // Apply filters
    for (const filter of this.#filters) {
      data = data.filter(filter);
    }
    
    // Apply validators
    for (const validator of this.#validators) {
      data = data.filter(item => validator(item));
    }
    
    // Apply transformers
    for (const transformer of this.#transformers) {
      data = data.map(transformer);
    }
    
    this.#outputData = data;
    return this.#outputData;
  }
  
  getOutputData() {
    return [...this.#outputData];
  }
  
  // Private methods
  #setupDefaultTransformers() {
    this.#transformers.push(item => ({
      ...item,
      processedAt: new Date().toISOString()
    }));
  }
  
  #setupDefaultValidators() {
    this.#validators.push(item => item !== null && item !== undefined);
  }
}
```

Remember: Good class structure makes your code more readable, maintainable, and easier to understand. Follow consistent patterns and organize your classes logically to improve the overall quality of your codebase.