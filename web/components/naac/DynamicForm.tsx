"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SubCriterionFormDef } from "@/lib/forms/types";

type SaveStateEventDetail = {
  saving: boolean;
  ok?: boolean;
  message?: string;
  at?: number;
  mode?: "save" | "submit";
};

function emptyRow(def: SubCriterionFormDef): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const f of def.fields) {
    if (f.type === "multiselect") row[f.key] = [];
    else if (f.type === "number" || f.type === "decimal") row[f.key] = "";
    else row[f.key] = "";
  }
  return row;
}

export function DynamicForm({
  subCriterionId,
  className = "",
}: {
  subCriterionId: string;
  className?: string;
}) {
  const [def, setDef] = useState<SubCriterionFormDef | null>(null);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [verification, setVerification] = useState<{
    status: string;
    comment: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const canAddRows = useMemo(() => Boolean(def?.allowMultiple), [def]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetch(
        `/api/teacher/submissions/${encodeURIComponent(subCriterionId)}`,
      );
      const json = (await res.json()) as
        | {
            ok: true;
            def: SubCriterionFormDef;
            submission: { items: Record<string, unknown>[] } | null;
            verification: { status: string; comment: string };
          }
        | { ok: false };
      if (cancelled) return;
      if (!("ok" in json) || json.ok === false || !json.def) {
        setDef(null);
        setLoading(false);
        return;
      }
      setDef(json.def);
      setVerification(json.verification);
      if (json.submission?.items?.length) {
        setItems(json.submission.items);
      } else {
        setItems([emptyRow(json.def)]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [subCriterionId]);

  function updateItem(idx: number, key: string, value: unknown) {
    setItems((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    );
  }

  function toggleMulti(idx: number, key: string, option: string, checked: boolean) {
    setItems((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const cur = Array.isArray(row[key]) ? [...(row[key] as string[])] : [];
        if (checked) {
          if (!cur.includes(option)) cur.push(option);
        } else {
          const j = cur.indexOf(option);
          if (j >= 0) cur.splice(j, 1);
        }
        return { ...row, [key]: cur };
      }),
    );
  }

  const save = useCallback(async (mode: "save" | "submit" = "save") => {
    if (saving) return;
    setMsg(null);
    setSaving(true);
    window.dispatchEvent(
      new CustomEvent<SaveStateEventDetail>("naac-form-save-state", {
        detail: { saving: true, mode, at: Date.now() },
      }),
    );

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);

    let ok = false;
    let message = "";
    try {
      const res = await fetch(
        `/api/teacher/submissions/${encodeURIComponent(subCriterionId)}`,
        {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ items }),
          signal: controller.signal,
        },
      );
      ok = res.ok;
      if (res.ok) {
        message = mode === "submit" ? "Submitted (saved)." : "Saved successfully.";
      } else if (res.status === 400) {
        message = "Save failed — check required fields.";
      } else {
        message = "Save failed — try again.";
      }
    } catch (e) {
      // Retry once on transient network failures/timeouts.
      try {
        const res2 = await fetch(
          `/api/teacher/submissions/${encodeURIComponent(subCriterionId)}`,
          {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ items }),
          },
        );
        ok = res2.ok;
        message = res2.ok
          ? mode === "submit"
            ? "Submitted (saved)."
            : "Saved successfully."
          : "Save failed — try again.";
      } catch {
        ok = false;
        message = (e as Error)?.name === "AbortError" ? "Save timed out — try again." : "Save failed — try again.";
      }
    } finally {
      window.clearTimeout(timeout);
      setSaving(false);
    }

    setMsg(message);
    window.dispatchEvent(
      new CustomEvent<SaveStateEventDetail>("naac-form-save-state", {
        detail: { saving: false, ok, message, mode, at: Date.now() },
      }),
    );
  }, [items, saving, subCriterionId]);

  useEffect(() => {
    const onExternalSave = (e: Event) => {
      const ce = e as CustomEvent<SaveStateEventDetail>;
      void save(ce.detail?.mode ?? "save");
    };
    const onExternalSubmit = () => {
      void save("submit");
    };
    window.addEventListener("naac-form-save", onExternalSave);
    window.addEventListener("naac-form-submit", onExternalSubmit);
    return () => {
      window.removeEventListener("naac-form-save", onExternalSave);
      window.removeEventListener("naac-form-submit", onExternalSubmit);
    };
  }, [save]);

  async function clearAll() {
    if (!confirm("Delete saved data for this sub-criterion?")) return;
    const res = await fetch(
      `/api/teacher/submissions/${encodeURIComponent(subCriterionId)}`,
      { method: "DELETE" },
    );
    if (res.ok && def) {
      setItems([emptyRow(def)]);
      setMsg("Deleted.");
    } else {
      setMsg("Delete failed.");
    }
  }

  if (loading) return <p className="text-sm text-zinc-500">Loading form…</p>;
  if (!def) return <p className="text-sm text-red-600">Unable to load form.</p>;

  return (
    <div className={`space-y-4 ${className}`}>
      {verification?.status === "NEEDS_REVISION" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-medium">HOD requested revisions</p>
          {verification.comment ? <p className="mt-1">{verification.comment}</p> : null}
        </div>
      ) : null}
      {verification?.status === "VERIFIED" ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Verified by HOD.
        </div>
      ) : null}

      {items.map((row, idx) => (
        <div
          key={idx}
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          {items.length > 1 ? (
            <p className="text-xs font-medium text-zinc-500">Row {idx + 1}</p>
          ) : null}
          {def.fields.map((field) => (
            <label key={field.key} className="block space-y-1">
              <span className="text-sm font-medium text-slate-800">
                {field.label}
                {field.required === false ? (
                  <span className="font-normal text-zinc-500"> (optional)</span>
                ) : null}
              </span>
              {field.type === "textarea" ? (
                <textarea
                  className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={String(row[field.key] ?? "")}
                  onChange={(e) => updateItem(idx, field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              ) : null}

              {field.type === "text" || field.type === "year" || field.type === "date" ? (
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={String(row[field.key] ?? "")}
                  onChange={(e) => updateItem(idx, field.key, e.target.value)}
                  type={field.type === "date" ? "date" : field.type === "year" ? "number" : "text"}
                  placeholder={field.placeholder}
                />
              ) : null}

              {field.type === "number" || field.type === "decimal" ? (
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={String(row[field.key] ?? "")}
                  onChange={(e) => updateItem(idx, field.key, e.target.value)}
                  type="number"
                  step={field.type === "decimal" ? "0.01" : "1"}
                />
              ) : null}

              {field.type === "select" ? (
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={String(row[field.key] ?? "")}
                  onChange={(e) => updateItem(idx, field.key, e.target.value)}
                >
                  <option value="">Select…</option>
                  {(field.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : null}

              {field.type === "radio" ? (
                <div className="flex flex-wrap gap-3">
                  {(field.options ?? []).map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={`${field.key}-${idx}`}
                        checked={String(row[field.key] ?? "") === opt}
                        onChange={() => updateItem(idx, field.key, opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : null}

              {field.type === "multiselect" ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {(field.options ?? []).map((opt) => {
                    const selected = Array.isArray(row[field.key])
                      ? (row[field.key] as string[]).includes(opt)
                      : false;
                    return (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => toggleMulti(idx, field.key, opt, e.target.checked)}
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              ) : null}
            </label>
          ))}
        </div>
      ))}

      {canAddRows ? (
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
          onClick={() => setItems((prev) => [...prev, emptyRow(def)])}
        >
          Add row
        </button>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          onClick={() => void save("save")}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm text-red-700 hover:bg-red-50"
          onClick={clearAll}
        >
          Delete saved data
        </button>
      </div>

      {msg ? <p className="text-sm text-slate-600">{msg}</p> : null}
    </div>
  );
}
