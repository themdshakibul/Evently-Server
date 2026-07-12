import { Router } from "express";
import { getMyEvents, updateProfile } from "../controllers/userController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/me/events", requireAuth, getMyEvents);
router.put("/me", requireAuth, updateProfile);

export default router;
