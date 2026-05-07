"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SessionUser = {
  role?: "TEACHER" | "HOD";
  profileCompleted?: boolean;
  approvalStatus?: "PENDING" | "APPROVED";
};

async function fetchSessionWithRetry(): Promise<SessionUser | null> {
  for (let i = 0; i < 6; i += 1) {
    const res = await fetch("/api/auth/session");
    const json = (await res.json().catch(() => null)) as
      | { user?: SessionUser }
      | null;
    const user = json?.user ?? null;
    if (user?.role) return user;
    await new Promise((r) => setTimeout(r, 200));
  }
  return null;
}

function defaultRedirectFor(user: SessionUser | null) {
  if (!user?.role) return "/";
  if (user.profileCompleted === false) return "/onboarding";
  if (user.role === "TEACHER" && user.approvalStatus === "PENDING") {
    return "/teacher/pending-approval";
  }
  return user.role === "HOD" ? "/hod" : "/teacher";
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const callbackUrl =
      new URL(window.location.href).searchParams.get("callbackUrl") ?? "/";

    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);
    if (!res || res.error) {
      setError("Invalid email/password, or your account is inactive.");
      return;
    }

    const sessionUser = await fetchSessionWithRetry();
    const target =
      callbackUrl !== "/" && callbackUrl !== "" ? callbackUrl : defaultRedirectFor(sessionUser);

    // App Router + NextAuth can occasionally delay session hydration; use replace+refresh,
    // and fall back to a hard navigation if client routing doesn't move.
    router.replace(target);
    router.refresh();
    setTimeout(() => {
      if (window.location.pathname.startsWith("/auth/sign-in")) {
        window.location.assign(target);
      }
    }, 500);
  }

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Use your email and password.
          </p>
        </header>

        <form
          className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          onSubmit={onSubmit}
        >
          <label className="block space-y-1">
            <span className="text-sm font-medium">Email</span>
            <input
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Password</span>
            <input
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <button
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Don&apos;t have an account?{" "}
          <Link className="font-medium underline" href="/auth/register">
            Register
          </Link>
        </p>
      </main>
    </div>
  );
}

