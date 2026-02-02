# TypeScript-Specific Naming

## Overview

TypeScript adds static typing to JavaScript, which provides additional opportunities and considerations for naming conventions. Proper naming in TypeScript helps leverage the type system effectively and improves code clarity.

## Core Principles

### 1. Use Type Information to Inform Names

Let TypeScript's type system help you choose appropriate names that are more specific and meaningful.

**❌ Bad:**
```typescript
let data: string; // Too generic
let items: any[]; // No type information
let config: object; // Too vague
```

**✅ Good:**
```typescript
let userJson: string; // Specific about what kind of string
let userNames: string[]; // Clear about array contents
let userConfig: UserConfig; // Specific type
```

### 2. Avoid Redundant Type Information in Names

Don't include type information that's already clear from the type annotation.

**❌ Bad:**
```typescript
let userString: string; // Redundant - we know it's a string
let userListArray: User[]; // Redundant - we know it's an array
let userObject: User; // Redundant - we know it's an object
let isUserBoolean: boolean; // Redundant - we know it's boolean
```

**✅ Good:**
```typescript
let userJson: string; // OK - specifies JSON format
let userList: User[]; // OK - "List" describes semantic meaning
let user: User; // OK - no redundant type info
let isValid: boolean; // OK - describes the boolean's purpose
```

### 3. Use Interface and Type Names Carefully

Interface and type names should describe capabilities and structure, not implementations.

**✅ Examples:**
```typescript
// Good interface names - describe capabilities
interface UserValidator {
  validate(user: User): ValidationResult;
}

interface DataProvider<T> {
  fetch(query: Query): Promise<T[]>;
}

interface EventHandler {
  handle(event: Event): void;
}

// Good type names - describe structure
type UserPreferences = {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
};

type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

type EventHandler<T extends Event> = (event: T) => void;
```

### 4. Use Generic Type Parameters Descriptively

Choose meaningful names for generic type parameters.

**❌ Bad:**
```typescript
function process<T>(data: T): T { /* ... */ }
function map<T, U>(array: T[], fn: (item: T) => U): U[] { /* ... */ }
```

**✅ Good:**
```typescript
function process<TData>(data: TData): TData { /* ... */ }
function map<TInput, TOutput>(array: TInput[], fn: (item: TInput) => TOutput): TOutput[] { /* ... */ }

// Even better with specific names
function processUserData<TUser>(user: TUser): TUser { /* ... */ }
function mapArray<TItem, TResult>(array: TItem[], mapper: (item: TItem) => TResult): TResult[] { /* ... */ }
```

## TypeScript Naming Patterns

### 1. Interface Naming

Use clear, descriptive names that indicate the interface's purpose.

**✅ Examples:**
```typescript
// Entity interfaces
interface User {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

// Service interfaces
interface UserService {
  getUser(id: string): Promise<User>;
  createUser(userData: CreateUserRequest): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
}

interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendTemplateEmail(template: EmailTemplate, data: any): Promise<void>;
}

// Utility interfaces
interface Validator<T> {
  validate(value: T): ValidationResult;
}

interface Mapper<TInput, TOutput> {
  map(input: TInput): TOutput;
}

interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### 2. Type Alias Naming

Use descriptive names that clearly indicate what the type represents.

**✅ Examples:**
```typescript
// Union types
type UserRole = 'admin' | 'user' | 'guest';
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
type Theme = 'light' | 'dark' | 'system';

// Object types
type UserCredentials = {
  email: string;
  password: string;
};

type ApiError = {
  code: string;
  message: string;
  details?: string;
};

type PaginationParams = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

// Function types
type EventHandler<T extends Event> = (event: T) => void;
type AsyncFunction<T> = () => Promise<T>;
type Middleware<T> = (context: T, next: () => Promise<void>) => Promise<void>;

// Generic types
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```

### 3. Enum Naming

Use PascalCase for enum names and UPPER_SNAKE_CASE for enum values.

**✅ Examples:**
```typescript
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}
```

### 4. Generic Constraints

Use descriptive names for constrained generic types.

**✅ Examples:**
```typescript
interface Comparable<T> {
  compareTo(other: T): number;
}

interface Serializable<T> {
  serialize(): T;
  deserialize(data: T): this;
}

interface Validatable<T> {
  validate(data: T): ValidationResult;
}

// Generic constraints
function processEntity<T extends BaseEntity>(entity: T): T {
  // Implementation
  return entity;
}

function createRepository<T extends BaseEntity>(
  entityType: new () => T
): Repository<T> {
  // Implementation
  return {} as Repository<T>;
}
```

## Advanced TypeScript Naming

### 1. Utility Types

Create utility types with clear, descriptive names.

**✅ Examples:**
```typescript
// Built-in utility types usage
type UserUpdateData = Partial<User>;
type UserCreationData = Omit<User, 'id' | 'createdAt'>;
type UserFields = Pick<User, 'name' | 'email'>;
type UserReadonly = Readonly<User>;

// Custom utility types
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type NonNullableFields<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```

### 2. Conditional Types

Use descriptive names for conditional type results.

**✅ Examples:**
```typescript
type IsString<T> = T extends string ? true : false;
type ExtractValueType<T> = T extends { value: infer V } ? V : never;
type NonNullableType<T> = T extends null | undefined ? never : T;

// More complex conditional types
type AsyncReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? R : never;
type ParameterType<T> = T extends (...args: infer P) => any ? P : never;
type InstanceType<T> = T extends abstract new (...args: any) => infer R ? R : never;
```

### 3. Mapped Types

Use clear names that indicate what the mapped type does.

**✅ Examples:**
```typescript
// Simple mapped types
type Optional<T> = {
  [P in keyof T]?: T[P];
};

type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

// More complex mapped types
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

type Proxy<T> = {
  get(): T;
  set(value: T): void;
};

type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]?: (value: T[K]) => void;
};
```

## Common Pitfalls and Solutions

### 1. Too Generic Type Names

**❌ Bad:**
```typescript
type Data = any;
type Item = any;
type Entity = any;
type Model = any;
```

**✅ Good:**
```typescript
type UserData = { name: string; email: string };
type ProductItem = { id: string; name: string; price: number };
type BaseEntity = { id: string; createdAt: Date };
type UserModel = { id: string; name: string; email: string };
```

### 2. Inconsistent Naming Patterns

**❌ Bad:**
```typescript
interface IUser { /* Interface prefix */ }
type userConfig = { /* lowercase */ }
enum UserRoleEnum { /* Enum suffix */ }
type TProduct = { /* Type prefix */ }
```

**✅ Good:**
```typescript
interface User { /* No prefix */ }
type UserConfig = { /* PascalCase */ }
enum UserRole { /* No suffix */ }
type Product = { /* No prefix */ }
```

### 3. Misleading Type Names

**❌ Bad:**
```typescript
type User = string; // Actually just a user ID
type Product = number; // Actually just a product count
type Order = boolean; // Actually just an order status
```

**✅ Good:**
```typescript
type UserId = string;
type ProductCount = number;
type OrderStatus = boolean;
```

### 4. Overly Complex Generic Names

**❌ Bad:**
```typescript
type ComplexGeneric<TInputType, TOutputType, TErrorType> = {
  process(input: TInputType): TOutputType;
  handleError(error: TErrorType): void;
};
```

**✅ Good:**
```typescript
type Processor<TInput, TOutput, TError> = {
  process(input: TInput): TOutput;
  handleError(error: TError): void;
};
```

## Best Practices Summary

1. **Leverage type information**: Use specific names that benefit from type annotations
2. **Avoid redundancy**: Don't repeat type information already in annotations
3. **Use descriptive interface names**: Focus on capabilities and purpose
4. **Choose meaningful generic names**: Use TInput, TOutput instead of T, U
5. **Follow TypeScript conventions**: PascalCase for types, UPPER_SNAKE_CASE for enums
6. **Be consistent**: Use the same naming patterns throughout your codebase
7. **Use utility types**: Leverage built-in and custom utility types for clarity
8. **Document complex types**: Add comments for complex generic or conditional types

## Examples in Context

### E-commerce Application
```typescript
// Entity types
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  inventory: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: Date;
}

// Enums
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// Service interfaces
interface UserService {
  getUserById(id: string): Promise<User | null>;
  createUser(userData: CreateUserRequest): Promise<User>;
  updateUser(id: string, updates: UpdateUserRequest): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

interface ProductService {
  getProductById(id: string): Promise<Product | null>;
  searchProducts(query: ProductSearchQuery): Promise<Product[]>;
  updateInventory(productId: string, quantity: number): Promise<void>;
}

// Request/Response types
type CreateUserRequest = Omit<User, 'id'>;
type UpdateUserRequest = Partial<Omit<User, 'id'>>;
type ProductSearchQuery = {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};

// Utility types
type OrderSummary = Pick<Order, 'id' | 'status' | 'total' | 'createdAt'>;
type ProductListItem = Pick<Product, 'id' | 'name' | 'price' | 'category'>;
type UserWithOrders = User & { orders: OrderSummary[] };
```

### API Development
```typescript
// API types
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// HTTP types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type HttpRequest<TBody = any> = {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: TBody;
};

type HttpResponse<TData = any> = {
  status: number;
  data: TData;
  headers: Record<string, string>;
};

// Middleware types
type Middleware<TContext> = (
  context: TContext,
  next: () => Promise<void>
) => Promise<void>;

type RequestHandler<TRequest = any, TResponse = any> = (
  request: TRequest
) => Promise<TResponse>;

// Validation types
interface ValidationRule<T> {
  field: keyof T;
  validator: (value: any) => boolean;
  message: string;
}

type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

// Configuration types
type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
};

type ServerConfig = {
  port: number;
  host: string;
  environment: 'development' | 'production' | 'test';
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
};
```

Remember: TypeScript naming should leverage the type system to create self-documenting code. Good names combined with strong typing make your code more maintainable and less error-prone.