import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db/mongoose";
import { requireHod } from "@/lib/auth/api";
import { Notification } from "@/lib/models/Notification";
import { logActivity } from "@/lib/audit/log";

export async function POST(req: Request) {
  const auth = await requireHod();
  if ("error" in auth) return auth.error;

  const body = (await req.json().catch(() => null)) as
    | { teacherId?: string; message?: string }
    | null;
  const teacherId = body?.teacherId ?? "";
  const message = (body?.message ?? "").trim();
  if (!teacherId || !message) {
    return NextResponse.json({ ok: false, error: "teacherId and message required" }, { status: 400 });
  }

  await connectToDb();
  await Notification.create({
    userId: teacherId,
    type: "REMINDER",
    message,
    read: false,
  });

  await logActivity({
    actorId: auth.userId,
    action: "REMINDER_SENT",
    entityType: "Notification",
    entityId: teacherId,
    metadata: { message },
  });

  return NextResponse.json({ ok: true });
}
