import { Schema, model, models, type Model, type Types } from "mongoose";

export type VerificationStatus = "PENDING" | "VERIFIED" | "NEEDS_REVISION";

export interface SubCriterionVerificationDocument {
  _id: Types.ObjectId;
  teacherId: Types.ObjectId;
  subCriterionId: string;
  criterionId: string;
  status: VerificationStatus;
  comment: string;
  updatedBy: Types.ObjectId;
  updatedAt: Date;
}

const SubCriterionVerificationSchema = new Schema<SubCriterionVerificationDocument>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subCriterionId: { type: String, required: true, index: true },
    criterionId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "VERIFIED", "NEEDS_REVISION"],
      default: "PENDING",
    },
    comment: { type: String, default: "" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

SubCriterionVerificationSchema.index(
  { teacherId: 1, subCriterionId: 1 },
  { unique: true },
);

export const SubCriterionVerification: Model<SubCriterionVerificationDocument> =
  (models.SubCriterionVerification as Model<SubCriterionVerificationDocument>) ||
  model<SubCriterionVerificationDocument>(
    "SubCriterionVerification",
    SubCriterionVerificationSchema,
  );
