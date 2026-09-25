import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/session";
import { toSafeUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // ── 1. Prefer the httpOnly session cookie ───────────────────
    const cookieUser = await getSessionUser();
    if (cookieUser) {
      return Response.json({ valid: true, user: cookieUser });
    }

    // ── 2. Legacy fallback: localStorage userId/email in body ───
    let body: Record<string, string> = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is fine — just means cookie-only attempt
    }

    const { userId, email } = body;
    if (!userId || !email) {
      // No cookie AND no body — not authenticated
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
