import { GraduationCap, Users } from "lucide-react";

export function RoleBadge({ role }: { role: "TEACHER" | "HOD" }) {
  const isTeacher = role === "TEACHER";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isTeacher
          ? "bg-blue-100 text-blue-800 ring-1 ring-blue-200"
          : "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
      }`}
    >
      {isTeacher ? (
        <GraduationCap className="h-3.5 w-3.5" />
      ) : (
        <Users className="h-3.5 w-3.5" />
      )}
      {isTeacher ? "Teacher Portal" : "HOD Portal"}
    </span>
  );
}
