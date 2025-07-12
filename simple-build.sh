#!/bin/bash
# Simple build script that works with the original architecture

echo "Building for production..."

# Build the client using Vite
cd client
npm run build
cd ..

# Build the server
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build complete!"