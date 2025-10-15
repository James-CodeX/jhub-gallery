#!/bin/bash
# JHUB Gallery - Docker Quick Start Script
# This script helps you get started with Docker quickly

set -e

echo "🚀 JHUB Gallery - Docker Quick Start"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker is installed"
echo "✅ Docker Compose is installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.docker .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and change the following:"
    echo "   - POSTGRES_PASSWORD"
    echo "   - MINIO_SECRET_KEY"
    echo "   - JWT_SECRET"
    echo ""
    read -p "Press Enter to continue after updating .env file..."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🐳 Starting Docker containers..."
echo ""

# Start services
docker compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
echo ""

# Wait for services to be healthy
MAX_WAIT=120
ELAPSED=0
INTERVAL=5

while [ $ELAPSED -lt $MAX_WAIT ]; do
    HEALTHY=$(docker compose ps --format json | jq -r '.Health' | grep -c "healthy" || true)
    TOTAL=$(docker compose ps --format json | jq -r '.Health' | grep -c "health" || true)
    
    if [ "$HEALTHY" -eq "$TOTAL" ] && [ "$TOTAL" -gt 0 ]; then
        echo "✅ All services are healthy!"
        break
    fi
    
    echo "⏳ Waiting... ($ELAPSED/$MAX_WAIT seconds)"
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "✅ JHUB Gallery is now running!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend:      http://localhost:3000"
echo "   Backend API:   http://localhost:4000"
echo "   MinIO Console: http://localhost:9001"
echo "   API Health:    http://localhost:4000/health"
echo ""
echo "📖 View logs:"
echo "   docker compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker compose down"
echo ""
echo "📚 For more information, see DOCKER_DEPLOYMENT.md"
echo ""
