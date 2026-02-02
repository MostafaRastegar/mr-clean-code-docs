# Class Naming

## Overview

Class naming is crucial for code readability and maintainability. Well-named classes make your code self-documenting and help other developers understand your system's architecture and design intent.

## Core Principles

### 1. Use Nouns or Noun Phrases

Class names should represent entities, concepts, or roles in your system.

**✅ Good Examples:**
```javascript
class User { /* Represents a user entity */ }
class Order { /* Represents an order entity */ }
class PaymentProcessor { /* Represents a processor role */ }
class DatabaseConnection { /* Represents a connection concept */ }
class ShoppingCart { /* Represents a shopping cart entity */ }
class ConfigurationManager { /* Represents a manager role */ }
```

**❌ Bad Examples:**
```javascript
class HandleUser { /* Verb - should be a method */ }
class ProcessOrder { /* Verb - should be a method */ }
class ManageDatabase { /* Verb - should be a method */ }
class DoSomething { /* Vague and unhelpful */ }
class Thing { /* Too generic */ }
class Data { /* Too generic */ }
```

### 2. Be Descriptive and Specific

Choose names that clearly describe what the class represents or does.

**✅ Good Examples:**
```javascript
class CustomerAccount { /* Specific type of account */ }
class ProductInventory { /* Specific type of inventory */ }
class EmailNotificationService { /* Specific type of service */ }
class FileUploadHandler { /* Specific type of handler */ }
class DatabaseTransactionManager { /* Specific type of manager */ }
class UserAuthenticationValidator { /* Specific type of validator */ }
```

**❌ Bad Examples:**
```javascript
class Account { /* Too generic - what kind of account? */ }
class Inventory { /* Too generic - what kind of inventory? */ }
class Service { /* Too generic - what does it do? */ }
class Handler { /* Too generic - what does it handle? */ }
class Manager { /* Too generic - what does it manage? */ }
class Validator { /* Too generic - what does it validate? */ }
```

### 3. Use PascalCase

Follow JavaScript/TypeScript naming conventions for classes.

**✅ Good Examples:**
```javascript
class UserProfile { /* PascalCase */ }
class ShoppingCartItem { /* PascalCase */ }
class DatabaseConnectionPool { /* PascalCase */ }
class ConfigurationManager { /* PascalCase */ }
class EmailNotificationService { /* PascalCase */ }
```

**❌ Bad Examples:**
```javascript
class userProfile { /* camelCase - should be for variables/methods */ }
class shopping_cart_item { /* snake_case - not standard in JS/TS */ }
class database-connection-pool { /* kebab-case - not valid for class names */ }
class DATABASE_CONNECTION_POOL { /* UPPER_CASE - should be for constants */ }
```

## Domain-Specific Naming

### 1. Use Domain Language

Incorporate terminology from your business domain.

**✅ Examples by Domain:**
```javascript
// E-commerce
class ShoppingCart { /* Domain concept */ }
class CheckoutProcess { /* Domain process */ }
class ProductCatalog { /* Domain concept */ }
class OrderFulfillment { /* Domain process */ }
class CustomerReview { /* Domain concept */ }

// Banking
class BankAccount { /* Domain concept */ }
class TransactionProcessor { /* Domain process */ }
class LoanApplication { /* Domain concept */ }
class InterestCalculator { /* Domain process */ }
class AccountStatement { /* Domain document */ }

// Healthcare
class PatientRecord { /* Domain concept */ }
class MedicalAppointment { /* Domain concept */ }
class TreatmentPlan { /* Domain concept */ }
class PrescriptionOrder { /* Domain concept */ }
class VitalSignsMonitor { /* Domain device/process */ }
```

### 2. Avoid Technical Jargon When Possible

Use business terms rather than technical implementation details.

**✅ Good Examples:**
```javascript
class Order { /* Business concept */ }
class Customer { /* Business concept */ }
class Invoice { /* Business document */ }
class Payment { /* Business transaction */ }
class Product { /* Business item */ }
```

**❌ Bad Examples:**
```javascript
class OrderEntity { /* Technical term */ }
class CustomerModel { /* Technical term */ }
class InvoiceDAO { /* Technical term */ }
class PaymentService { /* Technical term */ }
class ProductRepository { /* Technical term */ }
```

## Pattern-Based Naming

### 1. Service Classes

Use "Service" suffix for classes that provide business logic or operations.

**✅ Good Examples:**
```javascript
class UserService { /* Provides user-related operations */ }
class PaymentService { /* Provides payment operations */ }
class NotificationService { /* Provides notification operations */ }
class EmailService { /* Provides email operations */ }
class AuthenticationService { /* Provides authentication operations */ }
class LoggingService { /* Provides logging operations */ }
```

**❌ Bad Examples:**
```javascript
class User { /* Too generic for a service */ }
class PaymentProcessor { /* "Processor" is okay, but "Service" is more standard */ }
class Notifier { /* Less descriptive than "Service" */ }
class Mailer { /* Less descriptive than "Service" */ }
class Auth { /* Too abbreviated */ }
class Logger { /* Too generic */ }
```

### 2. Manager Classes

Use "Manager" suffix for classes that coordinate or manage other components.

**✅ Good Examples:**
```javascript
class DatabaseManager { /* Manages database connections/operations */ }
class CacheManager { /* Manages caching operations */ }
class SessionManager { /* Manages user sessions */ }
class ConfigurationManager { /* Manages application configuration */ }
class ConnectionManager { /* Manages connections */ }
class ResourceManager { /* Manages resources */ }
```

**❌ Bad Examples:**
```javascript
class Database { /* Too generic for a manager */ }
class Cache { /* Too generic for a manager */ }
class Session { /* Too generic for a manager */ }
class Config { /* Too abbreviated */ }
class Connection { /* Too generic for a manager */ }
class Resource { /* Too generic for a manager */ }
```

### 3. Handler Classes

Use "Handler" suffix for classes that handle specific events or requests.

**✅ Good Examples:**
```javascript
class ErrorHandler { /* Handles errors */ }
class RequestHandler { /* Handles HTTP requests */ }
class EventHandler { /* Handles events */ }
class FileHandler { /* Handles file operations */ }
class ResponseHandler { /* Handles responses */ }
class CommandHandler { /* Handles commands */ }
```

**❌ Bad Examples:**
```javascript
class Error { /* Too generic for a handler */ }
class Request { /* Too generic for a handler */ }
class Event { /* Too generic for a handler */ }
class File { /* Too generic for a handler */ }
class Response { /* Too generic for a handler */ }
class Command { /* Too generic for a handler */ }
```

### 4. Repository Classes

Use "Repository" suffix for classes that handle data access.

**✅ Good Examples:**
```javascript
class UserRepository { /* Handles user data access */ }
class ProductRepository { /* Handles product data access */ }
class OrderRepository { /* Handles order data access */ }
class CustomerRepository { /* Handles customer data access */ }
class InvoiceRepository { /* Handles invoice data access */ }
```

**❌ Bad Examples:**
```javascript
class UserDAO { /* "DAO" is less common in modern JS/TS */ }
class ProductData { /* Too generic */ }
class OrderStore { /* "Store" is okay but "Repository" is more standard */ }
class CustomerDB { /* Too technical/abbreviated */ }
class InvoiceManager { /* "Manager" suggests coordination, not data access */ }
```

### 5. Factory Classes

Use "Factory" suffix for classes that create other objects.

**✅ Good Examples:**
```javascript
class UserFactory { /* Creates user objects */ }
class ShapeFactory { /* Creates shape objects */ }
class PaymentFactory { /* Creates payment objects */ }
class DocumentFactory { /* Creates document objects */ }
class ConnectionFactory { /* Creates connection objects */ }
```

**❌ Bad Examples:**
```javascript
class UserCreator { /* "Creator" is less standard than "Factory" */ }
class ShapeBuilder { /* "Builder" suggests construction, not creation */ }
class PaymentGenerator { /* "Generator" is less standard than "Factory" */ }
class DocumentMaker { /* "Maker" is not a standard suffix */ }
class ConnectionBuilder { /* "Builder" suggests construction, not creation */ }
```

## TypeScript-Specific Considerations

### 1. Interface Naming

Use "I" prefix or no prefix for interfaces, depending on your team's convention.

**✅ Examples (I prefix convention):**
```typescript
interface IUserService {
  createUser(userData: CreateUserRequest): Promise<User>;
  getUserById(id: string): Promise<User | null>;
}

interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  save(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}

interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}
```

**✅ Examples (no prefix convention):**
```typescript
interface UserService {
  createUser(userData: CreateUserRequest): Promise<User>;
  getUserById(id: string): Promise<User | null>;
}

interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  save(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}

interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}
```

### 2. Abstract Class Naming

Use descriptive names that indicate the abstract nature when helpful.

**✅ Good Examples:**
```typescript
abstract class BaseService<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract save(entity: T): Promise<T>;
  abstract delete(id: string): Promise<void>;
}

abstract class Shape {
  abstract getArea(): number;
  abstract getPerimeter(): number;
}

abstract class PaymentProcessor {
  abstract processPayment(amount: number, method: PaymentMethod): Promise<PaymentResult>;
}
```

**❌ Bad Examples:**
```typescript
abstract class Service { /* Too generic */ }
abstract class ShapeBase { /* "Base" suffix is redundant for abstract classes */ }
abstract class Processor { /* Too generic */ }
```

### 3. Generic Class Naming

Use descriptive type parameter names.

**✅ Good Examples:**
```typescript
class Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

class Cache<TKey, TValue> {
  get(key: TKey): TValue | null;
  set(key: TKey, value: TValue): void;
  delete(key: TKey): void;
}

class EventHandler<TEventArgs> {
  handle(event: TEventArgs): void;
}

class Collection<TItem> {
  add(item: TItem): void;
  remove(item: TItem): boolean;
  getItems(): TItem[];
}
```

**❌ Bad Examples:**
```typescript
class Repository<T> {
  // Good, but could be more descriptive
}

class Cache<T, U> {
  // T and U are not descriptive
}

class EventHandler<T> {
  // T doesn't indicate it's event args
}

class Collection<T> {
  // T doesn't indicate it's an item
}
```

## Common Naming Patterns

### 1. Builder Pattern

**✅ Good Examples:**
```javascript
class UserBuilder {
  withName(name) { /* ... */ }
  withEmail(email) { /* ... */ }
  build() { /* ... */ }
}

class QueryBuilder {
  select(fields) { /* ... */ }
  where(condition) { /* ... */ }
  build() { /* ... */ }
}

class ReportBuilder {
  setTitle(title) { /* ... */ }
  addSection(section) { /* ... */ }
  build() { /* ... */ }
}
```

### 2. Strategy Pattern

**✅ Good Examples:**
```javascript
class PaymentStrategy {
  process(amount) { /* ... */ }
}

class CreditCardStrategy extends PaymentStrategy { /* ... */ }
class PayPalStrategy extends PaymentStrategy { /* ... */ }
class BitcoinStrategy extends PaymentStrategy { /* ... */ }

class SortingStrategy {
  sort(data) { /* ... */ }
}

class BubbleSortStrategy extends SortingStrategy { /* ... */ }
class QuickSortStrategy extends SortingStrategy { /* ... */ }
class MergeSortStrategy extends SortingStrategy { /* ... */ }
```

### 3. Observer Pattern

**✅ Good Examples:**
```javascript
class Subject {
  addObserver(observer) { /* ... */ }
  removeObserver(observer) { /* ... */ }
  notify(data) { /* ... */ }
}

class Observer {
  update(data) { /* ... */ }
}

class EmailObserver extends Observer { /* ... */ }
class LogObserver extends Observer { /* ... */ }
class CacheObserver extends Observer { /* ... */ }
```

### 4. Decorator Pattern

**✅ Good Examples:**
```javascript
class Component {
  operation() { /* ... */ }
}

class Decorator extends Component {
  constructor(component) {
    super();
    this.component = component;
  }
  
  operation() {
    return this.component.operation();
  }
}

class LoggingDecorator extends Decorator { /* ... */ }
class CachingDecorator extends Decorator { /* ... */ }
class ValidationDecorator extends Decorator { /* ... */ }
```

## Common Pitfalls and Solutions

### 1. Abbreviations and Acronyms

**❌ Bad:**
```javascript
class Auth { /* Too abbreviated */ }
class Config { /* Too abbreviated */ }
class DBManager { /* Mixed case for acronym */ }
class HTTPClient { /* All caps for acronym */ }
```

**✅ Good:**
```javascript
class AuthenticationService { /* Full name */ }
class ConfigurationManager { /* Full name */ }
class DatabaseManager { /* Full name */ }
class HttpClient { /* PascalCase for acronym */ }
```

### 2. Vague or Generic Names

**❌ Bad:**
```javascript
class Manager { /* What does it manage? */ }
class Handler { /* What does it handle? */ }
class Processor { /* What does it process? */ }
class Service { /* What does it do? */ }
class Data { /* What kind of data? */ }
class Utils { /* What utilities? */ }
```

**✅ Good:**
```javascript
class DatabaseManager { /* Specific management */ }
class RequestHandler { /* Specific handling */ }
class DataProcessor { /* Specific processing */ }
class EmailService { /* Specific service */ }
class UserData { /* Specific data */ }
class StringUtils { /* Specific utilities */ }
```

### 3. Implementation Details in Names

**❌ Bad:**
```javascript
class UserArray { /* Implementation detail */ }
class OrderList { /* Implementation detail */ }
class ProductHashTable { /* Implementation detail */ }
class CustomerLinkedList { /* Implementation detail */ }
```

**✅ Good:**
```javascript
class UserRepository { /* Concept, not implementation */ }
class OrderService { /* Concept, not implementation */ }
class ProductCatalog { /* Concept, not implementation */ }
class CustomerManager { /* Concept, not implementation */ }
```

### 4. Temporal Names

**❌ Bad:**
```javascript
class OldUserService { /* What makes it old? */ }
class NewPaymentService { /* What makes it new? */ }
class TempFileManager { /* What's temporary about it? */ }
class FutureOrderProcessor { /* What's future about it? */ }
```

**✅ Good:**
```javascript
class LegacyUserService { /* If it's legacy system */ }
class ModernPaymentService { /* If it's modern architecture */ }
class TemporaryFileManager { /* If it manages temporary files */ }
class ScheduledOrderProcessor { /* If it processes scheduled orders */ }
```

## Best Practices Summary

1. **Use nouns**: Class names should be nouns or noun phrases
2. **Be descriptive**: Choose names that clearly describe the class's purpose
3. **Use PascalCase**: Follow JavaScript/TypeScript naming conventions
4. **Use domain language**: Incorporate business terminology
5. **Follow patterns**: Use standard suffixes for common patterns
6. **Avoid abbreviations**: Use full words when possible
7. **Be specific**: Avoid generic names that don't convey purpose
8. **Avoid implementation details**: Focus on what the class does, not how
9. **Use consistent naming**: Follow team conventions
10. **Consider the audience**: Name classes for the people who will use them

## Examples in Context

### E-commerce Application
```javascript
// Domain entities
class Customer { /* Business entity */ }
class Product { /* Business entity */ }
class ShoppingCart { /* Business entity */ }
class Order { /* Business entity */ }
class Payment { /* Business entity */ }
class Invoice { /* Business document */ }

// Services
class CustomerService { /* Customer-related operations */ }
class ProductService { /* Product-related operations */ }
class OrderService { /* Order-related operations */ }
class PaymentService { /* Payment-related operations */ }
class InventoryService { /* Inventory-related operations */ }
class ShippingService { /* Shipping-related operations */ }

// Repositories
class CustomerRepository { /* Customer data access */ }
class ProductRepository { /* Product data access */ }
class OrderRepository { /* Order data access */ }
class PaymentRepository { /* Payment data access */ }

// Managers
class InventoryManager { /* Inventory coordination */ }
class ShippingManager { /* Shipping coordination */ }
class CustomerSessionManager { /* Customer session coordination */ }

// Handlers
class OrderHandler { /* Order processing */ }
class PaymentHandler { /* Payment processing */ }
class InventoryHandler { /* Inventory updates */ }
```

### API Development
```javascript
// Controllers
class UserController { /* User API endpoints */ }
class ProductController { /* Product API endpoints */ }
class OrderController { /* Order API endpoints */ }
class AuthController { /* Authentication API endpoints */ }

// Middleware
class AuthenticationMiddleware { /* Request authentication */ }
class AuthorizationMiddleware { /* Request authorization */ }
class ValidationMiddleware { /* Request validation */ }
class LoggingMiddleware { /* Request logging */ }
class ErrorHandlingMiddleware { /* Error handling */ }

// Services
class ApiService { /* API coordination */ }
class RequestService { /* Request handling */ }
class ResponseService { /* Response formatting */ }
class SecurityService { /* Security operations */ }

// Utilities
class ApiValidator { /* API validation */ }
class ApiResponseBuilder { /* Response building */ }
class ApiErrorMapper { /* Error mapping */ }
```

### Data Processing
```javascript
// Processors
class DataProcessor { /* General data processing */ }
class FileProcessor { /* File-specific processing */ }
class ImageProcessor { /* Image-specific processing */ }
class TextProcessor { /* Text-specific processing */ }
class VideoProcessor { /* Video-specific processing */ }

// Readers/Writers
class FileReader { /* File reading */ }
class DatabaseReader { /* Database reading */ }
class ApiReader { /* API reading */ }
class FileWriter { /* File writing */ }
class DatabaseWriter { /* Database writing */ }
class ApiWriter { /* API writing */ }

// Transformers
class DataTransformer { /* Data transformation */ }
class FormatConverter { /* Format conversion */ }
class DataNormalizer { /* Data normalization */ }
class DataValidator { /* Data validation */ }
```

Remember: Good class names are essential for code readability and maintainability. They should clearly communicate the class's purpose and role in your system, making your code self-documenting and easier to understand.