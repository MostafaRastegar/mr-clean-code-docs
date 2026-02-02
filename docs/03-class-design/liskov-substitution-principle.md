# Liskov Substitution Principle

## Overview

The Liskov Substitution Principle (LSP) states that objects of a superclass should be replaceable with objects of a subclass without affecting the correctness of the program. In other words, a subclass should be able to stand in for its parent class without breaking the application.

## Core Principles

### 1. Behavioral Substitutability

Subclasses must behave like their base classes in all contexts where the base class is expected.

**❌ Bad (Violates LSP):**
```javascript
class Bird {
  fly() {
    console.log('Flying high in the sky');
  }
}

class Penguin extends Bird {
  fly() {
    throw new Error('Penguins cannot fly');
  }
  
  swim() {
    console.log('Swimming gracefully in water');
  }
}

// This breaks LSP - penguin cannot substitute for bird
function makeBirdFly(bird) {
  bird.fly(); // Will throw error for penguin
}

const penguin = new Penguin();
makeBirdFly(penguin); // Error: Penguins cannot fly
```

**✅ Good (Follows LSP):**
```javascript
class Bird {
  move() {
    console.log('Moving through environment');
  }
}

class FlyingBird extends Bird {
  fly() {
    console.log('Flying high in the sky');
  }
  
  move() {
    this.fly();
  }
}

class SwimmingBird extends Bird {
  swim() {
    console.log('Swimming gracefully in water');
  }
  
  move() {
    this.swim();
  }
}

class Penguin extends SwimmingBird {
  // Inherits swim() and move() behavior
}

class Eagle extends FlyingBird {
  // Inherits fly() and move() behavior
}

// Now all birds can be substituted
function makeBirdMove(bird) {
  bird.move(); // Works for all bird types
}

const penguin = new Penguin();
const eagle = new Eagle();

makeBirdMove(penguin); // "Swimming gracefully in water"
makeBirdMove(eagle);   // "Flying high in the sky"
```

### 2. Precondition Weakening

Subclasses should not strengthen preconditions (requirements) of the base class.

**❌ Bad (Strengthens Preconditions):**
```javascript
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  
  setWidth(width) {
    if (width <= 0) {
      throw new Error('Width must be positive');
    }
    this.width = width;
  }
  
  setHeight(height) {
    if (height <= 0) {
      throw new Error('Height must be positive');
    }
    this.height = height;
  }
  
  getArea() {
    return this.width * this.height;
  }
}

class Square extends Rectangle {
  setWidth(width) {
    if (width <= 0) {
      throw new Error('Width must be positive'); // Same precondition
    }
    if (width !== this.height && this.height !== undefined) {
      throw new Error('Square requires equal width and height'); // Strengthened precondition!
    }
    this.width = width;
    this.height = width; // Force square behavior
  }
  
  setHeight(height) {
    if (height <= 0) {
      throw new Error('Height must be positive'); // Same precondition
    }
    if (height !== this.width && this.width !== undefined) {
      throw new Error('Square requires equal width and height'); // Strengthened precondition!
    }
    this.height = height;
    this.width = height; // Force square behavior
  }
}

// This breaks LSP
function testRectangle(rectangle) {
  rectangle.setWidth(5);
  rectangle.setHeight(10);
  return rectangle.getArea(); // Should be 50
}

const rect = new Rectangle(1, 1);
console.log(testRectangle(rect)); // 50

const square = new Square(1, 1);
console.log(testRectangle(square)); // Error: Square requires equal width and height
```

**✅ Good (Maintains Preconditions):**
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
  
  setWidth(width) {
    if (width <= 0) {
      throw new Error('Width must be positive');
    }
    this.width = width;
  }
  
  setHeight(height) {
    if (height <= 0) {
      throw new Error('Height must be positive');
    }
    this.height = height;
  }
  
  getArea() {
    return this.width * this.height;
  }
}

class Square extends Shape {
  constructor(side) {
    super();
    if (side <= 0) {
      throw new Error('Side must be positive');
    }
    this.side = side;
  }
  
  setSide(side) {
    if (side <= 0) {
      throw new Error('Side must be positive');
    }
    this.side = side;
  }
  
  getArea() {
    return this.side * this.side;
  }
}

// Now both can be used as shapes
function testShape(shape) {
  return shape.getArea();
}

const rect = new Rectangle(5, 10);
const square = new Square(5);

console.log(testShape(rect));   // 50
console.log(testShape(square)); // 25
```

### 3. Postcondition Strengthening

Subclasses should not weaken postconditions (guarantees) of the base class.

**❌ Bad (Weakens Postconditions):**
```javascript
class Calculator {
  divide(a, b) {
    if (b === 0) {
      throw new Error('Division by zero');
    }
    return a / b;
  }
}

class LenientCalculator extends Calculator {
  divide(a, b) {
    if (b === 0) {
      return 0; // Weakens postcondition - should throw error
    }
    return a / b;
  }
}

// This breaks LSP
function useCalculator(calc) {
  try {
    return calc.divide(10, 0);
  } catch (error) {
    return 'Error handled';
  }
}

const calc = new Calculator();
console.log(useCalculator(calc)); // "Error handled"

const lenientCalc = new LenientCalculator();
console.log(useCalculator(lenientCalc)); // 0 (unexpected behavior)
```

**✅ Good (Maintains Postconditions):**
```javascript
class Calculator {
  divide(a, b) {
    if (b === 0) {
      throw new Error('Division by zero');
    }
    return a / b;
  }
}

class AdvancedCalculator extends Calculator {
  divide(a, b) {
    // Maintains the same postcondition
    if (b === 0) {
      throw new Error('Division by zero');
    }
    
    // Adds additional functionality without changing guarantees
    const result = a / b;
    console.log(`Dividing ${a} by ${b} = ${result}`);
    return result;
  }
}

// Both calculators behave consistently
function useCalculator(calc) {
  try {
    return calc.divide(10, 0);
  } catch (error) {
    return 'Error handled';
  }
}

const calc = new Calculator();
const advancedCalc = new AdvancedCalculator();

console.log(useCalculator(calc));        // "Error handled"
console.log(useCalculator(advancedCalc)); // "Error handled"
```

### 4. Invariant Preservation

Subclasses must preserve the invariants (rules) of the base class.

**❌ Bad (Breaks Invariants):**
```javascript
class BankAccount {
  constructor(initialBalance = 0) {
    if (initialBalance < 0) {
      throw new Error('Initial balance cannot be negative');
    }
    this.balance = initialBalance;
  }
  
  withdraw(amount) {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    if (amount > this.balance) {
      throw new Error('Insufficient funds');
    }
    this.balance -= amount;
    return this.balance;
  }
  
  deposit(amount) {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }
    this.balance += amount;
    return this.balance;
  }
}

class OverdraftAccount extends BankAccount {
  constructor(initialBalance = 0, overdraftLimit = 0) {
    super(initialBalance);
    this.overdraftLimit = overdraftLimit;
  }
  
  withdraw(amount) {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    // Breaks invariant: allows balance to go negative beyond limit
    if (amount > this.balance + this.overdraftLimit) {
      throw new Error('Exceeds overdraft limit');
    }
    this.balance -= amount;
    return this.balance;
  }
}

// This breaks LSP - overdraft account doesn't maintain the same invariants
function testAccount(account) {
  account.deposit(100);
  try {
    account.withdraw(150); // Should fail for regular account
    return 'Withdrawal succeeded';
  } catch (error) {
    return 'Withdrawal failed: ' + error.message;
  }
}

const regularAccount = new BankAccount(100);
const overdraftAccount = new OverdraftAccount(100, 50);

console.log(testAccount(regularAccount));  // "Withdrawal failed: Insufficient funds"
console.log(testAccount(overdraftAccount)); // "Withdrawal succeeded" (breaks expectation)
```

**✅ Good (Preserves Invariants):**
```javascript
class BankAccount {
  constructor(initialBalance = 0) {
    if (initialBalance < 0) {
      throw new Error('Initial balance cannot be negative');
    }
    this.balance = initialBalance;
  }
  
  withdraw(amount) {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    if (amount > this.balance) {
      throw new Error('Insufficient funds');
    }
    this.balance -= amount;
    return this.balance;
  }
  
  deposit(amount) {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }
    this.balance += amount;
    return this.balance;
  }
}

class AccountWithOverdraft extends BankAccount {
  constructor(initialBalance = 0, overdraftLimit = 0) {
    super(initialBalance);
    this.overdraftLimit = overdraftLimit;
  }
  
  // Override to provide overdraft functionality while maintaining interface
  createOverdraftWithdrawal(amount) {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    if (amount > this.balance + this.overdraftLimit) {
      throw new Error('Exceeds overdraft limit');
    }
    
    // Create a new withdrawal that respects the overdraft
    const withdrawal = new OverdraftWithdrawal(this, amount);
    return withdrawal.execute();
  }
}

class OverdraftWithdrawal {
  constructor(account, amount) {
    this.account = account;
    this.amount = amount;
  }
  
  execute() {
    this.account.balance -= this.amount;
    return this.account.balance;
  }
}

// Both account types maintain consistent behavior
function testAccount(account) {
  account.deposit(100);
  try {
    account.withdraw(150); // Should fail for both
    return 'Withdrawal succeeded';
  } catch (error) {
    return 'Withdrawal failed: ' + error.message;
  }
}

const regularAccount = new BankAccount(100);
const overdraftAccount = new AccountWithOverdraft(100, 50);

console.log(testAccount(regularAccount));  // "Withdrawal failed: Insufficient funds"
console.log(testAccount(overdraftAccount)); // "Withdrawal failed: Insufficient funds"
```

## TypeScript-Specific Considerations

### 1. Type Compatibility

TypeScript's type system helps enforce LSP through structural typing.

**✅ Examples:**
```typescript
interface Bird {
  fly(): void;
  eat(): void;
}

interface SwimmingBird extends Bird {
  swim(): void;
}

class Duck implements SwimmingBird {
  fly() {
    console.log('Flying');
  }
  
  eat() {
    console.log('Eating');
  }
  
  swim() {
    console.log('Swimming');
  }
}

class Eagle implements Bird {
  fly() {
    console.log('Flying high');
  }
  
  eat() {
    console.log('Eating');
  }
}

// TypeScript ensures LSP compliance
function makeBirdFly(bird: Bird) {
  bird.fly(); // Works for both Duck and Eagle
}

const duck: Bird = new Duck(); // Duck is assignable to Bird
const eagle: Bird = new Eagle();

makeBirdFly(duck);  // Works
makeBirdFly(eagle); // Works
```

### 2. Abstract Classes and Interfaces

Use abstract classes and interfaces to define clear contracts.

**✅ Examples:**
```typescript
abstract class Shape {
  abstract getArea(): number;
  abstract getPerimeter(): number;
  
  // Template method that uses abstract methods
  getInfo(): string {
    return `Area: ${this.getArea()}, Perimeter: ${this.getPerimeter()}`;
  }
}

class Rectangle extends Shape {
  constructor(private width: number, private height: number) {
    super();
    if (width <= 0 || height <= 0) {
      throw new Error('Dimensions must be positive');
    }
  }
  
  getArea(): number {
    return this.width * this.height;
  }
  
  getPerimeter(): number {
    return 2 * (this.width + this.height);
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
    if (radius <= 0) {
      throw new Error('Radius must be positive');
    }
  }
  
  getArea(): number {
    return Math.PI * this.radius * this.radius;
  }
  
  getPerimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

// All shapes can be used interchangeably
function processShape(shape: Shape): void {
  console.log(shape.getInfo());
}

const rect = new Rectangle(5, 10);
const circle = new Circle(5);

processShape(rect);   // "Area: 50, Perimeter: 30"
processShape(circle); // "Area: 78.53981633974483, Perimeter: 31.41592653589793"
```

### 3. Generic Constraints

Use generic constraints to ensure type safety while maintaining substitutability.

**✅ Examples:**
```typescript
interface Drawable {
  draw(): void;
}

interface Movable {
  move(x: number, y: number): void;
}

class Canvas {
  drawObjects<T extends Drawable>(objects: T[]): void {
    objects.forEach(obj => obj.draw());
  }
  
  moveObjects<T extends Movable>(objects: T[], x: number, y: number): void {
    objects.forEach(obj => obj.move(x, y));
  }
}

class Circle implements Drawable, Movable {
  constructor(private x: number, private y: number) {}
  
  draw(): void {
    console.log(`Drawing circle at (${this.x}, ${this.y})`);
  }
  
  move(x: number, y: number): void {
    this.x += x;
    this.y += y;
    console.log(`Moved circle to (${this.x}, ${this.y})`);
  }
}

class Rectangle implements Drawable, Movable {
  constructor(private x: number, private y: number, private width: number, private height: number) {}
  
  draw(): void {
    console.log(`Drawing rectangle at (${this.x}, ${this.y}) with size ${this.width}x${this.height}`);
  }
  
  move(x: number, y: number): void {
    this.x += x;
    this.y += y;
    console.log(`Moved rectangle to (${this.x}, ${this.y})`);
  }
}

// Both Circle and Rectangle can be used with Canvas
const canvas = new Canvas();
const shapes: (Drawable & Movable)[] = [
  new Circle(0, 0),
  new Rectangle(10, 10, 5, 8)
];

canvas.drawObjects(shapes);
canvas.moveObjects(shapes, 5, 5);
```

## Common Pitfalls and Solutions

### 1. Inheritance for Code Reuse Only

**❌ Bad:**
```javascript
class Vehicle {
  startEngine() {
    console.log('Engine started');
  }
}

class Bicycle extends Vehicle {
  startEngine() {
    throw new Error('Bicycles don\'t have engines');
  }
  
  pedal() {
    console.log('Pedaling the bicycle');
  }
}
```

**✅ Good:**
```javascript
class Vehicle {
  move() {
    throw new Error('move method must be implemented');
  }
}

class MotorVehicle extends Vehicle {
  startEngine() {
    console.log('Engine started');
  }
  
  move() {
    this.startEngine();
    console.log('Vehicle moving');
  }
}

class Bicycle extends Vehicle {
  move() {
    console.log('Bicycle moving');
  }
}
```

### 2. Changing Method Signatures

**❌ Bad:**
```javascript
class Animal {
  makeSound(volume) {
    console.log(`Making sound at volume ${volume}`);
  }
}

class Dog extends Animal {
  makeSound(volume, breed) { // Changed signature
    console.log(`Dog ${breed} making sound at volume ${volume}`);
  }
}
```

**✅ Good:**
```javascript
class Animal {
  makeSound(options) {
    console.log(`Making sound at volume ${options.volume}`);
  }
}

class Dog extends Animal {
  makeSound(options) { // Same signature, extended behavior
    console.log(`Dog ${options.breed} making sound at volume ${options.volume}`);
  }
}
```

### 3. Throwing New Exceptions

**❌ Bad:**
```javascript
class FileReader {
  read(filePath) {
    // May throw FileNotFound error
  }
}

class SecureFileReader extends FileReader {
  read(filePath) {
    // Throws additional SecurityError
  }
}
```

**✅ Good:**
```javascript
class FileReader {
  read(filePath) {
    // May throw FileError (base class for all file-related errors)
  }
}

class SecureFileReader extends FileReader {
  read(filePath) {
    // Throws FileError or SecurityError (both extend FileError)
  }
}
```

## Best Practices Summary

1. **Preserve behavior**: Subclasses should behave like their base classes
2. **Don't strengthen preconditions**: Don't add more requirements than the base class
3. **Don't weaken postconditions**: Don't reduce the guarantees provided by the base class
4. **Preserve invariants**: Maintain the same rules and constraints
5. **Use composition when inheritance doesn't fit**: Don't force inheritance relationships
6. **Follow the "is-a" relationship**: Subclasses should truly be specializations of the base class
7. **Use abstract classes and interfaces**: Define clear contracts for substitution
8. **Test substitutability**: Ensure subclasses can replace their base classes in all contexts
9. **Avoid inheritance for code reuse only**: Use composition for code reuse without behavioral contracts
10. **Maintain method signatures**: Don't change method signatures in subclasses

## Examples in Context

### E-commerce Application
```javascript
// Before: Violates LSP
class PaymentMethod {
  process(amount) {
    throw new Error('process method must be implemented');
  }
}

class CreditCard extends PaymentMethod {
  process(amount) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    // Credit card processing logic
    return { success: true, transactionId: 'cc_' + Date.now() };
  }
}

class Cash extends PaymentMethod {
  process(amount) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    if (amount > 1000) {
      throw new Error('Cash payments limited to $1000'); // Strengthened precondition
    }
    // Cash processing logic
    return { success: true, receipt: 'cash_' + Date.now() };
  }
}

// This breaks LSP
function processPayment(method, amount) {
  try {
    return method.process(amount);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

const cc = new CreditCard();
const cash = new Cash();

console.log(processPayment(cc, 500));  // Success
console.log(processPayment(cash, 500)); // Success
console.log(processPayment(cash, 1500)); // Error - breaks substitutability

// After: Follows LSP
class PaymentMethod {
  process(amount) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    throw new Error('process method must be implemented');
  }
}

class CreditCard extends PaymentMethod {
  process(amount) {
    super.process(amount); // Maintains precondition
    // Credit card processing logic
    return { success: true, transactionId: 'cc_' + Date.now() };
  }
}

class Cash extends PaymentMethod {
  process(amount) {
    super.process(amount); // Maintains precondition
    if (amount > 1000) {
      return { success: false, error: 'Cash payments limited to $1000' }; // Returns error instead of throwing
    }
    // Cash processing logic
    return { success: true, receipt: 'cash_' + Date.now() };
  }
}

// Now all payment methods behave consistently
function processPayment(method, amount) {
  try {
    return method.process(amount);
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### API Development
```javascript
// Before: Violates LSP
class ResponseHandler {
  handle(response) {
    if (!response.ok) {
      throw new Error('Request failed');
    }
    return response.data;
  }
}

class JsonHandler extends ResponseHandler {
  handle(response) {
    if (!response.ok) {
      throw new Error('Request failed');
    }
    if (!response.headers['content-type'].includes('application/json')) {
      throw new Error('Response is not JSON'); // Strengthened precondition
    }
    return JSON.parse(response.data);
  }
}

class TextHandler extends ResponseHandler {
  handle(response) {
    if (!response.ok) {
      throw new Error('Request failed');
    }
    return response.data.toString(); // Different return type
  }
}

// This breaks LSP
function processResponse(handler, response) {
  try {
    const data = handler.handle(response);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// After: Follows LSP
class ResponseHandler {
  handle(response) {
    if (!response.ok) {
      throw new Error('Request failed');
    }
    return this.parseData(response);
  }
  
  parseData(response) {
    throw new Error('parseData method must be implemented');
  }
}

class JsonHandler extends ResponseHandler {
  parseData(response) {
    try {
      return JSON.parse(response.data);
    } catch (error) {
      throw new Error('Invalid JSON data');
    }
  }
}

class TextHandler extends ResponseHandler {
  parseData(response) {
    return response.data.toString();
  }
}

// Now all handlers behave consistently
function processResponse(handler, response) {
  try {
    const data = handler.handle(response);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Data Processing
```javascript
// Before: Violates LSP
class DataProcessor {
  process(data) {
    if (!data || data.length === 0) {
      throw new Error('Data cannot be empty');
    }
    return data.map(item => item * 2);
  }
}

class StringProcessor extends DataProcessor {
  process(data) {
    if (!data || data.length === 0) {
      throw new Error('Data cannot be empty');
    }
    if (typeof data !== 'string') {
      throw new Error('Data must be a string'); // Strengthened precondition
    }
    return data.toUpperCase();
  }
}

class NumberProcessor extends DataProcessor {
  process(data) {
    if (!data || data.length === 0) {
      throw new Error('Data cannot be empty');
    }
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array'); // Strengthened precondition
    }
    return data.filter(num => num > 0); // Different behavior
  }
}

// This breaks LSP
function processData(processor, data) {
  try {
    return processor.process(data);
  } catch (error) {
    return { error: error.message };
  }
}

// After: Follows LSP
class DataProcessor {
  process(data) {
    if (!data) {
      throw new Error('Data cannot be null');
    }
    return this.transformData(data);
  }
  
  transformData(data) {
    throw new Error('transformData method must be implemented');
  }
}

class StringProcessor extends DataProcessor {
  transformData(data) {
    if (typeof data !== 'string') {
      throw new Error('Data must be a string');
    }
    return data.toUpperCase();
  }
}

class NumberProcessor extends DataProcessor {
  transformData(data) {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    return data.map(num => num * 2);
  }
}

// Now all processors behave consistently
function processData(processor, data) {
  try {
    return processor.process(data);
  } catch (error) {
    return { error: error.message };
  }
}
```

Remember: The Liskov Substitution Principle ensures that inheritance relationships are meaningful and that subclasses can truly stand in for their base classes. This makes your code more predictable and maintainable.