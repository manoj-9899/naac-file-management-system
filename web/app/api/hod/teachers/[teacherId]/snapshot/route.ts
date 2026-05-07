import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db/mongoose";
import { requireHod } from "@/lib/auth/api";
import { User } from "@/lib/models/User";
import { SubCriterionSubmission } from "@/lib/models/SubCriterionSubmission";
import { EvidenceFile } from "@/lib/models/EvidenceFile";
import { SubCriterionVerification } from "@/lib/models/SubCriterionVerification";
import { NAAC_SUB_CRITERIA } from "@/lib/naac";
import { getFormDef } from "@/lib/forms/definitions";
import { isSubCriterionComplete } from "@/lib/forms/progress";

type Ctx = { params: Promise<{ teacherId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const auth = await requireHod();
  if ("error" in auth) return auth.error;
  const { teacherId } = await ctx.params;

  await connectToDb();
  const teacher = await User.findOne({ _id: teacherId, role: "TEACHER" })
    .select({ name: 1, email: 1, department: 1, subjects: 1, approvalStatus: 1, isActive: 1 })
    .lean();
  if (!teacher) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const [submissions, files, verifications] = await Promise.all([
    SubCriterionSubmission.find({ userId: teacherId }).lean(),
    EvidenceFile.find({ userId: teacherId }).lean(),
    SubCriterionVerification.find({ teacherId }).lean(),
  ]);

  const subById = new Map(submissions.map((s) => [s.subCriterionId, s]));
  const filesBySub = new Map<string, typeof files>();
  for (const f of files) {
    const arr = filesBySub.get(f.subCriterionId) ?? [];
    arr.push(f);
    filesBySub.set(f.subCriterionId, arr);
  }
  const verById = new Map(verifications.map((v) => [v.subCriterionId, v]));

  const subcriteria = NAAC_SUB_CRITERIA.map((meta) => {
      const def = getFormDef(meta.id);
      const sub = subById.get(meta.id);
      const fl = filesBySub.get(meta.id) ?? [];
      const ver = verById.get(meta.id);
      const complete = def
        ? isSubCriterionComplete({ subCriterionId: meta.id, submission: sub ?? null, files: fl })
        : false;
    return {
      ...meta,
      def,
      submission: sub ? { items: sub.items, updatedAt: sub.updatedAt } : null,
      files: fl.map((x) => ({
        id: String(x._id),
        displayName: x.displayName,
        originalFilename: x.originalFilename,
        mimeType: x.mimeType,
        uploadStatus: x.uploadStatus,
        createdAt: x.createdAt,
      })),
      verification: ver
        ? { status: ver.status, comment: ver.comment, updatedAt: ver.updatedAt }
        : { status: "PENDING", comment: "" },
      complete,
    };
  });

  return NextResponse.json({
    ok: true,
    teacher: {
      id: teacherId,
      name: teacher.name,
      email: teacher.email,
      department: teacher.department ?? "",
      subjects: teacher.subjects ?? [],
      approvalStatus: teacher.approvalStatus ?? "APPROVED",
      isActive: teacher.isActive,
    },
    subcriteria,
  });
}
