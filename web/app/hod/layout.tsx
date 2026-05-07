import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { authOptions } from "@/lib/auth/nextauth";

export default async function HodLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/sign-in");
  if (session.user.role !== "HOD") redirect("/teacher");

  return (
    <PortalShell
      user={{
        name: session.user.name ?? "HOD",
        email: session.user.email,
        role: "HOD",
      }}
    >
      {children}
    </PortalShell>
  );
}
