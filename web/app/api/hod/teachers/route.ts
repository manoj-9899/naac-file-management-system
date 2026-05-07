import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db/mongoose";
import { requireHod } from "@/lib/auth/api";
import { User } from "@/lib/models/User";
import { SubCriterionSubmission } from "@/lib/models/SubCriterionSubmission";
import { EvidenceFile } from "@/lib/models/EvidenceFile";
import { overallCompletionPercent } from "@/lib/forms/progress";

export async function GET() {
  const auth = await requireHod();
  if ("error" in auth) return auth.error;

  await connectToDb();
  const teachers = await User.find({ role: "TEACHER" })
    .select({
      name: 1,
      email: 1,
      department: 1,
      approvalStatus: 1,
      isActive: 1,
      lastActivityAt: 1,
      createdAt: 1,
    })
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

  const rows = teachers.map((t) => {
    const id = String(t._id);
    const s = subsByUser.get(id) ?? [];
    const fl = filesByUser.get(id) ?? [];
    const started = s.length > 0 || fl.length > 0;
    return {
      id,
      name: t.name,
      email: t.email,
      department: t.department ?? "",
      approvalStatus: t.approvalStatus ?? "APPROVED",
      isActive: t.isActive,
      lastActivityAt: t.lastActivityAt ?? null,
      started,
      completionPercent: overallCompletionPercent({ submissions: s, files: fl }),
    };
  });

  return NextResponse.json({ ok: true, teachers: rows });
}
