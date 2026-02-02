# Testing Tools and Frameworks

## Overview

This document covers popular testing tools and frameworks for JavaScript and TypeScript applications, including setup, configuration, and best practices for each tool.

## Unit Testing Frameworks

### Jest

Jest is a popular JavaScript testing framework with a focus on simplicity and zero configuration.

**✅ Jest Setup and Configuration:**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/jest.setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  snapshotSerializers: ['@emotion/jest/serializer'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};
```

**✅ Jest Test Example:**
```typescript
// src/components/UserCard/UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import UserCard from './UserCard';
import { User } from '../../types';

describe('UserCard Component', () => {
  const mockUser: User = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
  };

  const defaultProps = {
    user: mockUser,
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render user information', () => {
    render(<UserCard {...defaultProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<UserCard {...defaultProps} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockUser.id);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<UserCard {...defaultProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockUser.id);
  });

  it('should not render edit button for non-editable users', () => {
    render(<UserCard {...defaultProps} editable={false} />);
    
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = render(<UserCard {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });
});
```

**✅ Jest Utilities and Helpers:**
```typescript
// src/__tests__/setup/jest.setup.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock external dependencies
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock console methods to reduce noise
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Custom matchers
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },
});
```

### Vitest

Vitest is a modern testing framework built on Vite, offering fast test execution and excellent TypeScript support.

**✅ Vitest Setup and Configuration:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup/vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.d.ts',
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**✅ Vitest Test Example:**
```typescript
// src/components/UserCard/UserCard.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UserCard from './UserCard';
import { User } from '../../types';

describe('UserCard Component', () => {
  const mockUser: User = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
  };

  const defaultProps = {
    user: mockUser,
    onEdit: vi.fn(),
    onDelete: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render user information', () => {
    render(<UserCard {...defaultProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<UserCard {...defaultProps} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockUser.id);
  });

  it('should handle async operations', async () => {
    const asyncProps = {
      ...defaultProps,
      onEdit: vi.fn().mockResolvedValue(undefined)
    };

    render(<UserCard {...asyncProps} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    await expect(asyncProps.onEdit).toHaveBeenCalledWith(mockUser.id);
  });

  it('should match snapshot', () => {
    const { container } = render(<UserCard {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });
});
```

**✅ Vitest Utilities:**
```typescript
// src/__tests__/setup/vitest.setup.ts
import '@testing-library/jest-dom';

// Global test utilities
beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks();
});

// Custom matchers
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },
});
```

### Mocha

Mocha is a flexible testing framework that works well with various assertion libraries.

**✅ Mocha Setup and Configuration:**
```javascript
// mocha.config.js
module.exports = {
  spec: 'src/**/*.test.js',
  recursive: true,
  reporter: 'spec',
  timeout: 5000,
  require: [
    'ts-node/register',
    'tsconfig-paths/register',
    './src/__tests__/setup/mocha.setup.js'
  ],
  parallel: true,
  jobs: 4
};
```

**✅ Mocha Test Example:**
```typescript
// src/services/UserService.test.ts
import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import UserService from './UserService';
import UserRepository from './UserRepository';

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: sinon.SinonStubbedInstance<UserRepository>;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    mockRepository = sandbox.createStubInstance(UserRepository);
    userService = new UserService(mockRepository);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const expectedUser = { id: 'user-1', ...userData };

      mockRepository.save.resolves(expectedUser);

      const result = await userService.createUser(userData);

      expect(result).to.deep.equal(expectedUser);
      expect(mockRepository.save).to.have.been.calledOnceWith(expectedUser);
    });

    it('should throw error for invalid email', async () => {
      const userData = { name: 'John Doe', email: 'invalid-email' };

      await expect(userService.createUser(userData))
        .to.be.rejectedWith('Invalid email format');
    });

    it('should handle database errors', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const dbError = new Error('Database connection failed');

      mockRepository.save.rejects(dbError);

      await expect(userService.createUser(userData))
        .to.be.rejectedWith('Database connection failed');
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const user = { id: 'user-1', name: 'John Doe', email: 'john@example.com' };

      mockRepository.findById.resolves(user);

      const result = await userService.getUserById('user-1');

      expect(result).to.deep.equal(user);
      expect(mockRepository.findById).to.have.been.calledOnceWith('user-1');
    });

    it('should return null for non-existent user', async () => {
      mockRepository.findById.resolves(null);

      const result = await userService.getUserById('non-existent');

      expect(result).to.be.null;
    });
  });
});
```

**✅ Mocha Utilities:**
```typescript
// src/__tests__/setup/mocha.setup.ts
import chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';

// Configure chai
chai.use(sinonChai);
chai.use(chaiAsPromised);
global.expect = chai.expect;

// Global setup
before(() => {
  // Setup code that runs before all tests
});

after(() => {
  // Cleanup code that runs after all tests
});

beforeEach(() => {
  // Setup code that runs before each test
});

afterEach(() => {
  // Cleanup code that runs after each test
});
```

## Integration Testing Tools

### SuperTest

SuperTest is a library for testing HTTP servers, commonly used with Node.js APIs.

**✅ SuperTest Setup and Usage:**
```typescript
// src/__tests__/integration/users.integration.test.ts
import request from 'supertest';
import app from '../../app';
import { TestDataFactory } from '../factories';
import { setupTestDatabase, cleanupTestDatabase } from '../setup/database';

describe('Users API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Clear users table
    await User.deleteMany({});
  });

  describe('POST /api/users', () => {
    it('should create new user', async () => {
      const userData = TestDataFactory.createUser({
        name: 'John Doe',
        email: 'john@example.com'
      });

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'John Doe',
        email: 'john@example.com'
      });
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toHaveLength(2);
      expect(response.body.errors[0].field).toBe('name');
      expect(response.body.errors[1].field).toBe('email');
    });

    it('should return 409 for duplicate email', async () => {
      const userData = TestDataFactory.createUser({
        name: 'John Doe',
        email: 'john@example.com'
      });

      // Create first user
      await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      // Try to create user with same email
      const response = await request(app)
        .post('/api/users')
        .send({
          ...userData,
          name: 'Jane Doe'
        })
        .expect(409);

      expect(response.body.error).toBe('Email already exists');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by id', async () => {
      const user = await User.create(TestDataFactory.createUser());

      const response = await request(app)
        .get(`/api/users/${user.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email
      });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user', async () => {
      const user = await User.create(TestDataFactory.createUser());
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: user.id,
        name: 'Updated Name',
        email: 'updated@example.com'
      });
    });

    it('should return 404 for non-existent user', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put('/api/users/non-existent-id')
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      const user = await User.create(TestDataFactory.createUser());

      await request(app)
        .delete(`/api/users/${user.id}`)
        .expect(204);

      // Verify user is deleted
      const response = await request(app)
        .get(`/api/users/${user.id}`)
        .expect(404);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/users/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });
});
```

### Testing Library

Testing Library provides utilities for testing user interfaces in a way that simulates real user interactions.

**✅ React Testing Library Setup:**
```typescript
// src/__tests__/utils/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  queryClient?: QueryClient;
  theme?: 'light' | 'dark';
}

// Custom render function with providers
export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    initialEntries = ['/'],
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    }),
    theme = 'light',
    ...renderOptions
  } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider initialTheme={theme}>
            {children}
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Custom render for components that need router
export const renderWithRouter = (
  ui: ReactElement,
  { initialEntries = ['/'], ...options }: { initialEntries?: string[] } = {}
) => {
  return renderWithProviders(ui, { initialEntries, ...options });
};

// Custom render for components that need query client
export const renderWithQueryClient = (
  ui: ReactElement,
  { queryClient, ...options }: { queryClient?: QueryClient } = {}
) => {
  return renderWithProviders(ui, { queryClient, ...options });
};

// Re-export everything
export * from '@testing-library/react';
export { renderWithProviders as render };
```

**✅ React Testing Library Example:**
```typescript
// src/components/UserList/UserList.test.tsx
import { render, screen, fireEvent, waitFor } from '../../__tests__/utils/test-utils';
import UserList from './UserList';
import { TestDataFactory } from '../../__tests__/factories';

describe('UserList Component', () => {
  const mockUsers = [
    TestDataFactory.createUser({ name: 'John Doe', email: 'john@example.com' }),
    TestDataFactory.createUser({ name: 'Jane Smith', email: 'jane@example.com' }),
    TestDataFactory.createAdminUser()
  ];

  const defaultProps = {
    users: mockUsers,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onFilter: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all users', () => {
    render(<UserList {...defaultProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('should filter users by name', () => {
    render(<UserList {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('should handle user deletion', async () => {
    render(<UserList {...defaultProps} />);
    
    const deleteButtons = screen.getAllByLabelText('Delete user');
    fireEvent.click(deleteButtons[0]);
    
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockUsers[0].id);
  });

  it('should show loading state', () => {
    render(<UserList {...defaultProps} loading={true} />);
    
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('should show empty state', () => {
    render(<UserList {...defaultProps} users={[]} />);
    
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('should handle pagination', () => {
    const paginatedProps = {
      ...defaultProps,
      pagination: {
        currentPage: 1,
        totalPages: 5,
        onPageChange: jest.fn()
      }
    };

    render(<UserList {...paginatedProps} />);
    
    const nextPageButton = screen.getByLabelText('Next page');
    fireEvent.click(nextPageButton);
    
    expect(paginatedProps.pagination.onPageChange).toHaveBeenCalledWith(2);
  });
});
```

## End-to-End Testing Tools

### Playwright

Playwright is a modern E2E testing framework that supports multiple browsers and provides reliable cross-browser testing.

**✅ Playwright Setup and Configuration:**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**✅ Playwright Test Example:**
```typescript
// tests/e2e/user-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test('should complete full registration journey', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');
    
    // Verify page title
    await expect(page).toHaveTitle(/Register/);
    
    // Fill registration form
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john.doe@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
    
    // Submit form
    await page.click('[data-testid="register-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Registration successful');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/register');
    
    // Fill with invalid data
    await page.fill('[data-testid="name-input"]', '');
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', '123');
    await page.fill('[data-testid="confirm-password-input"]', '456');
    
    // Submit form
    await page.click('[data-testid="register-button"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible();
  });

  test('should handle email verification', async ({ page }) => {
    await page.goto('/register');
    
    // Register user
    await page.fill('[data-testid="name-input"]', 'Jane Doe');
    await page.fill('[data-testid="email-input"]', 'jane.doe@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
    await page.click('[data-testid="register-button"]');
    
    // Verify email verification message
    await expect(page.locator('[data-testid="verification-message"]')).toBeVisible();
    
    // Simulate email verification (in real scenario, this would be done via email)
    const verificationToken = 'mock-verification-token';
    await page.goto(`/verify-email?token=${verificationToken}`);
    
    // Verify verification success
    await expect(page.locator('[data-testid="verification-success"]')).toBeVisible();
  });
});

test.describe('Shopping Cart Flow', () => {
  test('should complete purchase flow', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Browse products
    await page.goto('/products');
    await page.click('[data-testid="category-electronics"]');
    
    // Add product to cart
    await page.click('[data-testid="product-macbook-pro"]');
    await page.selectOption('[data-testid="memory-select"]', '16GB');
    await page.selectOption('[data-testid="storage-select"]', '512GB');
    await page.click('[data-testid="add-to-cart-button"]');
    
    // Verify cart notification
    await expect(page.locator('[data-testid="cart-notification"]')).toBeVisible();
    
    // Go to cart
    await page.click('[data-testid="cart-icon"]');
    
    // Verify cart contents
    await expect(page.locator('[data-testid="cart-items"]')).toContainText('MacBook Pro');
    
    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]');
    
    // Fill checkout form
    await page.fill('[data-testid="shipping-name"]', 'John Doe');
    await page.fill('[data-testid="shipping-address"]', '123 Main St');
    await page.fill('[data-testid="shipping-city"]', 'Anytown');
    await page.selectOption('[data-testid="shipping-country"]', 'US');
    await page.fill('[data-testid="shipping-zip"]', '12345');
    
    await page.fill('[data-testid="card-number"]', '4532015112830366');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvv"]', '123');
    await page.fill('[data-testid="card-name"]', 'John Doe');
    
    // Place order
    await page.click('[data-testid="place-order-button"]');
    
    // Verify order confirmation
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  });
});
```

**✅ Playwright Utilities:**
```typescript
// tests/e2e/utils/test-helpers.ts
import { Page, Locator } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  async loginUser(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
    await this.page.waitForURL('/dashboard');
  }

  async createTestUser(userData: { name: string; email: string; password: string }) {
    await this.page.goto('/register');
    await this.page.fill('[data-testid="name-input"]', userData.name);
    await this.page.fill('[data-testid="email-input"]', userData.email);
    await this.page.fill('[data-testid="password-input"]', userData.password);
    await this.page.fill('[data-testid="confirm-password-input"]', userData.password);
    await this.page.click('[data-testid="register-button"]');
    await this.page.waitForSelector('[data-testid="success-message"]');
  }

  async waitForElementToBeVisible(selector: string, timeout = 5000): Promise<Locator> {
    return await this.page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  async waitForElementToBeHidden(selector: string, timeout = 5000): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'hidden', timeout });
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  async mockApiResponse(url: string, response: any): Promise<void> {
    await this.page.route(url, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }
}
```

### Cypress

Cypress is another popular E2E testing framework known for its developer experience and debugging capabilities.

**✅ Cypress Setup and Configuration:**
```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
});
```

**✅ Cypress Test Example:**
```javascript
// cypress/e2e/user-flow.cy.js
describe('User Registration Flow', () => {
  it('should complete full registration journey', () => {
    // Navigate to registration page
    cy.visit('/register');
    
    // Verify page title
    cy.title().should('include', 'Register');
    
    // Fill registration form
    cy.get('[data-testid="name-input"]').type('John Doe');
    cy.get('[data-testid="email-input"]').type('john.doe@example.com');
    cy.get('[data-testid="password-input"]').type('SecurePassword123!');
    cy.get('[data-testid="confirm-password-input"]').type('SecurePassword123!');
    
    // Submit form
    cy.get('[data-testid="register-button"]').click();
    
    // Verify success message
    cy.get('[data-testid="success-message"]').should('be.visible');
    cy.get('[data-testid="success-message"]').should('contain.text', 'Registration successful');
    
    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should show validation errors for invalid input', () => {
    cy.visit('/register');
    
    // Fill with invalid data
    cy.get('[data-testid="name-input"]').clear();
    cy.get('[data-testid="email-input"]').type('invalid-email');
    cy.get('[data-testid="password-input"]').type('123');
    cy.get('[data-testid="confirm-password-input"]').type('456');
    
    // Submit form
    cy.get('[data-testid="register-button"]').click();
    
    // Verify validation errors
    cy.get('[data-testid="name-error"]').should('be.visible');
    cy.get('[data-testid="email-error"]').should('be.visible');
    cy.get('[data-testid="password-error"]').should('be.visible');
    cy.get('[data-testid="confirm-password-error"]').should('be.visible');
  });
});

describe('Shopping Cart Flow', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('user@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should complete purchase flow', () => {
    // Browse products
    cy.visit('/products');
    cy.get('[data-testid="category-electronics"]').click();
    
    // Add product to cart
    cy.get('[data-testid="product-macbook-pro"]').click();
    cy.get('[data-testid="memory-select"]').select('16GB');
    cy.get('[data-testid="storage-select"]').select('512GB');
    cy.get('[data-testid="add-to-cart-button"]').click();
    
    // Verify cart notification
    cy.get('[data-testid="cart-notification"]').should('be.visible');
    
    // Go to cart
    cy.get('[data-testid="cart-icon"]').click();
    
    // Verify cart contents
    cy.get('[data-testid="cart-items"]').should('contain.text', 'MacBook Pro');
    
    // Proceed to checkout
    cy.get('[data-testid="checkout-button"]').click();
    
    // Fill checkout form
    cy.get('[data-testid="shipping-name"]').type('John Doe');
    cy.get('[data-testid="shipping-address"]').type('123 Main St');
    cy.get('[data-testid="shipping-city"]').type('Anytown');
    cy.get('[data-testid="shipping-country"]').select('US');
    cy.get('[data-testid="shipping-zip"]').type('12345');
    
    cy.get('[data-testid="card-number"]').type('4532015112830366');
    cy.get('[data-testid="card-expiry"]').type('12/25');
    cy.get('[data-testid="card-cvv"]').type('123');
    cy.get('[data-testid="card-name"]').type('John Doe');
    
    // Place order
    cy.get('[data-testid="place-order-button"]').click();
    
    // Verify order confirmation
    cy.get('[data-testid="order-confirmation"]').should('be.visible');
    cy.get('[data-testid="order-number"]').should('be.visible');
  });
});
```

**✅ Cypress Utilities:**
```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('createUser', (userData) => {
  cy.visit('/register');
  cy.get('[data-testid="name-input"]').type(userData.name);
  cy.get('[data-testid="email-input"]').type(userData.email);
  cy.get('[data-testid="password-input"]').type(userData.password);
  cy.get('[data-testid="confirm-password-input"]').type(userData.password);
  cy.get('[data-testid="register-button"]').click();
  cy.get('[data-testid="success-message"]').should('be.visible');
});

Cypress.Commands.add('mockApiResponse', (url, response) => {
  cy.intercept('GET', url, response).as('apiRequest');
});

Cypress.Commands.add('waitForElement', (selector) => {
  cy.get(selector, { timeout: 10000 }).should('be.visible');
});

// Custom assertions
Cypress.Commands.add('haveValidationError', (field, message) => {
  cy.get(`[data-testid="${field}-error"]`).should('contain.text', message);
});

Cypress.Commands.add('haveSuccessMessage', (message) => {
  cy.get('[data-testid="success-message"]').should('contain.text', message);
});
```

## Mocking and Stubbing Tools

### Jest Mocking

Jest provides built-in mocking capabilities for functions, modules, and timers.

**✅ Jest Mocking Examples:**
```typescript
// src/services/UserService.test.ts
import UserService from './UserService';
import UserRepository from './UserRepository';

describe('UserService with Mocks', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn()
    };

    userService = new UserService(mockRepository);
  });

  describe('createUser', () => {
    it('should create user and return result', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const mockResult = { id: 'user-1', ...userData };

      // Mock the save method
      mockRepository.save.mockResolvedValue(mockResult);

      const result = await userService.createUser(userData);

      expect(result).toEqual(mockResult);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining(userData));
    });

    it('should handle database errors', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const dbError = new Error('Database connection failed');

      // Mock the save method to throw error
      mockRepository.save.mockRejectedValue(dbError);

      await expect(userService.createUser(userData))
        .rejects
        .toThrow('Database connection failed');
    });

    it('should validate email before saving', async () => {
      const userData = { name: 'John Doe', email: 'invalid-email' };

      await expect(userService.createUser(userData))
        .rejects
        .toThrow('Invalid email format');

      // Verify save was not called
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user from repository', async () => {
      const user = { id: 'user-1', name: 'John Doe', email: 'john@example.com' };

      mockRepository.findById.mockResolvedValue(user);

      const result = await userService.getUserById('user-1');

      expect(result).toEqual(user);
      expect(mockRepository.findById).toHaveBeenCalledWith('user-1');
    });

    it('should return null for non-existent user', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await userService.getUserById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update existing user', async () => {
      const userId = 'user-1';
      const updateData = { name: 'Updated Name', email: 'updated@example.com' };
      const existingUser = { id: userId, name: 'John Doe', email: 'john@example.com' };
      const updatedUser = { ...existingUser, ...updateData };

      mockRepository.findById.mockResolvedValue(existingUser);
      mockRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(userId, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.update).toHaveBeenCalledWith(userId, updateData);
    });

    it('should throw error for non-existent user', async () => {
      const userId = 'non-existent';
      const updateData = { name: 'Updated Name' };

      mockRepository.findById.mockResolvedValue(null);

      await expect(userService.updateUser(userId, updateData))
        .rejects
        .toThrow('User not found');
    });
  });
});
```

**✅ Jest Timer Mocking:**
```typescript
// src/services/NotificationService.test.ts
import NotificationService from './NotificationService';

describe('NotificationService with Timer Mocks', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should send notification after delay', async () => {
    const mockSend = jest.fn();
    notificationService.send = mockSend;

    notificationService.scheduleNotification('user-1', 'Test message', 5000);

    // Fast forward time
    jest.advanceTimersByTime(5000);

    expect(mockSend).toHaveBeenCalledWith('user-1', 'Test message');
  });

  it('should handle multiple scheduled notifications', () => {
    const mockSend = jest.fn();
    notificationService.send = mockSend;

    notificationService.scheduleNotification('user-1', 'Message 1', 1000);
    notificationService.scheduleNotification('user-2', 'Message 2', 2000);
    notificationService.scheduleNotification('user-3', 'Message 3', 3000);

    // Fast forward to first notification
    jest.advanceTimersByTime(1000);
    expect(mockSend).toHaveBeenCalledWith('user-1', 'Message 1');

    // Fast forward to second notification
    jest.advanceTimersByTime(1000);
    expect(mockSend).toHaveBeenCalledWith('user-2', 'Message 2');

    // Fast forward to third notification
    jest.advanceTimersByTime(1000);
    expect(mockSend).toHaveBeenCalledWith('user-3', 'Message 3');
  });

  it('should cancel scheduled notification', () => {
    const mockSend = jest.fn();
    notificationService.send = mockSend;

    const notificationId = notificationService.scheduleNotification('user-1', 'Test message', 5000);

    // Cancel notification
    notificationService.cancelNotification(notificationId);

    // Fast forward time
    jest.advanceTimersByTime(5000);

    // Notification should not be sent
    expect(mockSend).not.toHaveBeenCalled();
  });
});
```

### MSW (Mock Service Worker)

MSW is a library for mocking HTTP requests in both testing and development environments.

**✅ MSW Setup and Usage:**
```typescript
// src/__tests__/__mocks__/server.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock handlers
const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ])
    );
  }),

  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({ id, name: 'Test User', email: 'test@example.com' })
    );
  }),

  rest.post('/api/users', async (req, res, ctx) => {
    const userData = await req.json();
    return res(
      ctx.status(201),
      ctx.json({ id: 'new-user-id', ...userData })
    );
  }),

  rest.put('/api/users/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const updateData = await req.json();
    return res(
      ctx.status(200),
      ctx.json({ id, ...updateData })
    );
  }),

  rest.delete('/api/users/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  // Error handlers
  rest.get('/api/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ error: 'Internal server error' })
    );
  }),

  // Delayed responses
  rest.get('/api/slow', (req, res, ctx) => {
    return res(
      ctx.delay(2000),
      ctx.json({ message: 'This was slow' })
    );
  })
];

// Setup server
export const server = setupServer(...handlers);
```

**✅ MSW Test Example:**
```typescript
// src/services/UserService.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '../../__tests__/__mocks__/server';
import UserService from './UserService';
import UserList from '../components/UserList';

describe('UserService with MSW', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should fetch users from API', async () => {
    const userService = new UserService();

    const users = await userService.getUsers();

    expect(users).toHaveLength(2);
    expect(users[0]).toEqual({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    });
  });

  it('should handle API errors', async () => {
    // Override handler to return error
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Server error' })
        );
      })
    );

    const userService = new UserService();

    await expect(userService.getUsers())
      .rejects
      .toThrow('Server error');
  });

  it('should handle slow responses', async () => {
    const { getByText } = render(<UserList />);

    // Should show loading state initially
    expect(getByText('Loading users...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

**✅ MSW Component Testing:**
```typescript
// src/components/UserList/UserList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import UserList from './UserList';
import { server } from '../../__tests__/__mocks__/server';

describe('UserList with MSW', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should display users from API', async () => {
    render(<UserList />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should handle empty response', async () => {
    // Override handler to return empty array
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    // Override handler to return error
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Server error' })
        );
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('Error loading users')).toBeInTheDocument();
    });
  });
});
```

## Performance Testing Tools

### Lighthouse CI

Lighthouse CI is a tool for automated performance testing and monitoring.

**✅ Lighthouse CI Setup:**
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000', 'http://localhost:3000/dashboard'],
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
        
        // Specific performance metrics
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // Resource assertions
        'resource-summary:document:count': ['error', { maxNumericValue: 1 }],
        'resource-summary:script:count': ['warn', { maxNumericValue: 10 }],
        'resource-summary:stylesheet:count': ['warn', { maxNumericValue: 5 }],
        
        // Best practice assertions
        'uses-responsive-images': 'error',
        'efficient-animated-content': 'error',
        'modern-image-formats': 'error',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

**✅ Performance Testing Script:**
```javascript
// scripts/performance-test.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runPerformanceTest(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options);

  // `.lhr` is the Lighthouse Result
  const lhr = runnerResult.lhr;

  // `.report` is the HTML report as a string
  const reportHtml = runnerResult.report;

  // `.artifacts` contains the raw artifacts used by Lighthouse to generate the result
  const artifacts = runnerResult.artifacts;

  // `.fullReport` contains the HTML report along with all required assets to display it
  const { html, css, js } = runnerResult.fullReport;

  // Print the results
  console.log('Performance Score:', lhr.categories.performance.score);
  console.log('Accessibility Score:', lhr.categories.accessibility.score);
  console.log('Best Practices Score:', lhr.categories['best-practices'].score);
  console.log('SEO Score:', lhr.categories.seo.score);

  // Print specific metrics
  console.log('\nPerformance Metrics:');
  console.log('First Contentful Paint:', lhr.audits['first-contentful-paint'].numericValue);
  console.log('Largest Contentful Paint:', lhr.audits['largest-contentful-paint'].numericValue);
  console.log('Cumulative Layout Shift:', lhr.audits['cumulative-layout-shift'].numericValue);
  console.log('Total Blocking Time:', lhr.audits['total-blocking-time'].numericValue);

  await chrome.kill();
  
  return lhr;
}

// Run performance test
runPerformanceTest('http://localhost:3000')
  .then(result => {
    console.log('\nPerformance test completed successfully');
  })
  .catch(error => {
    console.error('Performance test failed:', error);
    process.exit(1);
  });
```

### WebPageTest API

WebPageTest provides real-world performance testing across different locations and devices.

**✅ WebPageTest Integration:**
```javascript
// scripts/webpagetest.js
const WebPageTest = require('webpagetest');

async function runWebPageTest(url) {
  const wpt = new WebPageTest('your-webpagetest-server', 'your-api-key');

  const options = {
    runs: 3,
    location: 'Dulles:Chrome',
    connectivity: 'Cable',
    firstViewOnly: false,
    video: true,
    timeline: true,
    chromeTrace: true
  };

  try {
    const testResult = await wpt.runTest(url, options);
    console.log('Test ID:', testResult.data.testId);
    
    // Wait for test completion
    const results = await wpt.getTestResults(testResult.data.testId);
    
    console.log('Performance Results:');
    console.log('First View Load Time:', results.data.median.firstView.loadTime);
    console.log('First View Speed Index:', results.data.median.firstView.speedIndex);
    console.log('First View TTFB:', results.data.median.firstView.TTFB);
    
    console.log('Repeat View Results:');
    console.log('Load Time:', results.data.median.repeatView.loadTime);
    console.log('Speed Index:', results.data.median.repeatView.speedIndex);
    
    return results;
  } catch (error) {
    console.error('WebPageTest failed:', error);
    throw error;
  }
}

// Run WebPageTest
runWebPageTest('http://localhost:3000')
  .then(results => {
    console.log('WebPageTest completed successfully');
  })
  .catch(error => {
    console.error('WebPageTest failed:', error);
    process.exit(1);
  });
```

## Best Practices Summary

### 1. Choose the Right Tool
- **Unit Tests**: Jest, Vitest, Mocha
- **Integration Tests**: SuperTest, Testing Library
- **E2E Tests**: Playwright, Cypress
- **Performance Tests**: Lighthouse CI, WebPageTest
- **Mocking**: Jest mocks, MSW

### 2. Configuration Best Practices
- Use appropriate test environments (jsdom for React, node for APIs)
- Configure proper timeouts for different test types
- Set up coverage thresholds and reporting
- Use parallel execution for faster test runs

### 3. Test Organization
- Mirror source code structure in test organization
- Use consistent naming conventions
- Separate different test types (unit, integration, e2e)
- Create reusable test utilities and helpers

### 4. Mocking Strategies
- Mock external dependencies to isolate units under test
- Use realistic mock data that matches production
- Mock timers for testing time-dependent functionality
- Use MSW for API mocking in both tests and development

### 5. Performance Considerations
- Run tests in parallel when possible
- Use appropriate timeouts
- Mock slow operations in unit tests
- Use headless browsers for E2E tests in CI

### 6. CI/CD Integration
- Run different test suites in parallel
- Use appropriate test environments
- Generate coverage reports
- Fail builds on test failures
- Run performance tests regularly

## Examples in Context

### React Application with Multiple Test Types
```typescript
// src/__tests__/setup/jest.setup.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

configure({ testIdAttribute: 'data-testid' });

// Mock external dependencies
jest.mock('./__mocks__/api-client');
jest.mock('./__mocks__/logger');

// Global test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  ...overrides
});
```

### Node.js API with Integration Tests
```typescript
// src/__tests__/integration/app.integration.test.ts
import request from 'supertest';
import app from '../../app';
import { setupTestDatabase, cleanupTestDatabase } from '../setup/database';

describe('Application Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number)
      });
    });
  });

  describe('API Routes', () => {
    it('should handle CORS', async () => {
      const response = await request(app)
        .options('/api/users')
        .set('Origin', 'http://localhost:3000')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should handle rate limiting', async () => {
      // Make multiple requests rapidly
      const requests = Array(10).fill(null).map(() => 
        request(app).get('/api/users')
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
```

### Vue.js Application with Component Tests
```typescript
// src/components/__tests__/UserProfile.spec.ts
import { mount, VueWrapper } from '@vue/test-utils';
import UserProfile from '../UserProfile.vue';
import { createMockUser } from '../../__tests__/utils/test-utils';

describe('UserProfile Component', () => {
  let wrapper: VueWrapper<any>;

  const createWrapper = (props = {}) => {
    const defaultProps = {
      user: createMockUser(),
      editable: true,
      ...props
    };

    wrapper = mount(UserProfile, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key: string) => key // Mock i18n
        }
      }
    });
  };

  afterEach(() => {
    wrapper.unmount();
  });

  it('should display user information', () => {
    const user = createMockUser({
      name: 'John Doe',
      email: 'john@example.com'
    });

    createWrapper({ user });

    expect(wrapper.text()).toContain('John Doe');
    expect(wrapper.text()).toContain('john@example.com');
  });

  it('should emit edit event when edit button is clicked', async () => {
    createWrapper();

    const editButton = wrapper.find('[data-testid="edit-button"]');
    await editButton.trigger('click');

    expect(wrapper.emitted('edit')).toBeTruthy();
  });

  it('should show edit form when in edit mode', async () => {
    createWrapper();

    const editButton = wrapper.find('[data-testid="edit-button"]');
    await editButton.trigger('click');

    expect(wrapper.find('[data-testid="edit-form"]').exists()).toBe(true);
  });
});
```

Remember: The choice of testing tools should align with your project's needs, team expertise, and testing requirements. Invest time in proper setup and configuration to ensure reliable and maintainable tests.