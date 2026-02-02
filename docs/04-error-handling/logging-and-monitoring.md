# Logging and Monitoring

## Overview

Effective logging and monitoring are crucial for maintaining reliable applications. This document covers best practices for logging errors, monitoring application health, and setting up alerting systems to proactively identify and resolve issues.

## Core Principles

### 1. Structured Logging

Use structured logging formats that are machine-readable and provide consistent context.

**✅ Good Structured Logging:**
```javascript
// Structured logging with consistent format
class Logger {
  constructor(serviceName, environment) {
    this.serviceName = serviceName;
    this.environment = environment;
  }

  log(level, message, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      environment: this.environment,
      ...context
    };

    // Output to console, file, or external service
    console.log(JSON.stringify(logEntry));
  }

  error(message, error, context = {}) {
    this.log('ERROR', message, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      }
    });
  }

  warn(message, context = {}) {
    this.log('WARN', message, context);
  }

  info(message, context = {}) {
    this.log('INFO', message, context);
  }

  debug(message, context = {}) {
    if (process.env.NODE_ENV === 'development') {
      this.log('DEBUG', message, context);
    }
  }
}

// Usage
const logger = new Logger('user-service', process.env.NODE_ENV);

function processUserRegistration(userData) {
  try {
    logger.info('Processing user registration', {
      userId: userData.id,
      email: userData.email
    });

    const result = validateAndCreateUser(userData);
    
    logger.info('User registration completed', {
      userId: result.id,
      duration: Date.now() - startTime
    });

    return result;
  } catch (error) {
    logger.error('User registration failed', error, {
      userId: userData.id,
      email: userData.email,
      operation: 'user_registration'
    });

    throw error;
  }
}
```

**❌ Bad Unstructured Logging:**
```javascript
// Unstructured logging - hard to parse and analyze
function processUserRegistration(userData) {
  try {
    console.log('Starting user registration for ' + userData.email); // Inconsistent format
    
    const result = validateAndCreateUser(userData);
    
    console.log('Success: User ' + result.id + ' created'); // Different format
    
    return result;
  } catch (error) {
    console.log('ERROR: Failed to create user: ' + error.message); // No context
    throw error;
  }
}

// Mixed logging approaches
function processOrder(orderData) {
  console.log(`Processing order ${orderData.id}`); // String interpolation
  console.error('Order processing failed:', error); // Object logging
  console.warn('Low inventory for item:', orderData.itemId); // Mixed format
}
```

### 2. Log Levels and Categories

Use appropriate log levels and categorize logs for better filtering and analysis.

**✅ Proper Log Levels and Categories:**
```javascript
class CategorizedLogger {
  constructor(serviceName) {
    this.serviceName = serviceName;
  }

  // Application lifecycle events
  app(message, context = {}) {
    this.log('INFO', 'APP', message, context);
  }

  // Business logic events
  business(message, context = {}) {
    this.log('INFO', 'BUSINESS', message, context);
  }

  // System operations
  system(message, context = {}) {
    this.log('INFO', 'SYSTEM', message, context);
  }

  // Security events
  security(message, context = {}) {
    this.log('WARN', 'SECURITY', message, context);
  }

  // Performance metrics
  performance(message, context = {}) {
    this.log('INFO', 'PERFORMANCE', message, context);
  }

  // Database operations
  database(message, context = {}) {
    this.log('DEBUG', 'DATABASE', message, context);
  }

  // External API calls
  api(message, context = {}) {
    this.log('INFO', 'API', message, context);
  }

  private log(level, category, message, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      service: this.serviceName,
      ...context
    };

    console.log(JSON.stringify(logEntry));
  }

  error(message, error, context = {}) {
    this.log('ERROR', 'ERROR', message, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }
}

// Usage with proper categorization
const logger = new CategorizedLogger('ecommerce-api');

class OrderService {
  constructor() {
    this.logger = logger;
  }

  async processOrder(orderData) {
    const startTime = Date.now();
    
    this.logger.app('Order processing started', {
      orderId: orderData.id,
      userId: orderData.userId
    });

    try {
      // Business logic
      this.logger.business('Validating order', {
        orderId: orderData.id,
        itemCount: orderData.items.length
      });

      await this.validateOrder(orderData);

      // System operations
      this.logger.system('Reserving inventory', {
        orderId: orderData.id
      });

      await this.reserveInventory(orderData.items);

      // External API calls
      this.logger.api('Processing payment', {
        orderId: orderData.id,
        amount: orderData.total
      });

      const paymentResult = await this.processPayment(orderData.payment);

      // Performance metrics
      const duration = Date.now() - startTime;
      this.logger.performance('Order processing completed', {
        orderId: orderData.id,
        duration,
        paymentMethod: orderData.payment.method
      });

      return paymentResult;
    } catch (error) {
      this.logger.error('Order processing failed', error, {
        orderId: orderData.id,
        userId: orderData.userId
      });
      throw error;
    }
  }
}
```

**❌ Poor Log Level Usage:**
```javascript
// Using only console.log for everything
function processOrder(orderData) {
  console.log('Starting order processing'); // Should be INFO
  console.log('Validating order items'); // Should be DEBUG
  console.log('Inventory check passed'); // Should be INFO
  
  try {
    const result = processPayment(orderData);
    console.log('Payment successful'); // Should be INFO
    return result;
  } catch (error) {
    console.log('Payment failed: ' + error.message); // Should be ERROR
    throw error;
  }
}

// Inconsistent error logging
function handleUserAction(action, userId) {
  if (!userId) {
    console.error('Invalid user ID'); // Should be WARN or ERROR with context
    return;
  }
  
  console.log('Processing action: ' + action); // Should include userId
  // ... processing logic
}
```

### 3. Context and Correlation IDs

Include relevant context and correlation IDs to trace requests across services.

**✅ Context and Correlation IDs:**
```javascript
class TracingLogger {
  constructor(serviceName) {
    this.serviceName = serviceName;
  }

  createCorrelationId() {
    return `${this.serviceName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  logWithTrace(level, message, context = {}, correlationId = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      correlationId: correlationId || this.createCorrelationId(),
      ...context
    };

    console.log(JSON.stringify(logEntry));
    return logEntry.correlationId;
  }

  request(message, context = {}, correlationId = null) {
    return this.logWithTrace('INFO', message, { type: 'REQUEST', ...context }, correlationId);
  }

  response(message, context = {}, correlationId) {
    this.logWithTrace('INFO', message, { type: 'RESPONSE', ...context }, correlationId);
  }

  error(message, error, context = {}, correlationId) {
    this.logWithTrace('ERROR', message, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }, correlationId);
  }
}

// Usage in request handling
const logger = new TracingLogger('user-service');

async function handleUserRequest(req, res, next) {
  const correlationId = logger.request('User request received', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id
  }, req.headers['x-correlation-id']);

  // Add correlation ID to request for downstream services
  req.correlationId = correlationId;

  try {
    const result = await processUserRequest(req);
    
    logger.response('User request completed', {
      statusCode: res.statusCode,
      responseTime: Date.now() - req.startTime
    }, correlationId);

    res.json(result);
  } catch (error) {
    logger.error('User request failed', error, {
      statusCode: res.statusCode
    }, correlationId);

    res.status(500).json({ error: 'Internal server error' });
  }
}

// Usage in service calls
class UserService {
  constructor() {
    this.logger = logger;
  }

  async getUser(userId, correlationId) {
    this.logger.request('Fetching user', { userId }, correlationId);

    try {
      const user = await this.database.findUser(userId);
      
      this.logger.response('User fetched successfully', {
        userId,
        hasUser: !!user
      }, correlationId);

      return user;
    } catch (error) {
      this.logger.error('Failed to fetch user', error, { userId }, correlationId);
      throw error;
    }
  }

  async updateUser(userId, updates, correlationId) {
    this.logger.request('Updating user', { userId, updates }, correlationId);

    try {
      const result = await this.database.updateUser(userId, updates);
      
      this.logger.response('User updated successfully', {
        userId,
        affectedRows: result.affectedRows
      }, correlationId);

      return result;
    } catch (error) {
      this.logger.error('Failed to update user', error, { userId }, correlationId);
      throw error;
    }
  }
}
```

**❌ Missing Context and Correlation:**
```javascript
// No correlation or context
function processUser(userId) {
  console.log('Processing user'); // No user ID, no correlation
  const user = await database.findUser(userId);
  console.log('User found'); // No indication if user exists
  return user;
}

// Inconsistent context
function handleOrder(orderId) {
  console.log(`Processing order ${orderId}`); // Has context
  const items = await getItems(orderId);
  console.log('Items retrieved'); // Missing orderId context
  return items;
}
```

## TypeScript-Specific Considerations

### 1. Type-Safe Logging

Use TypeScript to create type-safe logging interfaces and ensure consistent log structure.

**✅ Type-Safe Logging:**
```typescript
interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  operation?: string;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  environment: string;
  correlationId?: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

class TypedLogger {
  constructor(
    private serviceName: string,
    private environment: string
  ) {}

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      environment: this.environment,
      context,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: (error as any).code
        }
      })
    };

    return logEntry;
  }

  log(level: LogLevel, message: string, context?: LogContext): void {
    const logEntry = this.createLogEntry(level, message, context);
    console.log(JSON.stringify(logEntry));
  }

  error(message: string, error: Error, context?: LogContext): void {
    const logEntry = this.createLogEntry('ERROR', message, context, error);
    console.error(JSON.stringify(logEntry));
  }

  warn(message: string, context?: LogContext): void {
    this.log('WARN', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('INFO', message, context);
  }

  debug(message: string, context?: LogContext): void {
    if (this.environment === 'development') {
      this.log('DEBUG', message, context);
    }
  }
}

// Usage with type safety
const logger = new TypedLogger('user-service', process.env.NODE_ENV || 'development');

interface UserContext extends LogContext {
  email: string;
  action: string;
}

function processUserRegistration(userData: { email: string; name: string }) {
  const context: UserContext = {
    email: userData.email,
    action: 'registration',
    timestamp: Date.now()
  };

  try {
    logger.info('Processing user registration', context);
    
    const result = validateAndCreateUser(userData);
    
    logger.info('User registration completed', {
      ...context,
      userId: result.id,
      duration: Date.now() - context.timestamp
    });

    return result;
  } catch (error) {
    if (error instanceof Error) {
      logger.error('User registration failed', error, context);
    }
    throw error;
  }
}
```

**❌ Non-Type-Safe Logging:**
```typescript
// Generic logging without type safety
class GenericLogger {
  log(level: string, message: string, context: any): void {
    console.log(JSON.stringify({
      level,
      message,
      context
    }));
  }
}

// Usage with no type safety
const logger = new GenericLogger();

function processUser(userData: any) {
  logger.log('INFO', 'Processing user', {
    email: userData.email,
    invalidProperty: 123 // No type checking
  });
}
```

### 2. Log Schema Validation

Use TypeScript interfaces to define and validate log schemas.

**✅ Log Schema Validation:**
```typescript
// Define log schemas
interface BusinessLog {
  type: 'business';
  operation: string;
  entity: string;
  entityId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface SystemLog {
  type: 'system';
  component: string;
  action: string;
  status: 'start' | 'complete' | 'error';
  duration?: number;
  metadata?: Record<string, any>;
}

interface SecurityLog {
  type: 'security';
  action: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  reason?: string;
}

type LogSchema = BusinessLog | SystemLog | SecurityLog;

class SchemaLogger {
  constructor(private serviceName: string) {}

  private validateLogSchema(log: LogSchema): boolean {
    // Basic validation - in production, use a library like Joi or Yup
    if (!log.type || !log.action) {
      return false;
    }
    return true;
  }

  logWithSchema<T extends LogSchema>(schema: T, message: string, context?: LogContext): void {
    if (!this.validateLogSchema(schema)) {
      console.warn('Invalid log schema:', schema);
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      service: this.serviceName,
      schema,
      context
    };

    console.log(JSON.stringify(logEntry));
  }

  business(operation: string, entity: string, entityId: string, context?: LogContext): void {
    this.logWithSchema({
      type: 'business',
      operation,
      entity,
      entityId
    }, `${operation} ${entity} ${entityId}`, context);
  }

  system(component: string, action: string, status: 'start' | 'complete' | 'error', context?: LogContext): void {
    this.logWithSchema({
      type: 'system',
      component,
      action,
      status
    }, `${component} ${action} ${status}`, context);
  }

  security(action: string, success: boolean, context?: LogContext): void {
    this.logWithSchema({
      type: 'security',
      action,
      success
    }, `${action} ${success ? 'success' : 'failed'}`, context);
  }
}

// Usage with schema validation
const logger = new SchemaLogger('auth-service');

function authenticateUser(credentials: { email: string; password: string }) {
  logger.security('login_attempt', false, {
    email: credentials.email,
    ip: '192.168.1.1'
  });

  try {
    const user = validateCredentials(credentials);
    
    logger.security('login_success', true, {
      userId: user.id,
      email: user.email
    });

    logger.business('user_login', 'user', user.id, {
      loginTime: Date.now()
    });

    return user;
  } catch (error) {
    logger.security('login_failed', false, {
      email: credentials.email,
      reason: error.message
    });
    throw error;
  }
}
```

**❌ No Schema Validation:**
```typescript
// No schema validation
class UnvalidatedLogger {
  log(message: string, data: any): void {
    console.log(JSON.stringify({ message, data }));
  }
}

// Usage without validation
const logger = new UnvalidatedLogger();

function processOrder(orderData: any) {
  logger.log('Order processed', {
    orderId: orderData.id,
    invalidField: orderData.nonExistentField // No validation
  });
}
```

### 3. Performance Monitoring with TypeScript

Create type-safe performance monitoring utilities.

**✅ Type-Safe Performance Monitoring:**
```typescript
interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: string;
  tags?: Record<string, string>;
}

interface PerformanceTimer {
  start: number;
  name: string;
  tags?: Record<string, string>;
}

class PerformanceMonitor {
  private timers = new Map<string, PerformanceTimer>();

  startTimer(name: string, tags?: Record<string, string>): string {
    const timerId = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timers.set(timerId, {
      start: process.hrtime.bigint(),
      name,
      tags
    });
    return timerId;
  }

  endTimer(timerId: string): PerformanceMetric | null {
    const timer = this.timers.get(timerId);
    if (!timer) {
      return null;
    }

    const end = process.hrtime.bigint();
    const duration = Number(end - timer.start) / 1000000; // Convert to milliseconds

    this.timers.delete(timerId);

    const metric: PerformanceMetric = {
      name: timer.name,
      value: duration,
      unit: 'ms',
      timestamp: new Date().toISOString(),
      tags: timer.tags
    };

    this.reportMetric(metric);
    return metric;
  }

  reportMetric(metric: PerformanceMetric): void {
    console.log(JSON.stringify({
      type: 'performance',
      metric
    }));
  }

  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const timerId = this.startTimer(name, tags);
    
    try {
      const result = await operation();
      this.endTimer(timerId);
      return result;
    } catch (error) {
      this.endTimer(timerId);
      throw error;
    }
  }
}

// Usage with type safety
const monitor = new PerformanceMonitor();

class DatabaseService {
  async query(sql: string, params: any[]): Promise<any[]> {
    return await monitor.measureAsync('database_query', async () => {
      const result = await this.execute(sql, params);
      return result;
    }, {
      query_type: sql.split(' ')[0],
      table: this.extractTableName(sql)
    });
  }

  async execute(sql: string, params: any[]): Promise<any[]> {
    // Database execution logic
    return [];
  }

  private extractTableName(sql: string): string {
    // Extract table name from SQL
    return 'unknown';
  }
}

// Memory monitoring
class MemoryMonitor {
  reportMemoryUsage(tags?: Record<string, string>): void {
    const usage = process.memoryUsage();
    const metrics: PerformanceMetric[] = [
      {
        name: 'memory_rss',
        value: usage.rss,
        unit: 'bytes',
        timestamp: new Date().toISOString(),
        tags
      },
      {
        name: 'memory_heap_used',
        value: usage.heapUsed,
        unit: 'bytes',
        timestamp: new Date().toISOString(),
        tags
      },
      {
        name: 'memory_heap_total',
        value: usage.heapTotal,
        unit: 'bytes',
        timestamp: new Date().toISOString(),
        tags
      },
      {
        name: 'memory_external',
        value: usage.external,
        unit: 'bytes',
        timestamp: new Date().toISOString(),
        tags
      }
    ];

    metrics.forEach(metric => {
      console.log(JSON.stringify({
        type: 'performance',
        metric
      }));
    });
  }
}
```

**❌ Poor Performance Monitoring:**
```typescript
// Generic performance monitoring
class GenericMonitor {
  measure(name: string, operation: () => any): any {
    const start = Date.now();
    const result = operation();
    const duration = Date.now() - start;
    
    console.log(`${name}: ${duration}ms`); // No structure
    return result;
  }
}

// Usage without proper typing
const monitor = new GenericMonitor();

function processLargeDataset(data: any[]) {
  return monitor.measure('data_processing', () => {
    // Processing logic
    return data.map(item => item.process()); // No type safety
  });
}
```

## Common Patterns

### 1. Request/Response Logging

Implement comprehensive request and response logging for API endpoints.

**✅ Request/Response Logging:**
```javascript
class RequestLogger {
  constructor(serviceName) {
    this.serviceName = serviceName;
  }

  logRequest(req, correlationId) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      type: 'REQUEST',
      service: this.serviceName,
      correlationId,
      request: {
        method: req.method,
        url: req.url,
        headers: this.sanitizeHeaders(req.headers),
        body: this.sanitizeBody(req.body),
        query: req.query,
        params: req.params,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id
      }
    };

    console.log(JSON.stringify(logEntry));
  }

  logResponse(res, correlationId, duration) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      type: 'RESPONSE',
      service: this.serviceName,
      correlationId,
      response: {
        statusCode: res.statusCode,
        headers: this.sanitizeHeaders(res.getHeaders()),
        duration,
        contentLength: res.get('Content-Length')
      }
    };

    console.log(JSON.stringify(logEntry));
  }

  logError(error, correlationId, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      type: 'ERROR',
      service: this.serviceName,
      correlationId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      context
    };

    console.error(JSON.stringify(logEntry));
  }

  sanitizeHeaders(headers) {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    const sanitized = { ...headers };
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  sanitizeBody(body) {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    const sanitized = { ...body };

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}

// Middleware for Express
function createLoggingMiddleware(serviceName) {
  const logger = new RequestLogger(serviceName);

  return (req, res, next) => {
    const correlationId = req.headers['x-correlation-id'] || 
      `${serviceName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    req.correlationId = correlationId;
    req.startTime = Date.now();

    logger.logRequest(req, correlationId);

    // Override res.end to capture response
    const originalEnd = res.end;
    res.end = function(...args) {
      const duration = Date.now() - req.startTime;
      logger.logResponse(res, correlationId, duration);
      originalEnd.apply(this, args);
    };

    next();
  };
}

// Error handling middleware
function createErrorLoggingMiddleware(serviceName) {
  const logger = new RequestLogger(serviceName);

  return (error, req, res, next) => {
    logger.logError(error, req.correlationId, {
      url: req.url,
      method: req.method,
      userId: req.user?.id
    });

    res.status(error.status || 500).json({
      error: {
        message: error.message,
        code: error.code
      }
    });
  };
}
```

### 2. Health Check Logging

Implement health check logging for monitoring system status.

**✅ Health Check Logging:**
```javascript
class HealthCheckLogger {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.checks = new Map();
  }

  async runHealthCheck(name, checkFunction, tags = {}) {
    const startTime = Date.now();
    let status = 'unknown';
    let error = null;
    let details = {};

    try {
      details = await checkFunction();
      status = 'healthy';
    } catch (err) {
      status = 'unhealthy';
      error = {
        message: err.message,
        stack: err.stack
      };
    }

    const duration = Date.now() - startTime;

    const healthCheck = {
      timestamp: new Date().toISOString(),
      level: status === 'healthy' ? 'INFO' : 'ERROR',
      type: 'HEALTH_CHECK',
      service: this.serviceName,
      healthCheck: {
        name,
        status,
        duration,
        tags,
        details,
        ...(error && { error })
      }
    };

    if (status === 'healthy') {
      console.log(JSON.stringify(healthCheck));
    } else {
      console.error(JSON.stringify(healthCheck));
    }

    this.checks.set(name, healthCheck);
    return healthCheck;
  }

  getHealthStatus() {
    const checks = Array.from(this.checks.values());
    const healthyChecks = checks.filter(check => check.healthCheck.status === 'healthy');
    
    return {
      status: healthyChecks.length === checks.length ? 'healthy' : 'unhealthy',
      totalChecks: checks.length,
      healthyChecks: healthyChecks.length,
      unhealthyChecks: checks.length - healthyChecks.length,
      checks: checks.map(check => ({
        name: check.healthCheck.name,
        status: check.healthCheck.status,
        duration: check.healthCheck.duration
      }))
    };
  }
}

// Usage
const healthLogger = new HealthCheckLogger('user-service');

// Database health check
async function checkDatabase() {
  const start = Date.now();
  await database.query('SELECT 1');
  const duration = Date.now() - start;
  
  return {
    connection: 'active',
    responseTime: duration,
    poolSize: database.pool.size
  };
}

// External service health check
async function checkExternalService() {
  const response = await fetch('https://api.example.com/health');
  if (!response.ok) {
    throw new Error(`Service returned ${response.status}`);
  }
  
  return {
    status: 'ok',
    responseTime: response.headers.get('x-response-time')
  };
}

// Memory health check
async function checkMemory() {
  const usage = process.memoryUsage();
  const heapUsedMB = usage.heapUsed / 1024 / 1024;
  const heapTotalMB = usage.heapTotal / 1024 / 1024;
  
  if (heapUsedMB > 500) {
    throw new Error(`High memory usage: ${heapUsedMB.toFixed(2)}MB`);
  }
  
  return {
    heapUsed: `${heapUsedMB.toFixed(2)}MB`,
    heapTotal: `${heapTotalMB.toFixed(2)}MB`,
    rss: `${usage.rss / 1024 / 1024}MB`
  };
}

// Run health checks
async function runAllHealthChecks() {
  await healthLogger.runHealthCheck('database', checkDatabase, { type: 'database' });
  await healthLogger.runHealthCheck('external-api', checkExternalService, { type: 'external' });
  await healthLogger.runHealthCheck('memory', checkMemory, { type: 'system' });
  
  const status = healthLogger.getHealthStatus();
  console.log('Overall health status:', JSON.stringify(status));
}
```

### 3. Audit Logging

Implement audit logging for security and compliance requirements.

**✅ Audit Logging:**
```javascript
class AuditLogger {
  constructor(serviceName) {
    this.serviceName = serviceName;
  }

  logSecurityEvent(event, userId, context = {}) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      type: 'AUDIT',
      category: 'SECURITY',
      service: this.serviceName,
      audit: {
        event,
        userId,
        timestamp: new Date().toISOString(),
        ip: context.ip,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        resource: context.resource,
        action: context.action,
        result: context.result,
        details: context.details
      }
    };

    console.log(JSON.stringify(auditEntry));
  }

  logDataAccess(operation, resource, userId, context = {}) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      type: 'AUDIT',
      category: 'DATA_ACCESS',
      service: this.serviceName,
      audit: {
        operation,
        resource,
        userId,
        timestamp: new Date().toISOString(),
        fields: context.fields,
        rowId: context.rowId,
        tableName: context.tableName
      }
    };

    console.log(JSON.stringify(auditEntry));
  }

  logAdminAction(action, adminId, targetId, context = {}) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      type: 'AUDIT',
      category: 'ADMIN',
      service: this.serviceName,
      audit: {
        action,
        adminId,
        targetId,
        timestamp: new Date().toISOString(),
        reason: context.reason,
        ip: context.ip,
        details: context.details
      }
    };

    console.log(JSON.stringify(auditEntry));
  }
}

// Usage in authentication
const auditLogger = new AuditLogger('auth-service');

class AuthService {
  async login(credentials) {
    try {
      const user = await this.validateCredentials(credentials);
      
      auditLogger.logSecurityEvent('login_success', user.id, {
        ip: credentials.ip,
        userAgent: credentials.userAgent,
        sessionId: user.sessionId
      });

      return user;
    } catch (error) {
      auditLogger.logSecurityEvent('login_failed', null, {
        ip: credentials.ip,
        userAgent: credentials.userAgent,
        reason: error.message
      });

      throw error;
    }
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.getUser(userId);
    
    auditLogger.logSecurityEvent('password_change', userId, {
      ip: this.getCurrentIp(),
      userAgent: this.getCurrentUserAgent(),
      timestamp: new Date().toISOString()
    });

    // Password change logic
    await this.updatePassword(user, newPassword);
  }
}

// Usage in data access
class UserService {
  constructor() {
    this.auditLogger = auditLogger;
  }

  async getUser(userId, requestingUserId) {
    const user = await this.database.findUser(userId);
    
    this.auditLogger.logDataAccess('read', 'user', requestingUserId, {
      fields: ['id', 'name', 'email'],
      rowId: userId,
      tableName: 'users'
    });

    return user;
  }

  async updateUser(userId, updates, requestingUserId) {
    const result = await this.database.updateUser(userId, updates);
    
    this.auditLogger.logDataAccess('update', 'user', requestingUserId, {
      fields: Object.keys(updates),
      rowId: userId,
      tableName: 'users',
      changes: updates
    });

    return result;
  }
}
```

## Common Pitfalls and Solutions

### 1. Logging Too Much or Too Little

**❌ Bad:**
```javascript
// Logging too much - performance impact
function processOrder(orderData) {
  console.log('Starting order processing'); // OK
  console.log('Order data:', JSON.stringify(orderData)); // Too much detail
  console.log('Validating order items'); // OK
  console.log('Item 1:', orderData.items[0]); // Too detailed
  console.log('Item 2:', orderData.items[1]); // Too detailed
  // ... more detailed logging
}

// Logging too little - no debugging info
function processPayment(paymentData) {
  console.log('Processing payment'); // Too vague
  const result = executePayment(paymentData);
  console.log('Payment processed'); // No result info
  return result;
}
```

**✅ Good:**
```javascript
// Balanced logging
function processOrder(orderData) {
  logger.info('Processing order', {
    orderId: orderData.id,
    itemCount: orderData.items.length,
    total: orderData.total
  });

  try {
    const result = validateAndProcessOrder(orderData);
    
    logger.info('Order processed successfully', {
      orderId: orderData.id,
      status: result.status,
      duration: result.duration
    });

    return result;
  } catch (error) {
    logger.error('Order processing failed', error, {
      orderId: orderData.id,
      errorType: error.constructor.name
    });
    throw error;
  }
}
```

### 2. Logging Sensitive Information

**❌ Bad:**
```javascript
// Logging sensitive data
function processPayment(paymentData) {
  logger.info('Processing payment', {
    cardNumber: paymentData.cardNumber, // Sensitive!
    cvv: paymentData.cvv, // Very sensitive!
    amount: paymentData.amount
  });
}

// Logging passwords
function authenticateUser(credentials) {
  logger.info('User authentication', {
    email: credentials.email,
    password: credentials.password, // Never log passwords!
    ip: credentials.ip
  });
}
```

**✅ Good:**
```javascript
// Safe logging
function processPayment(paymentData) {
  logger.info('Processing payment', {
    cardLast4: paymentData.cardNumber?.slice(-4), // Safe
    amount: paymentData.amount,
    paymentMethod: paymentData.method
  });
}

// Safe authentication logging
function authenticateUser(credentials) {
  logger.info('User authentication attempt', {
    email: credentials.email,
    ip: credentials.ip,
    timestamp: new Date().toISOString()
  });
}
```

### 3. Inconsistent Logging Format

**❌ Bad:**
```javascript
// Inconsistent formats
function processUser(userData) {
  console.log('User processing started'); // No structure
  console.log(`Processing user ${userData.id}`); // String interpolation
  console.error('Error:', error); // Object logging
  console.warn('Warning:', warningMessage); // Mixed format
}
```

**✅ Good:**
```javascript
// Consistent structured logging
function processUser(userData) {
  logger.info('User processing started', {
    userId: userData.id,
    email: userData.email
  });

  try {
    const result = processUserData(userData);
    
    logger.info('User processing completed', {
      userId: userData.id,
      result: result.status
    });

    return result;
  } catch (error) {
    logger.error('User processing failed', error, {
      userId: userData.id
    });
    throw error;
  }
}
```

## Best Practices Summary

1. **Use structured logging**: JSON format with consistent fields
2. **Choose appropriate log levels**: DEBUG, INFO, WARN, ERROR
3. **Include relevant context**: User IDs, request IDs, operation details
4. **Use correlation IDs**: Trace requests across services
5. **Avoid logging sensitive data**: Never log passwords, keys, or PII
6. **Implement log rotation**: Prevent disk space issues
7. **Use centralized logging**: Aggregate logs from all services
8. **Monitor log volume**: Avoid performance impact from excessive logging
9. **Create log retention policies**: Balance storage costs with debugging needs
10. **Test logging in production**: Ensure logs are useful for debugging

## Examples in Context

### E-commerce Application
```javascript
class EcommerceLogger {
  constructor() {
    this.logger = new TypedLogger('ecommerce-api', process.env.NODE_ENV);
  }

  logOrderEvent(event, orderId, context = {}) {
    this.logger.info(`Order ${event}`, {
      orderId,
      eventType: event,
      timestamp: Date.now(),
      ...context
    });
  }

  logPaymentEvent(event, paymentId, context = {}) {
    this.logger.info(`Payment ${event}`, {
      paymentId,
      eventType: event,
      amount: context.amount,
      method: context.method
    });
  }

  logInventoryEvent(event, productId, context = {}) {
    this.logger.info(`Inventory ${event}`, {
      productId,
      eventType: event,
      quantity: context.quantity,
      warehouse: context.warehouse
    });
  }
}

// Usage in order processing
class OrderProcessor {
  constructor() {
    this.logger = new EcommerceLogger();
  }

  async processOrder(orderData) {
    const orderId = orderData.id;
    
    this.logger.logOrderEvent('processing_started', orderId, {
      userId: orderData.userId,
      itemCount: orderData.items.length,
      total: orderData.total
    });

    try {
      // Process payment
      const paymentResult = await this.processPayment(orderData.payment);
      this.logger.logPaymentEvent('completed', paymentResult.id, {
        amount: paymentResult.amount,
        method: paymentResult.method
      });

      // Update inventory
      for (const item of orderData.items) {
        await this.updateInventory(item.productId, -item.quantity);
        this.logger.logInventoryEvent('updated', item.productId, {
          quantity: -item.quantity,
          orderId
        });
      }

      this.logger.logOrderEvent('completed', orderId, {
        paymentId: paymentResult.id,
        duration: Date.now() - startTime
      });

      return { success: true, orderId };
    } catch (error) {
      this.logger.logger.error('Order processing failed', error, {
        orderId,
        step: error.step || 'unknown'
      });
      throw error;
    }
  }
}
```

### API Development
```javascript
class ApiLogger {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.logger = new TypedLogger(serviceName, process.env.NODE_ENV);
  }

  logApiCall(method, path, statusCode, duration, context = {}) {
    this.logger.info('API call', {
      method,
      path,
      statusCode,
      duration,
      ...context
    });
  }

  logApiError(method, path, error, context = {}) {
    this.logger.error('API error', error, {
      method,
      path,
      ...context
    });
  }

  logRateLimit(ip, endpoint, context = {}) {
    this.logger.warn('Rate limit exceeded', {
      ip,
      endpoint,
      ...context
    });
  }
}

// Express middleware
function createApiLoggingMiddleware(serviceName) {
  const apiLogger = new ApiLogger(serviceName);

  return (req, res, next) => {
    const startTime = Date.now();

    // Log incoming request
    apiLogger.logApiCall(req.method, req.path, null, 0, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    });

    // Override res.end to capture response
    const originalEnd = res.end;
    res.end = function(...args) {
      const duration = Date.now() - startTime;
      apiLogger.logApiCall(req.method, req.path, res.statusCode, duration, {
        contentLength: res.get('Content-Length')
      });
      originalEnd.apply(this, args);
    };

    next();
  };
}

// Error handling
function createApiErrorMiddleware(serviceName) {
  const apiLogger = new ApiLogger(serviceName);

  return (error, req, res, next) => {
    apiLogger.logApiError(req.method, req.path, error, {
      ip: req.ip,
      userId: req.user?.id
    });

    res.status(error.status || 500).json({
      error: {
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      }
    });
  };
}
```

### Data Processing
```javascript
class DataProcessingLogger {
  constructor() {
    this.logger = new TypedLogger('data-processor', process.env.NODE_ENV);
    this.monitor = new PerformanceMonitor();
  }

  async processDataPipeline(data) {
    const pipelineId = `pipeline-${Date.now()}`;
    
    this.logger.info('Data pipeline started', {
      pipelineId,
      recordCount: data.length,
      startTime: new Date().toISOString()
    });

    try {
      // Validation phase
      const validatedData = await this.monitor.measureAsync('validation', () => 
        this.validateData(data), { phase: 'validation' }
      );

      this.logger.info('Data validation completed', {
        pipelineId,
        validatedCount: validatedData.length,
        invalidCount: data.length - validatedData.length
      });

      // Transformation phase
      const transformedData = await this.monitor.measureAsync('transformation', () =>
        this.transformData(validatedData), { phase: 'transformation' }
      );

      this.logger.info('Data transformation completed', {
        pipelineId,
        transformedCount: transformedData.length
      });

      // Loading phase
      const loadResult = await this.monitor.measureAsync('loading', () =>
        this.loadData(transformedData), { phase: 'loading' }
      );

      this.logger.info('Data pipeline completed', {
        pipelineId,
        loadedCount: loadResult.affectedRows,
        duration: Date.now() - startTime
      });

      return loadResult;
    } catch (error) {
      this.logger.error('Data pipeline failed', error, {
        pipelineId,
        phase: error.phase || 'unknown'
      });
      throw error;
    }
  }

  validateData(data) {
    // Validation logic
    return data.filter(item => this.isValid(item));
  }

  transformData(data) {
    // Transformation logic
    return data.map(item => this.transform(item));
  }

  loadData(data) {
    // Loading logic
    return { affectedRows: data.length };
  }
}
```

Remember: Effective logging and monitoring are essential for maintaining reliable applications. Use structured logging, appropriate log levels, and comprehensive context to create useful logs that help with debugging, monitoring, and maintaining your applications.