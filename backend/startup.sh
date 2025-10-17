#!/bin/sh

# Startup script for backend with automatic seeding
set -e

echo "🚀 Starting backend with automatic seeding..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run Prisma migrations to create the database schema
echo "🗄️ Running Prisma migrations..."
npx prisma db push --accept-data-loss

# Run the seeder
echo "🌱 Running database seeder..."
npm run seed:all

# Start the application
echo "🚀 Starting the application..."
exec npm run dev
