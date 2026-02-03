---
paths:
  - "src/**/*.js"
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "**/*.js"
  - "**/*.ts"
  - "**/*.tsx"
---

# Function Design

Well-designed functions are the building blocks of maintainable code. They should be small, focused, and do one thing well.

## Core Principles

- Functions should be small
- Do one thing
- Use descriptive names
- Minimize arguments
- Avoid side effects
- Handle errors gracefully

## Function Length and Complexity

### ✅ Good Examples
```javascript
// Short, focused functions
function calculateTotalPrice(subtotal, taxRate) {
  return subtotal + (subtotal * taxRate);
}

function isValidEmail(email) {
  return email && email.includes('@') && email.includes('.');
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}
```

### ❌ Bad Examples
```javascript
// Long, complex functions
function processOrder(order, user, inventory, paymentMethod, shippingAddress) {
  // 50+ lines of complex logic
  // Multiple responsibilities
  // Hard to test and maintain
}

// Functions with too many branches
function calculatePrice(item, quantity, discount, tax, shipping, coupon) {
  if (discount > 0) {
    if (tax > 0) {
      if (shipping > 0) {
        // Nested logic becomes hard to follow
      }
    }
  }
  // More complex logic...
}
```

## Function Arguments

### ✅ Good Examples
```javascript
// Use object destructuring for multiple parameters
function createUser({ name, email, age, role = 'user' }) {
  return {
    id: generateId(),
    name,
    email,
    age,
    role,
    createdAt: new Date()
  };
}

// Use default parameters
function fetchUsers(page = 1, limit = 10, sortBy = 'name') {
  return api.get(`/users?page=${page}&limit=${limit}&sort=${sortBy}`);
}

// Use builder pattern for complex objects
function buildQuery() {
  return {
    filters: [],
    sort: null,
    pagination: { page: 1, limit: 10 },
    with: [],
    addFilter(field, value) {
      this.filters.push({ field, value });
      return this;
    },
    setSort(field, direction = 'asc') {
      this.sort = { field, direction };
      return this;
    }
  };
}
```

### ❌ Bad Examples
```javascript
// Too many parameters
function processPayment(amount, currency, userId, paymentMethod, cardNumber, expiryDate, cvv, billingAddress, shippingAddress, discountCode, taxRate) {
  // Hard to remember parameter order
  // Easy to pass wrong values
}

// Boolean parameters that aren't self-explanatory
function createUser(name, email, isAdmin, isActive, isVerified) {
  // What do these booleans mean?
}

// Optional parameters that should be required
function calculateTotal(items, discount = 0, tax = 0, shipping = 0) {
  // Some parameters should be required for correct calculation
}
```

## Return Values

### ✅ Good Examples
```javascript
// Return consistent types
function findUserById(id) {
  const user = users.find(u => u.id === id);
  return user || null;
}

// Use early returns
function validateInput(input) {
  if (!input) return { valid: false, error: 'Input is required' };
  if (input.length < 3) return { valid: false, error: 'Input too short' };
  if (input.length > 100) return { valid: false, error: 'Input too long' };
  
  return { valid: true };
}

// Return objects for multiple values
function calculateStats(numbers) {
  return {
    sum: numbers.reduce((a, b) => a + b, 0),
    average: numbers.reduce((a, b) => a + b, 0) / numbers.length,
    min: Math.min(...numbers),
    max: Math.max(...numbers)
  };
}
```

### ❌ Bad Examples
```javascript
// Inconsistent return types
function findUserById(id) {
  const user = users.find(u => u.id === id);
  if (user) {
    return user;
  } else {
    return false; // Should return null or throw error
  }
}

// Multiple return points without early returns
function processOrder(order) {
  if (order.items.length > 0) {
    // Process items
    if (order.user) {
      // Process user
      if (order.payment) {
        // Process payment
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}
```

## Side Effects

### ✅ Good Examples
```javascript
// Pure functions
function add(a, b) {
  return a + b;
}

function formatUser(user) {
  return {
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
    displayName: user.username || user.email
  };
}

// Clear side effects with explicit naming
function logUserAction(action, userId) {
  console.log(`User ${userId}: ${action}`);
}

function saveToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
```

### ❌ Bad Examples
```javascript
// Hidden side effects
function calculateTotal(items) {
  let total = 0;
  items.forEach(item => {
    total += item.price * item.quantity;
    item.processed = true; // Side effect!
  });
  return total;
}

// Modifying input parameters
function processUsers(users) {
  users.forEach(user => {
    user.status = 'processed'; // Modifies original array
    user.lastModified = new Date();
  });
  return users;
}
```

## Error Handling

### ✅ Good Examples
```javascript
// Use specific error types
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

function validateEmail(email) {
  if (!email) {
    throw new ValidationError('Email is required', 'email');
  }
  if (!email.includes('@')) {
    throw new ValidationError('Invalid email format', 'email');
  }
  return true;
}

// Handle errors gracefully
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw new Error('Unable to load user information');
  }
}
```

### ❌ Bad Examples
```javascript
// Generic error handling
function processOrder(order) {
  try {
    // Process order
  } catch (error) {
    console.log(error); // Generic logging
    throw error; // Re-throwing without context
  }
}

// Silent failures
function saveData(data) {
  try {
    localStorage.setItem('data', JSON.stringify(data));
  } catch (error) {
    // Silent failure - data might be lost
  }
}
```

## Code Review Checklist

- [ ] Functions are small and focused on a single responsibility
- [ ] Function names clearly describe what they do
- [ ] Function arguments are minimized and well-named
- [ ] Return values are consistent and predictable
- [ ] Functions avoid side effects or make them explicit
- [ ] Error handling is appropriate and informative
- [ ] Functions are testable in isolation
- [ ] No magic numbers or hardcoded values
- [ ] Early returns are used when appropriate
- [ ] Complex logic is broken into smaller functions