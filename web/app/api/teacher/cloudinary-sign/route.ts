import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth/api";
import { getCloudinary } from "@/lib/cloudinary/server";

const ALLOWED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
]);

export async function POST(req: Request) {
  const auth = await requireTeacher();
  if ("error" in auth) return auth.error;

  const body = (await req.json().catch(() => null)) as
    | { folder?: string; mimeType?: string }
    | null;
  const mimeType = body?.mimeType ?? "";
  if (!ALLOWED.has(mimeType)) {
    return NextResponse.json(
      { ok: false, error: "Only PDF, DOCX, JPG, PNG uploads are allowed." },
      { status: 400 },
    );
  }

  const cloudinary = getCloudinary();
  const cfg = cloudinary.config();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = (body?.folder ?? "naac-evidence").trim();
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
  };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    cfg.api_secret as string,
  );

  return NextResponse.json({
    ok: true,
    cloudName: cfg.cloud_name,
    apiKey: cfg.api_key,
    timestamp,
    signature,
    folder,
  });
}
