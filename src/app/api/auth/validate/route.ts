import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/session";
import { toSafeUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. Prefer the httpOnly session cookie (set since the cookie-based login was added)
    const sessionUser = await getSessionUser();
    if (sessionUser) {
      return Response.json({ valid: true, user: sessionUser });
    }

    // 2. Legacy fallback: client stored userId/email in localStorage and sends it here
    const body = await req.json().catch(() => ({}));
    const { userId, email } = body as { userId?: string; email?: string };

    if (!userId || !email) {
      return Response.json({ valid: false, error: "No active session" }, { status: 401 });
    }

    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!row) {
      return Response.json({ valid: false, error: "User not found" });
    }

    if (row.email.toLowerCase() !== email.toLowerCase()) {
      return Response.json({ valid: false, error: "Session mismatch" });
    }

    return Response.json({ valid: true, user: toSafeUser(row) });
  } catch (error) {
    console.error("[AUTH] Validate error:", error);
    return Response.json({ valid: false, error: "Validation failed" }, { status: 500 });
  }
}
