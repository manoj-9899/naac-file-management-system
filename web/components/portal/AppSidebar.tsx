"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Activity,
  Award,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileDown,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { NAAC_CRITERIA } from "@/lib/naac";
import { UNIVERSITY } from "@/lib/site/branding";
import { RoleBadge } from "@/components/marketing/RoleBadge";
import type { PortalUser } from "./PortalShell";

function NavLink({
  href,
  active,
  children,
  disabled,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-blue-50 text-blue-800"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </Link>
  );
}

export function AppSidebar({
  user,
  open,
  onClose,
}: {
  user: PortalUser;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [criteriaOpen, setCriteriaOpen] = useState(true);

  const isTeacher = user.role === "TEACHER";
  const isHod = user.role === "HOD";

  const teacherBase = "/teacher";
  const hodBase = "/hod";

  const active = useMemo(() => {
    return {
      dash: pathname === "/teacher",
      files: pathname.startsWith("/teacher/files"),
      exports: pathname.startsWith("/teacher") && pathname.includes("export"),
      criteria: pathname.startsWith("/teacher/criteria"),
      hodDash: pathname === "/hod",
      audit: pathname.startsWith("/hod/audit"),
      users: pathname.startsWith("/hod/teachers"),
    };
  }, [pathname]);

  const initials = user.name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const asideClass =
    "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-200 bg-white shadow-lg transition-transform duration-200 lg:static lg:z-0 lg:shadow-none " +
    (open ? "translate-x-0" : "-translate-x-full lg:translate-x-0");

  return (
    <aside className={asideClass}>
      <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4 lg:hidden">
        <span className="text-sm font-semibold text-slate-800">{UNIVERSITY.shortName}</span>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Close sidebar"
          onClick={onClose}
        >
          <PanelLeftClose className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-6">
        <div className="mb-8 hidden px-2 lg:block">
          <div className="flex items-start gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold leading-tight text-slate-900">{UNIVERSITY.portalTitle}</p>
              <p className="text-xs text-slate-500">{UNIVERSITY.department}</p>
            </div>
          </div>
        </div>

        {isTeacher ? (
          <>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Teacher
            </p>
            <nav className="space-y-0.5">
              <NavLink href={`${teacherBase}`} active={active.dash}>
                <LayoutDashboard className="h-4 w-4 shrink-0 opacity-80" />
                Dashboard
              </NavLink>
              <NavLink href={`${teacherBase}/files`} active={active.files}>
                <FolderOpen className="h-4 w-4 shrink-0 opacity-80" />
                My Files
              </NavLink>
              <NavLink href={`${teacherBase}#exports`} active={false}>
                <FileDown className="h-4 w-4 shrink-0 opacity-80" />
                Exports
              </NavLink>
            </nav>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setCriteriaOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600"
              >
                Criteria
                {criteriaOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {criteriaOpen ? (
                <ul className="mt-1 space-y-0.5 border-l border-slate-200 pl-2">
                  {NAAC_CRITERIA.map((c) => {
                    const href = `${teacherBase}/criteria/${c.id}`;
                    const on = pathname.startsWith(href);
                    return (
                      <li key={c.id}>
                        <Link
                          href={href}
                          className={`block rounded-md py-1.5 pl-2 pr-2 text-sm ${
                            on
                              ? "bg-blue-50 font-medium text-blue-800"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-slate-500">{c.code}</span>{" "}
                          <span className="line-clamp-1">{c.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </>
        ) : null}

        {isHod ? (
          <>
            <p className="mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              HOD
            </p>
            <nav className="space-y-0.5">
              <NavLink href={hodBase} active={active.hodDash}>
                <Award className="h-4 w-4 shrink-0 opacity-80" />
                HOD Dashboard
              </NavLink>
              <NavLink href={`${hodBase}/audit`} active={active.audit}>
                <Activity className="h-4 w-4 shrink-0 opacity-80" />
                Activity Log
              </NavLink>
              <NavLink href={`${hodBase}/teachers`} active={active.users}>
                <Users className="h-4 w-4 shrink-0 opacity-80" />
                Users
              </NavLink>
            </nav>
          </>
        ) : null}

        {isTeacher && !isHod ? (
          <>
            <p className="mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              HOD
            </p>
            <div className="space-y-0.5 opacity-60">
              <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500">
                <Award className="h-4 w-4" />
                HOD Dashboard
              </span>
              <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500">
                <Activity className="h-4 w-4" />
                Activity Log
              </span>
              <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500">
                <Users className="h-4 w-4" />
                Users
              </span>
            </div>
            <p className="mt-2 px-2 text-[10px] leading-snug text-slate-400">
              HOD tools are visible after signing in with an HOD account.
            </p>
          </>
        ) : null}

        {isHod && !isTeacher ? (
          <>
            <p className="mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Resources
            </p>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <BookOpen className="h-4 w-4 shrink-0 opacity-80" />
              Public criteria catalog
            </Link>
          </>
        ) : null}
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="mb-3 flex justify-center lg:justify-start">
          <RoleBadge role={user.role} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
