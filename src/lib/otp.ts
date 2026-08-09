import { db } from "@/db";
import { otpCodes, users } from "@/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { Resend } from "resend";

// Initialize Resend - will work if RESEND_API_KEY is set
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Log status on startup
if (!resend) {
  console.warn("[OTP] RESEND_API_KEY not set - emails will be logged to console in development");
}

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate a unique tracking/order number
export function generateTrackingNumber(prefix: string): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `FF-${prefix}-${year}${month}${day}-${random}`;
}

// Generate order number: FF-ORD-240115-0001
export function generateOrderNumber(): string {
  return generateTrackingNumber("ORD");
}

// Generate booking number: FF-BK-240115-0001
export function generateBookingNumber(): string {
  return generateTrackingNumber("BK");
}

interface SendOTPResult {
  success: boolean;
  message: string;
  expiresAt?: Date;
}

// Create and send OTP via email
export async function sendEmailOTP(
  email: string,
  type: "email_verification" | "password_reset" | "login",
  userId?: string
): Promise<SendOTPResult> {
  try {
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await db.insert(otpCodes).values({
      userId: userId || null,
      email,
      code,
      type,
      expiresAt,
    });

    // Send email using Resend
    if (resend) {
      console.log(`[OTP] Sending ${type} email to ${email}...`);
      
      const subject = type === "email_verification" 
        ? "Verify Your Email - Founders & Footsteps"
        : type === "password_reset"
        ? "Reset Your Password - Founders & Footsteps"
        : "Login Verification - Founders & Footsteps";

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
                ${type === "email_verification" ? "Verify Your Email" : type === "password_reset" ? "Reset Your Password" : "Login Verification"}
              </h2>
              <p style="color: #64748b; margin: 0 0 24px 0; line-height: 1.6;">
                ${type === "email_verification" 
                  ? "Welcome to Founders & Footsteps! Use the code below to verify your email address."
                  : type === "password_reset"
                  ? "You requested to reset your password. Use the code below to proceed."
                  : "Use the code below to complete your login."}
              </p>
              <div style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                <p style="color: #64748b; margin: 0 0 8px 0; font-size: 14px;">Your verification code is:</p>
                <p style="color: #1e293b; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${code}</p>
              </div>
              <p style="color: #94a3b8; font-size: 14px; margin: 0; text-align: center;">
                This code expires in <strong>10 minutes</strong>. Don't share this code with anyone.
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
        to: email,
        subject,
        html: htmlContent,
      });
      
      console.log(`[OTP] Email sent successfully to ${email}`, result);
    } else {
      // In development without Resend, log the OTP
      console.log(`[OTP-DEV] ================================================`);
      console.log(`[OTP-DEV] OTP Code for ${email}: ${code}`);
      console.log(`[OTP-DEV] Type: ${type}`);
      console.log(`[OTP-DEV] Expires: ${expiresAt.toISOString()}`);
      console.log(`[OTP-DEV] ================================================`);
    }

    return {
      success: true,
      message: "Verification code sent to your email",
      expiresAt,
    };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return {
      success: false,
      message: "Failed to send verification code. Please try again.",
    };
  }
}

// Verify OTP
export async function verifyOTP(
  email: string,
  code: string,
  type: string
): Promise<{ success: boolean; message: string; userId?: string }> {
  try {
    // Find valid OTP
    const [otp] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.email, email),
          eq(otpCodes.code, code),
          eq(otpCodes.type, type),
          gt(otpCodes.expiresAt, new Date()),
          isNull(otpCodes.usedAt)
        )
      )
      .limit(1);

    if (!otp) {
      return {
        success: false,
        message: "Invalid or expired verification code",
      };
    }

    // Mark OTP as used
    await db
      .update(otpCodes)
      .set({ usedAt: new Date() })
      .where(eq(otpCodes.id, otp.id));

    // If email verification, update user
    if (type === "email_verification" && otp.userId) {
      await db
        .update(users)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(users.id, otp.userId));
    }

    return {
      success: true,
      message: "Verification successful",
      userId: otp.userId || undefined,
    };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return {
      success: false,
      message: "Verification failed. Please try again.",
    };
  }
}

// Resend OTP (invalidate old ones first)
export async function resendOTP(
  email: string,
  type: "email_verification" | "password_reset" | "login",
  userId?: string
): Promise<SendOTPResult> {
  // Invalidate existing OTPs for this email/type
  await db
    .update(otpCodes)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(otpCodes.email, email),
        eq(otpCodes.type, type),
        isNull(otpCodes.usedAt)
      )
    );

  // Send new OTP
  return sendEmailOTP(email, type, userId);
}
