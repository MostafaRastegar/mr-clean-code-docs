# Composition

## Overview

Composition is a fundamental object-oriented programming principle that involves building complex objects by combining simpler objects. Unlike inheritance, which creates "is-a" relationships, composition creates "has-a" relationships and is generally preferred for code reuse and flexibility.

## Core Principles

### 1. Favor Composition Over Inheritance

Composition provides more flexibility than inheritance and avoids many of the problems associated with deep inheritance hierarchies.

**✅ Good Composition:**
```javascript
// Instead of inheriting from multiple classes
class Engine {
  start() {
    console.log('Engine started');
  }
  
  stop() {
    console.log('Engine stopped');
  }
  
  getHorsepower() {
    return 300;
  }
}

class Transmission {
  shift(gear) {
    console.log(`Shifting to gear ${gear}`);
  }
  
  getGearCount() {
    return 6;
  }
}

class Wheels {
  rotate(speed) {
    console.log(`Wheels rotating at ${speed} RPM`);
  }
  
  getTirePressure() {
    return 32; // PSI
  }
}

class Car {
  constructor() {
    this.engine = new Engine();
    this.transmission = new Transmission();
    this.wheels = new Wheels();
    this.speed = 0;
  }
  
  start() {
    this.engine.start();
    console.log('Car is ready to drive');
  }
  
  accelerate() {
    this.speed += 10;
    this.wheels.rotate(this.speed * 100);
    console.log(`Accelerating to ${this.speed} mph`);
  }
  
  shiftUp() {
    this.transmission.shift('up');
  }
  
  getSpecifications() {
    return {
      horsepower: this.engine.getHorsepower(),
      gears: this.transmission.getGearCount(),
      tirePressure: this.wheels.getTirePressure()
    };
  }
}

// Usage
const car = new Car();
car.start();
car.accelerate();
console.log(car.getSpecifications());
```

**❌ Bad Inheritance Approach:**
```javascript
// This would create a complex inheritance hierarchy
class Vehicle {
  start() { /* ... */ }
}

class MotorizedVehicle extends Vehicle {
  startEngine() { /* ... */ }
}

class WheeledVehicle extends MotorizedVehicle {
  moveWheels() { /* ... */ }
}

class Car extends WheeledVehicle {
  // Complex inheritance chain with potential conflicts
}
```

### 2. Use "has-a" Relationships

Composition represents "has-a" relationships where one object contains or uses other objects.

**✅ Good "has-a" Relationships:**
```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.preferences = new UserPreferences();
    this.authentication = new AuthenticationManager();
    this.notifications = new NotificationService();
  }
  
  updatePreferences(settings) {
    this.preferences.update(settings);
  }
  
  login(password) {
    return this.authentication.authenticate(this.email, password);
  }
  
  sendNotification(message) {
    this.notifications.send(this.email, message);
  }
}

class UserPreferences {
  constructor() {
    this.theme = 'light';
    this.language = 'en';
    this.notifications = true;
  }
  
  update(settings) {
    Object.assign(this, settings);
  }
}

class AuthenticationManager {
  authenticate(email, password) {
    // Authentication logic
    return { success: true, token: 'abc123' };
  }
}

class NotificationService {
  send(email, message) {
    console.log(`Sending notification to ${email}: ${message}`);
  }
}
```

**❌ Bad "is-a" Relationships:**
```javascript
// This doesn't make sense - a User IS NOT a Preferences
class UserPreferences {
  update(settings) { /* ... */ }
}

class User extends UserPreferences {
  // User inherits from Preferences? No!
}
```

### 3. Create Reusable Components

Design components to be reusable across different contexts.

**✅ Reusable Components:**
```javascript
// Generic validation component
class Validator {
  constructor() {
    this.rules = new Map();
  }
  
  addRule(field, rule) {
    if (!this.rules.has(field)) {
      this.rules.set(field, []);
    }
    this.rules.get(field).push(rule);
  }
  
  validate(data) {
    const errors = {};
    
    for (const [field, rules] of this.rules) {
      const value = data[field];
      const fieldErrors = [];
      
      for (const rule of rules) {
        const result = rule(value, data);
        if (!result.valid) {
          fieldErrors.push(result.message);
        }
      }
      
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Reusable validation rules
const emailRule = (value) => ({
  valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  message: 'Invalid email format'
});

const minLengthRule = (minLength) => (value) => ({
  valid: value && value.length >= minLength,
  message: `Must be at least ${minLength} characters long`
});

const requiredRule = (value) => ({
  valid: value && value.trim().length > 0,
  message: 'This field is required'
});

// Usage in different contexts
const userValidator = new Validator();
userValidator.addRule('email', emailRule);
userValidator.addRule('name', requiredRule);
userValidator.addRule('password', minLengthRule(8));

const productValidator = new Validator();
productValidator.addRule('name', requiredRule);
productValidator.addRule('name', minLengthRule(3));
productValidator.addRule('price', (value) => ({
  valid: value > 0,
  message: 'Price must be positive'
}));
```

**❌ Non-reusable Components:**
```javascript
// Specific to one use case
class UserValidator {
  validateUser(userData) {
    const errors = [];
    
    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Invalid email');
    }
    
    if (!userData.name || userData.name.trim().length === 0) {
      errors.push('Name is required');
    }
    
    if (!userData.password || userData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    return { valid: errors.length === 0, errors };
  }
}

// Need to create a new validator for each use case
class ProductValidator {
  validateProduct(productData) {
    const errors = [];
    
    if (!productData.name || productData.name.trim().length === 0) {
      errors.push('Name is required');
    }
    
    if (!productData.price || productData.price <= 0) {
      errors.push('Price must be positive');
    }
    
    return { valid: errors.length === 0, errors };
  }
}
```

## TypeScript-Specific Considerations

### 1. Interface Composition

Use TypeScript's interface composition features to create flexible type definitions.

**✅ Good Interface Composition:**
```typescript
interface Drawable {
  draw(): void;
  getArea(): number;
}

interface Movable {
  move(x: number, y: number): void;
  getPosition(): { x: number, y: number };
}

interface Clickable {
  onClick(callback: () => void): void;
}

// Intersection types for composition
type Button = Drawable & Movable & Clickable;
type Label = Drawable & Movable;
type Image = Drawable & Movable;

// Implementation using composition
class ButtonImpl implements Button {
  private position: { x: number, y: number } = { x: 0, y: 0 };
  
  draw(): void {
    console.log('Drawing button');
  }
  
  getArea(): number {
    return 100; // Example area
  }
  
  move(x: number, y: number): void {
    this.position = { x, y };
  }
  
  getPosition(): { x: number, y: number } {
    return this.position;
  }
  
  onClick(callback: () => void): void {
    console.log('Button clicked');
    callback();
  }
}

// Composition factory
class UIComponentFactory {
  static createButton(): Button {
    return new ButtonImpl();
  }
  
  static createLabel(): Label {
    return new LabelImpl();
  }
  
  static createImage(): Image {
    return new ImageImpl();
  }
}
```

**❌ Poor Interface Design:**
```typescript
// Too specific interfaces
interface ButtonInterface {
  draw(): void;
  getArea(): number;
  move(x: number, y: number): void;
  getPosition(): { x: number, y: number };
  onClick(callback: () => void): void;
  setText(text: string): void;
  getText(): string;
}

interface LabelInterface {
  draw(): void;
  getArea(): number;
  move(x: number, y: number): void;
  getPosition(): { x: number, y: number };
  setText(text: string): void;
  getText(): string;
}

// Too much duplication between interfaces
```

### 2. Dependency Injection with Composition

Use dependency injection to compose objects with their dependencies.

**✅ Good Dependency Injection:**
```typescript
interface Logger {
  log(message: string): void;
  error(message: string): void;
}

interface Database {
  query(sql: string, params?: any[]): Promise<any[]>;
  insert(table: string, data: any): Promise<any>;
}

interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }
  
  error(message: string): void {
    console.error(`[ERROR] ${message}`);
  }
}

class DatabaseService implements Database {
  constructor(private logger: Logger) {}
  
  async query(sql: string, params?: any[]): Promise<any[]> {
    this.logger.log(`Executing query: ${sql}`);
    // Database implementation
    return [];
  }
  
  async insert(table: string, data: any): Promise<any> {
    this.logger.log(`Inserting into ${table}: ${JSON.stringify(data)}`);
    // Database implementation
    return data;
  }
}

class EmailServiceImpl implements EmailService {
  constructor(private logger: Logger) {}
  
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    this.logger.log(`Sending email to ${to}: ${subject}`);
    // Email implementation
  }
}

class UserService {
  constructor(
    private database: Database,
    private emailService: EmailService,
    private logger: Logger
  ) {}
  
  async createUser(userData: CreateUserRequest): Promise<User> {
    this.logger.log('Creating user...');
    
    const user = await this.database.insert('users', userData);
    
    await this.emailService.sendEmail(
      user.email,
      'Welcome!',
      'Welcome to our platform'
    );
    
    this.logger.log('User created successfully');
    return user;
  }
}

// Composition root
class Application {
  private logger: Logger;
  private database: Database;
  private emailService: EmailService;
  private userService: UserService;
  
  constructor() {
    this.logger = new ConsoleLogger();
    this.database = new DatabaseService(this.logger);
    this.emailService = new EmailServiceImpl(this.logger);
    this.userService = new UserService(this.database, this.emailService, this.logger);
  }
  
  getUserService(): UserService {
    return this.userService;
  }
}
```

**❌ Poor Dependency Management:**
```typescript
class UserService {
  private database: DatabaseService;
  private emailService: EmailServiceImpl;
  private logger: ConsoleLogger;
  
  constructor() {
    // Hard-coded dependencies
    this.database = new DatabaseService(new ConsoleLogger());
    this.emailService = new EmailServiceImpl(new ConsoleLogger());
    this.logger = new ConsoleLogger();
  }
  
  // All dependencies are tightly coupled
}
```

### 3. Generic Composition

Use generics to create flexible, reusable composition patterns.

**✅ Good Generic Composition:**
```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

interface Service<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

class BaseService<T> implements Service<T> {
  constructor(private repository: Repository<T>) {}
  
  async create(data: Partial<T>): Promise<T> {
    return this.repository.save(data as T);
  }
  
  async findById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }
  
  async update(id: string, data: Partial<T>): Promise<T | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;
    
    const updated = { ...existing, ...data };
    return this.repository.save(updated);
  }
  
  async delete(id: string): Promise<boolean> {
    await this.repository.delete(id);
    return true;
  }
}

// Specific services using composition
class UserService extends BaseService<User> {
  constructor(repository: Repository<User>) {
    super(repository);
  }
  
  async findByEmail(email: string): Promise<User | null> {
    // Specific to users
    return null; // Implementation
  }
}

class ProductService extends BaseService<Product> {
  constructor(repository: Repository<Product>) {
    super(repository);
  }
  
  async findByCategory(category: string): Promise<Product[]> {
    // Specific to products
    return []; // Implementation
  }
}

// Generic factory for creating services
class ServiceFactory {
  static createUserService(repository: Repository<User>): UserService {
    return new UserService(repository);
  }
  
  static createProductService(repository: Repository<Product>): ProductService {
    return new ProductService(repository);
  }
}
```

**❌ Non-generic Approach:**
```typescript
// Repetitive code for each service
class UserService {
  constructor(private repository: UserRepository) {}
  
  async create(data: Partial<User>): Promise<User> {
    return this.repository.save(data as User);
  }
  
  async findById(id: string): Promise<User | null> {
    return this.repository.findById(id);
  }
  
  // More methods...
}

class ProductService {
  constructor(private repository: ProductRepository) {}
  
  async create(data: Partial<Product>): Promise<Product> {
    return this.repository.save(data as Product);
  }
  
  async findById(id: string): Promise<Product | null> {
    return this.repository.findById(id);
  }
  
  // More methods...
}
```

## Common Patterns

### 1. Strategy Pattern with Composition

Use composition to implement the Strategy pattern for interchangeable algorithms.

**✅ Strategy Pattern:**
```javascript
// Strategy interface
class CompressionStrategy {
  compress(data) {
    throw new Error('compress method must be implemented');
  }
  
  decompress(data) {
    throw new Error('decompress method must be implemented');
  }
}

// Concrete strategies
class ZipCompression extends CompressionStrategy {
  compress(data) {
    return `ZIP: ${data}`;
  }
  
  decompress(data) {
    return data.replace('ZIP: ', '');
  }
}

class RarCompression extends CompressionStrategy {
  compress(data) {
    return `RAR: ${data}`;
  }
  
  decompress(data) {
    return data.replace('RAR: ', '');
  }
}

// Context using composition
class CompressionContext {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  compress(data) {
    return this.strategy.compress(data);
  }
  
  decompress(data) {
    return this.strategy.decompress(data);
  }
}

// Usage
const zipStrategy = new ZipCompression();
const rarStrategy = new RarCompression();

const context = new CompressionContext(zipStrategy);
console.log(context.compress('Hello World')); // "ZIP: Hello World"

context.setStrategy(rarStrategy);
console.log(context.compress('Hello World')); // "RAR: Hello World"
```

### 2. Decorator Pattern with Composition

Use composition to add functionality to objects dynamically.

**✅ Decorator Pattern:**
```javascript
// Component interface
class Coffee {
  cost() {
    throw new Error('cost method must be implemented');
  }
  
  description() {
    throw new Error('description method must be implemented');
  }
}

// Concrete component
class SimpleCoffee extends Coffee {
  cost() {
    return 2.00;
  }
  
  description() {
    return 'Simple coffee';
  }
}

// Decorator base class
class CoffeeDecorator extends Coffee {
  constructor(coffee) {
    super();
    this.coffee = coffee;
  }
  
  cost() {
    return this.coffee.cost();
  }
  
  description() {
    return this.coffee.description();
  }
}

// Concrete decorators
class MilkDecorator extends CoffeeDecorator {
  cost() {
    return super.cost() + 0.50;
  }
  
  description() {
    return super.description() + ', milk';
  }
}

class SugarDecorator extends CoffeeDecorator {
  cost() {
    return super.cost() + 0.25;
  }
  
  description() {
    return super.description() + ', sugar';
  }
}

class WhipDecorator extends CoffeeDecorator {
  cost() {
    return super.cost() + 0.75;
  }
  
  description() {
    return super.description() + ', whip';
  }
}

// Usage
let coffee = new SimpleCoffee();
console.log(`${coffee.description()}: $${coffee.cost()}`); // "Simple coffee: $2.00"

coffee = new MilkDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost()}`); // "Simple coffee, milk: $2.50"

coffee = new SugarDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost()}`); // "Simple coffee, milk, sugar: $2.75"

coffee = new WhipDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost()}`); // "Simple coffee, milk, sugar, whip: $3.50"
```

### 3. Observer Pattern with Composition

Use composition to implement the Observer pattern for event handling.

**✅ Observer Pattern:**
```javascript
// Subject interface
class Subject {
  constructor() {
    this.observers = [];
  }
  
  addObserver(observer) {
    this.observers.push(observer);
  }
  
  removeObserver(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }
  
  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

// Observer interface
class Observer {
  update(data) {
    throw new Error('update method must be implemented');
  }
}

// Concrete observers
class EmailObserver extends Observer {
  constructor(emailService) {
    super();
    this.emailService = emailService;
  }
  
  update(data) {
    if (data.type === 'user_created') {
      this.emailService.sendEmail(data.user.email, 'Welcome!', 'Welcome to our platform');
    }
  }
}

class LogObserver extends Observer {
  constructor(logger) {
    super();
    this.logger = logger;
  }
  
  update(data) {
    this.logger.log(`Event: ${data.type}, Data: ${JSON.stringify(data)}`);
  }
}

class CacheObserver extends Observer {
  constructor(cache) {
    super();
    this.cache = cache;
  }
  
  update(data) {
    if (data.type === 'user_updated') {
      this.cache.set(`user_${data.user.id}`, data.user);
    }
  }
}

// Subject using composition
class UserService {
  constructor() {
    this.subject = new Subject();
  }
  
  addObserver(observer) {
    this.subject.addObserver(observer);
  }
  
  removeObserver(observer) {
    this.subject.removeObserver(observer);
  }
  
  async createUser(userData) {
    const user = { id: Date.now(), ...userData };
    
    // Notify observers
    this.subject.notify({
      type: 'user_created',
      user: user
    });
    
    return user;
  }
  
  async updateUser(id, updates) {
    const user = { id, ...updates };
    
    // Notify observers
    this.subject.notify({
      type: 'user_updated',
      user: user
    });
    
    return user;
  }
}

// Usage
const userService = new UserService();
const emailService = new EmailService();
const logger = new Logger();
const cache = new Cache();

userService.addObserver(new EmailObserver(emailService));
userService.addObserver(new LogObserver(logger));
userService.addObserver(new CacheObserver(cache));

const user = await userService.createUser({ name: 'John', email: 'john@example.com' });
```

## Common Pitfalls and Solutions

### 1. Deep Composition Chains

**❌ Bad:**
```javascript
class A {
  constructor() {
    this.b = new B();
  }
}

class B {
  constructor() {
    this.c = new C();
  }
}

class C {
  constructor() {
    this.d = new D();
  }
}

// Deep chain makes testing and debugging difficult
const a = new A(); // Creates B, which creates C, which creates D
```

**✅ Good:**
```javascript
class A {
  constructor(b, c, d) {
    this.b = b;
    this.c = c;
    this.d = d;
  }
}

class B {
  constructor(c, d) {
    this.c = c;
    this.d = d;
  }
}

class C {
  constructor(d) {
    this.d = d;
  }
}

// Shallow composition with dependency injection
const d = new D();
const c = new C(d);
const b = new B(c, d);
const a = new A(b, c, d);
```

### 2. Circular Dependencies

**❌ Bad:**
```javascript
class A {
  constructor() {
    this.b = new B(this); // Circular dependency
  }
}

class B {
  constructor(a) {
    this.a = a;
    this.c = new C(this);
  }
}

class C {
  constructor(b) {
    this.b = b;
  }
}
```

**✅ Good:**
```javascript
class A {
  constructor(b) {
    this.b = b;
  }
  
  setB(b) {
    this.b = b;
  }
}

class B {
  constructor() {
    // Use lazy loading or events to avoid circular dependencies
  }
  
  setA(a) {
    this.a = a;
  }
  
  setC(c) {
    this.c = c;
  }
}

class C {
  constructor() {
    // No dependencies on A or B
  }
}

// Composition root resolves dependencies
const a = new A();
const b = new B();
const c = new C();

a.setB(b);
b.setA(a);
b.setC(c);
```

### 3. Over-Composition

**❌ Bad:**
```javascript
class User {
  constructor() {
    this.name = new NameComponent();
    this.email = new EmailComponent();
    this.password = new PasswordComponent();
    this.address = new AddressComponent();
    this.phone = new PhoneComponent();
    this.preferences = new PreferencesComponent();
    // ... many more components
  }
}

// Too many small components make the class complex
```

**✅ Good:**
```javascript
class User {
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.contactInfo = new ContactInfo();
    this.preferences = new UserPreferences();
  }
}

class ContactInfo {
  constructor() {
    this.address = new Address();
    this.phone = new Phone();
  }
}

// Group related functionality into larger components
```

## Best Practices Summary

1. **Favor composition over inheritance**: Use composition for code reuse and flexibility
2. **Use "has-a" relationships**: Model containment and usage relationships
3. **Create reusable components**: Design components for multiple contexts
4. **Use dependency injection**: Inject dependencies rather than creating them
5. **Keep composition shallow**: Avoid deep chains of composed objects
6. **Avoid circular dependencies**: Use events or lazy loading to break cycles
7. **Group related functionality**: Don't over-split into too many small components
8. **Use interfaces for composition**: Define clear contracts between components
9. **Test components in isolation**: Each component should be independently testable
10. **Document composition relationships**: Make the relationships clear in code and documentation

## Examples in Context

### E-commerce Application
```javascript
// Good composition for e-commerce
class ShoppingCart {
  constructor() {
    this.items = [];
    this.discountCalculator = new DiscountCalculator();
    this.taxCalculator = new TaxCalculator();
    this.inventoryService = new InventoryService();
    this.priceService = new PriceService();
  }
  
  addItem(product, quantity) {
    if (!this.inventoryService.isAvailable(product.id, quantity)) {
      throw new Error('Insufficient inventory');
    }
    
    const existingItem = this.items.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ product, quantity });
    }
  }
  
  getSubtotal() {
    return this.items.reduce((total, item) => {
      const price = this.priceService.getPrice(item.product);
      return total + (price * item.quantity);
    }, 0);
  }
  
  getTotal() {
    const subtotal = this.getSubtotal();
    const discount = this.discountCalculator.calculate(subtotal, this.items);
    const tax = this.taxCalculator.calculate(subtotal - discount);
    return subtotal - discount + tax;
  }
}

class DiscountCalculator {
  calculate(subtotal, items) {
    let discount = 0;
    
    // Volume discount
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity > 10) {
      discount += subtotal * 0.1;
    }
    
    // Product-specific discounts
    for (const item of items) {
      if (item.product.category === 'electronics') {
        discount += item.product.price * item.quantity * 0.05;
      }
    }
    
    return discount;
  }
}

class TaxCalculator {
  constructor() {
    this.taxRate = 0.08;
  }
  
  calculate(amount) {
    return amount * this.taxRate;
  }
}
```

### API Development
```javascript
// Good composition for API controllers
class ApiController {
  constructor(service, validator, logger, metrics) {
    this.service = service;
    this.validator = validator;
    this.logger = logger;
    this.metrics = metrics;
  }
  
  async getAll(req, res) {
    try {
      this.metrics.increment('api.requests.total');
      this.logger.info('Processing GET request');
      
      const result = await this.service.findAll(req.query);
      this.metrics.increment('api.requests.success');
      
      res.json(result);
    } catch (error) {
      this.metrics.increment('api.requests.error');
      this.logger.error('Error in GET request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  async create(req, res) {
    try {
      const validation = this.validator.validate(req.body);
      if (!validation.valid) {
        return res.status(400).json({ errors: validation.errors });
      }
      
      const entity = await this.service.create(req.body);
      this.logger.info(`Created entity: ${entity.id}`);
      
      res.status(201).json(entity);
    } catch (error) {
      this.logger.error('Error in POST request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Composition factory
class ControllerFactory {
  static createUserController(userService, logger, metrics) {
    const validator = new UserValidator();
    return new ApiController(userService, validator, logger, metrics);
  }
  
  static createProductController(productService, logger, metrics) {
    const validator = new ProductValidator();
    return new ApiController(productService, validator, logger, metrics);
  }
}
```

### Data Processing
```javascript
// Good composition for data processing
class DataPipeline {
  constructor() {
    this.validators = [];
    this.transformers = [];
    this.filters = [];
    this.aggregators = [];
  }
  
  addValidator(validator) {
    this.validators.push(validator);
    return this;
  }
  
  addTransformer(transformer) {
    this.transformers.push(transformer);
    return this;
  }
  
  addFilter(filter) {
    this.filters.push(filter);
    return this;
  }
  
  addAggregator(aggregator) {
    this.aggregators.push(aggregator);
    return this;
  }
  
  async process(data) {
    let result = data;
    
    // Apply validators
    for (const validator of this.validators) {
      if (!await validator.validate(result)) {
        throw new Error('Validation failed');
      }
    }
    
    // Apply filters
    for (const filter of this.filters) {
      result = result.filter(item => filter.test(item));
    }
    
    // Apply transformers
    for (const transformer of this.transformers) {
      result = result.map(item => transformer.transform(item));
    }
    
    // Apply aggregators
    for (const aggregator of this.aggregators) {
      result = aggregator.aggregate(result);
    }
    
    return result;
  }
}

// Reusable pipeline components
class RangeFilter {
  constructor(min, max) {
    this.min = min;
    this.max = max;
  }
  
  test(item) {
    return item.value >= this.min && item.value <= this.max;
  }
}

class DateFormatter {
  transform(item) {
    return {
      ...item,
      date: new Date(item.timestamp).toISOString()
    };
  }
}

class SumAggregator {
  aggregate(data) {
    return data.reduce((sum, item) => sum + item.value, 0);
  }
}

// Usage
const pipeline = new DataPipeline()
  .addValidator(new DataValidator())
  .addFilter(new RangeFilter(0, 100))
  .addTransformer(new DateFormatter())
  .addAggregator(new SumAggregator());

const result = await pipeline.process(rawData);
```

Remember: Composition provides flexibility, reusability, and maintainability. By favoring composition over inheritance and designing components thoughtfully, you create systems that are easier to understand, test, and modify.