import { Router } from "express";
import { getMyRegistrations } from "../controllers/registrationController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/my", requireAuth, getMyRegistrations);

export default router;
