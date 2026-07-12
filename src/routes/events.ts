import { Router } from "express";
import {
  getEvents,
  getEvent,
  getRelatedEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
} from "../controllers/eventController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", getEvents);
router.get("/my-events", requireAuth, getMyEvents);
router.get("/:id", getEvent);
router.get("/:id/related", getRelatedEvents);
router.post("/", requireAuth, createEvent);
router.put("/:id", requireAuth, updateEvent);
router.delete("/:id", requireAuth, deleteEvent);

export default router;
