import { NAAC_CRITERIA, NAAC_SUB_CRITERIA, getSubCriteriaForCriterion } from "@/lib/naac";
import type { CriterionId } from "@/lib/naac/types";
export type SubmissionLike = {
  subCriterionId: string;
  items: Record<string, unknown>[];
};

export type FileLike = {
  subCriterionId: string;
  uploadStatus: string;
};
import { parseSubmission } from "./builder";
import { getFormDef } from "./definitions";

export function submissionMapBySubId(docs: SubmissionLike[]) {
  return new Map(docs.map((d) => [d.subCriterionId, d]));
}

export function filesBySubId(files: FileLike[]) {
  const m = new Map<string, FileLike[]>();
  for (const f of files) {
    const arr = m.get(f.subCriterionId) ?? [];
    arr.push(f);
    m.set(f.subCriterionId, arr);
  }
  return m;
}

export function isSubCriterionComplete(args: {
  subCriterionId: string;
  submission?: SubmissionLike | null;
  files: FileLike[];
}) {
  const def = getFormDef(args.subCriterionId);
  if (!def) return false;
  const parsed = parseSubmission(def, { items: args.submission?.items ?? [] });
  if (!parsed.success) return false;
  if (!def.requiresUpload) return true;
  return args.files.some(
    (f) => f.uploadStatus === "UPLOADED" || f.uploadStatus === "VERIFIED",
  );
}

export function criterionCompletionPercent(args: {
  criterionId: CriterionId;
  submissions: SubmissionLike[];
  files: FileLike[];
}) {
  const subs = getSubCriteriaForCriterion(args.criterionId);
  if (subs.length === 0) return 0;
  const sm = submissionMapBySubId(args.submissions);
  const fm = filesBySubId(args.files);
  let done = 0;
  for (const s of subs) {
    if (
      isSubCriterionComplete({
        subCriterionId: s.id,
        submission: sm.get(s.id),
        files: fm.get(s.id) ?? [],
      })
    ) {
      done += 1;
    }
  }
  return Math.round((done / subs.length) * 100);
}

export function overallCompletionPercent(args: {
  submissions: SubmissionLike[];
  files: FileLike[];
}) {
  const total = NAAC_SUB_CRITERIA.length;
  if (total === 0) return 0;
  const sm = submissionMapBySubId(args.submissions);
  const fm = filesBySubId(args.files);
  let done = 0;
  for (const s of NAAC_SUB_CRITERIA) {
    if (
      isSubCriterionComplete({
        subCriterionId: s.id,
        submission: sm.get(s.id),
        files: fm.get(s.id) ?? [],
      })
    ) {
      done += 1;
    }
  }
  return Math.round((done / total) * 100);
}

export function criterionBreakdown(args: {
  submissions: SubmissionLike[];
  files: FileLike[];
}) {
  return NAAC_CRITERIA.map((c) => ({
    criterionId: c.id,
    name: c.name,
    maxMarks: c.maxMarks,
    percent: criterionCompletionPercent({
      criterionId: c.id,
      submissions: args.submissions,
      files: args.files,
    }),
  }));
}
