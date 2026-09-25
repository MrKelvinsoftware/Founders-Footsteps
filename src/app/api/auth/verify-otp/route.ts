import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";
import { sendWelcomeMessage } from "@/lib/inbox";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, type } = body;

    if (!email || !code || !type) {
      return NextResponse.json(
        { error: "Email, code, and type are required" },
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Invalid verification code format" },
        { status: 400 }
      );
    }

    const result = await verifyOTP(email.toLowerCase(), code, type);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // If email verification was successful, send welcome message
    if (type === "email_verification" && result.userId) {
      const [user] = await db
        .select({ firstName: users.firstName })
        .from(users)
        .where(eq(users.id, result.userId))
        .limit(1);

      if (user) {
        await sendWelcomeMessage(result.userId, user.firstName || "there");
      }
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      userId: result.userId,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
