import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/nextauth";
import OnboardingForm from "./ui";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/sign-in");

  if (session.user.profileCompleted) {
    redirect(session.user.role === "HOD" ? "/hod" : "/teacher");
  }

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Complete your profile</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Add department and subjects taught. This is required before you can start
            uploading NAAC evidence.
          </p>
        </header>

        <OnboardingForm />

        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Need to switch accounts?{" "}
          <Link className="font-medium underline" href="/api/auth/signout">
            Sign out
          </Link>
        </p>
      </main>
    </div>
  );
}

