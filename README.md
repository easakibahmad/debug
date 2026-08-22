# Race Condition Checkout API

A Node.js & Express checkout API demonstrating concurrency and race conditions.

## How to Run

### 1. Prerequisites & Environment
Ensure PostgreSQL is running and a database named `race_condition_db` exists. Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/race_condition_db"
```

### 2. Install & Start Server
Run the following commands:

```bash
npm install          # Install dependencies
npm run db:generate  # Generate Prisma client (.prisma/client)
npm run db:push      # Push Prisma schema to database
npm run db:seed      # Seed initial product data (stock: 2)
npm run dev          # Start server on http://localhost:4000
```

### 3. Run Concurrency Test
In a **second terminal** (with the server running in the first):

```bash
npm run test:concurrent
```
