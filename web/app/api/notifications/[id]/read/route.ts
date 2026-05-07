import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db/mongoose";
import { requireUserSession } from "@/lib/auth/api";
import { Notification } from "@/lib/models/Notification";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(_req: Request, ctx: Ctx) {
  const auth = await requireUserSession();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;

  await connectToDb();
  const updated = await Notification.findOneAndUpdate(
    { _id: id, userId: auth.userId },
    { $set: { read: true } },
    { new: true },
  ).lean();
  if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
