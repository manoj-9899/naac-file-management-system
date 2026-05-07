import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectToDb } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";
import type { UserRole } from "@/lib/auth/roles";

type RegisterBody = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  hodInviteCode?: string;
};

function badRequest(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as RegisterBody | null;
  if (!body) return badRequest("Invalid JSON body.");

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").toLowerCase().trim();
  const password = body.password ?? "";
  const role = body.role;

  if (!name) return badRequest("Name is required.");
  if (!email || !email.includes("@")) return badRequest("Valid email is required.");
  if (!password || password.length < 8)
    return badRequest("Password must be at least 8 characters.");
  if (role !== "TEACHER" && role !== "HOD") return badRequest("Invalid role.");

  if (role === "HOD") {
    const expected = process.env.HOD_INVITE_CODE?.trim();
    if (!expected) return badRequest("HOD registrations are disabled.");
    if ((body.hodInviteCode ?? "").trim() !== expected)
      return badRequest("Invalid HOD invite code.");
  }

  await connectToDb();

  const existing = await User.findOne({ email }).lean();
  if (existing) return badRequest("An account with this email already exists.");

  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    name,
    email,
    passwordHash,
    role,
    isActive: true,
    approvalStatus: role === "TEACHER" ? "PENDING" : "APPROVED",
  });

  return NextResponse.json({ ok: true });
}

