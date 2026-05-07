"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Row = {
  id: string;
  name: string;
  email: string;
  department: string;
  approvalStatus: string;
  isActive: boolean;
  lastActivityAt: string | null;
  started: boolean;
  completionPercent: number;
};

export default function HodTeachersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/hod/teachers");
    const json = (await res.json()) as { ok?: boolean; teachers?: Row[] };
    if (json.ok && json.teachers) setRows(json.teachers);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-side fetch on mount
    void refresh();
  }, []);

  async function approve(id: string) {
    setMsg(null);
    const res = await fetch(`/api/hod/teachers/${encodeURIComponent(id)}/approve`, {
      method: "POST",
    });
    setMsg(res.ok ? "Approved." : "Approve failed.");
    await refresh();
  }

  async function deactivate(id: string) {
    if (!confirm("Deactivate this teacher account?")) return;
    setMsg(null);
    const res = await fetch(`/api/hod/teachers/${encodeURIComponent(id)}/deactivate`, {
      method: "POST",
    });
    setMsg(res.ok ? "Deactivated." : "Failed.");
    await refresh();
  }

  async function remind(id: string) {
    const message = prompt("Reminder message to send:");
    if (!message) return;
    setMsg(null);
    const res = await fetch("/api/hod/remind", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ teacherId: id, message }),
    });
    setMsg(res.ok ? "Reminder sent." : "Failed to send reminder.");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            <Link className="font-medium text-blue-600 hover:underline" href="/hod">
              HOD dashboard
            </Link>{" "}
            / Teachers
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Teachers</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review progress, approve new accounts, and open read-only submissions.
          </p>
        </div>
        <Link
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
          href="/hod"
        >
          Back
        </Link>
      </header>

      {msg ? <p className="text-sm text-slate-700">{msg}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-500">
            <tr>
              <th className="px-3 py-2">Teacher</th>
              <th className="px-3 py-2">Department</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Started</th>
              <th className="px-3 py-2">%</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((t) => (
              <tr key={t.id} className="text-slate-800">
                <td className="px-3 py-3">
                  <div className="font-medium text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.email}</div>
                </td>
                <td className="px-3 py-3">{t.department || "—"}</td>
                <td className="px-3 py-3">
                  {!t.isActive ? (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-900">
                      Inactive
                    </span>
                  ) : t.approvalStatus === "PENDING" ? (
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-900">
                      Pending approval
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-900">
                      Approved
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">{t.started ? "Yes" : "No"}</td>
                <td className="px-3 py-3 tabular-nums">{t.completionPercent}%</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-blue-700 hover:bg-slate-50"
                      href={`/hod/teachers/${encodeURIComponent(t.id)}`}
                    >
                      View
                    </Link>
                    {t.approvalStatus === "PENDING" ? (
                      <button
                        type="button"
                        className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                        onClick={() => void approve(t.id)}
                      >
                        Approve
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50"
                      onClick={() => void remind(t.id)}
                    >
                      Remind
                    </button>
                    {t.isActive ? (
                      <button
                        type="button"
                        className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                        onClick={() => void deactivate(t.id)}
                      >
                        Deactivate
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
