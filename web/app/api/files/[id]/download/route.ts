import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db/mongoose";
import { getMongoUserIdForSession, getSessionOrNull } from "@/lib/auth/api";
import { EvidenceFile } from "@/lib/models/EvidenceFile";
import { getCloudinary } from "@/lib/cloudinary/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const session = await getSessionOrNull();
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const viewerId = await getMongoUserIdForSession(session);
  if (!viewerId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const url = new URL(req.url);
  const teacherIdParam = url.searchParams.get("teacherId");

  await connectToDb();
  const file = await EvidenceFile.findById(id).lean();
  if (!file) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const ownerId = String(file.userId);

  if (session.user.role === "TEACHER") {
    if (viewerId !== ownerId) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
  } else if (session.user.role === "HOD") {
    // Require explicit teacher scope so file IDs cannot be traversed across teachers.
    if (!teacherIdParam || teacherIdParam !== ownerId) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
  } else {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const cloudinary = getCloudinary();
  const expiresAt = Math.floor(Date.now() / 1000) + 10 * 60;
  const resourceType =
    file.resourceType === "raw" ||
    file.mimeType.includes("pdf") ||
    file.mimeType.includes("wordprocessingml")
      ? "raw"
      : "image";

  const downloadUrl = cloudinary.url(file.cloudinaryPublicId, {
    resource_type: resourceType,
    secure: true,
    sign_url: true,
    type: "upload",
    expires_at: expiresAt,
    // Cloudinary SDK analytics signature requires sdk_semver, which may be unavailable in Next bundling.
    // Disable URL analytics for deterministic signed URLs.
    urlAnalytics: false,
  });

  return NextResponse.json({ ok: true, url: downloadUrl, expiresAt });
}
