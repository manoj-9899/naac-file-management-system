"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { SubCriterionFormDef } from "@/lib/forms/types";
import { EvidenceListReadOnly } from "@/components/naac/EvidenceListReadOnly";

type Snapshot = {
  ok: true;
  teacher: {
    id: string;
    name: string;
    email: string;
    department: string;
    subjects: string[];
    approvalStatus: string;
    isActive: boolean;
  };
  subcriteria: Array<{
    id: string;
    criterionId: string;
    title: string;
    def?: SubCriterionFormDef;
    submission: { items: Record<string, unknown>[]; updatedAt?: string } | null;
    files: Array<{
      id: string;
      displayName: string;
      originalFilename: string;
      mimeType: string;
      uploadStatus: string;
      createdAt?: string;
    }>;
    verification: { status: string; comment: string };
    complete: boolean;
  }>;
};

function formatVal(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default function HodTeacherClient({ teacherId }: { teacherId: string }) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch(`/api/hod/teachers/${encodeURIComponent(teacherId)}/snapshot`);
    const json = (await res.json()) as Snapshot | { ok: false };
    if ("ok" in json && json.ok) setData(json);
    else setData(null);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-side fetch on mount
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const grouped = useMemo(() => {
    if (!data) return [];
    const m = new Map<string, Snapshot["subcriteria"]>();
    for (const s of data.subcriteria) {
      const arr = m.get(s.criterionId) ?? [];
      arr.push(s);
      m.set(s.criterionId, arr);
    }
    return Array.from(m.entries());
  }, [data]);

  async function verify(subCriterionId: string, status: "VERIFIED" | "NEEDS_REVISION" | "PENDING") {
    if (busy) return;
    const comment =
      status === "NEEDS_REVISION"
        ? prompt("Comment for the teacher (required for revision):") ?? ""
        : "";
    if (status === "NEEDS_REVISION" && !comment.trim()) {
      setMsg("Comment is required for revision.");
      return;
    }
    setMsg(null);
    setBusy(`${subCriterionId}:${status}`);
    const res = await fetch("/api/hod/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ teacherId, subCriterionId, status, comment }),
    });
    setMsg(res.ok ? "Updated verification." : "Failed.");
    await refresh();
    setBusy(null);
  }

  if (!data) {
    return (
      <div className="py-8">
        <p className="text-sm text-slate-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-slate-500">
          <Link className="font-medium text-blue-600 hover:underline" href="/hod/teachers">
            Teachers
          </Link>{" "}
          / {data.teacher.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{data.teacher.name}</h1>
        <p className="text-sm text-slate-600">
          {data.teacher.email} · {data.teacher.department || "—"} · {data.teacher.approvalStatus} ·{" "}
          {data.teacher.isActive ? "Active" : "Inactive"}
        </p>
        {data.teacher.subjects?.length ? (
          <p className="text-sm text-slate-600">Subjects: {data.teacher.subjects.join(", ")}</p>
        ) : null}
      </header>

      {msg ? <p className="text-sm text-slate-700">{msg}</p> : null}

      {grouped.map(([criterionId, items]) => (
        <section key={criterionId} className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">{criterionId}</h2>
          <div className="space-y-4">
            {items.map((s) => (
              <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">
                      {s.id} — {s.title}
                    </p>
                      <p className="mt-1 text-xs text-slate-500">
                        HOD status: {s.verification.status}
                        {s.complete ? " · Evidence complete" : " · Incomplete"}
                      </p>
                      {s.verification.comment ? (
                        <p className="mt-2 text-sm text-slate-700">
                          Comment: {s.verification.comment}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {s.verification.status === "VERIFIED" ? (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                          Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="cursor-pointer rounded-md bg-emerald-700 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={Boolean(busy)}
                          onClick={() => void verify(s.id, "VERIFIED")}
                        >
                          Verify
                        </button>
                      )}
                      <button
                        type="button"
                        className="cursor-pointer rounded-md bg-amber-700 px-2 py-1 text-xs font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={Boolean(busy)}
                        onClick={() => void verify(s.id, "NEEDS_REVISION")}
                      >
                        Needs revision
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={Boolean(busy)}
                        onClick={() => void verify(s.id, "PENDING")}
                      >
                        Reset pending
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {!s.def ? (
                      <p className="text-sm text-slate-500">No form definition.</p>
                    ) : !s.submission?.items?.length ? (
                      <p className="text-sm text-slate-500">No saved structured data.</p>
                    ) : (
                      s.submission.items.map((row, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-800"
                        >
                          <p className="mb-2 text-xs font-semibold text-slate-500">Row {idx + 1}</p>
                          <dl className="grid gap-2">
                            {s.def!.fields.map((field) => (
                              <div key={field.key} className="grid gap-1 sm:grid-cols-3">
                                <dt className="text-slate-500">{field.label}</dt>
                                <dd className="sm:col-span-2">{formatVal(row[field.key])}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ))
                    )}

                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-900">Files</p>
                    <EvidenceListReadOnly teacherId={teacherId} files={s.files} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
