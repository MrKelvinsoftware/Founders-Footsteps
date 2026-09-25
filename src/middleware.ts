import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Keep this value in sync with SESSION_COOKIE in src/lib/session.ts
const SESSION_COOKIE = "ff_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin sub-pages — the /admin page itself is the login portal
  if (pathname.startsWith("/admin/")) {
    const session = request.cookies.get(SESSION_COOKIE);

    if (!session?.value) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // Basic structure check — full DB validation happens inside API routes
    try {
      const parsed = JSON.parse(session.value) as { userId?: string; email?: string };
      if (!parsed.userId || !parsed.email) throw new Error("bad session");
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
  matcher: ["/admin/:path+"],
};
