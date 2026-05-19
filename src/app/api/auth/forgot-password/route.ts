import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }
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
    // generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    // set expiration time
    const expire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expires: expire,
      },
    });
    // send email with token
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    console.log("Reset Link:", resetLink);

    return NextResponse.json(
      {
        message:
          "If an account exists with this email, a reset link has been sent.",
        debugLink: resetLink,
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
