# Universal Clean Code Standards

These standards apply to all JavaScript and TypeScript code regardless of file type or location.

## Code Quality Principles

### 1. **Readability First**
- Code should be self-documenting
- Use meaningful names that reveal intent
- Keep functions small and focused
- Maintain consistent formatting and style

### 2. **Single Responsibility**
- Each function should do one thing well
- Each class should have one reason to change
- Each module should have a clear, focused purpose

### 3. **Error Handling**
- Always handle errors gracefully
- Use specific error types and messages
- Log errors with appropriate context
- Provide meaningful feedback to users

### 4. **Performance Awareness**
- Avoid unnecessary computations
- Use efficient data structures and algorithms
- Minimize DOM manipulations
- Consider memory usage and cleanup

### 5. **Security Consciousness**
- Validate all inputs
- Sanitize user data
- Use secure authentication practices
- Avoid exposing sensitive information

## Code Review Checklist

- [ ] Code is readable and self-documenting
- [ ] Functions have single, clear responsibilities
- [ ] Error handling is implemented appropriately
- [ ] Performance considerations are addressed
- [ ] Security best practices are followed
- [ ] Code follows project style guidelines
- [ ] No hardcoded values or magic numbers
- [ ] Comments explain "why" not "what"
- [ ] No unused variables or dead code
- [ ] Dependencies are properly managed

## Examples

### ✅ Good: Self-documenting code
```javascript
// Calculate total price including tax
function calculateTotalPrice(subtotal, taxRate) {
  return subtotal + (subtotal * taxRate);
}
```

### ❌ Bad: Unclear and magic numbers
```javascript
// What does 1.08 represent?
function calc(x) {
  return x * 1.08;
}
```

### ✅ Good: Proper error handling
```javascript
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

### ❌ Bad: No error handling
```javascript
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  return await response.json();
}