"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "TEACHER" | "HOD";

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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("TEACHER");
  const [hodInviteCode, setHodInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password, role, hodInviteCode }),
    });

    const json = (await res.json().catch(() => null)) as
      | { ok: true }
      | { ok: false; error: string }
      | null;

    if (!res.ok || !json || json.ok === false) {
      setIsSubmitting(false);
      setError(json && "error" in json ? json.error : "Registration failed.");
      return;
    }

    const signInRes = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl: "/",
    });

    setIsSubmitting(false);
    if (!signInRes || signInRes.error) {
      router.push("/auth/sign-in");
      return;
    }

    const sessionUser = await fetchSessionWithRetry();
    const target = defaultRedirectFor(sessionUser);
    router.replace(target);
    router.refresh();
    setTimeout(() => {
      if (window.location.pathname.startsWith("/auth/register")) {
        window.location.assign(target);
      }
    }, 500);
  }

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Register</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Create a Teacher account, or a HOD account with an invite code. Already registered?
            Use{" "}
            <Link className="font-medium underline" href="/auth/sign-in">
              Sign in
            </Link>{" "}
            (no invite code).
          </p>
        </header>

        <form
          className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          onSubmit={onSubmit}
        >
          <label className="block space-y-1">
            <span className="text-sm font-medium">Name</span>
            <input
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Email</span>
            <input
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
              type="email"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Role</span>
            <select
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="TEACHER">Teacher</option>
              <option value="HOD">HOD (Super User)</option>
            </select>
          </label>

          {role === "HOD" ? (
            <label className="block space-y-1">
              <span className="text-sm font-medium">HOD invite code</span>
              <input
                className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
                value={hodInviteCode}
                onChange={(e) => setHodInviteCode(e.target.value)}
                required
              />
            </label>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <button
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Already have an account?{" "}
          <Link className="font-medium underline" href="/auth/sign-in">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}

