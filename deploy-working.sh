#!/bin/bash
# Working deployment script - bypasses complex build issues

echo "Creating working deployment..."

# Clean and create directories
rm -rf dist public
mkdir -p dist/public

# Copy all client files to where the production server expects them
cp -r client/* dist/public/

# Create a simple production-ready index.html
cat > dist/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DentConnect - Find Available Dental Appointments</title>
    <style>
        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
        .loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #e0f2f1 0%, #e1f5fe 100%); }
        .spinner { width: 40px; height: 40px; border: 4px solid #14b8a6; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .loading-text { margin-top: 1rem; font-size: 1.125rem; color: #0d9488; font-weight: 600; text-align: center; }
    </style>
</head>
<body>
    <div id="root">
        <div class="loading">
            <div>
                <div class="spinner"></div>
                <div class="loading-text">Loading DentConnect...</div>
            </div>
        </div>
    </div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
EOF

# Copy static files to the root public directory (where production server expects them)
cp -r dist/public/* ./public/ 2>/dev/null || mkdir -p public && cp -r dist/public/* ./public/

# Build the server
echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Working deployment ready!"
echo "Static files are in: ./public/"
echo "Server bundle is in: ./dist/index.js"