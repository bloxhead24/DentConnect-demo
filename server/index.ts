import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import security, { generateNonce, createSecurityHeaders } from "./security";
import cors from "cors";

const app = express();

// Basic middleware only
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cors());

// Add nonce middleware for CSP - only in production
if (process.env.NODE_ENV === 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const nonce = generateNonce();
    res.locals.nonce = nonce;
    
    // Apply security headers with nonce
    const securityMiddleware = createSecurityHeaders(nonce);
    securityMiddleware(req, res, () => {});
    
    // Intercept HTML responses to add nonce attributes
    const originalSend = res.send;
    res.send = function(body: any) {
      const contentType = res.getHeader('content-type');
      if (typeof body === 'string' && 
          (contentType?.toString().includes('text/html') || body.includes('<!DOCTYPE html>') || body.includes('<html'))) {
        // Add nonce to script tags that don't already have one
        let processedBody = body;
        const scriptMatches = body.match(/<script[^>]*>/gi);
        
        if (scriptMatches) {
          scriptMatches.forEach(match => {
            if (!match.includes('nonce=')) {
              const newMatch = match.replace(/<script/, `<script nonce="${nonce}"`);
              processedBody = processedBody.replace(match, newMatch);
            }
          });
        }
        
        body = processedBody;
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  });
}

// Only add additional security in production
if (process.env.NODE_ENV === 'production') {
  security.validateEnvironment();
  app.use(cors(security.corsOptions));
  app.use(security.validateInput);
  app.use('/api', security.apiRateLimiter);
  app.use('/api/bookings', security.bookingRateLimiter);
}

// Trust proxy for correct IP addresses behind reverse proxy
app.set('trust proxy', 1);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Global error handler
  app.use(security.errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`✅ Server listening on port ${port}`);
    log(`✅ Bound to all interfaces (0.0.0.0:${port})`);
    log(`NODE_ENV: ${process.env.NODE_ENV}`);
    log(`Local access: http://localhost:${port}`);
    log(`Test page: http://localhost:${port}/test`);
    log(`External domain: ${process.env.REPLIT_DOMAINS || 'Not set'}`);
  });
})();
