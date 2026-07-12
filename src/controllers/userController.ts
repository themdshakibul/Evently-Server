import { Response } from "express";
import { User } from "../models/User";
import { Event } from "../models/Event";
import type { AuthRequest } from "../middleware/auth";

export async function getMyEvents(req: AuthRequest, res: Response) {
  try {
    const events = await Event.find({ organizer: req.userId })
      .sort({ createdAt: -1 })
      .populate("organizer", "name email avatar");

    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch your events" });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const { name, avatar } = req.body;
    const updates: Record<string, string> = {};
    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update profile" });
  }
}
