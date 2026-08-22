# Task 2: The Slow Database Query

A Next.js dashboard backed by Express + PostgreSQL (Prisma) with an intentional N+1 query problem.

## How to Run

### 1. Prerequisites & Environment
Ensure PostgreSQL is running and a database named `slow_db` exists. Create a `.env.local` file inside the `backend/` directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/slow_db"
```

### 2. Install & Start Server
Run the following commands:

```bash
npm install          # Install dependencies
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed test data
npm run dev          # Start frontend (http://localhost:3000) & backend (http://localhost:4000)
```
