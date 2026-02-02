# JSDoc and TypeScript Documentation

## Overview

JSDoc and TypeScript documentation provide comprehensive ways to document code, enabling better IDE support, automatic documentation generation, and improved code maintainability. This document covers best practices for using JSDoc comments and TypeScript's built-in documentation features.

## JSDoc Basics

### JSDoc Comment Structure

JSDoc comments start with `/**` and end with `*/`. They should be placed immediately before the code they document:

```typescript
/**
 * Description of the function or class
 * 
 * @tag {type} parameterName - Description of parameter
 * @returns {type} Description of return value
 */
```

### Essential JSDoc Tags

#### 1. @param

Documents function parameters:

```typescript
/**
 * Calculates the area of a rectangle
 * @param {number} width - The width of the rectangle
 * @param {number} height - The height of the rectangle
 * @returns {number} The area of the rectangle
 */
function calculateArea(width: number, height: number): number {
  return width * height;
}
```

#### 2. @returns / @return

Documents return values:

```typescript
/**
 * Checks if a number is prime
 * @param {number} n - The number to check
 * @returns {boolean} True if the number is prime, false otherwise
 */
function isPrime(n: number): boolean {
  if (n <= 1) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}
```

#### 3. @throws

Documents exceptions that a function might throw:

```typescript
/**
 * Divides two numbers
 * @param {number} dividend - The number to be divided
 * @param {number} divisor - The number to divide by
 * @returns {number} The result of the division
 * @throws {Error} When divisor is zero
 */
function divide(dividend: number, divisor: number): number {
  if (divisor === 0) {
    throw new Error('Division by zero is not allowed');
  }
  return dividend / divisor;
}
```

## Advanced JSDoc Tags

### 1. @example

Provides usage examples:

```typescript
/**
 * Formats a date string
 * @param {Date} date - The date to format
 * @param {string} [format='YYYY-MM-DD'] - The format string
 * @returns {string} The formatted date
 * @example
 * formatDate(new Date('2023-01-15'))
 * // Returns: "2023-01-15"
 * 
 * formatDate(new Date('2023-01-15'), 'MM/DD/YYYY')
 * // Returns: "01/15/2023"
 */
function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  // Implementation here
  return '';
}
```

### 2. @deprecated

Marks deprecated functions or methods:

```typescript
/**
 * @deprecated Use calculateTotalWithTax instead
 * @param {number} amount - The amount
 * @returns {number} The amount with tax
 */
function calculateTotal(amount: number): number {
  return amount * 1.08;
}

/**
 * Calculates the total amount including tax
 * @param {number} amount - The base amount
 * @param {number} [taxRate=0.08] - The tax rate
 * @returns {number} The total amount with tax
 */
function calculateTotalWithTax(amount: number, taxRate: number = 0.08): number {
  return amount * (1 + taxRate);
}
```

### 3. @since

Documents when a feature was introduced:

```typescript
/**
 * Validates email addresses
 * @since 1.2.0
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateEmail(email: string): boolean {
  // Implementation here
  return true;
}
```

### 4. @author

Documents the author of the code:

```typescript
/**
 * Utility functions for string manipulation
 * @author John Doe <john@example.com>
 * @version 1.0.0
 */
class StringUtils {
  // Class implementation
}
```

## TypeScript-Specific Documentation

### 1. Type Annotations

TypeScript's type system provides excellent documentation:

```typescript
/**
 * Represents a user in the system
 */
interface User {
  /** The unique identifier for the user */
  id: string;
  
  /** The user's full name */
  name: string;
  
  /** The user's email address */
  email: string;
  
  /** The user's role in the system */
  role: 'admin' | 'user' | 'guest';
  
  /** The date the user was created */
  createdAt: Date;
}

/**
 * Manages user operations
 */
class UserManager {
  /**
   * Creates a new user
   * @param userData - The user data to create
   * @returns The created user with an ID
   */
  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    return {
      ...userData,
      id: generateId(),
      createdAt: new Date()
    };
  }
  
  /**
   * Finds a user by ID
   * @param id - The user ID to search for
   * @returns The user if found, null otherwise
   */
  findById(id: string): User | null {
    // Implementation here
    return null;
  }
}
```

### 2. Generic Type Documentation

Document generic types clearly:

```typescript
/**
 * A generic cache implementation
 * @template T - The type of data being cached
 */
class Cache<T> {
  private storage: Map<string, T> = new Map();
  private timestamps: Map<string, number> = new Map();
  
  /**
   * Stores data in the cache
   * @param key - The cache key
   * @param value - The data to store
   * @param ttl - Time to live in milliseconds
   */
  set(key: string, value: T, ttl: number): void {
    this.storage.set(key, value);
    this.timestamps.set(key, Date.now() + ttl);
  }
  
  /**
   * Retrieves data from the cache
   * @param key - The cache key
   * @returns The cached data or undefined if not found or expired
   */
  get(key: string): T | undefined {
    const timestamp = this.timestamps.get(key);
    if (!timestamp || Date.now() > timestamp) {
      this.delete(key);
      return undefined;
    }
    return this.storage.get(key);
  }
  
  /**
   * Removes data from the cache
   * @param key - The cache key
   */
  delete(key: string): void {
    this.storage.delete(key);
    this.timestamps.delete(key);
  }
}
```

### 3. Union and Intersection Types

Document complex type combinations:

```typescript
/**
 * Represents different types of API responses
 */
type ApiResponse<T> = 
  | { success: true; data: T; timestamp: Date }
  | { success: false; error: string; code: number };

/**
 * API client for making HTTP requests
 */
class ApiClient {
  /**
   * Makes a GET request to the specified endpoint
   * @template T - The expected response data type
   * @param endpoint - The API endpoint
   * @param options - Request options
   * @returns A promise that resolves to the API response
   */
  async get<T>(
    endpoint: string, 
    options?: { timeout?: number; headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        signal: options?.timeout ? AbortSignal.timeout(options.timeout) : undefined,
        headers: options?.headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 500
      };
    }
  }
}
```

## Documentation Best Practices

### 1. Consistent Formatting

Use consistent formatting for all JSDoc comments:

```typescript
/**
 * Calculates compound interest
 * 
 * @description This function uses the compound interest formula:
 * A = P(1 + r/n)^(nt)
 * 
 * @param {number} principal - The initial investment amount
 * @param {number} rate - Annual interest rate (as decimal)
 * @param {number} time - Time period in years
 * @param {number} [compoundsPerYear=12] - Compounding frequency per year
 * 
 * @returns {number} The final amount after compound interest
 * 
 * @example
 * ```typescript
 * const result = calculateCompoundInterest(1000, 0.05, 10, 12);
 * console.log(result); // 1647.01
 * ```
 * 
 * @throws {Error} When principal is negative
 * @throws {Error} When rate is negative
 * @throws {Error} When time is negative
 * 
 * @since 1.0.0
 * @author Jane Smith <jane@example.com>
 */
function calculateCompoundInterest(
  principal: number,
  rate: number,
  time: number,
  compoundsPerYear: number = 12
): number {
  if (principal < 0) {
    throw new Error('Principal cannot be negative');
  }
  if (rate < 0) {
    throw new Error('Interest rate cannot be negative');
  }
  if (time < 0) {
    throw new Error('Time cannot be negative');
  }
  
  return principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * time);
}
```

### 2. Document Complex Logic

Explain complex algorithms and business logic:

```typescript
/**
 * Implements the Dijkstra's shortest path algorithm
 * 
 * @description This algorithm finds the shortest path between two nodes
 * in a weighted graph using a priority queue for optimal performance.
 * 
 * Time Complexity: O((V + E) log V) where V is vertices and E is edges
 * Space Complexity: O(V) for the distance and previous node arrays
 * 
 * @param {Map<string, Array<{node: string, weight: number}>>} graph - The weighted graph
 * @param {string} start - Starting node
 * @param {string} end - Target node
 * @returns {Array<string> | null} Shortest path as array of nodes, or null if no path exists
 * 
 * @example
 * ```typescript
 * const graph = new Map([
 *   ['A', [{node: 'B', weight: 4}, {node: 'C', weight: 2}]],
 *   ['B', [{node: 'C', weight: 1}, {node: 'D', weight: 5}]],
 *   ['C', [{node: 'D', weight: 8}]],
 *   ['D', []]
 * ]);
 * 
 * const path = dijkstra(graph, 'A', 'D');
 * console.log(path); // ['A', 'C', 'B', 'D']
 * ```
 */
function dijkstra(
  graph: Map<string, Array<{node: string, weight: number}>>,
  start: string,
  end: string
): string[] | null {
  // Implementation of Dijkstra's algorithm
  // ... (algorithm implementation)
  
  return null; // Placeholder
}
```

### 3. Document Configuration Options

For configuration objects and options:

```typescript
/**
 * Configuration options for the application
 */
interface AppConfig {
  /** Database connection settings */
  database: {
    /** Database host */
    host: string;
    /** Database port */
    port: number;
    /** Database name */
    name: string;
    /** Connection timeout in milliseconds */
    timeout: number;
  };
  
  /** Server settings */
  server: {
    /** Port to listen on */
    port: number;
    /** Host to bind to */
    host: string;
    /** Maximum request size in bytes */
    maxRequestSize: number;
  };
  
  /** Security settings */
  security: {
    /** JWT secret key */
    jwtSecret: string;
    /** Session timeout in milliseconds */
    sessionTimeout: number;
    /** Allowed CORS origins */
    corsOrigins: string[];
  };
}

/**
 * Initializes the application with the provided configuration
 * @param config - Application configuration
 * @returns Promise that resolves when initialization is complete
 */
async function initializeApp(config: AppConfig): Promise<void> {
  // Implementation here
}
```

## IDE Integration

### 1. IntelliSense Support

Well-documented code provides excellent IntelliSense support:

```typescript
/**
 * Validates and processes user input
 * @param input - The user input to validate
 * @param options - Validation options
 * @param options.maxLength - Maximum allowed length
 * @param options.required - Whether the input is required
 * @param options.pattern - Regex pattern to match against
 * @returns Validation result
 */
function validateInput(
  input: string, 
  options: {
    maxLength?: number;
    required?: boolean;
    pattern?: RegExp;
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (options.required && !input) {
    errors.push('Input is required');
  }
  
  if (options.maxLength && input.length > options.maxLength) {
    errors.push(`Input cannot exceed ${options.maxLength} characters`);
  }
  
  if (options.pattern && !options.pattern.test(input)) {
    errors.push('Input does not match required pattern');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### 2. Type Checking

TypeScript's type checking works seamlessly with JSDoc:

```typescript
/**
 * Creates a deep copy of an object
 * @template T - The type of the object to clone
 * @param obj - The object to clone
 * @returns A deep copy of the object
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

// Usage with full type safety
const original = { a: 1, b: { c: 2 } };
const copy = deepClone(original);
// TypeScript knows that 'copy' has the same type as 'original'
```

## Documentation Generation

### 1. Using TypeDoc

TypeDoc can generate HTML documentation from TypeScript code:

```typescript
/**
 * @packageDocumentation
 * @module Core
 * @preferred
 * 
 * Core utilities and interfaces for the application
 */

/**
 * Represents a point in 2D space
 */
export interface Point {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
}

/**
 * Mathematical utility functions
 */
export class MathUtils {
  /**
   * Calculates the distance between two points
   * @param p1 First point
   * @param p2 Second point
   * @returns The distance between the points
   */
  static distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }
  
  /**
   * Clamps a value between a minimum and maximum
   * @param value The value to clamp
   * @param min The minimum value
   * @param max The maximum value
   * @returns The clamped value
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
```

### 2. Generating Documentation

Create a `typedoc.json` configuration file:

```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/",
  "name": "My Application",
  "readme": "README.md",
  "excludePrivate": true,
  "excludeProtected": true,
  "includeVersion": true,
  "theme": "default"
}
```

Run TypeDoc to generate documentation:

```bash
npx typedoc
```

## Common Patterns

### 1. Event Documentation

```typescript
/**
 * Event emitted when a user logs in
 */
export interface UserLoginEvent {
  /** The user who logged in */
  user: User;
  /** The timestamp of the login */
  timestamp: Date;
  /** The IP address of the login */
  ipAddress: string;
}

/**
 * Event emitter for application events
 */
export class EventEmitter {
  /**
   * Emits an event to all listeners
   * @param eventName - The name of the event
   * @param data - The event data
   */
  emit<T>(eventName: string, data: T): void {
    // Implementation here
  }
  
  /**
   * Subscribes to an event
   * @param eventName - The name of the event
   * @param callback - The callback function
   * @returns A function to unsubscribe
   */
  on<T>(eventName: string, callback: (data: T) => void): () => void {
    // Implementation here
    return () => {};
  }
}
```

### 2. Error Documentation

```typescript
/**
 * Custom error for validation failures
 */
export class ValidationError extends Error {
  /** The field that failed validation */
  public readonly field: string;
  /** The invalid value */
  public readonly value: any;
  /** The validation rule that failed */
  public readonly rule: string;
  
  /**
   * Creates a new validation error
   * @param field - The field name
   * @param value - The invalid value
   * @param rule - The validation rule
   * @param message - The error message
   */
  constructor(field: string, value: any, rule: string, message: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.rule = rule;
  }
}

/**
 * Validates user data
 * @param userData - The user data to validate
 * @throws {ValidationError} When validation fails
 */
function validateUserData(userData: Partial<User>): void {
  if (!userData.email) {
    throw new ValidationError('email', userData.email, 'required', 'Email is required');
  }
  
  if (!userData.name || userData.name.length < 2) {
    throw new ValidationError('name', userData.name, 'minLength', 'Name must be at least 2 characters');
  }
}
```

## Summary

Effective JSDoc and TypeScript documentation:

- **Improves code readability** and maintainability
- **Enables better IDE support** with IntelliSense
- **Facilitates automatic documentation generation**
- **Helps with type safety** and error prevention
- **Makes code more self-documenting**

Key practices:
- Use consistent formatting and structure
- Document all public APIs thoroughly
- Include examples for complex functions
- Use TypeScript's type system effectively
- Keep documentation up to date with code changes
- Generate and maintain external documentation

Well-documented code is easier to understand, maintain, and use, making it an essential part of clean code practices.