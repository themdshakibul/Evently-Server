import mongoose, { Document, Schema } from "mongoose";

export interface IRegistration extends Document {
  event: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const registrationSchema = new Schema<IRegistration>({
  event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

registrationSchema.index({ event: 1, user: 1 }, { unique: true });
registrationSchema.index({ user: 1 });

export const Registration = mongoose.model<IRegistration>("Registration", registrationSchema);
