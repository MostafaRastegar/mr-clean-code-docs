---
paths:
  - "src/**/*.test.js"
  - "src/**/*.spec.js"
  - "src/**/*.test.ts"
  - "src/**/*.spec.ts"
  - "src/**/*.test.tsx"
  - "src/**/*.spec.tsx"
  - "**/*.test.js"
  - "**/*.spec.js"
  - "**/*.test.ts"
  - "**/*.spec.ts"
  - "**/*.test.tsx"
  - "**/*.spec.tsx"
  - "**/__tests__/**"
---

# Testing

This directory contains comprehensive guidelines and best practices for testing JavaScript and TypeScript applications.

## Testing Types

### Unit Testing

#### ✅ Good Examples
```javascript
// Test one unit in isolation
describe('calculateTotalPrice', () => {
  it('should calculate total with tax', () => {
    const result = calculateTotalPrice(100, 0.08);
    expect(result).toBe(108);
  });

  it('should handle zero tax rate', () => {
    const result = calculateTotalPrice(50, 0);
    expect(result).toBe(50);
  });
});

// Mock external dependencies
describe('UserService', () => {
  let userService;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn()
    };
    userService = new UserService(mockRepository);
  });

  it('should create user with valid data', async () => {
    const userData = { name: 'John', email: 'john@example.com' };
    mockRepository.save.mockResolvedValue({ id: 1, ...userData });

    const result = await userService.createUser(userData);

    expect(mockRepository.save).toHaveBeenCalledWith(expect.any(User));
    expect(result.name).toBe('John');
  });
});
```

#### ❌ Bad Examples
```javascript
// Testing multiple units together
describe('processOrder', () => {
  it('should process order', async () => {
    // Tests database, email, logging all together
    const result = await processOrder(orderData);
    expect(result).toBeDefined();
  });
});

// No mocking of external dependencies
describe('EmailService', () => {
  it('should send email', async () => {
    const emailService = new EmailService();
    // Actually sends email in test
    await emailService.sendWelcomeEmail(user);
  });
});
```

### Integration Testing

#### ✅ Good Examples
```javascript
// Test component interactions
describe('ShoppingCart Integration', () => {
  let cart;
  let productRepository;

  beforeEach(() => {
    productRepository = new ProductRepository();
    cart = new ShoppingCart(productRepository);
  });

  it('should add product and calculate total', async () => {
    const product = await productRepository.findById('123');
    cart.addItem(product, 2);
    
    const total = cart.calculateTotal();
    expect(total).toBe(product.price * 2);
  });
});

// Test API endpoints
describe('User API', () => {
  it('should create user via API', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'John', email: 'john@example.com' })
      .expect(201);

    expect(response.body.name).toBe('John');
    expect(response.body.email).toBe('john@example.com');
  });
});
```

#### ❌ Bad Examples
```javascript
// Testing too much at once
describe('Full Application Flow', () => {
  it('should handle complete user journey', async () => {
    // Tests registration, login, shopping, checkout, email, database
    // Too broad and slow
  });
});

// No real dependencies
describe('Component', () => {
  it('should render with mocked data', () => {
    // Everything is mocked, not really testing integration
  });
});
```

### End-to-End Testing

#### ✅ Good Examples
```javascript
// Test complete user workflows
describe('User Registration Flow', () => {
  it('should register user and send welcome email', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify email was sent
    const emails = await emailService.getSentEmails();
    expect(emails).toContain('Welcome John Doe!');
  });
});

// Test error scenarios
describe('Login Flow', () => {
  it('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });
});
```

#### ❌ Bad Examples
```javascript
// Testing implementation details
describe('Component E2E', () => {
  it('should have specific DOM structure', async ({ page }) => {
    await page.goto('/component');
    // Testing internal DOM structure instead of user behavior
    await expect(page.locator('.internal-class-name')).toBeVisible();
  });
});

// Too many assertions in one test
describe('Complex Workflow', () => {
  it('should do everything', async ({ page }) => {
    // 20+ assertions in one test
    // Hard to maintain and debug
  });
});
```

## Test Organization

### ✅ Good Examples
```javascript
// Clear test structure
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Test implementation
    });

    it('should throw error for invalid email', async () => {
      // Test implementation
    });

    it('should hash password before saving', async () => {
      // Test implementation
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Test implementation
    });

    it('should return null when not found', async () => {
      // Test implementation
    });
  });
});

// Test utilities and helpers
const createMockUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides
});

const setupUserService = () => {
  const mockRepository = {
    save: jest.fn(),
    findById: jest.fn()
  };
  return {
    service: new UserService(mockRepository),
    mockRepository
  };
};
```

### ❌ Bad Examples
```javascript
// Unclear test structure
describe('User', () => {
  it('should work', async () => {
    // What exactly is being tested?
  });

  it('should handle errors', async () => {
    // Too vague
  });
});

// No test utilities
describe('UserService', () => {
  it('should create user', async () => {
    const mockRepository = {
      save: jest.fn(),
      findById: jest.fn()
    };
    const service = new UserService(mockRepository);
    // Repetitive setup in every test
  });

  it('should get user', async () => {
    const mockRepository = {
      save: jest.fn(),
      findById: jest.fn()
    };
    const service = new UserService(mockRepository);
    // More repetitive setup
  });
});
```

## Testing Tools

### ✅ Good Examples
```javascript
// Jest with proper configuration
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  collectCoverageFrom: [
    'src/**/*.{js,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

// Testing Library for React
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});

// MSW for API mocking
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({ id: 1, name: 'John' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### ❌ Bad Examples
```javascript
// No test configuration
// Basic Jest setup without proper configuration

// Direct DOM manipulation in tests
describe('Component', () => {
  it('should update DOM', () => {
    document.body.innerHTML = '<div id="app"></div>';
    const element = document.getElementById('app');
    element.innerHTML = 'Updated content';
    expect(element.innerHTML).toBe('Updated content');
  });
});

// Testing implementation details
describe('Component', () => {
  it('should call internal method', () => {
    const component = new Component();
    const spy = jest.spyOn(component, 'internalMethod');
    component.publicMethod();
    expect(spy).toHaveBeenCalled();
  });
});
```

## Code Review Checklist

- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] Tests are independent and don't rely on each other
- [ ] Tests use descriptive names that clearly indicate what is being tested
- [ ] Mocks are used appropriately to isolate units under test
- [ ] Both positive and negative scenarios are tested
- [ ] Error scenarios and edge cases are covered
- [ ] Tests are maintainable and easy to understand
- [ ] Test utilities and helpers are used to reduce duplication
- [ ] Test coverage is adequate for critical paths
- [ ] Tests run quickly and provide fast feedback
- [ ] E2E tests focus on user workflows, not implementation details
- [ ] Integration tests verify component interactions
- [ ] Unit tests focus on single units in isolation