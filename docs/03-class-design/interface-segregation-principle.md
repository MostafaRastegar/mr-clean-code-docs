# Interface Segregation Principle

## Overview

The Interface Segregation Principle (ISP) states that clients should not be forced to depend on interfaces they do not use. In other words, create specific, focused interfaces rather than large, general-purpose ones. This principle helps reduce coupling and makes your code more maintainable.

## Core Principles

### 1. Create Focused Interfaces

Design interfaces that are specific to the needs of their clients.

**❌ Bad (Fat Interface):**
```javascript
class Machine {
  print(document) {
    throw new Error('print method must be implemented');
  }
  
  scan(document) {
    throw new Error('scan method must be implemented');
  }
  
  fax(document) {
    throw new Error('fax method must be implemented');
  }
}

class OldPrinter extends Machine {
  print(document) {
    console.log('Printing document');
  }
  
  scan(document) {
    throw new Error('This printer cannot scan'); // Forced to implement unused method
  }
  
  fax(document) {
    throw new Error('This printer cannot fax'); // Forced to implement unused method
  }
}

class ModernPrinter extends Machine {
  print(document) {
    console.log('Printing document');
  }
  
  scan(document) {
    console.log('Scanning document');
  }
  
  fax(document) {
    console.log('Faxing document');
  }
}
```

**✅ Good (Segregated Interfaces):**
```javascript
class Printer {
  print(document) {
    throw new Error('print method must be implemented');
  }
}

class Scanner {
  scan(document) {
    throw new Error('scan method must be implemented');
  }
}

class FaxMachine {
  fax(document) {
    throw new Error('fax method must be implemented');
  }
}

class OldPrinter extends Printer {
  print(document) {
    console.log('Printing document');
  }
}

class ModernPrinter extends Printer {
  constructor() {
    super();
    this.scanner = new ScannerImpl();
    this.faxMachine = new FaxMachineImpl();
  }
  
  print(document) {
    console.log('Printing document');
  }
  
  scan(document) {
    return this.scanner.scan(document);
  }
  
  fax(document) {
    return this.faxMachine.fax(document);
  }
}

// Or use composition
class AllInOnePrinter {
  constructor() {
    this.printer = new PrinterImpl();
    this.scanner = new ScannerImpl();
    this.faxMachine = new FaxMachineImpl();
  }
  
  print(document) {
    return this.printer.print(document);
  }
  
  scan(document) {
    return this.scanner.scan(document);
  }
  
  fax(document) {
    return this.faxMachine.fax(document);
  }
}
```

### 2. Avoid Forcing Clients to Implement Unused Methods

Clients should only implement methods they actually need.

**❌ Bad (Forces Unused Implementation):**
```javascript
interface Employee {
  work(): void;
  takeBreak(): void;
  submitTimesheet(): void;
  requestLeave(): void;
  attendMeeting(): void;
  codeReview(): void;
  writeDocumentation(): void;
}

class Developer implements Employee {
  work() {
    console.log('Writing code');
  }
  
  takeBreak() {
    console.log('Taking break');
  }
  
  submitTimesheet() {
    console.log('Submitting timesheet');
  }
  
  requestLeave() {
    console.log('Requesting leave');
  }
  
  attendMeeting() {
    console.log('Attending meeting');
  }
  
  codeReview() {
    console.log('Reviewing code');
  }
  
  writeDocumentation() {
    console.log('Writing documentation');
  }
}

class Janitor implements Employee {
  work() {
    console.log('Cleaning office');
  }
  
  takeBreak() {
    console.log('Taking break');
  }
  
  submitTimesheet() {
    console.log('Submitting timesheet');
  }
  
  requestLeave() {
    console.log('Requesting leave');
  }
  
  attendMeeting() {
    console.log('Attending meeting');
  }
  
  codeReview() {
    throw new Error('Janitors do not do code reviews'); // Forced to implement
  }
  
  writeDocumentation() {
    throw new Error('Janitors do not write documentation'); // Forced to implement
  }
}
```

**✅ Good (Specific Interfaces):**
```javascript
interface Workable {
  work(): void;
}

interface Breakable {
  takeBreak(): void;
}

interface TimeTrackable {
  submitTimesheet(): void;
}

interface LeaveRequestable {
  requestLeave(): void;
}

interface Meetable {
  attendMeeting(): void;
}

interface DeveloperTasks {
  codeReview(): void;
  writeDocumentation(): void;
}

class Developer implements Workable, Breakable, TimeTrackable, LeaveRequestable, Meetable, DeveloperTasks {
  work() {
    console.log('Writing code');
  }
  
  takeBreak() {
    console.log('Taking break');
  }
  
  submitTimesheet() {
    console.log('Submitting timesheet');
  }
  
  requestLeave() {
    console.log('Requesting leave');
  }
  
  attendMeeting() {
    console.log('Attending meeting');
  }
  
  codeReview() {
    console.log('Reviewing code');
  }
  
  writeDocumentation() {
    console.log('Writing documentation');
  }
}

class Janitor implements Workable, Breakable, TimeTrackable, LeaveRequestable, Meetable {
  work() {
    console.log('Cleaning office');
  }
  
  takeBreak() {
    console.log('Taking break');
  }
  
  submitTimesheet() {
    console.log('Submitting timesheet');
  }
  
  requestLeave() {
    console.log('Requesting leave');
  }
  
  attendMeeting() {
    console.log('Attending meeting');
  }
}
```

### 3. Use Composition Over Inheritance

Combine smaller interfaces through composition rather than creating large inheritance hierarchies.

**✅ Examples:**
```javascript
// Small, focused interfaces
interface Drawable {
  draw(): void;
}

interface Movable {
  move(x: number, y: number): void;
}

interface Resizable {
  resize(width: number, height: number): void;
}

interface Clickable {
  onClick(callback: () => void): void;
}

// Composition approach
class Button {
  constructor() {
    this.drawable = new DrawableImpl();
    this.movable = new MovableImpl();
    this.resizable = new ResizableImpl();
    this.clickable = new ClickableImpl();
  }
  
  draw() {
    this.drawable.draw();
  }
  
  move(x, y) {
    this.movable.move(x, y);
  }
  
  resize(width, height) {
    this.resizable.resize(width, height);
  }
  
  onClick(callback) {
    this.clickable.onClick(callback);
  }
}

class Label {
  constructor() {
    this.drawable = new DrawableImpl();
    this.movable = new MovableImpl();
  }
  
  draw() {
    this.drawable.draw();
  }
  
  move(x, y) {
    this.movable.move(x, y);
  }
}

class Image {
  constructor() {
    this.drawable = new DrawableImpl();
    this.movable = new MovableImpl();
    this.resizable = new ResizableImpl();
  }
  
  draw() {
    this.drawable.draw();
  }
  
  move(x, y) {
    this.movable.move(x, y);
  }
  
  resize(width, height) {
    this.resizable.resize(width, height);
  }
}
```

## TypeScript-Specific Considerations

### 1. Interface Composition

Use TypeScript's interface composition features to create flexible type definitions.

**✅ Examples:**
```typescript
interface Drawable {
  draw(): void;
}

interface Movable {
  move(x: number, y: number): void;
}

interface Clickable {
  onClick(callback: () => void): void;
}

// Intersection types for composition
type Button = Drawable & Movable & Clickable;
type Label = Drawable & Movable;
type Image = Drawable & Movable;

// Implementation
class ButtonImpl implements Button {
  draw(): void {
    console.log('Drawing button');
  }
  
  move(x: number, y: number): void {
    console.log(`Moving button to (${x}, ${y})`);
  }
  
  onClick(callback: () => void): void {
    console.log('Button clicked');
    callback();
  }
}

class LabelImpl implements Label {
  draw(): void {
    console.log('Drawing label');
  }
  
  move(x: number, y: number): void {
    console.log(`Moving label to (${x}, ${y})`);
  }
}
```

### 2. Optional Methods

Use optional methods when some functionality is not always needed.

**✅ Examples:**
```typescript
interface BaseShape {
  draw(): void;
  getArea(): number;
}

interface ResizableShape extends BaseShape {
  resize(factor: number): void;
}

interface AnnotatedShape extends BaseShape {
  addAnnotation(text: string): void;
  getAnnotations(): string[];
}

// Circle can implement just the base interface
class Circle implements BaseShape {
  constructor(private radius: number) {}
  
  draw(): void {
    console.log('Drawing circle');
  }
  
  getArea(): number {
    return Math.PI * this.radius * this.radius;
  }
}

// Rectangle can implement resizable
class ResizableRectangle implements ResizableShape {
  constructor(private width: number, private height: number) {}
  
  draw(): void {
    console.log('Drawing rectangle');
  }
  
  getArea(): number {
    return this.width * this.height;
  }
  
  resize(factor: number): void {
    this.width *= factor;
    this.height *= factor;
  }
}

// Complex shape can implement multiple interfaces
class AnnotatedCircle implements BaseShape, AnnotatedShape {
  private annotations: string[] = [];
  
  constructor(private radius: number) {}
  
  draw(): void {
    console.log('Drawing annotated circle');
  }
  
  getArea(): number {
    return Math.PI * this.radius * this.radius;
  }
  
  addAnnotation(text: string): void {
    this.annotations.push(text);
  }
  
  getAnnotations(): string[] {
    return this.annotations;
  }
}
```

### 3. Generic Interfaces

Use generic interfaces to create reusable, type-safe abstractions.

**✅ Examples:**
```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

interface SearchableRepository<T> extends Repository<T> {
  search(query: string): Promise<T[]>;
}

interface SortableRepository<T> extends Repository<T> {
  findAll(sortBy: keyof T): Promise<T[]>;
}

// Specific implementations
class UserRepository implements Repository<User>, SearchableRepository<User> {
  async findById(id: string): Promise<User | null> {
    // Implementation
  }
  
  async save(user: User): Promise<User> {
    // Implementation
  }
  
  async delete(id: string): Promise<void> {
    // Implementation
  }
  
  async search(query: string): Promise<User[]> {
    // Implementation
  }
}

class ProductRepository implements Repository<Product>, SortableRepository<Product> {
  async findById(id: string): Promise<Product | null> {
    // Implementation
  }
  
  async save(product: Product): Promise<Product> {
    // Implementation
  }
  
  async delete(id: string): Promise<void> {
    // Implementation
  }
  
  async findAll(sortBy: keyof Product): Promise<Product[]> {
    // Implementation
  }
}
```

## Common Patterns

### 1. Role-Based Interfaces

Create interfaces based on the roles objects play rather than their types.

**✅ Examples:**
```javascript
// Role-based interfaces
interface Publisher {
  publish(content: string): void;
}

interface Subscriber {
  subscribe(topic: string, callback: Function): void;
  unsubscribe(topic: string): void;
}

interface Notifier {
  notify(message: string): void;
}

// Objects can implement multiple roles
class NewsAgency implements Publisher, Notifier {
  publish(content) {
    console.log(`Publishing: ${content}`);
    this.notify('New content published');
  }
  
  notify(message) {
    console.log(`Notification: ${message}`);
  }
}

class User implements Subscriber {
  subscribe(topic, callback) {
    console.log(`Subscribing to ${topic}`);
  }
  
  unsubscribe(topic) {
    console.log(`Unsubscribing from ${topic}`);
  }
}

class SocialMediaPlatform implements Publisher, Subscriber, Notifier {
  publish(content) {
    console.log(`Posting: ${content}`);
    this.notify('New post available');
  }
  
  subscribe(topic, callback) {
    console.log(`Following ${topic}`);
  }
  
  unsubscribe(topic) {
    console.log(`Unfollowing ${topic}`);
  }
  
  notify(message) {
    console.log(`Alert: ${message}`);
  }
}
```

### 2. Command Pattern

Use the command pattern to create specific, focused interfaces for different operations.

**✅ Examples:**
```javascript
// Command interfaces
interface Command {
  execute(): void;
}

interface UndoableCommand extends Command {
  undo(): void;
}

interface SaveableCommand extends Command {
  save(): void;
}

// Specific command implementations
class CreateDocumentCommand implements Command {
  constructor(private documentService) {}
  
  execute() {
    this.documentService.create();
  }
}

class SaveDocumentCommand implements Command, SaveableCommand {
  constructor(private documentService, private document) {}
  
  execute() {
    this.documentService.save(this.document);
  }
  
  save() {
    this.documentService.backup(this.document);
  }
}

class DeleteDocumentCommand implements Command, UndoableCommand {
  constructor(private documentService, private documentId) {}
  
  execute() {
    this.documentService.delete(this.documentId);
  }
  
  undo() {
    this.documentService.restore(this.documentId);
  }
}
```

### 3. Strategy Pattern

Use the strategy pattern to create focused interfaces for different algorithms.

**✅ Examples:**
```javascript
// Strategy interfaces
interface CompressionStrategy {
  compress(data: string): string;
}

interface EncryptionStrategy {
  encrypt(data: string): string;
}

interface ValidationStrategy {
  validate(data: string): boolean;
}

// Specific implementations
class ZipCompression implements CompressionStrategy {
  compress(data) {
    return `ZIP: ${data}`;
  }
}

class RarCompression implements CompressionStrategy {
  compress(data) {
    return `RAR: ${data}`;
  }
}

class AesEncryption implements EncryptionStrategy {
  encrypt(data) {
    return `AES: ${data}`;
  }
}

class DesEncryption implements EncryptionStrategy {
  encrypt(data) {
    return `DES: ${data}`;
  }
}

class EmailValidation implements ValidationStrategy {
  validate(data) {
    return data.includes('@');
  }
}

class PasswordValidation implements ValidationStrategy {
  validate(data) {
    return data.length >= 8;
  }
}

// Context class that uses strategies
class DataProcessor {
  constructor(
    private compressionStrategy,
    private encryptionStrategy,
    private validationStrategy
  ) {}
  
  process(data) {
    if (!this.validationStrategy.validate(data)) {
      throw new Error('Data validation failed');
    }
    
    const compressed = this.compressionStrategy.compress(data);
    const encrypted = this.encryptionStrategy.encrypt(compressed);
    
    return encrypted;
  }
  
  setCompressionStrategy(strategy) {
    this.compressionStrategy = strategy;
  }
  
  setEncryptionStrategy(strategy) {
    this.encryptionStrategy = strategy;
  }
  
  setValidationStrategy(strategy) {
    this.validationStrategy = strategy;
  }
}
```

## Common Pitfalls and Solutions

### 1. Interface Bloat

**❌ Bad:**
```javascript
interface UserService {
  createUser(userData): Promise<User>;
  updateUser(id, updates): Promise<User>;
  deleteUser(id): Promise<void>;
  getUserById(id): Promise<User>;
  getUserByEmail(email): Promise<User>;
  getUsersByRole(role): Promise<User[]>;
  getUsersByDepartment(department): Promise<User[]>;
  searchUsers(query): Promise<User[]>;
  exportUsers(format): Promise<string>;
  importUsers(data): Promise<User[]>;
  validateUser(userData): ValidationResult;
  authenticateUser(credentials): Promise<AuthResult>;
  authorizeUser(userId, permissions): Promise<boolean>;
  resetPassword(userId): Promise<void>;
  changePassword(userId, oldPassword, newPassword): Promise<void>;
  lockUser(userId): Promise<void>;
  unlockUser(userId): Promise<void>;
  // ... many more methods
}
```

**✅ Good:**
```javascript
interface UserCRUDService {
  createUser(userData): Promise<User>;
  updateUser(id, updates): Promise<User>;
  deleteUser(id): Promise<void>;
  getUserById(id): Promise<User>;
}

interface UserQueryService {
  getUserByEmail(email): Promise<User>;
  getUsersByRole(role): Promise<User[]>;
  getUsersByDepartment(department): Promise<User[]>;
  searchUsers(query): Promise<User[]>;
}

interface UserImportExportService {
  exportUsers(format): Promise<string>;
  importUsers(data): Promise<User[]>;
}

interface UserValidationService {
  validateUser(userData): ValidationResult;
}

interface UserAuthenticationService {
  authenticateUser(credentials): Promise<AuthResult>;
  resetPassword(userId): Promise<void>;
  changePassword(userId, oldPassword, newPassword): Promise<void>;
}

interface UserAuthorizationService {
  authorizeUser(userId, permissions): Promise<boolean>;
  lockUser(userId): Promise<void>;
  unlockUser(userId): Promise<void>;
}

// Combined service for convenience
class UserService implements 
  UserCRUDService, 
  UserQueryService, 
  UserImportExportService,
  UserValidationService,
  UserAuthenticationService,
  UserAuthorizationService {
  // Implementation
}
```

### 2. Diamond Problem

**❌ Bad:**
```javascript
interface A {
  method1(): void;
  method2(): void;
}

interface B extends A {
  method3(): void;
}

interface C extends A {
  method4(): void;
}

interface D extends B, C {
  // Now D has method1, method2, method3, method4
  // But what if B and C have conflicting implementations?
}
```

**✅ Good:**
```javascript
interface Method1And2 {
  method1(): void;
  method2(): void;
}

interface Method3 {
  method3(): void;
}

interface Method4 {
  method4(): void;
}

interface D extends Method1And2, Method3, Method4 {
  // Clear, non-conflicting composition
}
```

### 3. Over-Segregation

**❌ Bad:**
```javascript
interface Draw {
  draw(): void;
}

interface Move {
  move(): void;
}

interface Resize {
  resize(): void;
}

interface Click {
  click(): void;
}

interface Hover {
  hover(): void;
}

// Now every UI element needs 5+ interfaces
class Button implements Draw, Move, Resize, Click, Hover {
  // Implementation
}
```

**✅ Good:**
```javascript
interface Drawable {
  draw(): void;
}

interface Movable {
  move(): void;
}

interface Resizable {
  resize(): void;
}

interface Interactive {
  onClick(callback: () => void): void;
  onHover(callback: () => void): void;
}

class Button implements Drawable, Movable, Resizable, Interactive {
  // Implementation
}
```

## Best Practices Summary

1. **Create focused interfaces**: Each interface should have a single, clear purpose
2. **Avoid fat interfaces**: Don't put methods in interfaces that clients don't need
3. **Use composition**: Combine small interfaces rather than creating large ones
4. **Follow the "is-a" relationship**: Interfaces should represent clear roles or capabilities
5. **Consider client needs**: Design interfaces from the perspective of their consumers
6. **Use optional methods sparingly**: Prefer separate interfaces to optional methods
7. **Avoid interface inheritance hierarchies**: Use composition instead
8. **Group related methods**: Keep related functionality together
9. **Use descriptive names**: Interface names should clearly indicate their purpose
10. **Test interface contracts**: Ensure interfaces are actually used as intended

## Examples in Context

### E-commerce Application
```javascript
// Before: Violates ISP
interface ProductManager {
  createProduct(product): Promise<Product>;
  updateProduct(id, updates): Promise<Product>;
  deleteProduct(id): Promise<void>;
  getProduct(id): Promise<Product>;
  getProducts(): Promise<Product[]>;
  searchProducts(query): Promise<Product[]>;
  filterProducts(filters): Promise<Product[]>;
  sortProducts(criteria): Promise<Product[]>;
  exportProducts(format): Promise<string>;
  importProducts(data): Promise<Product[]>;
  validateProduct(product): ValidationResult;
  calculatePrice(productId, quantity): Promise<number>;
  checkInventory(productId): Promise<number>;
  updateInventory(productId, quantity): Promise<void>;
  // ... many more methods
}

// After: Follows ISP
interface ProductCRUD {
  createProduct(product): Promise<Product>;
  updateProduct(id, updates): Promise<Product>;
  deleteProduct(id): Promise<void>;
  getProduct(id): Promise<Product>;
}

interface ProductQuery {
  getProducts(): Promise<Product[]>;
  searchProducts(query): Promise<Product[]>;
  filterProducts(filters): Promise<Product[]>;
  sortProducts(criteria): Promise<Product[]>;
}

interface ProductImportExport {
  exportProducts(format): Promise<string>;
  importProducts(data): Promise<Product[]>;
}

interface ProductValidation {
  validateProduct(product): ValidationResult;
}

interface ProductPricing {
  calculatePrice(productId, quantity): Promise<number>;
}

interface ProductInventory {
  checkInventory(productId): Promise<number>;
  updateInventory(productId, quantity): Promise<void>;
}

// Specific implementations
class BasicProductManager implements ProductCRUD, ProductQuery, ProductValidation {
  // Implementation
}

class AdvancedProductManager implements 
  ProductCRUD, 
  ProductQuery, 
  ProductImportExport,
  ProductValidation,
  ProductPricing,
  ProductInventory {
  // Implementation
}
```

### API Development
```javascript
// Before: Violates ISP
interface APIController {
  get(req, res): void;
  post(req, res): void;
  put(req, res): void;
  delete(req, res): void;
  patch(req, res): void;
  head(req, res): void;
  options(req, res): void;
  validateRequest(req): ValidationResult;
  authenticateRequest(req): AuthResult;
  authorizeRequest(req, user): boolean;
  formatResponse(data, format): string;
  handleError(error, res): void;
  logRequest(req): void;
  // ... many more methods
}

// After: Follows ISP
interface HTTPMethods {
  get(req, res): void;
  post(req, res): void;
  put(req, res): void;
  delete(req, res): void;
  patch(req, res): void;
}

interface RequestValidation {
  validateRequest(req): ValidationResult;
}

interface Authentication {
  authenticateRequest(req): AuthResult;
}

interface Authorization {
  authorizeRequest(req, user): boolean;
}

interface ResponseFormatting {
  formatResponse(data, format): string;
}

interface ErrorHandling {
  handleError(error, res): void;
}

interface Logging {
  logRequest(req): void;
}

// Specific controllers
class UserController implements HTTPMethods, RequestValidation, Authentication, Authorization {
  // Implementation
}

class ProductController implements HTTPMethods, RequestValidation, ResponseFormatting {
  // Implementation
}

class ReportController implements HTTPMethods, RequestValidation, ResponseFormatting, Logging {
  // Implementation
}
```

### Data Processing
```javascript
// Before: Violates ISP
interface DataProcessor {
  process(data): any;
  validate(data): ValidationResult;
  transform(data): any;
  filter(data, criteria): any[];
  sort(data, criteria): any[];
  aggregate(data, operation): any;
  group(data, criteria): any[];
  merge(data1, data2): any;
  split(data, criteria): any[];
  normalize(data): any;
  denormalize(data): any;
  export(data, format): string;
  import(data, format): any;
  // ... many more methods
}

// After: Follows ISP
interface DataProcessing {
  process(data): any;
}

interface DataValidation {
  validate(data): ValidationResult;
}

interface DataTransformation {
  transform(data): any;
  normalize(data): any;
  denormalize(data): any;
}

interface DataFiltering {
  filter(data, criteria): any[];
  sort(data, criteria): any[];
}

interface DataAggregation {
  aggregate(data, operation): any;
  group(data, criteria): any[];
}

interface DataMerging {
  merge(data1, data2): any;
  split(data, criteria): any[];
}

interface DataImportExport {
  export(data, format): string;
  import(data, format): any;
}

// Specific processors
class ETLProcessor implements DataProcessing, DataValidation, DataTransformation, DataImportExport {
  // Implementation
}

class AnalyticsProcessor implements DataProcessing, DataFiltering, DataAggregation {
  // Implementation
}

class DataCleaner implements DataProcessing, DataValidation, DataTransformation {
  // Implementation
}
```

Remember: The Interface Segregation Principle helps you create clean, focused interfaces that are easier to implement, test, and maintain. By avoiding fat interfaces, you reduce coupling and make your code more flexible.