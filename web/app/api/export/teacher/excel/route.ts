import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth/api";
import { buildTeacherExcelBuffer } from "@/lib/export/buildTeacherExcel";
import { logActivity, touchUserActivity } from "@/lib/audit/log";

export async function GET() {
  const auth = await requireTeacher();
  if ("error" in auth) return auth.error;

  const buf = await buildTeacherExcelBuffer(auth.userId);
  if (!buf) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  await logActivity({
    actorId: auth.userId,
    action: "EXPORT_EXCEL",
    entityType: "User",
    entityId: auth.userId,
  });
  await touchUserActivity(auth.userId);

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="naac-teacher-export.xlsx"`,
    },
  });
}
