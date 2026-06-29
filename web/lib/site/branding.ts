/** Public site / institution branding (override via env). */
export const UNIVERSITY = {
  shortName: "DBATU",
  name:
    process.env.NEXT_PUBLIC_UNIVERSITY_NAME ??
    "Dr. Babasaheb Ambedkar Technological University",
  established: process.env.NEXT_PUBLIC_UNIVERSITY_ESTABLISHED ?? "1989",
  tagline:
    process.env.NEXT_PUBLIC_UNIVERSITY_TAGLINE ??
    "Empowering Departments · Ensuring Excellence",
  portalTitle:
    process.env.NEXT_PUBLIC_PORTAL_TITLE ?? "NAAC Documentation Portal",
  department:
    process.env.NEXT_PUBLIC_PORTAL_DEPARTMENT ??
    "Department of Computer Science & Engineering",
  logoSrc: "/dbatu-logo.png",
} as const;
