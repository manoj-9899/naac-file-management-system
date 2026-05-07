import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Download,
  Eye,
  GraduationCap,
  HeartHandshake,
  Layers,
  Lock,
  Microscope,
  Users,
  Users as UsersIcon,
} from "lucide-react";
import { authOptions } from "@/lib/auth/nextauth";
import { getDepartmentStats } from "@/lib/hod/department-stats";
import { formatRelativeTime } from "@/lib/portal/time";

const critIcon = (id: string) => {
  const map: Record<string, ReactNode> = {
    C1: <BookOpen className="h-4 w-4 text-blue-600" />,
    C2: <GraduationCap className="h-4 w-4 text-blue-600" />,
    C3: <Microscope className="h-4 w-4 text-blue-600" />,
    C4: <Building2 className="h-4 w-4 text-blue-600" />,
    C5: <UsersIcon className="h-4 w-4 text-blue-600" />,
    C6: <BarChart3 className="h-4 w-4 text-blue-600" />,
    C7: <HeartHandshake className="h-4 w-4 text-blue-600" />,
  };
  return map[id] ?? <Layers className="h-4 w-4 text-blue-600" />;
};

export default async function HodDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/sign-in");
  if (session.user.role !== "HOD") redirect("/teacher");

  const stats = await getDepartmentStats();
  const dept =
    process.env.NEXT_PUBLIC_PORTAL_DEPARTMENT ?? "Computer Engineering · NAAC submission cycle";

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            HOD · Super user
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Department overview
          </h1>
          <p className="mt-1 text-sm text-slate-600">{dept}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/hod/teachers"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
          >
            <Bell className="h-4 w-4" />
            Send reminders
          </Link>
          <a
            href="/api/hod/export/consolidated"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Download all (consolidated)
          </a>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Teachers</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.teacherCount}</p>
          <p className="mt-1 text-xs text-slate-500">Active in cycle</p>
        </div>
        <div className="rounded-xl bg-blue-600 p-5 text-white shadow-sm">
          <p className="text-sm font-medium text-blue-100">Avg. progress</p>
          <p className="mt-2 text-3xl font-bold">{stats.averageProgress}%</p>
          <p className="mt-1 text-xs text-blue-100">Across department</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Fully submitted</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {stats.fullySubmitted}/{stats.teacherCount || 1}
          </p>
          <p className="mt-1 text-xs text-slate-500">Teachers at 100%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Pending items</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.pendingWorkItems}</p>
          <p className="mt-1 text-xs text-slate-500">Incomplete sub-criteria (total)</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Per-criterion completion</h2>
          <ul className="mt-4 space-y-4">
            {stats.criteria.map((c) => (
              <li key={c.id} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50">
                  {critIcon(c.id)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium text-slate-800">
                      {c.id} {c.name}
                    </span>
                    <span className="shrink-0 tabular-nums text-slate-500">{c.percent}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Submission funnel</h2>
          <ul className="mt-6 space-y-4 text-sm">
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                Started
              </span>
              <span className="font-semibold tabular-nums text-slate-900">
                {stats.funnel.started}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                In progress
              </span>
              <span className="font-semibold tabular-nums text-slate-900">
                {stats.funnel.inProgress}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Submitted
              </span>
              <span className="font-semibold tabular-nums text-slate-900">
                {stats.funnel.submitted}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Teachers</h2>
          <span className="text-sm text-slate-500">{stats.teacherCount} members</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Teacher</th>
                <th className="px-6 py-3">Progress</th>
                <th className="px-6 py-3">Pending</th>
                <th className="px-6 py-3">Last activity</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.teachers.map((t) => {
                const pendingHint =
                  t.completionPercent >= 100 ? (
                    <span className="text-emerald-600">All clear</span>
                  ) : (
                    <span className="tabular-nums text-slate-700">{100 - t.completionPercent}%</span>
                  );
                return (
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                          {t.name
                            .split(/\s+/)
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{t.name}</p>
                          <p className="text-xs text-slate-500">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-xs px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${t.completionPercent}%` }}
                          />
                        </div>
                        <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-slate-700">
                          {t.completionPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{pendingHint}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatRelativeTime(t.lastActivityAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/hod/teachers/${encodeURIComponent(t.id)}`}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          className="rounded-lg p-2 text-slate-300"
                          title="Lock (not configured)"
                          disabled
                        >
                          <Lock className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {stats.teachers.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            No teachers registered yet.
          </p>
        ) : null}
      </section>

      <section className="flex flex-wrap gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
        <Users className="h-10 w-10 text-blue-600" />
        <div>
          <h3 className="font-semibold text-slate-900">Need more detail?</h3>
          <p className="mt-1 text-sm text-slate-600">
            Open a teacher to verify sub-criteria, send reminders, and review uploads.
          </p>
          <Link
            href="/hod/teachers"
            className="mt-3 inline-flex text-sm font-medium text-blue-600 hover:underline"
          >
            Go to Users →
          </Link>
        </div>
      </section>
    </div>
  );
}
