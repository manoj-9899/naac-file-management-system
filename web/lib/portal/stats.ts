import { NAAC_CRITERIA, NAAC_SUB_CRITERIA, getSubCriteriaForCriterion } from "@/lib/naac";
import type { CriterionId } from "@/lib/naac/types";
import {
  filesBySubId,
  isSubCriterionComplete,
  submissionMapBySubId,
  type FileLike,
  type SubmissionLike,
} from "@/lib/forms/progress";

export function completedSubCriteriaCount(args: {
  submissions: SubmissionLike[];
  files: FileLike[];
}) {
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
  return done;
}

export function pendingItemsTotal(args: {
  submissions: SubmissionLike[];
  files: FileLike[];
}) {
  return NAAC_SUB_CRITERIA.length - completedSubCriteriaCount(args);
}

export function pendingByCriterion(args: {
  submissions: SubmissionLike[];
  files: FileLike[];
}): { criterionId: CriterionId; name: string; pending: number }[] {
  const sm = submissionMapBySubId(args.submissions);
  const fm = filesBySubId(args.files);
  return NAAC_CRITERIA.map((c) => {
    const subs = getSubCriteriaForCriterion(c.id);
    let pending = 0;
    for (const s of subs) {
      const complete = isSubCriterionComplete({
        subCriterionId: s.id,
        submission: sm.get(s.id),
        files: fm.get(s.id) ?? [],
      });
      if (!complete) pending += 1;
    }
    return { criterionId: c.id, name: c.name, pending };
  }).filter((x) => x.pending > 0);
}

export function criterionSubProgress(args: {
  criterionId: CriterionId;
  submissions: SubmissionLike[];
  files: FileLike[];
}) {
  const sm = submissionMapBySubId(args.submissions);
  const fm = filesBySubId(args.files);
  const subs = getSubCriteriaForCriterion(args.criterionId);
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
  const total = subs.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent: pct };
}
