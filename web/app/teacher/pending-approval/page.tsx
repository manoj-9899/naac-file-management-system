import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/nextauth";

export default async function PendingApprovalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/sign-in");
  if (session.user.role !== "TEACHER") redirect("/hod");

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Awaiting HOD approval</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Your teacher account is registered, but your Head of Department must approve
            it before you can upload NAAC evidence.
          </p>
        </header>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p>
            If you already completed onboarding, you can still update your profile from{" "}
            <Link className="underline" href="/onboarding">
              onboarding
            </Link>
            .
          </p>
          <p className="mt-3">
            <Link className="underline" href="/api/auth/signout">
              Sign out
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
