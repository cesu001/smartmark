import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { applyRateLimit, getIP, resetPasswordLimiter } from "@/lib/rate-limit";

// Enforce minimum password length at the API boundary (mirrors the frontend ResetForm schema).
const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const limited = await applyRateLimit(resetPasswordLimiter, getIP(request));
    if (limited) return limited;

    const parsed = resetSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Token and new password are required." },
        { status: 400 },
      );
    }
    const { token, password } = parsed.data;
    // check token validity
    const storedToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });
    if (!storedToken) {
      return NextResponse.json(
        { error: "Invalid or expired token. Please request a new link." },
        { status: 400 },
      );
    }
    const isExpired = new Date() > new Date(storedToken.expires);
    if (isExpired) {
      await prisma.passwordResetToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: "Token has expired. Please request a new reset link." },
        { status: 400 },
      );
    }
    const user = await prisma.user.findUnique({
      where: { email: storedToken.email },
    });
    if (!user) {
      return NextResponse.json(
        {
          error: "User associated with this token does not exist.",
        },
        { status: 400 },
      );
    }
    // password hashing
    const hashedPassword = await bcrypt.hash(password, 12);
    // transaction: once password updating or token deletion fails, the whole operation will be rolled back
    await prisma.$transaction([
      prisma.user.update({
        where: { email: storedToken.email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { token },
      }),
    ]);
    return NextResponse.json({message: "Your password has been reset successfully!" }, { status: 200 });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
