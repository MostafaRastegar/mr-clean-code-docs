# API Documentation

## Overview

API documentation is crucial for enabling developers to understand and effectively use your APIs. This document provides comprehensive guidelines for creating clear, accurate, and useful API documentation for JavaScript and TypeScript applications.

## API Documentation Standards

### 1. OpenAPI/Swagger Specification

Use OpenAPI (formerly Swagger) for standardized API documentation:

```yaml
# openapi.yaml
openapi: 3.0.3
info:
  title: User Management API
  description: API for managing user accounts and profiles
  version: 1.0.0
  contact:
    name: API Support
    email: api-support@example.com
    url: https://example.com/support

servers:
  - url: https://api.example.com/v1
    description: Production server
  - url: https://staging-api.example.com/v1
    description: Staging server

paths:
  /users:
    get:
      summary: Get all users
      description: Retrieve a list of all users with optional filtering
      operationId: getUsers
      tags:
        - Users
      parameters:
        - name: page
          in: query
          description: Page number for pagination
          required: false
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          description: Number of users per page
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: role
          in: query
          description: Filter users by role
          required: false
          schema:
            type: string
            enum: [admin, user, guest]
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  users:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'

    post:
      summary: Create a new user
      description: Create a new user account
      operationId: createUser
      tags:
        - Users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/BadRequest'
        '409':
          description: User already exists
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /users/{id}:
    get:
      summary: Get user by ID
      description: Retrieve a specific user by their unique identifier
      operationId: getUserById
      tags:
        - Users
      parameters:
        - name: id
          in: path
          required: true
          description: User ID
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: User found
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/User'
        '404':
          $ref: '#/components/responses/NotFound'

    put:
      summary: Update user
      description: Update an existing user's information
      operationId: updateUser
      tags:
        - Users
      parameters:
        - name: id
          in: path
          required: true
          description: User ID
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateUserRequest'
      responses:
        '200':
          description: User updated successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/User'
        '404':
          $ref: '#/components/responses/NotFound'

    delete:
      summary: Delete user
      description: Delete a user account
      operationId: deleteUser
      tags:
        - Users
      parameters:
        - name: id
          in: path
          required: true
          description: User ID
          schema:
            type: string
            format: uuid
      responses:
        '204':
          description: User deleted successfully
        '404':
          $ref: '#/components/responses/NotFound'

components:
  schemas:
    User:
      type: object
      required:
        - id
        - name
        - email
        - role
        - createdAt
      properties:
        id:
          type: string
          format: uuid
          description: Unique user identifier
        name:
          type: string
          minLength: 2
          maxLength: 100
          description: User's full name
        email:
          type: string
          format: email
          description: User's email address
        role:
          type: string
          enum: [admin, user, guest]
          description: User's role in the system
        profile:
          $ref: '#/components/schemas/UserProfile'
        createdAt:
          type: string
          format: date-time
          description: Account creation timestamp
        updatedAt:
          type: string
          format: date-time
          description: Last update timestamp

    UserProfile:
      type: object
      properties:
        bio:
          type: string
          maxLength: 500
          description: User's biography
        avatar:
          type: string
          format: uri
          description: URL to user's avatar image
        preferences:
          type: object
          properties:
            theme:
              type: string
              enum: [light, dark, system]
              default: system
            notifications:
              type: boolean
              default: true
            language:
              type: string
              default: en

    CreateUserRequest:
      type: object
      required:
        - name
        - email
        - password
      properties:
        name:
          type: string
          minLength: 2
          maxLength: 100
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$'
        role:
          type: string
          enum: [admin, user, guest]
          default: user
        profile:
          $ref: '#/components/schemas/UserProfile'

    UpdateUserRequest:
      type: object
      properties:
        name:
          type: string
          minLength: 2
          maxLength: 100
        email:
          type: string
          format: email
        profile:
          $ref: '#/components/schemas/UserProfile'

    Pagination:
      type: object
      properties:
        page:
          type: integer
          minimum: 1
        limit:
          type: integer
          minimum: 1
          maximum: 100
        total:
          type: integer
          minimum: 0
        totalPages:
          type: integer
          minimum: 0

    Error:
      type: object
      required:
        - error
        - message
      properties:
        error:
          type: string
          description: Error type
        message:
          type: string
          description: Error message
        details:
          type: object
          description: Additional error details

  responses:
    BadRequest:
      description: Bad request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Forbidden:
      description: Access forbidden
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

security:
  - BearerAuth: []
```

### 2. TypeScript API Documentation

Document TypeScript APIs with comprehensive JSDoc comments:

```typescript
/**
 * User Management API Client
 * 
 * Provides methods for managing user accounts and profiles.
 * All methods require authentication via JWT token.
 * 
 * @example
 * ```typescript
 * const api = new UserApiClient('https://api.example.com');
 * api.setAuthToken('your-jwt-token');
 * 
 * const users = await api.getUsers({ page: 1, limit: 20 });
 * console.log(users);
 * ```
 */
export class UserApiClient {
  private readonly baseURL: string;
  private authToken: string | null = null;

  /**
   * Creates a new User API client instance
   * @param baseURL - The base URL of the API
   * @throws {Error} When baseURL is invalid
   */
  constructor(baseURL: string) {
    if (!baseURL || typeof baseURL !== 'string') {
      throw new Error('Invalid baseURL provided');
    }
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Sets the authentication token for API requests
   * @param token - JWT token for authentication
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Removes the authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Retrieves all users with optional filtering and pagination
   * 
   * @param options - Query options for filtering and pagination
   * @param options.page - Page number (default: 1)
   * @param options.limit - Number of users per page (default: 20, max: 100)
   * @param options.role - Filter by user role
   * @returns Promise resolving to paginated user list
   * 
   * @throws {ApiError} When API request fails
   * @throws {ValidationError} When query parameters are invalid
   * 
   * @example
   * ```typescript
   * const result = await api.getUsers({
   *   page: 1,
   *   limit: 50,
   *   role: 'admin'
   * });
   * ```
   */
  async getUsers(options: {
    page?: number;
    limit?: number;
    role?: 'admin' | 'user' | 'guest';
  } = {}): Promise<{
    users: User[];
    pagination: Pagination;
  }> {
    const { page = 1, limit = 20, role } = options;

    // Validate parameters
    if (page < 1) {
      throw new ValidationError('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (role) params.set('role', role);

    const response = await this.request(`/users?${params.toString()}`);
    return response.json();
  }

  /**
   * Retrieves a specific user by ID
   * 
   * @param id - The unique identifier of the user
   * @returns Promise resolving to user data
   * 
   * @throws {ApiError} When API request fails
   * @throws {NotFoundError} When user is not found
   * 
   * @example
   * ```typescript
   * const user = await api.getUserById('user-uuid-here');
   * console.log(user.name);
   * ```
   */
  async getUserById(id: string): Promise<User> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid user ID');
    }

    const response = await this.request(`/users/${encodeURIComponent(id)}`);
    return response.json();
  }

  /**
   * Creates a new user account
   * 
   * @param userData - User data for creation
   * @param userData.name - User's full name (2-100 characters)
   * @param userData.email - User's email address
   * @param userData.password - User's password (minimum 8 characters with uppercase, lowercase, and number)
   * @param userData.role - User's role (default: 'user')
   * @param userData.profile - Optional user profile data
   * @returns Promise resolving to created user
   * 
   * @throws {ApiError} When API request fails
   * @throws {ValidationError} When user data is invalid
   * @throws {ConflictError} When user already exists
   * 
   * @example
   * ```typescript
   * const newUser = await api.createUser({
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   password: 'SecurePass123!',
   *   role: 'admin'
   * });
   * ```
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    // Validate user data
    this.validateCreateUserData(userData);

    const response = await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (response.status === 409) {
      throw new ConflictError('User with this email already exists');
    }

    return response.json();
  }

  /**
   * Updates an existing user's information
   * 
   * @param id - The unique identifier of the user to update
   * @param updates - Partial user data to update
   * @param updates.name - Updated name (optional)
   * @param updates.email - Updated email (optional)
   * @param updates.profile - Updated profile data (optional)
   * @returns Promise resolving to updated user
   * 
   * @throws {ApiError} When API request fails
   * @throws {NotFoundError} When user is not found
   * @throws {ValidationError} When update data is invalid
   * 
   * @example
   * ```typescript
   * const updatedUser = await api.updateUser('user-uuid', {
   *   name: 'Jane Doe',
   *   profile: {
   *     bio: 'Updated biography'
   *   }
   * });
   * ```
   */
  async updateUser(id: string, updates: UpdateUserRequest): Promise<User> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid user ID');
    }

    // Validate update data
    this.validateUpdateUserData(updates);

    const response = await this.request(`/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });

    return response.json();
  }

  /**
   * Deletes a user account
   * 
   * @param id - The unique identifier of the user to delete
   * @returns Promise resolving when deletion is complete
   * 
   * @throws {ApiError} When API request fails
   * @throws {NotFoundError} When user is not found
   * 
   * @example
   * ```typescript
   * await api.deleteUser('user-uuid-here');
   * console.log('User deleted successfully');
   * ```
   */
  async deleteUser(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid user ID');
    }

    const response = await this.request(`/users/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });

    if (response.status !== 204) {
      throw new ApiError(`Unexpected response status: ${response.status}`);
    }
  }

  /**
   * Internal method for making authenticated API requests
   * @private
   */
  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = new Headers(options.headers);

    // Add authentication header if token is available
    if (this.authToken) {
      headers.set('Authorization', `Bearer ${this.authToken}`);
    }

    // Set default headers
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response;
  }

  /**
   * Handles API error responses
   * @private
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    switch (response.status) {
      case 400:
        throw new ValidationError(errorData.message, errorData.details);
      case 401:
        throw new AuthenticationError(errorData.message);
      case 403:
        throw new AuthorizationError(errorData.message);
      case 404:
        throw new NotFoundError(errorData.message);
      case 409:
        throw new ConflictError(errorData.message);
      default:
        throw new ApiError(errorData.message || 'An unexpected error occurred', response.status);
    }
  }

  /**
   * Validates user creation data
   * @private
   */
  private validateCreateUserData(data: CreateUserRequest): void {
    if (!data.name || data.name.length < 2 || data.name.length > 100) {
      throw new ValidationError('Name must be between 2 and 100 characters');
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email address');
    }

    if (!data.password || !this.isValidPassword(data.password)) {
      throw new ValidationError('Password must be at least 8 characters with uppercase, lowercase, and number');
    }
  }

  /**
   * Validates user update data
   * @private
   */
  private validateUpdateUserData(data: UpdateUserRequest): void {
    if (data.name && (data.name.length < 2 || data.name.length > 100)) {
      throw new ValidationError('Name must be between 2 and 100 characters');
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email address');
    }
  }

  /**
   * Validates email format
   * @private
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates password strength
   * @private
   */
  private isValidPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const isLongEnough = password.length >= 8;

    return hasUpperCase && hasLowerCase && hasNumber && isLongEnough;
  }
}

// Type definitions
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  bio?: string;
  avatar?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    language?: string;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user' | 'guest';
  profile?: UserProfile;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  profile?: UserProfile;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Custom error classes
export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public details?: any) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string) {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}
```

## API Documentation Best Practices

### 1. Comprehensive Endpoint Documentation

```typescript
/**
 * Product Catalog API
 * 
 * Manages product inventory and catalog operations.
 * Supports CRUD operations with advanced filtering and pagination.
 */
export class ProductApi {
  /**
   * Retrieves products with advanced filtering options
   * 
   * @param filters - Filter criteria for products
   * @param filters.category - Product category to filter by
   * @param filters.minPrice - Minimum price filter
   * @param filters.maxPrice - Maximum price filter
   * @param filters.inStock - Filter by stock availability
   * @param filters.search - Text search in product name and description
   * @param pagination - Pagination settings
   * @param pagination.page - Page number (1-based)
   * @param pagination.limit - Items per page (max 100)
   * @param sorting - Sorting options
   * @param sorting.field - Field to sort by
   * @param sorting.direction - Sort direction (asc/desc)
   * @returns Promise resolving to paginated product list
   * 
   * @example
   * ```typescript
   * // Get electronics under $500 in stock
   * const products = await api.getProducts({
   *   category: 'electronics',
   *   maxPrice: 500,
   *   inStock: true
   * }, {
   *   page: 1,
   *   limit: 20
   * }, {
   *   field: 'price',
   *   direction: 'asc'
   * });
   * ```
   */
  async getProducts(
    filters: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      inStock?: boolean;
      search?: string;
    } = {},
    pagination: { page?: number; limit?: number } = {},
    sorting: { field?: string; direction?: 'asc' | 'desc' } = {}
  ): Promise<{
    products: Product[];
    pagination: Pagination;
    filters: typeof filters;
    sorting: typeof sorting;
  }> {
    // Implementation here
    return {} as any;
  }

  /**
   * Creates a new product with validation
   * 
   * @param productData - Product data to create
   * @param productData.name - Product name (required, 2-200 chars)
   * @param productData.description - Product description (required, 10-2000 chars)
   * @param productData.price - Product price (required, > 0)
   * @param productData.category - Product category (required)
   * @param productData.sku - Stock keeping unit (required, unique)
   * @param productData.inventory - Inventory details (required)
   * @param productData.images - Product images (optional)
   * @returns Promise resolving to created product
   * 
   * @throws {ValidationError} When product data is invalid
   * @throws {ConflictError} When SKU already exists
   * 
   * @example
   * ```typescript
   * const newProduct = await api.createProduct({
   *   name: 'Wireless Headphones',
   *   description: 'High-quality wireless headphones with noise cancellation',
   *   price: 299.99,
   *   category: 'electronics',
   *   sku: 'WH-001',
   *   inventory: {
   *     quantity: 50,
   *     reserved: 5
   *   },
   *   images: ['https://example.com/image1.jpg']
   * });
   * ```
   */
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    // Implementation here
    return {} as any;
  }
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  inventory: Inventory;
  images: string[];
  specifications: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  quantity: number;
  reserved: number;
  lowStockThreshold: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  inventory: Inventory;
  images?: string[];
  specifications?: Record<string, any>;
}
```

### 2. Error Handling Documentation

```typescript
/**
 * Comprehensive error handling for API operations
 */
export class ApiErrorHandler {
  /**
   * Handles different types of API errors and provides user-friendly messages
   * 
   * @param error - The error to handle
   * @param context - Context information for the error
   * @returns Formatted error response
   */
  static handleApiError(error: any, context?: { operation: string; resource?: string }): ApiErrorResponse {
    if (error instanceof NetworkError) {
      return {
        type: 'network_error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        details: error.message,
        retryable: true
      };
    }

    if (error instanceof ValidationError) {
      return {
        type: 'validation_error',
        message: 'The provided data is invalid. Please check your input and try again.',
        details: error.details,
        retryable: true
      };
    }

    if (error instanceof AuthenticationError) {
      return {
        type: 'authentication_error',
        message: 'You need to be authenticated to perform this action.',
        details: 'Please log in and try again.',
        retryable: false
      };
    }

    if (error instanceof AuthorizationError) {
      return {
        type: 'authorization_error',
        message: 'You do not have permission to perform this action.',
        details: 'Contact your administrator if you believe this is an error.',
        retryable: false
      };
    }

    if (error instanceof NotFoundError) {
      return {
        type: 'not_found',
        message: 'The requested resource was not found.',
        details: context?.resource ? `The ${context.resource} you are looking for does not exist.` : undefined,
        retryable: false
      };
    }

    if (error instanceof ConflictError) {
      return {
        type: 'conflict',
        message: 'The operation could not be completed due to a conflict.',
        details: error.message,
        retryable: false
      };
    }

    // Generic server error
    return {
      type: 'server_error',
      message: 'An unexpected error occurred. Please try again later.',
      details: error.message || 'Unknown error',
      retryable: true
    };
  }
}

export interface ApiErrorResponse {
  type: 'network_error' | 'validation_error' | 'authentication_error' | 'authorization_error' | 'not_found' | 'conflict' | 'server_error';
  message: string;
  details?: string | Record<string, any>;
  retryable: boolean;
}

// Error classes
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}
```

### 3. Rate Limiting and Usage Guidelines

```typescript
/**
 * API Usage Guidelines
 * 
 * ## Rate Limits
 * 
 * The API enforces rate limits to ensure fair usage:
 * - **Free tier**: 100 requests per 15 minutes per user
 * - **Premium tier**: 1000 requests per 15 minutes per user
 * - **Enterprise tier**: 10,000 requests per 15 minutes per user
 * 
 * ## Best Practices
 * 
 * 1. **Implement exponential backoff** for failed requests
 * 2. **Use caching** for frequently accessed data
 * 3. **Batch operations** when possible
 * 4. **Handle rate limiting** gracefully
 * 5. **Monitor usage** through the dashboard
 * 
 * ## Error Handling
 * 
 * Always implement proper error handling:
 * ```typescript
 * try {
 *   const result = await api.getUsers({ page: 1 });
 *   // Handle success
 * } catch (error) {
 *   const handledError = ApiErrorHandler.handleApiError(error, {
 *     operation: 'getUsers',
 *     resource: 'users'
 *   });
 *   
 *   if (handledError.retryable) {
 *     // Implement retry logic
 *   } else {
 *     // Show error to user
 *   }
 * }
 * ```
 * 
 * ## Authentication
 * 
 * Use JWT tokens for authentication:
 * ```typescript
 * const api = new UserApiClient('https://api.example.com');
 * api.setAuthToken('your-jwt-token-here');
 * ```
 * 
 * Tokens expire after 15 minutes. Implement token refresh logic.
 */
export class ApiUsageGuidelines {
  // Implementation details
}
```

## API Documentation Tools

### 1. Auto-Generated Documentation

Use tools like TypeDoc, JSDoc, or OpenAPI generators:

```typescript
// typedoc.json
{
  "entryPoints": ["src/api/**/*.ts"],
  "out": "docs/api/",
  "name": "User Management API",
  "readme": "README.md",
  "excludePrivate": true,
  "excludeProtected": true,
  "includeVersion": true,
  "theme": "default",
  "hideGenerator": false,
  "gitRevision": "main"
}
```

### 2. Interactive Documentation

Create interactive API documentation with examples:

```typescript
/**
 * Interactive API Examples
 * 
 * These examples demonstrate common API usage patterns.
 */
export class ApiExamples {
  /**
   * Example: Creating a user and retrieving their profile
   */
  static async createUserExample(): Promise<void> {
    const api = new UserApiClient('https://api.example.com');
    api.setAuthToken('your-jwt-token');

    try {
      // Create user
      const newUser = await api.createUser({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'SecurePass123!',
        role: 'user'
      });

      console.log('User created:', newUser);

      // Get user profile
      const userProfile = await api.getUserById(newUser.id);
      console.log('User profile:', userProfile);

    } catch (error) {
      const handledError = ApiErrorHandler.handleApiError(error, {
        operation: 'createUser',
        resource: 'user'
      });
      console.error('Error:', handledError.message);
    }
  }

  /**
   * Example: Paginated user listing with error handling
   */
  static async paginatedUsersExample(): Promise<void> {
    const api = new UserApiClient('https://api.example.com');
    api.setAuthToken('your-jwt-token');

    let currentPage = 1;
    const users: User[] = [];

    try {
      while (true) {
        const result = await api.getUsers({
          page: currentPage,
          limit: 50
        });

        users.push(...result.users);

        if (currentPage >= result.pagination.totalPages) {
          break;
        }

        currentPage++;
      }

      console.log(`Retrieved ${users.length} users total`);

    } catch (error) {
      const handledError = ApiErrorHandler.handleApiError(error, {
        operation: 'getUsers',
        resource: 'users'
      });
      console.error('Error fetching users:', handledError.message);
    }
  }
}
```

## Summary

Effective API documentation should:

- **Be comprehensive** - Cover all endpoints, parameters, and responses
- **Include examples** - Provide real-world usage examples
- **Document errors** - Explain all possible error scenarios
- **Provide guidelines** - Include usage best practices and limitations
- **Be interactive** - Allow developers to test endpoints directly
- **Stay current** - Keep documentation in sync with API changes

Key components:
- **OpenAPI/Swagger specifications** for standardized documentation
- **TypeScript interfaces** for type safety and IntelliSense
- **Comprehensive JSDoc comments** for detailed explanations
- **Error handling documentation** for robust client implementation
- **Usage guidelines** for best practices and limitations
- **Interactive examples** for hands-on learning

Well-documented APIs lead to better developer experience, faster integration, and fewer support requests.