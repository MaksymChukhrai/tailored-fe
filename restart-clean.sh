#!/bin/bash
set -e

echo "Stopping any running Vite dev server on port 5173..."
if command -v netstat &> /dev/null; then
  PID=$(netstat -ano | grep ":5173" | grep LISTENING | awk '{print $NF}' | head -1)
  if [ -n "$PID" ]; then
    echo "Killing process $PID"
    taskkill //F //PID "$PID" 2>/dev/null || true
  fi
fi

echo "Removing Vite cache..."
rm -rf node_modules/.vite

echo "Removing TypeScript build info..."
rm -f node_modules/.tmp/*.tsbuildinfo

echo "Starting dev server..."
npm run dev
