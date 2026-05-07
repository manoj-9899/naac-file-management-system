import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db/mongoose";
import { requireHod } from "@/lib/auth/api";
import { User } from "@/lib/models/User";
import { logActivity } from "@/lib/audit/log";

type Ctx = { params: Promise<{ teacherId: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const auth = await requireHod();
  if ("error" in auth) return auth.error;
  const { teacherId } = await ctx.params;

  await connectToDb();
  const updated = await User.findOneAndUpdate(
    { _id: teacherId, role: "TEACHER" },
    { $set: { isActive: false } },
    { new: true },
  ).lean();
  if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  await logActivity({
    actorId: auth.userId,
    action: "TEACHER_DEACTIVATE",
    entityType: "User",
    entityId: teacherId,
  });

  return NextResponse.json({ ok: true });
}
