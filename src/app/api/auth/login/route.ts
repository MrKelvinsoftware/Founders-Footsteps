import {
  ensureAdminSeeded,
  findUserByEmailOrPhone,
  verifyPassword,
  toSafeUser,
} from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email?.trim() || !password) {
      return Response.json(
        { ok: false, error: "Email/phone and password are required" },
        { status: 400 }
      );
    }

    // Ensure the built-in admin account exists before any lookup
    await ensureAdminSeeded();

    const user = await findUserByEmailOrPhone(email.trim());
    if (!user) {
      return Response.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return Response.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    const safeUser = toSafeUser(user);

    // Set an httpOnly session cookie so the server can authenticate future requests
    await setSessionCookie(safeUser);

    return Response.json({ ok: true, data: safeUser });
  } catch (e) {
    console.error("[AUTH] Login error:", e);
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
