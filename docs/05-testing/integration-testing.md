# Integration Testing

## Overview

Integration testing focuses on testing the interactions between different components, modules, or services in your application. This document covers best practices for writing effective integration tests in JavaScript and TypeScript applications.

## Core Principles

### 1. Test Component Interactions

Integration tests should focus on how different parts of your system work together, not on individual unit behavior.

**✅ Good Integration Test:**
```javascript
// Testing interaction between UserService and EmailService
describe('User Registration Integration', () => {
  let userService;
  let emailService;
  let database;

  beforeEach(async () => {
    // Set up real dependencies
    database = new TestDatabase();
    emailService = new EmailService();
    userService = new UserService(database, emailService);
    
    await database.connect();
    await database.clear();
  });

  afterEach(async () => {
    await database.disconnect();
  });

  it('should register user and send welcome email', async () => {
    // Test the integration between user creation and email sending
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    };

    const result = await userService.registerUser(userData);

    // Verify user was created in database
    const savedUser = await database.findUserByEmail('john@example.com');
    expect(savedUser).toBeTruthy();
    expect(savedUser.name).toBe('John Doe');

    // Verify welcome email was sent
    const sentEmails = await emailService.getSentEmails();
    const welcomeEmail = sentEmails.find(email => 
      email.to === 'john@example.com' && 
      email.subject.includes('Welcome')
    );
    
    expect(welcomeEmail).toBeTruthy();
    expect(welcomeEmail.body).toContain('John Doe');
  });

  it('should handle email service failure gracefully', async () => {
    // Test error handling when email service fails
    emailService.send = jest.fn().mockRejectedValue(new Error('Email service down'));

    const userData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123'
    };

    // User should still be created even if email fails
    const result = await userService.registerUser(userData);
    expect(result.success).toBe(true);

    const savedUser = await database.findUserByEmail('jane@example.com');
    expect(savedUser).toBeTruthy();
  });
});
```

**❌ Bad Integration Test:**
```javascript
// Testing individual component behavior (should be unit test)
describe('UserService Integration', () => {
  it('should validate user data', () => {
    const userService = new UserService();
    
    // This is testing unit behavior, not integration
    expect(userService.validateEmail('test@example.com')).toBe(true);
    expect(userService.validateEmail('invalid-email')).toBe(false);
  });

  it('should hash password', () => {
    const userService = new UserService();
    
    // This is testing unit behavior, not integration
    const password = 'password123';
    const hashed = userService.hashPassword(password);
    expect(hashed).not.toBe(password);
    expect(userService.verifyPassword(password, hashed)).toBe(true);
  });
});
```

### 2. Use Real Dependencies When Possible

Integration tests should use real implementations of dependencies rather than mocks, when feasible.

**✅ Real Dependencies:**
```javascript
describe('Order Processing Integration', () => {
  let orderService;
  let paymentGateway;
  let inventoryService;
  let notificationService;

  beforeAll(async () => {
    // Use real services with test configurations
    paymentGateway = new PaymentGateway({
      apiKey: process.env.TEST_PAYMENT_API_KEY,
      endpoint: process.env.TEST_PAYMENT_ENDPOINT
    });
    
    inventoryService = new InventoryService({
      databaseUrl: process.env.TEST_DATABASE_URL
    });
    
    notificationService = new NotificationService({
      smtpHost: process.env.TEST_SMTP_HOST
    });

    orderService = new OrderService(paymentGateway, inventoryService, notificationService);
  });

  it('should process complete order flow', async () => {
    const orderData = {
      userId: 'user-123',
      items: [
        { productId: 'prod-1', quantity: 2, price: 50 },
        { productId: 'prod-2', quantity: 1, price: 100 }
      ],
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        country: 'Test Country'
      }
    };

    const result = await orderService.processOrder(orderData);

    // Verify payment was charged
    const payment = await paymentGateway.getPayment(result.paymentId);
    expect(payment.status).toBe('completed');
    expect(payment.amount).toBe(200); // (2 * 50) + (1 * 100)

    // Verify inventory was updated
    const inventory1 = await inventoryService.getStock('prod-1');
    const inventory2 = await inventoryService.getStock('prod-2');
    expect(inventory1.quantity).toBe(8); // Assuming started with 10
    expect(inventory2.quantity).toBe(9); // Assuming started with 10

    // Verify notification was sent
    const notifications = await notificationService.getNotifications();
    const orderNotification = notifications.find(n => n.userId === 'user-123');
    expect(orderNotification).toBeTruthy();
    expect(orderNotification.type).toBe('order_confirmation');
  });
});
```

**❌ Over-Mocked Integration Test:**
```javascript
describe('Order Processing Integration', () => {
  it('should process order with mocked dependencies', async () => {
    // Everything is mocked - this is more like a unit test
    const mockPaymentGateway = {
      charge: jest.fn().mockResolvedValue({ id: 'pay-123', status: 'completed' })
    };
    
    const mockInventoryService = {
      reserveItems: jest.fn().mockResolvedValue({ success: true })
    };
    
    const mockNotificationService = {
      sendOrderConfirmation: jest.fn().mockResolvedValue(true)
    };

    const orderService = new OrderService(
      mockPaymentGateway, 
      mockInventoryService, 
      mockNotificationService
    );

    const result = await orderService.processOrder({
      userId: 'user-123',
      items: [{ productId: 'prod-1', quantity: 1, price: 100 }]
    });

    expect(result.success).toBe(true);
    expect(mockPaymentGateway.charge).toHaveBeenCalled();
    expect(mockInventoryService.reserveItems).toHaveBeenCalled();
    expect(mockNotificationService.sendOrderConfirmation).toHaveBeenCalled();
  });
});
```

### 3. Test Data Flow Between Components

Focus on how data flows and transforms as it moves through different components.

**✅ Data Flow Testing:**
```javascript
describe('Data Processing Pipeline Integration', () => {
  let dataIngestionService;
  let dataTransformationService;
  let dataStorageService;
  let dataValidationService;

  beforeEach(async () => {
    dataIngestionService = new DataIngestionService();
    dataTransformationService = new DataTransformationService();
    dataStorageService = new DataStorageService();
    dataValidationService = new DataValidationService();
  });

  it('should process data through entire pipeline', async () => {
    // Input data
    const rawData = {
      id: 'record-1',
      name: '  John Doe  ',
      email: 'JOHN.DOE@EXAMPLE.COM',
      age: '25',
      createdAt: '2023-01-01T00:00:00Z'
    };

    // Step 1: Ingestion
    const ingestionResult = await dataIngestionService.ingest(rawData);
    expect(ingestionResult.status).toBe('ingested');
    expect(ingestionResult.data.id).toBe('record-1');

    // Step 2: Validation
    const validationResult = await dataValidationService.validate(ingestionResult.data);
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors).toHaveLength(0);

    // Step 3: Transformation
    const transformationResult = await dataTransformationService.transform(validationResult.data);
    expect(transformationResult.processedData.displayName).toBe('John Doe'); // Trimmed and formatted
    expect(transformationResult.processedData.email).toBe('john.doe@example.com'); // Lowercased
    expect(transformationResult.processedData.age).toBe(25); // Converted to number
    expect(transformationResult.processedData.createdAt).toBeInstanceOf(Date);

    // Step 4: Storage
    const storageResult = await dataStorageService.store(transformationResult.processedData);
    expect(storageResult.success).toBe(true);
    expect(storageResult.recordId).toBeDefined();

    // Verify final stored data
    const storedRecord = await dataStorageService.findById(storageResult.recordId);
    expect(storedRecord.displayName).toBe('John Doe');
    expect(storedRecord.email).toBe('john.doe@example.com');
    expect(storedRecord.age).toBe(25);
  });

  it('should handle data transformation errors', async () => {
    const invalidData = {
      id: 'record-2',
      name: 'John Doe',
      email: 'invalid-email', // Invalid email format
      age: 'not-a-number',
      createdAt: 'invalid-date'
    };

    const ingestionResult = await dataIngestionService.ingest(invalidData);
    const validationResult = await dataValidationService.validate(ingestionResult.data);
    
    // Validation should catch the errors
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain('Invalid email format');
    expect(validationResult.errors).toContain('Invalid age format');
    expect(validationResult.errors).toContain('Invalid date format');
  });
});
```

**❌ Poor Data Flow Testing:**
```javascript
describe('Data Processing Pipeline', () => {
  it('should test each component separately', async () => {
    // Testing components in isolation - these are unit tests
    const data = { name: 'John', email: 'john@example.com' };
    
    const ingestionService = new DataIngestionService();
    const result1 = await ingestionService.ingest(data);
    expect(result1.status).toBe('ingested');

    const validationService = new DataValidationService();
    const result2 = await validationService.validate(result1.data);
    expect(result2.isValid).toBe(true);

    const transformationService = new DataTransformationService();
    const result3 = await transformationService.transform(result2.data);
    expect(result3.processedData).toBeDefined();

    const storageService = new DataStorageService();
    const result4 = await storageService.store(result3.processedData);
    expect(result4.success).toBe(true);
  });
});
```

## TypeScript-Specific Considerations

### 1. Type-Safe Integration Tests

Use TypeScript to ensure type safety across component boundaries in integration tests.

**✅ Type-Safe Integration Tests:**
```typescript
interface UserRegistrationRequest {
  name: string;
  email: string;
  password: string;
}

interface UserRegistrationResult {
  success: boolean;
  userId: string;
  emailSent: boolean;
}

interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface Email {
  to: string;
  subject: string;
  body: string;
  sentAt: Date;
}

describe('User Registration Integration', () => {
  let userService: UserService;
  let emailService: EmailService;
  let database: TestDatabase;

  beforeEach(async () => {
    database = new TestDatabase();
    emailService = new EmailService();
    userService = new UserService(database, emailService);
    
    await database.connect();
    await database.clear();
  });

  it('should register user and send welcome email', async () => {
    const userData: UserRegistrationRequest = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    };

    const result: UserRegistrationResult = await userService.registerUser(userData);

    // Type-safe assertions
    expect(result.success).toBe(true);
    expect(typeof result.userId).toBe('string');
    expect(result.emailSent).toBe(true);

    // Verify user in database with type safety
    const savedUser: DatabaseUser | null = await database.findUserByEmail('john@example.com');
    expect(savedUser).toBeTruthy();
    if (savedUser) {
      expect(savedUser.name).toBe('John Doe');
      expect(savedUser.email).toBe('john@example.com');
      expect(savedUser.createdAt).toBeInstanceOf(Date);
    }

    // Verify email with type safety
    const sentEmails: Email[] = await emailService.getSentEmails();
    const welcomeEmail: Email | undefined = sentEmails.find(email => 
      email.to === 'john@example.com' && 
      email.subject.includes('Welcome')
    );
    
    expect(welcomeEmail).toBeTruthy();
    if (welcomeEmail) {
      expect(welcomeEmail.body).toContain('John Doe');
      expect(welcomeEmail.sentAt).toBeInstanceOf(Date);
    }
  });

  it('should handle registration errors gracefully', async () => {
    const userData: UserRegistrationRequest = {
      name: 'John Doe',
      email: 'invalid-email', // Invalid format
      password: '123' // Too short
    };

    await expect(userService.registerUser(userData))
      .rejects
      .toThrow('Invalid user data');
  });
});
```

**❌ Non-Type-Safe Integration Tests:**
```typescript
describe('User Registration Integration', () => {
  it('should register user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    };

    const result = await userService.registerUser(userData);
    
    // No type safety - could access non-existent properties
    expect(result.success).toBe(true);
    expect(result.userId).toBeDefined();
    expect(result.invalidProperty); // No compile-time error
  });
});
```

### 2. Interface Contract Testing

Test that components properly implement and use interfaces.

**✅ Interface Contract Testing:**
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

interface RefundResult {
  success: boolean;
  transactionId: string;
  refundedAmount: number;
  status: 'completed' | 'pending' | 'failed';
}

describe('Payment Processing Integration', () => {
  let paymentService: PaymentService;
  let stripeProcessor: PaymentProcessor;
  let paypalProcessor: PaymentProcessor;

  beforeEach(() => {
    stripeProcessor = new StripeProcessor();
    paypalProcessor = new PayPalProcessor();
    paymentService = new PaymentService({
      stripe: stripeProcessor,
      paypal: paypalProcessor
    });
  });

  it('should process payment with Stripe', async () => {
    const result: PaymentResult = await paymentService.processPayment({
      amount: 100,
      currency: 'USD',
      processor: 'stripe'
    });

    // Verify interface contract
    expect(result.success).toBe(true);
    expect(typeof result.transactionId).toBe('string');
    expect(result.amount).toBe(100);
    expect(result.currency).toBe('USD');

    // Verify Stripe processor was called
    expect(stripeProcessor.processPayment).toHaveBeenCalledWith(100, 'USD');
  });

  it('should process payment with PayPal', async () => {
    const result: PaymentResult = await paymentService.processPayment({
      amount: 50,
      currency: 'EUR',
      processor: 'paypal'
    });

    // Verify interface contract
    expect(result.success).toBe(true);
    expect(typeof result.transactionId).toBe('string');
    expect(result.amount).toBe(50);
    expect(result.currency).toBe('EUR');

    // Verify PayPal processor was called
    expect(paypalProcessor.processPayment).toHaveBeenCalledWith(50, 'EUR');
  });

  it('should handle processor failures', async () => {
    // Mock processor failure
    jest.spyOn(stripeProcessor, 'processPayment')
      .mockRejectedValue(new Error('Processor unavailable'));

    await expect(paymentService.processPayment({
      amount: 100,
      currency: 'USD',
      processor: 'stripe'
    })).rejects.toThrow('Processor unavailable');
  });
});
```

**❌ Poor Interface Testing:**
```typescript
describe('Payment Processing', () => {
  it('should process payment', async () => {
    const paymentService = new PaymentService();
    
    const result = await paymentService.processPayment({
      amount: 100,
      currency: 'USD',
      processor: 'stripe'
    });

    // No interface validation
    expect(result.success).toBe(true);
    expect(result.transactionId).toBeDefined();
    // Could miss interface violations
  });
});
```

### 3. Generic Type Integration Testing

Test generic components with different type parameters in integration scenarios.

**✅ Generic Type Integration Testing:**
```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(item: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}

class UserService {
  constructor(private userRepository: Repository<User>) {}

  async getUser(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const user: User = {
      id: generateId(),
      name: userData.name,
      email: userData.email,
      createdAt: new Date()
    };
    return await this.userRepository.save(user);
  }
}

class ProductService {
  constructor(private productRepository: Repository<Product>) {}

  async getProduct(id: string): Promise<Product | null> {
    return await this.productRepository.findById(id);
  }

  async createProduct(productData: CreateProductRequest): Promise<Product> {
    const product: Product = {
      id: generateId(),
      name: productData.name,
      price: productData.price,
      createdAt: new Date()
    };
    return await this.productRepository.save(product);
  }
}

describe('Generic Repository Integration', () => {
  let userRepository: Repository<User>;
  let productRepository: Repository<Product>;
  let userService: UserService;
  let productService: ProductService;

  beforeEach(() => {
    userRepository = new DatabaseRepository<User>();
    productRepository = new DatabaseRepository<Product>();
    userService = new UserService(userRepository);
    productService = new ProductService(productRepository);
  });

  it('should handle user operations', async () => {
    // Create user
    const user = await userService.createUser({
      name: 'John Doe',
      email: 'john@example.com'
    });

    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.createdAt).toBeInstanceOf(Date);

    // Retrieve user
    const retrievedUser = await userService.getUser(user.id);
    expect(retrievedUser).toEqual(user);
  });

  it('should handle product operations', async () => {
    // Create product
    const product = await productService.createProduct({
      name: 'Laptop',
      price: 999.99
    });

    expect(product.name).toBe('Laptop');
    expect(product.price).toBe(999.99);
    expect(product.createdAt).toBeInstanceOf(Date);

    // Retrieve product
    const retrievedProduct = await productService.getProduct(product.id);
    expect(retrievedProduct).toEqual(product);
  });

  it('should maintain type safety across operations', async () => {
    // Create user
    const user = await userService.createUser({
      name: 'Jane Doe',
      email: 'jane@example.com'
    });

    // Verify we get back a User type, not a Product
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(user).not.toHaveProperty('price'); // Product property

    // Create product
    const product = await productService.createProduct({
      name: 'Phone',
      price: 599.99
    });

    // Verify we get back a Product type, not a User
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
    expect(product).not.toHaveProperty('email'); // User property
  });
});
```

**❌ Generic Testing Without Type Safety:**
```typescript
describe('Generic Repository', () => {
  it('should handle different entity types', async () => {
    const repository = new DatabaseRepository();
    
    // User operations
    const user = { id: 'user1', name: 'John', email: 'john@example.com' };
    await repository.save(user);
    const retrievedUser = await repository.findById('user1');
    
    // Product operations
    const product = { id: 'prod1', name: 'Laptop', price: 999.99 };
    await repository.save(product);
    const retrievedProduct = await repository.findById('prod1');
    
    // No type safety - could mix up entities
    expect(retrievedUser.name).toBe('John');
    expect(retrievedProduct.price).toBe(999.99);
  });
});
```

## Common Patterns

### 1. Database Integration Testing

Test interactions with real databases while maintaining test isolation.

**✅ Database Integration Testing:**
```javascript
describe('Database Integration', () => {
  let database;
  let userRepository;
  let orderRepository;

  beforeAll(async () => {
    database = new TestDatabase({
      connectionString: process.env.TEST_DATABASE_URL
    });
    await database.connect();
  });

  afterAll(async () => {
    await database.disconnect();
  });

  beforeEach(async () => {
    // Clean database state for each test
    await database.truncate(['users', 'orders', 'products']);
    
    userRepository = new UserRepository(database);
    orderRepository = new OrderRepository(database);
  });

  it('should create user and related orders', async () => {
    // Create user
    const user = await userRepository.createUser({
      name: 'John Doe',
      email: 'john@example.com'
    });

    // Create orders for user
    const order1 = await orderRepository.createOrder({
      userId: user.id,
      total: 100,
      status: 'pending'
    });

    const order2 = await orderRepository.createOrder({
      userId: user.id,
      total: 200,
      status: 'completed'
    });

    // Verify relationships
    const userOrders = await orderRepository.findByUserId(user.id);
    expect(userOrders).toHaveLength(2);
    expect(userOrders[0].total).toBe(100);
    expect(userOrders[1].total).toBe(200);

    // Verify user still exists
    const foundUser = await userRepository.findById(user.id);
    expect(foundUser.name).toBe('John Doe');
  });

  it('should handle database transactions', async () => {
    const transaction = await database.beginTransaction();

    try {
      // Create user in transaction
      const user = await userRepository.createUser({
        name: 'Jane Doe',
        email: 'jane@example.com'
      }, transaction);

      // Create order in transaction
      await orderRepository.createOrder({
        userId: user.id,
        total: 150,
        status: 'pending'
      }, transaction);

      // Verify data exists in transaction
      const userOrders = await orderRepository.findByUserId(user.id, transaction);
      expect(userOrders).toHaveLength(1);

      // Commit transaction
      await transaction.commit();

      // Verify data persists after commit
      const committedOrders = await orderRepository.findByUserId(user.id);
      expect(committedOrders).toHaveLength(1);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  });

  it('should rollback transaction on error', async () => {
    const transaction = await database.beginTransaction();

    try {
      // Create user
      const user = await userRepository.createUser({
        name: 'Bob Smith',
        email: 'bob@example.com'
      }, transaction);

      // Create order
      await orderRepository.createOrder({
        userId: user.id,
        total: 75,
        status: 'pending'
      }, transaction);

      // Simulate error
      throw new Error('Simulated error');

    } catch (error) {
      await transaction.rollback();
    }

    // Verify nothing was committed
    const users = await userRepository.findAll();
    const orders = await orderRepository.findAll();
    
    expect(users).toHaveLength(0);
    expect(orders).toHaveLength(0);
  });
});
```

**❌ Poor Database Testing:**
```javascript
describe('Database Operations', () => {
  it('should create and find user', async () => {
    // No proper setup/teardown
    const user = await userRepository.createUser({
      name: 'John Doe',
      email: 'john@example.com'
    });

    const foundUser = await userRepository.findById(user.id);
    expect(foundUser.name).toBe('John Doe');
  });

  it('should create order', async () => {
    // Depends on previous test
    const order = await orderRepository.createOrder({
      userId: 'user-from-previous-test',
      total: 100
    });

    expect(order.total).toBe(100);
  });
});
```

### 2. API Integration Testing

Test HTTP API endpoints and their interactions.

**✅ API Integration Testing:**
```javascript
describe('API Integration', () => {
  let app;
  let server;
  let testDatabase;

  beforeAll(async () => {
    testDatabase = new TestDatabase();
    await testDatabase.connect();
    
    app = createApp({
      database: testDatabase,
      port: 0 // Let system assign port
    });
    
    server = app.listen();
  });

  afterAll(async () => {
    await server.close();
    await testDatabase.disconnect();
  });

  beforeEach(async () => {
    await testDatabase.clear();
  });

  describe('User API', () => {
    it('should create user via API', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'John Doe',
        email: 'john@example.com'
      });

      // Verify user was actually created in database
      const user = await testDatabase.findUserByEmail('john@example.com');
      expect(user).toBeTruthy();
      expect(user.name).toBe('John Doe');
    });

    it('should get user by ID', async () => {
      // Create user first
      const user = await testDatabase.createUser({
        name: 'Jane Doe',
        email: 'jane@example.com'
      });

      const response = await request(app)
        .get(`/api/users/${user.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: user.id,
        name: 'Jane Doe',
        email: 'jane@example.com'
      });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/non-existent-id')
        .expect(404);

      expect(response.body).toEqual({
        error: 'User not found'
      });
    });
  });

  describe('Order API', () => {
    it('should create order for existing user', async () => {
      // Create user first
      const user = await testDatabase.createUser({
        name: 'Bob Smith',
        email: 'bob@example.com'
      });

      const orderData = {
        userId: user.id,
        items: [
          { productId: 'prod-1', quantity: 2, price: 50 },
          { productId: 'prod-2', quantity: 1, price: 100 }
        ],
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          country: 'Test Country'
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        userId: user.id,
        total: 200,
        status: 'pending'
      });

      // Verify order was created
      const order = await testDatabase.findOrderById(response.body.id);
      expect(order).toBeTruthy();
      expect(order.total).toBe(200);
    });

    it('should return 400 for invalid order data', async () => {
      const orderData = {
        userId: 'non-existent-user',
        items: [],
        shippingAddress: {}
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Invalid order data'
      });
    });
  });

  describe('Cross-Resource API', () => {
    it('should get user with their orders', async () => {
      // Create user and orders
      const user = await testDatabase.createUser({
        name: 'Alice Johnson',
        email: 'alice@example.com'
      });

      await testDatabase.createOrder({
        userId: user.id,
        total: 100,
        status: 'completed'
      });

      await testDatabase.createOrder({
        userId: user.id,
        total: 200,
        status: 'pending'
      });

      const response = await request(app)
        .get(`/api/users/${user.id}/orders`)
        .expect(200);

      expect(response.body.user).toMatchObject({
        id: user.id,
        name: 'Alice Johnson',
        email: 'alice@example.com'
      });

      expect(response.body.orders).toHaveLength(2);
      expect(response.body.orders[0].total).toBe(100);
      expect(response.body.orders[1].total).toBe(200);
    });
  });
});
```

**❌ Poor API Testing:**
```javascript
describe('API Endpoints', () => {
  it('should test user creation', async () => {
    // No proper setup
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'John', email: 'john@example.com' });
    
    expect(response.status).toBe(201);
  });

  it('should test user retrieval', async () => {
    // No isolation - depends on previous test
    const response = await request(app)
      .get('/api/users/1');
    
    expect(response.status).toBe(200);
  });
});
```

### 3. External Service Integration Testing

Test integration with external services like payment gateways, email services, etc.

**✅ External Service Integration Testing:**
```javascript
describe('External Service Integration', () => {
  let paymentService;
  let emailService;
  let smsService;

  beforeAll(async () => {
    // Use test/sandbox configurations
    paymentService = new PaymentService({
      apiKey: process.env.TEST_PAYMENT_API_KEY,
      endpoint: process.env.TEST_PAYMENT_ENDPOINT,
      timeout: 5000
    });

    emailService = new EmailService({
      apiKey: process.env.TEST_EMAIL_API_KEY,
      endpoint: process.env.TEST_EMAIL_ENDPOINT
    });

    smsService = new SMSService({
      apiKey: process.env.TEST_SMS_API_KEY,
      endpoint: process.env.TEST_SMS_ENDPOINT
    });
  });

  it('should process payment and send notifications', async () => {
    const paymentData = {
      amount: 100.00,
      currency: 'USD',
      source: 'tok_visa_test',
      description: 'Test payment'
    };

    // Process payment
    const paymentResult = await paymentService.charge(paymentData);
    expect(paymentResult.success).toBe(true);
    expect(paymentResult.amount).toBe(100.00);
    expect(paymentResult.currency).toBe('USD');

    // Send email notification
    const emailResult = await emailService.send({
      to: 'customer@example.com',
      subject: 'Payment Successful',
      body: `Your payment of $${paymentResult.amount} has been processed.`
    });
    expect(emailResult.success).toBe(true);

    // Send SMS notification
    const smsResult = await smsService.send({
      to: '+1234567890',
      message: `Payment of $${paymentResult.amount} successful.`
    });
    expect(smsResult.success).toBe(true);
  });

  it('should handle payment failure gracefully', async () => {
    const paymentData = {
      amount: 100.00,
      currency: 'USD',
      source: 'tok_chargeDeclined', // Test token that always fails
      description: 'Test payment'
    };

    await expect(paymentService.charge(paymentData))
      .rejects
      .toThrow('Your card was declined.');

    // Verify no notifications were sent for failed payment
    const emailResult = await emailService.getSentEmails();
    expect(emailResult).toHaveLength(0);

    const smsResult = await smsService.getSentMessages();
    expect(smsResult).toHaveLength(0);
  });

  it('should handle service timeouts', async () => {
    // Mock slow response
    jest.spyOn(paymentService, 'charge')
      .mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: false }), 10000))
      );

    await expect(paymentService.charge({
      amount: 100,
      currency: 'USD',
      source: 'tok_visa_test'
    })).rejects.toThrow('Request timeout');
  });

  it('should retry failed external service calls', async () => {
    // Mock first call to fail, second to succeed
    let callCount = 0;
    jest.spyOn(emailService, 'send')
      .mockImplementation(async (data) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Service temporarily unavailable');
        }
        return { success: true, messageId: 'msg-123' };
      });

    const result = await emailService.send({
      to: 'test@example.com',
      subject: 'Test',
      body: 'Test message'
    });

    expect(result.success).toBe(true);
    expect(callCount).toBe(2); // Should have retried once
  });
});
```

**❌ Poor External Service Testing:**
```javascript
describe('External Services', () => {
  it('should test payment processing', async () => {
    // Using production credentials in tests
    const paymentService = new PaymentService({
      apiKey: process.env.PRODUCTION_PAYMENT_API_KEY,
      endpoint: 'https://api.stripe.com'
    });

    const result = await paymentService.charge({
      amount: 100,
      currency: 'USD',
      source: 'tok_visa'
    });

    expect(result.success).toBe(true);
  });
});
```

## Common Pitfalls and Solutions

### 1. Slow Integration Tests

**❌ Bad: Slow Tests**
```javascript
describe('Integration Tests', () => {
  it('should test everything', async () => {
    // Creating complex setup for every test
    const database = new Database();
    await database.connect();
    await database.seed();
    
    const server = new Server();
    await server.start();
    
    const client = new Client();
    await client.connect();
    
    // Actual test
    const result = await client.makeRequest();
    expect(result.success).toBe(true);
    
    // Cleanup
    await client.disconnect();
    await server.stop();
    await database.disconnect();
  });
});
```

**✅ Good: Optimized Tests**
```javascript
describe('Integration Tests', () => {
  let database;
  let server;

  beforeAll(async () => {
    database = new TestDatabase();
    await database.connect();
    await database.seed();
    
    server = createTestServer({ database });
    await server.start();
  });

  afterAll(async () => {
    await server.stop();
    await database.disconnect();
  });

  beforeEach(async () => {
    await database.reset(); // Quick reset instead of full setup
  });

  it('should test user creation', async () => {
    const result = await makeRequest('/api/users', { name: 'John' });
    expect(result.status).toBe(201);
  });

  it('should test user retrieval', async () => {
    const user = await createTestUser();
    const result = await makeRequest(`/api/users/${user.id}`);
    expect(result.status).toBe(200);
  });
});
```

### 2. Test Data Management

**❌ Bad: Poor Data Management**
```javascript
describe('Integration Tests', () => {
  it('should test with hardcoded data', async () => {
    // Hardcoded IDs and data
    const result = await api.get('/api/users/123');
    expect(result.body.name).toBe('John Doe');
  });

  it('should test with shared data', async () => {
    // Depends on data from other tests
    const result = await api.get('/api/users/123');
    expect(result.body.email).toBe('john@example.com');
  });
});
```

**✅ Good: Proper Data Management**
```javascript
describe('Integration Tests', () => {
  beforeEach(async () => {
    // Create fresh test data for each test
    this.testUser = await createTestUser({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`
    });
  });

  it('should test user creation', async () => {
    const userData = {
      name: 'New User',
      email: `new-${Date.now()}@example.com`
    };
    
    const result = await api.post('/api/users', userData);
    expect(result.status).toBe(201);
    expect(result.body.name).toBe(userData.name);
  });

  it('should test user retrieval', async () => {
    const result = await api.get(`/api/users/${this.testUser.id}`);
    expect(result.status).toBe(200);
    expect(result.body.id).toBe(this.testUser.id);
  });
});
```

### 3. Flaky Tests

**❌ Bad: Flaky Tests**
```javascript
describe('Integration Tests', () => {
  it('should test with timing dependencies', async () => {
    const startTime = Date.now();
    
    await api.post('/api/process');
    
    // Race condition - depends on processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = await api.get('/api/status');
    expect(result.body.status).toBe('completed');
  });

  it('should test with external dependencies', async () => {
    // Depends on external service being available
    const result = await api.get('https://api.example.com/data');
    expect(result.status).toBe(200);
  });
});
```

**✅ Good: Reliable Tests**
```javascript
describe('Integration Tests', () => {
  it('should test with proper synchronization', async () => {
    await api.post('/api/process');
    
    // Poll until status is completed
    let status = 'pending';
    let attempts = 0;
    
    while (status === 'pending' && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = await api.get('/api/status');
      status = result.body.status;
      attempts++;
    }
    
    expect(status).toBe('completed');
  });

  it('should test with mocked external dependencies', async () => {
    // Mock external service
    mockExternalService({
      url: 'https://api.example.com/data',
      response: { data: 'test' }
    });
    
    const result = await api.get('/api/external-data');
    expect(result.status).toBe(200);
    expect(result.body.data).toBe('test');
  });
});
```

### 4. Poor Error Handling

**❌ Bad: Poor Error Handling**
```javascript
describe('Integration Tests', () => {
  it('should test error scenarios', async () => {
    try {
      await api.post('/api/process', { invalid: 'data' });
      // Test will fail if no error is thrown
    } catch (error) {
      expect(error.message).toContain('Error'); // Too vague
    }
  });
});
```

**✅ Good: Proper Error Testing**
```javascript
describe('Integration Tests', () => {
  it('should handle validation errors', async () => {
    const result = await api.post('/api/users', { name: '' });
    
    expect(result.status).toBe(400);
    expect(result.body.errors).toContain('Name is required');
  });

  it('should handle not found errors', async () => {
    const result = await api.get('/api/users/non-existent');
    
    expect(result.status).toBe(404);
    expect(result.body.error).toBe('User not found');
  });

  it('should handle server errors', async () => {
    // Mock server error
    mockServerError('/api/users', 500);
    
    const result = await api.post('/api/users', { name: 'John' });
    
    expect(result.status).toBe(500);
    expect(result.body.error).toBe('Internal server error');
  });
});
```

## Best Practices Summary

1. **Test Interactions**: Focus on how components work together
2. **Use Real Dependencies**: Prefer real implementations over mocks
3. **Test Data Flow**: Verify data transformation and movement
4. **Maintain Test Isolation**: Each test should be independent
5. **Use Type Safety**: Leverage TypeScript for integration tests
6. **Test Error Scenarios**: Include failure cases and error handling
7. **Optimize Performance**: Minimize test execution time
8. **Manage Test Data**: Use proper setup and cleanup
9. **Handle External Services**: Use test configurations and proper mocking
10. **Ensure Reliability**: Avoid flaky tests and timing dependencies

## Examples in Context

### E-commerce Application
```javascript
describe('E-commerce Integration', () => {
  let orderService;
  let paymentService;
  let inventoryService;
  let notificationService;
  let database;

  beforeAll(async () => {
    database = new TestDatabase();
    await database.connect();
    
    orderService = new OrderService();
    paymentService = new PaymentService();
    inventoryService = new InventoryService();
    notificationService = new NotificationService();
  });

  beforeEach(async () => {
    await database.clear();
    await database.seed();
  });

  it('should process complete order flow', async () => {
    // Create user
    const user = await database.createUser({
      name: 'John Doe',
      email: 'john@example.com'
    });

    // Create products
    const product1 = await database.createProduct({
      id: 'prod-1',
      name: 'Laptop',
      price: 999.99,
      stock: 10
    });

    const product2 = await database.createProduct({
      id: 'prod-2',
      name: 'Mouse',
      price: 29.99,
      stock: 50
    });

    // Place order
    const orderData = {
      userId: user.id,
      items: [
        { productId: 'prod-1', quantity: 1 },
        { productId: 'prod-2', quantity: 2 }
      ],
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        country: 'Test Country'
      }
    };

    const orderResult = await orderService.createOrder(orderData);

    // Verify order was created
    expect(orderResult.success).toBe(true);
    expect(orderResult.total).toBe(1059.97); // 999.99 + (29.99 * 2)

    // Verify inventory was reserved
    const laptopStock = await inventoryService.getStock('prod-1');
    const mouseStock = await inventoryService.getStock('prod-2');
    expect(laptopStock).toBe(9); // 10 - 1
    expect(mouseStock).toBe(48); // 50 - 2

    // Process payment
    const paymentResult = await paymentService.processPayment({
      orderId: orderResult.id,
      amount: orderResult.total,
      currency: 'USD'
    });

    expect(paymentResult.success).toBe(true);
    expect(paymentResult.status).toBe('completed');

    // Verify order status updated
    const order = await orderService.getOrder(orderResult.id);
    expect(order.status).toBe('paid');

    // Verify notifications sent
    const notifications = await notificationService.getNotifications();
    const orderNotification = notifications.find(n => n.orderId === orderResult.id);
    expect(orderNotification).toBeTruthy();
    expect(orderNotification.type).toBe('order_confirmation');
  });
});
```

### API Development
```javascript
describe('API Integration', () => {
  let app;
  let server;
  let testDatabase;

  beforeAll(async () => {
    testDatabase = new TestDatabase();
    await testDatabase.connect();
    
    app = createApp({ database: testDatabase });
    server = app.listen(0);
  });

  afterAll(async () => {
    await server.close();
    await testDatabase.disconnect();
  });

  beforeEach(async () => {
    await testDatabase.clear();
  });

  describe('Authentication Flow', () => {
    it('should register user and authenticate', async () => {
      // Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        })
        .expect(201);

      expect(registerResponse.body.user.email).toBe('john@example.com');
      expect(registerResponse.body.token).toBeDefined();

      // Authenticate with credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(loginResponse.body.token).toBeDefined();
      expect(loginResponse.body.user.email).toBe('john@example.com');

      // Access protected endpoint
      const protectedResponse = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .expect(200);

      expect(protectedResponse.body.email).toBe('john@example.com');
    });

    it('should refresh token', async () => {
      // Register and login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      const refreshToken = loginResponse.body.refreshToken;

      // Refresh token
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body.token).toBeDefined();
      expect(refreshResponse.body.refreshToken).toBeDefined();
    });
  });

  describe('Resource Management', () => {
    let authToken;

    beforeEach(async () => {
      // Create authenticated user
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123'
        });

      authToken = response.body.token;
    });

    it('should create and manage resources', async () => {
      // Create resource
      const createResponse = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Resource',
          description: 'This is a test resource'
        })
        .expect(201);

      const resourceId = createResponse.body.id;

      // Get resource
      const getResponse = await request(app)
        .get(`/api/resources/${resourceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.title).toBe('Test Resource');

      // Update resource
      const updateResponse = await request(app)
        .put(`/api/resources/${resourceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Resource',
          description: 'This resource has been updated'
        })
        .expect(200);

      expect(updateResponse.body.title).toBe('Updated Resource');

      // List resources
      const listResponse = await request(app)
        .get('/api/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0].title).toBe('Updated Resource');

      // Delete resource
      await request(app)
        .delete(`/api/resources/${resourceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify deletion
      await request(app)
        .get(`/api/resources/${resourceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

### Data Processing Pipeline
```javascript
describe('Data Processing Pipeline Integration', () => {
  let dataIngestionService;
  let dataValidationService;
  let dataTransformationService;
  let dataStorageService;
  let dataAnalyticsService;

  beforeAll(async () => {
    dataIngestionService = new DataIngestionService();
    dataValidationService = new DataValidationService();
    dataTransformationService = new DataTransformationService();
    dataStorageService = new DataStorageService();
    dataAnalyticsService = new DataAnalyticsService();
  });

  beforeEach(async () => {
    await dataStorageService.clear();
  });

  it('should process data through complete pipeline', async () => {
    // Input data
    const rawData = [
      {
        id: 'record-1',
        name: '  John Doe  ',
        email: 'JOHN.DOE@EXAMPLE.COM',
        age: '25',
        department: 'Engineering',
        salary: '75000'
      },
      {
        id: 'record-2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        age: '30',
        department: 'Marketing',
        salary: '65000'
      },
      {
        id: 'record-3',
        name: 'Bob Wilson',
        email: 'invalid-email', // Invalid email
        age: 'not-a-number', // Invalid age
        department: 'Sales',
        salary: '55000'
      }
    ];

    // Process through pipeline
    const ingestionResult = await dataIngestionService.ingestBatch(rawData);
    expect(ingestionResult.processed).toBe(3);
    expect(ingestionResult.errors).toBe(0);

    // Validate data
    const validationResults = await Promise.all(
      ingestionResult.records.map(record => 
        dataValidationService.validate(record)
      )
    );

    // Should have 2 valid records and 1 invalid
    const validRecords = validationResults.filter(r => r.isValid);
    const invalidRecords = validationResults.filter(r => !r.isValid);
    
    expect(validRecords).toHaveLength(2);
    expect(invalidRecords).toHaveLength(1);

    // Transform valid records
    const transformationResults = await Promise.all(
      validRecords.map(result => 
        dataTransformationService.transform(result.data)
      )
    );

    // Store transformed data
    const storageResults = await Promise.all(
      transformationResults.map(result => 
        dataStorageService.store(result.processedData)
      )
    );

    expect(storageResults.every(r => r.success)).toBe(true);

    // Verify data in storage
    const storedRecords = await dataStorageService.findAll();
    expect(storedRecords).toHaveLength(2);

    const johnRecord = storedRecords.find(r => r.displayName === 'John Doe');
    const janeRecord = storedRecords.find(r => r.displayName === 'Jane Smith');

    expect(johnRecord).toBeTruthy();
    expect(janeRecord).toBeTruthy();
    expect(johnRecord.email).toBe('john.doe@example.com');
    expect(janeRecord.email).toBe('jane.smith@example.com');

    // Run analytics
    const analyticsResult = await dataAnalyticsService.generateReport();
    
    expect(analyticsResult.totalRecords).toBe(2);
    expect(analyticsResult.averageSalary).toBe(70000); // (75000 + 65000) / 2
    expect(analyticsResult.departmentBreakdown).toEqual({
      Engineering: 1,
      Marketing: 1
    });
  });

  it('should handle pipeline failures gracefully', async () => {
    // Mock storage failure
    jest.spyOn(dataStorageService, 'store')
      .mockRejectedValue(new Error('Database connection failed'));

    const rawData = [{
      id: 'record-1',
      name: 'John Doe',
      email: 'john@example.com',
      age: '25'
    }];

    const ingestionResult = await dataIngestionService.ingestBatch(rawData);
    const validationResult = await dataValidationService.validate(ingestionResult.records[0]);
    const transformationResult = await dataTransformationService.transform(validationResult.data);

    // Storage should fail
    await expect(dataStorageService.store(transformationResult.processedData))
      .rejects
      .toThrow('Database connection failed');

    // Verify no partial data was stored
    const storedRecords = await dataStorageService.findAll();
    expect(storedRecords).toHaveLength(0);
  });
});
```

Remember: Integration tests verify that different parts of your system work together correctly. They should use real dependencies when possible, test data flow between components, and ensure that the system behaves correctly as a whole.