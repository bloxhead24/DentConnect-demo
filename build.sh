#!/bin/bash
# Production build script with optimizations

echo "Starting optimized production build..."

# Set production environment
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=2048"

# Clean previous builds
rm -rf dist
rm -rf client/dist

echo "Building client..."
cd client

# Build with reduced chunk size and optimizations
npx vite build --mode production --outDir ../dist/public

cd ..

echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify

echo "Build complete!"