import { Router } from "express";
import securityController from "../controllers/securityController.js";
const router = Router();

router.post("/api/ai/security", securityController.detectSecurity);

export default router;
