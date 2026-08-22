import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with 50 users and profiles...");

  // Clear existing data
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  for (let i = 1; i <= 50; i++) {
    await prisma.user.create({
      data: {
        name: `User ${i}`,
        email: `user${i}@example.com`,
        profile: {
          create: {
            bio: `Bio for user ${i} — software engineer and task2 participant.`,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=User${i}`,
          },
        },
      },
    });
  }

  console.log("Seeded 50 users with profiles.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
