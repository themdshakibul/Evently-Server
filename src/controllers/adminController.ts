import { Response } from "express";
import { Event } from "../models/Event";
import { User } from "../models/User";
import { Registration } from "../models/Registration";
import type { AuthRequest } from "../middleware/auth";

export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    const [totalEvents, totalUsers, totalRegistrations, totalViews] = await Promise.all([
      Event.countDocuments(),
      User.countDocuments(),
      Registration.countDocuments(),
      Event.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
    ]);

    res.json({
      success: true,
      data: {
        totalEvents,
        totalUsers,
        totalRegistrations,
        totalViews: totalViews[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
}

export async function getAllEvents(req: AuthRequest, res: Response) {
  try {
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .populate("organizer", "name email avatar");

    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch events" });
  }
}

export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    const users = await User.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
}

export async function deleteAnyEvent(req: AuthRequest, res: Response) {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }
    await Registration.deleteMany({ event: event._id });
    res.json({ success: true, message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete event" });
  }
}

export async function approveEvent(req: AuthRequest, res: Response) {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: "published" },
      { new: true, runValidators: true }
    ).populate("organizer", "name email avatar");

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to approve event" });
  }
}

export async function rejectEvent(req: AuthRequest, res: Response) {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true, runValidators: true }
    ).populate("organizer", "name email avatar");

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to reject event" });
  }
}

export async function getPendingEvents(req: AuthRequest, res: Response) {
  try {
    const events = await Event.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .populate("organizer", "name email avatar");

    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch pending events" });
  }
}
