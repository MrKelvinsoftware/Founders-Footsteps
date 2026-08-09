import { NextRequest, NextResponse } from "next/server";
import { sendEmailOTP, resendOTP } from "@/lib/otp";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type, resend: isResend } = body;

    if (!email || !type) {
      return NextResponse.json(
        { error: "Email and type are required" },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ["email_verification", "password_reset", "login"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid OTP type" },
        { status: 400 }
      );
    }

    // For email verification, check if user exists
    let userId: string | undefined;
    if (type === "email_verification" || type === "password_reset") {
      const [user] = await db
        .select({ id: users.id, emailVerified: users.emailVerified })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (type === "password_reset" && !user) {
        return NextResponse.json(
          { error: "No account found with this email" },
          { status: 404 }
        );
      }

      if (type === "email_verification" && user?.emailVerified) {
        return NextResponse.json(
          { error: "Email is already verified" },
          { status: 400 }
        );
      }

      userId = user?.id;
    }

    // Send or resend OTP
    const result = isResend
      ? await resendOTP(email.toLowerCase(), type, userId)
      : await sendEmailOTP(email.toLowerCase(), type, userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
