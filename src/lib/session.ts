import "server-only";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { SafeUser } from "./auth";
import { toSafeUser } from "./auth";

export const SESSION_COOKIE = "ff_session";

// ─────────────────────────────────────────────
// Set / clear session cookie (httpOnly, secure)
// ─────────────────────────────────────────────

export async function setSessionCookie(user: SafeUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify({ userId: user.id, email: user.email }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // 7-day session
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// ─────────────────────────────────────────────
// Read & verify session from cookie
// ─────────────────────────────────────────────

export async function getSessionUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(SESSION_COOKIE)?.value;
    if (!raw) return null;

    const { userId, email } = JSON.parse(raw) as { userId?: string; email?: string };
    if (!userId || !email) return null;

    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!row) return null;
    if (row.email.toLowerCase() !== email.toLowerCase()) return null;

    return toSafeUser(row);
  } catch {
    return null;
  }
}

/** Returns the session user only if they have the admin role. */
export async function requireAdmin(): Promise<SafeUser | null> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
