import { Response } from "express";
import { Event } from "../models/Event";
import { Registration } from "../models/Registration";
import { User } from "../models/User";
import type { AuthRequest } from "../middleware/auth";

async function isAdmin(userId: string): Promise<boolean> {
  const user = await User.findById(userId);
  return user?.role === "admin";
}

export async function getEvents(req: AuthRequest, res: Response) {
  try {
    const {
      search,
      category,
      date,
      location,
      page = "1",
      limit = "12",
      sort = "newest",
    } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = { status: "published" };

    if (search) {
      filter.$text = { $search: search };
    }
    if (category && category !== "All") {
      filter.category = category;
    }
    if (date) {
      const d = new Date(date);
      filter.date = { $gte: d, $lte: new Date(d.getTime() + 86400000) };
    }
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "popular") sortOption = { views: -1 };
    else if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Event.find(filter).sort(sortOption).skip(skip).limit(limitNum).populate("organizer", "name email avatar"),
      Event.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: events,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch events" });
  }
}

export async function getEvent(req: AuthRequest, res: Response) {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("organizer", "name email avatar");

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch event" });
  }
}

export async function getRelatedEvents(req: AuthRequest, res: Response) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    const related = await Event.find({
      _id: { $ne: event._id },
      category: event.category,
      status: "published",
    })
      .sort({ views: -1 })
      .limit(4)
      .populate("organizer", "name email avatar");

    res.json({ success: true, data: related });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch related events" });
  }
}

export async function createEvent(req: AuthRequest, res: Response) {
  try {
    const { title, description, category, date, location, images, capacity, price } = req.body;
    const isAdmin = await User.findById(req.userId).then(u => u?.role === "admin");

    const event = await Event.create({
      status: isAdmin ? "published" : "pending",
      title,
      description,
      category,
      date,
      location,
      images: images || [],
      capacity,
      price: price || 0,
      organizer: req.userId,
    });

    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to create event" });
  }
}

export async function updateEvent(req: AuthRequest, res: Response) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    if (event.organizer.toString() !== req.userId && !(await isAdmin(req.userId!))) {
      return res.status(403).json({ success: false, error: "Not authorized to edit this event" });
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("organizer", "name email avatar");

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update event" });
  }
}

export async function deleteEvent(req: AuthRequest, res: Response) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    if (event.organizer.toString() !== req.userId && !(await isAdmin(req.userId!))) {
      return res.status(403).json({ success: false, error: "Not authorized to delete this event" });
    }

    await Registration.deleteMany({ event: event._id });
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete event" });
  }
}

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
