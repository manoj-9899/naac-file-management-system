import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db/mongoose";
import { requireTeacher } from "@/lib/auth/api";
import { getFormDef } from "@/lib/forms/definitions";
import { EvidenceFile } from "@/lib/models/EvidenceFile";
import { logActivity, touchUserActivity } from "@/lib/audit/log";

const ALLOWED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
]);

export async function GET(req: Request) {
  const auth = await requireTeacher();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const subCriterionId = url.searchParams.get("subCriterionId");

  await connectToDb();

  const query =
    subCriterionId != null && subCriterionId !== ""
      ? { userId: auth.userId, subCriterionId }
      : { userId: auth.userId };

  const files = await EvidenceFile.find(query).sort({ createdAt: -1 }).lean();

  return NextResponse.json({
    ok: true,
    files: files.map((f) => ({
      id: String(f._id),
      displayName: f.displayName,
      originalFilename: f.originalFilename,
      mimeType: f.mimeType,
      bytes: f.bytes,
      uploadStatus: f.uploadStatus,
      createdAt: f.createdAt ? f.createdAt.toISOString() : undefined,
      criterionId: f.criterionId,
      subCriterionId: f.subCriterionId,
    })),
  });
}

export async function POST(req: Request) {
  const auth = await requireTeacher();
  if ("error" in auth) return auth.error;

  const body = (await req.json().catch(() => null)) as
    | {
        subCriterionId?: string;
        cloudinaryPublicId?: string;
        resourceType?: string;
        bytes?: number;
        originalFilename?: string;
        mimeType?: string;
        displayName?: string;
      }
    | null;

  const subCriterionId = body?.subCriterionId ?? "";
  const def = getFormDef(subCriterionId);
  if (!def) return NextResponse.json({ ok: false, error: "Unknown sub-criterion" }, { status: 404 });

  const mimeType = body?.mimeType ?? "";
  if (!ALLOWED.has(mimeType)) {
    return NextResponse.json({ ok: false, error: "Invalid file type" }, { status: 400 });
  }

  const cloudinaryPublicId = body?.cloudinaryPublicId ?? "";
  if (!cloudinaryPublicId) {
    return NextResponse.json({ ok: false, error: "cloudinaryPublicId required" }, { status: 400 });
  }

  await connectToDb();
  const doc = await EvidenceFile.create({
    userId: auth.userId,
    criterionId: def.criterionId,
    subCriterionId,
    cloudinaryPublicId,
    resourceType: body?.resourceType ?? "auto",
    bytes: Number(body?.bytes ?? 0),
    originalFilename: body?.originalFilename ?? "file",
    mimeType,
    displayName: body?.displayName ?? body?.originalFilename ?? "Evidence file",
    uploadStatus: "UPLOADED",
  });

  await logActivity({
    actorId: auth.userId,
    action: "FILE_UPLOAD",
    entityType: "EvidenceFile",
    entityId: String(doc._id),
    metadata: { subCriterionId, cloudinaryPublicId },
  });
  await touchUserActivity(auth.userId);

  return NextResponse.json({ ok: true, file: doc });
}
