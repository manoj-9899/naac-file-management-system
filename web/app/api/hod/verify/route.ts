import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db/mongoose";
import { requireHod } from "@/lib/auth/api";
import { getFormDef } from "@/lib/forms/definitions";
import { SubCriterionVerification } from "@/lib/models/SubCriterionVerification";
import { EvidenceFile } from "@/lib/models/EvidenceFile";
import { logActivity } from "@/lib/audit/log";

export async function POST(req: Request) {
  const auth = await requireHod();
  if ("error" in auth) return auth.error;

  const body = (await req.json().catch(() => null)) as
    | {
        teacherId?: string;
        subCriterionId?: string;
        status?: "PENDING" | "VERIFIED" | "NEEDS_REVISION";
        comment?: string;
      }
    | null;

  const teacherId = body?.teacherId ?? "";
  const subCriterionId = body?.subCriterionId ?? "";
  const status = body?.status;
  const comment = (body?.comment ?? "").trim();

  if (!teacherId || !subCriterionId) {
    return NextResponse.json({ ok: false, error: "teacherId and subCriterionId required" }, { status: 400 });
  }
  if (status !== "PENDING" && status !== "VERIFIED" && status !== "NEEDS_REVISION") {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  const def = getFormDef(subCriterionId);
  if (!def) return NextResponse.json({ ok: false, error: "Unknown sub-criterion" }, { status: 404 });

  await connectToDb();
  await SubCriterionVerification.findOneAndUpdate(
    { teacherId, subCriterionId },
    {
      $set: {
        criterionId: def.criterionId,
        status,
        comment,
        updatedBy: auth.userId,
      },
    },
    { upsert: true, new: true },
  );

  if (status === "VERIFIED") {
    await EvidenceFile.updateMany(
      { userId: teacherId, subCriterionId },
      { $set: { uploadStatus: "VERIFIED" } },
    );
  }

  await logActivity({
    actorId: auth.userId,
    action: "VERIFY_UPDATE",
    entityType: "SubCriterionVerification",
    entityId: `${teacherId}:${subCriterionId}`,
    metadata: { status },
  });

  return NextResponse.json({ ok: true });
}
