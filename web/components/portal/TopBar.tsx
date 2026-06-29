"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Home, LogOut, Menu, Search, Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getCriterion } from "@/lib/naac";
import type { CriterionId } from "@/lib/naac/types";
import { RoleBadge } from "@/components/marketing/RoleBadge";
import type { PortalUser } from "./PortalShell";

function titleCase(s: string) {
  return s.replace(/-/g, " ");
}

function buildCrumbs(pathname: string) {
  const parts: { label: string; href?: string }[] = [{ label: "Home", href: "/" }];

  if (pathname === "/teacher") {
    parts.push({ label: "dashboard" });
    return parts;
  }
  if (pathname === "/teacher/files") {
    parts.push({ label: "files" });
    return parts;
  }
  if (pathname.startsWith("/teacher/pending-approval")) {
    parts.push({ label: "pending" });
    return parts;
  }
  if (pathname.startsWith("/teacher/criteria/")) {
    const segs = pathname.split("/").filter(Boolean);
    const cIdx = segs.indexOf("criteria");
    const cid = segs[cIdx + 1];
    const sub = segs[cIdx + 2];
    const c = cid ? getCriterion(cid as CriterionId) : null;
    parts.push({ label: "criteria", href: "/teacher" });
    if (c) parts.push({ label: c.code.toLowerCase(), href: `/teacher/criteria/${c.id}` });
    if (sub) parts.push({ label: sub.toLowerCase() });
    return parts;
  }
  if (pathname === "/hod") {
    parts.push({ label: "hod" });
    return parts;
  }
  if (pathname.startsWith("/hod/audit")) {
    parts.push({ label: "activity" });
    return parts;
  }
  if (pathname.startsWith("/hod/teachers")) {
    const segs = pathname.split("/").filter(Boolean);
    if (segs.length === 2) {
      parts.push({ label: "users" });
    } else {
      parts.push({ label: "users", href: "/hod/teachers" });
      parts.push({ label: "profile" });
    }
    return parts;
  }
  return [{ label: "Home", href: "/" }, { label: titleCase(pathname.split("/").pop() ?? "page") }];
}

export function TopBar({
  user,
  onMenu,
}: {
  user: PortalUser;
  onMenu: () => void;
}) {
  const pathname = usePathname();
  const crumbs = useMemo(() => buildCrumbs(pathname), [pathname]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/notifications");
      const json = (await res.json()) as { ok?: boolean; notifications?: { read: boolean }[] };
      if (cancelled || !json.ok || !json.notifications) return;
      setUnread(json.notifications.filter((n) => !n.read).length);
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 lg:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
          onClick={onMenu}
        >
          <Menu className="h-5 w-5" />
        </button>
        <nav className="flex min-w-0 items-center gap-1 text-sm text-slate-500">
          <Link href={user.role === "HOD" ? "/hod" : "/teacher"} className="shrink-0 text-slate-400 hover:text-slate-600">
            <Home className="h-4 w-4" />
          </Link>
          {crumbs.slice(1).map((c, i) => (
            <span key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1">
              <span className="text-slate-300">/</span>
              {c.href ? (
                <Link href={c.href} className="truncate hover:text-slate-800">
                  {c.label}
                </Link>
              ) : (
                <span className="truncate text-slate-700">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <RoleBadge role={user.role} />
        <div className="relative hidden min-w-[200px] max-w-sm flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search files, criteria…"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-16 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            readOnly
            aria-label="Search (coming soon)"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:inline-block">
            ⌘K
          </kbd>
        </div>
        <Link
          href={user.role === "HOD" ? "/hod" : "/teacher"}
          className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 ? (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          ) : null}
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:inline-flex"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
