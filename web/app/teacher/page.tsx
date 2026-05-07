import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  Download,
  GraduationCap,
  HeartHandshake,
  Layers,
  Microscope,
  Upload,
  Users,
} from "lucide-react";
import { authOptions } from "@/lib/auth/nextauth";
import { connectToDb } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";
import { SubCriterionSubmission } from "@/lib/models/SubCriterionSubmission";
import { EvidenceFile } from "@/lib/models/EvidenceFile";
import { NAAC_CRITERIA, NAAC_SUB_CRITERIA } from "@/lib/naac";
import {
  criterionCompletionPercent,
  criterionBreakdown,
  overallCompletionPercent,
} from "@/lib/forms/progress";
import { ProgressChart } from "@/components/naac/ProgressChart";
import { NotificationsPanel } from "@/components/naac/NotificationsPanel";
import { CompletionDonut } from "@/components/teacher/CompletionDonut";
import {
  completedSubCriteriaCount,
  pendingByCriterion,
  pendingItemsTotal,
  criterionSubProgress,
} from "@/lib/portal/stats";

const criterionIcon = (id: string) => {
  const map: Record<string, ReactNode> = {
    C1: <BookOpen className="h-5 w-5" />,
    C2: <GraduationCap className="h-5 w-5" />,
    C3: <Microscope className="h-5 w-5" />,
    C4: <Building2 className="h-5 w-5" />,
    C5: <Users className="h-5 w-5" />,
    C6: <BarChart3 className="h-5 w-5" />,
    C7: <HeartHandshake className="h-5 w-5" />,
  };
  return map[id] ?? <Layers className="h-5 w-5" />;
};

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/sign-in");
  if (session.user.role !== "TEACHER") redirect("/hod");

  await connectToDb();
  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) redirect("/auth/sign-in");
  const userId = String(user._id);

  const [submissions, files] = await Promise.all([
    SubCriterionSubmission.find({ userId }).lean(),
    EvidenceFile.find({ userId }).lean(),
  ]);

  const overall = overallCompletionPercent({ submissions, files });
  const rows = criterionBreakdown({ submissions, files });
  const doneSubs = completedSubCriteriaCount({ submissions, files });
  const totalSubs = NAAC_SUB_CRITERIA.length;
  const pendingTotal = pendingItemsTotal({ submissions, files });
  const quickPending = pendingByCriterion({ submissions, files }).slice(0, 4);

  const criteriaAt100 = NAAC_CRITERIA.filter(
    (c) =>
      criterionCompletionPercent({ criterionId: c.id, submissions, files }) === 100,
  ).length;

  const firstName = (session.user.name ?? "there").split(/\s+/)[0] ?? "there";

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Teacher workspace
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track your NAAC submissions across all 7 criteria. Autosave is on when you edit forms.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/export/teacher/excel"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export my data
          </a>
          <Link
            href="/teacher/criteria/C1"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" />
            Continue uploading
          </Link>
        </div>
      </header>

      <NotificationsPanel />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-blue-600 p-5 text-white shadow-sm">
          <p className="text-sm font-medium text-blue-100">Overall completion</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{overall}%</p>
          <p className="mt-1 text-sm text-blue-100">
            {doneSubs} of {totalSubs} sub-criteria
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Submitted criteria</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {criteriaAt100} / {NAAC_CRITERIA.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Criteria at 100% completion</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Pending items</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{pendingTotal}</p>
          <p className="mt-1 text-xs text-slate-500">Incomplete sub-criteria</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Submission snapshot</p>
          <div className="mt-2 flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-amber-500" />
            <div>
              <p className="text-lg font-bold text-slate-900">—</p>
              <p className="text-xs text-slate-500">Set your internal deadline in department</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">NAAC criteria</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {NAAC_CRITERIA.map((c) => {
                const pct = criterionCompletionPercent({
                  criterionId: c.id,
                  submissions,
                  files,
                });
                const br = criterionSubProgress({
                  criterionId: c.id,
                  submissions,
                  files,
                });
                const status =
                  pct === 100 ? "Submitted" : pct > 0 ? "In progress" : "Not started";
                const dot =
                  pct === 100
                    ? "bg-emerald-500"
                    : pct > 0
                      ? "bg-blue-500"
                      : "bg-slate-300";
                return (
                  <Link
                    key={c.id}
                    href={`/teacher/criteria/${c.id}`}
                    className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-blue-600">
                          {criterionIcon(c.id)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-500">
                            {c.code} · {c.maxMarks} marks
                          </p>
                          <p className="mt-0.5 font-semibold text-slate-900">{c.name}</p>
                          <p className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                            <span className={`h-2 w-2 rounded-full ${dot}`} />
                            {status}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:text-blue-600" />
                    </div>
                    <div className="mt-4">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-2 text-right text-xs tabular-nums text-slate-500">
                        {br.done}/{br.total} sub-criteria
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Progress by criterion</h2>
            <ProgressChart rows={rows} />
          </section>

          <section id="exports" className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Exports</h2>
            <p className="mt-1 text-sm text-slate-600">
              Download your NAAC pack as PDF or Excel (per competition guide structure).
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                href="/api/export/teacher/pdf"
              >
                Download PDF
              </a>
              <a
                className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                href="/api/export/teacher/excel"
              >
                Download Excel
              </a>
              <Link
                className="inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                href="/"
              >
                Criteria catalog
              </Link>
              <Link
                className="inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                href="/api/auth/signout"
              >
                Sign out
              </Link>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-center text-sm font-semibold text-slate-900">Department snapshot</h3>
            <CompletionDonut percent={overall} />
            <p className="mt-2 text-center text-sm text-slate-600">
              {doneSubs} of {totalSubs} required sub-criteria complete
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Quick actions</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {quickPending.length === 0 ? (
                <li className="text-slate-500">You&apos;re all caught up.</li>
              ) : (
                quickPending.map((q) => (
                  <li key={q.criterionId} className="flex justify-between gap-2">
                    <Link
                      href={`/teacher/criteria/${q.criterionId}`}
                      className="min-w-0 flex-1 truncate font-medium text-blue-700 hover:underline"
                    >
                      {q.criterionId} {q.name}
                    </Link>
                    <span className="shrink-0 tabular-nums text-slate-500">{q.pending} pending</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
