# Authentication and Authorization

## Overview

Authentication and authorization are fundamental security concepts that control access to your application's resources. Authentication verifies who a user is, while authorization determines what they can do. This document provides comprehensive guidelines for implementing secure authentication and authorization in JavaScript and TypeScript applications.

## Authentication Strategies

### 1. JSON Web Tokens (JWT)

**JWT Implementation:**
```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly JWT_EXPIRES_IN = '24h';
  private readonly REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
  private readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  // Generate JWT tokens
  generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'your-app',
      audience: 'your-app-users'
    });

    const refreshToken = jwt.sign(
      { userId: payload.userId },
      this.REFRESH_TOKEN_SECRET,
      {
        expiresIn: this.REFRESH_TOKEN_EXPIRES_IN
      }
    );

    return { accessToken, refreshToken };
  }

  // Verify JWT token
  verifyToken(token: string): JWTPayload | null {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      return payload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // Refresh access token
  refreshAccessToken(refreshToken: string): { accessToken: string } | null {
    try {
      const payload = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET) as { userId: string };
      
      // In a real application, you'd verify the refresh token exists in your database
      // and hasn't been revoked
      
      const newTokens = this.generateTokens({
        userId: payload.userId,
        email: '', // You'd fetch this from database
        role: '' // You'd fetch this from database
      });

      return { accessToken: newTokens.accessToken };
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

// Express middleware for JWT authentication
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const authService = new AuthService();
  const payload = authService.verifyToken(token);

  if (!payload) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  // Add user info to request
  req.user = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role
  };

  next();
}

// Usage
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const authService = new AuthService();
    const isValidPassword = await authService.verifyPassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = authService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  const authService = new AuthService();
  const result = authService.refreshAccessToken(refreshToken);

  if (!result) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }

  res.json({
    success: true,
    accessToken: result.accessToken
  });
});
```

**JWT Security Best Practices:**
```typescript
class SecureJWTService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly BLACKLISTED_TOKENS = new Set<string>();

  // Add token to blacklist
  blacklistToken(token: string): void {
    this.BLACKLISTED_TOKENS.add(token);
  }

  // Check if token is blacklisted
  isTokenBlacklisted(token: string): boolean {
    return this.BLACKLISTED_TOKENS.has(token);
  }

  // Secure token generation with additional claims
  generateSecureToken(payload: any): string {
    const now = Math.floor(Date.now() / 1000);
    
    const tokenPayload = {
      ...payload,
      iat: now,
      jti: this.generateJTI(), // JWT ID for uniqueness
      iss: 'your-app',
      aud: 'your-app-users'
    };

    return jwt.sign(tokenPayload, this.JWT_SECRET, {
      expiresIn: '15m', // Short expiration for access tokens
      algorithm: 'HS256'
    });
  }

  private generateJTI(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Verify token with additional security checks
  verifySecureToken(token: string): any | null {
    try {
      // Check if token is blacklisted
      if (this.isTokenBlacklisted(token)) {
        throw new Error('Token has been revoked');
      }

      const payload = jwt.verify(token, this.JWT_SECRET, {
        algorithms: ['HS256'], // Specify allowed algorithms
        issuer: 'your-app',
        audience: 'your-app-users'
      });

      return payload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
}
```

### 2. Session-Based Authentication

**Session Management:**
```typescript
import session from 'express-session';
import Redis from 'ioredis';

// Redis session store
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
});

class SessionStore extends session.Store {
  constructor() {
    super();
  }

  get(sid: string, callback: (err?: any, session?: session.SessionData | null) => void): void {
    redis.get(`sess:${sid}`, (err, data) => {
      if (err) return callback(err);
      if (!data) return callback();
      
      try {
        callback(null, JSON.parse(data));
      } catch (parseError) {
        callback(parseError);
      }
    });
  }

  set(sid: string, session: session.SessionData, callback?: (err?: any) => void): void {
    try {
      const sessionData = JSON.stringify(session);
      redis.setex(`sess:${sid}`, 86400, sessionData, callback);
    } catch (error) {
      if (callback) callback(error);
    }
  }

  destroy(sid: string, callback?: (err?: any) => void): void {
    redis.del(`sess:${sid}`, callback);
  }

  touch(sid: string, session: session.SessionData, callback?: (err?: any) => void): void {
    redis.expire(`sess:${sid}`, 86400, callback);
  }
}

// Configure session middleware
app.use(session({
  store: new SessionStore(),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: 'strict' // CSRF protection
  },
  name: 'sessionId' // Don't use default session name
}));

// Session-based authentication middleware
function authenticateSession(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Load user from database if needed
  if (!req.session.user) {
    // Fetch user and attach to session
    // req.session.user = await User.findById(req.session.userId);
  }

  req.user = req.session.user;
  next();
}

// Login with session
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    res.json({
      success: true,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    res.clearCookie('sessionId');
    res.json({ success: true, message: 'Logout successful' });
  });
});
```

### 3. OAuth 2.0 and OpenID Connect

**OAuth 2.0 Implementation:**
```typescript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';

// Configure Passport strategies
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: '/auth/google/callback',
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find or create user
    let user = await User.findOne({ where: { googleId: profile.id } });
    
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails?.[0].value,
        name: profile.displayName,
        avatar: profile.photos?.[0].value
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  callbackURL: '/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { githubId: profile.id } });
    
    if (!user) {
      user = await User.create({
        githubId: profile.id,
        username: profile.username,
        email: profile.emails?.[0].value
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// OAuth routes
app.get('/auth/google', passport.authenticate('google'));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/dashboard');
  }
);

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

// Generate JWT after OAuth success
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const authService = new AuthService();
    const tokens = authService.generateTokens({
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role
    });

    // Redirect with tokens or set cookies
    res.redirect(`/dashboard?token=${tokens.accessToken}`);
  }
);
```

## Authorization Patterns

### 1. Role-Based Access Control (RBAC)

**Role Management:**
```typescript
interface User {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}

type UserRole = 'admin' | 'moderator' | 'user' | 'guest';

type Permission = 
  | 'read:users'
  | 'write:users'
  | 'delete:users'
  | 'read:posts'
  | 'write:posts'
  | 'delete:posts'
  | 'admin:all';

class AuthorizationService {
  private readonly ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    admin: ['read:users', 'write:users', 'delete:users', 'read:posts', 'write:posts', 'delete:posts', 'admin:all'],
    moderator: ['read:users', 'read:posts', 'write:posts', 'delete:posts'],
    user: ['read:posts', 'write:posts'],
    guest: ['read:posts']
  };

  // Check if user has specific permission
  hasPermission(user: User, permission: Permission): boolean {
    // Admin has all permissions
    if (user.role === 'admin') {
      return true;
    }

    // Check direct permissions
    if (user.permissions.includes(permission)) {
      return true;
    }

    // Check role-based permissions
    const rolePermissions = this.ROLE_PERMISSIONS[user.role];
    return rolePermissions.includes(permission);
  }

  // Check if user can access resource
  canAccessResource(user: User, resource: string, action: string): boolean {
    const permission = `${action}:${resource}` as Permission;
    return this.hasPermission(user, permission);
  }

  // Check if user can perform action on specific resource
  canPerformAction(user: User, action: string, resource: any, userId?: string): boolean {
    // Admin can do anything
    if (user.role === 'admin') {
      return true;
    }

    // Users can only modify their own resources
    if (action === 'write' || action === 'delete') {
      if (resource.userId && resource.userId !== user.id) {
        return false;
      }
    }

    return this.hasPermission(user, `${action}:${resource.type}` as Permission);
  }
}

// Express middleware for authorization
function authorize(permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    const authService = new AuthorizationService();

    const hasPermission = permissions.some(permission => 
      authService.hasPermission(user, permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Usage examples
app.get('/api/users', authenticateToken, authorize(['read:users']), async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.put('/api/users/:id', authenticateToken, authorize(['write:users']), async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Additional check: users can only update themselves unless they're admin
  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(403).json({ error: 'Cannot update other users' });
  }

  const user = await User.findByIdAndUpdate(id, updates, { new: true });
  res.json(user);
});
```

### 2. Attribute-Based Access Control (ABAC)

**ABAC Implementation:**
```typescript
interface Policy {
  id: string;
  name: string;
  description: string;
  effect: 'allow' | 'deny';
  conditions: Condition[];
  resources: string[];
  actions: string[];
}

interface Condition {
  attribute: string;
  operator: 'equals' | 'in' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

class ABACService {
  private policies: Policy[] = [];

  constructor() {
    this.initializePolicies();
  }

  private initializePolicies() {
    this.policies = [
      {
        id: 'admin-all-access',
        name: 'Admin Full Access',
        description: 'Admins can access all resources',
        effect: 'allow',
        conditions: [{ attribute: 'role', operator: 'equals', value: 'admin' }],
        resources: ['*'],
        actions: ['*']
      },
      {
        id: 'user-own-resources',
        name: 'User Own Resources',
        description: 'Users can access their own resources',
        effect: 'allow',
        conditions: [
          { attribute: 'role', operator: 'in', value: ['user', 'moderator'] },
          { attribute: 'resource.ownerId', operator: 'equals', value: 'user.id' }
        ],
        resources: ['posts', 'comments'],
        actions: ['read', 'update', 'delete']
      },
      {
        id: 'time-restriction',
        name: 'Business Hours Access',
        description: 'Access only during business hours',
        effect: 'deny',
        conditions: [
          { attribute: 'role', operator: 'equals', value: 'guest' },
          { attribute: 'time.hour', operator: 'less_than', value: 9 },
          { attribute: 'time.hour', operator: 'greater_than', value: 17 }
        ],
        resources: ['*'],
        actions: ['*']
      }
    ];
  }

  // Evaluate access request
  evaluateAccess(user: any, resource: any, action: string): boolean {
    const context = {
      user,
      resource,
      time: {
        hour: new Date().getHours(),
        day: new Date().getDay()
      }
    };

    // Check deny policies first
    const denyPolicy = this.evaluatePolicies(context, action, 'deny');
    if (denyPolicy) {
      return false;
    }

    // Check allow policies
    const allowPolicy = this.evaluatePolicies(context, action, 'allow');
    return !!allowPolicy;
  }

  private evaluatePolicies(context: any, action: string, effect: 'allow' | 'deny'): Policy | null {
    for (const policy of this.policies) {
      if (policy.effect !== effect) continue;
      if (!this.matchesResources(policy.resources, context.resource)) continue;
      if (!policy.actions.includes(action) && !policy.actions.includes('*')) continue;
      if (this.evaluateConditions(policy.conditions, context)) {
        return policy;
      }
    }
    return null;
  }

  private matchesResources(policyResources: string[], resource: any): boolean {
    if (policyResources.includes('*')) return true;
    return policyResources.includes(resource.type || resource.constructor.name.toLowerCase());
  }

  private evaluateConditions(conditions: Condition[], context: any): boolean {
    return conditions.every(condition => {
      const value = this.getAttributeValue(condition.attribute, context);
      return this.evaluateCondition(value, condition.operator, condition.value);
    });
  }

  private getAttributeValue(attribute: string, context: any): any {
    // Handle nested attributes like 'user.role' or 'resource.ownerId'
    return attribute.split('.').reduce((obj, key) => obj?.[key], context);
  }

  private evaluateCondition(value: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return value === expected;
      case 'in':
        return Array.isArray(expected) ? expected.includes(value) : value === expected;
      case 'greater_than':
        return value > expected;
      case 'less_than':
        return value < expected;
      case 'contains':
        return Array.isArray(value) ? value.includes(expected) : String(value).includes(String(expected));
      default:
        return false;
    }
  }
}

// ABAC middleware
function abacAuthorize(resourceType: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const abacService = new ABACService();
    
    const canAccess = abacService.evaluateAccess(
      req.user,
      { type: resourceType, ...req.params },
      action
    );

    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied by policy' });
    }

    next();
  };
}

// Usage
app.get('/api/posts/:id', authenticateToken, abacAuthorize('post', 'read'), async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.json(post);
});
```

### 3. Multi-Factor Authentication (MFA)

**MFA Implementation:**
```typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

class MFAService {
  // Generate secret for user
  generateSecret(userEmail: string): { secret: string; otpauthUrl: string } {
    const secret = speakeasy.generateSecret({
      name: `YourApp (${userEmail})`,
      issuer: 'YourApp',
      length: 32
    });

    return {
      secret: secret.base32!,
      otpauthUrl: secret.otpauth_url!
    };
  }

  // Verify TOTP token
  verifyToken(secret: string, token: string, window: number = 1): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window
    });
  }

  // Generate backup codes
  generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
    return codes;
  }

  // Verify backup code
  verifyBackupCode(user: User, code: string): boolean {
    const index = user.backupCodes.indexOf(code);
    if (index !== -1) {
      user.backupCodes.splice(index, 1);
      // Save user with updated backup codes
      return true;
    }
    return false;
  }
}

// MFA setup endpoint
app.post('/api/auth/mfa/setup', authenticateToken, async (req, res) => {
  const user = req.user;
  const mfaService = new MFAService();

  const { secret, otpauthUrl } = mfaService.generateSecret(user.email);

  // Generate QR code
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  // Store secret temporarily (in real app, store encrypted in DB)
  user.tempMFASecret = secret;

  res.json({
    qrCode: qrCodeDataUrl,
    manualEntryKey: secret,
    message: 'Scan the QR code with your authenticator app'
  });
});

// MFA verification
app.post('/api/auth/mfa/verify', authenticateToken, async (req, res) => {
  const { token } = req.body;
  const user = req.user;
  const mfaService = new MFAService();

  if (!user.tempMFASecret) {
    return res.status(400).json({ error: 'MFA setup not initiated' });
  }

  if (mfaService.verifyToken(user.tempMFASecret, token)) {
    // Enable MFA
    user.mfaSecret = user.tempMFASecret;
    user.mfaEnabled = true;
    user.backupCodes = mfaService.generateBackupCodes();
    user.tempMFASecret = null;

    await user.save();

    res.json({
      success: true,
      message: 'MFA enabled successfully',
      backupCodes: user.backupCodes
    });
  } else {
    res.status(400).json({ error: 'Invalid verification code' });
  }
});

// Enhanced login with MFA
app.post('/api/auth/login', async (req, res) => {
  const { email, password, mfaToken } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if MFA is required
    if (user.mfaEnabled) {
      if (!mfaToken) {
        return res.status(200).json({
          requiresMFA: true,
          message: 'MFA verification required'
        });
      }

      const mfaService = new MFAService();
      const isValidMFAToken = mfaService.verifyToken(user.mfaSecret, mfaToken) ||
                             mfaService.verifyBackupCode(user, mfaToken);

      if (!isValidMFAToken) {
        return res.status(401).json({ error: 'Invalid MFA token' });
      }
    }

    // Generate tokens
    const authService = new AuthService();
    const tokens = authService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        mfaEnabled: user.mfaEnabled
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Security Best Practices

### 1. Password Security

**Password Policies:**
```typescript
class PasswordPolicy {
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password cannot contain repeated characters');
    }

    if (['123456', 'password', 'qwerty'].some(common => password.toLowerCase().includes(common))) {
      errors.push('Password cannot contain common patterns');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static checkPasswordHistory(password: string, oldPasswords: string[]): boolean {
    // Check against last 5 passwords (hashed)
    return !oldPasswords.some(oldHash => bcrypt.compareSync(password, oldHash));
  }

  static generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
}
```

### 2. Rate Limiting and Brute Force Protection

**Rate Limiting:**
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Redis-based rate limiter
const redisStore = new RedisStore({
  sendCommand: (...args: string[]) => redis.call(...args),
});

const authLimiter = rateLimit({
  store: redisStore,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Account lockout
class AccountLockoutService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  async checkAndLockAccount(email: string): Promise<boolean> {
    const key = `login_attempts:${email}`;
    const attempts = await redis.get(key);
    
    if (!attempts) {
      await redis.setex(key, 15 * 60, '1'); // 15 minute expiry
      return false;
    }

    const attemptCount = parseInt(attempts);
    
    if (attemptCount >= this.MAX_ATTEMPTS) {
      await redis.setex(`lockout:${email}`, this.LOCKOUT_DURATION / 1000, '1');
      return true;
    }

    await redis.incr(key);
    return false;
  }

  async isAccountLocked(email: string): Promise<boolean> {
    const locked = await redis.get(`lockout:${email}`);
    return locked === '1';
  }

  async resetAttempts(email: string): Promise<void> {
    await redis.del(`login_attempts:${email}`);
    await redis.del(`lockout:${email}`);
  }
}

// Enhanced login with rate limiting
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  const lockoutService = new AccountLockoutService();

  try {
    // Check if account is locked
    if (await lockoutService.isAccountLocked(email)) {
      return res.status(423).json({ 
        error: 'Account temporarily locked due to too many failed attempts' 
      });
    }

    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Increment failed attempts
      const locked = await lockoutService.checkAndLockAccount(email);
      
      if (locked) {
        return res.status(423).json({ 
          error: 'Account locked due to too many failed attempts' 
        });
      }

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset failed attempts on successful login
    await lockoutService.resetAttempts(email);

    // Generate tokens
    const authService = new AuthService();
    const tokens = authService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      tokens
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 3. Security Headers and CORS

**Security Configuration:**
```typescript
import helmet from 'helmet';
import cors from 'cors';

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.example.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Adjust based on your needs
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count']
}));

// Additional security middleware
app.use((req, res, next) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});
```

## Best Practices Summary

### 1. Authentication
- Use strong password hashing (bcrypt with high salt rounds)
- Implement multi-factor authentication for sensitive operations
- Use secure session management with appropriate timeouts
- Implement proper logout functionality
- Protect against brute force attacks with rate limiting

### 2. Authorization
- Implement principle of least privilege
- Use role-based or attribute-based access control
- Validate permissions on every request
- Separate authentication from authorization
- Log authorization decisions for auditing

### 3. Token Security
- Use short-lived access tokens with refresh tokens
- Implement token blacklisting for logout
- Store secrets securely (environment variables)
- Use HTTPS for all authentication endpoints
- Validate token signatures and claims

### 4. Session Security
- Use secure session storage (Redis with encryption)
- Set appropriate cookie security flags
- Implement session timeout and regeneration
- Protect against session fixation attacks
- Use CSRF tokens for state-changing operations

### 5. OAuth Security
- Use HTTPS for all OAuth flows
- Validate state parameters to prevent CSRF
- Store OAuth tokens securely
- Implement proper error handling
- Use PKCE for public clients

### 6. Security Checklist
- [ ] Strong password policies implemented
- [ ] Multi-factor authentication available
- [ ] Rate limiting on authentication endpoints
- [ ] Secure session management
- [ ] Proper authorization checks
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Regular security audits
- [ ] Logging and monitoring in place

Remember: Security is a continuous process. Regularly update dependencies, monitor for vulnerabilities, and review your authentication and authorization implementation.