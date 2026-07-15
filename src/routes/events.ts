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
import {
  registerForEvent,
  cancelRegistration,
  getEventRegistrations,
} from "../controllers/registrationController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", getEvents);
router.get("/my-events", requireAuth, getMyEvents);
router.get("/:id", getEvent);
router.get("/:id/related", getRelatedEvents);
router.post("/:id/register", requireAuth, registerForEvent);
router.delete("/:id/register", requireAuth, cancelRegistration);
router.get("/:id/registrations", requireAuth, getEventRegistrations);
router.post("/", requireAuth, createEvent);
router.put("/:id", requireAuth, updateEvent);
router.delete("/:id", requireAuth, deleteEvent);

export default router;
