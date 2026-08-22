import cors from "cors";
import express, { Request, Response } from "express";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

interface SubmissionBody {
  name: string;
  email: string;
  message: string;
}

/**
 * POST /api/submit-data
 *
 * Task1 bug: accesses body.user.email but the frontend sends
 * { name, email, message } — there is no nested "user" object.
 * This throws TypeError and returns HTTP 500.
 */
app.post("/api/submit-data", (req: Request, res: Response) => {
  try {
    const body = req.body as SubmissionBody;

    console.log("Received submission:", body);

    // @ts-expect-error Task1 bug: body has no nested "user" property
    const normalizedEmail = body.user.email.toLowerCase();

    console.log("Processed email:", normalizedEmail);

    res.json({ success: true, message: "Submission received" });
  } catch (error: any) {
    console.error("Error processing submission:", error.message || error);
    res.status(500).json({ error: "Failed to process submission" });
  }
});

// Fix option: read body.email directly
/*
app.post("/api/submit-data", (req: Request, res: Response) => {
  try {
    const body = req.body as SubmissionBody;
    const normalizedEmail = body.email.toLowerCase();

    console.log("Processed email:", normalizedEmail);
    res.json({ success: true, message: "Submission received" });
  } catch (error: any) {
    console.error("Error processing submission:", error.message || error);
    res.status(500).json({ error: "Failed to process submission" });
  }
});
*/

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
