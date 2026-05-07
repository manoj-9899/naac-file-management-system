"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingForm() {
  const router = useRouter();
  const [department, setDepartment] = useState("");
  const [subjectsText, setSubjectsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const subjects = subjectsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ department, subjects }),
    });

    const json = (await res.json().catch(() => null)) as
      | { ok: true }
      | { ok: false; error: string }
      | null;

    setIsSubmitting(false);
    if (!res.ok || !json || json.ok === false) {
      setError(json && "error" in json ? json.error : "Update failed.");
      return;
    }

    // Session token has the old profileCompleted flag until re-auth; easiest is a refresh
    // which will re-run middleware/route guards and send the user to their dashboard.
    router.refresh();
    router.push("/");
  }

  return (
    <form
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      onSubmit={onSubmit}
    >
      <label className="block space-y-1">
        <span className="text-sm font-medium">Department</span>
        <input
          className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Subjects taught</span>
        <input
          className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
          value={subjectsText}
          onChange={(e) => setSubjectsText(e.target.value)}
          placeholder="e.g. DBMS, DSA, Computer Networks"
          required
        />
        <p className="text-xs text-zinc-500">
          Enter a comma-separated list.
        </p>
      </label>

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <button
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Save and continue"}
      </button>
    </form>
  );
}

