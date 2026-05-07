import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { authOptions } from "@/lib/auth/nextauth";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/sign-in");
  if (session.user.role !== "TEACHER") redirect("/hod");

  return (
    <PortalShell
      user={{
        name: session.user.name ?? "Teacher",
        email: session.user.email,
        role: "TEACHER",
      }}
    >
      {children}
    </PortalShell>
  );
}
