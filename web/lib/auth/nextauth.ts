import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectToDb } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";
import type { UserRole } from "@/lib/auth/roles";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileCompleted: boolean;
  approvalStatus: "PENDING" | "APPROVED";
};

function resolveAuthSecret(): string {
  if (process.env.NEXTAUTH_SECRET?.trim()) return process.env.NEXTAUTH_SECRET.trim();
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXTAUTH_SECRET is required in production. Add it to your hosting environment.",
    );
  }
  return "naac-dev-only-secret-not-for-production";
}

export const authOptions: NextAuthOptions = {
  secret: resolveAuthSecret(),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        await connectToDb();
        const user = await User.findOne({ email }).lean();
        if (!user || !user.isActive) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        const profileCompleted = Boolean(user.department && user.subjects?.length);

        const approvalStatus =
          user.role === "HOD"
            ? "APPROVED"
            : user.approvalStatus === "PENDING" || user.approvalStatus === "APPROVED"
              ? user.approvalStatus
              : "APPROVED";

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          profileCompleted,
          approvalStatus,
        } satisfies AuthUser;
      },
    }),
  ],
  pages: {
    signIn: "/auth/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as AuthUser).role;
        token.profileCompleted = (user as AuthUser).profileCompleted;
        token.approvalStatus = (user as AuthUser).approvalStatus;
      }

      // Keep role/profile flags fresh after onboarding or account changes.
      // (This is lightweight for hackathon scale; optimize later if needed.)
      if (token.email) {
        await connectToDb();
        const dbUser = await User.findOne({ email: String(token.email) })
          .select({
            role: 1,
            department: 1,
            subjects: 1,
            isActive: 1,
            approvalStatus: 1,
          })
          .lean();

        if (dbUser) {
          token.role = dbUser.role;
          token.profileCompleted = Boolean(
            dbUser.department && dbUser.subjects?.length,
          );
          token.isActive = dbUser.isActive;
          token.approvalStatus =
            dbUser.role === "HOD"
              ? "APPROVED"
              : dbUser.approvalStatus === "PENDING"
                ? "PENDING"
                : "APPROVED";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.profileCompleted = Boolean(token.profileCompleted);
        session.user.approvalStatus =
          (token.approvalStatus as "PENDING" | "APPROVED") ?? "APPROVED";
      }
      return session;
    },
  },
};

