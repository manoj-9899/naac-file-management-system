"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ProgressChart(props: {
  rows: { criterionId: string; name: string; percent: number }[];
}) {
  const data = props.rows.map((r) => ({
    id: r.criterionId,
    label: r.criterionId,
    percent: r.percent,
  }));

  return (
    <div className="h-72 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [`${typeof value === "number" ? value : 0}%`, "Completion"]}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as { id?: string } | undefined;
              const row = props.rows.find((r) => r.criterionId === p?.id);
              return row ? `${row.criterionId} — ${row.name}` : "";
            }}
          />
          <Bar dataKey="percent" fill="#2563eb" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
