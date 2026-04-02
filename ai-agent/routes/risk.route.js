import { Router } from "express";
import riskController from "../controllers/riskController.js";
const router = Router();

router.post("/api/ai/risk", riskController.assessRisk);

export default router;
