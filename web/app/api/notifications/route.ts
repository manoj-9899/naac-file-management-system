import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db/mongoose";
import { requireUserSession } from "@/lib/auth/api";
import { Notification } from "@/lib/models/Notification";

export async function GET() {
  const auth = await requireUserSession();
  if ("error" in auth) return auth.error;

  await connectToDb();
  const items = await Notification.find({ userId: auth.userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json({
    ok: true,
    notifications: items.map((n) => ({
      id: String(n._id),
      type: n.type,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
    })),
  });
}
