import { connectToDb } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";
import { SubCriterionSubmission } from "@/lib/models/SubCriterionSubmission";
import { EvidenceFile } from "@/lib/models/EvidenceFile";
import { NAAC_CRITERIA } from "@/lib/naac";
import type { CriterionId } from "@/lib/naac/types";
import { criterionCompletionPercent, overallCompletionPercent } from "@/lib/forms/progress";
import { pendingItemsTotal } from "@/lib/portal/stats";

export type TeacherRow = {
  id: string;
  name: string;
  email: string;
  department: string;
  completionPercent: number;
  lastActivityAt: string | null;
  started: boolean;
};

export type DepartmentStats = {
  teacherCount: number;
  averageProgress: number;
  fullySubmitted: number;
  /** Sum of incomplete sub-criteria across all teachers (rough “pending work” count). */
  pendingWorkItems: number;
  criteria: { id: CriterionId; name: string; percent: number }[];
  funnel: {
    started: number;
    inProgress: number;
    submitted: number;
  };
  teachers: TeacherRow[];
};

export async function getDepartmentStats(): Promise<DepartmentStats> {
  await connectToDb();
  const teachers = await User.find({ role: "TEACHER" })
    .select({ name: 1, email: 1, department: 1, lastActivityAt: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .lean();

  const ids = teachers.map((t) => String(t._id));
  const [submissions, files] = await Promise.all([
    SubCriterionSubmission.find({ userId: { $in: ids } }).lean(),
    EvidenceFile.find({ userId: { $in: ids } }).lean(),
  ]);

  const subsByUser = new Map<string, typeof submissions>();
  const filesByUser = new Map<string, typeof files>();
  for (const s of submissions) {
    const k = String(s.userId);
    const arr = subsByUser.get(k) ?? [];
    arr.push(s);
    subsByUser.set(k, arr);
  }
  for (const f of files) {
    const k = String(f.userId);
    const arr = filesByUser.get(k) ?? [];
    arr.push(f);
    filesByUser.set(k, arr);
  }

  const teacherRows: TeacherRow[] = [];
  let pendingSum = 0;
  let submittedFull = 0;
  let progressSum = 0;

  for (const t of teachers) {
    const id = String(t._id);
    const s = subsByUser.get(id) ?? [];
    const fl = filesByUser.get(id) ?? [];
    const started = s.length > 0 || fl.length > 0;
    const completionPercent = overallCompletionPercent({ submissions: s, files: fl });
    progressSum += completionPercent;
    pendingSum += pendingItemsTotal({ submissions: s, files: fl });
    if (completionPercent === 100) submittedFull += 1;

    teacherRows.push({
      id,
      name: t.name,
      email: t.email,
      department: t.department ?? "—",
      completionPercent,
      lastActivityAt: t.lastActivityAt ? t.lastActivityAt.toISOString() : null,
      started,
    });
  }

  const n = teachers.length;
  const averageProgress = n ? Math.round(progressSum / n) : 0;

  const criteria = NAAC_CRITERIA.map((c) => {
    let sum = 0;
    for (const t of teachers) {
      const id = String(t._id);
      const s = subsByUser.get(id) ?? [];
      const fl = filesByUser.get(id) ?? [];
      sum += criterionCompletionPercent({
        criterionId: c.id,
        submissions: s,
        files: fl,
      });
    }
    return {
      id: c.id,
      name: c.name,
      percent: n ? Math.round(sum / n) : 0,
    };
  });

  const started = teacherRows.filter((r) => r.started).length;
  const inProgress = teacherRows.filter(
    (r) => r.started && r.completionPercent > 0 && r.completionPercent < 100,
  ).length;
  const submitted = teacherRows.filter((r) => r.completionPercent === 100).length;

  return {
    teacherCount: n,
    averageProgress,
    fullySubmitted: submittedFull,
    pendingWorkItems: pendingSum,
    criteria,
    funnel: { started, inProgress, submitted },
    teachers: teacherRows,
  };
}
