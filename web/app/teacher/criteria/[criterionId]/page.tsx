import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { authOptions } from "@/lib/auth/nextauth";
import { connectToDb } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";
import { SubCriterionSubmission } from "@/lib/models/SubCriterionSubmission";
import { EvidenceFile } from "@/lib/models/EvidenceFile";
import {
  getCriterion,
  getSubCriteriaForCriterion,
  isCriterionId,
} from "@/lib/naac";
import { isSubCriterionComplete } from "@/lib/forms/progress";
import { getFormDef } from "@/lib/forms/definitions";
import { criterionSubProgress } from "@/lib/portal/stats";

export default async function CriterionHubPage({
  params,
}: {
  params: Promise<{ criterionId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/sign-in");
  if (session.user.role !== "TEACHER") redirect("/hod");

  const { criterionId } = await params;
  if (!isCriterionId(criterionId)) notFound();

  const c = getCriterion(criterionId);
  if (!c) notFound();

  await connectToDb();
  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) redirect("/auth/sign-in");
  const userId = String(user._id);

  const subs = getSubCriteriaForCriterion(criterionId);
  const [submissions, files] = await Promise.all([
    SubCriterionSubmission.find({ userId, criterionId }).lean(),
    EvidenceFile.find({ userId, criterionId }).lean(),
  ]);

  const subById = new Map(submissions.map((s) => [s.subCriterionId, s]));
  const filesBySub = new Map<string, typeof files>();
  for (const f of files) {
    const arr = filesBySub.get(f.subCriterionId) ?? [];
    arr.push(f);
    filesBySub.set(f.subCriterionId, arr);
  }

  const prog = criterionSubProgress({ criterionId, submissions, files });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{c.code}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{c.name}</h1>
        <p className="mt-1 text-sm text-slate-600">{c.maxMarks} marks · departmental NAAC cycle</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-medium text-slate-800">Criterion progress</span>
          <span className="tabular-nums text-slate-600">
            {prog.done}/{prog.total} sub-criteria · {prog.percent}%
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${prog.percent}%` }}
          />
        </div>
      </section>

      <ul className="space-y-2">
        {subs.map((s) => {
          const def = getFormDef(s.id);
          const sub = subById.get(s.id);
          const fl = filesBySub.get(s.id) ?? [];
          const complete = def
            ? isSubCriterionComplete({
                subCriterionId: s.id,
                submission: sub ?? null,
                files: fl,
              })
            : false;
          return (
            <li key={s.id}>
              <Link
                href={`/teacher/criteria/${criterionId}/${encodeURIComponent(s.id)}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    {s.code} {s.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{s.summary}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={
                      complete
                        ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800"
                        : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                    }
                  >
                    {complete ? "Complete" : "Pending"}
                  </span>
                  <ArrowRight className="h-5 w-5 text-slate-300" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
