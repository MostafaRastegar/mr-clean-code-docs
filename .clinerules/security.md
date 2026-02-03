---
paths:
  - "src/**/*.js"
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "**/*.js"
  - "**/*.ts"
  - "**/*.tsx"
---

# Security

This directory contains comprehensive security guidelines and best practices for JavaScript and TypeScript applications. Security is a critical aspect of software development that should be considered throughout the entire development lifecycle.

## Security Principles

### 1. Defense in Depth
Implement multiple layers of security controls to protect your application. Don't rely on a single security measure.

### 2. Principle of Least Privilege
Grant users and systems only the minimum permissions necessary to perform their functions.

### 3. Fail Securely
Ensure that when security mechanisms fail, they fail in a secure state rather than an insecure one.

### 4. Security by Design
Integrate security considerations into the design and architecture phases, not as an afterthought.

### 5. Continuous Monitoring
Implement logging, monitoring, and alerting to detect and respond to security incidents.

## Input Validation

### ✅ Good Examples
```javascript
// Comprehensive input validation
class InputValidator {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string') {
      throw new ValidationError('Email is required and must be a string');
    }
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
    return email.trim().toLowerCase();
  }

  static validatePassword(password) {
    if (!password || typeof password !== 'string') {
      throw new ValidationError('Password is required and must be a string');
    }
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new ValidationError('Password must contain uppercase, lowercase, and numeric characters');
    }
    return password;
  }

  static sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }
    return input.replace(/[<>\"'&]/g, (match) => {
      const map = {
        '<': '<',
        '>': '>',
        '"': '"',
        "'": '&#x27;',
        '&': '&'
      };
      return map[match];
    });
  }
}

// API input validation
app.post('/api/users', (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const validatedName = InputValidator.sanitizeInput(name);
    const validatedEmail = InputValidator.validateEmail(email);
    const validatedPassword = InputValidator.validatePassword(password);
    
    // Continue with user creation
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### ❌ Bad Examples
```javascript
// No input validation
app.post('/api/users', (req, res) => {
  const { name, email, password } = req.body;
  // Directly use user input without validation
  createUser({ name, email, password });
});

// Weak validation
function validateEmail(email) {
  return email.includes('@'); // Too simple
}

// No sanitization
function displayUserInput(input) {
  document.getElementById('output').innerHTML = input; // XSS vulnerability
}
```

## Authentication & Authorization

### ✅ Good Examples
```javascript
// Secure authentication with JWT
class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.tokenExpiry = '24h';
  }

  async authenticateUser(credentials) {
    const { email, password } = credentials;
    
    // Validate input
    InputValidator.validateEmail(email);
    
    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      this.jwtSecret,
      { expiresIn: this.tokenExpiry }
    );
    
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }
}

// Role-based authorization
class AuthorizationService {
  static checkPermission(user, requiredRole, resource) {
    if (!user || !user.role) {
      throw new AuthorizationError('User not authenticated');
    }
    
    const userRole = user.role;
    const permissions = this.getRolePermissions(userRole);
    
    if (!permissions.includes(requiredRole)) {
      throw new AuthorizationError('Insufficient permissions');
    }
    
    // Additional resource-specific checks
    if (resource && !this.checkResourceAccess(user, resource)) {
      throw new AuthorizationError('Access denied to resource');
    }
    
    return true;
  }

  static getRolePermissions(role) {
    const rolePermissions = {
      admin: ['read', 'write', 'delete', 'manage_users'],
      editor: ['read', 'write'],
      viewer: ['read']
    };
    
    return rolePermissions[role] || [];
  }
}

// Secure middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}
```

### ❌ Bad Examples
```javascript
// Weak authentication
function authenticateUser(email, password) {
  // No input validation
  const user = findUserByEmail(email);
  if (user.password === password) { // Plain text comparison
    return { success: true, user };
  }
  return { success: false };
}

// No authorization checks
app.get('/api/admin/users', (req, res) => {
  // Anyone can access admin endpoints
  const users = getAllUsers();
  res.json(users);
});

// Session-based auth without security
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = findUser(email, password);
  if (user) {
    req.session.userId = user.id; // No additional security
    res.json({ success: true });
  }
});
```

## Data Protection

### ✅ Good Examples
```javascript
// Password hashing with bcrypt
class PasswordService {
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

// Data encryption
class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('additional_data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    const { encrypted, iv, authTag } = encryptedData;
    
    const decipher = crypto.createDecipher(this.algorithm, this.key);
    decipher.setAAD(Buffer.from('additional_data'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Secure file handling
class FileService {
  static async uploadFile(file, userId) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type');
    }
    
    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File too large');
    }
    
    // Generate secure filename
    const filename = `${Date.now()}-${crypto.randomBytes(16).toString('hex')}${path.extname(file.originalname)}`;
    
    // Store in secure location
    const uploadPath = path.join(process.env.UPLOAD_DIR, filename);
    await fs.promises.writeFile(uploadPath, file.buffer);
    
    return { filename, path: uploadPath };
  }
}
```

### ❌ Bad Examples
```javascript
// Plain text passwords
function createUser(userData) {
  const user = {
    name: userData.name,
    email: userData.email,
    password: userData.password // Stored in plain text
  };
  return saveUser(user);
}

// No encryption for sensitive data
function saveUserProfile(profile) {
  const encryptedData = {
    ssn: profile.ssn, // No encryption
    creditCard: profile.creditCard, // No encryption
    medicalInfo: profile.medicalInfo // No encryption
  };
  return saveToDatabase(encryptedData);
}

// Insecure file upload
app.post('/upload', (req, res) => {
  const file = req.files.file;
  // No validation
  file.mv(`uploads/${file.name}`); // Direct file name usage
  res.send('File uploaded');
});
```

## Secure Coding Practices

### ✅ Good Examples
```javascript
// Secure API endpoints
class SecureAPI {
  // Rate limiting
  static applyRateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    });
  }

  // CORS configuration
  static configureCORS() {
    return cors({
      origin: process.env.ALLOWED_ORIGINS.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    });
  }

  // Helmet for security headers
  static configureSecurityHeaders() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    });
  }

  // Input sanitization middleware
  static sanitizeInput(req, res, next) {
    if (req.body) {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = InputValidator.sanitizeInput(req.body[key]);
        }
      }
    }
    next();
  }
}

// Error handling without information disclosure
class ErrorHandler {
  static handle(error, req, res, next) {
    // Log the actual error for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Don't expose internal error details to client
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.message
      });
    }

    if (error instanceof AuthenticationError) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Please check your credentials'
      });
    }

    if (error instanceof AuthorizationError) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this resource'
      });
    }

    // Generic error for unexpected issues
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}
```

### ❌ Bad Examples
```javascript
// No security headers
app.use((req, res, next) => {
  // No security middleware
  next();
});

// Information disclosure
app.use((error, req, res, next) => {
  // Exposing internal error details
  res.status(500).json({
    error: error.message,
    stack: error.stack,
    file: error.fileName,
    line: error.lineNumber
  });
});

// No rate limiting
app.post('/api/login', (req, res) => {
  // No protection against brute force attacks
  authenticateUser(req.body);
});

// Insecure direct object references
app.get('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  // No authorization check
  res.sendFile(path.join(__dirname, 'files', filename));
});
```

## API Security

### ✅ Good Examples
```javascript
// Secure API design
class SecureAPIController {
  // Versioning and deprecation
  @version('1.0.0')
  @deprecated('Use /v2/users instead')
  getUsers(req, res) {
    // Implementation
  }

  // Input validation and sanitization
  @validate({
    query: {
      page: { type: 'number', min: 1 },
      limit: { type: 'number', max: 100 },
      sort: { type: 'string', enum: ['name', 'email', 'created_at'] }
    }
  })
  async getUsersV2(req, res) {
    const { page = 1, limit = 10, sort = 'created_at' } = req.query;
    
    // Authorization check
    AuthorizationService.checkPermission(req.user, 'read', 'users');
    
    const users = await this.userService.getUsers({
      page,
      limit,
      sort
    });
    
    res.json(users);
  }

  // Secure file download
  async downloadFile(req, res) {
    const { fileId } = req.params;
    const userId = req.user.id;
    
    // Authorization check
    const file = await this.fileService.getFile(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    if (file.ownerId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Secure file serving
    res.setHeader('Content-Disposition', `attachment; filename="${file.secureName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.sendFile(file.path);
  }
}

// API documentation with security requirements
/**
 * @swagger
 * /api/users:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           maximum: 100
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
```

### ❌ Bad Examples
```javascript
// No API versioning
app.get('/api/users', (req, res) => {
  // Breaking changes without versioning
});

// No input validation
app.post('/api/data', (req, res) => {
  // Direct use of req.body without validation
  saveData(req.body);
});

// Information disclosure in API responses
app.get('/api/users/:id', (req, res) => {
  const user = getUserById(req.params.id);
  // Exposing sensitive information
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash, // Never expose this
    apiKey: user.apiKey // Never expose this
  });
});
```

## Code Review Checklist

- [ ] Input validation implemented for all user inputs
- [ ] Output encoding/sanitization applied
- [ ] Authentication implemented securely
- [ ] Authorization checks in place
- [ ] Passwords hashed with strong algorithms
- [ ] Sensitive data encrypted at rest and in transit
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] CORS configured securely
- [ ] Error handling doesn't leak information
- [ ] Dependencies are up to date and secure
- [ ] SQL injection prevention measures in place
- [ ] XSS prevention measures in place
- [ ] CSRF protection implemented
- [ ] Secure session management
- [ ] File upload security measures
- [ ] API security best practices followed
- [ ] Security testing performed