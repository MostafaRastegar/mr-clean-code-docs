# Open/Closed Principle

## Overview

The Open/Closed Principle (OCP) states that software entities (classes, modules, functions, etc.) should be open for extension but closed for modification. This means you should be able to add new functionality without changing existing code, which reduces the risk of introducing bugs and makes your code more maintainable.

## Core Principles

### 1. Open for Extension

New functionality should be added by extending existing code, not by modifying it.

**❌ Bad (Requires Modification):**
```javascript
class PaymentProcessor {
  processPayment(amount, method) {
    if (method === 'credit_card') {
      return this.processCreditCard(amount);
    } else if (method === 'paypal') {
      return this.processPayPal(amount);
    } else if (method === 'bitcoin') {
      return this.processBitcoin(amount);
    } else {
      throw new Error('Unsupported payment method');
    }
  }
  
  processCreditCard(amount) {
    // Credit card processing logic
  }
  
  processPayPal(amount) {
    // PayPal processing logic
  }
  
  processBitcoin(amount) {
    // Bitcoin processing logic
  }
}

// Adding a new payment method requires modifying the existing class
class PaymentProcessor {
  processPayment(amount, method) {
    if (method === 'credit_card') {
      return this.processCreditCard(amount);
    } else if (method === 'paypal') {
      return this.processPayPal(amount);
    } else if (method === 'bitcoin') {
      return this.processBitcoin(amount);
    } else if (method === 'apple_pay') { // Modification required
      return this.processApplePay(amount);
    } else {
      throw new Error('Unsupported payment method');
    }
  }
  
  processApplePay(amount) { // New method added
    // Apple Pay processing logic
  }
}
```

**✅ Good (Open for Extension):**
```javascript
class PaymentProcessor {
  constructor() {
    this.methods = new Map();
  }
  
  registerMethod(name, processor) {
    this.methods.set(name, processor);
  }
  
  processPayment(amount, method) {
    const processor = this.methods.get(method);
    if (!processor) {
      throw new Error(`Unsupported payment method: ${method}`);
    }
    return processor.process(amount);
  }
}

// Payment method implementations
class CreditCardProcessor {
  process(amount) {
    // Credit card processing logic
    return { success: true, transactionId: 'cc_' + Date.now() };
  }
}

class PayPalProcessor {
  process(amount) {
    // PayPal processing logic
    return { success: true, transactionId: 'pp_' + Date.now() };
  }
}

class BitcoinProcessor {
  process(amount) {
    // Bitcoin processing logic
    return { success: true, transactionId: 'btc_' + Date.now() };
  }
}

// Usage
const processor = new PaymentProcessor();
processor.registerMethod('credit_card', new CreditCardProcessor());
processor.registerMethod('paypal', new PayPalProcessor());
processor.registerMethod('bitcoin', new BitcoinProcessor());

// Adding a new payment method - no modification required
class ApplePayProcessor {
  process(amount) {
    // Apple Pay processing logic
    return { success: true, transactionId: 'apple_' + Date.now() };
  }
}

processor.registerMethod('apple_pay', new ApplePayProcessor());
```

### 2. Closed for Modification

Existing, working code should not be modified when adding new functionality.

**❌ Bad (Modifies Existing Code):**
```javascript
class DiscountCalculator {
  calculateDiscount(customer, amount) {
    if (customer.type === 'regular') {
      return amount * 0.05; // 5% discount
    } else if (customer.type === 'premium') {
      return amount * 0.10; // 10% discount
    } else if (customer.type === 'vip') {
      return amount * 0.15; // 15% discount
    } else {
      return 0; // No discount
    }
  }
}

// Adding a new customer type requires modifying existing code
class DiscountCalculator {
  calculateDiscount(customer, amount) {
    if (customer.type === 'regular') {
      return amount * 0.05; // 5% discount
    } else if (customer.type === 'premium') {
      return amount * 0.10; // 10% discount
    } else if (customer.type === 'vip') {
      return amount * 0.15; // 15% discount
    } else if (customer.type === 'corporate') { // Modification required
      return amount * 0.20; // 20% discount
    } else {
      return 0; // No discount
    }
  }
}
```

**✅ Good (No Modification Required):**
```javascript
class DiscountCalculator {
  constructor() {
    this.strategies = new Map();
  }
  
  registerStrategy(customerType, strategy) {
    this.strategies.set(customerType, strategy);
  }
  
  calculateDiscount(customer, amount) {
    const strategy = this.strategies.get(customer.type);
    if (!strategy) {
      return 0; // No discount for unknown types
    }
    return strategy.calculate(amount);
  }
}

// Discount strategies
class RegularCustomerStrategy {
  calculate(amount) {
    return amount * 0.05; // 5% discount
  }
}

class PremiumCustomerStrategy {
  calculate(amount) {
    return amount * 0.10; // 10% discount
  }
}

class VipCustomerStrategy {
  calculate(amount) {
    return amount * 0.15; // 15% discount
  }
}

// Usage
const calculator = new DiscountCalculator();
calculator.registerStrategy('regular', new RegularCustomerStrategy());
calculator.registerStrategy('premium', new PremiumCustomerStrategy());
calculator.registerStrategy('vip', new VipCustomerStrategy());

// Adding a new customer type - no modification required
class CorporateCustomerStrategy {
  calculate(amount) {
    return amount * 0.20; // 20% discount
  }
}

calculator.registerStrategy('corporate', new CorporateCustomerStrategy());
```

### 3. Use Abstraction

Abstract classes and interfaces provide the foundation for extension.

**✅ Examples:**
```javascript
// Abstract base class
class PaymentProcessor {
  process(amount) {
    throw new Error('process method must be implemented');
  }
  
  validate(amount) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
  }
}

// Concrete implementations
class CreditCardProcessor extends PaymentProcessor {
  process(amount) {
    this.validate(amount);
    // Credit card specific logic
    return { method: 'credit_card', amount, fee: amount * 0.02 };
  }
}

class PayPalProcessor extends PaymentProcessor {
  process(amount) {
    this.validate(amount);
    // PayPal specific logic
    return { method: 'paypal', amount, fee: amount * 0.03 };
  }
}

class BitcoinProcessor extends PaymentProcessor {
  process(amount) {
    this.validate(amount);
    // Bitcoin specific logic
    return { method: 'bitcoin', amount, fee: amount * 0.01 };
  }
}

// Usage
const processors = [
  new CreditCardProcessor(),
  new PayPalProcessor(),
  new BitcoinProcessor()
];

const results = processors.map(p => p.process(100));
```

## Design Patterns for OCP

### 1. Strategy Pattern

Use the Strategy pattern to encapsulate algorithms and make them interchangeable.

**✅ Examples:**
```javascript
// Strategy interface
class ShippingStrategy {
  calculateCost(weight, distance) {
    throw new Error('calculateCost must be implemented');
  }
}

// Concrete strategies
class StandardShipping extends ShippingStrategy {
  calculateCost(weight, distance) {
    return weight * distance * 0.01;
  }
}

class ExpressShipping extends ShippingStrategy {
  calculateCost(weight, distance) {
    return weight * distance * 0.05;
  }
}

class OvernightShipping extends ShippingStrategy {
  calculateCost(weight, distance) {
    return weight * distance * 0.10;
  }
}

// Context class
class ShippingCalculator {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  calculate(weight, distance) {
    return this.strategy.calculateCost(weight, distance);
  }
}

// Usage
const calculator = new ShippingCalculator(new StandardShipping());
console.log(calculator.calculate(10, 100)); // 10

// Change strategy without modifying the calculator
calculator.setStrategy(new ExpressShipping());
console.log(calculator.calculate(10, 100)); // 50
```

### 2. Factory Pattern

Use factories to create objects without modifying existing code.

**✅ Examples:**
```javascript
// Product interface
class Shape {
  draw() {
    throw new Error('draw method must be implemented');
  }
}

// Concrete products
class Circle extends Shape {
  draw() {
    return 'Drawing a circle';
  }
}

class Rectangle extends Shape {
  draw() {
    return 'Drawing a rectangle';
  }
}

class Triangle extends Shape {
  draw() {
    return 'Drawing a triangle';
  }
}

// Factory
class ShapeFactory {
  static createShape(type) {
    switch (type) {
      case 'circle':
        return new Circle();
      case 'rectangle':
        return new Rectangle();
      case 'triangle':
        return new Triangle();
      default:
        throw new Error(`Unknown shape type: ${type}`);
    }
  }
}

// Usage
const shapes = ['circle', 'rectangle', 'triangle'].map(type => 
  ShapeFactory.createShape(type)
);

shapes.forEach(shape => console.log(shape.draw()));

// Adding a new shape requires only adding a new class and updating the factory
class Hexagon extends Shape {
  draw() {
    return 'Drawing a hexagon';
  }
}

// Update factory (this is acceptable modification as it's the factory's responsibility)
class ShapeFactory {
  static createShape(type) {
    switch (type) {
      case 'circle':
        return new Circle();
      case 'rectangle':
        return new Rectangle();
      case 'triangle':
        return new Triangle();
      case 'hexagon': // New case added
        return new Hexagon();
      default:
        throw new Error(`Unknown shape type: ${type}`);
    }
  }
}
```

### 3. Template Method Pattern

Use template methods to define the skeleton of an algorithm while allowing subclasses to override specific steps.

**✅ Examples:**
```javascript
// Abstract template class
class ReportGenerator {
  generateReport(data) {
    const header = this.generateHeader();
    const body = this.generateBody(data);
    const footer = this.generateFooter();
    
    return {
      header,
      body,
      footer
    };
  }
  
  generateHeader() {
    throw new Error('generateHeader must be implemented');
  }
  
  generateBody(data) {
    throw new Error('generateBody must be implemented');
  }
  
  generateFooter() {
    return 'Report generated on ' + new Date().toISOString();
  }
}

// Concrete implementations
class SalesReportGenerator extends ReportGenerator {
  generateHeader() {
    return 'Sales Report';
  }
  
  generateBody(data) {
    return `Total sales: $${data.reduce((sum, sale) => sum + sale.amount, 0)}`;
  }
}

class InventoryReportGenerator extends ReportGenerator {
  generateHeader() {
    return 'Inventory Report';
  }
  
  generateBody(data) {
    return `Total items: ${data.length}, Total value: $${data.reduce((sum, item) => sum + (item.quantity * item.price), 0)}`;
  }
}

// Usage
const salesGenerator = new SalesReportGenerator();
const inventoryGenerator = new InventoryReportGenerator();

const salesReport = salesGenerator.generateReport([
  { amount: 100 },
  { amount: 200 },
  { amount: 150 }
]);

const inventoryReport = inventoryGenerator.generateReport([
  { name: 'Widget', quantity: 10, price: 5 },
  { name: 'Gadget', quantity: 5, price: 10 }
]);
```

### 4. Observer Pattern

Use the Observer pattern to allow objects to notify other objects of state changes without tight coupling.

**✅ Examples:**
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

// Concrete subject
class ShoppingCart extends Subject {
  constructor() {
    super();
    this.items = [];
  }
  
  addItem(item) {
    this.items.push(item);
    this.notify({ type: 'item_added', item, total: this.getTotal() });
  }
  
  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
    this.notify({ type: 'item_removed', itemId, total: this.getTotal() });
  }
  
  getTotal() {
    return this.items.reduce((total, item) => total + item.price, 0);
  }
}

// Concrete observers
class InventoryObserver extends Observer {
  update(data) {
    if (data.type === 'item_added') {
      console.log(`Updating inventory for item: ${data.item.name}`);
    }
  }
}

class EmailObserver extends Observer {
  update(data) {
    if (data.type === 'item_added') {
      console.log(`Sending email notification for item: ${data.item.name}`);
    }
  }
}

class AnalyticsObserver extends Observer {
  update(data) {
    console.log(`Recording analytics event: ${data.type}, total: $${data.total}`);
  }
}

// Usage
const cart = new ShoppingCart();
cart.addObserver(new InventoryObserver());
cart.addObserver(new EmailObserver());
cart.addObserver(new AnalyticsObserver());

cart.addItem({ id: 1, name: 'Widget', price: 10 });
cart.addItem({ id: 2, name: 'Gadget', price: 20 });
```

## TypeScript-Specific Considerations

### 1. Interface-Based Design

Use interfaces to define contracts that can be extended.

**✅ Examples:**
```typescript
interface PaymentProcessor {
  process(amount: number): Promise<PaymentResult>;
  supports(method: string): boolean;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  fee: number;
}

class CreditCardProcessor implements PaymentProcessor {
  process(amount: number): Promise<PaymentResult> {
    // Implementation
    return Promise.resolve({
      success: true,
      transactionId: 'cc_' + Date.now(),
      amount,
      fee: amount * 0.02
    });
  }
  
  supports(method: string): boolean {
    return method === 'credit_card';
  }
}

class PayPalProcessor implements PaymentProcessor {
  process(amount: number): Promise<PaymentResult> {
    // Implementation
    return Promise.resolve({
      success: true,
      transactionId: 'pp_' + Date.now(),
      amount,
      fee: amount * 0.03
    });
  }
  
  supports(method: string): boolean {
    return method === 'paypal';
  }
}

class PaymentService {
  private processors: PaymentProcessor[] = [];
  
  addProcessor(processor: PaymentProcessor) {
    this.processors.push(processor);
  }
  
  async processPayment(amount: number, method: string): Promise<PaymentResult> {
    const processor = this.processors.find(p => p.supports(method));
    if (!processor) {
      throw new Error(`Unsupported payment method: ${method}`);
    }
    return processor.process(amount);
  }
}
```

### 2. Generic Types

Use generics to create flexible, extensible code.

**✅ Examples:**
```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

class DatabaseRepository<T> implements Repository<T> {
  constructor(private tableName: string) {}
  
  async findById(id: string): Promise<T | null> {
    // Generic database logic
  }
  
  async save(entity: T): Promise<T> {
    // Generic save logic
  }
  
  async delete(id: string): Promise<void> {
    // Generic delete logic
  }
}

// Specific repositories
class UserRepository extends DatabaseRepository<User> {
  constructor() {
    super('users');
  }
  
  async findByEmail(email: string): Promise<User | null> {
    // User-specific logic
  }
}

class ProductRepository extends DatabaseRepository<Product> {
  constructor() {
    super('products');
  }
  
  async findByCategory(category: string): Promise<Product[]> {
    // Product-specific logic
  }
}
```

### 3. Union Types and Type Guards

Use TypeScript's type system to create extensible code.

**✅ Examples:**
```typescript
type Shape = Circle | Rectangle | Triangle;

interface Circle {
  type: 'circle';
  radius: number;
}

interface Rectangle {
  type: 'rectangle';
  width: number;
  height: number;
}

interface Triangle {
  type: 'triangle';
  base: number;
  height: number;
}

function calculateArea(shape: Shape): number {
  switch (shape.type) {
    case 'circle':
      return Math.PI * shape.radius * shape.radius;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return 0.5 * shape.base * shape.height;
    default:
      const _exhaustive: never = shape;
      throw new Error(`Unknown shape type: ${_exhaustive}`);
  }
}

// Adding a new shape type
interface Hexagon {
  type: 'hexagon';
  side: number;
}

type ExtendedShape = Shape | Hexagon;

function calculateExtendedArea(shape: ExtendedShape): number {
  switch (shape.type) {
    case 'circle':
      return Math.PI * shape.radius * shape.radius;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return 0.5 * shape.base * shape.height;
    case 'hexagon':
      return (3 * Math.sqrt(3) * shape.side * shape.side) / 2;
    default:
      const _exhaustive: never = shape;
      throw new Error(`Unknown shape type: ${_exhaustive}`);
  }
}
```

## Common Pitfalls and Solutions

### 1. Breaking Existing Functionality

**❌ Bad:**
```javascript
class Calculator {
  add(a, b) {
    return a + b;
  }
}

// Modifying existing method breaks compatibility
class Calculator {
  add(a, b, c) { // Changed signature
    return a + b + c;
  }
}
```

**✅ Good:**
```javascript
class Calculator {
  add(a, b) {
    return a + b;
  }
}

// Extend without modifying existing code
class ExtendedCalculator extends Calculator {
  addThree(a, b, c) {
    return this.add(a, b) + c;
  }
}
```

### 2. Tight Coupling to Implementation

**❌ Bad:**
```javascript
class OrderProcessor {
  processOrder(order) {
    const payment = new CreditCardPayment(); // Tightly coupled
    return payment.charge(order.total);
  }
}
```

**✅ Good:**
```javascript
class OrderProcessor {
  constructor(paymentProcessor) {
    this.paymentProcessor = paymentProcessor;
  }
  
  processOrder(order) {
    return this.paymentProcessor.process(order.total);
  }
}

// Usage
const processor = new OrderProcessor(new CreditCardPayment());
```

### 3. Hardcoded Logic

**❌ Bad:**
```javascript
class DiscountCalculator {
  calculateDiscount(customerType, amount) {
    if (customerType === 'premium') {
      return amount * 0.1;
    } else if (customerType === 'vip') {
      return amount * 0.2;
    }
    // Adding new types requires modification
  }
}
```

**✅ Good:**
```javascript
class DiscountCalculator {
  constructor() {
    this.strategies = new Map();
  }
  
  registerStrategy(type, strategy) {
    this.strategies.set(type, strategy);
  }
  
  calculateDiscount(customerType, amount) {
    const strategy = this.strategies.get(customerType);
    return strategy ? strategy.calculate(amount) : 0;
  }
}
```

## Best Practices Summary

1. **Use abstraction**: Define interfaces and abstract classes for extension points
2. **Favor composition over inheritance**: Use composition to build complex behavior
3. **Program to interfaces**: Depend on abstractions, not concrete implementations
4. **Use design patterns**: Strategy, Factory, Template Method, Observer patterns
5. **Avoid hardcoded logic**: Use configuration and dependency injection
6. **Make extension points explicit**: Clearly define where and how to extend
7. **Maintain backward compatibility**: Don't break existing functionality
8. **Use dependency injection**: Inject dependencies rather than creating them
9. **Follow the Liskov Substitution Principle**: Subtypes should be substitutable for their base types
10. **Test your abstractions**: Ensure your extension points work correctly

## Examples in Context

### E-commerce Application
```javascript
// Before: Violates OCP
class ShippingCalculator {
  calculateShipping(order) {
    if (order.weight <= 1) {
      return 5.00;
    } else if (order.weight <= 5) {
      return 10.00;
    } else if (order.weight <= 10) {
      return 15.00;
    } else {
      return 20.00;
    }
  }
}

// Adding new shipping rules requires modification
class ShippingCalculator {
  calculateShipping(order) {
    if (order.weight <= 1) {
      return 5.00;
    } else if (order.weight <= 5) {
      return 10.00;
    } else if (order.weight <= 10) {
      return 15.00;
    } else if (order.weight <= 20) { // Modification required
      return 25.00;
    } else {
      return 30.00;
    }
  }
}

// After: Follows OCP
class ShippingCalculator {
  constructor() {
    this.rules = [];
  }
  
  addRule(rule) {
    this.rules.push(rule);
  }
  
  calculateShipping(order) {
    for (const rule of this.rules) {
      const cost = rule.calculate(order);
      if (cost !== null) {
        return cost;
      }
    }
    return 0;
  }
}

class WeightBasedRule {
  constructor(minWeight, maxWeight, cost) {
    this.minWeight = minWeight;
    this.maxWeight = maxWeight;
    this.cost = cost;
  }
  
  calculate(order) {
    if (order.weight >= this.minWeight && order.weight <= this.maxWeight) {
      return this.cost;
    }
    return null;
  }
}

// Usage
const calculator = new ShippingCalculator();
calculator.addRule(new WeightBasedRule(0, 1, 5.00));
calculator.addRule(new WeightBasedRule(1, 5, 10.00));
calculator.addRule(new WeightBasedRule(5, 10, 15.00));

// Adding new rules - no modification required
calculator.addRule(new WeightBasedRule(10, 20, 25.00));
calculator.addRule(new WeightBasedRule(20, Infinity, 30.00));
```

### API Development
```javascript
// Before: Violates OCP
class ResponseFormatter {
  format(data, format) {
    if (format === 'json') {
      return JSON.stringify(data);
    } else if (format === 'xml') {
      return this.convertToXml(data);
    } else if (format === 'csv') {
      return this.convertToCsv(data);
    }
  }
  
  convertToXml(data) {
    // XML conversion logic
  }
  
  convertToCsv(data) {
    // CSV conversion logic
  }
}

// Adding new format requires modification
class ResponseFormatter {
  format(data, format) {
    if (format === 'json') {
      return JSON.stringify(data);
    } else if (format === 'xml') {
      return this.convertToXml(data);
    } else if (format === 'csv') {
      return this.convertToCsv(data);
    } else if (format === 'yaml') { // Modification required
      return this.convertToYaml(data);
    }
  }
  
  convertToYaml(data) { // New method
    // YAML conversion logic
  }
}

// After: Follows OCP
class ResponseFormatter {
  constructor() {
    this.formatters = new Map();
  }
  
  registerFormatter(format, formatter) {
    this.formatters.set(format, formatter);
  }
  
  format(data, format) {
    const formatter = this.formatters.get(format);
    if (!formatter) {
      throw new Error(`Unsupported format: ${format}`);
    }
    return formatter.format(data);
  }
}

class JsonFormatter {
  format(data) {
    return JSON.stringify(data);
  }
}

class XmlFormatter {
  format(data) {
    // XML conversion logic
  }
}

class CsvFormatter {
  format(data) {
    // CSV conversion logic
  }
}

// Usage
const formatter = new ResponseFormatter();
formatter.registerFormatter('json', new JsonFormatter());
formatter.registerFormatter('xml', new XmlFormatter());
formatter.registerFormatter('csv', new CsvFormatter());

// Adding new format - no modification required
class YamlFormatter {
  format(data) {
    // YAML conversion logic
  }
}

formatter.registerFormatter('yaml', new YamlFormatter());
```

### Data Processing
```javascript
// Before: Violates OCP
class DataProcessor {
  process(data, type) {
    if (type === 'csv') {
      return this.processCsv(data);
    } else if (type === 'json') {
      return this.processJson(data);
    } else if (type === 'xml') {
      return this.processXml(data);
    }
  }
  
  processCsv(data) {
    // CSV processing logic
  }
  
  processJson(data) {
    // JSON processing logic
  }
  
  processXml(data) {
    // XML processing logic
  }
}

// After: Follows OCP
class DataProcessor {
  constructor() {
    this.processors = new Map();
  }
  
  registerProcessor(type, processor) {
    this.processors.set(type, processor);
  }
  
  process(data, type) {
    const processor = this.processors.get(type);
    if (!processor) {
      throw new Error(`Unsupported data type: ${type}`);
    }
    return processor.process(data);
  }
}

class CsvProcessor {
  process(data) {
    // CSV processing logic
  }
}

class JsonProcessor {
  process(data) {
    // JSON processing logic
  }
}

class XmlProcessor {
  process(data) {
    // XML processing logic
  }
}

// Usage
const processor = new DataProcessor();
processor.registerProcessor('csv', new CsvProcessor());
processor.registerProcessor('json', new JsonProcessor());
processor.registerProcessor('xml', new XmlProcessor());

// Adding new processor - no modification required
class YamlProcessor {
  process(data) {
    // YAML processing logic
  }
}

processor.registerProcessor('yaml', new YamlProcessor());
```

Remember: The Open/Closed Principle helps you build systems that are easy to extend and maintain. By designing for extension rather than modification, you reduce the risk of introducing bugs and make your code more robust.