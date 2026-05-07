export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const now = Date.now();
  let diffSec = Math.round((now - then) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (diffSec < 60) return rtf.format(-diffSec, "second");
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return rtf.format(-diffHr, "hour");
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return rtf.format(-diffDay, "day");
  const diffMonth = Math.round(diffDay / 30);
  if (diffMonth < 12) return rtf.format(-diffMonth, "month");
  const diffYear = Math.round(diffMonth / 12);
  return rtf.format(-diffYear, "year");
}
