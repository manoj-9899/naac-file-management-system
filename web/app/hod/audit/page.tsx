"use client";

import {
  FileUp,
  Pencil,
  Send,
  Lock,
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";

type LogRow = {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  const s = Math.round((Date.now() - then) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 14) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function iconFor(action: string) {
  if (action.includes("UPLOAD") || action === "FILE_UPLOAD")
    return <FileUp className="h-4 w-4 text-blue-600" />;
  if (action.includes("VERIFY") || action.includes("REVISION"))
    return <Pencil className="h-4 w-4 text-blue-600" />;
  if (action.includes("REMIND") || action.includes("NOTIFY"))
    return <Send className="h-4 w-4 text-blue-600" />;
  if (action.includes("LOCK")) return <Lock className="h-4 w-4 text-blue-600" />;
  return <Activity className="h-4 w-4 text-blue-600" />;
}

function describe(r: LogRow) {
  const meta = r.metadata ?? {};
  const sub = typeof meta?.subCriterionId === "string" ? meta.subCriterionId : null;
  return {
    line: (
      <>
        User <span className="font-semibold text-slate-900">…{r.actorId.slice(-6)}</span>{" "}
        <span className="lowercase">{r.action.replace(/_/g, " ")}</span>
        {sub ? (
          <>
            {" "}
            <span className="font-semibold text-slate-900">{sub}</span>
          </>
        ) : null}
      </>
    ),
    sub,
  };
}

export default function AuditPage() {
  const [rows, setRows] = useState<LogRow[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/audit?limit=250");
      const json = (await res.json()) as { ok?: boolean; logs?: LogRow[] };
      if (json.ok && json.logs) setRows(json.logs);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          HOD · Super user
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Activity Log</h1>
        <p className="mt-1 text-sm text-slate-600">
          A complete audit trail of actions across the department.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((r) => {
              const { line, sub } = describe(r);
              return (
                <li key={r.id} className="flex gap-4 px-4 py-4 sm:px-6">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                    {iconFor(r.action)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-800">{line}</p>
                    {sub ? (
                      <p className="mt-1 text-xs text-slate-500">Criterion: {sub.split(".")[0]}</p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">
                        {r.entityType}:{r.entityId}
                      </p>
                    )}
                  </div>
                  <time className="shrink-0 text-xs text-slate-500">{timeAgo(r.createdAt)}</time>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
