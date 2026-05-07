import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db/mongoose";
import { requireTeacher } from "@/lib/auth/api";
import { getFormDef } from "@/lib/forms/definitions";
import { parseSubmission } from "@/lib/forms/builder";
import { SubCriterionSubmission } from "@/lib/models/SubCriterionSubmission";
import { SubCriterionVerification } from "@/lib/models/SubCriterionVerification";
import { logActivity, touchUserActivity } from "@/lib/audit/log";

type Ctx = { params: Promise<{ subCriterionId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const auth = await requireTeacher();
  if ("error" in auth) return auth.error;
  const { subCriterionId } = await ctx.params;
  const def = getFormDef(subCriterionId);
  if (!def) return NextResponse.json({ ok: false, error: "Unknown sub-criterion" }, { status: 404 });

  await connectToDb();
  const [submission, verification] = await Promise.all([
    SubCriterionSubmission.findOne({ userId: auth.userId, subCriterionId }).lean(),
    SubCriterionVerification.findOne({ teacherId: auth.userId, subCriterionId }).lean(),
  ]);

  return NextResponse.json({
    ok: true,
    def,
    submission: submission
      ? { items: submission.items, updatedAt: submission.updatedAt }
      : null,
    verification: verification
      ? { status: verification.status, comment: verification.comment, updatedAt: verification.updatedAt }
      : { status: "PENDING", comment: "" },
  });
}

export async function PUT(req: Request, ctx: Ctx) {
  const auth = await requireTeacher();
  if ("error" in auth) return auth.error;
  const { subCriterionId } = await ctx.params;
  const def = getFormDef(subCriterionId);
  if (!def) return NextResponse.json({ ok: false, error: "Unknown sub-criterion" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as { items?: unknown } | null;
  const parsed = parseSubmission(def, body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectToDb();
  await SubCriterionSubmission.findOneAndUpdate(
    { userId: auth.userId, subCriterionId },
    {
      $set: {
        criterionId: def.criterionId,
        items: parsed.data.items,
      },
    },
    { upsert: true, new: true },
  );

  // These are best-effort; run in parallel to reduce perceived latency.
  await Promise.all([
    logActivity({
      actorId: auth.userId,
      action: "SUBMISSION_UPSERT",
      entityType: "SubCriterionSubmission",
      entityId: subCriterionId,
    }),
    touchUserActivity(auth.userId),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireTeacher();
  if ("error" in auth) return auth.error;
  const { subCriterionId } = await ctx.params;

  await connectToDb();
  await SubCriterionSubmission.deleteOne({ userId: auth.userId, subCriterionId });
  await logActivity({
    actorId: auth.userId,
    action: "SUBMISSION_DELETE",
    entityType: "SubCriterionSubmission",
    entityId: subCriterionId,
  });
  await touchUserActivity(auth.userId);
  return NextResponse.json({ ok: true });
}
