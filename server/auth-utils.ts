import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { type Request } from 'express';

// Password security configuration
const SALT_ROUNDS = 12; // NHS recommends minimum 10, we use 12 for extra security
const PASSWORD_MIN_LENGTH = 8;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// Validate JWT secret exists in production
if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production');
}

// Use a fallback for development only
const JWT_SIGNING_KEY = JWT_SECRET || (process.env.NODE_ENV === 'development' ? crypto.randomBytes(64).toString('hex') : '');

// Password hashing and verification
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Password strength validation
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // NHS specific: Check against common medical terms and patterns
  const commonMedicalPasswords = [
    'password123', 'nhs12345', 'medical123', 'doctor123', 'nurse123',
    'patient123', 'dental123', 'health123', 'clinic123'
  ];
  
  if (commonMedicalPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Token generation
export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SIGNING_KEY, { expiresIn: JWT_EXPIRES_IN });
}

export function generateRefreshToken(payload: any): string {
  return jwt.sign(payload, JWT_SIGNING_KEY, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SIGNING_KEY);
}

// Secure random token generation
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Email verification token
export function generateEmailVerificationToken(): string {
  return generateSecureToken(32);
}

// Password reset token
export function generatePasswordResetToken(): { token: string; expires: Date } {
  const token = generateSecureToken(32);
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // 1 hour expiry
  
  return { token, expires };
}

// Two-factor authentication
export function generate2FASecret(): string {
  return generateSecureToken(20);
}

// Account lockout check
export function isAccountLocked(failedAttempts: number, lockedUntil: Date | null): boolean {
  if (failedAttempts >= MAX_LOGIN_ATTEMPTS && lockedUntil) {
    return new Date() < lockedUntil;
  }
  return false;
}

// Calculate account lockout time
export function calculateLockoutTime(): Date {
  const lockoutTime = new Date();
  lockoutTime.setTime(lockoutTime.getTime() + LOCKOUT_DURATION);
  return lockoutTime;
}

// Extract IP address from request
export function getClientIp(req: Request): string {
  // Handle various proxy headers
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (forwarded as string).split(',')[0].trim();
  }
  
  return req.headers['x-real-ip'] as string || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         '';
}

// Sanitize user data for storage
export function sanitizeUserData(data: any): any {
  const sanitized = { ...data };
  
  // Remove sensitive fields that shouldn't be stored
  delete sanitized.password;
  delete sanitized.confirmPassword;
  delete sanitized.passwordHash;
  delete sanitized.twoFactorSecret;
  
  // Trim string fields
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].trim();
    }
  });
  
  return sanitized;
}

// NHS number validation
export function validateNHSNumber(nhsNumber: string): boolean {
  // NHS numbers are 10 digits
  if (!/^\d{10}$/.test(nhsNumber)) {
    return false;
  }
  
  // Checksum validation (Modulus 11)
  const digits = nhsNumber.split('').map(Number);
  const checkDigit = digits[9];
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  
  const remainder = sum % 11;
  const calculatedCheckDigit = remainder === 0 ? 0 : 11 - remainder;
  
  return calculatedCheckDigit === checkDigit;
}

// GDC number validation
export function validateGDCNumber(gdcNumber: string): boolean {
  // GDC numbers are typically 5-6 digits
  return /^\d{5,6}$/.test(gdcNumber);
}

// Data encryption for sensitive fields
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

export function encryptData(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptData(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
}

// Session security
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

// GDPR compliance helpers
export function anonymizePersonalData(data: any): any {
  const anonymized = { ...data };
  
  // Replace personal identifiers with anonymized versions
  if (anonymized.email) {
    const [localPart, domain] = anonymized.email.split('@');
    anonymized.email = `${localPart.substring(0, 2)}****@${domain}`;
  }
  
  if (anonymized.phone) {
    anonymized.phone = anonymized.phone.substring(0, 3) + '****' + anonymized.phone.slice(-2);
  }
  
  if (anonymized.firstName) {
    anonymized.firstName = anonymized.firstName.substring(0, 1) + '****';
  }
  
  if (anonymized.lastName) {
    anonymized.lastName = anonymized.lastName.substring(0, 1) + '****';
  }
  
  if (anonymized.dateOfBirth) {
    anonymized.dateOfBirth = '****';
  }
  
  if (anonymized.nhsNumber) {
    anonymized.nhsNumber = '****';
  }
  
  return anonymized;
}

// Audit logging helper
export function createAuditLogEntry(
  action: string,
  resourceType: string,
  userId?: number,
  userEmail?: string,
  resourceId?: number,
  additionalData?: any,
  req?: Request
): any {
  return {
    userId,
    userEmail,
    action,
    resourceType,
    resourceId,
    ipAddress: req ? getClientIp(req) : undefined,
    userAgent: req ? req.get('User-Agent') : undefined,
    requestMethod: req ? req.method : undefined,
    requestPath: req ? req.path : undefined,
    additionalData: additionalData ? JSON.stringify(additionalData) : undefined,
    createdAt: new Date()
  };
}