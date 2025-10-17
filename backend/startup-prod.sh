#!/bin/sh

# Production startup script for backend
set -e

echo "🚀 Starting backend in production mode..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run Prisma migrations to create the database schema
echo "🗄️ Running Prisma migrations..."
npx prisma db push

# Run the seeder
echo "🌱 Running database seeder..."
npx tsx prisma/seed-all.ts

# Start the application
echo "🚀 Starting the application..."
exec npm start
