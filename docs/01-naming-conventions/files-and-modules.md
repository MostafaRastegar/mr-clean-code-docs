# Files and Modules

## Overview

File and module naming is crucial for organizing code and making it easy to navigate. Good naming conventions help developers quickly locate files and understand their purpose within the project structure.

## Core Principles

### 1. Use Descriptive File Names

File names should clearly indicate what the file contains or what functionality it provides.

**❌ Bad:**
```javascript
// utils.js - Too generic
// helpers.js - Too generic
// main.js - Too generic
// index.js - Too generic
```

**✅ Good:**
```javascript
// user-utils.js - Specific utility
// date-helpers.js - Specific helpers
// app-main.js - Specific main file
// user-service.js - Specific service
```

### 2. Use kebab-case for File Names

Use kebab-case (lowercase with hyphens) for file and directory names.

**✅ Examples:**
```javascript
// Good file names
user-profile.js
shopping-cart.js
payment-processor.js
api-client.js
data-validator.js

// Good directory names
user-management/
shopping-cart/
payment-processing/
api-integration/
data-validation/
```

### 3. Match File Names to Primary Export

The file name should match the primary class, function, or component it exports.

**✅ Examples:**
```javascript
// user-service.js
export class UserService { /* ... */ }

// shopping-cart.js
export class ShoppingCart { /* ... */ }

// api-client.js
export class ApiClient { /* ... */ }

// date-utils.js
export function formatDate() { /* ... */ }
export function parseDate() { /* ... */ }
```

### 4. Use Clear Directory Structure

Organize files in a logical directory structure that reflects your application's architecture.

**✅ Examples:**
```javascript
src/
├── components/
│   ├── user/
│   │   ├── user-profile.js
│   │   ├── user-avatar.js
│   │   └── user-settings.js
│   └── product/
│       ├── product-list.js
│       ├── product-card.js
│       └── product-details.js
├── services/
│   ├── user-service.js
│   ├── product-service.js
│   └── api-client.js
├── utils/
│   ├── date-utils.js
│   ├── string-utils.js
│   └── validation-utils.js
└── models/
    ├── user.js
    ├── product.js
    └── order.js
```

## Module Naming Patterns

### 1. Feature-Based Organization

Group related files by feature or functionality.

**✅ Examples:**
```javascript
// E-commerce application
src/
├── features/
│   ├── user-management/
│   │   ├── components/
│   │   │   ├── user-form.js
│   │   │   └── user-list.js
│   │   ├── services/
│   │   │   └── user-service.js
│   │   ├── utils/
│   │   │   └── user-validation.js
│   │   └── index.js
│   ├── shopping-cart/
│   │   ├── components/
│   │   │   ├── cart-item.js
│   │   │   └── cart-summary.js
│   │   ├── services/
│   │   │   └── cart-service.js
│   │   └── index.js
│   └── checkout/
│       ├── components/
│       │   ├── checkout-form.js
│       │   └── payment-method.js
│       ├── services/
│       │   └── checkout-service.js
│       └── index.js
```

### 2. Layer-Based Organization

Group files by architectural layer.

**✅ Examples:**
```javascript
// Layer-based structure
src/
├── components/
│   ├── common/
│   │   ├── button.js
│   │   ├── input.js
│   │   └── modal.js
│   ├── layout/
│   │   ├── header.js
│   │   ├── footer.js
│   │   └── sidebar.js
│   └── pages/
│       ├── home.js
│       ├── about.js
│       └── contact.js
├── services/
│   ├── api/
│   │   ├── user-api.js
│   │   ├── product-api.js
│   │   └── order-api.js
│   ├── business/
│   │   ├── user-service.js
│   │   ├── product-service.js
│   │   └── order-service.js
│   └── external/
│       ├── payment-gateway.js
│       ├── email-service.js
│       └── notification-service.js
├── utils/
│   ├── formatters/
│   │   ├── currency.js
│   │   ├── date.js
│   │   └── number.js
│   ├── validators/
│   │   ├── email.js
│   │   ├── phone.js
│   │   └── credit-card.js
│   └── helpers/
│       ├── array.js
│       ├── object.js
│       └── string.js
└── models/
    ├── entities/
    │   ├── user.js
    │   ├── product.js
    │   └── order.js
    └── dtos/
        ├── user-dto.js
        ├── product-dto.js
        └── order-dto.js
```

### 3. Domain-Driven Organization

Organize by business domains.

**✅ Examples:**
```javascript
// Domain-driven structure
src/
├── domains/
│   ├── user/
│   │   ├── models/
│   │   │   ├── user.js
│   │   │   └── user-role.js
│   │   ├── services/
│   │   │   ├── user-service.js
│   │   │   └── user-validation.js
│   │   ├── components/
│   │   │   ├── user-profile.js
│   │   │   └── user-list.js
│   │   └── utils/
│   │       └── user-helpers.js
│   ├── product/
│   │   ├── models/
│   │   │   ├── product.js
│   │   │   └── product-category.js
│   │   ├── services/
│   │   │   ├── product-service.js
│   │   │   └── inventory-service.js
│   │   ├── components/
│   │   │   ├── product-list.js
│   │   │   └── product-details.js
│   │   └── utils/
│   │       └── product-helpers.js
│   └── order/
│       ├── models/
│       │   ├── order.js
│       │   └── order-item.js
│       ├── services/
│       │   ├── order-service.js
│       │   └── payment-service.js
│       ├── components/
│       │   ├── order-summary.js
│       │   └── order-history.js
│       └── utils/
│           └── order-helpers.js
```

## File Type Conventions

### 1. Component Files

Use descriptive names that indicate the component's purpose.

**✅ Examples:**
```javascript
// React/Vue/Angular components
user-profile.js
shopping-cart.js
product-list.js
navigation-menu.js
modal-dialog.js
form-input.js
button-primary.js
card-container.js
```

### 2. Service Files

Use descriptive names that indicate the service's responsibility.

**✅ Examples:**
```javascript
// Service files
user-service.js
product-service.js
order-service.js
payment-service.js
notification-service.js
email-service.js
api-service.js
data-service.js
```

### 3. Utility Files

Use descriptive names that indicate the utility's purpose.

**✅ Examples:**
```javascript
// Utility files
date-utils.js
string-utils.js
array-utils.js
object-utils.js
validation-utils.js
formatting-utils.js
helper-functions.js
common-utilities.js
```

### 4. Configuration Files

Use clear names that indicate what they configure.

**✅ Examples:**
```javascript
// Configuration files
config.js
environment.js
settings.js
constants.js
routes.js
middleware.js
plugins.js
```

### 5. Test Files

Use naming conventions that clearly indicate test files.

**✅ Examples:**
```javascript
// Test files
user-service.test.js
shopping-cart.spec.js
utils.test.js
components.test.js
integration.test.js
e2e.test.js
```

## TypeScript-Specific Considerations

### 1. File Extensions

Use appropriate file extensions for TypeScript files.

**✅ Examples:**
```javascript
// TypeScript files
user-service.ts
user-model.ts
user-interface.ts
user-types.ts
user-constants.ts
user-utils.ts
```

### 2. Module Organization

Use clear module structure with index files.

**✅ Examples:**
```javascript
// src/services/index.ts
export { UserService } from './user-service';
export { ProductService } from './product-service';
export { OrderService } from './order-service';

// src/models/index.ts
export { User } from './user-model';
export { Product } from './product-model';
export { Order } from './order-model';

// src/utils/index.ts
export * from './date-utils';
export * from './string-utils';
export * from './validation-utils';
```

### 3. Type Definitions

Use clear naming for type definition files.

**✅ Examples:**
```javascript
// Type definition files
user-types.ts
api-types.ts
component-types.ts
utility-types.ts
```

## Common Pitfalls and Solutions

### 1. Too Generic Names

**❌ Bad:**
```javascript
// utils.js - Too generic
// helpers.js - Too generic
// main.js - Too generic
// index.js - Too generic
```

**✅ Good:**
```javascript
// user-utils.js - Specific utility
// date-helpers.js - Specific helpers
// app-main.js - Specific main file
// user-service.js - Specific service
```

### 2. Inconsistent Naming

**❌ Bad:**
```javascript
// Mixed naming conventions
userUtils.js
shopping_cart.js
PaymentService.js
api-client.ts
```

**✅ Good:**
```javascript
// Consistent naming
user-utils.js
shopping-cart.js
payment-service.js
api-client.js
```

### 3. Unclear File Purpose

**❌ Bad:**
```javascript
// What does this file contain?
misc.js
common.js
shared.js
global.js
```

**✅ Good:**
```javascript
// Clear purpose
user-validation.js
date-formatting.js
api-helpers.js
config-loader.js
```

### 4. Deep Nesting

**❌ Bad:**
```javascript
// Too deep
src/components/user/profile/settings/preferences/theme/colors.js
```

**✅ Good:**
```javascript
// Reasonable depth
src/components/user/theme-colors.js
src/utils/theme/colors.js
```

## Best Practices Summary

1. **Use kebab-case**: `user-profile.js`, `shopping-cart.js`
2. **Be descriptive**: `user-service.js` instead of `service.js`
3. **Match primary export**: File name should match main export
4. **Use clear directory structure**: Logical organization
5. **Be consistent**: Same naming patterns throughout
6. **Avoid generic names**: `utils.js` → `user-utils.js`
7. **Use appropriate extensions**: `.ts` for TypeScript, `.js` for JavaScript
8. **Include test files**: `user-service.test.js`

## Examples in Context

### E-commerce Application
```javascript
src/
├── components/
│   ├── user/
│   │   ├── user-profile/
│   │   │   ├── user-profile.js
│   │   │   ├── user-avatar.js
│   │   │   └── user-settings.js
│   │   └── user-auth/
│   │       ├── login-form.js
│   │       ├── register-form.js
│   │       └── logout-button.js
│   ├── product/
│   │   ├── product-list/
│   │   │   ├── product-card.js
│   │   │   ├── product-filters.js
│   │   │   └── product-sort.js
│   │   └── product-details/
│   │       ├── product-image.js
│   │       ├── product-description.js
│   │       └── product-reviews.js
│   └── shopping-cart/
│       ├── cart-item.js
│       ├── cart-summary.js
│       └── checkout-button.js
├── services/
│   ├── user-service.js
│   ├── product-service.js
│   ├── order-service.js
│   ├── payment-service.js
│   └── notification-service.js
├── utils/
│   ├── date-utils.js
│   ├── currency-utils.js
│   ├── validation-utils.js
│   ├── api-utils.js
│   └── helper-utils.js
├── models/
│   ├── user-model.js
│   ├── product-model.js
│   ├── order-model.js
│   └── payment-model.js
└── types/
    ├── user-types.ts
    ├── product-types.ts
    ├── order-types.ts
    └── api-types.ts
```

### API Development
```javascript
src/
├── controllers/
│   ├── user-controller.js
│   ├── product-controller.js
│   ├── order-controller.js
│   └── auth-controller.js
├── services/
│   ├── user-service.js
│   ├── product-service.js
│   ├── order-service.js
│   └── auth-service.js
├── models/
│   ├── user-model.js
│   ├── product-model.js
│   ├── order-model.js
│   └── database-models.js
├── middleware/
│   ├── auth-middleware.js
│   ├── validation-middleware.js
│   ├── error-middleware.js
│   └── logging-middleware.js
├── utils/
│   ├── response-utils.js
│   ├── validation-utils.js
│   ├── error-utils.js
│   └── helper-utils.js
├── config/
│   ├── database.js
│   ├── server.js
│   ├── environment.js
│   └── constants.js
└── routes/
    ├── user-routes.js
    ├── product-routes.js
    ├── order-routes.js
    └── auth-routes.js
```

Remember: File and module names are the first thing developers see when navigating your codebase. Choose names that make it easy to understand what each file contains and how it fits into the overall application structure.