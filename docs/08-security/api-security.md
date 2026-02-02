# API Security

## Overview

API security is crucial for protecting your application's endpoints from malicious attacks and ensuring data integrity. This document provides comprehensive guidelines for securing RESTful and GraphQL APIs, including authentication, authorization, rate limiting, input validation, and security best practices.

## Authentication and Authorization

### 1. API Authentication Strategies

**JWT-Based Authentication:**
```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

class APIAuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  // Generate access and refresh tokens
  generateTokens(user: { id: string; email: string; role: string; permissions: string[] }): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.TOKEN_EXPIRY,
      issuer: 'api.yourapp.com',
      audience: 'yourapp-users'
    });

    const refreshToken = jwt.sign(
      { userId: user.id },
      this.JWT_SECRET,
      {
        expiresIn: this.REFRESH_TOKEN_EXPIRY
      }
    );

    return { accessToken, refreshToken };
  }

  // Verify access token
  verifyAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // Refresh access token
  refreshAccessToken(refreshToken: string): string | null {
    try {
      const payload = jwt.verify(refreshToken, this.JWT_SECRET) as { userId: string };
      
      // In a real application, you'd verify the refresh token exists in your database
      // and hasn't been revoked
      
      const newPayload: JWTPayload = {
        userId: payload.userId,
        email: '', // Fetch from database
        role: '', // Fetch from database
        permissions: [] // Fetch from database
      };

      return jwt.sign(newPayload, this.JWT_SECRET, {
        expiresIn: this.TOKEN_EXPIRY,
        issuer: 'api.yourapp.com',
        audience: 'yourapp-users'
      });
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }
}

// Express middleware for API authentication
function authenticateAPI(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const authService = new APIAuthService();
  const payload = authService.verifyAccessToken(token);

  if (!payload) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }

  // Attach user info to request
  req.user = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    permissions: payload.permissions
  };

  next();
}

// Usage in routes
app.get('/api/users/profile', authenticateAPI, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
});
```

**API Key Authentication:**
```typescript
class APIKeyAuthService {
  private readonly API_KEYS = new Map<string, APIKeyInfo>();

  constructor() {
    // Load API keys from database
    this.loadAPIKeys();
  }

  private async loadAPIKeys(): Promise<void> {
    // In production, load from database
    const keys = await this.fetchAPIKeysFromDB();
    keys.forEach(key => this.API_KEYS.set(key.key, key));
  }

  // Validate API key
  validateAPIKey(key: string, requiredScopes?: string[]): APIKeyValidationResult {
    const keyInfo = this.API_KEYS.get(key);
    
    if (!keyInfo) {
      return {
        valid: false,
        error: 'Invalid API key'
      };
    }

    if (keyInfo.revoked) {
      return {
        valid: false,
        error: 'API key has been revoked'
      };
    }

    if (keyInfo.expiresAt && new Date() > keyInfo.expiresAt) {
      return {
        valid: false,
        error: 'API key has expired'
      };
    }

    if (requiredScopes) {
      const hasRequiredScopes = requiredScopes.every(scope => 
        keyInfo.scopes.includes(scope)
      );
      
      if (!hasRequiredScopes) {
        return {
          valid: false,
          error: 'Insufficient permissions'
        };
      }
    }

    return {
      valid: true,
      keyInfo
    };
  }

  // Generate new API key
  generateAPIKey(name: string, scopes: string[], expiresAt?: Date): string {
    const key = this.generateSecureKey();
    
    const keyInfo: APIKeyInfo = {
      key,
      name,
      scopes,
      createdAt: new Date(),
      expiresAt,
      revoked: false,
      usageCount: 0
    };

    this.API_KEYS.set(key, keyInfo);
    this.saveAPIKey(keyInfo);
    
    return key;
  }

  private generateSecureKey(): string {
    const crypto = require('crypto');
    return 'ak_' + crypto.randomBytes(32).toString('hex');
  }

  private async saveAPIKey(keyInfo: APIKeyInfo): Promise<void> {
    // Save to database
  }

  private async fetchAPIKeysFromDB(): Promise<APIKeyInfo[]> {
    // Fetch from database
    return [];
  }
}

interface APIKeyInfo {
  key: string;
  name: string;
  scopes: string[];
  createdAt: Date;
  expiresAt?: Date;
  revoked: boolean;
  usageCount: number;
}

interface APIKeyValidationResult {
  valid: boolean;
  error?: string;
  keyInfo?: APIKeyInfo;
}

// Middleware for API key authentication
function authenticateAPIKey(requiredScopes?: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key required'
      });
    }

    const authService = new APIKeyAuthService();
    const result = authService.validateAPIKey(apiKey, requiredScopes);

    if (!result.valid) {
      return res.status(403).json({
        success: false,
        error: result.error
      });
    }

    // Increment usage count
    result.keyInfo!.usageCount++;
    
    // Attach key info to request
    req.apiKey = result.keyInfo;
    
    next();
  };
}

// Usage in routes
app.get('/api/data', authenticateAPIKey(['read:data']), async (req, res) => {
  const data = await DataService.getData();
  res.json({
    success: true,
    data
  });
});
```

### 2. Role-Based Access Control (RBAC)

**Permission-Based Authorization:**
```typescript
type Permission = 
  | 'read:users'
  | 'write:users'
  | 'delete:users'
  | 'read:posts'
  | 'write:posts'
  | 'delete:posts'
  | 'admin:all';

class PermissionService {
  private readonly rolePermissions: Record<string, Permission[]> = {
    admin: ['admin:all'],
    moderator: ['read:users', 'read:posts', 'write:posts', 'delete:posts'],
    editor: ['read:posts', 'write:posts'],
    user: ['read:posts'],
    guest: []
  };

  // Check if user has permission
  hasPermission(user: { role: string; permissions: Permission[] }, permission: Permission): boolean {
    // Check direct permissions
    if (user.permissions.includes(permission)) {
      return true;
    }

    // Check role-based permissions
    const rolePermissions = this.rolePermissions[user.role] || [];
    
    // Admin has all permissions
    if (rolePermissions.includes('admin:all')) {
      return true;
    }

    return rolePermissions.includes(permission);
  }

  // Check if user can perform action on resource
  canAccessResource(
    user: { role: string; permissions: Permission[] },
    resource: string,
    action: string
  ): boolean {
    const permission = `${action}:${resource}` as Permission;
    return this.hasPermission(user, permission);
  }

  // Check resource ownership
  isResourceOwner(user: { id: string }, resource: { userId?: string; ownerId?: string }): boolean {
    return resource.userId === user.id || resource.ownerId === user.id;
  }
}

// Authorization middleware
function authorize(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const permissionService = new PermissionService();
    
    if (!permissionService.hasPermission(user, permission)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
}

// Ownership-based authorization
function authorizeOwnership(resourceIdParam: string = 'id') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;
    const resourceId = req.params[resourceIdParam];
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    try {
      const resource = await Resource.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
      }

      const permissionService = new PermissionService();
      
      if (!permissionService.isResourceOwner(user, resource) && 
          !permissionService.hasPermission(user, 'admin:all')) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}

// Usage examples
app.get('/api/users/:id', authenticateAPI, authorize('read:users'), authorizeOwnership('id'), async (req, res) => {
  res.json({
    success: true,
    data: req.resource
  });
});

app.put('/api/posts/:id', authenticateAPI, authorize('write:posts'), authorizeOwnership('id'), async (req, res) => {
  const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({
    success: true,
    data: updatedPost
  });
});
```

## Rate Limiting and Throttling

### 1. Basic Rate Limiting

**IP-Based Rate Limiting:**
```typescript
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';

// Redis-based rate limiter
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
});

class RateLimitService {
  private readonly redisStore = new (require('rate-limit-redis'))({
    sendCommand: (...args: string[]) => redis.call(...args),
  });

  // Create rate limiter
  createRateLimiter(config: RateLimitConfig): any {
    return rateLimit({
      store: this.redisStore,
      windowMs: config.windowMs,
      max: config.max,
      message: {
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil(config.windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req: Request) => this.shouldSkipRateLimit(req),
      keyGenerator: (req: Request) => this.generateRateLimitKey(req)
    });
  }

  private shouldSkipRateLimit(req: Request): boolean {
    // Skip rate limiting for certain conditions
    if (req.headers['x-api-key'] && this.isTrustedClient(req.headers['x-api-key'] as string)) {
      return true;
    }

    if (req.user && req.user.role === 'admin') {
      return true;
    }

    return false;
  }

  private generateRateLimitKey(req: Request): string {
    // Use IP address as key, but consider using user ID for authenticated requests
    if (req.user) {
      return `user:${req.user.id}`;
    }
    
    return `ip:${req.ip}`;
  }

  private isTrustedClient(apiKey: string): boolean {
    // Check if API key belongs to a trusted client
    return false; // Implementation depends on your logic
  }
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
  skip?: (req: Request) => boolean;
  keyGenerator?: (req: Request) => string;
}

// Usage examples
const rateLimitService = new RateLimitService();

// General API rate limiting
app.use('/api/', rateLimitService.createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Strict rate limiting for authentication endpoints
app.use('/api/auth/', rateLimitService.createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
}));

// High-volume API for premium users
app.use('/api/premium/', rateLimitService.createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 1000 // limit each user to 1000 requests per minute
}));
```

### 2. Advanced Rate Limiting

**Tiered Rate Limiting:**
```typescript
class TieredRateLimitService {
  private readonly tiers = {
    free: { requestsPerMinute: 60, requestsPerHour: 1000 },
    premium: { requestsPerMinute: 600, requestsPerHour: 10000 },
    enterprise: { requestsPerMinute: 5000, requestsPerHour: 100000 }
  };

  // Create tiered rate limiter
  createTieredRateLimiter(): any {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user = req.user;
      const clientKey = this.getClientKey(req);

      if (!user) {
        // Apply default rate limits for unauthenticated requests
        await this.applyDefaultLimits(req, res, next);
        return;
      }

      const tier = this.getUserTier(user);
      const limits = this.tiers[tier];

      const minuteKey = `rate:${clientKey}:minute`;
      const hourKey = `rate:${clientKey}:hour`;

      const now = Date.now();
      const minuteWindow = 60 * 1000;
      const hourWindow = 60 * 60 * 1000;

      try {
        // Check minute limit
        const minuteCount = await this.incrementCounter(minuteKey, minuteWindow);
        if (minuteCount > limits.requestsPerMinute) {
          return this.sendRateLimitError(res, 'minute', limits.requestsPerMinute, minuteWindow);
        }

        // Check hour limit
        const hourCount = await this.incrementCounter(hourKey, hourWindow);
        if (hourCount > limits.requestsPerHour) {
          return this.sendRateLimitError(res, 'hour', limits.requestsPerHour, hourWindow);
        }

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit-Minute', limits.requestsPerMinute);
        res.setHeader('X-RateLimit-Remaining-Minute', limits.requestsPerMinute - minuteCount);
        res.setHeader('X-RateLimit-Limit-Hour', limits.requestsPerHour);
        res.setHeader('X-RateLimit-Remaining-Hour', limits.requestsPerHour - hourCount);

        next();
      } catch (error) {
        console.error('Rate limiting error:', error);
        next(); // Don't block requests if rate limiting fails
      }
    };
  }

  private async applyDefaultLimits(req: Request, res: Response, next: NextFunction): Promise<void> {
    const clientKey = this.getClientKey(req);
    const defaultLimits = { requestsPerMinute: 10, requestsPerHour: 100 };
    const minuteKey = `rate:${clientKey}:minute`;
    const minuteWindow = 60 * 1000;

    try {
      const minuteCount = await this.incrementCounter(minuteKey, minuteWindow);
      if (minuteCount > defaultLimits.requestsPerMinute) {
        return this.sendRateLimitError(res, 'minute', defaultLimits.requestsPerMinute, minuteWindow);
      }

      next();
    } catch (error) {
      next();
    }
  }

  private getUserTier(user: any): keyof typeof this.tiers {
    // Determine user tier based on subscription or other criteria
    if (user.subscription === 'enterprise') {
      return 'enterprise';
    } else if (user.subscription === 'premium') {
      return 'premium';
    }
    return 'free';
  }

  private getClientKey(req: Request): string {
    if (req.user) {
      return `user:${req.user.id}`;
    }
    
    if (req.headers['x-api-key']) {
      return `api:${req.headers['x-api-key']}`;
    }
    
    return `ip:${req.ip}`;
  }

  private async incrementCounter(key: string, windowMs: number): Promise<number> {
    const now = Date.now();
    const pipeline = redis.pipeline();
    
    // Remove expired entries
    pipeline.zremrangebyscore(key, 0, now - windowMs);
    
    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    
    // Count entries in window
    pipeline.zcard(key);
    
    // Set expiration
    pipeline.expire(key, Math.ceil(windowMs / 1000));
    
    const results = await pipeline.exec();
    return results?.[3]?.[1] as number || 0;
  }

  private sendRateLimitError(res: Response, window: string, limit: number, windowMs: number): void {
    res.status(429).json({
      success: false,
      error: `Rate limit exceeded. Maximum ${limit} requests per ${window}.`,
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }
}
```

## Input Validation and Sanitization

### 1. Request Validation

**Comprehensive Input Validation:**
```typescript
import Joi from 'joi';

class APIValidationService {
  // Validate request body
  validateBody(schema: Joi.Schema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error, value } = schema.validate(req.body, { abortEarly: false });
      
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }))
        });
      }
      
      req.body = value;
      next();
    };
  }

  // Validate query parameters
  validateQuery(schema: Joi.Schema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error, value } = schema.validate(req.query, { abortEarly: false });
      
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }))
        });
      }
      
      req.query = value;
      next();
    };
  }

  // Validate path parameters
  validateParams(schema: Joi.Schema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error, value } = schema.validate(req.params, { abortEarly: false });
      
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid path parameters',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }))
        });
      }
      
      req.params = value;
      next();
    };
  }

  // Validate headers
  validateHeaders(schema: Joi.Schema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error, value } = schema.validate(req.headers, { abortEarly: false });
      
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid headers',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }))
        });
      }
      
      req.headers = value;
      next();
    };
  }
}

// Usage examples
const validationService = new APIValidationService();

// User creation validation
const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  age: Joi.number().integer().min(18).max(120),
  role: Joi.string().valid('user', 'admin', 'moderator').default('user')
});

app.post('/api/users', 
  validationService.validateBody(createUserSchema),
  authenticateAPI,
  authorize('write:users'),
  async (req, res) => {
    // Create user logic
  }
);

// Query parameter validation
const listUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('name', 'email', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().max(100).allow('')
});

app.get('/api/users',
  validationService.validateQuery(listUsersSchema),
  authenticateAPI,
  authorize('read:users'),
  async (req, res) => {
    // List users logic
  }
);

// Path parameter validation
const userParamsSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

app.get('/api/users/:id',
  validationService.validateParams(userParamsSchema),
  authenticateAPI,
  authorize('read:users'),
  async (req, res) => {
    // Get user logic
  }
);
```

### 2. Data Sanitization

**Input Sanitization:**
```typescript
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

class InputSanitizationService {
  // Sanitize text input
  sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove potentially dangerous characters
    let sanitized = input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/file:/gi, '') // Remove file: protocol
      .replace(/\.\./g, '') // Remove directory traversal
      .replace(/[\/\\]/g, '') // Remove path separators
      .replace(/[<>:"|?*]/g, ''); // Remove special characters

    // Limit length
    if (sanitized.length > 1000) {
      sanitized = sanitized.substring(0, 1000);
    }

    return sanitized;
  }

  // Sanitize HTML content
  sanitizeHTML(html: string): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'a'],
      ALLOWED_ATTR: ['href', 'target'],
      FORBID_SCRIPT: true,
      ALLOW_DATA_ATTR: false
    });
  }

  // Sanitize file paths
  sanitizeFilePath(path: string): string {
    if (!path || typeof path !== 'string') {
      return '';
    }

    return path
      .replace(/\.\./g, '')
      .replace(/[<>:"|?*]/g, '')
      .replace(/[/\\]/g, '')
      .trim();
  }

  // Sanitize SQL input
  sanitizeSQL(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/'/g, "''") // Escape single quotes
      .replace(/;/g, '') // Remove semicolons
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*.*?\*\//g, '') // Remove block comments
      .trim();
  }

  // Validate and sanitize email
  sanitizeEmail(email: string): string | null {
    if (!email || typeof email !== 'string') {
      return null;
    }

    const sanitized = email.trim().toLowerCase();
    
    if (!validator.isEmail(sanitized)) {
      return null;
    }

    return sanitized;
  }

  // Validate and sanitize URL
  sanitizeURL(url: string): string | null {
    if (!url || typeof url !== 'string') {
      return null;
    }

    const sanitized = url.trim();
    
    if (!validator.isURL(sanitized, {
      protocols: ['http', 'https'],
      require_protocol: true
    })) {
      return null;
    }

    return sanitized;
  }

  // Sanitize entire request
  sanitizeRequest(req: Request): void {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      this.sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      this.sanitizeObject(req.query);
    }

    // Sanitize path parameters
    if (req.params && typeof req.params === 'object') {
      this.sanitizeObject(req.params);
    }
  }

  private sanitizeObject(obj: any): void {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      
      if (typeof value === 'string') {
        obj[key] = this.sanitizeText(value);
      } else if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          obj[key] = value.map(item => 
            typeof item === 'string' ? this.sanitizeText(item) : item
          );
        } else {
          this.sanitizeObject(value);
        }
      }
    });
  }
}

// Middleware for input sanitization
function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  const sanitizationService = new InputSanitizationService();
  sanitizationService.sanitizeRequest(req);
  next();
}

// Usage
app.use('/api/', sanitizeInput);
```

## Security Headers and CORS

### 1. Security Headers

**Comprehensive Security Headers:**
```typescript
import helmet from 'helmet';

class SecurityHeadersService {
  // Configure security headers
  configureSecurityHeaders() {
    return helmet({
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
          imgSrc: ["'self'", "data:", "https:"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          connectSrc: ["'self'", "https://api.yourapp.com"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: []
        },
        reportOnly: false
      },

      // Cross-Origin Embedder Policy
      crossOriginEmbedderPolicy: false, // Adjust based on your needs

      // Cross-Origin Opener Policy
      crossOriginOpenerPolicy: { policy: "same-origin" },

      // Cross-Origin Resource Policy
      crossOriginResourcePolicy: { policy: "cross-origin" },

      // DNS Prefetch Control
      dnsPrefetchControl: { allow: false },

      // Expect Certificate Transparency
      expectCt: {
        maxAge: 86400,
        enforce: true,
        reportUri: 'https://yourapp.report-uri.com/r/ct/report'
      },

      // Frameguard
      frameguard: { action: 'deny' },

      // Hide Powered By
      hidePoweredBy: true,

      // HTTP Strict Transport Security
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },

      // IE No Open
      ieNoOpen: true,

      // No Sniff
      noSniff: true,

      // Origin Agent Cluster
      originAgentCluster: true,

      // Permissions Policy (Feature Policy)
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: [],
        usb: []
      },

      // Referrer Policy
      referrerPolicy: { policy: ["no-referrer"] },

      // X-Content-Type-Options
      xssFilter: true
    });
  }

  // Custom security headers
  addCustomHeaders() {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Remove sensitive headers
      res.removeHeader('X-Powered-By');
      res.removeHeader('Server');

      // Add custom security headers
      res.setHeader('X-API-Version', 'v1');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');

      // API-specific headers
      res.setHeader('X-RateLimit-Policy', 'See documentation for rate limits');
      res.setHeader('X-Security-Contact', 'security@yourapp.com');

      next();
    };
  }
}

// Usage
const securityHeadersService = new SecurityHeadersService();
app.use(securityHeadersService.configureSecurityHeaders());
app.use(securityHeadersService.addCustomHeaders());
```

### 2. CORS Configuration

**Secure CORS Configuration:**
```typescript
import cors from 'cors';

class CORSService {
  // Configure CORS for production
  configureCORSProduction() {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    
    return cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-API-Key',
        'X-Requested-With',
        'X-CSRF-Token'
      ],
      exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
      maxAge: 86400, // 24 hours
      optionsSuccessStatus: 200
    });
  }

  // Configure CORS for development
  configureCORSDevelopment() {
    return cors({
      origin: true, // Allow all origins in development
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['*'],
      exposedHeaders: ['*']
    });
  }

  // Dynamic CORS based on environment
  configureCORS() {
    if (process.env.NODE_ENV === 'production') {
      return this.configureCORSProduction();
    }
    return this.configureCORSDevelopment();
  }

  // API-specific CORS
  configureAPICORS() {
    return cors({
      origin: (origin, callback) => {
        const allowedAPIOrigins = [
          'https://api-client.yourapp.com',
          'https://dashboard.yourapp.com'
        ];
        
        if (!origin || allowedAPIOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by API CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-API-Key',
        'X-API-Version'
      ],
      exposedHeaders: [
        'X-API-Version',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining'
      ]
    });
  }
}

// Usage
const corsService = new CORSService();
app.use(corsService.configureCORS());

// API-specific CORS
app.use('/api/v1/', corsService.configureAPICORS());
```

## GraphQL Security

### 1. GraphQL Security Best Practices

**GraphQL Security Implementation:**
```typescript
import { ApolloServer } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import { createComplexityLimitRule } from 'graphql-query-complexity';
import { shield, rule, and, or } from 'graphql-shield';
import { makeExecutableSchema } from '@graphql-tools/schema';

// GraphQL schema with security rules
const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    publishedAt: String!
  }

  type Query {
    users: [User!]! @auth(requires: ADMIN)
    user(id: ID!): User @auth(requires: USER)
    posts: [Post!]! @auth(requires: USER)
    post(id: ID!): Post @auth(requires: USER)
  }

  type Mutation {
    createUser(input: CreateUserInput!): User! @auth(requires: ADMIN)
    updateUser(id: ID!, input: UpdateUserInput!): User! @auth(requires: USER)
    deleteUser(id: ID!): Boolean! @auth(requires: ADMIN)
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
  }

  input UpdateUserInput {
    name: String
    email: String
  }
`;

// Authentication rules
const isAuthenticated = rule({ cache: 'contextual' })(
  async (parent, args, context) => {
    return context.user !== null;
  }
);

const isAdmin = rule({ cache: 'contextual' })(
  async (parent, args, context) => {
    return context.user && context.user.role === 'ADMIN';
  }
);

const isOwnerOrAdmin = rule({ cache: 'strict' })(
  async (parent, args, context) => {
    const user = context.user;
    if (!user) return false;
    
    // Allow admin access to everything
    if (user.role === 'ADMIN') return true;
    
    // For user operations, check ownership
    if (args.id && user.id !== args.id) return false;
    
    return true;
  }
);

// Shield rules
const permissions = shield({
  Query: {
    users: and(isAuthenticated, isAdmin),
    user: and(isAuthenticated, or(isOwnerOrAdmin, isAdmin)),
    posts: isAuthenticated,
    post: isAuthenticated
  },
  Mutation: {
    createUser: and(isAuthenticated, isAdmin),
    updateUser: and(isAuthenticated, isOwnerOrAdmin),
    deleteUser: and(isAuthenticated, isAdmin)
  },
  User: and(isAuthenticated, or(isOwnerOrAdmin, isAdmin)),
  Post: isAuthenticated
});

// Custom validation rules
const customValidationRules = [
  // Depth limit
  depthLimit(10),
  
  // Complexity limit
  createComplexityLimitRule(1000, {
    maximumComplexity: 1000,
    variables: {},
    createError: (max: number, actual: number) => {
      return new Error(`Query complexity ${actual} exceeds maximum complexity ${max}`);
    }
  })
];

// GraphQL server configuration
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: {
    auth: AuthDirective
  }
});

const server = new ApolloServer({
  schema,
  context: ({ req }) => {
    // Extract user from request
    const user = extractUserFromRequest(req);
    return { user };
  },
  validationRules: [...customValidationRules, permissions],
  formatError: (error) => {
    // Don't expose internal errors to clients
    if (error.message.startsWith('Database Error')) {
      return new Error('Internal server error');
    }
    return error;
  },
  formatResponse: (response) => {
    // Sanitize response data
    return sanitizeResponse(response);
  },
  introspection: process.env.NODE_ENV === 'development',
  playground: process.env.NODE_ENV === 'development'
});

// Rate limiting for GraphQL
import { createComplexityPlugin } from 'graphql-query-complexity';

const complexityPlugin = createComplexityPlugin({
  maximumComplexity: 1000,
  variables: {},
  createError: (max: number, actual: number) => {
    return new Error(`Query complexity ${actual} exceeds maximum complexity ${max}`);
  }
});

// Usage
server.applyMiddleware({ 
  app, 
  path: '/graphql',
  cors: corsService.configureCORS()
});
```

### 2. GraphQL Input Validation

**GraphQL Input Validation:**
```typescript
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import validator from 'validator';

// Custom scalar types with validation
const EmailAddress = new GraphQLScalarType({
  name: 'EmailAddress',
  description: 'A field whose value conforms to the standard internet email address format as specified in HTML Spec: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address',
  serialize: (value) => {
    if (!validator.isEmail(value)) {
      throw new Error('Invalid email address');
    }
    return value.toLowerCase();
  },
  parseValue: (value) => {
    if (!validator.isEmail(value)) {
      throw new Error('Invalid email address');
    }
    return value.toLowerCase();
  },
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) {
      throw new Error('Email address must be a string');
    }
    if (!validator.isEmail(ast.value)) {
      throw new Error('Invalid email address');
    }
    return ast.value.toLowerCase();
  }
});

const URL = new GraphQLScalarType({
  name: 'URL',
  description: 'A field whose value conforms to the standard URL format as specified in RFC3986: https://www.ietf.org/rfc/rfc3986.txt',
  serialize: (value) => {
    if (!validator.isURL(value, { require_protocol: true })) {
      throw new Error('Invalid URL');
    }
    return value;
  },
  parseValue: (value) => {
    if (!validator.isURL(value, { require_protocol: true })) {
      throw new Error('Invalid URL');
    }
    return value;
  },
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) {
      throw new Error('URL must be a string');
    }
    if (!validator.isURL(ast.value, { require_protocol: true })) {
      throw new Error('Invalid URL');
    }
    return ast.value;
  }
});

const SafeString = new GraphQLScalarType({
  name: 'SafeString',
  description: 'A string that has been sanitized',
  serialize: (value) => {
    if (typeof value !== 'string') {
      throw new Error('Value must be a string');
    }
    return sanitizeInput(value);
  },
  parseValue: (value) => {
    if (typeof value !== 'string') {
      throw new Error('Value must be a string');
    }
    return sanitizeInput(value);
  },
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) {
      throw new Error('SafeString must be a string');
    }
    return sanitizeInput(ast.value);
  }
});

// Input validation resolvers
const inputValidationResolvers = {
  EmailAddress,
  URL,
  SafeString
};

// Usage in schema
const typeDefs = `
  scalar EmailAddress
  scalar URL
  scalar SafeString

  input CreateUserInput {
    name: SafeString!
    email: EmailAddress!
    website: URL
  }
`;
```

## Best Practices Summary

### 1. Authentication & Authorization
- Use JWT tokens with short expiration times
- Implement refresh token rotation
- Use API keys for service-to-service communication
- Implement role-based access control (RBAC)
- Validate permissions on every request
- Use principle of least privilege

### 2. Rate Limiting
- Implement tiered rate limiting based on user type
- Use Redis for distributed rate limiting
- Skip rate limiting for trusted clients
- Monitor and alert on rate limit violations
- Implement burst and sustained rate limits

### 3. Input Validation
- Validate all input (body, query, params, headers)
- Use whitelist approach for allowed values
- Sanitize all user input
- Implement maximum request size limits
- Validate file uploads thoroughly

### 4. Security Headers
- Implement comprehensive security headers
- Configure CORS properly
- Use Content Security Policy (CSP)
- Enable HSTS for HTTPS enforcement
- Remove sensitive server information

### 5. GraphQL Security
- Implement query depth limiting
- Use query complexity analysis
- Apply field-level permissions
- Sanitize GraphQL responses
- Disable introspection in production

### 6. API Security Checklist
- [ ] Authentication implemented for all endpoints
- [ ] Authorization checks on every request
- [ ] Rate limiting configured
- [ ] Input validation and sanitization
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Error handling prevents information disclosure
- [ ] Logging and monitoring implemented
- [ ] API versioning strategy in place
- [ ] Regular security audits conducted

### 7. API Security Implementation
```typescript
// Complete API security setup
class APISecuritySetup {
  static configure(app: Express): void {
    // 1. Security headers
    const securityHeaders = new SecurityHeadersService();
    app.use(securityHeaders.configureSecurityHeaders());
    app.use(securityHeaders.addCustomHeaders());

    // 2. CORS
    const corsService = new CORSService();
    app.use(corsService.configureCORS());

    // 3. Rate limiting
    const rateLimitService = new RateLimitService();
    app.use('/api/', rateLimitService.createRateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100
    }));

    // 4. Input sanitization
    app.use(sanitizeInput);

    // 5. Authentication middleware
    app.use('/api/', authenticateAPI);

    // 6. Request logging
    app.use(requestLogger);

    // 7. Error handling
    app.use(SecureErrorService.createMiddleware());
  }
}

// Usage
APISecuritySetup.configure(app);
```

Remember: API security is an ongoing process. Regularly review and update your security measures, monitor for threats, and stay informed about new security best practices and vulnerabilities.