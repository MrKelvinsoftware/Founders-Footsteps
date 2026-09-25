import { db } from "@/db";
import { users, pendingRegistrations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return Response.json({ ok: false, error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser) {
      return Response.json({ 
        ok: false, 
        error: "An account with this email already exists. Please sign in." 
      }, { status: 409 });
    }

    // Find pending registration
    const [pendingReg] = await db
      .select()
      .from(pendingRegistrations)
      .where(eq(pendingRegistrations.email, normalizedEmail))
      .limit(1);

    if (!pendingReg) {
      return Response.json({ 
        ok: false, 
        error: "No pending registration found. Please start the registration process again." 
      }, { status: 404 });
    }

    // Generate new OTP and update expiration
    const newOtpCode = generateOTP();
    const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db
      .update(pendingRegistrations)
      .set({
        otpCode: newOtpCode,
        expiresAt: newExpiresAt,
      })
      .where(eq(pendingRegistrations.id, pendingReg.id));

    // Send new verification email
    if (resend) {
      console.log(`[RESEND-OTP] Sending new verification email to ${normalizedEmail}...`);
      
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
                New Verification Code
              </h2>
              <p style="color: #64748b; margin: 0 0 8px 0; line-height: 1.6;">
                Hi ${pendingReg.firstName},
              </p>
              <p style="color: #64748b; margin: 0 0 24px 0; line-height: 1.6;">
                Here's your new verification code to complete your account registration.
              </p>
              <div style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                <p style="color: #64748b; margin: 0 0 8px 0; font-size: 14px;">Your verification code is:</p>
                <p style="color: #1e293b; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${newOtpCode}</p>
              </div>
              <p style="color: #94a3b8; font-size: 14px; margin: 0; text-align: center;">
                This code expires in <strong>15 minutes</strong>. Don't share this code with anyone.
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
        subject: "New Verification Code - Founders & Footsteps",
        html: htmlContent,
      });
      
      console.log(`[RESEND-OTP] Email sent successfully to ${normalizedEmail}`, result);
    } else {
      // In development without Resend, log the OTP
      console.log(`[RESEND-OTP-DEV] ================================================`);
      console.log(`[RESEND-OTP-DEV] New OTP Code for ${normalizedEmail}: ${newOtpCode}`);
      console.log(`[RESEND-OTP-DEV] Expires: ${newExpiresAt.toISOString()}`);
      console.log(`[RESEND-OTP-DEV] ================================================`);
    }

    return Response.json({ 
      ok: true, 
      message: "New verification code sent to your email."
    });
  } catch (e) {
    console.error("Resend OTP error:", e);
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
