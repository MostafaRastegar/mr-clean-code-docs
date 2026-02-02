# Inheritance

## Overview

Inheritance is a fundamental object-oriented programming concept that allows classes to inherit properties and methods from other classes. When used properly, inheritance promotes code reuse and establishes clear relationships between classes. However, improper use of inheritance can lead to tightly coupled, fragile code.

## Core Principles

### 1. Use "is-a" Relationships

Inheritance should represent true "is-a" relationships where a subclass is a specialized version of its parent class.

**✅ Good "is-a" Relationships:**
```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  eat() {
    console.log(`${this.name} is eating`);
  }
  
  move() {
    console.log(`${this.name} is moving`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
  
  bark() {
    console.log(`${this.name} is barking`);
  }
  
  // Override parent method
  move() {
    console.log(`${this.name} is running`);
  }
}

class Bird extends Animal {
  constructor(name, canFly) {
    super(name);
    this.canFly = canFly;
  }
  
  fly() {
    if (this.canFly) {
      console.log(`${this.name} is flying`);
    } else {
      console.log(`${this.name} cannot fly`);
    }
  }
}

// Usage
const dog = new Dog('Buddy', 'Golden Retriever');
const bird = new Bird('Tweety', true);

dog.eat(); // Inherited from Animal
dog.bark(); // Specific to Dog
bird.fly(); // Specific to Bird
```

**❌ Bad "is-a" Relationships:**
```javascript
class Vehicle {
  startEngine() {
    console.log('Engine started');
  }
}

// This is NOT a good "is-a" relationship
class Bicycle extends Vehicle {
  startEngine() {
    throw new Error('Bicycles don\'t have engines');
  }
  
  pedal() {
    console.log('Pedaling the bicycle');
  }
}

// Better approach - composition
class Bicycle {
  constructor() {
    this.movement = new PedalMovement();
  }
  
  move() {
    this.movement.pedal();
  }
}

class PedalMovement {
  pedal() {
    console.log('Moving by pedaling');
  }
}
```

### 2. Favor Composition Over Inheritance

When in doubt, use composition instead of inheritance for code reuse.

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
}

class Wheels {
  rotate() {
    console.log('Wheels rotating');
  }
}

class Vehicle {
  constructor() {
    this.engine = new Engine();
    this.wheels = new Wheels();
  }
  
  start() {
    this.engine.start();
    this.wheels.rotate();
  }
}

class Car extends Vehicle {
  // Car-specific behavior
  honk() {
    console.log('Beep beep!');
  }
}

class Motorcycle extends Vehicle {
  // Motorcycle-specific behavior
  wheelie() {
    console.log('Doing a wheelie!');
  }
}
```

**❌ Bad Multiple Inheritance (if supported):**
```javascript
// This creates complexity and potential conflicts
class FlyingCar extends Car, Airplane {
  // Which start() method do we inherit?
  // How do we resolve naming conflicts?
  // This becomes very complex very quickly
}
```

### 3. Don't Break the Liskov Substitution Principle

Subclasses should be substitutable for their parent classes without breaking the program.

**✅ Follows LSP:**
```javascript
class Shape {
  getArea() {
    throw new Error('getArea must be implemented');
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
  
  getArea() {
    return this.width * this.height;
  }
}

class Square extends Rectangle {
  constructor(side) {
    super(side, side);
  }
  
  // Square maintains Rectangle's contract
  setWidth(width) {
    super.setWidth(width);
    this.height = width; // Maintains square properties
  }
  
  setHeight(height) {
    super.setHeight(height);
    this.width = height; // Maintains square properties
  }
}

// All shapes can be used interchangeably
function calculateTotalArea(shapes) {
  return shapes.reduce((total, shape) => total + shape.getArea(), 0);
}

const shapes = [
  new Rectangle(5, 10),
  new Square(5),
  new Rectangle(3, 7)
];

console.log(calculateTotalArea(shapes)); // Works for all shapes
```

**❌ Breaks LSP:**
```javascript
class Bird {
  fly() {
    console.log('Flying high');
  }
}

class Penguin extends Bird {
  fly() {
    throw new Error('Penguins cannot fly');
  }
  
  swim() {
    console.log('Swimming gracefully');
  }
}

// This breaks substitutability
function makeBirdFly(bird) {
  bird.fly(); // Will fail for penguins
}

const eagle = new Bird();
const penguin = new Penguin();

makeBirdFly(eagle); // Works
makeBirdFly(penguin); // Breaks!
```

## TypeScript-Specific Considerations

### 1. Interface Inheritance

Use interface inheritance to define contracts that classes can implement.

**✅ Good Interface Inheritance:**
```typescript
interface Drawable {
  draw(): void;
  getArea(): number;
}

interface Movable {
  move(x: number, y: number): void;
  getPosition(): { x: number, y: number };
}

interface Rotatable {
  rotate(angle: number): void;
}

// Classes can implement multiple interfaces
class Circle implements Drawable, Movable, Rotatable {
  constructor(
    private radius: number,
    private x: number = 0,
    private y: number = 0,
    private rotation: number = 0
  ) {}
  
  draw(): void {
    console.log(`Drawing circle with radius ${this.radius}`);
  }
  
  getArea(): number {
    return Math.PI * this.radius * this.radius;
  }
  
  move(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
  
  getPosition(): { x: number, y: number } {
    return { x: this.x, y: this.y };
  }
  
  rotate(angle: number): void {
    this.rotation += angle;
  }
}

// Interface inheritance
interface Shape extends Drawable, Movable {
  id: string;
  color: string;
}

class Rectangle implements Shape {
  constructor(
    public id: string,
    public color: string,
    private width: number,
    private height: number,
    private x: number = 0,
    private y: number = 0
  ) {}
  
  draw(): void {
    console.log(`Drawing ${this.color} rectangle`);
  }
  
  getArea(): number {
    return this.width * this.height;
  }
  
  move(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
  
  getPosition(): { x: number, y: number } {
    return { x: this.x, y: this.y };
  }
}
```

**❌ Poor Interface Design:**
```typescript
interface Everything {
  // Too many unrelated methods
  draw(): void;
  move(x: number, y: number): void;
  save(): void;
  load(): void;
  validate(): boolean;
  serialize(): string;
  deserialize(data: string): void;
}

// Classes implementing this interface become bloated
class Shape implements Everything {
  // Must implement all methods, even irrelevant ones
  draw(): void { /* ... */ }
  move(x: number, y: number): void { /* ... */ }
  save(): void { /* ... */ }
  load(): void { /* ... */ }
  validate(): boolean { /* ... */ }
  serialize(): string { /* ... */ }
  deserialize(data: string): void { /* ... */ }
}
```

### 2. Abstract Classes

Use abstract classes when you need to share implementation details between related classes.

**✅ Good Abstract Class Usage:**
```typescript
abstract class Shape {
  protected id: string;
  protected color: string;
  protected x: number = 0;
  protected y: number = 0;
  
  constructor(id: string, color: string) {
    this.id = id;
    this.color = color;
  }
  
  // Abstract methods that subclasses must implement
  abstract getArea(): number;
  abstract getPerimeter(): number;
  abstract draw(): void;
  
  // Concrete methods that all shapes share
  move(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
  
  getPosition(): { x: number, y: number } {
    return { x: this.x, y: this.y };
  }
  
  // Template method
  getInfo(): string {
    return `${this.constructor.name} (${this.id}): Area=${this.getArea()}, Perimeter=${this.getPerimeter()}`;
  }
}

class Circle extends Shape {
  constructor(id: string, color: string, private radius: number) {
    super(id, color);
  }
  
  getArea(): number {
    return Math.PI * this.radius * this.radius;
  }
  
  getPerimeter(): number {
    return 2 * Math.PI * this.radius;
  }
  
  draw(): void {
    console.log(`Drawing ${this.color} circle with radius ${this.radius}`);
  }
}

class Rectangle extends Shape {
  constructor(id: string, color: string, private width: number, private height: number) {
    super(id, color);
  }
  
  getArea(): number {
    return this.width * this.height;
  }
  
  getPerimeter(): number {
    return 2 * (this.width + this.height);
  }
  
  draw(): void {
    console.log(`Drawing ${this.color} rectangle ${this.width}x${this.height}`);
  }
}
```

**❌ Poor Abstract Class Usage:**
```typescript
abstract class BaseClass {
  // Too much implementation in base class
  protected database: any;
  protected logger: any;
  protected cache: any;
  protected validator: any;
  protected formatter: any;
  
  constructor() {
    this.database = new Database();
    this.logger = new Logger();
    this.cache = new Cache();
    this.validator = new Validator();
    this.formatter = new Formatter();
  }
  
  // Too many concrete methods
  saveToDatabase(data: any): Promise<void> { /* ... */ }
  logAction(action: string): void { /* ... */ }
  cacheData(key: string, data: any): void { /* ... */ }
  validateData(data: any): boolean { /* ... */ }
  formatOutput(data: any): string { /* ... */ }
  
  // Only one abstract method
  abstract processData(data: any): any;
}

// Subclasses are forced to inherit all this complexity
class SpecificProcessor extends BaseClass {
  processData(data: any): any {
    // Only this method is actually needed
  }
}
```

### 3. Generic Inheritance

Use generics to create flexible, type-safe inheritance hierarchies.

**✅ Good Generic Inheritance:**
```typescript
abstract class Repository<T> {
  protected items: T[] = [];
  
  abstract findById(id: string): T | null;
  abstract save(entity: T): T;
  abstract delete(id: string): void;
  
  findAll(): T[] {
    return [...this.items];
  }
  
  count(): number {
    return this.items.length;
  }
}

class UserRepository extends Repository<User> {
  findById(id: string): User | null {
    return this.items.find(user => user.id === id) || null;
  }
  
  save(user: User): User {
    const existingIndex = this.items.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      this.items[existingIndex] = user;
    } else {
      this.items.push(user);
    }
    return user;
  }
  
  delete(id: string): void {
    this.items = this.items.filter(user => user.id !== id);
  }
}

class ProductRepository extends Repository<Product> {
  findById(id: string): Product | null {
    return this.items.find(product => product.id === id) || null;
  }
  
  save(product: Product): Product {
    const existingIndex = this.items.findIndex(p => p.id === product.id);
    if (existingIndex >= 0) {
      this.items[existingIndex] = product;
    } else {
      this.items.push(product);
    }
    return product;
  }
  
  delete(id: string): void {
    this.items = this.items.filter(product => product.id !== id);
  }
}
```

**❌ Poor Generic Usage:**
```typescript
// Too generic - loses type safety
class GenericRepository<T> {
  items: any[] = []; // Using any loses type safety
  
  findById(id: any): any {
    return this.items.find(item => item.id === id);
  }
  
  save(entity: any): any {
    this.items.push(entity);
    return entity;
  }
}

// Forces type casting everywhere
const userRepo = new GenericRepository();
const user = userRepo.findById('123') as User; // Type casting required
```

## Common Patterns

### 1. Template Method Pattern

Use inheritance to define the skeleton of an algorithm while allowing subclasses to override specific steps.

**✅ Template Method Pattern:**
```javascript
class DataProcessor {
  // Template method
  process(data) {
    const validatedData = this.validate(data);
    const transformedData = this.transform(validatedData);
    const result = this.save(transformedData);
    this.notify(result);
    return result;
  }
  
  // Abstract methods that subclasses must implement
  validate(data) {
    throw new Error('validate method must be implemented');
  }
  
  transform(data) {
    throw new Error('transform method must be implemented');
  }
  
  save(data) {
    throw new Error('save method must be implemented');
  }
  
  // Hook method that subclasses can override
  notify(result) {
    console.log('Processing completed');
  }
}

class UserProcessor extends DataProcessor {
  validate(data) {
    if (!data.email || !data.name) {
      throw new Error('User data must have email and name');
    }
    return data;
  }
  
  transform(data) {
    return {
      ...data,
      createdAt: new Date(),
      email: data.email.toLowerCase()
    };
  }
  
  save(data) {
    // Save to database
    return { id: 'user_' + Date.now(), ...data };
  }
  
  notify(result) {
    console.log(`User ${result.name} created successfully`);
  }
}

class ProductProcessor extends DataProcessor {
  validate(data) {
    if (!data.name || data.price <= 0) {
      throw new Error('Product must have name and positive price');
    }
    return data;
  }
  
  transform(data) {
    return {
      ...data,
      sku: data.name.toUpperCase().replace(/\s+/g, '_'),
      updatedAt: new Date()
    };
  }
  
  save(data) {
    // Save to database
    return { id: 'product_' + Date.now(), ...data };
  }
}
```

### 2. Strategy Pattern with Inheritance

Use inheritance to implement different strategies for the same interface.

**✅ Strategy Pattern:**
```javascript
class CompressionStrategy {
  compress(data) {
    throw new Error('compress method must be implemented');
  }
  
  decompress(data) {
    throw new Error('decompress method must be implemented');
  }
}

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

### 3. Factory Method Pattern

Use inheritance to create objects without specifying the exact class.

**✅ Factory Method Pattern:**
```javascript
class Document {
  constructor(content) {
    this.content = content;
  }
  
  render() {
    throw new Error('render method must be implemented');
  }
}

class TextDocument extends Document {
  render() {
    return `<text>${this.content}</text>`;
  }
}

class HtmlDocument extends Document {
  render() {
    return `<html><body>${this.content}</body></html>`;
  }
}

class DocumentFactory {
  createDocument(content) {
    throw new Error('createDocument method must be implemented');
  }
}

class TextDocumentFactory extends DocumentFactory {
  createDocument(content) {
    return new TextDocument(content);
  }
}

class HtmlDocumentFactory extends DocumentFactory {
  createDocument(content) {
    return new HtmlDocument(content);
  }
}

// Usage
const textFactory = new TextDocumentFactory();
const htmlFactory = new HtmlDocumentFactory();

const textDoc = textFactory.createDocument('Hello World');
const htmlDoc = htmlFactory.createDocument('Hello World');

console.log(textDoc.render()); // "<text>Hello World</text>"
console.log(htmlDoc.render()); // "<html><body>Hello World</body></html>"
```

## Common Pitfalls and Solutions

### 1. Deep Inheritance Hierarchies

**❌ Bad:**
```javascript
class Animal {
  move() { /* ... */ }
}

class Mammal extends Animal {
  feedYoung() { /* ... */ }
}

class Primate extends Mammal {
  climb() { /* ... */ }
}

class Ape extends Primate {
  useTools() { /* ... */ }
}

class Human extends Ape {
  writeCode() { /* ... */ }
}

// Deep hierarchy becomes hard to maintain
```

**✅ Good:**
```javascript
class Animal {
  move() { /* ... */ }
}

class Mammal extends Animal {
  feedYoung() { /* ... */ }
}

class Primate extends Mammal {
  climb() { /* ... */ }
}

// Use composition for specific behaviors
class ToolUser {
  useTools() { /* ... */ }
}

class CodeWriter {
  writeCode() { /* ... */ }
}

class Human extends Primate {
  constructor() {
    super();
    this.toolUser = new ToolUser();
    this.codeWriter = new CodeWriter();
  }
  
  useTools() {
    return this.toolUser.useTools();
  }
  
  writeCode() {
    return this.codeWriter.writeCode();
  }
}
```

### 2. Fragile Base Class Problem

**❌ Bad:**
```javascript
class BaseClass {
  processData(data) {
    // Complex implementation
    this.validate(data);
    this.transform(data);
    this.save(data);
  }
  
  validate(data) { /* ... */ }
  transform(data) { /* ... */ }
  save(data) { /* ... */ }
}

class DerivedClass extends BaseClass {
  processData(data) {
    // Override changes base class behavior
    this.validate(data);
    this.enhance(data); // New step
    this.transform(data);
    this.save(data);
  }
  
  enhance(data) { /* ... */ }
}

// Changes to BaseClass can break DerivedClass
```

**✅ Good:**
```javascript
class BaseClass {
  processData(data) {
    this.validate(data);
    this.transform(data);
    this.save(data);
  }
  
  validate(data) { /* ... */ }
  transform(data) { /* ... */ }
  save(data) { /* ... */ }
}

class DerivedClass extends BaseClass {
  processData(data) {
    // Call parent method first
    super.processData(data);
    // Then add additional behavior
    this.enhance(data);
  }
  
  enhance(data) { /* ... */ }
}
```

### 3. Diamond Problem (Multiple Inheritance)

**❌ Bad (if multiple inheritance was supported):**
```javascript
class A {
  method() { console.log('A'); }
}

class B extends A {
  method() { console.log('B'); }
}

class C extends A {
  method() { console.log('C'); }
}

class D extends B, C {
  // Which method() do we inherit?
  // This creates ambiguity
}
```

**✅ Good (using composition):**
```javascript
class A {
  method() { console.log('A'); }
}

class B {
  method() { console.log('B'); }
}

class C {
  method() { console.log('C'); }
}

class D {
  constructor() {
    this.b = new B();
    this.c = new C();
  }
  
  methodFromB() {
    return this.b.method();
  }
  
  methodFromC() {
    return this.c.method();
  }
}
```

## Best Practices Summary

1. **Use "is-a" relationships**: Only inherit when there's a true specialization relationship
2. **Favor composition over inheritance**: Use composition for code reuse when possible
3. **Follow Liskov Substitution Principle**: Subclasses should be substitutable for their parents
4. **Keep hierarchies shallow**: Avoid deep inheritance chains
5. **Use abstract classes for shared implementation**: Use interfaces for contracts
6. **Avoid multiple inheritance**: Use composition or interfaces instead
7. **Don't break encapsulation**: Don't expose parent class internals
8. **Use template methods for algorithms**: Define skeletons with customizable steps
9. **Document inheritance contracts**: Clearly specify what subclasses must implement
10. **Test inheritance hierarchies**: Ensure all subclasses work correctly with parent contracts

## Examples in Context

### E-commerce Application
```javascript
// Good inheritance hierarchy
class Product {
  constructor(id, name, price) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
  
  getDisplayPrice() {
    return `$${this.price.toFixed(2)}`;
  }
  
  getDescription() {
    return `${this.name} - ${this.getDisplayPrice()}`;
  }
}

class PhysicalProduct extends Product {
  constructor(id, name, price, weight, dimensions) {
    super(id, name, price);
    this.weight = weight;
    this.dimensions = dimensions;
  }
  
  getShippingCost() {
    return this.weight * 0.5; // $0.50 per pound
  }
  
  getDescription() {
    return super.getDescription() + ` (Weight: ${this.weight} lbs)`;
  }
}

class DigitalProduct extends Product {
  constructor(id, name, price, downloadUrl, fileSize) {
    super(id, name, price);
    this.downloadUrl = downloadUrl;
    this.fileSize = fileSize;
  }
  
  getShippingCost() {
    return 0; // Free shipping for digital products
  }
  
  getDescription() {
    return super.getDescription() + ` (Digital - ${this.fileSize}MB)`;
  }
}

// Usage
const products = [
  new PhysicalProduct('p1', 'Book', 19.99, 1.5, { w: 6, h: 9, d: 1 }),
  new DigitalProduct('d1', 'Ebook', 9.99, 'https://example.com/book.pdf', 2.5)
];

products.forEach(product => {
  console.log(product.getDescription());
  console.log(`Shipping: $${product.getShippingCost()}`);
});
```

### API Development
```javascript
// Good inheritance for API controllers
class BaseController {
  constructor(service) {
    this.service = service;
  }
  
  async getAll(req, res) {
    try {
      const result = await this.service.findAll(req.query);
      res.json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  }
  
  async getById(req, res) {
    try {
      const entity = await this.service.findById(req.params.id);
      if (!entity) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.json(entity);
    } catch (error) {
      this.handleError(res, error);
    }
  }
  
  async create(req, res) {
    try {
      const entity = await this.service.create(req.body);
      res.status(201).json(entity);
    } catch (error) {
      this.handleError(res, error);
    }
  }
  
  handleError(res, error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

class UserController extends BaseController {
  constructor(userService) {
    super(userService);
  }
  
  async create(req, res) {
    try {
      // Custom validation for users
      const validation = this.validateUser(req.body);
      if (!validation.valid) {
        return res.status(400).json({ errors: validation.errors });
      }
      
      const entity = await this.service.create(req.body);
      res.status(201).json(entity);
    } catch (error) {
      this.handleError(res, error);
    }
  }
  
  validateUser(userData) {
    const errors = [];
    if (!userData.email) errors.push('Email is required');
    if (!userData.name) errors.push('Name is required');
    return { valid: errors.length === 0, errors };
  }
}

class ProductController extends BaseController {
  constructor(productService) {
    super(productService);
  }
  
  async create(req, res) {
    try {
      // Custom validation for products
      const validation = this.validateProduct(req.body);
      if (!validation.valid) {
        return res.status(400).json({ errors: validation.errors });
      }
      
      const entity = await this.service.create(req.body);
      res.status(201).json(entity);
    } catch (error) {
      this.handleError(res, error);
    }
  }
  
  validateProduct(productData) {
    const errors = [];
    if (!productData.name) errors.push('Name is required');
    if (productData.price <= 0) errors.push('Price must be positive');
    return { valid: errors.length === 0, errors };
  }
}
```

### Data Processing
```javascript
// Good inheritance for data processors
class DataProcessor {
  constructor() {
    this.validators = [];
    this.transformers = [];
  }
  
  addValidator(validator) {
    this.validators.push(validator);
    return this;
  }
  
  addTransformer(transformer) {
    this.transformers.push(transformer);
    return this;
  }
  
  async process(data) {
    // Template method
    let result = data;
    
    result = await this.validate(result);
    result = await this.transform(result);
    result = await this.save(result);
    
    return result;
  }
  
  async validate(data) {
    for (const validator of this.validators) {
      if (!await validator.validate(data)) {
        throw new Error('Validation failed');
      }
    }
    return data;
  }
  
  async transform(data) {
    let result = data;
    for (const transformer of this.transformers) {
      result = await transformer.transform(result);
    }
    return result;
  }
  
  async save(data) {
    throw new Error('save method must be implemented');
  }
}

class UserProcessor extends DataProcessor {
  constructor() {
    super();
    this.addValidator(new UserValidator());
    this.addTransformer(new UserTransformer());
  }
  
  async save(user) {
    // Save user to database
    return { id: 'user_' + Date.now(), ...user };
  }
}

class ProductProcessor extends DataProcessor {
  constructor() {
    super();
    this.addValidator(new ProductValidator());
    this.addTransformer(new ProductTransformer());
  }
  
  async save(product) {
    // Save product to database
    return { id: 'product_' + Date.now(), ...product };
  }
}
```

Remember: Inheritance is a powerful tool when used correctly, but it can lead to complex, tightly coupled code when misused. Always prefer composition over inheritance for code reuse, and ensure that inheritance relationships represent true "is-a" relationships that follow the Liskov Substitution Principle.