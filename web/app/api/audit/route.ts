import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db/mongoose";
import { requireHod } from "@/lib/auth/api";
import { ActivityLog } from "@/lib/models/ActivityLog";

export async function GET(req: Request) {
  const auth = await requireHod();
  if ("error" in auth) return auth.error;

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "200"), 500);

  await connectToDb();
  const logs = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return NextResponse.json({
    ok: true,
    logs: logs.map((l) => ({
      id: String(l._id),
      actorId: String(l.actorId),
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      metadata: l.metadata,
      createdAt: l.createdAt.toISOString(),
    })),
  });
}
