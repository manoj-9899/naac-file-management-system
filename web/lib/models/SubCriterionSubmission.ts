import { Schema, model, models, type Model, type Types } from "mongoose";

export interface SubCriterionSubmissionDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  criterionId: string;
  subCriterionId: string;
  /** One or more “rows” of structured answers */
  items: Record<string, unknown>[];
  createdAt: Date;
  updatedAt: Date;
}

const SubCriterionSubmissionSchema = new Schema<SubCriterionSubmissionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    criterionId: { type: String, required: true, index: true },
    subCriterionId: { type: String, required: true, index: true },
    /** Array of row objects — stored as Mixed for flexible Zod-driven keys */
    items: { type: Schema.Types.Mixed, default: [] },
  },
  { timestamps: true },
);

SubCriterionSubmissionSchema.index(
  { userId: 1, subCriterionId: 1 },
  { unique: true },
);

export const SubCriterionSubmission: Model<SubCriterionSubmissionDocument> =
  (models.SubCriterionSubmission as Model<SubCriterionSubmissionDocument>) ||
  model<SubCriterionSubmissionDocument>(
    "SubCriterionSubmission",
    SubCriterionSubmissionSchema,
  );
