#!/bin/bash
# Production build script for deployment

echo "Building production version..."

# Clean previous builds
rm -rf dist
mkdir -p dist/public

# Copy all client files for production serving
cp -r client/* dist/public/

# Create production-optimized index.html with proper error handling
cat > dist/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="DentConnect - Real-time dental appointment marketplace" />
    <title>DentConnect - Find Available Dental Appointments</title>
    <style>
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
        .loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #e0f2f1 0%, #e1f5fe 100%); }
        .spinner { width: 40px; height: 40px; border: 4px solid #14b8a6; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .loading-text { margin-top: 1rem; font-size: 1.125rem; color: #0d9488; font-weight: 600; }
        .error { background: #fef2f2; color: #dc2626; padding: 1rem; border-radius: 0.5rem; margin: 1rem; }
        .retry-btn { background: #0d9488; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem; cursor: pointer; margin-top: 1rem; }
    </style>
    <script>
        // Global error handler for deployment
        window.addEventListener('error', function(e) {
            console.error('Application error:', e);
            setTimeout(() => {
                const root = document.getElementById('root');
                if (root && (!root.innerHTML || root.innerHTML.includes('Loading'))) {
                    root.innerHTML = `
                        <div class="loading">
                            <div style="text-align: center;">
                                <div class="error">
                                    <h3>Loading Issue</h3>
                                    <p>The app is having trouble loading. Please try refreshing the page.</p>
                                    <button class="retry-btn" onclick="window.location.reload()">Refresh Page</button>
                                </div>
                            </div>
                        </div>
                    `;
                }
            }, 3000);
        });
        
        // Timeout fallback
        setTimeout(() => {
            const root = document.getElementById('root');
            if (root && root.innerHTML.includes('Loading DentConnect')) {
                root.innerHTML = `
                    <div class="loading">
                        <div style="text-align: center;">
                            <div class="error">
                                <h3>Loading Timeout</h3>
                                <p>The app is taking longer than expected to load.</p>
                                <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
                            </div>
                        </div>
                    </div>
                `;
            }
        }, 15000);
    </script>
</head>
<body>
    <div id="root">
        <div class="loading">
            <div style="text-align: center;">
                <div class="spinner"></div>
                <div class="loading-text">Loading DentConnect...</div>
            </div>
        </div>
    </div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
EOF

# Build the server
echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify

echo "Production build complete!"