import { Router } from "express";
import * as AuthorController from "./author.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { runDailyAggregation } from "../../jobs/analytics.job";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorize(["author"]),
  AuthorController.getAuthorDashboard,
);
router.post("/admin/process-analytics", async (req, res) => {
  await runDailyAggregation();
  res.json({ Success: true, Message: "Aggregation job executed (GMT)" });
});
export default router;
