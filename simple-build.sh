#!/bin/bash
# Fixed build script that works

echo "Building with optimizations..."

# Set production environment
export NODE_ENV=production

# Clean previous builds
rm -rf dist

# Build frontend with chunk size limits
echo "Building frontend..."
cd client
npx vite build --outDir ../dist/public --emptyOutDir

# Back to root
cd ..

# Build backend
echo "Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build complete!"