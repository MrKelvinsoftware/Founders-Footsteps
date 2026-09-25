import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

// Paths that are explicitly public within /admin (the login page itself)
const ADMIN_PUBLIC = new Set(["/admin"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run on /admin sub-pages (not /admin itself — that's the login portal)
  if (pathname.startsWith("/admin/") && !ADMIN_PUBLIC.has(pathname)) {
    const session = request.cookies.get(SESSION_COOKIE);

    if (!session?.value) {
      // No cookie → redirect to the login portal, preserving the intended destination
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // Basic cookie structure check — full DB validation happens in API routes
    try {
      const parsed = JSON.parse(session.value) as { userId?: string; email?: string };
      if (!parsed.userId || !parsed.email) {
        throw new Error("Malformed session");
      }
    } catch {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.searchParams.set("next", pathname);
      const response = NextResponse.redirect(url);
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all /admin/* routes but skip static assets and Next.js internals
  matcher: ["/admin/:path+"],
};
