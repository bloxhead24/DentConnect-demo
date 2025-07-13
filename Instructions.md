# CSP and X-Frame-Options Deployment Fix Instructions

## Problem Analysis

After deep research across the codebase, I've identified the root causes of the Content Security Policy (CSP) and X-Frame-Options errors blocking script loading in deployment:

### Current Security Configuration Issues

1. **Overly Restrictive CSP in Production**
   - Location: `server/security.ts` lines 6-25
   - Issues:
     - `scriptSrc: ["'self'", "'strict-dynamic'"]` blocks Vite's development scripts
     - `frameAncestors: ["'none'"]` prevents iframe embedding
     - Missing nonce support for inline scripts
     - No allowance for Vite HMR (Hot Module Replacement) websockets

2. **Development vs Production Mismatch**
   - CSP disabled in development but strict in production
   - Vite adds dynamic imports and HMR scripts that violate production CSP
   - No nonce generation for dynamically added scripts

3. **Script Loading Violations**
   - Found 10+ setTimeout/setInterval usages that may trigger CSP violations
   - Dynamic nanoid injection in script URLs (`src="/src/main.tsx?v=${nanoid()}"`)
   - Vite transformIndexHtml adds inline scripts without nonces

## Files Requiring Changes

### Primary Files:
1. **server/security.ts** - Core CSP configuration
2. **server/vite.ts** - Vite development server setup
3. **client/index.html** - HTML template with script tags
4. **vite.config.ts** - Build configuration

### Secondary Files:
5. **server/index.ts** - Security middleware application
6. **client/src/components/ui/chart.tsx** - Contains dangerouslySetInnerHTML

## Detailed Fix Plan

### Step 1: Update CSP Configuration
**File**: `server/security.ts`

**Current Issues:**
- `scriptSrc: ["'self'", "'strict-dynamic'"]` too restrictive
- Missing nonce support
- No websocket support for Vite HMR

**Solutions:**
```typescript
// Add nonce support
const nonce = crypto.randomUUID();

// Update CSP directives
scriptSrc: [
  "'self'",
  "'strict-dynamic'",
  `'nonce-${nonce}'`,
  // Allow Vite dev server scripts
  process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : null,
  // Allow bundled scripts
  "'unsafe-inline'"
].filter(Boolean),

// Add websocket support for HMR
connectSrc: [
  "'self'",
  "https://*.tile.openstreetmap.org",
  "wss:",
  "ws:",
  process.env.NODE_ENV === 'development' ? "ws://localhost:*" : null
].filter(Boolean),

// Allow iframe embedding for Replit
frameAncestors: [
  "'self'",
  "https://*.replit.app",
  "https://*.replit.dev",
  "https://*.replit.com"
],
```

### Step 2: Add Nonce Generation
**File**: `server/vite.ts`

**Current Issues:**
- No nonce support for dynamically injected scripts
- nanoid injection without CSP compliance

**Solutions:**
```typescript
// Generate nonce for each request
const nonce = crypto.randomUUID();

// Add nonce to script tags
template = template.replace(
  `<script type="module" src="/src/main.tsx"`,
  `<script type="module" nonce="${nonce}" src="/src/main.tsx"`
);

// Pass nonce to CSP headers
res.setHeader('Content-Security-Policy-Nonce', nonce);
```

### Step 3: Fix HTML Template
**File**: `client/index.html`

**Current Issues:**
- Script tag without nonce
- Inline styles without CSP compliance

**Solutions:**
```html
<!-- Add nonce placeholder -->
<script type="module" nonce="{{NONCE}}" src="/src/main.tsx"></script>

<!-- Add CSP meta tag for client-side enforcement -->
<meta http-equiv="Content-Security-Policy" content="{{CSP_DIRECTIVES}}">
```

### Step 4: Update Vite Configuration
**File**: `vite.config.ts`

**Current Issues:**
- No CSP awareness in build process
- Missing security configurations

**Solutions:**
```typescript
// Add CSP plugin
import { defineConfig } from "vite";

export default defineConfig({
  // ... existing config
  build: {
    rollupOptions: {
      output: {
        // Ensure consistent script names for CSP
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  server: {
    // Add CSP headers in development
    headers: {
      'Content-Security-Policy': `script-src 'self' 'unsafe-eval' 'unsafe-inline';`
    }
  }
});
```

### Step 5: Fix Component Issues
**File**: `client/src/components/ui/chart.tsx`

**Current Issues:**
- Uses dangerouslySetInnerHTML without CSP compliance

**Solutions:**
```typescript
// Replace dangerouslySetInnerHTML with safe alternatives
// Use React refs and DOM manipulation instead
// Or sanitize content with DOMPurify
```

### Step 6: Environment-Specific CSP
**File**: `server/security.ts`

**Current Issues:**
- Same CSP for development and production
- No environment-specific configurations

**Solutions:**
```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        ...(isDevelopment ? ["'unsafe-eval'", "'unsafe-inline'"] : ["'strict-dynamic'"]),
        `'nonce-${nonce}'`
      ],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: [
        "'self'",
        ...(isDevelopment ? ["ws:", "wss:"] : []),
        "https://*.tile.openstreetmap.org"
      ],
      frameSrc: isDevelopment ? ["'self'", "https://*.replit.dev"] : ["'none'"],
      frameAncestors: [
        "'self'",
        "https://*.replit.app",
        "https://*.replit.dev"
      ]
    }
  }
});
```

## Implementation Priority

### High Priority (Critical for Deployment):
1. Fix CSP scriptSrc to allow Vite-generated scripts
2. Add nonce support for inline scripts
3. Update frameAncestors to allow Replit embedding
4. Add websocket support for HMR

### Medium Priority:
1. Environment-specific CSP configurations
2. Fix dangerouslySetInnerHTML usage
3. Add CSP meta tags to HTML

### Low Priority:
1. Optimize CSP for performance
2. Add CSP violation reporting
3. Implement CSP testing

## Testing Strategy

### Development Testing:
1. Verify Vite HMR works with new CSP
2. Test script loading without violations
3. Confirm iframe embedding works

### Production Testing:
1. Deploy with new CSP configuration
2. Test script loading in production build
3. Verify no CSP violations in browser console
4. Test iframe embedding in Replit

## Risk Assessment

### Low Risk:
- Adding nonce support
- Updating frameAncestors

### Medium Risk:
- Changing scriptSrc directives
- Adding websocket support

### High Risk:
- Removing 'strict-dynamic' (not recommended)
- Adding 'unsafe-eval' in production (avoid)

## Expected Outcomes

After implementing these fixes:
1. ✅ Scripts will load without CSP violations
2. ✅ X-Frame-Options errors will be resolved
3. ✅ Vite HMR will work in development
4. ✅ Production deployment will be successful
5. ✅ App will be embeddable in Replit interface

## Rollback Plan

If issues occur during implementation:
1. Revert CSP to disabled state temporarily
2. Deploy working version without CSP
3. Implement fixes incrementally
4. Test each change individually

## Next Steps

1. **Implement Step 1-3** (CSP, nonce, HTML fixes)
2. **Test in development** environment
3. **Deploy to production** with new configuration
4. **Monitor for violations** and adjust as needed
5. **Implement remaining steps** once core issues are resolved

This comprehensive plan addresses all identified CSP and X-Frame-Options issues while maintaining security and functionality.