#!/bin/bash

echo "Fast build process..."
echo "Building frontend..."
cd client && npm run build --silent &
FRONTEND_PID=$!

echo "Building backend..."
cd .. && npm run build:server --silent &
BACKEND_PID=$!

echo "Waiting for builds to complete..."
wait $FRONTEND_PID
wait $BACKEND_PID

echo "Build complete!"