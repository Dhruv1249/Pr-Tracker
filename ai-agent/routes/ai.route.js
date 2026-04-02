import { Router } from "express";
import aiController from "../controllers/aiController.js";
import agentController from "../controllers/agentController.js";
const router = Router();

router.post("/api/ai/review", aiController.review);
router.post("/api/ai/agent", agentController.interact);

export default router;
