import { Router } from "express";
import {
  getDashboardStats,
  getAllEvents,
  getAllUsers,
  deleteAnyEvent,
  approveEvent,
  rejectEvent,
  getPendingEvents,
} from "../controllers/adminController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/stats", getDashboardStats);
router.get("/events", getAllEvents);
router.get("/events/pending", getPendingEvents);
router.get("/users", getAllUsers);
router.delete("/events/:id", deleteAnyEvent);
router.patch("/events/:id/approve", approveEvent);
router.patch("/events/:id/reject", rejectEvent);

export default router;
