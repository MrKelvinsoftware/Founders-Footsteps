import { ensureAdminSeeded, findUserByEmail, verifyPassword, toSafeUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return Response.json({ ok: false, error: "Email and password are required" }, { status: 400 });
    }

    await ensureAdminSeeded();

    const user = await findUserByEmail(email);
    if (!user) {
      return Response.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return Response.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
    }

    return Response.json({ ok: true, data: toSafeUser(user) });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
