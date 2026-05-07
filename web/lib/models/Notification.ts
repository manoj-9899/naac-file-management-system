import { Schema, model, models, type Model, type Types } from "mongoose";

export type NotificationType = "REMINDER" | "DEADLINE" | "REVISION" | "GENERAL";

export interface NotificationDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["REMINDER", "DEADLINE", "REVISION", "GENERAL"],
    },
    message: { type: String, required: true },
    read: { type: Boolean, required: true, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification: Model<NotificationDocument> =
  (models.Notification as Model<NotificationDocument>) ||
  model<NotificationDocument>("Notification", NotificationSchema);
