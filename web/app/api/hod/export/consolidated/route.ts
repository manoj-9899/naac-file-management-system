import { NextResponse } from "next/server";
import { requireHod } from "@/lib/auth/api";
import { buildConsolidatedExcelBuffer } from "@/lib/export/buildConsolidatedExcel";
import { logActivity, touchUserActivity } from "@/lib/audit/log";

export async function GET() {
  const auth = await requireHod();
  if ("error" in auth) return auth.error;

  const buf = await buildConsolidatedExcelBuffer();

  await logActivity({
    actorId: auth.userId,
    action: "EXPORT_CONSOLIDATED",
    entityType: "Export",
    entityId: "consolidated",
  });
  await touchUserActivity(auth.userId);

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="naac-consolidated-all-teachers.xlsx"`,
    },
  });
}
