import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db/mongoose";
import { requireTeacher } from "@/lib/auth/api";
import { EvidenceFile } from "@/lib/models/EvidenceFile";
import { getCloudinary } from "@/lib/cloudinary/server";
import { logActivity, touchUserActivity } from "@/lib/audit/log";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await requireTeacher();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as { displayName?: string } | null;
  const displayName = (body?.displayName ?? "").trim();
  if (!displayName) {
    return NextResponse.json({ ok: false, error: "displayName required" }, { status: 400 });
  }

  await connectToDb();
  const updated = await EvidenceFile.findOneAndUpdate(
    { _id: id, userId: auth.userId },
    { $set: { displayName } },
    { new: true },
  ).lean();
  if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  await logActivity({
    actorId: auth.userId,
    action: "FILE_RENAME",
    entityType: "EvidenceFile",
    entityId: id,
  });
  await touchUserActivity(auth.userId);
  return NextResponse.json({ ok: true, file: updated });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireTeacher();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  await connectToDb();
  const doc = await EvidenceFile.findOne({ _id: id, userId: auth.userId }).lean();
  if (!doc) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const cloudinary = getCloudinary();
  try {
    const rt =
      doc.resourceType === "raw" || doc.mimeType.includes("pdf") || doc.mimeType.includes("word")
        ? "raw"
        : "image";
    await cloudinary.uploader.destroy(doc.cloudinaryPublicId, {
      resource_type: rt,
    });
  } catch {
    // still delete db record
  }

  await EvidenceFile.deleteOne({ _id: id, userId: auth.userId });
  await logActivity({
    actorId: auth.userId,
    action: "FILE_DELETE",
    entityType: "EvidenceFile",
    entityId: id,
  });
  await touchUserActivity(auth.userId);
  return NextResponse.json({ ok: true });
}
