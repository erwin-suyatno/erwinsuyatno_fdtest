# erwinsuyatno_fdtest

Monorepo for Fullstack Developer Technical Test (Express.js + Next.js + PostgreSQL + Redis + Swagger).

## 🚀 Features

### ✅ **Authentication System**
- User registration with email verification
- JWT-based authentication
- Password reset functionality
- Role-based access control (Admin, User, Member)

### ✅ **Book Management**
- Complete CRUD operations for books
- Book rating system (1-5 stars)
- Book thumbnails and descriptions
- Advanced filtering and search

### ✅ **Booking System**
- Book borrowing requests
- Admin approval/rejection workflow
- Return book functionality
- Overdue fee calculation ($1 per day)
- Booking history tracking

### ✅ **User Management**
- User list with filtering
- Email verification status
- Admin user management

### ✅ **Public Landing Page**
- Browse books without authentication
- Search and filter functionality
- Responsive design

## 🛠️ Tech Stack

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **JWT** - Authentication
- **Zod** - Schema validation
- **Swagger** - API documentation
- **Vitest** - Testing framework

### Frontend
- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Zustand** - State management

## 📋 Prerequisites

- **Node.js** >= 18
- **PostgreSQL** 14+
- **Redis** (optional, for caching)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd erwinsuyatno_fdtest
```

### 2. Database Setup

Create PostgreSQL database:

```bash
createdb erwinsuyatno_fdtest
```

Import database schema:

```bash
psql -U postgres -d erwinsuyatno_fdtest -f erwinsuyatno_fdtest_schema.sql
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file with your configuration
# See Environment Variables section below

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

Backend will be available at: `http://localhost:4000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## 🌱 Database Seeding

The project includes comprehensive seeder scripts to populate the database with sample data:

### Available Seeder Commands

```bash
cd backend

# Basic admin user setup (creates admin@example.com)
npm run seed

# Create 100 diverse users with realistic data
npm run seed:users

# Create 100 diverse books with ratings and descriptions
npm run seed:books

# Reset books data (clear existing books and create new ones)
npm run seed:books:reset

# Create both 100 users and 100 books in one command
npm run seed:all
```

### Seeder Details

- **`npm run seed`**: Creates admin user (admin@example.com / admin123)
- **`npm run seed:users`**: Generates 100 diverse users with realistic names and emails
- **`npm run seed:books`**: Creates 100 books with various genres, ratings, and descriptions
- **`npm run seed:books:reset`**: Clears existing books and creates fresh book data
- **`npm run seed:all`**: Comprehensive seeding with both users and books

### Sample Data Generated

- **Users**: 100 diverse users with Indonesian and international names
- **Books**: Classic literature, fantasy, sci-fi, mystery, romance, and contemporary fiction
- **Ratings**: Realistic rating distribution (1-5 stars)
- **Descriptions**: Detailed book descriptions and thumbnails
- **Admin User**: Ready-to-use admin account for testing

## 🔧 Environment Variables

### Backend (.env)

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/erwinsuyatno_fdtest"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="1d"

# Server Configuration
PORT=4000
NODE_ENV="development"

# CORS Configuration
FRONTEND_URL="http://localhost:3000"

# SMTP Configuration (for email verification and password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
MAIL_FROM="noreply@yourdomain.com"

# Application URLs
APP_BASE_URL="http://localhost:4000"

# Redis Configuration (Optional)
REDIS_URL="redis://localhost:6379"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🧪 Testing

### Run All Tests

```bash
cd backend
npm test
```

### Run Specific Test Suites

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Test coverage
npm run test:coverage
```

**Test Results:** All 26 tests passing ✅
- Authentication tests (unit & integration)
- Book management tests (unit & integration)
- Booking system tests (unit & integration)
- User management tests (unit)

## 📚 API Documentation

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:4000/api-docs`

### Available Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

#### Users
- `GET /api/users` - List users (Admin only)
- `GET /api/home` - User profile

#### Books
- `GET /api/books` - List books
- `POST /api/books` - Create book (Admin only)
- `GET /api/books/:id` - Get book details
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)
- `GET /api/public/books` - Public book listing

#### Bookings
- `POST /api/bookings` - Create booking request
- `GET /api/bookings/my` - User's bookings
- `GET /api/bookings` - All bookings (Admin only)
- `PUT /api/bookings/:id/approve` - Approve booking (Admin only)
- `PUT /api/bookings/:id/reject` - Reject booking (Admin only)
- `PUT /api/bookings/:id/return` - Return book
- `DELETE /api/bookings/:id` - Cancel booking

## 🏗️ Project Structure

```
erwinsuyatno_fdtest/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── models/          # Data models
│   │   ├── middlewares/     # Custom middlewares
│   │   ├── utils/           # Utility functions
│   │   └── tests/           # Test files
│   ├── prisma/              # Database schema & migrations
│   ├── server.ts            # Main server file
│   ├── swagger.json         # API documentation
│   └── .env.example         # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── pages/           # Next.js pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── stores/          # State management
│   │   └── types/           # TypeScript types
│   └── package.json
├── erwinsuyatno_fdtest_schema.sql  # Database schema
└── README.md
```

## 📦 Library Justifications

### Backend Libraries

- **Express.js**: Lightweight, flexible web framework for Node.js
- **TypeScript**: Provides type safety and better developer experience
- **Prisma**: Modern database ORM with excellent TypeScript support and migration system
- **Zod**: Runtime type validation for API inputs, ensuring data integrity
- **JWT**: Stateless authentication for scalable applications
- **Swagger**: Automatic API documentation generation
- **Vitest**: Fast testing framework with excellent TypeScript support
- **Redis**: High-performance caching and session storage

### Frontend Libraries

- **Next.js**: Full-stack React framework with SSR/SSG capabilities
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Axios**: Promise-based HTTP client with interceptors
- **Zustand**: Lightweight state management solution

## 🚀 Deployment

### Docker Deployment

The project includes separate Docker configurations for development and production:

#### Development Deployment (Hot Reload)

```bash
# Start all services with hot reload (PostgreSQL, Redis, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Production Deployment

```bash
# Build and start all services for production
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Stop services
docker-compose -f docker-compose.production.yml down
```

#### Development with Database Only

```bash
# Start only database services (PostgreSQL + Redis)
docker-compose -f docker-compose.dev.yml up -d

# Run backend and frontend locally
cd backend && npm run dev
cd frontend && npm run dev
```

#### Individual Service Commands

```bash
# Development builds
docker build -t backend-erwinsuyatno-fdtest-dev ./backend
docker build -t frontend-erwinsuyatno-fdtest-dev ./frontend

# Production builds
docker build -f ./backend/Dockerfile.production -t backend-erwinsuyatno-fdtest-prod ./backend
docker build -f ./frontend/Dockerfile.production -t frontend-erwinsuyatno-fdtest-prod ./frontend

# Run individual services
docker run -p 4000:4000 backend-erwinsuyatno-fdtest-dev
docker run -p 3000:3000 frontend-erwinsuyatno-fdtest-dev
```

#### Docker Configuration Details

**Development Setup:**
- Hot reload enabled with volume mounts
- Development dependencies included
- Source code changes reflected immediately
- Optimized for development workflow
- Image names: `backend-erwinsuyatno-fdtest-dev`, `frontend-erwinsuyatno-fdtest-dev`

**Production Setup:**
- Multi-stage builds for optimized images
- Security with non-root users
- Production dependencies only
- Optimized for performance and security
- Image names: `backend-erwinsuyatno-fdtest-prod`, `frontend-erwinsuyatno-fdtest-prod`

### Production Environment Variables

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
REDIS_URL=your-production-redis-url
```

### Build Commands

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is part of a technical assessment for a Fullstack Developer position.

## Conventional Commits

For questions or issues, please contact the development team.