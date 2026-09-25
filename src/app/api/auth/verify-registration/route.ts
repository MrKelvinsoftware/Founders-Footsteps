import { db } from "@/db";
import { users, pendingRegistrations } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { sendWelcomeMessage } from "@/lib/inbox";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return Response.json({ ok: false, error: "Email and verification code are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return Response.json({ ok: false, error: "Invalid verification code format" }, { status: 400 });
    }

    // Find the pending registration
    const [pendingReg] = await db
      .select()
      .from(pendingRegistrations)
      .where(
        and(
          eq(pendingRegistrations.email, normalizedEmail),
          eq(pendingRegistrations.otpCode, code),
          gt(pendingRegistrations.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!pendingReg) {
      return Response.json({ 
        ok: false, 
        error: "Invalid or expired verification code. Please request a new one." 
      }, { status: 400 });
    }

    // Check if user already exists (edge case: double submission)
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser) {
      // Clean up the pending registration
      await db
        .delete(pendingRegistrations)
        .where(eq(pendingRegistrations.id, pendingReg.id));
      
      return Response.json({ 
        ok: false, 
        error: "An account with this email already exists. Please sign in." 
      }, { status: 409 });
    }

    // Create the verified user account
    const [newUser] = await db
      .insert(users)
      .values({
        email: pendingReg.email,
        passwordHash: pendingReg.passwordHash,
        firstName: pendingReg.firstName,
        lastName: pendingReg.lastName,
        phone: pendingReg.phone,
        role: "customer",
        emailVerified: true, // Already verified!
      })
      .returning();

    // Mark pending registration as verified and delete it
    await db
      .delete(pendingRegistrations)
      .where(eq(pendingRegistrations.id, pendingReg.id));

    // Send welcome message to inbox
    await sendWelcomeMessage(newUser.id, pendingReg.firstName);

    return Response.json({ 
      ok: true, 
      message: "Account created successfully! You can now sign in.",
      data: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      }
    });
  } catch (e) {
    console.error("Verify registration error:", e);
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
