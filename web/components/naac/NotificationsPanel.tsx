"use client";

import { useEffect, useState } from "react";

type N = { id: string; type: string; message: string; read: boolean; createdAt: string };

export function NotificationsPanel() {
  const [items, setItems] = useState<N[]>([]);
  const [open, setOpen] = useState(false);

  async function refresh() {
    const res = await fetch("/api/notifications");
    const json = (await res.json()) as { ok?: boolean; notifications?: N[] };
    if (json.ok && json.notifications) setItems(json.notifications);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-side fetch on mount
    void refresh();
  }, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" });
    await refresh();
  }

  const unread = items.filter((i) => !i.read).length;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-semibold">Notifications</span>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium tabular-nums text-blue-800 dark:bg-zinc-800">
          {unread} unread
        </span>
      </button>
      {open ? (
        <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          {items.length === 0 ? (
            <p className="text-sm text-zinc-500">No notifications yet.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((n) => (
                <li key={n.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                  <p className="whitespace-pre-wrap">{n.message}</p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs text-zinc-500">
                    <span>
                      {new Date(n.createdAt).toLocaleString()} · {n.type}
                    </span>
                    {!n.read ? (
                      <button
                        type="button"
                        className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
                        onClick={() => void markRead(n.id)}
                      >
                        Mark read
                      </button>
                    ) : (
                      <span>Read</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
