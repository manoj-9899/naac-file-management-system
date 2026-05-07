import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/nextauth";
import { connectToDb } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";
import { SubCriterionSubmission } from "@/lib/models/SubCriterionSubmission";
import { EvidenceFile } from "@/lib/models/EvidenceFile";
import { getCriterion, getSubCriterion, getSubCriteriaForCriterion, isCriterionId } from "@/lib/naac";
import { DynamicForm } from "@/components/naac/DynamicForm";
import { EvidencePanel } from "@/components/naac/EvidencePanel";
import { SubCriteriaList } from "@/components/portal/SubCriteriaList";
import { SubCriterionToolbar } from "@/components/portal/SubCriterionToolbar";
import { TipCard } from "@/components/portal/TipCard";
import { criterionSubProgress } from "@/lib/portal/stats";

export default async function SubCriterionEditorPage({
  params,
}: {
  params: Promise<{ criterionId: string; subCriterionId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/sign-in");
  if (session.user.role !== "TEACHER") redirect("/hod");

  const { criterionId, subCriterionId } = await params;
  if (!isCriterionId(criterionId)) notFound();

  const c = getCriterion(criterionId);
  const sub = getSubCriterion(subCriterionId);
  if (!c || !sub || sub.criterionId !== criterionId) notFound();

  await connectToDb();
  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) redirect("/auth/sign-in");
  const userId = String(user._id);

  const subsList = getSubCriteriaForCriterion(criterionId);
  const [submissions, files] = await Promise.all([
    SubCriterionSubmission.find({ userId, criterionId }).lean(),
    EvidenceFile.find({ userId, criterionId }).lean(),
  ]);

  const prog = criterionSubProgress({
    criterionId,
    submissions,
    files,
  });

  const statusLabel =
    prog.percent === 100 ? "Submitted" : prog.percent > 0 ? "In progress" : "Not started";
  const dotClass =
    prog.percent === 100
      ? "bg-emerald-500"
      : prog.percent > 0
        ? "bg-blue-500"
        : "bg-slate-300";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            {c.code} — {c.maxMarks} marks
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{c.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{sub.summary}</p>
        </div>
        <SubCriterionToolbar />
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className={`h-2 w-2 rounded-full ${dotClass}`} />
            <span className="font-medium text-slate-800">{statusLabel}</span>
          </div>
          <span className="text-sm tabular-nums text-slate-600">
            {prog.done}/{prog.total} sub-criteria · {prog.percent}%
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${prog.percent}%` }}
          />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-2">
          <SubCriteriaList criterionId={criterionId} items={subsList} currentId={sub.id} />
        </div>
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-1">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Form · {sub.code}
            </p>
            <div className="rounded-lg bg-white p-1">
              <DynamicForm subCriterionId={sub.id} />
            </div>
          </div>
        </div>
        <div className="space-y-4 lg:col-span-4">
          <EvidencePanel subCriterionId={sub.id} title="Uploaded files" />
          <TipCard />
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        <Link href={`/teacher/criteria/${criterionId}`} className="text-blue-600 hover:underline">
          ← Back to {c.code}
        </Link>
      </p>
    </div>
  );
}
