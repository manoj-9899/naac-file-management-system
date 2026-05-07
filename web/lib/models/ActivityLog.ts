import { Schema, model, models, type Model, type Types } from "mongoose";
import type { AuditAction } from "@/lib/audit/actions";

export interface ActivityLogDocument {
  _id: Types.ObjectId;
  actorId: Types.ObjectId;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<ActivityLogDocument>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLog: Model<ActivityLogDocument> =
  (models.ActivityLog as Model<ActivityLogDocument>) ||
  model<ActivityLogDocument>("ActivityLog", ActivityLogSchema);
