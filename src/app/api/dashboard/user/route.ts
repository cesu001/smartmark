import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { z } from "zod";

const nameSchema = z.object({ name: z.string().min(1).max(100) });

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();
    const parsed = nameSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: userId },
      data: { name: parsed.data.name },
    });
    return NextResponse.json({ message: "Name updated" });
  } catch (error) {
    console.error("UPDATE_USER_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const userId = await requireUserId();
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ message: "Account deleted" });
  } catch (error) {
    console.error("DELETE_USER_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
