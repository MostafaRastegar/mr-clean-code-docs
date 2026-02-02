# End-to-End Testing

## Overview

End-to-end (E2E) testing focuses on testing complete user workflows from start to finish, simulating real user interactions with your application. This document covers best practices for writing effective E2E tests in JavaScript and TypeScript applications.

## Core Principles

### 1. Test Complete User Workflows

E2E tests should simulate real user scenarios and test the entire application flow.

**✅ Good E2E Test:**
```javascript
describe('User Registration and Onboarding Flow', () => {
  beforeEach(async () => {
    // Start with a clean state
    await page.goto('/register');
  });

  it('should complete full user registration and onboarding', async () => {
    // Step 1: User registration
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john.doe@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
    
    await page.click('[data-testid="register-button"]');
    
    // Verify registration success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Registration successful');

    // Step 2: Email verification
    const verificationEmail = await emailService.getLatestEmail('john.doe@example.com');
    const verificationLink = extractVerificationLink(verificationEmail.body);
    
    await page.goto(verificationLink);
    await expect(page.locator('[data-testid="verification-success"]')).toBeVisible();

    // Step 3: Profile setup
    await page.fill('[data-testid="profile-name"]', 'John Doe');
    await page.fill('[data-testid="profile-bio"]', 'Software developer passionate about clean code');
    await page.selectOption('[data-testid="profile-country"]', 'US');
    
    await page.click('[data-testid="save-profile-button"]');
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();

    // Step 4: First task completion
    await page.click('[data-testid="dashboard-nav"]');
    await page.click('[data-testid="first-task-button"]');
    
    await page.fill('[data-testid="task-input"]', 'Complete initial setup');
    await page.click('[data-testid="submit-task-button"]');
    
    await expect(page.locator('[data-testid="task-completed"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-completed"]')).toContainText('Task completed successfully');

    // Step 5: Verify final state
    await page.click('[data-testid="profile-nav"]');
    const profileName = await page.textContent('[data-testid="display-name"]');
    expect(profileName).toBe('John Doe');
    
    const taskCount = await page.textContent('[data-testid="completed-tasks-count"]');
    expect(taskCount).toBe('1');
  });
});
```

**❌ Bad E2E Test:**
```javascript
describe('User Registration', () => {
  it('should test individual form fields', async () => {
    // Testing individual components - this is more like unit/integration testing
    await page.goto('/register');
    
    // Test name field
    await page.fill('[data-testid="name-input"]', 'John');
    await expect(page.locator('[data-testid="name-input"]')).toHaveValue('John');
    
    // Test email field
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    await expect(page.locator('[data-testid="email-input"]')).toHaveValue('john@example.com');
    
    // Test password field
    await page.fill('[data-testid="password-input"]', 'password123');
    await expect(page.locator('[data-testid="password-input"]')).toHaveValue('password123');
    
    // This doesn't test a complete user workflow
  });
});
```

### 2. Use Real User Scenarios

Base your E2E tests on actual user journeys and business requirements.

**✅ Real User Scenarios:**
```javascript
describe('E-commerce Checkout Flow', () => {
  it('should complete purchase from product browsing to order confirmation', async () => {
    // Scenario: User wants to buy a laptop
    // 1. Browse products
    await page.goto('/products');
    await page.click('[data-testid="category-electronics"]');
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    
    // 2. Search for specific product
    await page.fill('[data-testid="search-input"]', 'MacBook Pro');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // 3. View product details
    await page.click('[data-testid="product-macbook-pro"]');
    await expect(page.locator('[data-testid="product-title"]')).toContainText('MacBook Pro');
    
    // 4. Select configuration
    await page.selectOption('[data-testid="memory-select"]', '16GB');
    await page.selectOption('[data-testid="storage-select"]', '512GB');
    
    // 5. Add to cart
    await page.click('[data-testid="add-to-cart-button"]');
    await expect(page.locator('[data-testid="cart-notification"]')).toContainText('Added to cart');
    
    // 6. View cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page.locator('[data-testid="cart-items"]')).toContainText('MacBook Pro');
    
    // 7. Proceed to checkout
    await page.click('[data-testid="checkout-button"]');
    
    // 8. Fill shipping information
    await page.fill('[data-testid="shipping-name"]', 'John Doe');
    await page.fill('[data-testid="shipping-address"]', '123 Main St');
    await page.fill('[data-testid="shipping-city"]', 'Anytown');
    await page.selectOption('[data-testid="shipping-country"]', 'US');
    await page.fill('[data-testid="shipping-zip"]', '12345');
    
    // 9. Select shipping method
    await page.click('[data-testid="shipping-standard"]');
    
    // 10. Enter payment information
    await page.fill('[data-testid="card-number"]', '4532015112830366');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvv"]', '123');
    await page.fill('[data-testid="card-name"]', 'John Doe');
    
    // 11. Review order
    await expect(page.locator('[data-testid="order-summary"]')).toContainText('MacBook Pro');
    await expect(page.locator('[data-testid="order-total"]')).toContainText('$2,499.99');
    
    // 12. Place order
    await page.click('[data-testid="place-order-button"]');
    
    // 13. Verify order confirmation
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    
    // 14. Verify email notification
    const orderEmail = await emailService.getLatestEmail('john.doe@example.com');
    expect(orderEmail.subject).toContain('Order Confirmation');
    expect(orderEmail.body).toContain('MacBook Pro');
  });

  it('should handle out-of-stock scenario gracefully', async () => {
    // Scenario: User tries to buy an out-of-stock item
    await page.goto('/products');
    await page.click('[data-testid="product-out-of-stock"]');
    
    await expect(page.locator('[data-testid="out-of-stock-message"]')).toBeVisible();
    
    // Try to add to cart
    await page.click('[data-testid="add-to-cart-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Item is out of stock');
    
    // Verify user can still browse other products
    await page.click('[data-testid="continue-shopping-button"]');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
  });
});
```

**❌ Artificial Scenarios:**
```javascript
describe('E-commerce Tests', () => {
  it('should test all form fields individually', async () => {
    // This doesn't represent a real user scenario
    await page.goto('/checkout');
    
    // Test each field separately
    await page.fill('[data-testid="shipping-name"]', 'John');
    await page.fill('[data-testid="shipping-name"]', 'Doe');
    await page.fill('[data-testid="shipping-name"]', 'John Doe');
    
    await page.fill('[data-testid="shipping-address"]', '123');
    await page.fill('[data-testid="shipping-address"]', 'Main');
    await page.fill('[data-testid="shipping-address"]', '123 Main St');
    
    // This is testing implementation details, not user workflows
  });
});
```

### 3. Test Error Scenarios and Edge Cases

Include tests for error conditions and edge cases that users might encounter.

**✅ Error Scenario Testing:**
```javascript
describe('Error Handling in User Workflows', () => {
  it('should handle network errors during checkout gracefully', async () => {
    // Mock network failure
    await page.route('**/api/payment/process', route => {
      route.abort('connectionfailed');
    });

    await page.goto('/checkout');
    await page.fill('[data-testid="card-number"]', '4532015112830366');
    
    await page.click('[data-testid="place-order-button"]');
    
    // Verify error handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Network error');
    
    // Verify user can retry
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();
  });

  it('should handle invalid payment information', async () => {
    await page.goto('/checkout');
    
    // Invalid card number
    await page.fill('[data-testid="card-number"]', '1234567890123456');
    await page.fill('[data-testid="card-expiry"]', '12/20');
    await page.fill('[data-testid="card-cvv"]', '12');
    
    await page.click('[data-testid="place-order-button"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="card-number-error"]')).toContainText('Invalid card number');
    await expect(page.locator('[data-testid="expiry-error"]')).toContainText('Card has expired');
    await expect(page.locator('[data-testid="cvv-error"]')).toContainText('Invalid CVV');
    
    // Verify form doesn't submit with errors
    await expect(page.locator('[data-testid="processing-spinner"]')).not.toBeVisible();
  });

  it('should handle session timeout during long workflows', async () => {
    await page.goto('/complex-workflow');
    
    // Start a long workflow
    await page.fill('[data-testid="step1-input"]', 'data');
    await page.click('[data-testid="next-button"]');
    
    // Simulate session timeout
    await page.evaluate(() => {
      localStorage.removeItem('authToken');
      document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    });
    
    // Try to continue workflow
    await page.fill('[data-testid="step2-input"]', 'more data');
    await page.click('[data-testid="submit-button"]');
    
    // Verify redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="session-timeout-message"]')).toBeVisible();
    
    // Verify user can log back in and resume
    await page.fill('[data-testid="login-email"]', 'user@example.com');
    await page.fill('[data-testid="login-password"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Should redirect back to workflow
    await expect(page).toHaveURL('/complex-workflow');
  });

  it('should handle browser back button during critical operations', async () => {
    await page.goto('/payment');
    await page.fill('[data-testid="card-number"]', '4532015112830366');
    
    // Navigate away before submitting
    await page.goBack();
    
    // Verify user doesn't lose data unexpectedly
    await page.goForward();
    await expect(page.locator('[data-testid="card-number"]')).toHaveValue('4532015112830366');
    
    // Verify workflow can be completed
    await page.click('[data-testid="place-order-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

**❌ Missing Error Scenarios:**
```javascript
describe('Happy Path Only', () => {
  it('should test successful workflows only', async () => {
    // Only testing the ideal scenario
    await page.goto('/checkout');
    await page.fill('[data-testid="card-number"]', '4532015112830366');
    await page.click('[data-testid="place-order-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Missing error scenarios, edge cases, and failure modes
  });
});
```

## TypeScript-Specific Considerations

### 1. Type-Safe Page Objects

Use TypeScript to create type-safe page objects and element locators.

**✅ Type-Safe Page Objects:**
```typescript
interface UserRegistrationPageElements {
  nameInput: string;
  emailInput: string;
  passwordInput: string;
  confirmPasswordInput: string;
  registerButton: string;
  successMessage: string;
  errorMessage: string;
}

class UserRegistrationPage {
  private readonly elements: UserRegistrationPageElements = {
    nameInput: '[data-testid="name-input"]',
    emailInput: '[data-testid="email-input"]',
    passwordInput: '[data-testid="password-input"]',
    confirmPasswordInput: '[data-testid="confirm-password-input"]',
    registerButton: '[data-testid="register-button"]',
    successMessage: '[data-testid="success-message"]',
    errorMessage: '[data-testid="error-message"]'
  };

  constructor(private page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto('/register');
  }

  async fillRegistrationForm(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<void> {
    await this.page.fill(this.elements.nameInput, userData.name);
    await this.page.fill(this.elements.emailInput, userData.email);
    await this.page.fill(this.elements.passwordInput, userData.password);
    await this.page.fill(this.elements.confirmPasswordInput, userData.password);
  }

  async submitForm(): Promise<void> {
    await this.page.click(this.elements.registerButton);
  }

  async getSuccessMessage(): Promise<string> {
    await expect(this.page.locator(this.elements.successMessage)).toBeVisible();
    return await this.page.textContent(this.elements.successMessage) || '';
  }

  async getErrorMessage(): Promise<string> {
    await expect(this.page.locator(this.elements.errorMessage)).toBeVisible();
    return await this.page.textContent(this.elements.errorMessage) || '';
  }

  async isRegistrationSuccessful(): Promise<boolean> {
    try {
      await expect(this.page.locator(this.elements.successMessage)).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

// Usage in tests
describe('User Registration E2E', () => {
  let registrationPage: UserRegistrationPage;

  beforeEach(async () => {
    registrationPage = new UserRegistrationPage(page);
    await registrationPage.navigate();
  });

  it('should register user successfully', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'SecurePassword123!'
    };

    await registrationPage.fillRegistrationForm(userData);
    await registrationPage.submitForm();

    const success = await registrationPage.isRegistrationSuccessful();
    expect(success).toBe(true);

    const message = await registrationPage.getSuccessMessage();
    expect(message).toContain('Registration successful');
  });

  it('should handle validation errors', async () => {
    const invalidUserData = {
      name: '',
      email: 'invalid-email',
      password: '123'
    };

    await registrationPage.fillRegistrationForm(invalidUserData);
    await registrationPage.submitForm();

    const error = await registrationPage.getErrorMessage();
    expect(error).toContain('Please check your input');
  });
});
```

**❌ Non-Type-Safe Page Objects:**
```typescript
class UserRegistrationPage {
  constructor(private page: any) {} // No type safety

  async navigate(): Promise<void> {
    await this.page.goto('/register');
  }

  async fillForm(name: any, email: any, password: any): Promise<void> {
    // No type checking for parameters
    await this.page.fill('[data-testid="name-input"]', name);
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
  }

  async submit(): Promise<void> {
    await this.page.click('[data-testid="register-button"]');
  }
}
```

### 2. Type-Safe Test Data

Use TypeScript interfaces to define and validate test data structures.

**✅ Type-Safe Test Data:**
```typescript
interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface ProductData {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

interface CheckoutData {
  shipping: {
    name: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
  };
  payment: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };
  items: ProductData[];
}

class TestDataFactory {
  static createUserRegistrationData(overrides: Partial<UserRegistrationData> = {}): UserRegistrationData {
    return {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'SecurePassword123!',
      ...overrides
    };
  }

  static createProductData(overrides: Partial<ProductData> = {}): ProductData {
    return {
      id: 'prod-123',
      name: 'Test Product',
      price: 99.99,
      category: 'electronics',
      inStock: true,
      ...overrides
    };
  }

  static createCheckoutData(overrides: Partial<CheckoutData> = {}): CheckoutData {
    return {
      shipping: {
        name: 'John Doe',
        address: '123 Main St',
        city: 'Anytown',
        country: 'US',
        zipCode: '12345'
      },
      payment: {
        cardNumber: '4532015112830366',
        expiryDate: '12/25',
        cvv: '123',
        cardholderName: 'John Doe'
      },
      items: [this.createProductData()],
      ...overrides
    };
  }

  static createInvalidUserRegistrationData(): UserRegistrationData {
    return {
      name: '',
      email: 'invalid-email',
      password: '123'
    };
  }
}

// Usage in tests
describe('E2E Tests with Type Safety', () => {
  it('should register user with valid data', async () => {
    const userData: UserRegistrationData = TestDataFactory.createUserRegistrationData({
      name: 'Jane Doe',
      email: 'jane.doe@example.com'
    });

    await registrationPage.fillRegistrationForm(userData);
    await registrationPage.submitForm();

    const success = await registrationPage.isRegistrationSuccessful();
    expect(success).toBe(true);
  });

  it('should handle invalid user data', async () => {
    const invalidData: UserRegistrationData = TestDataFactory.createInvalidUserRegistrationData();

    await registrationPage.fillRegistrationForm(invalidData);
    await registrationPage.submitForm();

    const error = await registrationPage.getErrorMessage();
    expect(error).toContain('Invalid input');
  });

  it('should complete checkout flow', async () => {
    const checkoutData: CheckoutData = TestDataFactory.createCheckoutData({
      items: [
        TestDataFactory.createProductData({ name: 'Laptop', price: 999.99 }),
        TestDataFactory.createProductData({ name: 'Mouse', price: 29.99 })
      ]
    });

    await checkoutPage.fillShippingInfo(checkoutData.shipping);
    await checkoutPage.fillPaymentInfo(checkoutData.payment);
    await checkoutPage.addItemToCart(checkoutData.items[0]);
    await checkoutPage.addItemToCart(checkoutData.items[1]);
    await checkoutPage.submitOrder();

    const success = await checkoutPage.isOrderSuccessful();
    expect(success).toBe(true);
  });
});
```

**❌ Non-Type-Safe Test Data:**
```typescript
describe('E2E Tests', () => {
  it('should test with untyped data', async () => {
    // No type safety for test data
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
      // Missing confirmPassword field - no compile-time error
    };

    await registrationPage.fillRegistrationForm(userData);
    await registrationPage.submitForm();

    // Could pass wrong data structure
    const productData = {
      title: 'Test Product', // Wrong property name
      cost: 99.99, // Wrong property name
      available: true
    };

    await checkoutPage.addItemToCart(productData); // Runtime error
  });
});
```

### 3. Type-Safe Assertions

Use TypeScript to create type-safe assertion helpers and utilities.

**✅ Type-Safe Assertions:**
```typescript
interface PageAssertions {
  toBeVisible: (selector: string) => Promise<void>;
  toContainText: (selector: string, text: string) => Promise<void>;
  toHaveValue: (selector: string, value: string) => Promise<void>;
  toHaveCount: (selector: string, count: number) => Promise<void>;
}

class E2EAssertions {
  constructor(private page: Page) {}

  async toBeVisible(selector: string, timeout?: number): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible({ timeout });
  }

  async toContainText(selector: string, text: string, timeout?: number): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(text, { timeout });
  }

  async toHaveValue(selector: string, value: string, timeout?: number): Promise<void> {
    await expect(this.page.locator(selector)).toHaveValue(value, { timeout });
  }

  async toHaveCount(selector: string, count: number, timeout?: number): Promise<void> {
    await expect(this.page.locator(selector)).toHaveCount(count, { timeout });
  }

  async toBeInViewport(selector: string): Promise<void> {
    const element = this.page.locator(selector);
    const boundingBox = await element.boundingBox();
    
    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.x).toBeGreaterThanOrEqual(0);
    expect(boundingBox!.y).toBeGreaterThanOrEqual(0);
  }

  async toHaveFocus(selector: string): Promise<void> {
    const element = this.page.locator(selector);
    const focusedElement = await this.page.evaluateHandle(() => document.activeElement);
    
    expect(await element.evaluate((el, focused) => el === focused, focusedElement)).toBe(true);
  }

  async toMatchScreenshot(selector: string, screenshotOptions?: { threshold?: number }): Promise<void> {
    const element = this.page.locator(selector);
    const screenshot = await element.screenshot();
    
    expect(screenshot).toMatchSnapshot({
      threshold: screenshotOptions?.threshold || 0.2
    });
  }
}

// Usage in tests
describe('E2E Assertions', () => {
  let assertions: E2EAssertions;

  beforeEach(() => {
    assertions = new E2EAssertions(page);
  });

  it('should verify page elements with type safety', async () => {
    await page.goto('/dashboard');

    // Type-safe assertions
    await assertions.toBeVisible('[data-testid="dashboard-title"]');
    await assertions.toContainText('[data-testid="dashboard-title"]', 'Welcome');
    await assertions.toBeInViewport('[data-testid="main-content"]');

    // Form field assertions
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await assertions.toHaveValue('[data-testid="name-input"]', 'John Doe');

    // List assertions
    await assertions.toHaveCount('[data-testid="item-list"] li', 5);

    // Focus assertions
    await page.click('[data-testid="name-input"]');
    await assertions.toHaveFocus('[data-testid="name-input"]');

    // Visual regression testing
    await assertions.toMatchScreenshot('[data-testid="dashboard"]', { threshold: 0.1 });
  });

  it('should handle async assertions properly', async () => {
    await page.goto('/async-content');

    // Wait for content to load
    await assertions.toBeVisible('[data-testid="loading-spinner"]', 5000);
    await assertions.toBeVisible('[data-testid="content-loaded"]', 10000);

    // Verify content
    await assertions.toContainText('[data-testid="content-title"]', 'Loaded Content');
  });
});
```

**❌ Non-Type-Safe Assertions:**
```typescript
describe('E2E Tests', () => {
  it('should make assertions without type safety', async () => {
    await page.goto('/dashboard');

    // No type safety for selectors or options
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible({ timeout: 'invalid' });
    await expect(page.locator('[data-testid="dashboard-title"]')).toContainText(123); // Wrong type
    await expect(page.locator('[data-testid="dashboard-title"]')).toHaveValue({}); // Wrong type

    // No custom assertion methods
    // Have to use raw Playwright assertions
    await expect(page.locator('[data-testid="content"]')).toBeVisible();
    // Can't use custom assertions like toBeInViewport or toHaveFocus
  });
});
```

## Common Patterns

### 1. Page Object Model

Implement the Page Object Model pattern for better organization and maintainability.

**✅ Page Object Model:**
```typescript
// Base page class
abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  abstract get url(): string;
  abstract get pageTitle(): string;

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  async waitForElement(selector: string, timeout = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { timeout });
  }
}

// Specific page classes
class LoginPage extends BasePage {
  get url(): string {
    return '/login';
  }

  get pageTitle(): string {
    return 'Login';
  }

  get selectors() {
    return {
      emailInput: '[data-testid="email-input"]',
      passwordInput: '[data-testid="password-input"]',
      loginButton: '[data-testid="login-button"]',
      errorMessage: '[data-testid="error-message"]',
      successMessage: '[data-testid="success-message"]'
    };
  }

  async login(credentials: { email: string; password: string }): Promise<void> {
    await this.page.fill(this.selectors.emailInput, credentials.email);
    await this.page.fill(this.selectors.passwordInput, credentials.password);
    await this.page.click(this.selectors.loginButton);
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForElement(this.selectors.errorMessage);
    return await this.page.textContent(this.selectors.errorMessage) || '';
  }

  async isSuccessMessageVisible(): Promise<boolean> {
    try {
      await this.waitForElement(this.selectors.successMessage, 3000);
      return true;
    } catch {
      return false;
    }
  }
}

class DashboardPage extends BasePage {
  get url(): string {
    return '/dashboard';
  }

  get pageTitle(): string {
    return 'Dashboard';
  }

  get selectors() {
    return {
      welcomeMessage: '[data-testid="welcome-message"]',
      profileLink: '[data-testid="profile-link"]',
      logoutButton: '[data-testid="logout-button"]',
      notifications: '[data-testid="notifications"]'
    };
  }

  async getWelcomeMessage(): Promise<string> {
    await this.waitForElement(this.selectors.welcomeMessage);
    return await this.page.textContent(this.selectors.welcomeMessage) || '';
  }

  async navigateToProfile(): Promise<void> {
    await this.page.click(this.selectors.profileLink);
  }

  async logout(): Promise<void> {
    await this.page.click(this.selectors.logoutButton);
  }

  async getNotificationCount(): Promise<number> {
    const notifications = await this.page.locator(this.selectors.notifications);
    return await notifications.count();
  }
}

class ShoppingCartPage extends BasePage {
  get url(): string {
    return '/cart';
  }

  get pageTitle(): string {
    return 'Shopping Cart';
  }

  get selectors() {
    return {
      cartItems: '[data-testid="cart-item"]',
      checkoutButton: '[data-testid="checkout-button"]',
      itemCount: '[data-testid="item-count"]',
      totalPrice: '[data-testid="total-price"]'
    };
  }

  async getItemCount(): Promise<number> {
    const countText = await this.page.textContent(this.selectors.itemCount);
    return parseInt(countText || '0', 10);
  }

  async getTotalPrice(): Promise<number> {
    const priceText = await this.page.textContent(this.selectors.totalPrice);
    return parseFloat((priceText || '0').replace(/[^0-9.]/g, ''));
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.click(this.selectors.checkoutButton);
  }

  async getCartItems(): Promise<Array<{ name: string; price: number; quantity: number }>> {
    const items = await this.page.locator(this.selectors.cartItems).all();
    const cartItems = [];

    for (const item of items) {
      const name = await item.locator('[data-testid="item-name"]').textContent();
      const priceText = await item.locator('[data-testid="item-price"]').textContent();
      const quantityText = await item.locator('[data-testid="item-quantity"]').textContent();

      cartItems.push({
        name: name || '',
        price: parseFloat((priceText || '0').replace(/[^0-9.]/g, '')),
        quantity: parseInt(quantityText || '0', 10)
      });
    }

    return cartItems;
  }
}

// Usage in tests
describe('E2E Flow with Page Objects', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let cartPage: ShoppingCartPage;

  beforeEach(async () => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    cartPage = new ShoppingCartPage(page);
  });

  it('should complete full user journey', async () => {
    // Login
    await loginPage.navigate();
    await loginPage.login({
      email: 'user@example.com',
      password: 'password123'
    });

    expect(await loginPage.isSuccessMessageVisible()).toBe(true);

    // Navigate to dashboard
    await dashboardPage.navigate();
    const welcomeMessage = await dashboardPage.getWelcomeMessage();
    expect(welcomeMessage).toContain('Welcome');

    // Navigate to cart
    await cartPage.navigate();
    const initialCount = await cartPage.getItemCount();
    expect(initialCount).toBe(0);

    // Add items to cart (assuming there's a way to do this)
    // await cartPage.addItem(product);

    // Verify cart contents
    const finalCount = await cartPage.getItemCount();
    expect(finalCount).toBeGreaterThan(0);

    // Proceed to checkout
    await cartPage.proceedToCheckout();

    // Verify checkout page
    await expect(page).toHaveURL(/.*\/checkout/);
  });
});
```

**❌ No Page Object Model:**
```javascript
describe('E2E Tests', () => {
  it('should test without page objects', async () => {
    // All selectors and logic mixed in test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    const errorMessage = await page.textContent('[data-testid="error-message"]');
    expect(errorMessage).toBe('');

    await page.goto('/dashboard');
    const welcomeMessage = await page.textContent('[data-testid="welcome-message"]');
    expect(welcomeMessage).toContain('Welcome');

    await page.goto('/cart');
    const itemCount = await page.textContent('[data-testid="item-count"]');
    expect(parseInt(itemCount)).toBe(0);

    // Test logic is scattered and hard to maintain
  });
});
```

### 2. Test Data Management

Implement proper test data management for E2E tests.

**✅ Test Data Management:**
```typescript
interface TestData {
  users: UserData[];
  products: ProductData[];
  orders: OrderData[];
}

interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'guest';
}

interface ProductData {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface OrderData {
  id: string;
  userId: string;
  items: Array<{ productId: string; quantity: number }>;
  status: 'pending' | 'completed' | 'cancelled';
}

class TestDataManager {
  private testData: TestData;

  constructor() {
    this.testData = this.loadTestData();
  }

  private loadTestData(): TestData {
    return {
      users: [
        {
          id: 'user-001',
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'SecurePassword123!',
          role: 'user'
        },
        {
          id: 'admin-001',
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'AdminPassword123!',
          role: 'admin'
        }
      ],
      products: [
        {
          id: 'prod-001',
          name: 'Laptop',
          price: 999.99,
          category: 'electronics',
          stock: 10
        },
        {
          id: 'prod-002',
          name: 'Mouse',
          price: 29.99,
          category: 'electronics',
          stock: 50
        }
      ],
      orders: [
        {
          id: 'order-001',
          userId: 'user-001',
          items: [
            { productId: 'prod-001', quantity: 1 },
            { productId: 'prod-002', quantity: 2 }
          ],
          status: 'completed'
        }
      ]
    };
  }

  getUser(role: 'user' | 'admin' | 'guest'): UserData {
    const user = this.testData.users.find(u => u.role === role);
    if (!user) {
      throw new Error(`No ${role} user found in test data`);
    }
    return { ...user }; // Return copy to prevent mutation
  }

  getProduct(category?: string): ProductData {
    let products = this.testData.products;
    if (category) {
      products = products.filter(p => p.category === category);
    }
    
    if (products.length === 0) {
      throw new Error(`No products found${category ? ` in category ${category}` : ''}`);
    }
    
    return { ...products[0] }; // Return copy
  }

  createOrderForUser(userId: string, items: Array<{ productId: string; quantity: number }>): OrderData {
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: orderId,
      userId,
      items,
      status: 'pending'
    };
  }

  async setupUser(userData: UserData): Promise<void> {
    // Setup user in test database
    await this.api.post('/api/test/users', userData);
  }

  async setupProduct(productData: ProductData): Promise<void> {
    // Setup product in test database
    await this.api.post('/api/test/products', productData);
  }

  async cleanup(): Promise<void> {
    // Clean up test data
    await this.api.delete('/api/test/cleanup');
  }
}

// Usage in tests
describe('E2E Tests with Test Data Management', () => {
  let testDataManager: TestDataManager;

  beforeAll(async () => {
    testDataManager = new TestDataManager();
  });

  beforeEach(async () => {
    // Setup test data for each test
    const user = testDataManager.getUser('user');
    const product = testDataManager.getProduct('electronics');
    
    await testDataManager.setupUser(user);
    await testDataManager.setupProduct(product);
  });

  afterEach(async () => {
    // Clean up after each test
    await testDataManager.cleanup();
  });

  it('should allow user to purchase product', async () => {
    const user = testDataManager.getUser('user');
    const product = testDataManager.getProduct('electronics');

    // Login as user
    await loginPage.navigate();
    await loginPage.login({
      email: user.email,
      password: user.password
    });

    // Add product to cart
    await page.goto(`/products/${product.id}`);
    await page.click('[data-testid="add-to-cart-button"]');

    // Proceed to checkout
    await page.goto('/cart');
    await page.click('[data-testid="checkout-button"]');

    // Complete order
    await checkoutPage.fillShippingInfo({
      name: user.name,
      address: '123 Test St',
      city: 'Test City',
      country: 'US',
      zipCode: '12345'
    });

    await checkoutPage.submitOrder();

    // Verify order completion
    const success = await checkoutPage.isOrderSuccessful();
    expect(success).toBe(true);
  });
});
```

**❌ Poor Test Data Management:**
```javascript
describe('E2E Tests', () => {
  it('should test with hardcoded data', async () => {
    // Hardcoded test data scattered throughout tests
    const user = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    };

    const product = {
      id: 'prod-123',
      name: 'Test Product',
      price: 99.99
    };

    // Test logic with hardcoded values
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'john.doe@example.com'); // Hardcoded
    await page.fill('[data-testid="password-input"]', 'password123'); // Hardcoded
    await page.click('[data-testid="login-button"]');

    await page.goto(`/products/${product.id}`);
    await page.click('[data-testid="add-to-cart-button"]');

    // Data is not managed centrally
    // Hard to maintain and update
  });
});
```

### 3. Cross-Browser Testing

Implement cross-browser testing strategies for E2E tests.

**✅ Cross-Browser Testing:**
```typescript
interface BrowserConfig {
  name: string;
  headless: boolean;
  viewport: { width: number; height: number };
  userAgent?: string;
}

class CrossBrowserTestRunner {
  private readonly browsers: BrowserConfig[] = [
    {
      name: 'chromium',
      headless: true,
      viewport: { width: 1920, height: 1080 }
    },
    {
      name: 'firefox',
      headless: true,
      viewport: { width: 1920, height: 1080 }
    },
    {
      name: 'webkit',
      headless: true,
      viewport: { width: 1920, height: 1080 }
    },
    {
      name: 'chromium-mobile',
      headless: true,
      viewport: { width: 375, height: 812 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    }
  ];

  async runTestOnAllBrowsers(testFn: (browser: BrowserConfig, page: Page) => Promise<void>): Promise<void> {
    for (const browserConfig of this.browsers) {
      console.log(`Running test on ${browserConfig.name}...`);
      
      const { browser, context, page } = await this.setupBrowser(browserConfig);
      
      try {
        await testFn(browserConfig, page);
        console.log(`✅ ${browserConfig.name}: PASSED`);
      } catch (error) {
        console.error(`❌ ${browserConfig.name}: FAILED - ${error.message}`);
        throw error; // Re-throw to fail the test suite
      } finally {
        await context.close();
        await browser.close();
      }
    }
  }

  private async setupBrowser(config: BrowserConfig): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
    const browser = await chromium.launch({ headless: config.headless });
    const context = await browser.newContext({
      viewport: config.viewport,
      userAgent: config.userAgent
    });
    
    const page = await context.newPage();
    
    // Add common setup
    await page.addInitScript(() => {
      // Disable animations for consistent testing
      document.documentElement.style.setProperty('--animation-duration', '0ms');
    });

    return { browser, context, page };
  }
}

// Usage in tests
describe('Cross-Browser E2E Tests', () => {
  const testRunner = new CrossBrowserTestRunner();

  it('should work across all browsers', async () => {
    await testRunner.runTestOnAllBrowsers(async (browserConfig, page) => {
      // Test logic that runs on all browsers
      await page.goto('/login');
      
      await page.fill('[data-testid="email-input"]', 'user@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Verify login success
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();

      // Test responsive behavior on mobile
      if (browserConfig.name.includes('mobile')) {
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      }
    });
  });

  it('should handle browser-specific behaviors', async () => {
    await testRunner.runTestOnAllBrowsers(async (browserConfig, page) => {
      await page.goto('/form');

      // Handle browser-specific form behaviors
      if (browserConfig.name === 'firefox') {
        // Firefox might have different form validation
        await page.fill('[data-testid="email-input"]', 'test@example.com');
      } else {
        // Other browsers
        await page.type('[data-testid="email-input"]', 'test@example.com');
      }

      // Test file upload (browser-specific)
      if (browserConfig.name === 'webkit') {
        // Safari might handle file uploads differently
        await page.setInputFiles('[data-testid="file-input"]', 'test-file.jpg');
      } else {
        await page.setInputFiles('[data-testid="file-input"]', 'test-file.jpg');
      }

      await page.click('[data-testid="submit-button"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });
  });
});
```

**❌ Single Browser Testing:**
```javascript
describe('E2E Tests', () => {
  it('should only test on one browser', async () => {
    // Only testing on default browser
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.click('[data-testid="login-button"]');

    // No cross-browser compatibility testing
    // Might miss browser-specific issues
  });
});
```

## Common Pitfalls and Solutions

### 1. Flaky Tests

**❌ Bad: Flaky Tests**
```javascript
describe('E2E Tests', () => {
  it('should test with timing issues', async () => {
    await page.goto('/dashboard');
    
    // Race condition - element might not be loaded yet
    await page.click('[data-testid="load-data-button"]');
    
    // Timing-dependent assertion
    await new Promise(resolve => setTimeout(resolve, 2000)); // Fixed delay
    
    const data = await page.textContent('[data-testid="data-container"]');
    expect(data).toContain('Loaded');
  });

  it('should test with network dependencies', async () => {
    // Depends on external API being available
    await page.goto('/api-dependent-page');
    await expect(page.locator('[data-testid="api-data"]')).toBeVisible();
  });
});
```

**✅ Good: Reliable Tests**
```javascript
describe('E2E Tests', () => {
  it('should test with proper synchronization', async () => {
    await page.goto('/dashboard');
    
    // Wait for button to be clickable
    await expect(page.locator('[data-testid="load-data-button"]')).toBeEnabled();
    await page.click('[data-testid="load-data-button"]');
    
    // Wait for specific condition, not fixed time
    await expect(page.locator('[data-testid="data-container"]')).toContainText('Loaded', { timeout: 10000 });
  });

  it('should test with mocked external dependencies', async () => {
    // Mock external API
    await page.route('**/api/external-data', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: 'mocked' })
      });
    });

    await page.goto('/api-dependent-page');
    await expect(page.locator('[data-testid="api-data"]')).toContainText('mocked');
  });
});
```

### 2. Slow Tests

**❌ Bad: Slow Tests**
```javascript
describe('E2E Tests', () => {
  it('should test everything in one long test', async () => {
    // Long test that does too much
    await page.goto('/register');
    await page.fill('[data-testid="name"]', 'John');
    await page.fill('[data-testid="email"]', 'john@example.com');
    await page.click('[data-testid="register"]');
    
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'john@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login"]');
    
    await page.goto('/dashboard');
    await page.click('[data-testid="settings"]');
    await page.fill('[data-testid="setting-name"]', 'Updated Name');
    await page.click('[data-testid="save-settings"]');
    
    // And so on...
    // This test is too long and does too much
  });
});
```

**✅ Good: Focused Tests**
```javascript
describe('E2E Tests', () => {
  describe('User Registration', () => {
    it('should register user successfully', async () => {
      await page.goto('/register');
      await page.fill('[data-testid="name"]', 'John');
      await page.fill('[data-testid="email"]', 'john@example.com');
      await page.click('[data-testid="register"]');
      
      await expect(page.locator('[data-testid="success"]')).toBeVisible();
    });
  });

  describe('User Login', () => {
    it('should login user successfully', async () => {
      await page.goto('/login');
      await page.fill('[data-testid="email"]', 'john@example.com');
      await page.fill('[data-testid="password"]', 'password');
      await page.click('[data-testid="login"]');
      
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    });
  });

  describe('User Settings', () => {
    beforeEach(async () => {
      // Setup user login
      await page.goto('/login');
      await page.fill('[data-testid="email"]', 'john@example.com');
      await page.fill('[data-testid="password"]', 'password');
      await page.click('[data-testid="login"]');
    });

    it('should update user settings', async () => {
      await page.goto('/settings');
      await page.fill('[data-testid="setting-name"]', 'Updated Name');
      await page.click('[data-testid="save-settings"]');
      
      await expect(page.locator('[data-testid="success"]')).toBeVisible();
    });
  });
});
```

### 3. Brittle Selectors

**❌ Bad: Brittle Selectors**
```javascript
describe('E2E Tests', () => {
  it('should test with brittle selectors', async () => {
    // Fragile selectors that break easily
    await page.click('body > div > div:nth-child(3) > button'); // Breaks with DOM changes
    await page.fill('input[type="text"]', 'test'); // Too generic
    await page.click('.btn-primary'); // Class might change
  });
});
```

**✅ Good: Robust Selectors**
```javascript
describe('E2E Tests', () => {
  it('should test with robust selectors', async () => {
    // Use data-testid attributes
    await page.click('[data-testid="submit-button"]');
    await page.fill('[data-testid="name-input"]', 'test');
    
    // Use semantic selectors when possible
    await page.click('button[type="submit"]');
    await page.fill('input[name="username"]');
    
    // Use text content for buttons
    await page.click('button:has-text("Submit")');
  });
});
```

### 4. Poor Error Handling

**❌ Bad: Poor Error Handling**
```javascript
describe('E2E Tests', () => {
  it('should test without proper error handling', async () => {
    try {
      await page.goto('/non-existent-page');
      await page.click('[data-testid="non-existent-element"]');
    } catch (error) {
      // Generic error handling
      console.log('Test failed:', error.message);
      // Test continues even if setup failed
    }
    
    // Test might continue with invalid state
    await page.fill('[data-testid="form-field"]', 'test');
  });
});
```

**✅ Good: Proper Error Handling**
```javascript
describe('E2E Tests', () => {
  it('should test with proper error handling', async () => {
    // Setup with error handling
    await page.goto('/test-page');
    await expect(page.locator('[data-testid="page-loaded"]')).toBeVisible();

    // Test with specific error expectations
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid email');

    // Cleanup
    await page.goto('/');
  });
});
```

## Best Practices Summary

1. **Test Complete Workflows**: Focus on end-to-end user journeys
2. **Use Real Scenarios**: Base tests on actual user behaviors
3. **Handle Error Cases**: Include failure scenarios and edge cases
4. **Use Page Objects**: Organize tests with the Page Object Model
5. **Manage Test Data**: Use centralized test data management
6. **Ensure Reliability**: Avoid flaky tests with proper synchronization
7. **Optimize Performance**: Keep tests focused and fast
8. **Use Robust Selectors**: Avoid brittle element locators
9. **Test Cross-Browser**: Ensure compatibility across browsers
10. **Handle Errors Gracefully**: Implement proper error handling and recovery

## Examples in Context

### E-commerce Application
```javascript
describe('E-commerce E2E Tests', () => {
  let homePage: HomePage;
  let productPage: ProductPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let confirmationPage: ConfirmationPage;

  beforeEach(async () => {
    homePage = new HomePage(page);
    productPage = new ProductPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    confirmationPage = new ConfirmationPage(page);
  });

  it('should complete full shopping journey', async () => {
    // Browse products
    await homePage.navigate();
    await homePage.browseCategory('electronics');

    // Search and filter
    await homePage.searchProduct('laptop');
    await homePage.filterByPrice(500, 1000);

    // View product details
    await productPage.selectProduct('MacBook Pro');
    await productPage.selectConfiguration('16GB RAM', '512GB SSD');
    await productPage.addToCart();

    // Manage cart
    await cartPage.navigate();
    await cartPage.verifyItem('MacBook Pro', 1);
    await cartPage.updateQuantity('MacBook Pro', 2);
    await cartPage.applyDiscountCode('SAVE10');

    // Checkout flow
    await checkoutPage.navigate();
    await checkoutPage.fillShippingInfo({
      name: 'John Doe',
      address: '123 Main St',
      city: 'Anytown',
      country: 'US',
      zipCode: '12345'
    });

    await checkoutPage.selectShippingMethod('express');
    await checkoutPage.fillPaymentInfo({
      cardNumber: '4532015112830366',
      expiryDate: '12/25',
      cvv: '123',
      cardholderName: 'John Doe'
    });

    await checkoutPage.reviewOrder();
    await checkoutPage.placeOrder();

    // Verify confirmation
    await confirmationPage.verifyOrderDetails();
    await confirmationPage.verifyEmailSent();
    await confirmationPage.trackOrder();
  });

  it('should handle shopping cart abandonment and recovery', async () => {
    // Add items to cart
    await productPage.selectProduct('Laptop');
    await productPage.addToCart();

    await productPage.selectProduct('Mouse');
    await productPage.addToCart();

    // Abandon cart (navigate away)
    await page.goto('/');

    // Return and verify cart is preserved
    await cartPage.navigate();
    await cartPage.verifyItems(['Laptop', 'Mouse']);

    // Complete purchase
    await checkoutPage.navigate();
    await checkoutPage.completeCheckout();
  });

  it('should handle out-of-stock scenarios', async () => {
    // Add item to cart
    await productPage.selectProduct('Popular Item');
    await productPage.addToCart();

    // Simulate item going out of stock
    await api.put('/api/inventory/popular-item', { stock: 0 });

    // Navigate to cart
    await cartPage.navigate();

    // Verify out-of-stock notification
    await cartPage.verifyOutOfStockNotification('Popular Item');

    // Verify user can remove item or continue with other items
    await cartPage.removeOutOfStockItem('Popular Item');
    await cartPage.proceedToCheckout();
  });
});
```

### API Development
```javascript
describe('API E2E Tests', () => {
  let apiClient: APIClient;
  let authHelper: AuthHelper;

  beforeEach(async () => {
    apiClient = new APIClient();
    authHelper = new AuthHelper();
  });

  it('should test complete API workflow', async () => {
    // Authentication
    const authResponse = await apiClient.post('/auth/login', {
      email: 'user@example.com',
      password: 'password123'
    });

    expect(authResponse.status).toBe(200);
    const token = authResponse.data.token;

    // Create resource
    const createResponse = await apiClient.post('/api/users', {
      name: 'John Doe',
      email: 'john@example.com'
    }, { headers: { Authorization: `Bearer ${token}` } });

    expect(createResponse.status).toBe(201);
    const userId = createResponse.data.id;

    // Retrieve resource
    const getResponse = await apiClient.get(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(getResponse.status).toBe(200);
    expect(getResponse.data.name).toBe('John Doe');

    // Update resource
    const updateResponse = await apiClient.put(`/api/users/${userId}`, {
      name: 'Jane Doe',
      email: 'jane@example.com'
    }, { headers: { Authorization: `Bearer ${token}` } });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.name).toBe('Jane Doe');

    // List resources
    const listResponse = await apiClient.get('/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(listResponse.status).toBe(200);
    expect(listResponse.data).toContainEqual(
      expect.objectContaining({ id: userId, name: 'Jane Doe' })
    );

    // Delete resource
    const deleteResponse = await apiClient.delete(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(deleteResponse.status).toBe(204);

    // Verify deletion
    const verifyResponse = await apiClient.get(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(verifyResponse.status).toBe(404);
  });

  it('should test API error handling', async () => {
    // Test authentication errors
    const authResponse = await apiClient.post('/auth/login', {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });

    expect(authResponse.status).toBe(401);
    expect(authResponse.data.error).toContain('Invalid credentials');

    // Test authorization errors
    const unauthorizedResponse = await apiClient.get('/api/admin/users', {
      headers: { Authorization: 'Bearer invalid-token' }
    });

    expect(unauthorizedResponse.status).toBe(401);

    // Test validation errors
    const validationResponse = await apiClient.post('/api/users', {
      name: '', // Invalid - empty name
      email: 'invalid-email' // Invalid email format
    }, { headers: { Authorization: 'Bearer valid-token' } });

    expect(validationResponse.status).toBe(400);
    expect(validationResponse.data.errors).toContainEqual(
      expect.objectContaining({ field: 'name', message: 'Name is required' })
    );
  });

  it('should test API rate limiting', async () => {
    // Make multiple requests rapidly
    const requests = Array(20).fill(null).map(() => 
      apiClient.get('/api/users', { headers: { 'X-Test-User': 'rate-limit-test' } })
    );

    const responses = await Promise.all(requests);

    // Some requests should be rate limited
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);

    // Verify rate limit headers
    const successfulResponse = responses.find(r => r.status === 200);
    if (successfulResponse) {
      expect(successfulResponse.headers['x-ratelimit-remaining']).toBeDefined();
      expect(successfulResponse.headers['x-ratelimit-reset']).toBeDefined();
    }
  });
});
```

### Data Processing Pipeline
```javascript
describe('Data Processing Pipeline E2E Tests', () => {
  let dataIngestionPage: DataIngestionPage;
  let dataProcessingPage: DataProcessingPage;
  let dataValidationPage: DataValidationPage;
  let dataExportPage: DataExportPage;

  beforeEach(async () => {
    dataIngestionPage = new DataIngestionPage(page);
    dataProcessingPage = new DataProcessingPage(page);
    dataValidationPage = new DataValidationPage(page);
    dataExportPage = new DataExportPage(page);
  });

  it('should process data through complete pipeline', async () => {
    // Prepare test data
    const testData = [
      { id: 'record-1', name: 'John Doe', email: 'john@example.com', age: '25' },
      { id: 'record-2', name: 'Jane Smith', email: 'jane@example.com', age: '30' },
      { id: 'record-3', name: 'Invalid Data', email: 'invalid-email', age: 'not-a-number' }
    ];

    // Step 1: Data ingestion
    await dataIngestionPage.navigate();
    await dataIngestionPage.uploadData(testData);
    await dataIngestionPage.verifyIngestionStatus('completed');

    // Step 2: Data processing
    await dataProcessingPage.navigate();
    await dataProcessingPage.startProcessing();
    await dataProcessingPage.waitForProcessingComplete();

    const processingResults = await dataProcessingPage.getProcessingResults();
    expect(processingResults.validRecords).toBe(2);
    expect(processingResults.invalidRecords).toBe(1);

    // Step 3: Data validation
    await dataValidationPage.navigate();
    await dataValidationPage.runValidation();
    await dataValidationPage.verifyValidationResults();

    const validationReport = await dataValidationPage.getValidationReport();
    expect(validationReport.errors).toHaveLength(1);
    expect(validationReport.errors[0].recordId).toBe('record-3');

    // Step 4: Data export
    await dataExportPage.navigate();
    await dataExportPage.selectExportFormat('CSV');
    await dataExportPage.selectDataRange('processed');
    await dataExportPage.exportData();

    const exportResult = await dataExportPage.getExportResult();
    expect(exportResult.success).toBe(true);
    expect(exportResult.fileSize).toBeGreaterThan(0);

    // Verify exported data
    const exportedData = await dataExportPage.downloadAndParseExport();
    expect(exportedData).toHaveLength(2); // Only valid records
    expect(exportedData[0].name).toBe('John Doe');
    expect(exportedData[1].name).toBe('Jane Smith');
  });

  it('should handle large data volumes', async () => {
    // Generate large dataset
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: `record-${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      age: Math.floor(Math.random() * 50) + 18
    }));

    // Upload large dataset
    await dataIngestionPage.navigate();
    await dataIngestionPage.uploadData(largeDataset);

    // Monitor processing progress
    await dataProcessingPage.navigate();
    await dataProcessingPage.startProcessing();

    // Verify progress updates
    const progressUpdates = await dataProcessingPage.getProgressUpdates();
    expect(progressUpdates.length).toBeGreaterThan(0);

    // Verify completion
    await dataProcessingPage.waitForProcessingComplete({ timeout: 300000 }); // 5 minutes

    const results = await dataProcessingPage.getProcessingResults();
    expect(results.totalRecords).toBe(10000);
    expect(results.processingTime).toBeLessThan(300000); // Should complete within 5 minutes
  });

  it('should handle data pipeline failures gracefully', async () => {
    // Upload data with processing errors
    const problematicData = [
      { id: 'record-1', name: 'John Doe', email: 'john@example.com', age: '25' },
      { id: 'record-2', name: 'Jane Smith', email: 'jane@example.com', age: '30' },
      { id: 'record-3', name: null, email: 'invalid-email', age: 'not-a-number' },
      { id: 'record-4', name: 'Bob Wilson', email: 'bob@example.com', age: '-5' }
    ];

    // Start ingestion
    await dataIngestionPage.navigate();
    await dataIngestionPage.uploadData(problematicData);

    // Simulate processing failure
    await dataProcessingPage.navigate();
    await dataProcessingPage.simulateProcessingFailure();

    // Verify error handling
    const errorDetails = await dataProcessingPage.getErrorDetails();
    expect(errorDetails.type).toBe('processing_error');
    expect(errorDetails.failedRecords).toBeGreaterThan(0);

    // Verify recovery options
    const recoveryOptions = await dataProcessingPage.getRecoveryOptions();
    expect(recoveryOptions).toContain('retry_failed_records');
    expect(recoveryOptions).toContain('skip_failed_records');

    // Test recovery
    await dataProcessingPage.retryFailedRecords();
    await dataProcessingPage.waitForProcessingComplete();

    const finalResults = await dataProcessingPage.getProcessingResults();
    expect(finalResults.processedRecords).toBeGreaterThan(0);
    expect(finalResults.errorRecords).toBe(0);
  });
});
```

Remember: E2E tests should simulate real user experiences and test complete workflows. They should be reliable, maintainable, and provide confidence that your application works correctly from the user's perspective.