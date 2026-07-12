import { Router } from "express";
import authRoutes from "./auth";
import eventRoutes from "./events";
import userRoutes from "./users";

const router = Router();

router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/users", userRoutes);

export default router;
