import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/operators/session-token";

const PROTECTED = [
  "/home",
  "/shadow",
  "/promote",
  "/markets",
  "/history",
  "/settings",
  "/onboarding",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (verifySession(token)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/enter";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/home",
    "/home/:path*",
    "/shadow",
    "/shadow/:path*",
    "/promote",
    "/promote/:path*",
    "/markets",
    "/markets/:path*",
    "/history",
    "/history/:path*",
    "/settings",
    "/settings/:path*",
    "/onboarding",
    "/onboarding/:path*",
  ],
};
