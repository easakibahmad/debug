/**
 * Sends 5 concurrent checkout requests to demonstrate the race condition.
 * Run with the API server already running: npm run dev
 */

const API_URL = "http://localhost:4000";

interface CheckoutResponse {
  success: boolean;
  message: string;
  remainingStock?: number;
}

async function resetInventory(): Promise<void> {
  await fetch(`${API_URL}/api/reset`, { method: "POST" });
}

async function checkout(requestNum: number): Promise<CheckoutResponse> {
  const response = await fetch(`${API_URL}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: 1, quantity: 1 }),
  });

  const data = (await response.json()) as CheckoutResponse;

  console.log(
    `Request ${requestNum} → ${data.success ? "SUCCESS" : "FAILED"}: ${data.message}` +
      (data.remainingStock !== undefined ? ` (stock: ${data.remainingStock})` : "")
  );

  return data;
}

async function main(): Promise<void> {
  console.log("Resetting inventory...");
  await resetInventory();

  console.log("\nSending 5 concurrent checkout requests (stock = 2)...\n");

  const results = await Promise.all(
    Array.from({ length: 5 }, (_, i) => checkout(i + 1))
  );

  const successCount = results.filter((r) => r.success).length;

  console.log(`\n--- Results ---`);
  console.log(`Successful checkouts: ${successCount} (expected max: 2)`);
  console.log(`Failed checkouts: ${results.length - successCount}`);

  const stockResponse = await fetch(`${API_URL}/api/stock/1`);
  const { stock: finalStock } = (await stockResponse.json()) as { stock: number };

  console.log(`Final stock: ${finalStock}`);

  if (successCount > 2) {
    console.log("\n⚠ Race condition detected — more checkouts succeeded than available stock!");
  }
}

main().catch((error) => {
  console.error("Test failed — is the server running? (npm run dev)");
  console.error(error);
  process.exit(1);
});
