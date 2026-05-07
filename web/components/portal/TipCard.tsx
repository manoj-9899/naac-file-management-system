import { Lightbulb } from "lucide-react";

export function TipCard() {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-900">
      <div className="flex gap-3">
        <Lightbulb className="h-5 w-5 shrink-0 text-blue-600" />
        <p>
          <span className="font-medium">Tip:</span> Use clear file names like{" "}
          <code className="rounded bg-white/80 px-1 text-xs">2024_Workshop_AICTE.pdf</code> for
          easier HOD review.
        </p>
      </div>
    </div>
  );
}
