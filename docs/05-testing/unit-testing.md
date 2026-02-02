# Unit Testing

## Overview

Unit testing is the practice of testing individual units of code in isolation to ensure they work correctly. This document covers best practices for writing effective unit tests in JavaScript and TypeScript applications.

## Core Principles

### 1. Test One Thing at a Time

Each unit test should focus on testing a single behavior or functionality.

**✅ Good Unit Test:**
```javascript
// Testing a single function behavior
describe('calculateTotal', () => {
  it('should calculate total with no discount', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 1 }
    ];
    
    const result = calculateTotal(items, 0);
    
    expect(result).toBe(25);
  });

  it('should apply discount correctly', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 1 }
    ];
    
    const result = calculateTotal(items, 10);
    
    expect(result).toBe(22.5); // 25 - 10% discount
  });

  it('should handle empty items array', () => {
    const result = calculateTotal([], 0);
    
    expect(result).toBe(0);
  });
});
```

**❌ Bad Unit Test:**
```javascript
// Testing multiple behaviors in one test
describe('calculateTotal', () => {
  it('should calculate total with various scenarios', () => {
    // Test no discount
    const items1 = [{ price: 10, quantity: 2 }];
    expect(calculateTotal(items1, 0)).toBe(20);
    
    // Test with discount
    const items2 = [{ price: 10, quantity: 2 }];
    expect(calculateTotal(items2, 10)).toBe(18);
    
    // Test empty array
    expect(calculateTotal([], 0)).toBe(0);
    
    // Test multiple items
    const items3 = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 1 }
    ];
    expect(calculateTotal(items3, 0)).toBe(25);
  });
});
```

### 2. Use Descriptive Test Names

Test names should clearly describe what is being tested and what the expected outcome is.

**✅ Descriptive Test Names:**
```javascript
describe('UserService', () => {
  describe('validateEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(userService.validateEmail('user@example.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(userService.validateEmail('invalid-email')).toBe(false);
    });

    it('should return false for empty email addresses', () => {
      expect(userService.validateEmail('')).toBe(false);
    });

    it('should return false for null email addresses', () => {
      expect(userService.validateEmail(null)).toBe(false);
    });
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const result = await userService.createUser(userData);
      
      expect(result).toEqual({
        id: expect.any(String),
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: expect.any(Date)
      });
    });

    it('should throw error for duplicate email', async () => {
      const userData = { name: 'John Doe', email: 'existing@example.com' };
      
      await expect(userService.createUser(userData))
        .rejects
        .toThrow('Email already exists');
    });
  });
});
```

**❌ Poor Test Names:**
```javascript
describe('UserService', () => {
  it('test1', () => {
    // What does this test?
  });

  it('should work', () => {
    // What should work?
  });

  it('test email validation', () => {
    // Too vague
  });
});
```

### 3. Follow AAA Pattern

Use the Arrange-Act-Assert pattern to structure your tests clearly.

**✅ AAA Pattern:**
```javascript
describe('ShoppingCart', () => {
  it('should add item to cart and update total', () => {
    // Arrange - Set up test data and dependencies
    const cart = new ShoppingCart();
    const item = {
      id: 'item1',
      name: 'Laptop',
      price: 999.99,
      quantity: 1
    };

    // Act - Execute the code being tested
    cart.addItem(item);
    const total = cart.getTotal();

    // Assert - Verify the expected outcome
    expect(cart.getItems()).toHaveLength(1);
    expect(cart.getItems()[0]).toEqual(item);
    expect(total).toBe(999.99);
  });

  it('should remove item from cart', () => {
    // Arrange
    const cart = new ShoppingCart();
    const item = { id: 'item1', name: 'Laptop', price: 999.99, quantity: 1 };
    cart.addItem(item);

    // Act
    cart.removeItem('item1');

    // Assert
    expect(cart.getItems()).toHaveLength(0);
    expect(cart.getTotal()).toBe(0);
  });
});
```

**❌ No AAA Pattern:**
```javascript
describe('ShoppingCart', () => {
  it('should handle items', () => {
    const cart = new ShoppingCart();
    expect(cart.getTotal()).toBe(0);
    
    const item = { id: 'item1', name: 'Laptop', price: 999.99, quantity: 1 };
    cart.addItem(item);
    
    expect(cart.getItems()).toHaveLength(1);
    expect(cart.getTotal()).toBe(999.99);
    
    cart.removeItem('item1');
    expect(cart.getItems()).toHaveLength(0);
  });
});
```

## TypeScript-Specific Considerations

### 1. Type-Safe Tests

Use TypeScript to ensure your tests are type-safe and catch errors at compile time.

**✅ Type-Safe Tests:**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

interface CreateUserRequest {
  name: string;
  email: string;
  age: number;
}

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  it('should create user with valid data', async () => {
    // Type-safe test data
    const userData: CreateUserRequest = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    };

    // Type-safe result
    const result: User = await userService.createUser(userData);

    expect(result).toEqual({
      id: expect.any(String),
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    });
  });

  it('should validate user data types', () => {
    // TypeScript will catch type errors at compile time
    const invalidData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 'thirty' // TypeScript will flag this as error
    };

    expect(() => userService.createUser(invalidData as CreateUserRequest))
      .toThrow('Invalid age');
  });

  it('should return typed user data', async () => {
    const user: User = await userService.getUser('user123');
    
    // TypeScript ensures we access valid properties
    expect(typeof user.id).toBe('string');
    expect(typeof user.name).toBe('string');
    expect(typeof user.email).toBe('string');
    expect(typeof user.age).toBe('number');
  });
});
```

**❌ Non-Type-Safe Tests:**
```typescript
// Generic tests without type safety
describe('UserService', () => {
  it('should create user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 'thirty' // No type checking
    };

    const result = await userService.createUser(userData);
    
    // No type safety for result
    expect(result.name).toBe('John Doe');
    expect(result.invalidProperty); // No error at compile time
  });
});
```

### 2. Generic Type Testing

Test generic functions and classes with different type parameters.

**✅ Generic Type Testing:**
```typescript
class Repository<T> {
  private items: T[] = [];

  async findById(id: string): Promise<T | null> {
    return this.items.find(item => 
      (item as any).id === id
    ) || null;
  }

  async save(item: T): Promise<T> {
    this.items.push(item);
    return item;
  }
}

describe('Repository', () => {
  let userRepository: Repository<User>;
  let productRepository: Repository<Product>;

  beforeEach(() => {
    userRepository = new Repository<User>();
    productRepository = new Repository<Product>();
  });

  it('should save and retrieve user', async () => {
    const user: User = {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    };

    await userRepository.save(user);
    const retrievedUser = await userRepository.findById('user1');

    expect(retrievedUser).toEqual(user);
    expect(retrievedUser?.name).toBe('John Doe'); // Type-safe access
  });

  it('should save and retrieve product', async () => {
    const product: Product = {
      id: 'prod1',
      name: 'Laptop',
      price: 999.99
    };

    await productRepository.save(product);
    const retrievedProduct = await productRepository.findById('prod1');

    expect(retrievedProduct).toEqual(product);
    expect(retrievedProduct?.price).toBe(999.99); // Type-safe access
  });
});
```

**❌ Generic Testing Without Types:**
```typescript
// Testing without proper type safety
describe('Repository', () => {
  it('should save and retrieve items', async () => {
    const repository = new Repository();
    
    const item = { id: '1', name: 'Test' };
    await repository.save(item);
    
    const retrieved = await repository.findById('1');
    
    // No type safety - could access non-existent properties
    expect(retrieved.name).toBe('Test');
    expect(retrieved.nonExistentProperty); // No compile-time error
  });
});
```

### 3. Interface Testing

Test that implementations conform to interfaces correctly.

**✅ Interface Testing:**
```typescript
interface PaymentProcessor {
  processPayment(amount: number, currency: string): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount: number): Promise<RefundResult>;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
}

class StripeProcessor implements PaymentProcessor {
  async processPayment(amount: number, currency: string): Promise<PaymentResult> {
    // Implementation
    return {
      success: true,
      transactionId: 'txn_' + Math.random().toString(36),
      amount,
      currency
    };
  }

  async refundPayment(transactionId: string, amount: number): Promise<RefundResult> {
    // Implementation
    return {
      success: true,
      transactionId,
      refundedAmount: amount,
      status: 'completed'
    };
  }
}

describe('StripeProcessor', () => {
  let processor: PaymentProcessor;

  beforeEach(() => {
    processor = new StripeProcessor();
  });

  it('should implement PaymentProcessor interface', () => {
    expect(processor).toBeInstanceOf(StripeProcessor);
    expect(typeof processor.processPayment).toBe('function');
    expect(typeof processor.refundPayment).toBe('function');
  });

  it('should process payment and return correct interface', async () => {
    const result = await processor.processPayment(100, 'USD');
    
    // Type-safe assertions
    expect(result.success).toBe(true);
    expect(typeof result.transactionId).toBe('string');
    expect(result.amount).toBe(100);
    expect(result.currency).toBe('USD');
  });

  it('should refund payment and return correct interface', async () => {
    const result = await processor.refundPayment('txn_123', 50);
    
    // Type-safe assertions
    expect(result.success).toBe(true);
    expect(result.transactionId).toBe('txn_123');
    expect(result.refundedAmount).toBe(50);
    expect(result.status).toBe('completed');
  });
});
```

**❌ Interface Testing Without Types:**
```typescript
// Testing without interface conformance
describe('StripeProcessor', () => {
  it('should process payment', async () => {
    const processor = new StripeProcessor();
    const result = await processor.processPayment(100, 'USD');
    
    // No interface validation
    expect(result.success).toBe(true);
    expect(result.transactionId).toBeDefined();
    // Could miss interface violations
  });
});
```

## Common Patterns

### 1. Test Setup and Teardown

Use proper setup and teardown to ensure test isolation.

**✅ Proper Setup and Teardown:**
```javascript
describe('DatabaseService', () => {
  let dbService;
  let testUser;

  // Setup before each test
  beforeEach(async () => {
    dbService = new DatabaseService();
    await dbService.connect();
    
    testUser = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com'
    };
  });

  // Cleanup after each test
  afterEach(async () => {
    await dbService.cleanup();
    await dbService.disconnect();
  });

  // Setup once before all tests
  beforeAll(async () => {
    await DatabaseService.initialize();
  });

  // Cleanup once after all tests
  afterAll(async () => {
    await DatabaseService.shutdown();
  });

  it('should create user', async () => {
    const result = await dbService.createUser(testUser);
    expect(result.id).toBeDefined();
    expect(result.name).toBe(testUser.name);
  });

  it('should find user by id', async () => {
    await dbService.createUser(testUser);
    const result = await dbService.findUserById(testUser.id);
    expect(result).toEqual(testUser);
  });
});
```

**❌ Poor Setup and Teardown:**
```javascript
describe('DatabaseService', () => {
  let dbService;

  // Creating service once for all tests
  beforeAll(() => {
    dbService = new DatabaseService();
  });

  it('should create user', async () => {
    // No proper setup - test data mixed with test logic
    const user = { id: 'test-user', name: 'Test User', email: 'test@example.com' };
    const result = await dbService.createUser(user);
    expect(result.id).toBeDefined();
  });

  it('should find user by id', async () => {
    // Depends on previous test creating the user
    const result = await dbService.findUserById('test-user');
    expect(result).toBeDefined();
  });
});
```

### 2. Test Data Management

Use factories or builders to create test data consistently.

**✅ Test Data Management:**
```javascript
// Test data factory
class TestDataFactory {
  static createUser(overrides = {}) {
    return {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Test User',
      email: 'test@example.com',
      age: 25,
      createdAt: new Date(),
      ...overrides
    };
  }

  static createProduct(overrides = {}) {
    return {
      id: `prod-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Test Product',
      price: 99.99,
      category: 'electronics',
      inStock: true,
      ...overrides
    };
  }

  static createOrder(overrides = {}) {
    return {
      id: `order-${Math.random().toString(36).substr(2, 9)}`,
      userId: `user-${Math.random().toString(36).substr(2, 9)}`,
      items: [],
      total: 0,
      status: 'pending',
      createdAt: new Date(),
      ...overrides
    };
  }
}

describe('UserService', () => {
  it('should create user with valid data', async () => {
    const userData = TestDataFactory.createUser({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    });

    const result = await userService.createUser(userData);
    
    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@example.com');
    expect(result.age).toBe(30);
  });

  it('should create user with minimal data', async () => {
    const userData = TestDataFactory.createUser();
    
    const result = await userService.createUser(userData);
    
    expect(result.id).toBeDefined();
    expect(result.name).toBe('Test User');
    expect(result.email).toBe('test@example.com');
  });
});
```

**❌ Poor Test Data Management:**
```javascript
describe('UserService', () => {
  it('should create user', async () => {
    // Inline test data - hard to maintain
    const userData = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await userService.createUser(userData);
    expect(result.name).toBe('John Doe');
  });

  it('should create another user', async () => {
    // Duplicate test data - inconsistent
    const userData = {
      id: 'user-456',
      name: 'Jane Doe',
      email: 'jane@example.com',
      age: 25,
      createdAt: new Date()
      // Missing updatedAt field
    };

    const result = await userService.createUser(userData);
    expect(result.name).toBe('Jane Doe');
  });
});
```

### 3. Edge Case Testing

Test boundary conditions and edge cases thoroughly.

**✅ Edge Case Testing:**
```javascript
describe('calculateDiscount', () => {
  it('should return 0 for negative amounts', () => {
    expect(calculateDiscount(-100, 10)).toBe(0);
  });

  it('should return 0 for zero amount', () => {
    expect(calculateDiscount(0, 10)).toBe(0);
  });

  it('should handle maximum discount (100%)', () => {
    expect(calculateDiscount(100, 100)).toBe(100);
  });

  it('should cap discount at 100%', () => {
    expect(calculateDiscount(100, 150)).toBe(100);
  });

  it('should handle very large numbers', () => {
    expect(calculateDiscount(999999999, 50)).toBe(499999999.5);
  });

  it('should handle decimal amounts', () => {
    expect(calculateDiscount(99.99, 10)).toBe(9.999);
  });

  it('should handle zero discount rate', () => {
    expect(calculateDiscount(100, 0)).toBe(0);
  });
});

describe('validateEmail', () => {
  it('should reject null email', () => {
    expect(validateEmail(null)).toBe(false);
  });

  it('should reject undefined email', () => {
    expect(validateEmail(undefined)).toBe(false);
  });

  it('should reject empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('should reject whitespace only', () => {
    expect(validateEmail('   ')).toBe(false);
  });

  it('should reject single character', () => {
    expect(validateEmail('a')).toBe(false);
  });

  it('should reject email without @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('should reject email without domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('should reject email without local part', () => {
    expect(validateEmail('@example.com')).toBe(false);
  });
});
```

**❌ Missing Edge Cases:**
```javascript
describe('calculateDiscount', () => {
  it('should calculate discount', () => {
    expect(calculateDiscount(100, 10)).toBe(10);
  });

  it('should calculate larger discount', () => {
    expect(calculateDiscount(200, 25)).toBe(50);
  });
  // Missing edge cases
});
```

### 4. Async Testing

Properly test asynchronous code with appropriate patterns.

**✅ Async Testing:**
```javascript
describe('AsyncService', () => {
  it('should handle successful async operation', async () => {
    const result = await asyncService.processData('test-data');
    
    expect(result.success).toBe(true);
    expect(result.data).toBe('processed-test-data');
  });

  it('should handle async operation timeout', async () => {
    await expect(asyncService.slowOperation())
      .rejects
      .toThrow('Operation timed out');
  });

  it('should handle concurrent operations', async () => {
    const promises = [
      asyncService.processData('data1'),
      asyncService.processData('data2'),
      asyncService.processData('data3')
    ];

    const results = await Promise.all(promises);
    
    expect(results).toHaveLength(3);
    expect(results[0].data).toBe('processed-data1');
    expect(results[1].data).toBe('processed-data2');
    expect(results[2].data).toBe('processed-data3');
  });

  it('should handle race conditions', async () => {
    const operation1 = asyncService.updateCounter(1);
    const operation2 = asyncService.updateCounter(2);
    
    await Promise.all([operation1, operation2]);
    
    const finalValue = await asyncService.getCounter();
    expect(finalValue).toBe(3); // 1 + 2
  });

  it('should handle async error with proper cleanup', async () => {
    const mockCleanup = jest.fn();
    
    asyncService.setCleanupFunction(mockCleanup);
    
    await expect(asyncService.failingOperation())
      .rejects
      .toThrow('Async operation failed');
    
    expect(mockCleanup).toHaveBeenCalled();
  });
});
```

**❌ Poor Async Testing:**
```javascript
describe('AsyncService', () => {
  it('should handle async operation', () => {
    // Missing async/await
    const result = asyncService.processData('test-data');
    expect(result.success).toBe(true); // This will fail
  });

  it('should handle multiple operations', async () => {
    const result1 = asyncService.processData('data1');
    const result2 = asyncService.processData('data2');
    
    // Not waiting for promises
    expect(result1.data).toBe('processed-data1'); // Will fail
    expect(result2.data).toBe('processed-data2'); // Will fail
  });
});
```

## Common Pitfalls and Solutions

### 1. Testing Implementation Details

**❌ Bad: Testing Implementation**
```javascript
describe('UserService', () => {
  it('should call database save method', () => {
    const mockDb = jest.fn();
    const userService = new UserService(mockDb);
    
    userService.createUser({ name: 'John' });
    
    // Testing implementation detail
    expect(mockDb.save).toHaveBeenCalledWith({ name: 'John' });
  });
});
```

**✅ Good: Testing Behavior**
```javascript
describe('UserService', () => {
  it('should create user and return user data', async () => {
    const mockDb = {
      save: jest.fn().mockResolvedValue({ id: '1', name: 'John' })
    };
    const userService = new UserService(mockDb);
    
    const result = await userService.createUser({ name: 'John' });
    
    // Testing behavior, not implementation
    expect(result).toEqual({ id: '1', name: 'John' });
  });
});
```

### 2. Over-Mocking

**❌ Bad: Over-Mocking**
```javascript
describe('OrderService', () => {
  it('should process order', async () => {
    const mockUserRepo = {
      findById: jest.fn().mockResolvedValue({ id: '1', name: 'John' })
    };
    const mockProductRepo = {
      findById: jest.fn().mockResolvedValue({ id: 'p1', price: 100 })
    };
    const mockInventory = {
      checkStock: jest.fn().mockResolvedValue(true)
    };
    const mockPayment = {
      process: jest.fn().mockResolvedValue({ success: true })
    };
    const mockEmail = {
      send: jest.fn().mockResolvedValue(true)
    };

    const orderService = new OrderService(mockUserRepo, mockProductRepo, mockInventory, mockPayment, mockEmail);
    
    const result = await orderService.processOrder({
      userId: '1',
      productId: 'p1',
      quantity: 2
    });

    expect(result.success).toBe(true);
    // Too many mocks - hard to maintain
  });
});
```

**✅ Good: Selective Mocking**
```javascript
describe('OrderService', () => {
  it('should process order successfully', async () => {
    const orderService = new OrderService();
    
    // Only mock external dependencies
    jest.spyOn(orderService.userRepository, 'findById')
      .mockResolvedValue({ id: '1', name: 'John' });
    
    jest.spyOn(orderService.productRepository, 'findById')
      .mockResolvedValue({ id: 'p1', price: 100 });
    
    const result = await orderService.processOrder({
      userId: '1',
      productId: 'p1',
      quantity: 2
    });

    expect(result.success).toBe(true);
    expect(result.total).toBe(200);
  });
});
```

### 3. Test Interdependence

**❌ Bad: Interdependent Tests**
```javascript
describe('ShoppingCart', () => {
  let cart;

  beforeEach(() => {
    cart = new ShoppingCart();
  });

  it('should add item', () => {
    cart.addItem({ id: '1', name: 'Laptop', price: 1000 });
    expect(cart.getItems()).toHaveLength(1);
  });

  it('should calculate total', () => {
    // Depends on previous test adding item
    expect(cart.getTotal()).toBe(1000);
  });

  it('should remove item', () => {
    // Depends on previous tests
    cart.removeItem('1');
    expect(cart.getItems()).toHaveLength(0);
  });
});
```

**✅ Good: Independent Tests**
```javascript
describe('ShoppingCart', () => {
  let cart;

  beforeEach(() => {
    cart = new ShoppingCart();
  });

  it('should add item', () => {
    cart.addItem({ id: '1', name: 'Laptop', price: 1000 });
    expect(cart.getItems()).toHaveLength(1);
    expect(cart.getItems()[0].name).toBe('Laptop');
  });

  it('should calculate total', () => {
    // Each test sets up its own state
    cart.addItem({ id: '1', name: 'Laptop', price: 1000 });
    cart.addItem({ id: '2', name: 'Mouse', price: 25 });
    
    expect(cart.getTotal()).toBe(1025);
  });

  it('should remove item', () => {
    // Each test is independent
    cart.addItem({ id: '1', name: 'Laptop', price: 1000 });
    cart.removeItem('1');
    
    expect(cart.getItems()).toHaveLength(0);
  });
});
```

### 4. Poor Error Testing

**❌ Bad: Poor Error Testing**
```javascript
describe('UserService', () => {
  it('should handle errors', async () => {
    const userService = new UserService();
    
    try {
      await userService.createUser(null);
      // Test will fail if no error is thrown
    } catch (error) {
      expect(error).toBeDefined(); // Too vague
    }
  });
});
```

**✅ Good: Proper Error Testing**
```javascript
describe('UserService', () => {
  it('should throw error for invalid user data', async () => {
    const userService = new UserService();
    
    await expect(userService.createUser(null))
      .rejects
      .toThrow('Invalid user data');
  });

  it('should throw specific error for duplicate email', async () => {
    const userService = new UserService();
    
    await expect(userService.createUser({ email: 'existing@example.com' }))
      .rejects
      .toThrow('Email already exists');
  });

  it('should handle database connection errors', async () => {
    const mockDb = {
      save: jest.fn().mockRejectedValue(new Error('Database connection failed'))
    };
    const userService = new UserService(mockDb);
    
    await expect(userService.createUser({ name: 'John' }))
      .rejects
      .toThrow('Database connection failed');
  });
});
```

## Best Practices Summary

1. **Test One Thing**: Each test should focus on a single behavior
2. **Use Descriptive Names**: Test names should clearly describe what's being tested
3. **Follow AAA Pattern**: Arrange, Act, Assert structure
4. **Keep Tests Independent**: Tests should not depend on each other
5. **Test Edge Cases**: Include boundary conditions and error cases
6. **Use Type Safety**: Leverage TypeScript for better test reliability
7. **Mock Selectively**: Only mock external dependencies, not internal logic
8. **Test Behavior, Not Implementation**: Focus on what the code does
9. **Use Proper Setup/Teardown**: Ensure test isolation
10. **Handle Async Code Properly**: Use async/await and proper error handling

## Examples in Context

### E-commerce Application
```javascript
describe('ShoppingCart', () => {
  let cart;
  let productRepository;

  beforeEach(() => {
    cart = new ShoppingCart();
    productRepository = new MockProductRepository();
  });

  describe('adding items', () => {
    it('should add new item to cart', () => {
      const item = TestDataFactory.createProduct({ id: 'laptop', price: 999.99 });
      
      cart.addItem(item, 1);
      
      expect(cart.getItems()).toHaveLength(1);
      expect(cart.getItems()[0].product).toEqual(item);
      expect(cart.getItems()[0].quantity).toBe(1);
    });

    it('should increase quantity for existing item', () => {
      const item = TestDataFactory.createProduct({ id: 'laptop', price: 999.99 });
      
      cart.addItem(item, 1);
      cart.addItem(item, 2);
      
      expect(cart.getItems()).toHaveLength(1);
      expect(cart.getItems()[0].quantity).toBe(3);
    });

    it('should not add item with zero quantity', () => {
      const item = TestDataFactory.createProduct();
      
      expect(() => cart.addItem(item, 0))
        .toThrow('Quantity must be greater than 0');
    });
  });

  describe('calculating totals', () => {
    it('should calculate total for single item', () => {
      const item = TestDataFactory.createProduct({ price: 100 });
      cart.addItem(item, 2);
      
      expect(cart.getSubtotal()).toBe(200);
    });

    it('should calculate total for multiple items', () => {
      const item1 = TestDataFactory.createProduct({ price: 100 });
      const item2 = TestDataFactory.createProduct({ price: 50 });
      
      cart.addItem(item1, 1);
      cart.addItem(item2, 2);
      
      expect(cart.getSubtotal()).toBe(200); // 100 + (50 * 2)
    });

    it('should apply discount correctly', () => {
      const item = TestDataFactory.createProduct({ price: 100 });
      cart.addItem(item, 1);
      
      cart.applyDiscount(10); // 10% discount
      
      expect(cart.getTotal()).toBe(90);
    });
  });
});
```

### API Development
```javascript
describe('UserController', () => {
  let userController;
  let mockUserService;

  beforeEach(() => {
    mockUserService = {
      createUser: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn()
    };
    userController = new UserController(mockUserService);
  });

  describe('POST /users', () => {
    it('should create user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      };
      
      const mockResult = {
        id: 'user-123',
        ...userData,
        createdAt: new Date()
      };
      
      mockUserService.createUser.mockResolvedValue(mockResult);
      
      const req = { body: userData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      await userController.createUser(req, res);
      
      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 for invalid data', async () => {
      const req = { body: { name: '' } }; // Invalid data
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      await userController.createUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid user data'
      });
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id', async () => {
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com'
      };
      
      mockUserService.getUserById.mockResolvedValue(mockUser);
      
      const req = { params: { id: userId } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      await userController.getUser(req, res);
      
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 for non-existent user', async () => {
      const userId = 'non-existent';
      
      mockUserService.getUserById.mockResolvedValue(null);
      
      const req = { params: { id: userId } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      await userController.getUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });
  });
});
```

### Data Processing
```javascript
describe('DataProcessor', () => {
  let dataProcessor;

  beforeEach(() => {
    dataProcessor = new DataProcessor();
  });

  describe('validateData', () => {
    it('should validate valid data structure', () => {
      const validData = {
        id: 'record-1',
        name: 'Test Record',
        value: 100,
        timestamp: new Date().toISOString()
      };

      const result = dataProcessor.validateData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidData = {
        name: 'Test Record'
        // Missing id, value, timestamp
      };

      const result = dataProcessor.validateData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: id');
      expect(result.errors).toContain('Missing required field: value');
      expect(result.errors).toContain('Missing required field: timestamp');
    });

    it('should detect invalid data types', () => {
      const invalidData = {
        id: 'record-1',
        name: 'Test Record',
        value: 'not-a-number', // Should be number
        timestamp: 'not-a-date' // Should be valid date string
      };

      const result = dataProcessor.validateData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field value must be a number');
      expect(result.errors).toContain('Field timestamp must be a valid date');
    });
  });

  describe('transformData', () => {
    it('should transform data structure', () => {
      const inputData = {
        id: 'record-1',
        name: 'Test Record',
        value: 100,
        timestamp: '2023-01-01T00:00:00Z'
      };

      const result = dataProcessor.transformData(inputData);

      expect(result).toEqual({
        recordId: 'record-1',
        displayName: 'Test Record',
        numericValue: 100,
        createdAt: expect.any(Date)
      });
    });

    it('should handle empty values', () => {
      const inputData = {
        id: 'record-1',
        name: '',
        value: 0,
        timestamp: null
      };

      const result = dataProcessor.transformData(inputData);

      expect(result.displayName).toBe('Unknown');
      expect(result.numericValue).toBe(0);
      expect(result.createdAt).toBeNull();
    });
  });

  describe('processBatch', () => {
    it('should process batch of records', async () => {
      const records = [
        { id: '1', name: 'Record 1', value: 100, timestamp: '2023-01-01T00:00:00Z' },
        { id: '2', name: 'Record 2', value: 200, timestamp: '2023-01-02T00:00:00Z' },
        { id: '3', name: 'Record 3', value: 300, timestamp: '2023-01-03T00:00:00Z' }
      ];

      const result = await dataProcessor.processBatch(records);

      expect(result.processed).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
      expect(result.processed[0].numericValue).toBe(100);
      expect(result.processed[1].numericValue).toBe(200);
      expect(result.processed[2].numericValue).toBe(300);
    });

    it('should handle mixed valid and invalid records', async () => {
      const records = [
        { id: '1', name: 'Valid Record', value: 100, timestamp: '2023-01-01T00:00:00Z' },
        { id: '2', name: '', value: 'invalid', timestamp: 'invalid-date' }, // Invalid
        { id: '3', name: 'Another Valid', value: 300, timestamp: '2023-01-03T00:00:00Z' }
      ];

      const result = await dataProcessor.processBatch(records);

      expect(result.processed).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.processed[0].displayName).toBe('Valid Record');
      expect(result.processed[1].displayName).toBe('Another Valid');
    });
  });
});
```

Remember: Unit tests should be fast, reliable, and focused. They help ensure that individual components work correctly in isolation, making debugging easier and providing confidence when refactoring code.