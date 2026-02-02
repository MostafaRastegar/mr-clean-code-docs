# Dependency Inversion Principle

## Overview

The Dependency Inversion Principle (DIP) states that high-level modules should not depend on low-level modules. Both should depend on abstractions. Additionally, abstractions should not depend on details; details should depend on abstractions. This principle helps reduce coupling and makes your code more testable and maintainable.

## Core Principles

### 1. Depend on Abstractions, Not Concretions

High-level modules should depend on interfaces or abstract classes, not concrete implementations.

**❌ Bad (Tight Coupling):**
```javascript
class EmailService {
  sendEmail(to, subject, body) {
    // Email sending logic
    console.log(`Sending email to ${to}: ${subject}`);
  }
}

class NotificationService {
  constructor() {
    // Direct dependency on concrete implementation
    this.emailService = new EmailService();
  }
  
  sendNotification(user, message) {
    this.emailService.sendEmail(user.email, 'Notification', message);
  }
}

class UserService {
  constructor() {
    // Direct dependency on concrete implementation
    this.notificationService = new NotificationService();
  }
  
  createUser(userData) {
    // User creation logic
    const user = { id: 1, email: userData.email };
    
    // Direct notification
    this.notificationService.sendNotification(user, 'Welcome to our platform!');
    
    return user;
  }
}

// This creates a rigid dependency chain:
// UserService -> NotificationService -> EmailService
```

**✅ Good (Dependency Injection):**
```javascript
// Abstractions (interfaces)
class EmailServiceInterface {
  sendEmail(to, subject, body) {
    throw new Error('sendEmail method must be implemented');
  }
}

class NotificationServiceInterface {
  sendNotification(user, message) {
    throw new Error('sendNotification method must be implemented');
  }
}

// Concrete implementations
class EmailService extends EmailServiceInterface {
  sendEmail(to, subject, body) {
    console.log(`Sending email to ${to}: ${subject}`);
  }
}

class NotificationService extends NotificationServiceInterface {
  constructor(emailService) {
    super();
    this.emailService = emailService; // Depends on abstraction
  }
  
  sendNotification(user, message) {
    this.emailService.sendEmail(user.email, 'Notification', message);
  }
}

class UserService {
  constructor(notificationService) {
    this.notificationService = notificationService; // Depends on abstraction
  }
  
  createUser(userData) {
    const user = { id: 1, email: userData.email };
    
    this.notificationService.sendNotification(user, 'Welcome to our platform!');
    
    return user;
  }
}

// Usage with dependency injection
const emailService = new EmailService();
const notificationService = new NotificationService(emailService);
const userService = new UserService(notificationService);

userService.createUser({ email: 'user@example.com' });
```

### 2. Use Dependency Injection

Inject dependencies rather than creating them inside classes.

**✅ Examples:**
```javascript
// Constructor Injection
class OrderService {
  constructor(paymentProcessor, inventoryService, notificationService) {
    this.paymentProcessor = paymentProcessor;
    this.inventoryService = inventoryService;
    this.notificationService = notificationService;
  }
  
  processOrder(order) {
    // Use injected dependencies
    const paymentResult = this.paymentProcessor.process(order.total);
    const inventoryResult = this.inventoryService.reserve(order.items);
    this.notificationService.sendConfirmation(order.user, order);
    
    return { paymentResult, inventoryResult };
  }
}

// Setter Injection
class ReportService {
  setDatabase(database) {
    this.database = database;
  }
  
  setFormatter(formatter) {
    this.formatter = formatter;
  }
  
  generateReport(type) {
    const data = this.database.fetchData(type);
    return this.formatter.format(data);
  }
}

// Interface Injection
class DataProcessor {
  setReader(reader) {
    if (!reader.read) {
      throw new Error('Reader must implement read method');
    }
    this.reader = reader;
  }
  
  setWriter(writer) {
    if (!writer.write) {
      throw new Error('Writer must implement write method');
    }
    this.writer = writer;
  }
  
  process() {
    const data = this.reader.read();
    const result = this.processData(data);
    this.writer.write(result);
  }
  
  processData(data) {
    // Processing logic
    return data.map(item => item * 2);
  }
}
```

### 3. Create Abstraction Layers

Use abstraction layers to decouple different parts of your system.

**✅ Examples:**
```javascript
// Repository Pattern
class RepositoryInterface {
  findById(id) {
    throw new Error('findById method must be implemented');
  }
  
  save(entity) {
    throw new Error('save method must be implemented');
  }
  
  delete(id) {
    throw new Error('delete method must be implemented');
  }
}

class DatabaseRepository extends RepositoryInterface {
  constructor(database) {
    super();
    this.database = database;
  }
  
  findById(id) {
    return this.database.query(`SELECT * FROM entities WHERE id = ${id}`);
  }
  
  save(entity) {
    return this.database.insert('entities', entity);
  }
  
  delete(id) {
    return this.database.delete('entities', { id });
  }
}

class InMemoryRepository extends RepositoryInterface {
  constructor() {
    super();
    this.storage = new Map();
  }
  
  findById(id) {
    return this.storage.get(id);
  }
  
  save(entity) {
    this.storage.set(entity.id, entity);
    return entity;
  }
  
  delete(id) {
    this.storage.delete(id);
  }
}

// Service using repository
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  
  getUser(id) {
    return this.userRepository.findById(id);
  }
  
  createUser(userData) {
    const user = { id: Date.now(), ...userData };
    return this.userRepository.save(user);
  }
}

// Usage
const dbRepository = new DatabaseRepository(database);
const inMemoryRepository = new InMemoryRepository();

const userService = new UserService(dbRepository); // Production
const testUserService = new UserService(inMemoryRepository); // Testing
```

## TypeScript-Specific Considerations

### 1. Interface-Based Design

Use TypeScript interfaces to define clear contracts.

**✅ Examples:**
```typescript
interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

interface NotificationService {
  sendNotification(user: User, message: string): Promise<void>;
}

interface Database {
  query(sql: string, params?: any[]): Promise<any[]>;
  insert(table: string, data: any): Promise<any>;
  update(table: string, data: any, where: any): Promise<void>;
  delete(table: string, where: any): Promise<void>;
}

class EmailServiceImpl implements EmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(`Sending email to ${to}: ${subject}`);
    // Implementation
  }
}

class NotificationServiceImpl implements NotificationService {
  constructor(private emailService: EmailService) {}
  
  async sendNotification(user: User, message: string): Promise<void> {
    await this.emailService.sendEmail(user.email, 'Notification', message);
  }
}

class DatabaseImpl implements Database {
  async query(sql: string, params?: any[]): Promise<any[]> {
    // Database query implementation
    return [];
  }
  
  async insert(table: string, data: any): Promise<any> {
    // Database insert implementation
    return data;
  }
  
  async update(table: string, data: any, where: any): Promise<void> {
    // Database update implementation
  }
  
  async delete(table: string, where: any): Promise<void> {
    // Database delete implementation
  }
}

class UserService {
  constructor(
    private notificationService: NotificationService,
    private database: Database
  ) {}
  
  async createUser(userData: CreateUserRequest): Promise<User> {
    const user = await this.database.insert('users', userData);
    await this.notificationService.sendNotification(user, 'Welcome!');
    return user;
  }
}
```

### 2. Dependency Injection Containers

Use dependency injection containers for complex applications.

**✅ Examples:**
```typescript
// Simple DI Container
class Container {
  private services = new Map<string, any>();
  private factories = new Map<string, Function>();
  
  register<T>(token: string, implementation: T): void {
    this.services.set(token, implementation);
  }
  
  registerFactory<T>(token: string, factory: () => T): void {
    this.factories.set(token, factory);
  }
  
  resolve<T>(token: string): T {
    if (this.services.has(token)) {
      return this.services.get(token);
    }
    
    if (this.factories.has(token)) {
      const factory = this.factories.get(token);
      const instance = factory();
      this.services.set(token, instance);
      return instance;
    }
    
    throw new Error(`Service ${token} not found`);
  }
}

// Usage
const container = new Container();

// Register services
container.register<EmailService>('EmailService', new EmailServiceImpl());
container.registerFactory<NotificationService>('NotificationService', () => 
  new NotificationServiceImpl(container.resolve<EmailService>('EmailService'))
);

container.registerFactory<UserService>('UserService', () => 
  new UserService(
    container.resolve<NotificationService>('NotificationService'),
    container.resolve<Database>('Database')
  )
);

// Resolve services
const userService = container.resolve<UserService>('UserService');
```

### 3. Abstract Classes for Shared Behavior

Use abstract classes when you need to share implementation details.

**✅ Examples:**
```typescript
abstract class BaseService<T> {
  protected abstract repository: Repository<T>;
  
  async findById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }
  
  async findAll(): Promise<T[]> {
    return this.repository.findAll();
  }
  
  async create(data: Partial<T>): Promise<T> {
    const entity = this.createEntity(data);
    return this.repository.save(entity);
  }
  
  async update(id: string, data: Partial<T>): Promise<T | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    
    const updated = { ...existing, ...data };
    return this.repository.save(updated);
  }
  
  async delete(id: string): Promise<boolean> {
    await this.repository.delete(id);
    return true;
  }
  
  protected abstract createEntity(data: Partial<T>): T;
}

class UserService extends BaseService<User> {
  protected repository: Repository<User>;
  
  protected createEntity(data: Partial<User>): User {
    return {
      id: Date.now().toString(),
      createdAt: new Date(),
      ...data
    } as User;
  }
  
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(email);
  }
}

class ProductService extends BaseService<Product> {
  protected repository: Repository<Product>;
  
  protected createEntity(data: Partial<Product>): Product {
    return {
      id: Date.now().toString(),
      createdAt: new Date(),
      price: 0,
      ...data
    } as Product;
  }
  
  async findByCategory(category: string): Promise<Product[]> {
    return this.repository.findByCategory(category);
  }
}
```

## Common Patterns

### 1. Repository Pattern

Separate data access logic from business logic.

**✅ Examples:**
```javascript
// Repository interface
class Repository {
  findById(id) {
    throw new Error('findById must be implemented');
  }
  
  save(entity) {
    throw new Error('save must be implemented');
  }
  
  delete(id) {
    throw new Error('delete must be implemented');
  }
}

// Database repository
class DatabaseRepository extends Repository {
  constructor(database) {
    super();
    this.database = database;
  }
  
  findById(id) {
    return this.database.query('SELECT * FROM table WHERE id = ?', [id]);
  }
  
  save(entity) {
    if (entity.id) {
      return this.database.update('table', entity, { id: entity.id });
    } else {
      return this.database.insert('table', entity);
    }
  }
  
  delete(id) {
    return this.database.delete('table', { id });
  }
}

// In-memory repository for testing
class InMemoryRepository extends Repository {
  constructor() {
    super();
    this.storage = new Map();
    this.counter = 1;
  }
  
  findById(id) {
    return this.storage.get(id);
  }
  
  save(entity) {
    if (!entity.id) {
      entity.id = this.counter++;
    }
    this.storage.set(entity.id, entity);
    return entity;
  }
  
  delete(id) {
    this.storage.delete(id);
  }
}

// Service using repository
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  
  async createUser(userData) {
    const user = { ...userData, createdAt: new Date() };
    return this.userRepository.save(user);
  }
  
  async getUser(id) {
    return this.userRepository.findById(id);
  }
}

// Usage
const dbRepo = new DatabaseRepository(database);
const memoryRepo = new InMemoryRepository();

const userService = new UserService(dbRepo); // Production
const testUserService = new UserService(memoryRepo); // Testing
```

### 2. Service Layer Pattern

Create a service layer that coordinates between different components.

**✅ Examples:**
```javascript
// Domain services
class PaymentService {
  constructor(paymentGateway) {
    this.paymentGateway = paymentGateway;
  }
  
  async processPayment(amount, paymentMethod) {
    return this.paymentGateway.charge(amount, paymentMethod);
  }
}

class InventoryService {
  constructor(inventoryRepository) {
    this.inventoryRepository = inventoryRepository;
  }
  
  async reserveItems(items) {
    for (const item of items) {
      const stock = await this.inventoryRepository.getStock(item.id);
      if (stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
      await this.inventoryRepository.reserve(item.id, item.quantity);
    }
  }
  
  async releaseItems(items) {
    for (const item of items) {
      await this.inventoryRepository.release(item.id, item.quantity);
    }
  }
}

class NotificationService {
  constructor(emailService) {
    this.emailService = emailService;
  }
  
  async sendOrderConfirmation(order) {
    await this.emailService.sendEmail(
      order.user.email,
      'Order Confirmation',
      `Your order ${order.id} has been confirmed`
    );
  }
}

// Application service
class OrderService {
  constructor(paymentService, inventoryService, notificationService, orderRepository) {
    this.paymentService = paymentService;
    this.inventoryService = inventoryService;
    this.notificationService = notificationService;
    this.orderRepository = orderRepository;
  }
  
  async processOrder(orderData) {
    try {
      // Reserve inventory
      await this.inventoryService.reserveItems(orderData.items);
      
      // Process payment
      const paymentResult = await this.paymentService.processPayment(
        orderData.total,
        orderData.paymentMethod
      );
      
      if (!paymentResult.success) {
        await this.inventoryService.releaseItems(orderData.items);
        throw new Error('Payment failed');
      }
      
      // Create order
      const order = await this.orderRepository.save({
        ...orderData,
        status: 'confirmed',
        paymentId: paymentResult.id
      });
      
      // Send notification
      await this.notificationService.sendOrderConfirmation(order);
      
      return order;
    } catch (error) {
      throw error;
    }
  }
}
```

### 3. Factory Pattern

Use factories to create objects without tight coupling.

**✅ Examples:**
```javascript
// Factory interface
class ServiceFactory {
  createPaymentService() {
    throw new Error('createPaymentService must be implemented');
  }
  
  createNotificationService() {
    throw new Error('createNotificationService must be implemented');
  }
}

// Production factory
class ProductionServiceFactory extends ServiceFactory {
  createPaymentService() {
    return new PaymentService(new StripeGateway());
  }
  
  createNotificationService() {
    return new NotificationService(new SendGridService());
  }
}

// Test factory
class TestServiceFactory extends ServiceFactory {
  createPaymentService() {
    return new PaymentService(new MockPaymentGateway());
  }
  
  createNotificationService() {
    return new NotificationService(new MockEmailService());
  }
}

// Usage
function createOrderService(factoryType) {
  const factory = factoryType === 'production' 
    ? new ProductionServiceFactory() 
    : new TestServiceFactory();
  
  const paymentService = factory.createPaymentService();
  const notificationService = factory.createNotificationService();
  const orderRepository = new DatabaseRepository();
  
  return new OrderService(paymentService, notificationService, orderRepository);
}

const productionOrderService = createOrderService('production');
const testOrderService = createOrderService('test');
```

## Common Pitfalls and Solutions

### 1. Constructor Injection Overload

**❌ Bad:**
```javascript
class ComplexService {
  constructor(
    serviceA, serviceB, serviceC, serviceD, serviceE,
    serviceF, serviceG, serviceH, serviceI, serviceJ
  ) {
    // Too many dependencies
  }
}
```

**✅ Good:**
```javascript
class ComplexService {
  constructor(
    private coreServices: CoreServices,
    private auxiliaryServices: AuxiliaryServices
  ) {}
}

class CoreServices {
  constructor(
    public serviceA: ServiceA,
    public serviceB: ServiceB,
    public serviceC: ServiceC
  ) {}
}

class AuxiliaryServices {
  constructor(
    public serviceD: ServiceD,
    public serviceE: ServiceE,
    public serviceF: ServiceF
  ) {}
}
```

### 2. Circular Dependencies

**❌ Bad:**
```javascript
class ServiceA {
  constructor(serviceB) {
    this.serviceB = serviceB;
  }
}

class ServiceB {
  constructor(serviceA) { // Circular dependency
    this.serviceA = serviceA;
  }
}
```

**✅ Good:**
```javascript
class ServiceA {
  constructor(serviceB) {
    this.serviceB = serviceB;
  }
}

class ServiceB {
  constructor() {
    // Use lazy loading or event-driven communication
  }
  
  setServiceA(serviceA) {
    this.serviceA = serviceA;
  }
}

// Or use events
class EventBus {
  constructor() {
    this.listeners = new Map();
  }
  
  emit(event, data) {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
}
```

### 3. Hidden Dependencies

**❌ Bad:**
```javascript
class UserService {
  constructor() {
    // Hidden dependency
    this.emailService = new EmailService();
  }
  
  createUser(userData) {
    const user = this.createUserInDatabase(userData);
    this.emailService.sendWelcomeEmail(user); // Hidden dependency usage
  }
}
```

**✅ Good:**
```javascript
class UserService {
  constructor(emailService) {
    this.emailService = emailService; // Explicit dependency
  }
  
  createUser(userData) {
    const user = this.createUserInDatabase(userData);
    this.emailService.sendWelcomeEmail(user); // Explicit dependency usage
  }
}
```

## Best Practices Summary

1. **Depend on abstractions**: Use interfaces and abstract classes
2. **Use dependency injection**: Inject dependencies rather than creating them
3. **Apply the Hollywood Principle**: "Don't call us, we'll call you"
4. **Create abstraction layers**: Separate concerns with clear boundaries
5. **Use dependency injection containers**: For complex applications
6. **Avoid circular dependencies**: Use events or lazy loading
7. **Make dependencies explicit**: Don't hide dependencies in constructors
8. **Use factories for object creation**: Avoid tight coupling to concrete classes
9. **Test with mocks**: Use dependency injection to inject test doubles
10. **Follow the single responsibility principle**: Keep dependencies focused

## Examples in Context

### E-commerce Application
```javascript
// Before: Violates DIP
class OrderProcessor {
  constructor() {
    this.paymentGateway = new StripeGateway(); // Tight coupling
    this.inventoryService = new DatabaseInventoryService(); // Tight coupling
    this.emailService = new SendGridService(); // Tight coupling
  }
  
  processOrder(order) {
    // Processing logic with tight coupling
  }
}

// After: Follows DIP
interface PaymentGateway {
  charge(amount: number, method: PaymentMethod): Promise<PaymentResult>;
}

interface InventoryService {
  reserveItems(items: Item[]): Promise<void>;
  releaseItems(items: Item[]): Promise<void>;
}

interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

class OrderProcessor {
  constructor(
    private paymentGateway: PaymentGateway,
    private inventoryService: InventoryService,
    private emailService: EmailService
  ) {}
  
  async processOrder(order: Order): Promise<OrderResult> {
    await this.inventoryService.reserveItems(order.items);
    
    const paymentResult = await this.paymentGateway.charge(
      order.total,
      order.paymentMethod
    );
    
    if (paymentResult.success) {
      await this.emailService.sendEmail(
        order.user.email,
        'Order Confirmed',
        `Your order ${order.id} has been confirmed`
      );
    }
    
    return paymentResult;
  }
}

// Production implementation
class ProductionOrderProcessor extends OrderProcessor {
  constructor() {
    super(
      new StripeGateway(),
      new DatabaseInventoryService(),
      new SendGridService()
    );
  }
}

// Test implementation
class TestOrderProcessor extends OrderProcessor {
  constructor() {
    super(
      new MockPaymentGateway(),
      new InMemoryInventoryService(),
      new MockEmailService()
    );
  }
}
```

### API Development
```javascript
// Before: Violates DIP
class UserController {
  constructor() {
    this.userService = new UserService(); // Tight coupling
    this.authService = new AuthService(); // Tight coupling
    this.validator = new UserValidator(); // Tight coupling
  }
  
  async createUser(req, res) {
    const userData = req.body;
    const validation = this.validator.validate(userData);
    
    if (!validation.valid) {
      return res.status(400).json(validation.errors);
    }
    
    const user = await this.userService.createUser(userData);
    await this.authService.sendWelcomeEmail(user);
    
    res.status(201).json(user);
  }
}

// After: Follows DIP
interface UserService {
  createUser(userData: CreateUserRequest): Promise<User>;
}

interface AuthService {
  sendWelcomeEmail(user: User): Promise<void>;
}

interface Validator<T> {
  validate(data: T): ValidationResult;
}

class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private validator: Validator<CreateUserRequest>
  ) {}
  
  async createUser(req: Request, res: Response): Promise<void> {
    const userData = req.body;
    const validation = this.validator.validate(userData);
    
    if (!validation.valid) {
      res.status(400).json(validation.errors);
      return;
    }
    
    try {
      const user = await this.userService.createUser(userData);
      await this.authService.sendWelcomeEmail(user);
      
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

// Production implementation
class ProductionUserController extends UserController {
  constructor() {
    super(
      new DatabaseUserService(),
      new EmailAuthService(),
      new UserValidator()
    );
  }
}

// Test implementation
class TestUserController extends UserController {
  constructor() {
    super(
      new MockUserService(),
      new MockAuthService(),
      new MockValidator()
    );
  }
}
```

### Data Processing
```javascript
// Before: Violates DIP
class DataProcessor {
  constructor() {
    this.database = new PostgreSQLDatabase(); // Tight coupling
    this.cache = new RedisCache(); // Tight coupling
    this.logger = new FileLogger(); // Tight coupling
  }
  
  async process(data) {
    this.logger.log('Starting processing');
    
    const existing = await this.database.findById(data.id);
    if (existing) {
      await this.database.update(data.id, data);
    } else {
      await this.database.insert(data);
    }
    
    await this.cache.set(data.id, data);
    this.logger.log('Processing completed');
  }
}

// After: Follows DIP
interface Database {
  findById(id: string): Promise<any | null>;
  insert(data: any): Promise<any>;
  update(id: string, data: any): Promise<void>;
}

interface Cache {
  get(key: string): Promise<any | null>;
  set(key: string, value: any): Promise<void>;
}

interface Logger {
  log(message: string): void;
}

class DataProcessor {
  constructor(
    private database: Database,
    private cache: Cache,
    private logger: Logger
  ) {}
  
  async process(data: any): Promise<void> {
    this.logger.log('Starting processing');
    
    const existing = await this.database.findById(data.id);
    if (existing) {
      await this.database.update(data.id, data);
    } else {
      await this.database.insert(data);
    }
    
    await this.cache.set(data.id, data);
    this.logger.log('Processing completed');
  }
}

// Production implementation
class ProductionDataProcessor extends DataProcessor {
  constructor() {
    super(
      new PostgreSQLDatabase(),
      new RedisCache(),
      new FileLogger()
    );
  }
}

// Test implementation
class TestDataProcessor extends DataProcessor {
  constructor() {
    super(
      new MockDatabase(),
      new InMemoryCache(),
      new ConsoleLogger()
    );
  }
}
```

Remember: The Dependency Inversion Principle helps you create loosely coupled, testable, and maintainable code. By depending on abstractions rather than concrete implementations, you make your system more flexible and easier to modify.