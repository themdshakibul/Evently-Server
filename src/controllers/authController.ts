import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { signToken, signRefreshToken, verifyRefreshToken, COOKIE_OPTIONS } from "../utils/jwt";
import type { AuthRequest } from "../middleware/auth";

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    res.cookie("token", token, COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });

    res.status(201).json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Registration failed" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const token = signToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    res.cookie("token", token, COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });

    res.json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Login failed" });
  }
}

export async function demoLogin(_req: Request, res: Response) {
  try {
    let user = await User.findOne({ email: "demo@evently.com" });
    if (!user) {
      const passwordHash = await bcrypt.hash("demo1234", 12);
      user = await User.create({
        name: "Demo User",
        email: "demo@evently.com",
        passwordHash,
        role: "user",
      });
    }

    const token = signToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    res.cookie("token", token, COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });

    res.json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Demo login failed" });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  res.json({ success: true, message: "Logged out" });
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to get user" });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, error: "No refresh token" });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ success: false, error: "Invalid refresh token" });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    const newToken = signToken(user._id.toString());
    const newRefreshToken = signRefreshToken(user._id.toString());

    res.cookie("token", newToken, COOKIE_OPTIONS);
    res.cookie("refreshToken", newRefreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });

    res.json({ success: true, message: "Token refreshed" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to refresh token" });
  }
}

export async function updatePassword(req: AuthRequest, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: "Invalid current password" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = passwordHash;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update password" });
  }
}
