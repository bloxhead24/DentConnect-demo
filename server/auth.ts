import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, InsertUser, Session, InsertSession } from '@shared/schema';
import { storage } from './storage';

// Authentication utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Session management
export async function createSession(userId: number): Promise<Session> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  const sessionData: InsertSession = {
    id: sessionToken,
    userId,
    expiresAt,
  };
  
  return await storage.createSession(sessionData);
}

export async function validateSession(sessionToken: string): Promise<User | null> {
  const session = await storage.getSession(sessionToken);
  
  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await storage.deleteSession(sessionToken);
    }
    return null;
  }
  
  const user = await storage.getUser(session.userId);
  return user || null;
}

export async function invalidateSession(sessionToken: string): Promise<void> {
  await storage.deleteSession(sessionToken);
}

// Authentication middleware
export async function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const sessionToken = authHeader?.replace('Bearer ', '');
  
  if (!sessionToken) {
    return res.status(401).json({ error: 'No session token provided' });
  }
  
  const user = await validateSession(sessionToken);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  req.user = user;
  next();
}

// Dentist-only middleware
export async function authenticateDentist(req: any, res: any, next: any) {
  await authenticate(req, res, () => {
    if (req.user?.userType !== 'dentist') {
      return res.status(403).json({ error: 'Access denied. Dentist account required.' });
    }
    next();
  });
}