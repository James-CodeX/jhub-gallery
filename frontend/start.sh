#!/bin/sh
set -e

echo "🚀 Starting Next.js production server..."
echo "📁 Current directory: $(pwd)"
echo "📋 Files in current directory:"
ls -la

echo ""
echo "🔍 Checking for server.js..."
if [ -f "server.js" ]; then
    echo "✅ server.js found!"
    ls -lh server.js
else
    echo "❌ server.js NOT FOUND!"
    exit 1
fi

echo ""
echo "🔍 Checking .next directory..."
if [ -d ".next" ]; then
    echo "✅ .next directory exists"
    ls -la .next/
else
    echo "❌ .next directory NOT FOUND!"
    exit 1
fi

echo ""
echo "🌐 Server configuration:"
echo "   HOSTNAME: ${HOSTNAME:-localhost}"
echo "   PORT: ${PORT:-3000}"
echo "   NODE_ENV: ${NODE_ENV:-development}"

echo ""
echo "🎬 Starting server..."
exec node server.js
