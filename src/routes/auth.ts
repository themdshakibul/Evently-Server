import { Router } from "express";
import { z } from "zod";
import { register, login, demoLogin, logout, getMe, refreshToken, updatePassword } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/demo-login", authLimiter, demoLogin);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", requireAuth, getMe);
router.put("/update-password", requireAuth, validate(updatePasswordSchema), updatePassword);

export default router;
