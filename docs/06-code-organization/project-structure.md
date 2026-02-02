# Project Structure

## Overview

A well-organized project structure is crucial for maintaining code quality, improving developer productivity, and ensuring long-term maintainability. This document provides guidelines for organizing JavaScript and TypeScript projects with clear separation of concerns and logical grouping.

## Recommended Directory Structures

### 1. Frontend Application Structure

**React/Vue/Angular Application:**
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (Button, Input, Modal)
│   ├── layout/          # Layout components (Header, Footer, Sidebar)
│   ├── pages/           # Page-level components
│   └── features/        # Feature-specific components
├── pages/               # Route-level components (if not in components/pages)
├── services/            # API services and external integrations
├── utils/               # Utility functions and helpers
├── hooks/               # Custom React hooks
├── store/               # State management (Redux, Zustand, Pinia)
├── types/               # TypeScript type definitions
├── constants/           # Application constants
├── styles/              # Global styles and CSS-in-JS
├── assets/              # Images, fonts, icons
├── __tests__/           # Test files
│   ├── __fixtures__/    # Test data
│   ├── __mocks__/       # Mock implementations
│   └── setup/          # Test configuration
└── config/              # Configuration files

public/                  # Static assets
├── index.html
├── manifest.json
└── robots.txt

tests/                   # E2E tests
docs/                    # Documentation
scripts/                 # Build and deployment scripts
```

**Example with TypeScript:**
```
src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   └── Input/
│   │       ├── Input.tsx
│   │       ├── Input.test.tsx
│   │       └── index.ts
│   ├── layout/
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.module.css
│   │   │   └── index.ts
│   │   └── Footer/
│   │       ├── Footer.tsx
│   │       └── index.ts
│   └── features/
│       ├── user/
│       │   ├── UserProfile.tsx
│       │   ├── UserSettings.tsx
│       │   └── index.ts
│       └── dashboard/
│           ├── Dashboard.tsx
│           ├── Dashboard.module.css
│           └── index.ts
├── pages/
│   ├── HomePage.tsx
│   ├── AboutPage.tsx
│   └── index.ts
├── services/
│   ├── api.ts
│   ├── auth.ts
│   ├── user.ts
│   └── types.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── useLocalStorage.ts
├── store/
│   ├── index.ts
│   ├── slices/
│   │   ├── authSlice.ts
│   │   └── userSlice.ts
│   └── middleware/
│       └── logger.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── helpers.ts
├── types/
│   ├── api.ts
│   ├── components.ts
│   └── store.ts
└── constants/
    ├── routes.ts
    └── messages.ts
```

### 2. Backend API Structure

**Node.js/Express Application:**
```
src/
├── controllers/         # Request handlers and business logic
├── services/           # Business logic and service layer
├── models/             # Data models and schemas
├── routes/             # Route definitions and middleware
├── middleware/         # Custom middleware functions
├── utils/              # Utility functions
├── config/             # Configuration files
├── database/           # Database connections and migrations
├── tests/              # Test files
├── types/              # TypeScript type definitions
├── helpers/            # Helper functions
├── validators/         # Input validation logic
└── constants/          # Application constants

public/                 # Static files
uploads/                # File uploads
docs/                   # API documentation
scripts/                # Database scripts, deployment scripts
```

**Example with TypeScript:**
```
src/
├── controllers/
│   ├── authController.ts
│   ├── userController.ts
│   └── productController.ts
├── services/
│   ├── authService.ts
│   ├── userService.ts
│   └── productService.ts
├── models/
│   ├── User.ts
│   ├── Product.ts
│   └── index.ts
├── routes/
│   ├── auth.ts
│   ├── users.ts
│   └── products.ts
├── middleware/
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── validation.ts
├── utils/
│   ├── logger.ts
│   ├── response.ts
│   └── helpers.ts
├── config/
│   ├── database.ts
│   ├── redis.ts
│   └── index.ts
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── index.ts
├── types/
│   ├── auth.ts
│   ├── user.ts
│   └── product.ts
└── constants/
    ├── httpStatus.ts
    └── messages.ts
```

### 3. Library/Packaged Structure

**NPM Package/Library:**
```
src/
├── index.ts            # Main entry point
├── core/               # Core functionality
├── utils/              # Utility functions
├── types/              # TypeScript definitions
├── constants/          # Package constants
└── helpers/            # Helper functions

dist/                   # Compiled output
types/                  # TypeScript declaration files
tests/                  # Test files
docs/                   # Package documentation
examples/               # Usage examples
scripts/                # Build and release scripts
```

## Separation of Concerns

### 1. Feature-Based Organization

Group related functionality by feature rather than by type:

**✅ Good Feature-Based Structure:**
```
src/
├── features/
│   ├── authentication/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   └── __tests__/
│   ├── dashboard/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   └── __tests__/
│   └── user-management/
│       ├── components/
│       ├── services/
│       ├── types/
│       └── __tests__/
├── shared/
│   ├── components/
│   ├── utils/
│   └── types/
└── app/
    ├── App.tsx
    ├── routes.ts
    └── store.ts
```

**❌ Poor Type-Based Structure:**
```
src/
├── components/          # Mix of all features
├── services/           # Mix of all features
├── types/              # Mix of all features
└── utils/              # Mix of all features
```

### 2. Layer-Based Organization

Organize code by architectural layers:

**✅ Good Layer-Based Structure:**
```
src/
├── presentation/       # UI components and presentation logic
│   ├── components/
│   ├── pages/
│   └── layouts/
├── application/        # Application services and use cases
│   ├── services/
│   ├── useCases/
│   └── dtos/
├── domain/            # Business logic and entities
│   ├── entities/
│   ├── repositories/
│   └── services/
└── infrastructure/    # External dependencies
    ├── database/
    ├── external-apis/
    └── config/
```

## Configuration and Build Files

### 1. Root Configuration Files

**Essential Configuration Files:**
```
package.json              # Project metadata and dependencies
tsconfig.json            # TypeScript configuration
.eslintrc.js             # ESLint configuration
.prettierrc              # Prettier formatting rules
jest.config.js           # Jest testing configuration
webpack.config.js        # Webpack build configuration
.env.example             # Environment variables template
.gitignore               # Git ignore rules
README.md                # Project documentation
```

**Advanced Configuration:**
```
babel.config.js          # Babel transpilation
postcss.config.js        # PostCSS configuration
tailwind.config.js       # Tailwind CSS configuration
vite.config.ts           # Vite configuration
next.config.js           # Next.js configuration
vue.config.js            # Vue.js configuration
angular.json             # Angular configuration
```

### 2. Environment-Specific Configuration

**Environment Configuration Structure:**
```
config/
├── development.json
├── staging.json
├── production.json
├── test.json
└── index.ts
```

**Example Configuration File:**
```typescript
// config/index.ts
interface Config {
  env: string;
  api: {
    baseUrl: string;
    timeout: number;
  };
  auth: {
    tokenKey: string;
    refreshTokenKey: string;
  };
  features: {
    darkMode: boolean;
    analytics: boolean;
  };
}

const configs: Record<string, Config> = {
  development: {
    env: 'development',
    api: {
      baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
      timeout: 5000
    },
    auth: {
      tokenKey: 'dev_token',
      refreshTokenKey: 'dev_refresh_token'
    },
    features: {
      darkMode: true,
      analytics: false
    }
  },
  production: {
    env: 'production',
    api: {
      baseUrl: process.env.REACT_APP_API_URL || 'https://api.example.com',
      timeout: 10000
    },
    auth: {
      tokenKey: 'prod_token',
      refreshTokenKey: 'prod_refresh_token'
    },
    features: {
      darkMode: true,
      analytics: true
    }
  }
};

export const config = configs[process.env.NODE_ENV || 'development'];
```

## Asset and Resource Management

### 1. Static Assets Organization

**Asset Structure:**
```
public/
├── images/
│   ├── icons/
│   │   ├── logo.svg
│   │   ├── favicon.ico
│   │   └── icons.svg
│   ├── illustrations/
│   └── backgrounds/
├── fonts/
│   ├── Inter/
│   │   ├── Inter-Regular.woff2
│   │   ├── Inter-Bold.woff2
│   │   └── Inter-Medium.woff2
│   └── Roboto/
└── documents/
    ├── privacy-policy.pdf
    └── terms-of-service.pdf

src/assets/
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── components/
├── data/
│   ├── countries.json
│   └── currencies.json
└── translations/
    ├── en.json
    └── fr.json
```

### 2. Media and Upload Management

**Upload Structure:**
```
uploads/
├── users/
│   ├── avatars/
│   └── documents/
├── products/
│   ├── images/
│   └── videos/
└── temp/               # Temporary uploads
```

## Monorepo Structure

### 1. Workspace-Based Monorepo

**Using Lerna or Yarn Workspaces:**
```
packages/
├── shared/
│   ├── components/
│   ├── utils/
│   └── types/
├── web-app/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── mobile-app/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── api/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
└── cli-tool/
    ├── src/
    ├── package.json
    └── tsconfig.json

tools/                    # Build tools and scripts
docs/                     # Documentation
lerna.json               # Lerna configuration
package.json             # Root package.json
```

### 2. Nx Workspace Structure

**Nx Monorepo Structure:**
```
apps/
├── web/
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── environments/
│   ├── project.json
│   └── tsconfig.json
├── api/
│   ├── src/
│   │   ├── app/
│   │   └── environments/
│   ├── project.json
│   └── tsconfig.json
└── mobile/
    ├── src/
    ├── project.json
    └── tsconfig.json

libs/
├── shared/
│   ├── ui/
│   ├── utils/
│   └── types/
├── features/
│   ├── auth/
│   ├── dashboard/
│   └── user-management/
└── data/
    ├── api/
    ├── models/
    └── services/

tools/                    # Nx tools and generators
docs/                     # Documentation
nx.json                  # Nx configuration
workspace.json           # Nx workspace configuration
```

## Microservices Structure

### 1. Service-Based Organization

**Individual Service Structure:**
```
services/
├── user-service/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   ├── tests/
│   ├── package.json
│   └── Dockerfile
├── order-service/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   ├── tests/
│   ├── package.json
│   └── Dockerfile
└── notification-service/
    ├── src/
    │   ├── controllers/
    │   ├── services/
    │   ├── models/
    │   ├── routes/
    │   └── middleware/
    ├── tests/
    ├── package.json
    └── Dockerfile

gateway/                  # API Gateway
shared/                   # Shared libraries
docker-compose.yml       # Service orchestration
kubernetes/              # K8s manifests
```

### 2. Domain-Driven Design Structure

**DDD Microservices Structure:**
```
services/
├── user-bounded-context/
│   ├── api/
│   ├── application/
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── repositories/
│   │   └── services/
│   └── infrastructure/
├── order-bounded-context/
│   ├── api/
│   ├── application/
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── repositories/
│   │   └── services/
│   └── infrastructure/
└── shared-kernel/
    ├── common/
    ├── events/
    └── types/
```

## Best Practices

### 1. Consistent Naming Conventions

**Directory and File Naming:**
- Use kebab-case for directories: `user-profile/`
- Use PascalCase for components: `UserProfile.tsx`
- Use camelCase for utilities: `formatDate.ts`
- Use kebab-case for styles: `user-profile.module.css`

**Example Structure:**
```
src/
├── components/
│   ├── user-profile/           # Directory
│   │   ├── UserProfile.tsx     # Component
│   │   ├── UserProfile.test.tsx
│   │   ├── UserProfile.module.css
│   │   └── index.ts
│   └── shopping-cart/          # Directory
│       ├── ShoppingCart.tsx    # Component
│       ├── ShoppingCart.test.tsx
│       └── index.ts
├── utils/
│   ├── formatDate.ts          # Utility
│   ├── validateEmail.ts       # Utility
│   └── constants.ts           # Constants
└── services/
    ├── api.ts                 # Service
    ├── auth.ts                # Service
    └── user.ts                # Service
```

### 2. Clear Import Paths

**Use Path Mapping:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/utils/*": ["src/utils/*"],
      "@/services/*": ["src/services/*"],
      "@/types/*": ["src/types/*"]
    }
  }
}
```

**Clean Import Statements:**
```typescript
// Instead of: ../../../components/Button
import { Button } from '@/components/Button';

// Instead of: ../../../utils/helpers
import { formatDate } from '@/utils/dateHelpers';
```

### 3. Module Boundaries

**Define Clear Boundaries:**
```typescript
// src/components/index.ts - Public API
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';

// src/services/index.ts - Public API
export { apiClient } from './api';
export { authService } from './auth';

// Internal modules should not be exported
// src/services/internal.ts - Private
```

### 4. Documentation Structure

**Project Documentation:**
```
docs/
├── README.md              # Project overview
├── ARCHITECTURE.md        # Architecture decisions
├── API.md                 # API documentation
├── DEPLOYMENT.md          # Deployment guide
├── CONTRIBUTING.md        # Contribution guidelines
├── CHANGELOG.md           # Version changes
├── TROUBLESHOOTING.md     # Common issues
└── design/
    ├── components.md      # Component documentation
    ├── patterns.md        # Design patterns
    └── decisions/         # ADRs (Architecture Decision Records)
```

## Common Anti-Patterns

### 1. God Directory

**❌ Bad: Everything in one place**
```
src/
├── everything/            # Too broad
│   ├── components/
│   ├── services/
│   ├── utils/
│   ├── types/
│   └── tests/
```

**✅ Good: Organized structure**
```
src/
├── components/
├── services/
├── utils/
├── types/
└── tests/
```

### 2. Deep Nesting

**❌ Bad: Too many nested levels**
```
src/
├── components/
│   ├── common/
│   │   ├── ui/
│   │   │   ├── buttons/
│   │   │   │   ├── primary/
│   │   │   │   │   ├── PrimaryButton.tsx
```

**✅ Good: Reasonable depth**
```
src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── index.ts
```

### 3. Mixed Concerns

**❌ Bad: Mixing different concerns**
```
src/
├── components/
│   ├── UserList.tsx       # Component
│   ├── api.ts            # Service
│   ├── types.ts          # Types
│   └── utils.ts          # Utilities
```

**✅ Good: Separated concerns**
```
src/
├── components/
│   └── UserList.tsx
├── services/
│   └── api.ts
├── types/
│   └── types.ts
└── utils/
    └── utils.ts
```

## Migration Strategies

### 1. From Flat to Structured

**Step-by-step migration:**
1. Analyze current structure and identify concerns
2. Create new directory structure
3. Move files incrementally by feature
4. Update import statements
5. Test thoroughly after each move
6. Update documentation

### 2. From Monolith to Microservices

**Migration approach:**
1. Identify bounded contexts
2. Extract shared libraries
3. Create service boundaries
4. Implement API contracts
5. Migrate data layer
6. Update deployment pipeline

## Tools and Automation

### 1. Project Scaffolding

**Use generators for consistency:**
```bash
# Create new component
npx create-component UserCard

# Create new feature
npx create-feature authentication

# Create new service
npx create-service user
```

### 2. Linting and Formatting

**Enforce structure with tools:**
```json
// .eslintrc.js
{
  "rules": {
    "import/no-unresolved": "error",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "pathGroups": [{
        "pattern": "@/**",
        "group": "internal",
        "position": "before"
      }]
    }]
  }
}
```

### 3. Documentation Generation

**Automate documentation:**
```typescript
// Generate component documentation
npm run generate:docs

// Update API documentation
npm run generate:api-docs
```

Remember: A well-organized project structure improves developer experience, reduces onboarding time, and makes the codebase more maintainable. Choose a structure that fits your project's needs and team preferences, and document your decisions for consistency.