import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { z } from "zod";
import { resend } from "@/lib/resend";
import { applyRateLimit, forgotPasswordLimiter, getIP } from "@/lib/rate-limit";

// Validate at the API boundary (mirrors the frontend ForgotForm schema and the
// sibling register/reset-password routes).
const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const limited = await applyRateLimit(forgotPasswordLimiter, getIP(request));
    if (limited) return limited;

    const parsed = forgotSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 },
      );
    }
    const { email } = parsed.data;
    const foundedUser = await prisma.user.findUnique({
      where: { email },
    });
    if (!foundedUser) {
      return NextResponse.json(
        {
          message:
            "If an account exists with this email, a reset link has been sent.",
        },
        { status: 200 },
      );
    }
    // Delete any existing reset tokens for this email so only one active token exists at a time.
    // This prevents old (intercepted) tokens from remaining valid after a new request is made.
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // Generate a cryptographically secure random token and set a 1-hour expiry.
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expire = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: { email, token: resetToken, expires: expire },
    });

    // Build the reset link and send it via email.
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    try {
      await resend.emails.send({
        from: "support@smark.tw",
        to: foundedUser.email!,
        subject: "Password Reset Request",
        html: `<p>Hi,</p>
          <p>You requested to reset your password. Please click the link below to proceed:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>`,
      });
    } catch (mailError) {
      console.error("EMAIL_SENDING_ERROR", mailError);
    }

    return NextResponse.json(
      {
        message:
          "If an account exists with this email, a reset link has been sent.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR", error);
    return NextResponse.json(
      {
        error: "Internal Server Error.",
      },
      { status: 500 },
    );
  }
}
