import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { connectToDb } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";

type ProfileBody = {
  department?: string;
  subjects?: string[];
};

function badRequest(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as ProfileBody | null;
  if (!body) return badRequest("Invalid JSON body.");

  const department = (body.department ?? "").trim();
  const subjects = Array.isArray(body.subjects)
    ? body.subjects.map((s) => String(s).trim()).filter(Boolean)
    : [];

  if (!department) return badRequest("Department is required.");
  if (subjects.length === 0) return badRequest("At least one subject is required.");

  await connectToDb();
  await User.updateOne(
    { email: session.user.email },
    { $set: { department, subjects } },
  );

  // Note: session JWT won't automatically refresh. We'll rely on redirect/sign-in again
  // or a future callback-based refresh in Phase 2+.
  return NextResponse.json({ ok: true });
}

