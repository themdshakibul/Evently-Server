import { Router } from "express";
import authRoutes from "./auth";
import eventRoutes from "./events";

const router = Router();

router.use("/auth", authRoutes);
router.use("/events", eventRoutes);

export default router;
