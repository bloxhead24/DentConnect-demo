#!/bin/bash
# Simple build script for deployment

echo "Starting build..."

# Set production environment
export NODE_ENV=production

# Clean previous builds
rm -rf dist

echo "Building client..."
npm run build

echo "Build complete!"