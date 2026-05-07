"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";
import { getCriterion } from "@/lib/naac";
import type { CriterionId } from "@/lib/naac/types";

type FileRow = {
  id: string;
  displayName: string;
  originalFilename: string;
  mimeType: string;
  bytes: number;
  uploadStatus: string;
  createdAt?: string;
  criterionId: string;
  subCriterionId: string;
};

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MyFilesPage() {
  const [rows, setRows] = useState<FileRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/teacher/files");
    const json = (await res.json()) as { ok?: boolean; files?: FileRow[] };
    if (json.ok && json.files) setRows(json.files);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.displayName.toLowerCase().includes(s) ||
        r.subCriterionId.toLowerCase().includes(s) ||
        r.criterionId.toLowerCase().includes(s),
    );
  }, [rows, q]);

  async function viewFile(id: string) {
    const res = await fetch(`/api/files/${encodeURIComponent(id)}/download`);
    const json = (await res.json()) as { ok?: boolean; url?: string };
    if (json.ok && json.url) window.open(json.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          Teacher workspace
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">My Files</h1>
        <p className="mt-1 text-sm text-slate-600">
          All evidence documents you&apos;ve uploaded across criteria.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search files…"
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <p className="text-sm text-slate-500">
          For a ZIP of all files, use your system after downloading from each sub-criterion, or
          export Excel from the dashboard.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading files…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No files uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Criterion</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((f) => {
                  const c = getCriterion(f.criterionId as CriterionId);
                  const statusOk =
                    f.uploadStatus === "UPLOADED" || f.uploadStatus === "VERIFIED";
                  return (
                    <tr key={f.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                          <span className="font-medium text-slate-900">{f.displayName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <span className="block text-xs text-slate-500">{f.criterionId}</span>
                        <span className="line-clamp-2">{c?.name ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-600">
                        {formatBytes(f.bytes ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(f.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${statusOk ? "bg-emerald-500" : "bg-slate-400"}`}
                          />
                          <span className={statusOk ? "text-emerald-700" : "text-slate-700"}>
                            {statusOk ? "Submitted" : "In progress"}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => void viewFile(f.id)}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
