import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default withAuth(
  function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const token = (
      req as NextRequest & {
        nextauth?: {
          token?: {
            role?: string;
            profileCompleted?: boolean;
            approvalStatus?: string;
          };
        };
      }
    ).nextauth?.token;

    // If signed in but profile incomplete, force onboarding for app areas.
    if (
      token &&
      token.profileCompleted === false &&
      startsWithAny(pathname, ["/teacher", "/hod"])
    ) {
      const url = req.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    // Role gates.
    if (startsWithAny(pathname, ["/hod"])) {
      if (!token) return NextResponse.redirect(new URL("/auth/sign-in", req.url));
      if (token.role !== "HOD") return NextResponse.redirect(new URL("/teacher", req.url));
    }

    if (startsWithAny(pathname, ["/teacher"])) {
      if (!token) return NextResponse.redirect(new URL("/auth/sign-in", req.url));
      if (token.role !== "TEACHER") return NextResponse.redirect(new URL("/hod", req.url));
      if (
        token.approvalStatus === "PENDING" &&
        !startsWithAny(pathname, ["/teacher/pending-approval"])
      ) {
        const url = req.nextUrl.clone();
        url.pathname = "/teacher/pending-approval";
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Always allow public pages.
        if (
          startsWithAny(pathname, [
            "/",
            "/auth",
            "/api/auth",
            "/_next",
            "/favicon.ico",
          ])
        ) {
          return true;
        }

        // For any other routes we add later, require auth by default.
        return Boolean(token);
      },
    },
  },
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

