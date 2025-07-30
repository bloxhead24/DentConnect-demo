import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { createAuditLogEntry, getClientIp } from './auth-utils';

// Middleware to audit all API requests
export const auditMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  const chunks: Buffer[] = [];
  
  // Override end function to capture response
  res.end = function(...args: any[]): any {
    const responseTime = Date.now() - startTime;
    
    // Restore original end function
    res.end = originalEnd;
    
    // Call original end
    const result = originalEnd.apply(res, args);
    
    // Log audit entry asynchronously
    setImmediate(async () => {
      try {
        // Determine action and resource type from request
        const { action, resourceType, resourceId } = parseRequestDetails(req);
        
        // Get user info from session/auth
        const user = (req as any).user;
        
        // Create audit log entry
        const auditEntry = createAuditLogEntry(
          action,
          resourceType,
          user?.id,
          user?.email,
          resourceId,
          {
            body: sanitizeRequestBody(req.body),
            query: req.query,
            params: req.params,
            responseStatus: res.statusCode,
            responseTime
          },
          req
        );
        
        // Store audit log (implement storage method)
        await storage.createAuditLog(auditEntry);
      } catch (error) {
        console.error('Audit logging error:', error);
      }
    });
    
    return result;
  };
  
  next();
};

// Parse request details to determine action and resource
function parseRequestDetails(req: Request): { action: string; resourceType: string; resourceId?: number } {
  const path = req.path;
  const method = req.method;
  
  // Authentication endpoints
  if (path.includes('/auth/login')) {
    return { action: 'login', resourceType: 'authentication' };
  }
  if (path.includes('/auth/logout')) {
    return { action: 'logout', resourceType: 'authentication' };
  }
  if (path.includes('/auth/signup')) {
    return { action: 'signup', resourceType: 'user' };
  }
  
  // User endpoints
  if (path.includes('/users')) {
    const resourceId = parseInt(req.params.id || req.params.userId);
    if (method === 'GET') return { action: 'view', resourceType: 'user', resourceId };
    if (method === 'POST') return { action: 'create', resourceType: 'user' };
    if (method === 'PUT' || method === 'PATCH') return { action: 'update', resourceType: 'user', resourceId };
    if (method === 'DELETE') return { action: 'delete', resourceType: 'user', resourceId };
  }
  
  // Appointment endpoints
  if (path.includes('/appointments')) {
    const resourceId = parseInt(req.params.id || req.params.appointmentId);
    if (method === 'GET') return { action: 'view', resourceType: 'appointment', resourceId };
    if (method === 'POST') return { action: 'create', resourceType: 'appointment' };
    if (method === 'PUT' || method === 'PATCH') return { action: 'update', resourceType: 'appointment', resourceId };
    if (method === 'DELETE') return { action: 'delete', resourceType: 'appointment', resourceId };
  }
  
  // Booking endpoints
  if (path.includes('/bookings')) {
    const resourceId = parseInt(req.params.id || req.params.bookingId);
    if (path.includes('/approve')) return { action: 'approve', resourceType: 'booking', resourceId };
    if (path.includes('/reject')) return { action: 'reject', resourceType: 'booking', resourceId };
    if (method === 'GET') return { action: 'view', resourceType: 'booking', resourceId };
    if (method === 'POST') return { action: 'create', resourceType: 'booking' };
    if (method === 'PUT' || method === 'PATCH') return { action: 'update', resourceType: 'booking', resourceId };
    if (method === 'DELETE') return { action: 'delete', resourceType: 'booking', resourceId };
  }
  
  // Triage endpoints
  if (path.includes('/triage-assessments')) {
    const resourceId = parseInt(req.params.id);
    if (method === 'GET') return { action: 'view', resourceType: 'triage', resourceId };
    if (method === 'POST') return { action: 'create', resourceType: 'triage' };
    if (method === 'PUT' || method === 'PATCH') return { action: 'update', resourceType: 'triage', resourceId };
  }
  
  // Practice endpoints
  if (path.includes('/practices')) {
    const resourceId = parseInt(req.params.id || req.params.practiceId);
    if (method === 'GET') return { action: 'view', resourceType: 'practice', resourceId };
    if (method === 'POST') return { action: 'create', resourceType: 'practice' };
    if (method === 'PUT' || method === 'PATCH') return { action: 'update', resourceType: 'practice', resourceId };
  }
  
  // GDPR endpoints
  if (path.includes('/gdpr/export')) {
    return { action: 'export', resourceType: 'user_data' };
  }
  if (path.includes('/gdpr/delete')) {
    return { action: 'delete', resourceType: 'user_data' };
  }
  if (path.includes('/gdpr/consent')) {
    return { action: 'consent', resourceType: 'gdpr' };
  }
  
  // Default
  return { action: method.toLowerCase(), resourceType: 'unknown' };
}

// Sanitize request body to remove sensitive data
function sanitizeRequestBody(body: any): any {
  if (!body) return {};
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = [
    'password', 'passwordHash', 'confirmPassword',
    'twoFactorSecret', 'emailVerificationToken',
    'passwordResetToken', 'sessionId', 'refreshToken',
    'creditCardNumber', 'cvv', 'cardNumber'
  ];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  // Recursively sanitize nested objects
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeRequestBody(sanitized[key]);
    }
  });
  
  return sanitized;
}

// Middleware to enforce GDPR consent
export const gdprConsentMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Skip for public endpoints
  const publicEndpoints = ['/auth/login', '/auth/signup', '/health', '/practices', '/treatments'];
  if (publicEndpoints.some(endpoint => req.path.includes(endpoint))) {
    return next();
  }
  
  // Check if user has given GDPR consent
  const user = (req as any).user;
  if (user && !user.gdprConsentGiven) {
    return res.status(403).json({
      error: 'GDPR consent required',
      message: 'You must accept our privacy policy and terms of service to continue using DentConnect'
    });
  }
  
  next();
};

// Middleware to check data retention
export const dataRetentionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (user && user.dataRetentionDate) {
    const retentionDate = new Date(user.dataRetentionDate);
    if (new Date() > retentionDate) {
      return res.status(403).json({
        error: 'Data retention period expired',
        message: 'Your data retention period has expired. Please contact support to renew your consent.'
      });
    }
  }
  
  next();
};

// NHS specific audit requirements
export const nhsAuditMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Additional NHS-specific audit requirements
  if (req.path.includes('/triage') || req.path.includes('/medical')) {
    // Log access to medical data with additional detail
    const user = (req as any).user;
    const auditEntry = {
      userId: user?.id,
      userEmail: user?.email,
      action: 'medical_data_access',
      resourceType: 'clinical_data',
      ipAddress: getClientIp(req),
      userAgent: req.get('User-Agent'),
      requestPath: req.path,
      nhsCompliance: true,
      clinicalContext: {
        accessReason: req.headers['x-access-reason'] || 'routine_access',
        clinicalRole: user?.userType || 'unknown'
      },
      createdAt: new Date()
    };
    
    // Store NHS-specific audit log
    await storage.createAuditLog(auditEntry);
  }
  
  next();
};