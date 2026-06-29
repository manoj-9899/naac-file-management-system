import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  FolderLock,
  GraduationCap,
  Layers,
  ShieldCheck,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { authOptions } from "@/lib/auth/nextauth";
import { NAAC_CRITERIA, NAAC_SUB_CRITERIA } from "@/lib/naac";
import { UNIVERSITY } from "@/lib/site/branding";

const VALUE_PROPS = [
  {
    icon: FolderLock,
    title: "Centralized",
    description: "All NAAC documents and evidence in one secure department portal.",
  },
  {
    icon: Users,
    title: "Role-based",
    description: "Separate teacher and HOD workspaces with approvals and verification.",
  },
  {
    icon: FileSpreadsheet,
    title: "Smart reports",
    description: "Export PDF and Excel packs for individuals and the whole department.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & reliable",
    description: "Authenticated access, audit trail, and cloud-backed file storage.",
  },
] as const;

const TEACHER_POINTS = [
  "Fill sub-criteria forms with autosave",
  "Upload supporting documents (PDF, Word, images)",
  "Track progress and notifications",
  "Export your personal PDF and Excel reports",
] as const;

const HOD_POINTS = [
  "Approve and manage teacher accounts",
  "Verify sub-criteria submissions",
  "Monitor department-wide progress",
  "Download consolidated department Excel",
] as const;

const CAPABILITIES = [
  {
    icon: Layers,
    title: `${NAAC_CRITERIA.length} criteria`,
    description: "Aligned with the NAAC framework for systematic documentation.",
  },
  {
    icon: ClipboardList,
    title: `${NAAC_SUB_CRITERIA.length} sub-criteria`,
    description: "Structured forms for every required submission point.",
  },
  {
    icon: FileSpreadsheet,
    title: "PDF & Excel export",
    description: "One-click exports for teachers and consolidated HOD workbooks.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Stay informed about reminders, deadlines, and department updates.",
  },
  {
    icon: CheckCircle2,
    title: "Audit trail",
    description: "Complete activity log for transparency and accountability.",
  },
] as const;

export default async function Home() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const isTeacher = role === "TEACHER";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="border-b border-slate-200 bg-linear-to-b from-blue-50/80 to-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
            <div>
              {role ? (
                <p
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    isTeacher
                      ? "bg-blue-100 text-blue-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {isTeacher ? (
                    <GraduationCap className="h-3.5 w-3.5" />
                  ) : (
                    <Users className="h-3.5 w-3.5" />
                  )}
                  Signed in · {isTeacher ? "Teacher" : "HOD"} portal
                </p>
              ) : (
                <p className="text-sm font-medium text-blue-700">{UNIVERSITY.department}</p>
              )}

              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
                One portal for complete{" "}
                <span className="text-blue-700">NAAC documentation</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                {UNIVERSITY.name} — a unified platform for {UNIVERSITY.department} to manage
                criterion evidence, teacher submissions, HOD verification, and accreditation
                exports.
              </p>

              {role ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={isTeacher ? "/teacher" : "/hod"}
                    className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white ${
                      isTeacher ? "bg-blue-700 hover:bg-blue-800" : "bg-emerald-700 hover:bg-emerald-800"
                    }`}
                  >
                    Go to {isTeacher ? "teacher" : "HOD"} workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/api/auth/signout"
                    className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Log out
                  </Link>
                </div>
              ) : (
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/auth/sign-in?callbackUrl=%2Fteacher"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Teacher login
                  </Link>
                  <Link
                    href="/auth/sign-in?callbackUrl=%2Fhod"
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-50"
                  >
                    <Users className="h-4 w-4" />
                    HOD login
                  </Link>
                </div>
              )}

              <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                {VALUE_PROPS.map((v) => (
                  <li key={v.title} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      <v.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{v.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                        {v.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* UI preview — decorative, not live stats */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-blue-900/10 ring-1 ring-slate-100">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Sample workspace preview
                </div>
                <Image
                  src="/dbatu-logo.png"
                  alt=""
                  width={400}
                  height={200}
                  className="mx-auto max-h-32 w-auto object-contain p-6 opacity-90"
                  aria-hidden
                />
                <div className="space-y-3 px-4 pb-5">
                  <div className="h-3 rounded-full bg-slate-100" />
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-14 rounded-lg bg-blue-50" />
                    ))}
                  </div>
                  <div className="h-24 rounded-lg bg-linear-to-r from-blue-100 to-slate-100" />
                  <p className="text-center text-xs text-slate-400">
                    Forms · uploads · verification · exports
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Choose portal — hidden when already signed in as that role */}
        {!role ? (
          <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-slate-900">Choose your portal</h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-600">
              Sign in with your department account. New users must register first.
            </p>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <article className="flex flex-col rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">Teacher portal</h3>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
                  {TEACHER_POINTS.map((p) => (
                    <li key={p} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/sign-in?callbackUrl=%2Fteacher"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Teacher login
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>

              <article className="flex flex-col rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">HOD portal</h3>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
                  {HOD_POINTS.map((p) => (
                    <li key={p} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/sign-in?callbackUrl=%2Fhod"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                  HOD login
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            </div>
            <p className="mt-6 text-center text-sm text-slate-500">
              First time?{" "}
              <Link href="/auth/register" className="font-medium text-blue-700 hover:underline">
                Register an account
              </Link>
            </p>
          </section>
        ) : null}

        {/* Capabilities */}
        <section className="border-t border-slate-200 bg-white py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-slate-900">Everything you need</h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-600">
              Built for daily use by {UNIVERSITY.department} — from data entry to department-wide
              export.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {CAPABILITIES.map((c) => (
                <div
                  key={c.title}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-center"
                >
                  <c.icon className="mx-auto h-6 w-6 text-blue-600" />
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">{c.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-900 py-8 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <div>
            <p className="font-semibold">{UNIVERSITY.shortName}</p>
            <p className="mt-1 text-sm text-slate-400">
              Established {UNIVERSITY.established} · {UNIVERSITY.department}
            </p>
          </div>
          <p className="text-sm text-slate-400">
            Built for departments. Designed for accreditation excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}
