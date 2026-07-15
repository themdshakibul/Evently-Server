import { Response } from "express";
import { Event } from "../models/Event";
import { Registration } from "../models/Registration";
import type { AuthRequest } from "../middleware/auth";

export async function registerForEvent(req: AuthRequest, res: Response) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    if (event.status !== "published") {
      return res.status(400).json({ success: false, error: "Event is not open for registration" });
    }

    const existing = await Registration.findOne({ event: event._id, user: req.userId });
    if (existing) {
      return res.status(409).json({ success: false, error: "Already registered for this event" });
    }

    if (event.attendeesCount >= event.capacity) {
      return res.status(400).json({ success: false, error: "Event is at full capacity" });
    }

    const registration = await Registration.create({ event: event._id, user: req.userId });

    await Event.findByIdAndUpdate(event._id, { $inc: { attendeesCount: 1 } });

    res.status(201).json({ success: true, data: registration });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to register for event" });
  }
}

export async function cancelRegistration(req: AuthRequest, res: Response) {
  try {
    const registration = await Registration.findOne({ event: req.params.id, user: req.userId });
    if (!registration) {
      return res.status(404).json({ success: false, error: "Registration not found" });
    }

    await Registration.findByIdAndDelete(registration._id);

    await Event.findByIdAndUpdate(req.params.id, { $inc: { attendeesCount: -1 } });

    res.json({ success: true, message: "Registration cancelled" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to cancel registration" });
  }
}

export async function getEventRegistrations(req: AuthRequest, res: Response) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    if (event.organizer.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: "Only the organizer can view registrations" });
    }

    const registrations = await Registration.find({ event: req.params.id })
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch registrations" });
  }
}

export async function getMyRegistrations(req: AuthRequest, res: Response) {
  try {
    const registrations = await Registration.find({ user: req.userId })
      .populate("event")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch your registrations" });
  }
}
