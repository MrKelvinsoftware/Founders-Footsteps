import { db } from "@/db";
import { users, pendingRegistrations } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName || !lastName) {
      return Response.json({ ok: false, error: "All fields are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists with this email
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser) {
      return Response.json({ ok: false, error: "An account with this email already exists" }, { status: 409 });
    }

    // Check for existing pending registration and clean up old ones (expired)
    await db
      .delete(pendingRegistrations)
      .where(
        and(
          eq(pendingRegistrations.email, normalizedEmail),
          lt(pendingRegistrations.expiresAt, new Date())
        )
      );

    // Generate OTP and hash password
    const otpCode = generateOTP();
    const passwordHash = await bcrypt.hash(password, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing pending registration for this email
    await db
      .delete(pendingRegistrations)
      .where(eq(pendingRegistrations.email, normalizedEmail));

    // Create pending registration
    await db.insert(pendingRegistrations).values({
      email: normalizedEmail,
      passwordHash,
      firstName,
      lastName,
      phone: phone || null,
      otpCode,
      expiresAt,
    });

    // Send verification email
    if (resend) {
      console.log(`[REGISTER] Sending verification email to ${normalizedEmail}...`);
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Founders & Footsteps</h1>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px;">
                Verify Your Email to Complete Registration
              </h2>
              <p style="color: #64748b; margin: 0 0 8px 0; line-height: 1.6;">
                Hi ${firstName},
              </p>
              <p style="color: #64748b; margin: 0 0 24px 0; line-height: 1.6;">
                Thank you for signing up! Please use the verification code below to complete your account registration.
              </p>
              <div style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                <p style="color: #64748b; margin: 0 0 8px 0; font-size: 14px;">Your verification code is:</p>
                <p style="color: #1e293b; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${otpCode}</p>
              </div>
              <p style="color: #94a3b8; font-size: 14px; margin: 0; text-align: center;">
                This code expires in <strong>15 minutes</strong>. Don't share this code with anyone.
              </p>
              <p style="color: #dc2626; font-size: 14px; margin: 16px 0 0 0; text-align: center;">
                ⚠️ Your account will NOT be created until you verify this code.
              </p>
            </div>
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Founders & Footsteps. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Founders & Footsteps <onboarding@resend.dev>",
        to: normalizedEmail,
        subject: "Verify Your Email - Founders & Footsteps Registration",
        html: htmlContent,
      });
      
      console.log(`[REGISTER] Verification email sent successfully to ${normalizedEmail}`, result);
    } else {
      // In development without Resend, log the OTP
      console.log(`[REGISTER-DEV] ================================================`);
      console.log(`[REGISTER-DEV] OTP Code for ${normalizedEmail}: ${otpCode}`);
      console.log(`[REGISTER-DEV] Expires: ${expiresAt.toISOString()}`);
      console.log(`[REGISTER-DEV] ================================================`);
    }

    return Response.json({ 
      ok: true, 
      requiresVerification: true,
      email: normalizedEmail,
      message: "Verification code sent to your email. Please check your inbox to complete registration."
    });
  } catch (e) {
    console.error("Registration error:", e);
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
