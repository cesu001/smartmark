import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth-utils";
import { updateUserName, deleteUser } from "@/lib/db/users";
import { z } from "zod";

const nameSchema = z.object({ name: z.string().min(1).max(100) });

export async function PATCH(request: Request) {
  const userId = await requireUserId();
  try {
    const parsed = nameSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    await updateUserName(userId, parsed.data.name);
    return NextResponse.json({ message: "Name updated" });
  } catch (error) {
    console.error("UPDATE_USER_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const userId = await requireUserId();
  try {
    await deleteUser(userId);
    return NextResponse.json({ message: "Account deleted" });
  } catch (error) {
    console.error("DELETE_USER_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
