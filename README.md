# erwinsuyatno_fdtest

Monorepo for Fullstack Developer Technical Test (Express.js + Next.js + PostgreSQL + Redis + Swagger).

## Prerequisites

- Node.js >= 18
- pnpm or npm
- PostgreSQL 14+
- Redis (optional for bonus)

## Project Structure

```
/backend
  /src
    /controllers
    /services
    /routes
    /models
    /middlewares
    /utils
    /tests
  server.ts
  swagger.json
  .env.example

/frontend
  /pages
  /components
  /lib
  /styles

erwinsuyatno_fdtest_schema.sql
```

## Setup

1. Clone repo
2. Install dependencies (when packages are added later)
3. Configure environment variables

### Backend env

Copy `.env.example` to `.env` inside `backend/` and adjust values.

```
# Postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/erwinsuyatno_fdtest

# JWT
JWT_SECRET=change-me
JWT_EXPIRES_IN=1d

# App
PORT=4000
NODE_ENV=development

# Optional Redis
REDIS_URL=redis://localhost:6379
```

## Database

- Import schema:

```bash
psql -U postgres -d erwinsuyatno_fdtest -f erwinsuyatno_fdtest_schema.sql
```

## Run

Backend (placeholder until app code is added):

```bash
cd backend
# pnpm dev or npm run dev (after scripts are defined)
```

Frontend (placeholder until Next.js app is scaffolded):

```bash
cd frontend
# pnpm dev or npm run dev
```

## Tests

```bash
# To be added with Jest/Vitest
```

## Swagger

- Will be hosted at `/api-docs` once wired.

## Conventional Commits

Please use types like `feat`, `fix`, `docs`, `test`, `chore`.