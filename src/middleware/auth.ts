import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: "Invalid or expired token" });
  }

  req.userId = payload.userId;
  next();
}
