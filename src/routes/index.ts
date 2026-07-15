import { Router } from "express";
import adminRoutes from "./admin";
import authRoutes from "./auth";
import eventRoutes from "./events";
import registrationRoutes from "./registrations";
import userRoutes from "./users";

const router = Router();

router.use("/admin", adminRoutes);
router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/registrations", registrationRoutes);
router.use("/users", userRoutes);

export default router;
