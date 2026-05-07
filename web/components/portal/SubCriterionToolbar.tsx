"use client";

import { Cloud, Loader2, Save, Send } from "lucide-react";
import { useEffect, useState } from "react";

type SaveStateEventDetail = {
  saving: boolean;
  ok?: boolean;
  message?: string;
  at?: number;
  mode?: "save" | "submit";
};

export function SubCriterionToolbar() {
  const [saving, setSaving] = useState(false);
  const [lastMsg, setLastMsg] = useState<string | null>(null);

  useEffect(() => {
    const onState = (e: Event) => {
      const ce = e as CustomEvent<SaveStateEventDetail>;
      const d = ce.detail;
      setSaving(Boolean(d?.saving));
      if (d?.saving) return;
      if (d?.message) setLastMsg(d.message);
      else if (typeof d?.ok === "boolean") {
        setLastMsg(d.ok ? "Saved." : "Save failed.");
      }
      if (d?.at) {
        window.setTimeout(() => {
          setLastMsg((prev) => (prev === (d.message ?? (d.ok ? "Saved." : "Save failed.")) ? null : prev));
        }, 2500);
      }
    };
    window.addEventListener("naac-form-save-state", onState);
    return () => window.removeEventListener("naac-form-save-state", onState);
  }, []);

  function emit(mode: "save" | "submit") {
    const name = mode === "submit" ? "naac-form-submit" : "naac-form-save";
    window.dispatchEvent(
      new CustomEvent<SaveStateEventDetail>(name, {
        detail: { saving: true, mode, at: Date.now() },
      }),
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="hidden items-center gap-1.5 text-xs text-emerald-600 sm:inline-flex">
        <Cloud className="h-3.5 w-3.5" />
        {saving ? "Saving…" : "Autosaved · save from form"}
      </span>
      {lastMsg ? <span className="text-xs text-slate-500">{lastMsg}</span> : null}
      <button
        type="button"
        onClick={() => emit("save")}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save draft
      </button>
      <button
        type="button"
        onClick={() => emit("submit")}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Submit
      </button>
    </div>
  );
}
