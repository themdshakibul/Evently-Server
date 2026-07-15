import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  category: string;
  date: Date;
  location: string;
  images: string[];
  capacity: number;
  price: number;
  organizer: mongoose.Types.ObjectId;
  status: "draft" | "pending" | "published" | "cancelled";
  views: number;
  attendeesCount: number;
  createdAt: Date;
}

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  location: { type: String, required: true, trim: true },
  images: [{ type: String }],
  capacity: { type: Number, required: true, min: 1 },
  price: { type: Number, default: 0, min: 0 },
  organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["draft", "pending", "published", "cancelled"], default: "draft" },
  views: { type: Number, default: 0 },
  attendeesCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

eventSchema.index({ category: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ title: "text", description: "text" });

export const Event = mongoose.model<IEvent>("Event", eventSchema);
