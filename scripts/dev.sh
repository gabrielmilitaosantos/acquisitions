#!/bin/bash
# Development Startup Script for Acquisitions API
# This script starts the development environment with Neon Local

echo "🚀 Starting Acquisitions API - Development Environment"
echo "======================================================="

# Check if .env.development exists
if [ ! -f ".env.development" ]; then
    echo "⚠️  .env.development not found!"
    echo "Creating from .env.example..."
    cp .env.example .env.development
    echo ""
    echo "📝 Please edit .env.development and add your Neon credentials:"
    echo "   - NEON_API_KEY"
    echo "   - NEON_PROJECT_ID"
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

# Create .neon_local directory if it doesn't exist
mkdir -p neon_local

# Add .neon_local to .gitignore if not already present
if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
  echo ".neon_local" >> .gitignore
  echo "✅ Added .neon_local/ to .gitignore"
fi

echo "Building and starting development containers..."
echo "   - Neon Local proxy will create an ephemeral database branch"
echo "   - Applications will run with hot reload enabled"
echo ""

# Run migrations with Drizzle
echo "Applying latest schema with Drizzle ... ..."
npm run db:migrate

# Wait for the database to be ready
echo " Waiting for the database to be ready ..."
docker compose exec neon_local psql -U neon -d neondb -c 'SELECT 1'
echo ""

# Start development environment
echo "🐳 Starting Docker containers..."
docker-compose -f docker-compose.dev.yaml up --build

echo ""
echo "✅ Development environment started!"
echo "   Application: http://localhost:3000"
echo "   Database: postgres://neon:npg@localhost:5432/neondb"
echo ""
echo "To stop the environment, press Ctrl + C or run: docker compose down"