# Single Responsibility Principle

## Overview

The Single Responsibility Principle (SRP) states that a class should have only one reason to change. In other words, a class should have only one job or responsibility. This principle is the "S" in SOLID and is fundamental to creating maintainable, testable, and flexible code.

## Core Principles

### 1. One Job Per Class

Each class should be responsible for a single aspect of functionality.

**❌ Bad (Multiple Responsibilities):**
```javascript
class User {
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
  }
  
  // Responsibility 1: User data management
  updateProfile(name, email) {
    this.name = name;
    this.email = email;
  }
  
  // Responsibility 2: Authentication
  authenticate(password) {
    return this.password === password;
  }
  
  // Responsibility 3: Data persistence
  save() {
    database.save('users', this);
  }
  
  // Responsibility 4: Email notifications
  sendWelcomeEmail() {
    emailService.send(this.email, 'Welcome!', 'Welcome to our platform');
  }
  
  // Responsibility 5: Logging
  logActivity(action) {
    console.log(`User ${this.name} performed action: ${action}`);
  }
}
```

**✅ Good (Single Responsibility):**
```javascript
// Class 1: User data management
class User {
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
  }
  
  updateProfile(name, email) {
    this.name = name;
    this.email = email;
  }
}

// Class 2: Authentication
class AuthenticationService {
  authenticate(user, password) {
    return user.password === password;
  }
  
  hashPassword(password) {
    // Password hashing logic
  }
}

// Class 3: Data persistence
class UserRepository {
  save(user) {
    return database.save('users', user);
  }
  
  findById(id) {
    return database.find('users', id);
  }
}

// Class 4: Email notifications
class EmailService {
  sendWelcomeEmail(user) {
    return this.send(user.email, 'Welcome!', 'Welcome to our platform');
  }
  
  send(to, subject, body) {
    // Email sending logic
  }
}

// Class 5: Logging
class ActivityLogger {
  logUserActivity(user, action) {
    console.log(`User ${user.name} performed action: ${action}`);
  }
}
```

### 2. High Cohesion

Related functionality should be grouped together within a single class.

**✅ Examples:**
```javascript
// Good cohesion: All user validation logic in one class
class UserValidator {
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  validatePassword(password) {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[0-9]/.test(password);
  }
  
  validateUser(user) {
    const errors = [];
    
    if (!this.validateEmail(user.email)) {
      errors.push('Invalid email format');
    }
    
    if (!this.validatePassword(user.password)) {
      errors.push('Password must be at least 8 characters with uppercase and numbers');
    }
    
    if (!user.name || user.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
}

// Good cohesion: All payment processing logic in one class
class PaymentProcessor {
  constructor(paymentGateway) {
    this.gateway = paymentGateway;
  }
  
  processPayment(amount, paymentMethod) {
    const validation = this.validatePayment(amount, paymentMethod);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    return this.gateway.charge(amount, paymentMethod);
  }
  
  validatePayment(amount, paymentMethod) {
    if (amount <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }
    
    if (!paymentMethod || !paymentMethod.type) {
      return { valid: false, error: 'Invalid payment method' };
    }
    
    return { valid: true };
  }
  
  refundPayment(transactionId, amount) {
    return this.gateway.refund(transactionId, amount);
  }
}
```

### 3. Low Coupling

Classes should have minimal dependencies on other classes.

**❌ Bad (High Coupling):**
```javascript
class OrderProcessor {
  constructor() {
    this.userRepository = new UserRepository();
    this.productRepository = new ProductRepository();
    this.emailService = new EmailService();
    this.paymentService = new PaymentService();
    this.inventoryService = new InventoryService();
    this.logger = new Logger();
  }
  
  processOrder(orderData) {
    // Tightly coupled to many services
    const user = this.userRepository.findById(orderData.userId);
    const product = this.productRepository.findById(orderData.productId);
    
    this.inventoryService.reserve(product.id, orderData.quantity);
    this.paymentService.process(orderData.payment);
    this.emailService.sendConfirmation(user.email, orderData);
    this.logger.log('Order processed', orderData);
  }
}
```

**✅ Good (Low Coupling):**
```javascript
class OrderProcessor {
  constructor(userService, productService, paymentService, notificationService, inventoryService) {
    this.userService = userService;
    this.productService = productService;
    this.paymentService = paymentService;
    this.notificationService = notificationService;
    this.inventoryService = inventoryService;
  }
  
  async processOrder(orderData) {
    const user = await this.userService.getUser(orderData.userId);
    const product = await this.productService.getProduct(orderData.productId);
    
    await this.inventoryService.reserve(product.id, orderData.quantity);
    await this.paymentService.processPayment(orderData.payment);
    await this.notificationService.sendConfirmation(user.email, orderData);
  }
}

// Usage with dependency injection
const orderProcessor = new OrderProcessor(
  new UserService(),
  new ProductService(),
  new PaymentService(),
  new NotificationService(),
  new InventoryService()
);
```

## Identifying Violations

### 1. Multiple Nouns in Class Name

Class names with multiple nouns often indicate multiple responsibilities.

**❌ Bad:**
```javascript
class UserOrderManager { /* Manages users AND orders */ }
class PaymentEmailSender { /* Processes payments AND sends emails */ }
class DatabaseFileLogger { /* Handles database AND file operations AND logging */ }
```

**✅ Good:**
```javascript
class UserManager { /* Manages users only */ }
class OrderManager { /* Manages orders only */ }
class PaymentProcessor { /* Processes payments only */ }
class EmailSender { /* Sends emails only */ }
class DatabaseLogger { /* Logs to database only */ }
class FileLogger { /* Logs to files only */ }
```

### 2. Multiple Reasons to Change

If a class would need to change for multiple different reasons, it likely has multiple responsibilities.

**❌ Bad:**
```javascript
class ReportGenerator {
  generateSalesReport() { /* Changes when sales logic changes */ }
  generateInventoryReport() { /* Changes when inventory logic changes */ }
  exportToPDF() { /* Changes when PDF format changes */ }
  exportToExcel() { /* Changes when Excel format changes */ }
  sendEmail() { /* Changes when email logic changes */ }
}
```

**✅ Good:**
```javascript
class SalesReportGenerator {
  generateReport() { /* Changes only when sales logic changes */ }
}

class InventoryReportGenerator {
  generateReport() { /* Changes only when inventory logic changes */ }
}

class ReportExporter {
  exportToPDF(report) { /* Changes only when PDF format changes */ }
  exportToExcel(report) { /* Changes only when Excel format changes */ }
}

class EmailService {
  sendEmail(to, subject, body) { /* Changes only when email logic changes */ }
}
```

### 3. Large Classes

Large classes often indicate multiple responsibilities.

**❌ Bad:**
```javascript
class UserManager {
  // 200+ lines of code
  // User creation, validation, authentication, authorization,
  // email notifications, logging, caching, database operations,
  // API endpoints, etc.
}
```

**✅ Good:**
```javascript
class UserManager {
  // 50 lines or less
  // Only user management logic
}

class UserValidator {
  // 30 lines
  // Only validation logic
}

class UserAuthenticator {
  // 40 lines
  // Only authentication logic
}

class UserNotifier {
  // 30 lines
  // Only notification logic
}
```

## Refactoring Violations

### 1. Extract Classes

Break large classes into smaller, focused classes.

**Before:**
```javascript
class Order {
  constructor(id, userId, items, shippingAddress) {
    this.id = id;
    this.userId = userId;
    this.items = items;
    this.shippingAddress = shippingAddress;
    this.status = 'pending';
  }
  
  // Order management
  addItem(product, quantity) {
    this.items.push({ product, quantity });
  }
  
  removeItem(productId) {
    this.items = this.items.filter(item => item.product.id !== productId);
  }
  
  calculateTotal() {
    return this.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }
  
  // Payment processing
  processPayment(paymentMethod) {
    const total = this.calculateTotal();
    return paymentGateway.charge(total, paymentMethod);
  }
  
  // Shipping
  calculateShipping() {
    const weight = this.items.reduce((total, item) => total + (item.product.weight * item.quantity), 0);
    return weight * 0.5; // Simple shipping calculation
  }
  
  // Notifications
  sendConfirmationEmail() {
    emailService.send(this.user.email, 'Order Confirmed', `Your order ${this.id} has been confirmed`);
  }
  
  // Status management
  updateStatus(newStatus) {
    this.status = newStatus;
    this.logStatusChange(newStatus);
  }
  
  logStatusChange(status) {
    console.log(`Order ${this.id} status changed to: ${status}`);
  }
}
```

**After:**
```javascript
// Core order class
class Order {
  constructor(id, userId, items, shippingAddress) {
    this.id = id;
    this.userId = userId;
    this.items = items;
    this.shippingAddress = shippingAddress;
    this.status = 'pending';
  }
  
  addItem(product, quantity) {
    this.items.push({ product, quantity });
  }
  
  removeItem(productId) {
    this.items = this.items.filter(item => item.product.id !== productId);
  }
  
  calculateTotal() {
    return this.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }
  
  updateStatus(newStatus) {
    this.status = newStatus;
  }
}

// Separate payment processor
class PaymentProcessor {
  processPayment(order, paymentMethod) {
    const total = order.calculateTotal();
    return paymentGateway.charge(total, paymentMethod);
  }
}

// Separate shipping calculator
class ShippingCalculator {
  calculateShipping(order) {
    const weight = order.items.reduce((total, item) => total + (item.product.weight * item.quantity), 0);
    return weight * 0.5;
  }
}

// Separate notification service
class OrderNotifier {
  sendConfirmationEmail(order, user) {
    emailService.send(user.email, 'Order Confirmed', `Your order ${order.id} has been confirmed`);
  }
}

// Separate status logger
class OrderStatusLogger {
  logStatusChange(order, status) {
    console.log(`Order ${order.id} status changed to: ${status}`);
  }
}
```

### 2. Use Composition

Combine multiple specialized classes to achieve complex functionality.

**✅ Examples:**
```javascript
class OrderProcessor {
  constructor(paymentProcessor, shippingCalculator, orderNotifier, statusLogger) {
    this.paymentProcessor = paymentProcessor;
    this.shippingCalculator = shippingCalculator;
    this.orderNotifier = orderNotifier;
    this.statusLogger = statusLogger;
  }
  
  async processOrder(order, user, paymentMethod) {
    // Calculate totals
    const subtotal = order.calculateTotal();
    const shipping = this.shippingCalculator.calculateShipping(order);
    const total = subtotal + shipping;
    
    // Process payment
    const paymentResult = await this.paymentProcessor.processPayment(order, paymentMethod);
    
    if (paymentResult.success) {
      // Update status
      order.updateStatus('paid');
      this.statusLogger.logStatusChange(order, 'paid');
      
      // Send confirmation
      this.orderNotifier.sendConfirmationEmail(order, user);
      
      return { success: true, order, total };
    } else {
      order.updateStatus('failed');
      this.statusLogger.logStatusChange(order, 'failed');
      return { success: false, error: paymentResult.error };
    }
  }
}

// Usage
const orderProcessor = new OrderProcessor(
  new PaymentProcessor(),
  new ShippingCalculator(),
  new OrderNotifier(),
  new OrderStatusLogger()
);

const result = await orderProcessor.processOrder(order, user, paymentMethod);
```

### 3. Use Facade Pattern

Create a simple interface that coordinates multiple specialized classes.

**✅ Examples:**
```javascript
class OrderService {
  constructor() {
    this.paymentProcessor = new PaymentProcessor();
    this.shippingCalculator = new ShippingCalculator();
    this.orderNotifier = new OrderNotifier();
    this.statusLogger = new OrderStatusLogger();
    this.orderRepository = new OrderRepository();
  }
  
  async createOrder(orderData) {
    // Create order
    const order = new Order(
      generateId(),
      orderData.userId,
      orderData.items,
      orderData.shippingAddress
    );
    
    // Process order
    const user = await this.getUser(orderData.userId);
    const result = await this.processOrder(order, user, orderData.paymentMethod);
    
    if (result.success) {
      // Save order
      await this.orderRepository.save(order);
      
      return {
        success: true,
        orderId: order.id,
        total: result.total
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  }
  
  async getUser(userId) {
    // Implementation
  }
  
  async processOrder(order, user, paymentMethod) {
    // Implementation using injected services
  }
}
```

## TypeScript-Specific Considerations

### 1. Interface Segregation

Use multiple specific interfaces instead of one general interface.

**❌ Bad:**
```typescript
interface UserOperations {
  createUser(userData: UserData): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  authenticate(email: string, password: string): Promise<boolean>;
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  logActivity(action: string, userId: string): Promise<void>;
}
```

**✅ Good:**
```typescript
interface UserManagement {
  createUser(userData: UserData): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

interface Authentication {
  authenticate(email: string, password: string): Promise<boolean>;
}

interface NotificationService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

interface ActivityLogger {
  logActivity(action: string, userId: string): Promise<void>;
}
```

### 2. Dependency Injection

Use dependency injection to maintain loose coupling.

**✅ Examples:**
```typescript
class UserService {
  constructor(
    private userRepo: UserRepository,
    private auth: AuthenticationService,
    private notifier: EmailService,
    private logger: ActivityLogger
  ) {}
  
  async createUser(userData: UserData): Promise<User> {
    const validation = this.validateUserData(userData);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }
    
    const hashedPassword = await this.auth.hashPassword(userData.password);
    const user = new User(userData.name, userData.email, hashedPassword);
    
    await this.userRepo.save(user);
    await this.notifier.sendWelcomeEmail(user);
    await this.logger.logActivity('user_created', user.id);
    
    return user;
  }
  
  private validateUserData(userData: UserData): ValidationResult {
    // Validation logic
  }
}

// Usage with dependency injection
const userService = new UserService(
  new DatabaseUserRepository(),
  new BCryptAuthenticationService(),
  new SendGridEmailService(),
  new DatabaseActivityLogger()
);
```

### 3. Type Guards and Discriminated Unions

Use TypeScript features to ensure type safety while maintaining single responsibility.

**✅ Examples:**
```typescript
// Discriminated union for different user types
type User = AdminUser | RegularUser | GuestUser;

interface BaseUser {
  id: string;
  email: string;
  type: 'admin' | 'regular' | 'guest';
}

interface AdminUser extends BaseUser {
  type: 'admin';
  permissions: string[];
}

interface RegularUser extends BaseUser {
  type: 'regular';
  subscription: Subscription;
}

interface GuestUser extends BaseUser {
  type: 'guest';
  expiresAt: Date;
}

// Type guards for safe type narrowing
function isAdminUser(user: User): user is AdminUser {
  return user.type === 'admin';
}

function isRegularUser(user: User): user is RegularUser {
  return user.type === 'regular';
}

// Service classes for each user type
class AdminUserService {
  promoteUser(user: AdminUser, targetUser: RegularUser): void {
    // Admin-specific logic
  }
  
  revokePermissions(user: AdminUser, permissions: string[]): void {
    // Admin-specific logic
  }
}

class RegularUserService {
  upgradeSubscription(user: RegularUser, newPlan: SubscriptionPlan): void {
    // Regular user-specific logic
  }
  
  cancelSubscription(user: RegularUser): void {
    // Regular user-specific logic
  }
}

class GuestUserService {
  convertToRegular(guest: GuestUser): RegularUser {
    // Guest-specific logic
  }
}
```

## Common Pitfalls and Solutions

### 1. God Objects

**❌ Bad:**
```javascript
class Application {
  // Handles everything: user management, data processing, 
  // file operations, network requests, logging, etc.
}
```

**✅ Good:**
```javascript
class Application {
  constructor(
    private userService: UserService,
    private dataProcessor: DataProcessor,
    private fileManager: FileManager,
    private networkService: NetworkService,
    private logger: Logger
  ) {}
  
  start() {
    // Coordinate between services
  }
}
```

### 2. Utility Classes

**❌ Bad:**
```javascript
class Utils {
  static formatDate(date) { /* ... */ }
  static validateEmail(email) { /* ... */ }
  static calculateTotal(items) { /* ... */ }
  static generateId() { /* ... */ }
  static sendEmail(to, subject, body) { /* ... */ }
  // ... many unrelated utilities
}
```

**✅ Good:**
```javascript
class DateFormatter {
  static format(date) { /* ... */ }
}

class EmailValidator {
  static validate(email) { /* ... */ }
}

class Calculator {
  static calculateTotal(items) { /* ... */ }
}

class IdGenerator {
  static generate() { /* ... */ }
}

class EmailService {
  static send(to, subject, body) { /* ... */ }
}
```

### 3. Manager Classes

**❌ Bad:**
```javascript
class DataManager {
  // Manages users, products, orders, inventory, etc.
}
```

**✅ Good:**
```javascript
class UserManager {
  // Manages only users
}

class ProductManager {
  // Manages only products
}

class OrderManager {
  // Manages only orders
}
```

## Best Practices Summary

1. **One responsibility per class**: Each class should have a single, well-defined purpose
2. **High cohesion**: Related functionality should be grouped together
3. **Low coupling**: Minimize dependencies between classes
4. **Small, focused classes**: Prefer many small classes over few large ones
5. **Clear naming**: Class names should clearly indicate their single responsibility
6. **Use composition**: Combine specialized classes to achieve complex functionality
7. **Dependency injection**: Use DI to maintain loose coupling
8. **Interface segregation**: Use multiple specific interfaces instead of one general one
9. **Extract when needed**: Don't be afraid to split classes that grow too large
10. **Testability**: Single responsibility makes classes easier to test

## Examples in Context

### E-commerce Application
```javascript
// Before: Violates SRP
class ShoppingCart {
  constructor() {
    this.items = [];
    this.user = null;
    this.discountCode = null;
  }
  
  addItem(product, quantity) {
    // Add item logic
  }
  
  calculateTotal() {
    // Calculate total logic
  }
  
  applyDiscount(code) {
    // Discount logic
  }
  
  saveToDatabase() {
    // Database logic
  }
  
  sendEmailNotification() {
    // Email logic
  }
  
  validateCheckout() {
    // Validation logic
  }
}

// After: Follows SRP
class ShoppingCart {
  constructor() {
    this.items = [];
  }
  
  addItem(product, quantity) {
    this.items.push({ product, quantity });
  }
  
  calculateTotal() {
    return this.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }
}

class DiscountService {
  applyDiscount(cart, code) {
    // Discount calculation logic
  }
}

class CartRepository {
  save(cart, userId) {
    // Database save logic
  }
}

class EmailService {
  sendCheckoutNotification(user, cart) {
    // Email sending logic
  }
}

class CheckoutValidator {
  validate(cart, user) {
    // Validation logic
  }
}

class CheckoutProcessor {
  constructor(discountService, cartRepository, emailService, validator) {
    this.discountService = discountService;
    this.cartRepository = cartRepository;
    this.emailService = emailService;
    this.validator = validator;
  }
  
  async processCheckout(cart, user, discountCode) {
    // Coordinate between services
    const validation = this.validator.validate(cart, user);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    
    const total = this.discountService.applyDiscount(cart, discountCode);
    await this.cartRepository.save(cart, user.id);
    await this.emailService.sendCheckoutNotification(user, cart);
    
    return { success: true, total };
  }
}
```

### API Development
```javascript
// Before: Violates SRP
class UserController {
  async createUser(req, res) {
    // Validation logic
    // Database operations
    // Email sending
    // Logging
    // Response formatting
  }
  
  async updateUser(req, res) {
    // Similar mixed responsibilities
  }
}

// After: Follows SRP
class UserController {
  constructor(userService, responseFormatter) {
    this.userService = userService;
    this.responseFormatter = responseFormatter;
  }
  
  async createUser(req, res) {
    try {
      const userData = this.extractUserData(req.body);
      const user = await this.userService.createUser(userData);
      const response = this.responseFormatter.formatUserResponse(user);
      res.status(201).json(response);
    } catch (error) {
      const errorResponse = this.responseFormatter.formatErrorResponse(error);
      res.status(400).json(errorResponse);
    }
  }
  
  extractUserData(body) {
    return {
      name: body.name,
      email: body.email,
      password: body.password
    };
  }
}

class UserService {
  constructor(userRepository, emailService, logger) {
    this.userRepository = userRepository;
    this.emailService = emailService;
    this.logger = logger;
  }
  
  async createUser(userData) {
    const validation = this.validateUserData(userData);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }
    
    const user = new User(userData.name, userData.email, userData.password);
    await this.userRepository.save(user);
    await this.emailService.sendWelcomeEmail(user);
    await this.logger.logUserCreation(user.id);
    
    return user;
  }
  
  validateUserData(userData) {
    // Validation logic
  }
}

class ResponseFormatter {
  formatUserResponse(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };
  }
  
  formatErrorResponse(error) {
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

Remember: The Single Responsibility Principle is about creating focused, maintainable classes. Each class should do one thing well, making your code easier to understand, test, and modify.