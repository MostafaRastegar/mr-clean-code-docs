# Code Examples

## Overview

Code examples are essential for demonstrating how to use your code, APIs, or frameworks. Well-crafted examples help developers understand concepts quickly and reduce the learning curve. This document provides guidelines for creating effective, maintainable, and comprehensive code examples.

## Example Structure and Organization

### 1. Example Categories

**Basic Examples:**
```typescript
// basic-usage.ts
import { Calculator } from '../src/calculator';

// Simple usage example
const calc = new Calculator();
const result = calc.add(5, 3);
console.log(`5 + 3 = ${result}`); // Output: 5 + 3 = 8
```

**Advanced Examples:**
```typescript
// advanced-usage.ts
import { Calculator } from '../src/calculator';
import { AdvancedCalculator } from '../src/advanced-calculator';

// Advanced usage with chaining and error handling
async function advancedCalculation() {
  try {
    const calc = new AdvancedCalculator();
    
    // Chain operations
    const result = await calc
      .add(10)
      .multiply(2)
      .subtract(5)
      .divide(3)
      .getResult();
    
    console.log(`Advanced calculation result: ${result}`);
    
    // Error handling
    try {
      await calc.divide(0);
    } catch (error) {
      console.log('Caught division by zero error:', error.message);
    }
    
  } catch (error) {
    console.error('Calculation failed:', error);
  }
}

advancedCalculation();
```

**Integration Examples:**
```typescript
// express-integration.ts
import express from 'express';
import { Calculator } from '../src/calculator';

const app = express();
app.use(express.json());

const calculator = new Calculator();

// REST API endpoints using the calculator
app.post('/api/calculate', (req, res) => {
  try {
    const { operation, a, b } = req.body;
    
    let result;
    switch (operation) {
      case 'add':
        result = calculator.add(a, b);
        break;
      case 'subtract':
        result = calculator.subtract(a, b);
        break;
      case 'multiply':
        result = calculator.multiply(a, b);
        break;
      case 'divide':
        result = calculator.divide(a, b);
        break;
      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }
    
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Calculator API running on port 3000');
});
```

### 2. Example File Organization

**Directory Structure:**
```
examples/
├── basic/
│   ├── hello-world.ts
│   ├── simple-calculation.ts
│   └── basic-usage.ts
├── advanced/
│   ├── error-handling.ts
│   ├── async-operations.ts
│   └── performance-optimization.ts
├── integration/
│   ├── express-integration.ts
│   ├── react-integration.ts
│   └── database-integration.ts
├── real-world/
│   ├── e-commerce-example.ts
│   ├── dashboard-example.ts
│   └── api-client-example.ts
└── README.md
```

**Example README Structure:**
```markdown
# Code Examples

This directory contains comprehensive examples demonstrating various use cases and features.

## Table of Contents

- [Basic Examples](#basic-examples)
- [Advanced Examples](#advanced-examples)
- [Integration Examples](#integration-examples)
- [Real-world Examples](#real-world-examples)
- [Running Examples](#running-examples)

## Basic Examples

Simple examples for getting started:

- **hello-world.ts** - Basic usage and setup
- **simple-calculation.ts** - Fundamental operations
- **basic-usage.ts** - Core functionality demonstration

## Advanced Examples

Complex scenarios and advanced features:

- **error-handling.ts** - Comprehensive error handling patterns
- **async-operations.ts** - Asynchronous operations and promises
- **performance-optimization.ts** - Performance best practices

## Integration Examples

Integration with popular frameworks and libraries:

- **express-integration.ts** - Express.js integration
- **react-integration.ts** - React component integration
- **database-integration.ts** - Database operations

## Real-world Examples

Complete applications and scenarios:

- **e-commerce-example.ts** - E-commerce application example
- **dashboard-example.ts** - Dashboard with real-time updates
- **api-client-example.ts** - Complete API client implementation

## Running Examples

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0

### Installation

```bash
npm install
```

### Running Examples

```bash
# Run a specific example
npm run example:basic

# Run all examples
npm run examples

# Run with TypeScript
npx ts-node examples/basic/hello-world.ts
```

### Example Configuration

Create a `.env` file for examples that require configuration:

```env
API_KEY=your-api-key
DATABASE_URL=your-database-url
DEBUG=true
```
```

## Example Documentation Standards

### 1. Inline Comments

**Explain Complex Logic:**
```typescript
// complex-algorithm.ts
/**
 * Implements the Dijkstra's shortest path algorithm
 * 
 * @param graph - Adjacency list representation of the graph
 * @param start - Starting node
 * @param end - Target node
 * @returns Shortest path and distance
 */
function dijkstra(
  graph: Map<string, Array<{node: string, weight: number}>>,
  start: string,
  end: string
): { path: string[], distance: number } {
  // Priority queue for nodes to visit
  // Uses a simple array with sort for simplicity
  const queue: Array<{node: string, distance: number}> = [{ node: start, distance: 0 }];
  
  // Track visited nodes and their distances
  const distances: Map<string, number> = new Map();
  const previous: Map<string, string> = new Map();
  
  // Initialize distances
  for (const [node] of graph) {
    distances.set(node, Infinity);
  }
  distances.set(start, 0);
  
  while (queue.length > 0) {
    // Sort queue by distance and get the closest node
    queue.sort((a, b) => a.distance - b.distance);
    const { node: current, distance } = queue.shift()!;
    
    // If we've reached the target, reconstruct the path
    if (current === end) {
      const path: string[] = [];
      let node: string | undefined = end;
      
      while (node) {
        path.unshift(node);
        node = previous.get(node);
      }
      
      return { path, distance };
    }
    
    // Skip if we've already found a better path to this node
    if (distance > distances.get(current)!) {
      continue;
    }
    
    // Explore neighbors
    const neighbors = graph.get(current) || [];
    for (const { node: neighbor, weight } of neighbors) {
      const newDistance = distance + weight;
      
      // If we found a shorter path, update it
      if (newDistance < distances.get(neighbor)!) {
        distances.set(neighbor, newDistance);
        previous.set(neighbor, current);
        queue.push({ node: neighbor, distance: newDistance });
      }
    }
  }
  
  // No path found
  return { path: [], distance: Infinity };
}
```

### 2. Step-by-Step Explanations

**Break Down Complex Operations:**
```typescript
// step-by-step-example.ts
/**
 * Demonstrates a complex data processing pipeline
 */
async function dataProcessingPipeline() {
  console.log('🚀 Starting data processing pipeline...');
  
  // Step 1: Data Extraction
  console.log('📦 Step 1: Extracting data from source...');
  const rawData = await extractDataFromSource();
  console.log(`   Extracted ${rawData.length} records`);
  
  // Step 2: Data Validation
  console.log('✅ Step 2: Validating data...');
  const validatedData = validateData(rawData);
  console.log(`   Validated ${validatedData.length} records`);
  
  // Step 3: Data Transformation
  console.log('🔄 Step 3: Transforming data...');
  const transformedData = transformData(validatedData);
  console.log(`   Transformed ${transformedData.length} records`);
  
  // Step 4: Data Enrichment
  console.log(' enrichment...');
  const enrichedData = await enrichData(transformedData);
  console.log(`   Enriched ${enrichedData.length} records`);
  
  // Step 5: Data Loading
  console.log('💾 Step 5: Loading data to destination...');
  await loadDataToDestination(enrichedData);
  console.log('   Data loaded successfully');
  
  console.log('✅ Pipeline completed successfully!');
}

// Helper functions with detailed explanations
async function extractDataFromSource(): Promise<any[]> {
  // Simulate data extraction from various sources
  console.log('   - Reading from database...');
  console.log('   - Fetching from API...');
  console.log('   - Processing files...');
  
  return [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' }
  ];
}

function validateData(data: any[]): any[] {
  // Validate each record
  return data.filter(record => {
    const isValid = record.id && record.name && record.email;
    if (!isValid) {
      console.warn(`   ⚠️  Invalid record: ${JSON.stringify(record)}`);
    }
    return isValid;
  });
}

function transformData(data: any[]): any[] {
  // Transform data to desired format
  return data.map(record => ({
    ...record,
    fullName: record.name,
    createdAt: new Date().toISOString(),
    status: 'processed'
  }));
}

async function enrichData(data: any[]): Promise<any[]> {
  // Enrich data with additional information
  return Promise.all(data.map(async record => {
    // Simulate API call for enrichment
    const additionalInfo = await fetchAdditionalInfo(record.id);
    return {
      ...record,
      ...additionalInfo
    };
  }));
}

async function fetchAdditionalInfo(id: number): Promise<any> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    department: id % 2 === 0 ? 'Engineering' : 'Marketing',
    lastLogin: new Date().toISOString()
  };
}

async function loadDataToDestination(data: any[]): Promise<void> {
  // Simulate loading to destination
  console.log(`   - Inserting ${data.length} records...`);
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('   - Data insertion completed');
}

// Run the example
dataProcessingPipeline().catch(console.error);
```

### 3. Error Handling Examples

**Comprehensive Error Handling:**
```typescript
// error-handling-example.ts
class ExampleWithErrorHandling {
  private apiClient: any;
  private retryAttempts = 3;
  private retryDelay = 1000;

  async processData(input: any): Promise<any> {
    try {
      // Input validation
      this.validateInput(input);
      
      // Process data with retry logic
      return await this.processWithRetry(input);
      
    } catch (error) {
      // Handle specific error types
      if (error instanceof ValidationError) {
        console.error('❌ Input validation failed:', error.message);
        throw error;
      }
      
      if (error instanceof NetworkError) {
        console.error('🌐 Network error occurred:', error.message);
        throw error;
      }
      
      if (error instanceof TimeoutError) {
        console.error('⏱️  Operation timed out:', error.message);
        throw error;
      }
      
      // Handle unknown errors
      console.error('💥 Unexpected error:', error);
      throw new ProcessingError('Data processing failed', error);
    }
  }

  private validateInput(input: any): void {
    if (!input) {
      throw new ValidationError('Input cannot be null or undefined');
    }
    
    if (typeof input !== 'object') {
      throw new ValidationError('Input must be an object');
    }
    
    if (!input.data) {
      throw new ValidationError('Input must contain data property');
    }
  }

  private async processWithRetry(input: any): Promise<any> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${this.retryAttempts}`);
        
        const result = await this.apiClient.process(input);
        console.log('✅ Processing successful');
        return result;
        
      } catch (error) {
        lastError = error;
        
        if (attempt === this.retryAttempts) {
          console.error(`❌ All ${this.retryAttempts} attempts failed`);
          throw lastError;
        }
        
        console.warn(`⚠️  Attempt ${attempt} failed: ${error.message}`);
        console.log(`⏳ Waiting ${this.retryDelay}ms before retry...`);
        
        await this.delay(this.retryDelay * attempt);
      }
    }
    
    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Custom error classes
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

class ProcessingError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'ProcessingError';
  }
}

// Usage example
async function exampleUsage() {
  const processor = new ExampleWithErrorHandling();
  
  try {
    const result = await processor.processData({
      data: 'some data'
    });
    console.log('Result:', result);
  } catch (error) {
    console.error('Failed to process data:', error.message);
  }
}

exampleUsage();
```

## Example Testing

### 1. Testable Examples

**Examples with Tests:**
```typescript
// testable-example.ts
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Calculator Examples', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('Basic Operations', () => {
    it('should add two numbers correctly', () => {
      const result = calculator.add(5, 3);
      expect(result).toBe(8);
    });

    it('should subtract two numbers correctly', () => {
      const result = calculator.subtract(10, 4);
      expect(result).toBe(6);
    });

    it('should multiply two numbers correctly', () => {
      const result = calculator.multiply(3, 4);
      expect(result).toBe(12);
    });

    it('should divide two numbers correctly', () => {
      const result = calculator.divide(10, 2);
      expect(result).toBe(5);
    });

    it('should throw error when dividing by zero', () => {
      expect(() => {
        calculator.divide(10, 0);
      }).toThrow('Division by zero is not allowed');
    });
  });

  describe('Advanced Operations', () => {
    it('should calculate power correctly', () => {
      const result = calculator.power(2, 3);
      expect(result).toBe(8);
    });

    it('should calculate square root correctly', () => {
      const result = calculator.squareRoot(16);
      expect(result).toBe(4);
    });

    it('should throw error for negative square root', () => {
      expect(() => {
        calculator.squareRoot(-1);
      }).toThrow('Cannot calculate square root of negative number');
    });
  });

  describe('Chain Operations', () => {
    it('should chain operations correctly', () => {
      const result = calculator
        .add(5)
        .multiply(2)
        .subtract(3)
        .getResult();
      
      expect(result).toBe(7);
    });
  });
});

// Example usage in tests
describe('Real-world Examples', () => {
  it('should demonstrate e-commerce checkout flow', async () => {
    const checkout = new ECommerceCheckout();
    
    // Add items to cart
    checkout.addItem({ id: 1, name: 'Laptop', price: 999.99 });
    checkout.addItem({ id: 2, name: 'Mouse', price: 29.99 });
    
    // Apply discount
    checkout.applyDiscount(0.1); // 10% discount
    
    // Calculate total
    const total = await checkout.calculateTotal();
    
    expect(total).toBe(926.98); // (999.99 + 29.99) * 0.9
  });
});
```

### 2. Interactive Examples

**REPL-style Examples:**
```typescript
// interactive-example.ts
/**
 * Interactive Calculator Example
 * 
 * This example demonstrates how to create an interactive
 * command-line calculator.
 */

import * as readline from 'readline';

class InteractiveCalculator {
  private currentValue: number = 0;
  private history: string[] = [];

  constructor() {
    this.setupInterface();
  }

  private setupInterface() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: `Calculator [${this.currentValue}]> `
    });

    console.log('🧮 Interactive Calculator');
    console.log('Commands: add, subtract, multiply, divide, clear, history, quit');
    console.log('Example: add 5');
    console.log('');

    rl.prompt();

    rl.on('line', (input) => {
      this.handleCommand(input.trim(), rl);
    }).on('close', () => {
      console.log('\n👋 Goodbye!');
      process.exit(0);
    });
  }

  private handleCommand(input: string, rl: readline.Interface) {
    const [command, ...args] = input.split(' ');
    
    try {
      switch (command.toLowerCase()) {
        case 'add':
          this.add(Number(args[0]));
          break;
        case 'subtract':
          this.subtract(Number(args[0]));
          break;
        case 'multiply':
          this.multiply(Number(args[0]));
          break;
        case 'divide':
          this.divide(Number(args[0]));
          break;
        case 'power':
          this.power(Number(args[0]));
          break;
        case 'sqrt':
          this.squareRoot();
          break;
        case 'clear':
          this.clear();
          break;
        case 'history':
          this.showHistory();
          break;
        case 'quit':
        case 'exit':
          rl.close();
          return;
        default:
          console.log('❌ Unknown command. Try: add, subtract, multiply, divide, clear, history, quit');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    rl.setPrompt(`Calculator [${this.currentValue}]> `);
    rl.prompt();
  }

  private add(value: number): void {
    const previous = this.currentValue;
    this.currentValue += value;
    this.addToHistory(`${previous} + ${value} = ${this.currentValue}`);
    console.log(`✅ Result: ${this.currentValue}`);
  }

  private subtract(value: number): void {
    const previous = this.currentValue;
    this.currentValue -= value;
    this.addToHistory(`${previous} - ${value} = ${this.currentValue}`);
    console.log(`✅ Result: ${this.currentValue}`);
  }

  private multiply(value: number): void {
    const previous = this.currentValue;
    this.currentValue *= value;
    this.addToHistory(`${previous} × ${value} = ${this.currentValue}`);
    console.log(`✅ Result: ${this.currentValue}`);
  }

  private divide(value: number): void {
    if (value === 0) {
      throw new Error('Cannot divide by zero');
    }
    
    const previous = this.currentValue;
    this.currentValue /= value;
    this.addToHistory(`${previous} ÷ ${value} = ${this.currentValue}`);
    console.log(`✅ Result: ${this.currentValue}`);
  }

  private power(exponent: number): void {
    const previous = this.currentValue;
    this.currentValue = Math.pow(this.currentValue, exponent);
    this.addToHistory(`${previous} ^ ${exponent} = ${this.currentValue}`);
    console.log(`✅ Result: ${this.currentValue}`);
  }

  private squareRoot(): void {
    if (this.currentValue < 0) {
      throw new Error('Cannot calculate square root of negative number');
    }
    
    const previous = this.currentValue;
    this.currentValue = Math.sqrt(this.currentValue);
    this.addToHistory(`√${previous} = ${this.currentValue}`);
    console.log(`✅ Result: ${this.currentValue}`);
  }

  private clear(): void {
    this.currentValue = 0;
    this.history = [];
    console.log('🧹 Calculator cleared');
  }

  private showHistory(): void {
    if (this.history.length === 0) {
      console.log('📝 No history available');
      return;
    }
    
    console.log('📝 Calculation History:');
    this.history.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry}`);
    });
  }

  private addToHistory(entry: string): void {
    this.history.push(entry);
  }
}

// Run the interactive example
if (require.main === module) {
  new InteractiveCalculator();
}

export { InteractiveCalculator };
```

## Example Performance Considerations

### 1. Performance Examples

**Optimization Demonstrations:**
```typescript
// performance-examples.ts
/**
 * Performance Optimization Examples
 * 
 * Demonstrates various performance optimization techniques.
 */

class PerformanceExamples {
  // Example 1: Array Operations
  demonstrateArrayOperations() {
    console.time('Array operations');
    
    // Inefficient: Multiple iterations
    const numbers = Array.from({ length: 100000 }, (_, i) => i);
    
    // Method 1: Multiple passes (inefficient)
    const evens1 = numbers.filter(n => n % 2 === 0);
    const squares1 = evens1.map(n => n * n);
    const sum1 = squares1.reduce((acc, n) => acc + n, 0);
    
    console.timeEnd('Array operations');
    
    // Method 2: Single pass (efficient)
    console.time('Optimized array operations');
    const sum2 = numbers.reduce((acc, n) => {
      if (n % 2 === 0) {
        return acc + (n * n);
      }
      return acc;
    }, 0);
    console.timeEnd('Optimized array operations');
    
    console.log(`Results match: ${sum1 === sum2}`);
  }

  // Example 2: Object Creation
  demonstrateObjectCreation() {
    console.time('Object creation');
    
    // Inefficient: Creating objects in loops
    const users1 = [];
    for (let i = 0; i < 10000; i++) {
      users1.push({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        createdAt: new Date(),
        isActive: true
      });
    }
    
    console.timeEnd('Object creation');
    
    // Efficient: Using object pools or factories
    console.time('Optimized object creation');
    
    const userFactory = (id: number) => ({
      id,
      name: `User ${id}`,
      email: `user${id}@example.com`,
      createdAt: new Date(),
      isActive: true
    });
    
    const users2 = Array.from({ length: 10000 }, (_, i) => userFactory(i));
    
    console.timeEnd('Optimized object creation');
    
    console.log(`Arrays have same length: ${users1.length === users2.length}`);
  }

  // Example 3: String Operations
  demonstrateStringOperations() {
    console.time('String operations');
    
    // Inefficient: String concatenation in loops
    let result1 = '';
    for (let i = 0; i < 10000; i++) {
      result1 += `Item ${i}, `;
    }
    
    console.timeEnd('String operations');
    
    // Efficient: Using arrays and join
    console.time('Optimized string operations');
    const items = Array.from({ length: 10000 }, (_, i) => `Item ${i}`);
    const result2 = items.join(', ');
    
    console.timeEnd('Optimized string operations');
    
    console.log(`Results match: ${result1.trim() === result2}`);
  }

  // Example 4: Memory Management
  demonstrateMemoryManagement() {
    console.time('Memory management');
    
    // Inefficient: Creating closures that hold references
    const createHandlers = () => {
      const data = new Array(1000000).fill(0);
      return () => {
        console.log('Handler called');
        // data is kept in memory even though not used
      };
    };
    
    const handlers1 = Array.from({ length: 100 }, () => createHandlers());
    
    console.timeEnd('Memory management');
    
    // Efficient: Minimize closure scope
    console.time('Optimized memory management');
    
    const createOptimizedHandlers = () => {
      return () => {
        console.log('Optimized handler called');
      };
    };
    
    const handlers2 = Array.from({ length: 100 }, () => createOptimizedHandlers());
    
    console.timeEnd('Optimized memory management');
    
    console.log(`Both arrays have same length: ${handlers1.length === handlers2.length}`);
  }

  // Example 5: Async Operations
  demonstrateAsyncOperations() {
    console.time('Async operations');
    
    // Inefficient: Sequential async operations
    async function sequentialOperations() {
      const results = [];
      for (let i = 0; i < 10; i++) {
        const result = await this.simulateAsyncOperation(i);
        results.push(result);
      }
      return results;
    }
    
    sequentialOperations().then(() => {
      console.timeEnd('Async operations');
      
      // Efficient: Parallel async operations
      console.time('Optimized async operations');
      
      async function parallelOperations() {
        const promises = Array.from({ length: 10 }, (_, i) => 
          this.simulateAsyncOperation(i)
        );
        return Promise.all(promises);
      }
      
      parallelOperations().then(() => {
        console.timeEnd('Optimized async operations');
      });
    });
  }

  private async simulateAsyncOperation(value: number): Promise<number> {
    return new Promise(resolve => {
      setTimeout(() => resolve(value * 2), 100);
    });
  }

  // Run all performance examples
  runAllExamples() {
    console.log('🚀 Running Performance Examples...\n');
    
    this.demonstrateArrayOperations();
    console.log('');
    
    this.demonstrateObjectCreation();
    console.log('');
    
    this.demonstrateStringOperations();
    console.log('');
    
    this.demonstrateMemoryManagement();
    console.log('');
    
    this.demonstrateAsyncOperations();
  }
}

// Usage
const examples = new PerformanceExamples();
examples.runAllExamples();
```

### 2. Benchmarking Examples

**Performance Benchmarking:**
```typescript
// benchmarking-examples.ts
/**
 * Performance Benchmarking Examples
 * 
 * Demonstrates how to benchmark different approaches.
 */

class BenchmarkSuite {
  private results: BenchmarkResult[] = [];

  async runBenchmark(
    name: string,
    testFunction: () => any | Promise<any>,
    iterations: number = 1000
  ): Promise<BenchmarkResult> {
    console.log(`⏱️  Running benchmark: ${name}`);
    
    // Warm up
    for (let i = 0; i < 10; i++) {
      await testFunction();
    }
    
    // Actual benchmark
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await testFunction();
      const end = performance.now();
      times.push(end - start);
    }
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    const result: BenchmarkResult = {
      name,
      iterations,
      avgTime,
      minTime,
      maxTime,
      times
    };
    
    this.results.push(result);
    
    console.log(`   Average: ${avgTime.toFixed(2)}ms`);
    console.log(`   Min: ${minTime.toFixed(2)}ms`);
    console.log(`   Max: ${maxTime.toFixed(2)}ms\n`);
    
    return result;
  }

  compareResults() {
    if (this.results.length < 2) {
      console.log('Need at least 2 results to compare');
      return;
    }
    
    console.log('📊 Benchmark Comparison:');
    console.log('='.repeat(50));
    
    // Sort by average time
    const sorted = this.results.sort((a, b) => a.avgTime - b.avgTime);
    
    sorted.forEach((result, index) => {
      const relative = index === 0 ? ' (fastest)' : 
                       ` (${((result.avgTime / sorted[0].avgTime).toFixed(2)}x slower)`;
      
      console.log(`${index + 1}. ${result.name}: ${result.avgTime.toFixed(2)}ms${relative}`);
    });
    
    console.log('='.repeat(50));
  }

  clearResults() {
    this.results = [];
  }
}

interface BenchmarkResult {
  name: string;
  iterations: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  times: number[];
}

// Example benchmarks
class AlgorithmBenchmarks {
  private benchmark = new BenchmarkSuite();

  async runStringSearchBenchmarks() {
    const text = 'Hello World! This is a test string for searching algorithms.'.repeat(1000);
    const pattern = 'test';
    
    // Benchmark 1: indexOf
    await this.benchmark.runBenchmark('String.indexOf', () => {
      return text.indexOf(pattern);
    }, 10000);
    
    // Benchmark 2: includes
    await this.benchmark.runBenchmark('String.includes', () => {
      return text.includes(pattern);
    }, 10000);
    
    // Benchmark 3: RegExp
    await this.benchmark.runBenchmark('RegExp.test', () => {
      const regex = new RegExp(pattern);
      return regex.test(text);
    }, 10000);
    
    this.benchmark.compareResults();
  }

  async runArrayOperationBenchmarks() {
    const array = Array.from({ length: 10000 }, (_, i) => i);
    
    // Benchmark 1: for loop
    await this.benchmark.runBenchmark('For Loop', () => {
      let sum = 0;
      for (let i = 0; i < array.length; i++) {
        sum += array[i];
      }
      return sum;
    }, 1000);
    
    // Benchmark 2: forEach
    await this.benchmark.runBenchmark('Array.forEach', () => {
      let sum = 0;
      array.forEach(item => sum += item);
      return sum;
    }, 1000);
    
    // Benchmark 3: reduce
    await this.benchmark.runBenchmark('Array.reduce', () => {
      return array.reduce((sum, item) => sum + item, 0);
    }, 1000);
    
    this.benchmark.compareResults();
  }

  async runObjectCreationBenchmarks() {
    // Benchmark 1: Object literal
    await this.benchmark.runBenchmark('Object Literal', () => {
      return {
        id: Math.random(),
        name: 'Test',
        value: Math.random()
      };
    }, 10000);
    
    // Benchmark 2: Constructor
    class TestObject {
      constructor(
        public id: number,
        public name: string,
        public value: number
      ) {}
    }
    
    await this.benchmark.runBenchmark('Constructor', () => {
      return new TestObject(Math.random(), 'Test', Math.random());
    }, 10000);
    
    // Benchmark 3: Object.create
    const prototype = {
      greet() { return `Hello ${this.name}`; }
    };
    
    await this.benchmark.runBenchmark('Object.create', () => {
      return Object.create(prototype, {
        id: { value: Math.random() },
        name: { value: 'Test' },
        value: { value: Math.random() }
      });
    }, 10000);
    
    this.benchmark.compareResults();
  }

  async runAllBenchmarks() {
    console.log('🚀 Running Algorithm Benchmarks...\n');
    
    await this.runStringSearchBenchmarks();
    console.log('');
    
    await this.runArrayOperationBenchmarks();
    console.log('');
    
    await this.runObjectCreationBenchmarks();
  }
}

// Usage
const benchmarks = new AlgorithmBenchmarks();
benchmarks.runAllBenchmarks().catch(console.error);
```

## Summary

Effective code examples should:

- **Be well-organized** - Categorized by complexity and use case
- **Include comprehensive documentation** - Clear explanations and comments
- **Demonstrate best practices** - Show correct patterns and conventions
- **Handle errors properly** - Include error handling and edge cases
- **Be testable** - Include tests and validation
- **Show performance considerations** - Demonstrate optimization techniques
- **Be interactive when possible** - Allow hands-on learning
- **Cover real-world scenarios** - Show practical applications

Key components:
- **Basic examples** for getting started
- **Advanced examples** for complex scenarios
- **Integration examples** for framework usage
- **Real-world examples** for complete applications
- **Performance examples** for optimization
- **Benchmarking examples** for comparison
- **Error handling examples** for robustness
- **Interactive examples** for engagement

Well-crafted examples accelerate learning, reduce support burden, and improve code quality across your project.