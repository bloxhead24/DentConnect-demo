import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import crypto from 'crypto';

// Rate limiting configuration
export const createRateLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs, // Time window in milliseconds
    max, // Maximum requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
};

// General API rate limiter - more permissive in development
export const apiRateLimiter = createRateLimiter(
  15 * 60 * 1000, 
  process.env.NODE_ENV === 'development' ? 1000 : 100 // 1000 requests per 15 minutes in dev, 100 in prod
);

// Strict rate limiter for booking endpoints
export const bookingRateLimiter = createRateLimiter(
  60 * 60 * 1000, 
  process.env.NODE_ENV === 'development' ? 100 : 10 // 100 bookings per hour in dev, 10 in prod
);

// Generate nonce for CSP
export const generateNonce = () => crypto.randomUUID();

// Create CSP headers with nonce support
export const createSecurityHeaders = (nonce?: string) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://*.tile.openstreetmap.org"],
        scriptSrc: [
          "'self'",
          ...(isDevelopment ? [
            "'unsafe-eval'",
            "'unsafe-inline'",
            "blob:",
            "data:",
            "ws:",
            "wss:"
          ] : [
            "'strict-dynamic'",
            ...(nonce ? [`'nonce-${nonce}'`] : [])
          ]),
        ].filter(Boolean),
        connectSrc: [
          "'self'",
          "https://*.tile.openstreetmap.org",
          // Add websocket support for HMR
          ...(isDevelopment ? ["wss:", "ws:", "ws://localhost:*"] : []),
        ].filter(Boolean),
        frameSrc: ["'none'"],
        frameAncestors: [
          "'self'",
          "https://*.replit.app",
          "https://*.replit.dev",
          "https://*.replit.com"
        ],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        workerSrc: ["'self'"],
        childSrc: ["'none'"],
        formAction: ["'self'"],
        baseUri: ["'self'"],
        manifestSrc: ["'self'"],
        upgradeInsecureRequests: [],
        blockAllMixedContent: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: process.env.NODE_ENV === 'production' ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    } : false,
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  });
};

// Legacy security headers for backward compatibility
export const securityHeaders = createSecurityHeaders();

// CORS configuration
export const corsOptions: cors.CorsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (origin, callback) => {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        // Check if origin is a replit.app domain
        if (origin.includes('.replit.app') || origin.includes('.replit.dev')) {
          return callback(null, true);
        }
        
        // Reject other origins
        return callback(new Error('Not allowed by CORS'));
      }
    : true, // Allow all origins in development for Chrome compatibility
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Input validation middleware - Enhanced for Google Ads compliance
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  // Enhanced input sanitization for compromised site prevention
  const sanitizeString = (str: string) => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols  
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/data:/gi, '') // Remove data URIs for security
      .replace(/eval\s*\(/gi, '') // Remove eval() calls
      .replace(/Function\s*\(/gi, '') // Remove Function() constructor
      .replace(/setTimeout\s*\(/gi, '') // Remove setTimeout with string
      .replace(/setInterval\s*\(/gi, '') // Remove setInterval with string
      .replace(/document\.write/gi, '') // Remove document.write
      .replace(/innerHTML/gi, '') // Remove innerHTML assignments
      .replace(/outerHTML/gi, '') // Remove outerHTML assignments
      .replace(/execScript/gi, '') // Remove execScript
      .replace(/location\.href/gi, '') // Remove location redirects
      .replace(/window\.open/gi, '') // Remove window.open
      .replace(/\[object\s+\w+\]/gi, '') // Remove object references
      .replace(/base64/gi, '') // Remove base64 encoding references
      .replace(/atob|btoa/gi, '') // Remove base64 decode/encode
      .replace(/crypto-js/gi, '') // Remove crypto library references
      .replace(/eval/gi, '') // Remove any eval references
      .replace(/unescape/gi, '') // Remove unescape
      .replace(/escape/gi, '') // Remove escape
      .trim();
  };

  // Recursively sanitize all string values in request body
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      Object.keys(obj).forEach(key => {
        sanitized[key] = sanitizeObject(obj[key]);
      });
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// Authentication middleware placeholder
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // In a real application, this would validate JWT tokens or session cookies
  // For now, we'll implement basic session-based authentication
  
  const publicRoutes = ['/api/practices', '/api/treatments', '/api/appointments'];
  const isPublicRoute = publicRoutes.some(route => req.path.startsWith(route));
  
  if (isPublicRoute) {
    return next();
  }

  // Check for valid session or token
  if (req.session && req.session.user) {
    return next();
  }

  return res.status(401).json({ error: 'Authentication required' });
};

// Error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.stack);

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ error: 'Internal server error' });
  }

  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    stack: err.stack 
  });
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// Environment validation
// Enhanced security validation for Google Ads compliance
export const validateEnvironment = () => {
  const requiredEnvVars = ['DATABASE_URL'];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Anti-malware detection middleware
export const antiMalwareCheck = (req: Request, res: Response, next: NextFunction) => {
  // Check for suspicious patterns that might indicate compromised content
  const suspiciousPatterns = [
    /credit.?card.?skimmer/i,
    /keylogger/i,
    /phishing/i,
    /malware/i,
    /trojan/i,
    /backdoor/i,
    /cryptocurrency.?mining/i,
    /bitcoin.?mining/i,
    /cryptojacking/i,
    /popup.?ads/i,
    /redirect.?hijack/i,
    /session.?hijack/i,
    /clickjacking/i,
    /xss.?injection/i,
    /sql.?injection/i,
    /code.?injection/i,
    /shell.?injection/i,
    /remote.?execution/i,
    /unauthorized.?access/i,
    /data.?exfiltration/i,
    /credential.?harvesting/i,
    /form.?grabbing/i,
    /browser.?exploitation/i,
    /zero.?day/i,
    /exploit.?kit/i,
  ];

  const checkContent = (content: string) => {
    return suspiciousPatterns.some(pattern => pattern.test(content));
  };

  // Check request body for suspicious content
  if (req.body) {
    const bodyString = JSON.stringify(req.body);
    if (checkContent(bodyString)) {
      console.warn('Suspicious content detected in request body:', req.ip);
      return res.status(403).json({ error: 'Suspicious content detected' });
    }
  }

  // Check query parameters for suspicious content
  if (req.query) {
    const queryString = JSON.stringify(req.query);
    if (checkContent(queryString)) {
      console.warn('Suspicious content detected in query parameters:', req.ip);
      return res.status(403).json({ error: 'Suspicious content detected' });
    }
  }

  // Check headers for suspicious content
  const userAgent = req.get('User-Agent') || '';
  const referer = req.get('Referer') || '';
  
  if (checkContent(userAgent + referer)) {
    console.warn('Suspicious content detected in headers:', req.ip);
    return res.status(403).json({ error: 'Suspicious content detected' });
  }

  next();
};

// IP reputation check (basic implementation)
export const ipReputationCheck = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.connection.remoteAddress || '';
  
  // Basic checks for suspicious IP patterns
  const suspiciousIpPatterns = [
    /^10\./, // Private networks shouldn't be accessing externally
    /^192\.168\./, // Private networks
    /^172\.1[6-9]\./, // Private networks
    /^172\.2[0-9]\./, // Private networks
    /^172\.3[0-1]\./, // Private networks
  ];

  // Allow localhost and development IPs
  if (process.env.NODE_ENV === 'development' || clientIp === '127.0.0.1' || clientIp === '::1') {
    return next();
  }

  // Log suspicious access attempts
  if (suspiciousIpPatterns.some(pattern => pattern.test(clientIp))) {
    console.warn('Suspicious IP access attempt:', clientIp);
  }

  next();
};

// Content integrity check
export const contentIntegrityCheck = (req: Request, res: Response, next: NextFunction) => {
  // Ensure no malicious file uploads or content manipulation
  if (req.body && typeof req.body === 'object') {
    const jsonString = JSON.stringify(req.body);
    
    // Check for file upload attempts with malicious extensions
    const maliciousExtensions = [
      /\.exe/i, /\.scr/i, /\.bat/i, /\.cmd/i, /\.com/i, /\.pif/i,
      /\.vbs/i, /\.js/i, /\.jar/i, /\.php/i, /\.asp/i, /\.jsp/i,
      /\.py/i, /\.pl/i, /\.rb/i, /\.sh/i, /\.ps1/i, /\.msi/i
    ];

    if (maliciousExtensions.some(ext => ext.test(jsonString))) {
      console.warn('Malicious file extension detected:', req.ip);
      return res.status(403).json({ error: 'Malicious content detected' });
    }
  }

  next();
};

export default {
  apiRateLimiter,
  bookingRateLimiter,
  securityHeaders,
  corsOptions,
  validateInput,
  authenticate,
  errorHandler,
  requestLogger,
  validateEnvironment,
  antiMalwareCheck,
  ipReputationCheck,
  contentIntegrityCheck,
};