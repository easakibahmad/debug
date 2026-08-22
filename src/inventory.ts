/**
 * Database-backed inventory store.
 *
 * Task3 bug: checkout() is not atomic.
 * Multiple concurrent requests can read the same stock value
 * before any of them decrement it.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/** Simulates async work (payment processing, DB write, etc.) */
const CHECKOUT_DELAY_MS = 100;

function timestamp(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0");
  return `${h}:${m}:${s}.${ms}`;
}

export async function getStock(productId: number): Promise<number> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  return product?.stock ?? 0;
}

export async function resetInventory(): Promise<void> {
  await prisma.product.deleteMany();
  await prisma.product.create({
    data: { id: 1, name: "Mechanical Keyboard", stock: 2 },
  });
}

/**
 * Vulnerable checkout — read, check, async delay, decrement.
 * NOT safe for concurrent requests.
 */
export async function checkout(
  productId: number,
  quantity: number,
  requestId: number
): Promise<{ success: boolean; message: string }> {

  // Step 1: Read current stock from DB
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    return { success: false, message: "Product not found" };
  }

  console.log(`[${timestamp()}] Request ${requestId} started`);

  const currentStock = product.stock;
  console.log(`[${timestamp()}] Request ${requestId} read stock: ${currentStock}`);

  // Step 2: Check availability
  if (currentStock < quantity) {
    console.log(`[${timestamp()}] Request ${requestId} rejected — insufficient stock`);
    return { success: false, message: "Insufficient stock" };
  }

  // Step 3: Async delay — other requests can read the same stock during this window
  await new Promise((resolve) => setTimeout(resolve, CHECKOUT_DELAY_MS));

  // Step 4: Vulnerable Decrement (using stale stock value from step 1)
  const newStock = currentStock - quantity;
  await prisma.product.update({
    where: { id: productId },
    data: { stock: newStock },
  });

  console.log(`[${timestamp()}] Request ${requestId} decremented stock to ${newStock}`);

  return {
    success: true,
    message: `Checked out ${quantity}x ${product.name}`,
  };
}


// export async function checkout(
//   productId: number,
//   quantity: number,
//   requestId: number
// ): Promise<{ success: boolean; message: string }> {

//   // Atomic Update: Decrement stock directly in PostgreSQL ONLY IF stock >= quantity
//   const result = await prisma.product.updateMany({
//     where: {
//       id: productId,
//       stock: { gte: quantity }, // Database-level check
//     },
//     data: {
//       stock: { decrement: quantity }, // Atomic decrement in DB
//     },
//   });

//   // If 0 rows updated, stock was insufficient!
//   if (result.count === 0) {
//     return { success: false, message: "Insufficient stock" };
//   }

//   return { success: true, message: "Checkout successful!" };
// }
