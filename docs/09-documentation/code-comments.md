# Code Comments

## Overview

Code comments are essential for explaining the "why" behind code decisions, making the codebase more maintainable and understandable for other developers.

## When to Comment

### Comment the Why, Not the What

**Bad:**
```typescript
// Increment the counter
counter++;

// Calculate the total
const total = items.reduce((sum, item) => sum + item.price, 0);
```

**Good:**
```typescript
// Increment the counter to track user interactions for analytics
counter++;

// Calculate the total including tax (8.5% rate)
const total = items.reduce((sum, item) => sum + item.price, 0) * 1.085;
```

### Comment Complex Logic

**Example:**
```typescript
// Use binary search for O(log n) lookup in sorted array
// This is critical for performance with large datasets
function findUserById(users: User[], id: string): User | null {
  let left = 0;
  let right = users.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midUser = users[mid];
    
    if (midUser.id === id) {
      return midUser;
    }
    
    if (midUser.id < id) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return null;
}
```

### Comment Intent and Assumptions

**Example:**
```typescript
// Cache results for 5 minutes to avoid hitting rate limits
// on external API (max 100 requests per minute)
private async fetchUserData(userId: string): Promise<UserData> {
  const cacheKey = `user:${userId}`;
  const cached = this.cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.data;
  }
  
  // Make external API call
  const data = await this.externalApi.getUser(userId);
  
  // Cache the result
  this.cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}
```

## Comment Types

### 1. Single-line Comments

Use for brief explanations:

```typescript
// Handle edge case where user has no permissions
if (user.permissions.length === 0) {
  return { allowed: false, reason: 'No permissions assigned' };
}

// TODO: Implement proper error handling for network failures
const response = await fetch('/api/data');
```

### 2. Multi-line Comments

Use for detailed explanations:

```typescript
/**
 * Validates email format using RFC 5322 specification.
 * 
 * This implementation handles:
 * - Basic format validation (user@domain.tld)
 * - Internationalized domain names
 * - Quoted strings in local part
 * - Comments in parentheses
 * 
 * Note: This is a simplified version for common use cases.
 * For production use, consider using a dedicated email validation library.
 */
function validateEmail(email: string): boolean {
  // Implementation here
}
```

### 3. JSDoc Comments

Use for documenting functions, classes, and interfaces:

```typescript
/**
 * Calculates the compound interest for an investment.
 * 
 * @param principal - The initial investment amount
 * @param rate - Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @param time - Time period in years
 * @param compoundsPerYear - Number of times interest is compounded per year
 * @returns The final amount after compound interest
 * 
 * @example
 * ```typescript
 * const result = calculateCompoundInterest(1000, 0.05, 10, 12);
 * console.log(result); // 1647.01
 * ```
 */
function calculateCompoundInterest(
  principal: number,
  rate: number,
  time: number,
  compoundsPerYear: number = 12
): number {
  return principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * time);
}
```

## Comment Best Practices

### 1. Keep Comments Current

**Bad:**
```typescript
// This function calculates user score (last updated 2020)
function calculateUserScore(user: User): number {
  // Old algorithm - no longer used
  // return user.posts * 10 + user.comments * 5;
  
  // New algorithm based on engagement
  return user.engagementScore * 100;
}
```

**Good:**
```typescript
// Calculates user engagement score based on recent activity
function calculateUserScore(user: User): number {
  return user.engagementScore * 100;
}
```

### 2. Use Clear, Descriptive Language

**Bad:**
```typescript
// Do stuff with data
function processData(data: any[]): any[] {
  return data.filter(item => item.active);
}
```

**Good:**
```typescript
// Filter active users from the dataset
function filterActiveUsers(users: User[]): User[] {
  return users.filter(user => user.isActive);
}
```

### 3. Explain Business Logic

**Example:**
```typescript
/**
 * Calculates shipping cost based on order weight and destination.
 * 
 * Shipping rates:
 * - Domestic: $5 base + $0.50 per pound
 * - International: $15 base + $2.00 per pound
 * - Free shipping for orders over $100
 */
function calculateShippingCost(
  order: Order,
  destination: 'domestic' | 'international'
): number {
  // Free shipping for orders over $100
  if (order.total > 100) {
    return 0;
  }
  
  const baseRate = destination === 'domestic' ? 5 : 15;
  const perPoundRate = destination === 'domestic' ? 0.5 : 2.0;
  
  return baseRate + (order.weight * perPoundRate);
}
```

### 4. Document Workarounds and Hacks

**Example:**
```typescript
// TODO: Remove this workaround when API v2 is released
// Current API returns dates as strings instead of ISO format
function parseApiResponse(data: any): ApiResponse {
  return {
    ...data,
    createdAt: new Date(data.createdAt), // API returns "MM/DD/YYYY" format
    updatedAt: new Date(data.updatedAt)
  };
}
```

## Comment Guidelines

### 1. Comment Frequency

- **Every 10-20 lines** of complex code should have explanatory comments
- **Every public API** should be documented with JSDoc
- **Every non-obvious algorithm** should be explained
- **Every business rule** should be documented

### 2. Comment Placement

- Place comments **above** the code they describe
- Use blank lines to separate comments from code
- Keep comments close to the relevant code

**Good:**
```typescript
// Calculate compound interest
const principal = 1000;
const rate = 0.05;
const time = 5;

const amount = principal * Math.pow(1 + rate, time);
```

**Bad:**
```typescript
const principal = 1000;
const rate = 0.05;
const time = 5;
const amount = principal * Math.pow(1 + rate, time); // Calculate compound interest
```

### 3. Comment Style

- Use consistent formatting
- Write in complete sentences
- Use proper grammar and spelling
- Avoid slang and abbreviations

## When NOT to Comment

### 1. Self-Explanatory Code

**Unnecessary:**
```typescript
// Set the user's name
user.name = 'John Doe';

// Check if the number is positive
if (number > 0) {
  console.log('Positive number');
}
```

### 2. Implementation Details

**Unnecessary:**
```typescript
// Create a new array
const newArray = [];

// Loop through the items
for (let i = 0; i < items.length; i++) {
  // Add item to array
  newArray.push(items[i]);
}
```

### 3. Obvious Variable Names

**Unnecessary:**
```typescript
const userName = 'John'; // Store the user's name
const isActive = true;   // Track if user is active
```

## Special Comment Types

### 1. TODO Comments

Use for tracking future improvements:

```typescript
// TODO: Implement proper error handling
// TODO: Add unit tests for edge cases
// TODO: Optimize for large datasets
```

### 2. FIXME Comments

Use for known issues that need fixing:

```typescript
// FIXME: This doesn't handle null values correctly
// FIXME: Performance issue with large arrays
```

### 3. HACK Comments

Use for temporary workarounds:

```typescript
// HACK: Temporary fix for IE11 compatibility
if (typeof Array.prototype.includes !== 'function') {
  Array.prototype.includes = function(item) {
    return this.indexOf(item) !== -1;
  };
}
```

### 4. NOTE Comments

Use for important information:

```typescript
// NOTE: This function mutates the original array
// NOTE: Requires admin privileges to access
```

## Code Comment Examples

### React Component Comments

```typescript
/**
 * User profile component with edit functionality
 * 
 * Features:
 * - Displays user information
 * - Allows editing user details
 * - Validates form inputs
 * - Handles save/cancel actions
 */
function UserProfile({ userId }: { userId: string }) {
  // Fetch user data from API
  const { data: user, isLoading, error } = useUser(userId);
  
  // State for edit mode and form data
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Update user in database
      await updateUser(userId, formData);
      setIsEditing(false);
    } catch (error) {
      // Show error message to user
      console.error('Failed to update user:', error);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return <div>Loading user profile...</div>;
  }
  
  // Render error state
  if (error) {
    return <div>Error loading user profile</div>;
  }
  
  return (
    <div className="user-profile">
      {isEditing ? (
        // Edit form
        <form onSubmit={handleSubmit}>
          <input
            value={formData.name || user.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Name"
          />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </form>
      ) : (
        // Display mode
        <div>
          <h2>{user.name}</h2>
          <button onClick={() => setIsEditing(true)}>Edit</button>
        </div>
      )}
    </div>
  );
}
```

### Utility Function Comments

```typescript
/**
 * Debounces a function call to improve performance
 * 
 * @param func - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns A debounced version of the function
 * 
 * @example
 * ```typescript
 * const handleSearch = debounce((query: string) => {
 *   // Search implementation
 * }, 300);
 * ```
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    // Clear existing timeout
    clearTimeout(timeoutId);
    
    // Set new timeout
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}
```

### Class Comments

```typescript
/**
 * Manages application state using the Observer pattern
 * 
 * Features:
 * - Centralized state management
 * - Observer pattern for updates
 * - Type-safe state access
 * - Immutable state updates
 */
class StateManager<T extends Record<string, any>> {
  private state: T;
  private observers: Array<(state: T) => void> = [];
  
  /**
   * Initialize state manager with initial state
   * @param initialState - The initial state object
   */
  constructor(initialState: T) {
    this.state = { ...initialState };
  }
  
  /**
   * Subscribe to state changes
   * @param callback - Function to call when state changes
   * @returns Unsubscribe function
   */
  subscribe(callback: (state: T) => void): () => void {
    this.observers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  }
  
  /**
   * Update state and notify observers
   * @param updates - Partial state updates
   */
  update(updates: Partial<T>): void {
    // Create new state object (immutable)
    this.state = { ...this.state, ...updates };
    
    // Notify all observers
    this.observers.forEach(observer => observer(this.state));
  }
  
  /**
   * Get current state
   * @returns Current state object
   */
  getState(): T {
    return { ...this.state };
  }
}
```

## Summary

Good code comments are essential for maintainable code. Remember:

- **Comment the why, not the what**
- **Keep comments current and accurate**
- **Use clear, descriptive language**
- **Document complex algorithms and business logic**
- **Use appropriate comment types for different purposes**
- **Remove outdated comments**

Well-commented code makes it easier for team members to understand, maintain, and extend the codebase, ultimately leading to better software quality and faster development cycles.