import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  avatar?: string;
  savedEvents: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  avatar: { type: String },
  savedEvents: [{ type: Schema.Types.ObjectId, ref: "Event" }],
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>("User", userSchema);
