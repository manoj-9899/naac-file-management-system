import { Schema, model, models, type Model } from "mongoose";
import type { UserRole } from "@/lib/auth/roles";

export type TeacherApprovalStatus = "PENDING" | "APPROVED";

export interface UserDocument {
  _id: unknown;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  department?: string;
  subjects?: string[];
  /** Teachers start PENDING until HOD approves; HOD is always APPROVED. */
  approvalStatus: TeacherApprovalStatus;
  lastActivityAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ["TEACHER", "HOD"] },
    department: { type: String, required: false, trim: true },
    subjects: { type: [String], required: false, default: undefined },
    approvalStatus: {
      type: String,
      required: true,
      enum: ["PENDING", "APPROVED"],
      default: "APPROVED",
    },
    lastActivityAt: { type: Date, required: false },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, isActive: 1 });

export const User: Model<UserDocument> =
  (models.User as Model<UserDocument>) || model<UserDocument>("User", UserSchema);

