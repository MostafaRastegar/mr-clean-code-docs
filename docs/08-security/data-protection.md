# Data Protection

## Overview

Data protection is essential for maintaining user privacy, complying with regulations (like GDPR, CCPA), and building trust with your users. This document provides comprehensive guidelines for implementing robust data protection measures in JavaScript and TypeScript applications, covering encryption, secure storage, data anonymization, and privacy compliance.

## Encryption Strategies

### 1. Data Encryption at Rest

**AES Encryption Implementation:**
```typescript
import crypto from 'crypto';

interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
}

class DataEncryptionService {
  private readonly config: EncryptionConfig = {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16
  };

  private readonly key: Buffer;
  private readonly salt: Buffer;

  constructor(encryptionKey?: string) {
    // Use environment variable or generate a secure key
    const keyMaterial = encryptionKey || process.env.ENCRYPTION_KEY;
    
    if (!keyMaterial) {
      throw new Error('Encryption key is required');
    }

    // Derive encryption key from provided material
    this.salt = crypto.randomBytes(16);
    this.key = crypto.scryptSync(keyMaterial, this.salt, this.config.keyLength);
  }

  // Encrypt data
  encrypt(plaintext: string): { ciphertext: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(this.config.ivLength);
    const cipher = crypto.createCipher(this.config.algorithm, this.key, iv);
    
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      ciphertext,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  // Decrypt data
  decrypt(encryptedData: { ciphertext: string; iv: string; authTag: string }): string {
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    
    const decipher = crypto.createDecipher(this.config.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    
    let plaintext = decipher.update(encryptedData.ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');
    
    return plaintext;
  }

  // Encrypt sensitive fields in an object
  encryptObject<T extends Record<string, any>>(
    obj: T, 
    sensitiveFields: (keyof T)[]
  ): T {
    const encryptedObj = { ...obj };
    
    sensitiveFields.forEach(field => {
      if (obj[field] && typeof obj[field] === 'string') {
        const encrypted = this.encrypt(obj[field]);
        encryptedObj[field] = JSON.stringify(encrypted) as any;
      }
    });
    
    return encryptedObj;
  }

  // Decrypt sensitive fields in an object
  decryptObject<T extends Record<string, any>>(
    obj: T, 
    sensitiveFields: (keyof T)[]
  ): T {
    const decryptedObj = { ...obj };
    
    sensitiveFields.forEach(field => {
      if (obj[field] && typeof obj[field] === 'string') {
        try {
          const encryptedData = JSON.parse(obj[field] as string);
          decryptedObj[field] = this.decrypt(encryptedData) as any;
        } catch (error) {
          // If decryption fails, keep original value
          console.warn(`Failed to decrypt field ${String(field)}:`, error);
        }
      }
    });
    
    return decryptedObj;
  }
}

// Usage example
const encryptionService = new DataEncryptionService();

// Encrypt user data before saving
const userData = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  ssn: '123-45-6789',
  creditCard: '4111-1111-1111-1111'
};

const encryptedUserData = encryptionService.encryptObject(userData, ['ssn', 'creditCard']);
// Save encryptedUserData to database

// Decrypt when retrieving
const decryptedUserData = encryptionService.decryptObject(encryptedUserData, ['ssn', 'creditCard']);
```

**Database-Level Encryption:**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ select: false }) // Don't select by default
  encryptedEmail: string;

  @Column({ select: false })
  encryptedSSN: string;

  // Virtual fields for decrypted data
  private _email?: string;
  private _ssn?: string;

  @BeforeInsert()
  @BeforeUpdate()
  encryptSensitiveData() {
    const encryptionService = new DataEncryptionService();
    
    this.encryptedEmail = JSON.stringify(encryptionService.encrypt(this._email || ''));
    this.encryptedSSN = JSON.stringify(encryptionService.encrypt(this._ssn || ''));
  }

  // Getter for email
  getEmail(): string {
    if (!this._email && this.encryptedEmail) {
      const encryptionService = new DataEncryptionService();
      const encryptedData = JSON.parse(this.encryptedEmail);
      this._email = encryptionService.decrypt(encryptedData);
    }
    return this._email || '';
  }

  // Setter for email
  setEmail(email: string): void {
    this._email = email;
    this.encryptedEmail = JSON.stringify(
      new DataEncryptionService().encrypt(email)
    );
  }

  // Similar getters/setters for SSN
  getSSN(): string {
    if (!this._ssn && this.encryptedSSN) {
      const encryptionService = new DataEncryptionService();
      const encryptedData = JSON.parse(this.encryptedSSN);
      this._ssn = encryptionService.decrypt(encryptedData);
    }
    return this._ssn || '';
  }

  setSSN(ssn: string): void {
    this._ssn = ssn;
    this.encryptedSSN = JSON.stringify(
      new DataEncryptionService().encrypt(ssn)
    );
  }
}
```

### 2. Data Encryption in Transit

**HTTPS Configuration:**
```typescript
import https from 'https';
import fs from 'fs';
import express from 'express';

// HTTPS server setup
const app = express();

const httpsOptions = {
  key: fs.readFileSync('/path/to/private-key.pem'),
  cert: fs.readFileSync('/path/to/certificate.pem'),
  ca: fs.readFileSync('/path/to/ca-bundle.pem')
};

// Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Create HTTPS server
const httpsServer = https.createServer(httpsOptions, app);

httpsServer.listen(443, () => {
  console.log('HTTPS server running on port 443');
});

// HTTP to HTTPS redirect
const httpApp = express();
httpApp.get('*', (req, res) => {
  res.redirect(`https://${req.headers.host}${req.url}`);
});

httpApp.listen(80, () => {
  console.log('HTTP redirect server running on port 80');
});
```

**TLS Configuration for Database Connections:**
```typescript
import { Pool } from 'pg';

// PostgreSQL with SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: true,
    ca: fs.readFileSync('/path/to/ca-certificate.crt').toString(),
    key: fs.readFileSync('/path/to/client-key.key').toString(),
    cert: fs.readFileSync('/path/to/client-cert.crt').toString()
  }
});

// MongoDB with TLS
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!, {
  ssl: true,
  sslValidate: true,
  sslCA: fs.readFileSync('/path/to/ca.pem'),
  sslCert: fs.readFileSync('/path/to/client.pem'),
  sslKey: fs.readFileSync('/path/to/client-key.pem')
});
```

## Secure Data Storage

### 1. Environment Variables and Secrets Management

**Secure Configuration:**
```typescript
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables securely
dotenv.config();

class SecureConfig {
  private static instance: SecureConfig;
  private secrets: Map<string, string> = new Map();

  private constructor() {
    this.loadSecrets();
  }

  static getInstance(): SecureConfig {
    if (!SecureConfig.instance) {
      SecureConfig.instance = new SecureConfig();
    }
    return SecureConfig.instance;
  }

  private loadSecrets() {
    // Load from environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'ENCRYPTION_KEY',
      'API_KEYS'
    ];

    requiredEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      if (!value) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
      this.secrets.set(envVar, value);
    });

    // Load from secure files if available
    this.loadFromFile('/etc/secrets/app-secrets.json');
  }

  private loadFromFile(filePath: string) {
    try {
      if (fs.existsSync(filePath)) {
        const secrets = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        Object.entries(secrets).forEach(([key, value]) => {
          this.secrets.set(key, value as string);
        });
      }
    } catch (error) {
      console.warn('Failed to load secrets from file:', error);
    }
  }

  get(key: string): string {
    const value = this.secrets.get(key);
    if (!value) {
      throw new Error(`Secret not found: ${key}`);
    }
    return value;
  }

  has(key: string): boolean {
    return this.secrets.has(key);
  }
}

// Usage
const config = SecureConfig.getInstance();
const dbUrl = config.get('DATABASE_URL');
const jwtSecret = config.get('JWT_SECRET');
```

**Secret Rotation:**
```typescript
class SecretRotationService {
  private readonly rotationInterval = 24 * 60 * 60 * 1000; // 24 hours
  private rotationTimer?: NodeJS.Timeout;

  startRotation() {
    this.rotationTimer = setInterval(() => {
      this.rotateSecrets();
    }, this.rotationInterval);
  }

  stopRotation() {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
    }
  }

  private async rotateSecrets() {
    try {
      // Generate new secrets
      const newSecrets = {
        JWT_SECRET: this.generateSecureSecret(),
        ENCRYPTION_KEY: this.generateSecureSecret(),
        API_KEYS: this.generateApiKeys()
      };

      // Update configuration
      const config = SecureConfig.getInstance();
      Object.entries(newSecrets).forEach(([key, value]) => {
        config.secrets.set(key, value);
      });

      // Notify services about secret rotation
      this.notifyServices(newSecrets);

      console.log('Secrets rotated successfully');
    } catch (error) {
      console.error('Failed to rotate secrets:', error);
    }
  }

  private generateSecureSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  private generateApiKeys(): Record<string, string> {
    return {
      serviceA: crypto.randomBytes(32).toString('hex'),
      serviceB: crypto.randomBytes(32).toString('hex')
    };
  }

  private notifyServices(newSecrets: Record<string, string>) {
    // Notify other services about secret rotation
    // This could be done via message queue, webhook, etc.
  }
}
```

### 2. Secure File Storage

**Encrypted File Storage:**
```typescript
import fs from 'fs';
import path from 'path';

class SecureFileStorage {
  private readonly encryptionService: DataEncryptionService;
  private readonly storagePath: string;

  constructor(storagePath: string, encryptionKey: string) {
    this.storagePath = storagePath;
    this.encryptionService = new DataEncryptionService(encryptionKey);
    
    // Ensure storage directory exists
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
  }

  // Store encrypted file
  async storeFile(filename: string, content: string): Promise<string> {
    const encryptedData = this.encryptionService.encrypt(content);
    const filePath = path.join(this.storagePath, `${filename}.enc`);
    
    const fileContent = JSON.stringify({
      iv: encryptedData.iv,
      authTag: encryptedData.authTag,
      ciphertext: encryptedData.ciphertext,
      metadata: {
        originalName: filename,
        createdAt: new Date().toISOString(),
        size: content.length
      }
    });

    await fs.promises.writeFile(filePath, fileContent);
    return filePath;
  }

  // Retrieve and decrypt file
  async retrieveFile(filename: string): Promise<string> {
    const filePath = path.join(this.storagePath, `${filename}.enc`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    const encryptedData = JSON.parse(fileContent);
    
    return this.encryptionService.decrypt({
      iv: encryptedData.iv,
      authTag: encryptedData.authTag,
      ciphertext: encryptedData.ciphertext
    });
  }

  // Delete file securely
  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(this.storagePath, `${filename}.enc`);
    
    if (fs.existsSync(filePath)) {
      // Overwrite file content before deletion
      const stats = fs.statSync(filePath);
      const buffer = Buffer.alloc(stats.size, 0);
      await fs.promises.writeFile(filePath, buffer);
      
      // Delete file
      await fs.promises.unlink(filePath);
    }
  }

  // List stored files (without content)
  async listFiles(): Promise<Array<{ name: string; size: number; createdAt: string }>> {
    const files = await fs.promises.readdir(this.storagePath);
    const fileInfos: Array<{ name: string; size: number; createdAt: string }> = [];

    for (const file of files) {
      if (file.endsWith('.enc')) {
        const filePath = path.join(this.storagePath, file);
        const content = await fs.promises.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        
        fileInfos.push({
          name: data.metadata.originalName,
          size: data.metadata.size,
          createdAt: data.metadata.createdAt
        });
      }
    }

    return fileInfos;
  }
}
```

## Data Anonymization and Pseudonymization

### 1. Data Anonymization Techniques

**PII Detection and Anonymization:**
```typescript
class DataAnonymizer {
  private readonly patterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    creditCard: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
    ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    name: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g
  };

  // Anonymize PII in text
  anonymizeText(text: string): string {
    let anonymizedText = text;

    // Replace emails
    anonymizedText = anonymizedText.replace(this.patterns.email, (match) => {
      const hash = crypto.createHash('md5').update(match).digest('hex').substring(0, 8);
      return `user-${hash}@anonymized.com`;
    });

    // Replace phone numbers
    anonymizedText = anonymizedText.replace(this.patterns.phone, () => {
      return `XXX-XXX-${Math.floor(Math.random() * 9000) + 1000}`;
    });

    // Replace SSN
    anonymizedText = anonymizedText.replace(this.patterns.ssn, () => {
      return `XXX-XX-${Math.floor(Math.random() * 9000) + 1000}`;
    });

    // Replace credit cards
    anonymizedText = anonymizedText.replace(this.patterns.creditCard, (match) => {
      const last4 = match.slice(-4);
      return `XXXX-XXXX-XXXX-${last4}`;
    });

    // Replace IP addresses
    anonymizedText = anonymizedText.replace(this.patterns.ipAddress, () => {
      return `192.168.1.${Math.floor(Math.random() * 255) + 1}`;
    });

    return anonymizedText;
  }

  // Anonymize structured data
  anonymizeObject<T extends Record<string, any>>(obj: T): T {
    const anonymizedObj = { ...obj };

    Object.keys(anonymizedObj).forEach(key => {
      const value = anonymizedObj[key];
      
      if (typeof value === 'string') {
        anonymizedObj[key] = this.anonymizeText(value);
      } else if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          anonymizedObj[key] = value.map(item => 
            typeof item === 'object' ? this.anonymizeObject(item) : item
          );
        } else {
          anonymizedObj[key] = this.anonymizeObject(value);
        }
      }
    });

    return anonymizedObj;
  }

  // Generate synthetic data for testing
  generateSyntheticData(template: Record<string, any>): Record<string, any> {
    const syntheticData = { ...template };

    Object.keys(syntheticData).forEach(key => {
      const value = syntheticData[key];
      
      if (typeof value === 'string') {
        if (this.patterns.email.test(value)) {
          syntheticData[key] = this.generateEmail();
        } else if (this.patterns.phone.test(value)) {
          syntheticData[key] = this.generatePhone();
        } else if (this.patterns.ssn.test(value)) {
          syntheticData[key] = this.generateSSN();
        } else {
          syntheticData[key] = this.generateRandomString(value.length);
        }
      }
    });

    return syntheticData;
  }

  private generateEmail(): string {
    const domains = ['example.com', 'test.org', 'demo.net'];
    const name = Math.random().toString(36).substring(2, 8);
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${name}@${domain}`;
  }

  private generatePhone(): string {
    return `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  }

  private generateSSN(): string {
    return `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`;
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
```

### 2. Data Masking

**Field-Level Data Masking:**
```typescript
class DataMasker {
  private readonly maskingRules: Record<string, (value: any) => any> = {
    email: (value: string) => this.maskEmail(value),
    phone: (value: string) => this.maskPhone(value),
    ssn: (value: string) => this.maskSSN(value),
    creditCard: (value: string) => this.maskCreditCard(value),
    name: (value: string) => this.maskName(value),
    address: (value: string) => this.maskAddress(value)
  };

  // Mask specific fields in an object
  maskObject<T extends Record<string, any>>(
    obj: T, 
    fieldsToMask: (keyof T)[]
  ): T {
    const maskedObj = { ...obj };

    fieldsToMask.forEach(field => {
      const fieldName = String(field).toLowerCase();
      const maskingFunction = this.maskingRules[fieldName];
      
      if (maskingFunction && maskedObj[field]) {
        maskedObj[field] = maskingFunction(maskedObj[field]);
      }
    });

    return maskedObj;
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.length > 2 
      ? localPart.substring(0, 2) + '*'.repeat(localPart.length - 2)
      : '*'.repeat(localPart.length);
    
    return `${maskedLocal}@${domain}`;
  }

  private maskPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 4) {
      const last4 = digits.slice(-4);
      return `***-***-${last4}`;
    }
    return '***-***-****';
  }

  private maskSSN(ssn: string): string {
    return `***-**-${ssn.slice(-4)}`;
  }

  private maskCreditCard(card: string): string {
    const digits = card.replace(/\D/g, '');
    if (digits.length >= 4) {
      const last4 = digits.slice(-4);
      return `****-****-****-${last4}`;
    }
    return '****-****-****-****';
  }

  private maskName(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      const firstName = parts[0].charAt(0) + '*'.repeat(parts[0].length - 1);
      const lastName = parts[parts.length - 1].charAt(0) + '*'.repeat(parts[parts.length - 1].length - 1);
      return `${firstName} ${lastName}`;
    }
    return '*'.repeat(name.length);
  }

  private maskAddress(address: string): string {
    // Mask street number and name, keep city and country
    const parts = address.split(',');
    if (parts.length >= 2) {
      const street = parts[0].trim();
      const remaining = parts.slice(1).join(', ');
      
      // Mask street information
      const maskedStreet = '*'.repeat(street.length);
      return `${maskedStreet}, ${remaining}`;
    }
    return '*'.repeat(address.length);
  }
}
```

## Privacy Compliance

### 1. GDPR Compliance

**Data Subject Rights Implementation:**
```typescript
class GDPRComplianceService {
  private readonly dataRetentionPeriod = 7 * 365 * 24 * 60 * 60 * 1000; // 7 years

  // Right to Access - Export user data
  async exportUserData(userId: string): Promise<any> {
    const userData = await this.collectUserData(userId);
    const anonymizedData = this.anonymizeUserData(userData);
    
    return {
      exportDate: new Date().toISOString(),
      userId,
      data: anonymizedData,
      format: 'json'
    };
  }

  // Right to Erasure - Delete user data
  async eraseUserData(userId: string): Promise<void> {
    // Anonymize user data instead of deleting (for legal/audit purposes)
    await this.anonymizeUserDataForErasure(userId);
    
    // Delete authentication data
    await this.deleteAuthenticationData(userId);
    
    // Delete preferences and settings
    await this.deleteUserPreferences(userId);
    
    // Log the erasure for audit purposes
    await this.logDataErasure(userId);
  }

  // Right to Rectification - Update user data
  async rectifyUserData(userId: string, updates: Partial<User>): Promise<void> {
    // Validate updates
    const validation = this.validateDataUpdates(updates);
    if (!validation.isValid) {
      throw new Error(`Invalid data updates: ${validation.errors.join(', ')}`);
    }

    // Update user data
    await this.updateUserData(userId, updates);
    
    // Log the rectification
    await this.logDataRectification(userId, updates);
  }

  // Data Processing Agreement
  async createDataProcessingAgreement(userId: string): Promise<string> {
    const agreement = {
      userId,
      agreementDate: new Date().toISOString(),
      dataProcessed: await this.getProcessedDataTypes(userId),
      purposes: this.getDataProcessingPurposes(),
      legalBasis: 'Consent and legitimate interests',
      dataRetention: this.dataRetentionPeriod,
      userRights: [
        'Right to access',
        'Right to rectification',
        'Right to erasure',
        'Right to restriction of processing',
        'Right to data portability',
        'Right to object'
      ]
    };

    return JSON.stringify(agreement, null, 2);
  }

  // Consent Management
  async manageConsent(userId: string, consentType: string, granted: boolean): Promise<void> {
    const consentRecord = {
      userId,
      consentType,
      granted,
      timestamp: new Date().toISOString(),
      ipAddress: this.getCurrentIpAddress()
    };

    await this.storeConsentRecord(consentRecord);
    
    if (granted) {
      await this.enableDataProcessing(userId, consentType);
    } else {
      await this.disableDataProcessing(userId, consentType);
    }
  }

  private async collectUserData(userId: string): Promise<any> {
    // Collect data from all systems
    const userData = {
      profile: await this.getUserProfile(userId),
      activity: await this.getUserActivity(userId),
      preferences: await this.getUserPreferences(userId),
      communications: await this.getUserCommunications(userId)
    };

    return userData;
  }

  private anonymizeUserData(userData: any): any {
    const anonymizer = new DataAnonymizer();
    return anonymizer.anonymizeObject(userData);
  }

  private async anonymizeUserDataForErasure(userId: string): Promise<void> {
    // Replace identifying information with anonymized data
    const anonymizer = new DataAnonymizer();
    
    // Update user profile with anonymized data
    await this.updateUserProfileWithAnonymizedData(userId, anonymizer);
    
    // Anonymize activity logs
    await this.anonymizeUserActivity(userId, anonymizer);
  }

  private validateDataUpdates(updates: Partial<User>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (updates.email && !this.isValidEmail(updates.email)) {
      errors.push('Invalid email format');
    }

    if (updates.phone && !this.isValidPhone(updates.phone)) {
      errors.push('Invalid phone format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  private getCurrentIpAddress(): string {
    // Get IP from request or return localhost for server-side
    return '127.0.0.1';
  }

  // Placeholder methods - implement based on your data storage
  private async getUserProfile(userId: string): Promise<any> { return {}; }
  private async getUserActivity(userId: string): Promise<any> { return {}; }
  private async getUserPreferences(userId: string): Promise<any> { return {}; }
  private async getUserCommunications(userId: string): Promise<any> { return {}; }
  private async deleteUserPreferences(userId: string): Promise<void> {}
  private async deleteAuthenticationData(userId: string): Promise<void> {}
  private async logDataErasure(userId: string): Promise<void> {}
  private async updateUserData(userId: string, updates: Partial<User>): Promise<void> {}
  private async logDataRectification(userId: string, updates: any): Promise<void> {}
  private async getProcessedDataTypes(userId: string): Promise<string[]> { return []; }
  private getDataProcessingPurposes(): string[] { return []; }
  private async storeConsentRecord(consentRecord: any): Promise<void> {}
  private async enableDataProcessing(userId: string, consentType: string): Promise<void> {}
  private async disableDataProcessing(userId: string, consentType: string): Promise<void> {}
  private async updateUserProfileWithAnonymizedData(userId: string, anonymizer: DataAnonymizer): Promise<void> {}
  private async anonymizeUserActivity(userId: string, anonymizer: DataAnonymizer): Promise<void> {}
}
```

### 2. Data Minimization

**Data Collection Optimization:**
```typescript
class DataMinimizationService {
  private readonly collectedData: Set<string> = new Set();
  private readonly retentionPolicies: Map<string, number> = new Map();

  constructor() {
    this.initializeRetentionPolicies();
  }

  private initializeRetentionPolicies() {
    this.retentionPolicies.set('user_profile', 7 * 365 * 24 * 60 * 60 * 1000); // 7 years
    this.retentionPolicies.set('activity_logs', 90 * 24 * 60 * 60 * 1000); // 90 days
    this.retentionPolicies.set('session_data', 30 * 24 * 60 * 60 * 1000); // 30 days
    this.retentionPolicies.set('analytics', 365 * 24 * 60 * 60 * 1000); // 1 year
  }

  // Validate data collection necessity
  validateDataCollection(dataType: string, purpose: string): boolean {
    const requiredFields = this.getRequiredFieldsForPurpose(purpose);
    const isNecessary = requiredFields.includes(dataType);
    
    if (isNecessary) {
      this.collectedData.add(dataType);
      this.scheduleDataRetention(dataType);
    }

    return isNecessary;
  }

  // Get minimal required fields for a specific purpose
  private getRequiredFieldsForPurpose(purpose: string): string[] {
    const fieldMappings: Record<string, string[]> = {
      'user_authentication': ['email', 'password_hash'],
      'user_profile': ['name', 'email'],
      'payment_processing': ['payment_method', 'billing_address'],
      'customer_support': ['name', 'email', 'issue_description'],
      'analytics': ['user_id', 'session_id', 'page_views']
    };

    return fieldMappings[purpose] || [];
  }

  // Schedule data retention and cleanup
  private scheduleDataRetention(dataType: string): void {
    const retentionPeriod = this.retentionPolicies.get(dataType);
    
    if (retentionPeriod) {
      setTimeout(() => {
        this.cleanupOldData(dataType);
      }, retentionPeriod);
    }
  }

  // Cleanup old data
  private async cleanupOldData(dataType: string): Promise<void> {
    console.log(`Cleaning up old ${dataType} data...`);
    
    // Implement cleanup logic based on your data storage
    switch (dataType) {
      case 'activity_logs':
        await this.cleanupActivityLogs();
        break;
      case 'session_data':
        await this.cleanupSessionData();
        break;
      case 'analytics':
        await this.cleanupAnalyticsData();
        break;
    }

    this.collectedData.delete(dataType);
  }

  // Data usage audit
  auditDataUsage(): { collectedData: string[]; unusedData: string[]; recommendations: string[] } {
    const allPossibleData = Array.from(this.retentionPolicies.keys());
    const unusedData = allPossibleData.filter(data => !this.collectedData.has(data));
    
    const recommendations = unusedData.map(data => 
      `Consider removing ${data} collection to minimize data footprint`
    );

    return {
      collectedData: Array.from(this.collectedData),
      unusedData,
      recommendations
    };
  }

  // Implement cleanup methods
  private async cleanupActivityLogs(): Promise<void> {
    // Delete old activity logs
  }

  private async cleanupSessionData(): Promise<void> {
    // Delete old session data
  }

  private async cleanupAnalyticsData(): Promise<void> {
    // Delete old analytics data
  }
}
```

## Best Practices Summary

### 1. Encryption
- Use strong encryption algorithms (AES-256)
- Implement proper key management
- Encrypt sensitive data at rest and in transit
- Use HTTPS for all communications
- Regularly rotate encryption keys

### 2. Secure Storage
- Store secrets in environment variables
- Use secure file permissions
- Implement secure file deletion
- Use encrypted databases when possible
- Regularly audit access to sensitive data

### 3. Data Anonymization
- Implement PII detection and anonymization
- Use field-level masking for sensitive data
- Generate synthetic data for testing
- Anonymize data before sharing or analysis
- Maintain data utility while protecting privacy

### 4. Privacy Compliance
- Implement data subject rights (access, erasure, rectification)
- Manage user consent properly
- Create data processing agreements
- Implement data minimization principles
- Regularly audit data usage and retention

### 5. Security Checklist
- [ ] Encryption implemented for sensitive data
- [ ] HTTPS enforced for all communications
- [ ] Secrets managed securely
- [ ] Data anonymization implemented
- [ ] Privacy compliance measures in place
- [ ] Data retention policies defined
- [ ] Regular security audits conducted
- [ ] Incident response plan established
- [ ] Employee training on data protection
- [ ] Third-party data processors vetted

### 6. Data Protection Implementation
```typescript
// Complete data protection setup
class DataProtectionManager {
  private encryptionService: DataEncryptionService;
  private anonymizer: DataAnonymizer;
  private masker: DataMasker;
  private gdprService: GDPRComplianceService;
  private minimizationService: DataMinimizationService;

  constructor() {
    this.encryptionService = new DataEncryptionService(process.env.ENCRYPTION_KEY!);
    this.anonymizer = new DataAnonymizer();
    this.masker = new DataMasker();
    this.gdprService = new GDPRComplianceService();
    this.minimizationService = new DataMinimizationService();
  }

  // Protect user data before storage
  async protectUserData(userData: any): Promise<any> {
    // Encrypt sensitive fields
    const encryptedData = this.encryptionService.encryptObject(userData, [
      'ssn', 'creditCard', 'password'
    ]);

    // Validate data minimization
    const isNecessary = this.minimizationService.validateDataCollection(
      'user_profile', 
      JSON.stringify(encryptedData)
    );

    if (!isNecessary) {
      throw new Error('Data collection not justified');
    }

    return encryptedData;
  }

  // Prepare data for display
  prepareDataForDisplay(userData: any, userRole: string): any {
    if (userRole === 'admin') {
      // Admin can see masked data
      return this.masker.maskObject(userData, ['ssn', 'creditCard', 'phone']);
    } else {
      // Regular users see anonymized data
      return this.anonymizer.anonymizeObject(userData);
    }
  }

  // Handle data subject requests
  async handleDataSubjectRequest(
    userId: string, 
    requestType: 'access' | 'erasure' | 'rectification',
    requestData?: any
  ): Promise<any> {
    switch (requestType) {
      case 'access':
        return await this.gdprService.exportUserData(userId);
      case 'erasure':
        await this.gdprService.eraseUserData(userId);
        return { message: 'Data erasure completed' };
      case 'rectification':
        await this.gdprService.rectifyUserData(userId, requestData);
        return { message: 'Data rectification completed' };
      default:
        throw new Error('Invalid request type');
    }
  }
}
```

Remember: Data protection is not a one-time setup but an ongoing process. Regularly review and update your data protection measures to stay compliant with evolving regulations and security best practices.