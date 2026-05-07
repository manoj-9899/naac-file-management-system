import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/nextauth";
import type { UserRole } from "@/lib/auth/roles";
import { connectToDb } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";
import type { Session } from "next-auth";

export type AuthedSession = Session & {
  user: NonNullable<Session["user"]> & { id?: string };
};

export async function getSessionOrNull(): Promise<AuthedSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return session as AuthedSession;
}

export async function requireSession(): Promise<
  { session: AuthedSession } | { error: NextResponse }
> {
  const session = await getSessionOrNull();
  if (!session) {
    return {
      error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session };
}

export async function requireRole(
  role: UserRole,
): Promise<{ session: AuthedSession; userId: string } | { error: NextResponse }> {
  const r = await requireSession();
  if ("error" in r) return r;
  if (r.session.user.role !== role) {
    return {
      error: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }),
    };
  }
  const userId = await resolveUserId(r.session);
  if (!userId) {
    return {
      error: NextResponse.json({ ok: false, error: "User not found" }, { status: 401 }),
    };
  }
  return { session: r.session, userId };
}

export async function requireTeacher(): Promise<
  { session: AuthedSession; userId: string } | { error: NextResponse }
> {
  const r = await requireRole("TEACHER");
  if ("error" in r) return r;
  await connectToDb();
  const u = await User.findById(r.userId).lean();
  if (!u?.isActive) {
    return {
      error: NextResponse.json({ ok: false, error: "Account inactive" }, { status: 403 }),
    };
  }
  if (u.approvalStatus === "PENDING") {
    return {
      error: NextResponse.json(
        { ok: false, error: "Awaiting HOD approval" },
        { status: 403 },
      ),
    };
  }
  return r;
}

export async function requireHod(): Promise<
  { session: AuthedSession; userId: string } | { error: NextResponse }
> {
  return requireRole("HOD");
}

/** Teacher may only access own `teacherId`; HOD may access any. */
export async function requireTeacherOrHodView(
  teacherId: string,
): Promise<{ session: AuthedSession; viewerId: string; isHod: boolean } | { error: NextResponse }> {
  const r = await requireSession();
  if ("error" in r) return r;
  const viewerId = await resolveUserId(r.session);
  if (!viewerId) {
    return {
      error: NextResponse.json({ ok: false, error: "User not found" }, { status: 401 }),
    };
  }
  if (r.session.user.role === "HOD") {
    return { session: r.session, viewerId, isHod: true };
  }
  if (r.session.user.role === "TEACHER" && viewerId === teacherId) {
    return { session: r.session, viewerId, isHod: false };
  }
  return {
    error: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }),
  };
}

export async function getMongoUserIdForSession(
  session: AuthedSession,
): Promise<string | null> {
  await connectToDb();
  const u = await User.findOne({ email: session.user.email }).select({ _id: 1 }).lean();
  return u?._id ? String(u._id) : null;
}

export async function requireUserSession(): Promise<
  { session: AuthedSession; userId: string } | { error: NextResponse }
> {
  const r = await requireSession();
  if ("error" in r) return r;
  const userId = await getMongoUserIdForSession(r.session);
  if (!userId) {
    return {
      error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session: r.session, userId };
}

async function resolveUserId(session: AuthedSession): Promise<string | null> {
  return getMongoUserIdForSession(session);
}
