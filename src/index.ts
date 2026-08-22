import express, { Request, Response } from "express";
import { checkout, getStock, resetInventory } from "./inventory";

const app = express();
const PORT = 4000;

app.use(express.json());

interface CheckoutBody {
  productId: number;
  quantity: number;
}

let requestCounter = 0;

app.post("/api/checkout", async (req: Request, res: Response) => {
  const { productId, quantity } = req.body as CheckoutBody;
  const requestId = ++requestCounter;

  if (!productId || !quantity) {
    res.status(400).json({ error: "productId and quantity are required" });
    return;
  }

  const result = await checkout(productId, quantity, requestId);

  if (result.success) {
    res.json({ success: true, message: result.message, remainingStock: await getStock(productId) });
  } else {
    res.status(409).json({ success: false, message: result.message });
  }
});

/** Reset inventory between test runs */
app.post("/api/reset", async (_req: Request, res: Response) => {
  await resetInventory();
  requestCounter = 0;
  console.log("Inventory reset — stock: 2");
  res.json({ message: "Inventory reset", stock: await getStock(1) });
});

/** Get current stock for a product */
app.get("/api/stock/:productId", async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);
  res.json({ productId, stock: await getStock(productId) });
});

app.listen(PORT, async () => {
  console.log(`Checkout API running on http://localhost:${PORT}`);
  console.log(`Initial stock: ${await getStock(1)} (Mechanical Keyboard)`);
});
