import type { Request, Response, NextFunction } from "express";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rootRouter from "./src/routes/index"; // Path corrected
import { sendResponse } from "./src/utils/response";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Main API Route Prefix
app.use("/api", rootRouter);

app.get("/", (req: Request, res: Response) => {
  return sendResponse(res, 200, "News API is healthy");
});

// 404 handler
app.use((req: Request, res: Response) => {
  return sendResponse(res, 404, "Route not found");
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  return sendResponse(res, err.status || 500, "Internal Server Error", null, [
    err.message,
  ]);
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
