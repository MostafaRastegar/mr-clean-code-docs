---
paths:
  - "src/**/*.js"
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "**/*.js"
  - "**/*.ts"
  - "**/*.tsx"
---

# Documentation

This section covers comprehensive documentation practices for JavaScript and TypeScript projects, ensuring code is well-documented, maintainable, and accessible to developers.

## Documentation Categories

### 1. Code Comments
Internal documentation within the code itself, explaining logic, intent, and complex operations.

### 2. JSDoc and TypeScript Documentation
Structured documentation that provides type information, parameter descriptions, and usage examples.

### 3. API Documentation
Comprehensive documentation for public APIs, including endpoints, parameters, responses, and examples.

### 4. README Files
Project-level documentation that provides an overview, installation instructions, and usage examples.

### 5. Code Examples
Practical examples demonstrating how to use code, APIs, or frameworks in real-world scenarios.

## Code Comments

### ✅ Good Examples
```javascript
// Use comments to explain "why", not "what"
function calculateTotalPrice(subtotal, taxRate) {
  // Apply tax rate to subtotal for total calculation
  // Tax rate is decimal (e.g., 0.08 for 8%)
  return subtotal + (subtotal * taxRate);
}

// Complex business logic explanation
function processOrder(order) {
  // Validate order items before processing
  // This prevents processing invalid orders that could cause downstream issues
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must contain items');
  }

  // Calculate total with discount logic
  // Apply 10% discount for orders over $100
  const subtotal = order.items.reduce((sum, item) => sum + item.price, 0);
  const discount = subtotal > 100 ? subtotal * 0.1 : 0;
  
  return {
    subtotal,
    discount,
    total: subtotal - discount
  };
}

// TODO and FIXME comments
function legacyFunction() {
  // TODO: Refactor this function to use modern async/await pattern
  // Currently uses callbacks which makes error handling complex
  
  // FIXME: This calculation has precision issues with floating point numbers
  // Need to implement decimal.js for accurate financial calculations
  return value * 0.1;
}
```

### ❌ Bad Examples
```javascript
// Obvious comments that don't add value
function calculateTotalPrice(subtotal, taxRate) {
  // Multiply subtotal by tax rate and add to subtotal
  return subtotal + (subtotal * taxRate);
}

// Outdated comments
function processOrder(order) {
  // This function processes orders (OUTDATED: now handles refunds too)
  return processRefund(order);
}

// Vague comments
function complexFunction() {
  // Do something important
  // Handle edge cases
  // Return result
}

// Commented-out code
function activeFunction() {
  // oldLogic();
  // deprecatedCode();
  // unusedVariable = 42;
  
  return newLogic();
}
```

## JSDoc and TypeScript Documentation

### ✅ Good Examples
```javascript
/**
 * Calculates the total price including tax for a given subtotal.
 * 
 * @param {number} subtotal - The base price before tax
 * @param {number} taxRate - The tax rate as a decimal (e.g., 0.08 for 8%)
 * @returns {number} The total price including tax
 * @throws {Error} If subtotal or taxRate is not a number
 * 
 * @example
 * const total = calculateTotalPrice(100, 0.08);
 * console.log(total); // 108
 */
function calculateTotalPrice(subtotal, taxRate) {
  if (typeof subtotal !== 'number' || typeof taxRate !== 'number') {
    throw new Error('Both parameters must be numbers');
  }
  return subtotal + (subtotal * taxRate);
}

/**
 * Represents a user in the system.
 * @typedef {Object} User
 * @property {string} id - Unique identifier for the user
 * @property {string} name - Full name of the user
 * @property {string} email - Email address of the user
 * @property {Date} createdAt - When the user was created
 */

/**
 * Creates a new user in the system.
 * @param {User} userData - User data to create
 * @returns {Promise<User>} The created user
 */
async function createUser(userData) {
  // Implementation
}
```

### ❌ Bad Examples
```javascript
// Missing or incomplete JSDoc
/**
 * Calculates total
 */
function calculateTotalPrice(subtotal, taxRate) {
  return subtotal + (subtotal * taxRate);
}

// Wrong parameter types
/**
 * @param {string} subtotal - The base price
 * @param {string} taxRate - The tax rate
 */
function calculateTotalPrice(subtotal, taxRate) {
  return subtotal + (subtotal * taxRate);
}

// Missing return type
/**
 * @param {number} subtotal
 * @param {number} taxRate
 */
function calculateTotalPrice(subtotal, taxRate) {
  return subtotal + (subtotal * taxRate);
}
```

## TypeScript Documentation

### ✅ Good Examples
```typescript
/**
 * User interface representing a system user
 */
interface User {
  /** Unique identifier for the user */
  id: string;
  
  /** Full name of the user */
  name: string;
  
  /** Email address - must be valid format */
  email: string;
  
  /** User's role in the system */
  role: 'admin' | 'user' | 'guest';
  
  /** When the user was created */
  createdAt: Date;
}

/**
 * Service for managing users
 */
class UserService {
  /**
   * Creates a new user
   * @param userData - User data to create
   * @returns Promise resolving to created user
   */
  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    // Implementation
  }

  /**
   * Gets a user by ID
   * @param id - User ID
   * @returns Promise resolving to user or null if not found
   */
  async getUserById(id: string): Promise<User | null> {
    // Implementation
  }
}

/**
 * Generic repository interface
 * @template T - Entity type
 * @template ID - ID type
 */
interface Repository<T, ID> {
  /** Create a new entity */
  create(entity: Omit<T, 'id'>): Promise<T>;
  
  /** Find entity by ID */
  findById(id: ID): Promise<T | null>;
  
  /** Update an entity */
  update(id: ID, updates: Partial<T>): Promise<T | null>;
  
  /** Delete an entity */
  delete(id: ID): Promise<boolean>;
}
```

### ❌ Bad Examples
```typescript
// No documentation
interface User {
  id: string;
  name: string;
  email: string;
}

class UserService {
  async createUser(userData: any): Promise<any> {
    // Implementation
  }
}

// Generic types without documentation
interface Repository<T, ID> {
  create(entity: T): Promise<T>;
  findById(id: ID): Promise<T>;
}
```

## API Documentation

### ✅ Good Examples
```javascript
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user in the system with validation
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user
 *                 example: "john@example.com"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "user_123"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   example: "john@example.com"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email is required"
 */
app.post('/api/users', (req, res) => {
  // Implementation
});
```

### ❌ Bad Examples
```javascript
// No API documentation
app.post('/api/users', (req, res) => {
  // Implementation
});

// Incomplete API documentation
/**
 * @swagger
 * /api/users:
 *   post:
 */
app.post('/api/users', (req, res) => {
  // Implementation
});
```

## README Files

### ✅ Good Examples
```markdown
# Project Name

A brief description of what this project does and who it's for.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

```bash
npm install
```

## Usage

```javascript
const myLibrary = require('my-library');

// Basic usage
const result = myLibrary.doSomething();
console.log(result);
```

## API Reference

### `doSomething(options)`

Description of what this function does.

**Parameters:**
- `options` (Object): Configuration options
  - `param1` (string): First parameter
  - `param2` (number): Second parameter

**Returns:** (string) Description of return value

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

### ❌ Bad Examples
```markdown
# Project

This is a project.

## Usage

Use it.

## API

It has functions.

## License

MIT
```

## Code Examples

### ✅ Good Examples
```javascript
/**
 * Example: Creating and using a user
 * 
 * @example
 * // Create a new user
 * const userData = {
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * };
 * 
 * const user = await createUser(userData);
 * console.log(user.id); // 'user_123'
 * 
 * // Update user information
 * const updatedUser = await updateUser(user.id, {
 *   name: 'Jane Doe'
 * });
 * console.log(updatedUser.name); // 'Jane Doe'
 */

/**
 * Example: Error handling
 * 
 * @example
 * try {
 *   const user = await getUserById('nonexistent');
 *   if (!user) {
 *     console.log('User not found');
 *   }
 * } catch (error) {
 *   console.error('Failed to get user:', error.message);
 * }
 */

/**
 * Example: Batch operations
 * 
 * @example
 * const users = [
 *   { name: 'Alice', email: 'alice@example.com' },
 *   { name: 'Bob', email: 'bob@example.com' }
 * ];
 * 
 * const createdUsers = await Promise.all(
 *   users.map(user => createUser(user))
 * );
 * 
 * console.log(`Created ${createdUsers.length} users`);
 */
```

### ❌ Bad Examples
```javascript
/**
 * Example usage
 * @example
 * const result = someFunction();
 */

/**
 * More examples
 * @example
 * // Do something
 * const x = 1;
 * // Do something else
 * const y = 2;
 */
```

## Best Practices

### Documentation Quality
- **Be concise but comprehensive** - Provide enough detail without being verbose
- **Keep documentation current** - Update docs when code changes
- **Use clear language** - Avoid jargon and technical complexity where possible
- **Include examples** - Show how to use the documented features
- **Explain the "why"** - Document reasoning behind complex decisions

### Documentation Maintenance
- **Review documentation regularly** - Ensure accuracy and completeness
- **Automate documentation generation** - Use tools like TypeDoc, JSDoc
- **Include documentation in code reviews** - Treat docs as part of the code
- **Use version control for docs** - Track changes and maintain history

## Tools and Resources

### Documentation Generation
- **TypeDoc** - Generate documentation from TypeScript code
- **JSDoc** - Generate documentation from JavaScript comments
- **OpenAPI/Swagger** - API documentation specification
- **Markdown** - Standard format for README and documentation files

### Documentation Hosting
- **GitHub Pages** - Free hosting for project documentation
- **GitBook** - Professional documentation platform
- **Notion** - Collaborative documentation workspace
- **Confluence** - Enterprise documentation solution

## Code Review Checklist

- [ ] Code comments explain "why" not "what"
- [ ] JSDoc/TypeScript documentation is complete and accurate
- [ ] API endpoints are documented with examples
- [ ] README files provide clear setup and usage instructions
- [ ] Code examples demonstrate real-world usage
- [ ] Documentation is kept up-to-date with code changes
- [ ] No outdated or misleading comments
- [ ] Complex logic is explained with clear comments
- [ ] TODO and FIXME comments are actionable
- [ ] Documentation follows project standards