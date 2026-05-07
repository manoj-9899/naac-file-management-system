"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

export function CompletionDonut({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, percent));
  const data = [
    { name: "done", value: p },
    { name: "rest", value: 100 - p },
  ];
  return (
    <div className="flex flex-col items-center pt-2">
      <div className="relative h-44 w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius="72%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              <Cell fill="#2563eb" />
              <Cell fill="#e2e8f0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-1">
          <p className="text-2xl font-bold tabular-nums text-slate-900">{p}%</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Complete
          </p>
        </div>
      </div>
    </div>
  );
}
