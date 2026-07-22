import { Router } from "express";
import { getMyEvents, updateProfile, saveEvent, unsaveEvent, getSavedEvents } from "../controllers/userController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/me/events", requireAuth, getMyEvents);
router.get("/me/saved-events", requireAuth, getSavedEvents);
router.post("/me/saved-events/:id", requireAuth, saveEvent);
router.delete("/me/saved-events/:id", requireAuth, unsaveEvent);
router.put("/me", requireAuth, updateProfile);

export default router;
