import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import cors from "cors";
import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = 4000;

app.use(cors());
app.use(express.json());

/**
 * GET /api/get-dashboard
 *
 * Task2 bug: N+1 query pattern.
 * 1 query to fetch 50 users + 50 separate profile queries = 51 total.
 */
app.get("/api/get-dashboard", async (_req: Request, res: Response) => {
  const startTime = Date.now();
  let queryCount = 0;

  console.log("Fetching dashboard...");

  // Query 1: fetch all users
  const users = await prisma.user.findMany({
    take: 50,
    orderBy: { id: "asc" },
  });
  queryCount++;

  console.log("Users query completed");

  const dashboard = [];

  // Queries 2–51: one profile query per user (N+1 problem)
  for (const user of users) {
    console.log(`Fetching profile for user: ${user.id}`);

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    queryCount++;

    // Small artificial delay to make the slowness visible in the task2
    await new Promise((resolve) => setTimeout(resolve, 50));

    dashboard.push({
      id: user.id,
      name: user.name,
      email: user.email,
      profile: profile
        ? { bio: profile.bio, avatar: profile.avatar }
        : null,
    });
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Dashboard completed in ${elapsed}s`);
  console.log(`Total database queries: ${queryCount}`);

  res.json({ users: dashboard, meta: { queryCount, elapsedSeconds: elapsed } });
});

// Fix option: single query with include
/*
app.get("/api/get-dashboard", async (_req: Request, res: Response) => {
  const startTime = Date.now();

  const users = await prisma.user.findMany({
    take: 50,
    orderBy: { id: "asc" },
    include: { profile: true },
  });

  const dashboard = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile ? { bio: user.profile.bio, avatar: user.profile.avatar } : null,
  }));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  res.json({ users: dashboard, meta: { queryCount: 1, elapsedSeconds: elapsed } });
});
*/

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
