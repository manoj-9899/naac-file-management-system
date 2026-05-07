"use client";

import { useEffect, useState } from "react";

type FileRow = {
  id: string;
  displayName: string;
  originalFilename: string;
  mimeType: string;
  uploadStatus: string;
  createdAt?: string;
};

const ALLOWED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
]);

export function EvidencePanel({
  subCriterionId,
  teacherId,
  className = "",
  title = "Uploaded files",
}: {
  subCriterionId: string;
  /** When set (HOD view), download URLs include this teacher id */
  teacherId?: string;
  className?: string;
  title?: string;
}) {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const res = await fetch(
      `/api/teacher/files?subCriterionId=${encodeURIComponent(subCriterionId)}`,
    );
    const json = (await res.json()) as { ok: boolean; files?: FileRow[] };
    setLoading(false);
    if (json.ok && json.files) setFiles(json.files);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-side fetch on mount
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subCriterionId]);

  async function upload(file: File) {
    setMsg(null);
    if (!ALLOWED.has(file.type)) {
      setMsg("Only PDF, DOCX, JPG, PNG are allowed.");
      return;
    }
    const signRes = await fetch("/api/teacher/cloudinary-sign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mimeType: file.type }),
    });
    const sign = (await signRes.json()) as
      | {
          ok: true;
          cloudName: string;
          apiKey: string;
          timestamp: number;
          signature: string;
          folder: string;
        }
      | { ok: false; error?: string };
    if (!sign.ok) {
      setMsg(sign.error ?? "Could not start upload.");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", sign.apiKey);
    fd.append("timestamp", String(sign.timestamp));
    fd.append("signature", sign.signature);
    fd.append("folder", sign.folder);

    const up = await fetch(
      `https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`,
      { method: "POST", body: fd },
    );
    const uploaded = (await up.json()) as {
      public_id?: string;
      bytes?: number;
      resource_type?: string;
      error?: { message?: string };
    };
    if (!uploaded.public_id) {
      setMsg(uploaded.error?.message ?? "Cloudinary upload failed.");
      return;
    }

    const reg = await fetch("/api/teacher/files", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        subCriterionId,
        cloudinaryPublicId: uploaded.public_id,
        resourceType: uploaded.resource_type ?? "auto",
        bytes: uploaded.bytes ?? file.size,
        originalFilename: file.name,
        mimeType: file.type,
        displayName: file.name,
      }),
    });
    if (!reg.ok) {
      setMsg("Saved to Cloudinary but failed to register file in app DB.");
      return;
    }
    setMsg("Uploaded.");
    await refresh();
  }

  async function rename(id: string, displayName: string) {
    await fetch(`/api/teacher/files/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ displayName }),
    });
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this file from Cloudinary and the portal?")) return;
    await fetch(`/api/teacher/files/${encodeURIComponent(id)}`, { method: "DELETE" });
    await refresh();
  }

  async function download(id: string) {
    const qs = teacherId
      ? `?teacherId=${encodeURIComponent(teacherId)}`
      : "";
    const res = await fetch(`/api/files/${encodeURIComponent(id)}/download${qs}`);
    const json = (await res.json()) as { ok?: boolean; url?: string };
    if (!json.ok || !json.url) {
      setMsg("Could not generate download link.");
      return;
    }
    window.open(json.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      className={`space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50">
          Upload
          <input
            type="file"
            accept=".pdf,.doc,.docx,image/png,image/jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void upload(f);
            }}
          />
        </label>
      </div>

      {msg ? <p className="text-sm text-slate-600">{msg}</p> : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading files…</p>
      ) : files.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-6 text-center text-sm text-slate-600">
          No files yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {files.map((f) => (
            <li key={f.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <input
                  className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900"
                  defaultValue={f.displayName}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== f.displayName) void rename(f.id, v);
                  }}
                />
                <p className="text-xs text-slate-500">
                  {f.originalFilename} · {f.mimeType} · {f.uploadStatus}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-blue-700 hover:bg-slate-50"
                  onClick={() => void download(f.id)}
                >
                  View / download
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-red-200 bg-white px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                  onClick={() => void remove(f.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
