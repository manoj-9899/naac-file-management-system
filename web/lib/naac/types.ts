export const CRITERION_IDS = ["C1", "C2", "C3", "C4", "C5", "C6", "C7"] as const;

export type CriterionId = (typeof CRITERION_IDS)[number];

export interface NaacCriterion {
  id: CriterionId;
  /** Display code, e.g. "C1" */
  code: string;
  /** Full NAAC criterion name */
  name: string;
  /** Maximum marks in NAAC framework (from project guide) */
  maxMarks: number;
  /** Sort order 1–7 */
  order: number;
}

export interface NaacSubCriterion {
  /** Stable key, e.g. "C1.1" — use in DB and routes */
  id: string;
  criterionId: CriterionId;
  /** Human-facing sub-code (e.g. "1.1") */
  code: string;
  title: string;
  /** Short evidence focus from NAAC guide (curriculum, uploads, etc.) */
  summary: string;
  /** Order within the parent criterion */
  order: number;
}
