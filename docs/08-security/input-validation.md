# Input Validation and Sanitization

## Overview

Input validation and sanitization are critical security measures that protect applications from malicious input and prevent common vulnerabilities like XSS, SQL injection, and command injection. This document provides comprehensive guidelines for implementing robust input validation and sanitization in JavaScript and TypeScript applications.

## Input Validation Principles

### 1. Validate Early and Often

**Client-Side Validation:**
```typescript
// Client-side validation for immediate feedback
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }
  
  if (email.length > 254) {
    errors.push('Email too long');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Usage in React component
function EmailInput() {
  const [email, setEmail] = useState('');
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setValidation(validateEmail(value));
  };
  
  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => handleEmailChange(e.target.value)}
        className={validation.isValid ? '' : 'error'}
      />
      {validation.errors.length > 0 && (
        <ul className="error-list">
          {validation.errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**Server-Side Validation:**
```typescript
// Server-side validation (never trust client-side validation)
import { Request, Response, NextFunction } from 'express';

interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'email' | 'url';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

class Validator {
  static validate(rules: ValidationRule[], data: any): { isValid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};
    
    rules.forEach(rule => {
      const value = data[rule.field];
      const fieldErrors: string[] = [];
      
      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(`${rule.field} is required`);
      }
      
      // Skip other validations if field is empty and not required
      if (!rule.required && (value === undefined || value === null || value === '')) {
        return;
      }
      
      // Type validation
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            fieldErrors.push(`${rule.field} must be a string`);
          } else {
            if (rule.minLength && value.length < rule.minLength) {
              fieldErrors.push(`${rule.field} must be at least ${rule.minLength} characters`);
            }
            if (rule.maxLength && value.length > rule.maxLength) {
              fieldErrors.push(`${rule.field} must be at most ${rule.maxLength} characters`);
            }
            if (rule.pattern && !rule.pattern.test(value)) {
              fieldErrors.push(`${rule.field} format is invalid`);
            }
          }
          break;
          
        case 'number':
          const numValue = Number(value);
          if (isNaN(numValue)) {
            fieldErrors.push(`${rule.field} must be a number`);
          }
          break;
          
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            fieldErrors.push(`${rule.field} must be a valid email`);
          }
          break;
          
        case 'url':
          try {
            new URL(value);
          } catch {
            fieldErrors.push(`${rule.field} must be a valid URL`);
          }
          break;
      }
      
      // Custom validation
      if (rule.custom) {
        const customResult = rule.custom(value);
        if (typeof customResult === 'string') {
          fieldErrors.push(customResult);
        } else if (!customResult) {
          fieldErrors.push(`${rule.field} validation failed`);
        }
      }
      
      if (fieldErrors.length > 0) {
        errors[rule.field] = fieldErrors;
      }
    });
    
    return { isValid: Object.keys(errors).length === 0, errors };
  }
}

// Express middleware for validation
function validateRequest(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = { ...req.body, ...req.params, ...req.query };
    const { isValid, errors } = Validator.validate(rules, data);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        errors
      });
    }
    
    next();
  };
}

// Usage
app.post('/api/users', 
  validateRequest([
    { field: 'email', type: 'email', required: true },
    { field: 'password', type: 'string', required: true, minLength: 8 },
    { field: 'name', type: 'string', required: true, maxLength: 50 },
    { field: 'age', type: 'number', custom: (age) => age >= 18 || 'Must be at least 18 years old' }
  ]),
  async (req, res) => {
    // Process valid request
  }
);
```

### 2. Whitelist Approach

**Accept Known Good:**
```typescript
// Whitelist approach - only allow known good values
const ALLOWED_COUNTRIES = ['US', 'CA', 'UK', 'DE', 'FR'];
const ALLOWED_ROLES = ['admin', 'user', 'guest'];

function validateCountry(country: string): boolean {
  return ALLOWED_COUNTRIES.includes(country.toUpperCase());
}

function validateRole(role: string): boolean {
  return ALLOWED_ROLES.includes(role.toLowerCase());
}

// File type validation
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file: Express.Multer.File): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    errors.push('Invalid file type');
  }
  
  if (file.size > MAX_FILE_SIZE) {
    errors.push('File too large');
  }
  
  return { isValid: errors.length === 0, errors };
}
```

## XSS Prevention

### 1. Output Encoding

**HTML Encoding:**
```typescript
// HTML encoding utility
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (match) => map[match]);
}

// Usage in templates
function renderUserContent(content: string): string {
  return `<div class="user-content">${escapeHtml(content)}</div>`;
}

// React - automatic XSS protection
function UserContent({ content }: { content: string }) {
  // React automatically escapes content in JSX
  return <div className="user-content">{content}</div>;
}

// But be careful with dangerouslySetInnerHTML
function DangerousContent({ html }: { html: string }) {
  // Only use if you absolutely trust the content
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}
```

**URL Encoding:**
```typescript
// URL encoding for dynamic URLs
function buildSafeUrl(base: string, params: Record<string, string>): string {
  const url = new URL(base);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, encodeURIComponent(value));
  });
  
  return url.toString();
}

// Example usage
const safeUrl = buildSafeUrl('/api/search', {
  query: userInput,
  category: 'books'
});
```

### 2. Content Security Policy (CSP)

**CSP Implementation:**
```typescript
// Express CSP middleware
import helmet from 'helmet';

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    connectSrc: ["'self'", "https://api.example.com"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameAncestors: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: []
  }
}));

// Meta tag approach (less secure)
const cspMetaTag = `
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:;">
`;
```

**CSP Report Violations:**
```typescript
// Handle CSP violations
app.post('/api/csp-violation', (req, res) => {
  const violation = req.body;
  
  // Log violation
  console.error('CSP Violation:', {
    violatedDirective: violation['violated-directive'],
    blockedURI: violation['blocked-uri'],
    documentURI: violation['document-uri'],
    sourceFile: violation['source-file'],
    lineNumber: violation['line-number']
  });
  
  // Send alert or store for analysis
  res.status(204).send();
});
```

## SQL Injection Prevention

### 1. Parameterized Queries

**Using Prepared Statements:**
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// ❌ Vulnerable to SQL injection
async function getUserVulnerable(username: string) {
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  const result = await pool.query(query);
  return result.rows[0];
}

// ✅ Safe with parameterized queries
async function getUserSafe(username: string) {
  const query = 'SELECT * FROM users WHERE username = $1';
  const result = await pool.query(query, [username]);
  return result.rows[0];
}

// ✅ Safe with named parameters
async function searchUsers(searchTerm: string, limit: number = 10) {
  const query = `
    SELECT id, username, email 
    FROM users 
    WHERE username ILIKE $1 
    OR email ILIKE $1 
    LIMIT $2
  `;
  const result = await pool.query(query, [`%${searchTerm}%`, limit]);
  return result.rows;
}
```

**ORM Usage:**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, getRepository } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;
}

// ✅ TypeORM automatically uses parameterized queries
async function findUserByUsername(username: string) {
  return getRepository(User).findOne({ where: { username } });
}

async function searchUsers(searchTerm: string) {
  return getRepository(User)
    .createQueryBuilder('user')
    .where('user.username ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
    .orWhere('user.email ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
    .getMany();
}
```

### 2. Input Sanitization

**String Sanitization:**
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content
function sanitizeUserContent(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: ['class'],
    FORBID_SCRIPT: true
  });
}

// Custom sanitization
function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '')  // Remove angle brackets
    .replace(/javascript:/gi, '')  // Remove javascript: protocol
    .replace(/on\w+=/gi, '')  // Remove event handlers
    .trim();
}

// File path sanitization
function sanitizeFilePath(path: string): string {
  // Remove directory traversal attempts
  return path
    .replace(/\.\./g, '')
    .replace(/[<>:"|?*]/g, '')
    .trim();
}
```

## Command Injection Prevention

### 1. Avoid Shell Commands

**Safe Alternatives:**
```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ❌ Vulnerable to command injection
async function runCommandVulnerable(command: string) {
  const { stdout } = await exec(command);
  return stdout;
}

// ✅ Use specific commands with validation
async function runGitStatus() {
  const { stdout } = await exec('git status');
  return stdout;
}

// ✅ Validate and sanitize inputs
async function runSafeCommand(command: string, args: string[]) {
  const allowedCommands = ['git', 'npm', 'yarn'];
  const allowedArgs = {
    'git': ['status', 'add', 'commit', 'push', 'pull'],
    'npm': ['install', 'update', 'run'],
    'yarn': ['install', 'add', 'run']
  };
  
  if (!allowedCommands.includes(command)) {
    throw new Error('Command not allowed');
  }
  
  const allowedArgsForCommand = allowedArgs[command] || [];
  const invalidArgs = args.filter(arg => !allowedArgsForCommand.includes(arg));
  
  if (invalidArgs.length > 0) {
    throw new Error(`Invalid arguments: ${invalidArgs.join(', ')}`);
  }
  
  const { stdout } = await exec(`${command} ${args.join(' ')}`);
  return stdout;
}
```

### 2. Use Libraries Instead of Shell

**File Operations:**
```typescript
import fs from 'fs/promises';
import path from 'path';

// ❌ Using shell commands
async function listFilesVulnerable(dir: string) {
  const { stdout } = await exec(`ls ${dir}`);
  return stdout.split('\n');
}

// ✅ Using Node.js APIs
async function listFilesSafe(dir: string) {
  try {
    const files = await fs.readdir(dir);
    return files;
  } catch (error) {
    throw new Error('Directory access denied');
  }
}

// Image processing
import sharp from 'sharp';

// ❌ Using shell commands
async function resizeImageVulnerable(imagePath: string, width: number) {
  await exec(`convert ${imagePath} -resize ${width} resized_${imagePath}`);
}

// ✅ Using libraries
async function resizeImageSafe(imagePath: string, width: number) {
  await sharp(imagePath)
    .resize(width)
    .toFile(`resized_${imagePath}`);
}
```

## Data Validation Libraries

### 1. Joi for Complex Validation

```typescript
import Joi from 'joi';

const userSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  
  email: Joi.string()
    .email()
    .required(),
  
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required(),
  
  age: Joi.number()
    .integer()
    .min(18)
    .max(120),
  
  role: Joi.string()
    .valid('admin', 'user', 'guest')
    .default('user'),
  
  preferences: Joi.object({
    theme: Joi.string().valid('light', 'dark'),
    notifications: Joi.boolean().default(true)
  })
});

// Validation middleware
function validateWithJoi(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.body = value;
    next();
  };
}

// Usage
app.post('/api/users', validateWithJoi(userSchema), async (req, res) => {
  // req.body is now validated and sanitized
});
```

### 2. Zod for TypeScript Integration

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  age: z.number().int().min(18).max(120).optional(),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
  preferences: z.object({
    theme: z.enum(['light', 'dark']).default('light'),
    notifications: z.boolean().default(true)
  }).default({})
});

type User = z.infer<typeof UserSchema>;

// Validation function
function validateUser(data: unknown): User {
  return UserSchema.parse(data);
}

// Safe validation
function safeValidateUser(data: unknown): { success: boolean; data?: User; error?: string } {
  try {
    const validatedData = UserSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}
```

## File Upload Security

### 1. File Type Validation

```typescript
import multer from 'multer';
import path from 'path';

// File type validation
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage();

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Invalid file type'));
  }
  
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Invalid file extension'));
  }
  
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

// Additional file content validation
import { fileTypeFromBuffer } from 'file-type';

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    // Validate file content
    const detectedType = await fileTypeFromBuffer(req.file.buffer);
    
    if (!detectedType || !ALLOWED_MIME_TYPES.includes(detectedType.mime)) {
      return res.status(400).json({ error: 'File content does not match extension' });
    }
    
    // Generate safe filename
    const safeFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${detectedType.ext}`;
    
    // Save file
    // ... save logic
    
    res.json({ success: true, filename: safeFilename });
  } catch (error) {
    res.status(500).json({ error: 'File validation failed' });
  }
});
```

### 2. File Path Security

```typescript
import fs from 'fs/promises';
import path from 'path';

function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  return filename
    .replace(/\.\./g, '')
    .replace(/[<>:"|?*]/g, '')
    .replace(/[/\\]/g, '')
    .trim();
}

function generateSafePath(directory: string, filename: string): string {
  const safeFilename = sanitizeFilename(filename);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(7);
  
  const extension = path.extname(safeFilename);
  const name = path.basename(safeFilename, extension);
  
  const safePath = path.join(directory, `${name}-${timestamp}-${randomSuffix}${extension}`);
  
  // Ensure directory exists
  fs.mkdir(directory, { recursive: true });
  
  return safePath;
}

// Usage
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    const safePath = generateSafePath('./uploads', req.file.originalname);
    await fs.writeFile(safePath, req.file.buffer);
    
    res.json({ success: true, path: safePath });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed' });
  }
});
```

## API Input Validation

### 1. Query Parameter Validation

```typescript
// Query parameter validation
function validateQueryParams(params: Record<string, any>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate pagination
  if (params.page) {
    const page = parseInt(params.page);
    if (isNaN(page) || page < 1) {
      errors.push('Invalid page parameter');
    }
  }
  
  if (params.limit) {
    const limit = parseInt(params.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push('Invalid limit parameter (must be 1-100)');
    }
  }
  
  // Validate sort parameters
  const allowedSortFields = ['name', 'email', 'createdAt', 'updatedAt'];
  if (params.sortBy && !allowedSortFields.includes(params.sortBy)) {
    errors.push('Invalid sortBy parameter');
  }
  
  if (params.sortOrder && !['asc', 'desc'].includes(params.sortOrder)) {
    errors.push('Invalid sortOrder parameter');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Express middleware
function validateQuery() {
  return (req: Request, res: Response, next: NextFunction) => {
    const { isValid, errors } = validateQueryParams(req.query);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        errors
      });
    }
    
    next();
  };
}

app.get('/api/users', validateQuery(), async (req, res) => {
  // Process validated query parameters
});
```

### 2. Request Body Validation

```typescript
// Complex request body validation
interface CreateOrderRequest {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: 'credit_card' | 'paypal' | 'stripe';
}

function validateCreateOrder(data: any): data is CreateOrderRequest {
  // Validate customer ID
  if (!data.customerId || typeof data.customerId !== 'string') {
    return false;
  }
  
  // Validate items
  if (!Array.isArray(data.items) || data.items.length === 0) {
    return false;
  }
  
  for (const item of data.items) {
    if (!item.productId || !item.quantity || !item.price) {
      return false;
    }
    
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      return false;
    }
    
    if (typeof item.price !== 'number' || item.price <= 0) {
      return false;
    }
  }
  
  // Validate shipping address
  const address = data.shippingAddress;
  if (!address || typeof address !== 'object') {
    return false;
  }
  
  const requiredAddressFields = ['street', 'city', 'country', 'postalCode'];
  for (const field of requiredAddressFields) {
    if (!address[field] || typeof address[field] !== 'string') {
      return false;
    }
  }
  
  // Validate payment method
  const validPaymentMethods = ['credit_card', 'paypal', 'stripe'];
  if (!validPaymentMethods.includes(data.paymentMethod)) {
    return false;
  }
  
  return true;
}

app.post('/api/orders', (req, res) => {
  if (!validateCreateOrder(req.body)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid order data'
    });
  }
  
  // Process order
});
```

## Best Practices Summary

### 1. Input Validation
- Always validate on the server-side (never trust client-side validation)
- Use whitelist approach - only allow known good inputs
- Validate data type, length, format, and range
- Implement comprehensive error messages without exposing sensitive information

### 2. XSS Prevention
- Always escape output based on context (HTML, JavaScript, CSS, URL)
- Implement Content Security Policy (CSP)
- Use modern frameworks that provide automatic XSS protection
- Sanitize user input when storing HTML content

### 3. SQL Injection Prevention
- Always use parameterized queries or prepared statements
- Use ORM frameworks that handle parameterization automatically
- Never concatenate user input directly into SQL queries
- Validate and sanitize all database inputs

### 4. Command Injection Prevention
- Avoid using shell commands with user input
- Use Node.js APIs instead of shell commands when possible
- Validate and sanitize all command parameters
- Use allowlists for commands and arguments

### 5. File Upload Security
- Validate file types by content, not just extension
- Limit file size and enforce storage quotas
- Store files outside web root or use secure file serving
- Generate safe filenames and validate file paths

### 6. API Security
- Validate all input parameters (query, body, headers, path)
- Implement rate limiting and throttling
- Use proper authentication and authorization
- Log and monitor all API requests

### 7. Security Checklist
- [ ] Input validation implemented for all endpoints
- [ ] XSS protection with proper escaping
- [ ] SQL injection prevention with parameterized queries
- [ ] Command injection prevention
- [ ] File upload validation and security
- [ ] Content Security Policy configured
- [ ] Error handling without information leakage
- [ ] Security headers implemented
- [ ] Regular security audits and testing

Remember: Security is an ongoing process. Regularly update dependencies, monitor for new vulnerabilities, and test your application's security posture.