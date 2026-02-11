#!/bin/bash
# Production Startup Script for Acquisitions API
# This script starts the application environment with Neon Cloud Database

echo "🚀 Starting Acquisitions API - Development Environment"
echo "======================================================="

# Check if .env.development exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  .env.production not found!"
    echo "Creating from .env.example..."
    cp .env.example .env.production
    echo ""
    echo "📝 Please edit .env.production and set your environment:"
    echo "   - NODE_ENV=production"
    echo "   - LOG_LEVEL=info"
    echo "📝 Also add your Neon Cloud Database Credential, and JWT secret: "
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker is not running!"
  echo "   Please start Docker Desktop and try again."
  exit 1
fi

echo " Building and starting production container..."
echo "   - Using Neon Cloud Database (no local proxy)"
echo "   - Running in optimized production mode"
echo ""

# Start production environment
docker compose -f docker-compose.prod.yaml up --build -d

# Wait for DB to be ready (basic health check)
echo " Waiting for Neon Local to be ready..."
sleep 5

# Run migrations with Drizzle
echo "Applying latest schema with Drizzle ... ..."
npm run db:migrate

echo ""
echo "✅ Production environment started!"
echo ""
echo "   Application: http://localhost:3000"
echo "   Logs: docker logs acquisition-app-prod"
echo ""
echo "Useful commands:"
echo "   View logs: docker logs -f acquisition-app-prod"
echo "   Stop app: docker compose -f docker-compose.prod.yaml down"