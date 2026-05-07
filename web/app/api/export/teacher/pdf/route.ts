import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth/api";
import { collectTeacherData } from "@/lib/export/collectTeacherData";
import { buildTeacherPdfBuffer } from "@/lib/export/renderTeacherPdf";
import { logActivity, touchUserActivity } from "@/lib/audit/log";

export async function GET() {
  const auth = await requireTeacher();
  if ("error" in auth) return auth.error;

  const data = await collectTeacherData(auth.userId);
  if (!data) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const exportedAt = new Date().toISOString();
  const buf = await buildTeacherPdfBuffer(data, exportedAt);

  await logActivity({
    actorId: auth.userId,
    action: "EXPORT_PDF",
    entityType: "User",
    entityId: auth.userId,
  });
  await touchUserActivity(auth.userId);

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="naac-teacher-report.pdf"`,
    },
  });
}
