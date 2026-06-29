import Image from "next/image";
import Link from "next/link";
import { UNIVERSITY } from "@/lib/site/branding";

export function UniversityMark({
  compact = false,
  showPortal = true,
}: {
  compact?: boolean;
  showPortal?: boolean;
}) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3">
      <Image
        src={UNIVERSITY.logoSrc}
        alt={`${UNIVERSITY.shortName} logo`}
        width={compact ? 40 : 52}
        height={compact ? 48 : 62}
        className="h-auto w-10 shrink-0 object-contain sm:w-12"
        priority
      />
      <div className="min-w-0">
        <p
          className={`font-semibold leading-tight text-slate-900 ${compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"}`}
        >
          {UNIVERSITY.shortName}
        </p>
        {!compact ? (
          <p className="hidden line-clamp-2 text-[11px] leading-snug text-slate-600 lg:block">
            {UNIVERSITY.name}
          </p>
        ) : null}
        <p className="text-[10px] text-slate-500 sm:text-xs">
          Established {UNIVERSITY.established}
        </p>
        {showPortal && !compact ? (
          <p className="mt-0.5 text-[11px] font-medium text-blue-700">{UNIVERSITY.portalTitle}</p>
        ) : null}
      </div>
    </Link>
  );
}
