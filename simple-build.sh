#!/bin/bash

echo "Starting optimized build process..."

# Clean previous build
rm -rf dist/

# Build backend only (frontend will be served via Vite in production)
echo "Building backend..."
mkdir -p dist
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Copy static files
echo "Copying static files..."
cp -r client/public dist/ 2>/dev/null || true
cp test-simple.html dist/ 2>/dev/null || true

# Simple frontend build without full Vite processing
echo "Creating simple frontend build..."
mkdir -p dist/public
cp client/index.html dist/public/
cp -r client/src dist/public/

echo "Build completed successfully!"
echo "Backend: dist/index.js"
echo "Frontend: dist/public/"