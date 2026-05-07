import { Schema, model, models, type Model, type Types } from "mongoose";

export type EvidenceUploadStatus = "PENDING" | "UPLOADED" | "VERIFIED";

export interface EvidenceFileDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  criterionId: string;
  subCriterionId: string;
  cloudinaryPublicId: string;
  resourceType: string;
  bytes: number;
  originalFilename: string;
  mimeType: string;
  displayName: string;
  uploadStatus: EvidenceUploadStatus;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceFileSchema = new Schema<EvidenceFileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    criterionId: { type: String, required: true, index: true },
    subCriterionId: { type: String, required: true, index: true },
    cloudinaryPublicId: { type: String, required: true },
    resourceType: { type: String, required: true },
    bytes: { type: Number, required: true },
    originalFilename: { type: String, required: true },
    mimeType: { type: String, required: true },
    displayName: { type: String, required: true },
    uploadStatus: {
      type: String,
      required: true,
      enum: ["PENDING", "UPLOADED", "VERIFIED"],
      default: "UPLOADED",
    },
  },
  { timestamps: true },
);

EvidenceFileSchema.index({ userId: 1, subCriterionId: 1 });

export const EvidenceFile: Model<EvidenceFileDocument> =
  (models.EvidenceFile as Model<EvidenceFileDocument>) ||
  model<EvidenceFileDocument>("EvidenceFile", EvidenceFileSchema);
