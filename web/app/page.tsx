import {
  NAAC_CRITERIA,
  NAAC_SUB_CRITERIA,
  getSubCriteriaForCriterion,
} from "@/lib/naac";
import Link from "next/link";
import { ArrowRight, BookOpen, LogIn, UserPlus } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--portal-canvas)] text-slate-900">
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            NAAC File Management System
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Departmental NAAC documentation portal
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Central criterion catalog ({NAAC_CRITERIA.length} criteria, {NAAC_SUB_CRITERIA.length}{" "}
            sub-criteria), teacher forms and evidence uploads, HOD verification, and PDF/Excel
            exports — aligned to the project guide.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              href="/auth/sign-in"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
              href="/auth/register"
            >
              <UserPlus className="h-4 w-4" />
              Register
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
              href="/teacher"
            >
              Teacher workspace <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
              href="/hod"
            >
              HOD workspace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Note: Workspaces will redirect to sign-in if you aren&apos;t authenticated.
          </p>
        </header>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Criteria overview</h2>
            <span className="text-sm text-slate-500 tabular-nums">
              {NAAC_CRITERIA.length} criteria · {NAAC_SUB_CRITERIA.length} sub-criteria
            </span>
          </div>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {NAAC_CRITERIA.map((c) => {
              const subs = getSubCriteriaForCriterion(c.id);
              return (
                <li key={c.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-blue-600">
                        <BookOpen className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {c.code} — {c.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {c.maxMarks} marks · {subs.length} sub-criteria
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/teacher/criteria/${c.id}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Open <ArrowRight className="inline h-4 w-4" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
