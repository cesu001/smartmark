import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { currentPassword, newPassword } = parsed.data;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!dbUser?.password) {
      return NextResponse.json(
        { error: "No password set for this account" },
        { status: 400 },
      );
    }

    const isValid = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
