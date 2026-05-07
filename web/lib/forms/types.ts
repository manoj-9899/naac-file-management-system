import type { CriterionId } from "@/lib/naac/types";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "decimal"
  | "year"
  | "date"
  | "select"
  | "radio"
  | "multiselect";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface SubCriterionFormDef {
  subCriterionId: string;
  criterionId: CriterionId;
  allowMultiple: boolean;
  /** When true, at least one evidence file must be UPLOADED or VERIFIED */
  requiresUpload: boolean;
  fields: FieldDef[];
}
