import Link from "next/link";
import { getServerSession } from "next-auth";
import { GraduationCap, LogOut, UserPlus, Users } from "lucide-react";
import { authOptions } from "@/lib/auth/nextauth";
import { UNIVERSITY } from "@/lib/site/branding";
import { RoleBadge } from "./RoleBadge";
import { UniversityMark } from "./UniversityMark";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const workspaceHref = role === "HOD" ? "/hod" : role === "TEACHER" ? "/teacher" : null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <UniversityMark />

        <div className="hidden flex-1 flex-col items-center px-4 text-center md:flex">
          <p className="text-sm font-semibold tracking-wide text-slate-800 uppercase">
            {UNIVERSITY.portalTitle}
          </p>
          <p className="text-xs text-slate-500">{UNIVERSITY.tagline}</p>
        </div>

        <nav className="flex flex-wrap items-center justify-end gap-2">
          {role ? (
            <>
              <RoleBadge role={role} />
              {workspaceHref ? (
                <Link
                  href={workspaceHref}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Open workspace
                </Link>
              ) : null}
              <Link
                href="/api/auth/signout"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/sign-in?callbackUrl=%2Fteacher"
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-50"
              >
                <GraduationCap className="h-4 w-4" />
                Teacher login
              </Link>
              <Link
                href="/auth/sign-in?callbackUrl=%2Fhod"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                <Users className="h-4 w-4" />
                HOD login
              </Link>
              <Link
                href="/auth/register"
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 sm:inline-flex"
              >
                <UserPlus className="h-4 w-4" />
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
