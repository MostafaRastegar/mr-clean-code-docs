---
paths:
  - "src/**/*.js"
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "**/*.js"
  - "**/*.ts"
  - "**/*.tsx"
---

# Code Organization

This directory contains comprehensive guidelines for organizing JavaScript and TypeScript code to improve maintainability, scalability, and team collaboration.

## Architectural Patterns

### ✅ Good Examples
```javascript
// Layered Architecture
// src/
// ├── services/     // Business logic
// ├── repositories/ // Data access
// ├── controllers/  // HTTP handlers
// ├── models/       // Data models
// └── utils/        // Shared utilities

class UserService {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  async createUser(userData) {
    const user = new User(userData);
    const savedUser = await this.userRepository.save(user);
    await this.emailService.sendWelcomeEmail(savedUser);
    return savedUser;
  }
}

// Repository Pattern
class UserRepository {
  async save(user) {
    return this.database.users.create(user);
  }

  async findById(id) {
    return this.database.users.findById(id);
  }
}
```

### ❌ Bad Examples
```javascript
// No clear architecture
// Everything mixed together
class UserManager {
  constructor() {
    this.users = [];
    this.emailProvider = new EmailProvider();
    this.logger = new Logger();
  }

  async createUser(userData) {
    // Business logic mixed with data access
    const user = { id: generateId(), ...userData };
    this.users.push(user);
    
    // Direct database access
    await this.database.save(user);
    
    // Direct email sending
    await this.emailProvider.send('welcome', user.email);
    
    return user;
  }
}
```

## Project Structure

### ✅ Good Examples
```javascript
// Feature-based organization
// src/
// ├── features/
// │   ├── auth/
// │   │   ├── components/
// │   │   ├── services/
// │   │   ├── types/
// │   │   └── index.ts
// │   ├── dashboard/
// │   │   ├── components/
// │   │   ├── services/
// │   │   └── index.ts
// │   └── users/
// │       ├── components/
// │       ├── services/
// │       └── index.ts
// ├── shared/
// │   ├── components/
// │   ├── utils/
// │   ├── types/
// │   └── constants/
// └── app/
//     ├── App.tsx
//     └── index.tsx

// Domain-driven structure
// src/
// ├── domains/
// │   ├── user/
// │   │   ├── entities/
// │   │   ├── services/
// │   │   ├── repositories/
// │   │   └── useCases/
// │   ├── order/
// │   │   ├── entities/
// │   │   ├── services/
// │   │   ├── repositories/
// │   │   └── useCases/
// │   └── product/
// │       ├── entities/
// │       ├── services/
// │       ├── repositories/
// │       └── useCases/
// ├── infrastructure/
// │   ├── database/
// │   ├── external/
// │   └── config/
// └── interfaces/
//     ├── api/
//     ├── web/
//     └── cli/
```

### ❌ Bad Examples
```javascript
// Flat structure - everything in one level
// src/
// ├── components/
// ├── services/
// ├── utils/
// ├── constants/
// ├── types/
// ├── helpers/
// ├── middleware/
// ├── routes/
// └── models/

// Technology-based organization (hard to scale)
// src/
// ├── react/
// ├── node/
// ├── database/
// ├── api/
// └── shared/
```

## Module Organization

### ✅ Good Examples
```javascript
// Clear module boundaries
// src/features/auth/index.ts
export { default as AuthProvider } from './components/AuthProvider';
export { default as useAuth } from './hooks/useAuth';
export { default as authRoutes } from './routes';
export type { AuthContextType, User } from './types';

// Barrel exports for clean imports
// src/shared/index.ts
export * from './components';
export * from './utils';
export * from './types';
export * from './constants';

// Internal module structure
// src/features/auth/services/authService.ts
import { UserRepository } from '../../user/repositories/UserRepository';
import { EmailService } from '../../shared/services/EmailService';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async login(credentials: LoginCredentials): Promise<User> {
    // Implementation
  }
}
```

### ❌ Bad Examples
```javascript
// Circular dependencies
// userService.js
import { orderService } from './orderService';

export const userService = {
  getUserOrders: (userId) => orderService.getOrdersByUser(userId)
};

// orderService.js
import { userService } from './userService';

export const orderService = {
  getOrdersByUser: (userId) => userService.getUserById(userId)
};

// No clear module boundaries
// Everything exported from one file
// src/index.js
export { Component1 } from './components/Component1';
export { Component2 } from './components/Component2';
export { Component3 } from './components/Component3';
// ... 50 more exports
```

## Naming Conventions

### ✅ Good Examples
```javascript
// Feature-based naming
// src/features/user/components/UserProfile.tsx
// src/features/user/services/UserService.ts
// src/features/user/types/user.ts

// Clear file naming
// components/
// ├── UserProfile.tsx
// ├── UserList.tsx
// ├── UserForm.tsx
// └── UserAvatar.tsx

// services/
// ├── UserService.ts
// ├── UserValidation.ts
// └── UserNotification.ts

// utilities/
// ├── formatDate.ts
// ├── validateEmail.ts
// └── generateId.ts

// Test files
// UserService.test.ts
// UserProfile.test.tsx
// userValidation.test.ts
```

### ❌ Bad Examples
```javascript
// Unclear naming
// src/
// ├── utils/
// │   ├── helper.js      // What does this help with?
// │   ├── common.js      // Too generic
// │   ├── tools.js       // What kind of tools?
// │   └── misc.js        // Should not exist
// ├── components/
// │   ├── comp1.js       // Not descriptive
// │   ├── comp2.js       // Not descriptive
// │   └── main.js        // Too generic
// └── services/
//     ├── service.js     // What service?
//     ├── api.js         // Too generic
//     └── data.js        // What data?
```

## Code Splitting

### ✅ Good Examples
```javascript
// Route-based code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

// Component-based code splitting
function ProductList() {
  const [showDetails, setShowDetails] = useState(false);
  
  const ProductDetails = lazy(() => import('./ProductDetails'));

  return (
    <div>
      <button onClick={() => setShowDetails(true)}>
        Show Details
      </button>
      {showDetails && (
        <Suspense fallback={<div>Loading...</div>}>
          <ProductDetails />
        </Suspense>
      )}
    </div>
  );
}

// Library-based code splitting
import { debounce } from 'lodash-es'; // Smaller bundle
// Instead of:
// import _ from 'lodash'; // Larger bundle

// Dynamic imports for heavy libraries
async function loadChartLibrary() {
  const { Chart } = await import('chart.js');
  return new Chart(ctx, config);
}
```

### ❌ Bad Examples
```javascript
// No code splitting
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
// ... Import everything at the top

function App() {
  return (
    <div>
      <Dashboard />
      <Profile />
      <Settings />
      {/* All components loaded immediately */}
    </div>
  );
}

// Importing entire libraries
import _ from 'lodash'; // Imports everything
import moment from 'moment'; // Large library

// No lazy loading for heavy components
function HeavyComponent() {
  // Component that takes time to render
  // Always loaded, even if not visible
}
```

## Code Review Checklist

- [ ] Project structure follows a clear architectural pattern
- [ ] Code is organized by feature or domain, not technology
- [ ] Module boundaries are well-defined and respected
- [ ] No circular dependencies between modules
- [ ] File and directory names are descriptive and consistent
- [ ] Barrel exports are used appropriately for clean imports
- [ ] Code splitting is implemented for performance
- [ ] Test files are co-located with source files
- [ ] Shared utilities are properly organized
- [ ] Dependencies are clearly defined and minimal
- [ ] Code follows consistent naming conventions
- [ ] Architecture supports scalability and maintainability