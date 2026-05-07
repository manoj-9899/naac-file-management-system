"use client";

import { useState } from "react";

type FileRow = {
  id: string;
  displayName: string;
  originalFilename: string;
  mimeType: string;
  uploadStatus: string;
};

export function EvidenceListReadOnly({
  teacherId,
  files,
}: {
  teacherId: string;
  files: FileRow[];
}) {
  const [msg, setMsg] = useState<string | null>(null);

  async function download(id: string) {
    setMsg(null);
    const res = await fetch(
      `/api/files/${encodeURIComponent(id)}/download?teacherId=${encodeURIComponent(teacherId)}`,
    );
    const json = (await res.json().catch(() => null)) as
      | { ok?: boolean; url?: string; error?: string }
      | null;
    if (!res.ok || !json?.ok || !json.url) {
      setMsg(json?.error ?? `Download failed (${res.status}).`);
      return;
    }
    const w = window.open(json.url, "_blank", "noopener,noreferrer");
    if (!w) window.location.assign(json.url);
  }

  if (!files.length) return <p className="text-sm text-slate-500">No files.</p>;

  return (
    <div className="space-y-2">
      {msg ? <p className="text-xs text-red-700">{msg}</p> : null}
      <ul className="divide-y divide-slate-100">
        {files.map((f) => (
          <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
            <div>
              <p className="text-sm font-medium text-slate-900">{f.displayName}</p>
              <p className="text-xs text-slate-500">
                {f.originalFilename} · {f.uploadStatus}
              </p>
            </div>
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-blue-700 shadow-sm hover:bg-slate-50"
              onClick={() => void download(f.id)}
            >
              Download
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
