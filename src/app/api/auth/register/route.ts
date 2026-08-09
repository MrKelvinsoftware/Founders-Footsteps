import { createUser, findUserByEmail } from "@/lib/auth";
import { sendEmailOTP } from "@/lib/otp";
import { sendWelcomeMessage } from "@/lib/inbox";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName || !lastName) {
      return Response.json({ ok: false, error: "All fields are required" }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return Response.json({ ok: false, error: "An account with this email already exists" }, { status: 409 });
    }

    const user = await createUser({ email, password, firstName, lastName, phone });

    // Send verification OTP
    await sendEmailOTP(email.toLowerCase(), "email_verification", user.id);

    // Send welcome message to inbox
    await sendWelcomeMessage(user.id, firstName);

    return Response.json({ 
      ok: true, 
      data: user,
      message: "Account created! Please check your email for verification code."
    });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
