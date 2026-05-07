import Link from "next/link";
import type { NaacSubCriterion } from "@/lib/naac/types";

export function SubCriteriaList({
  criterionId,
  items,
  currentId,
}: {
  criterionId: string;
  items: readonly NaacSubCriterion[];
  currentId: string;
}) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Sub-criteria
      </p>
      <nav className="space-y-1">
        {items.map((s) => {
          const active = s.id === currentId;
          return (
            <Link
              key={s.id}
              href={`/teacher/criteria/${criterionId}/${encodeURIComponent(s.id)}`}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-blue-600 font-medium text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className={active ? "text-blue-100" : "text-slate-500"}>{s.code}</span>{" "}
              {s.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
