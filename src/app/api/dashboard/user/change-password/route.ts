import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-utils";
import { changeUserPassword } from "@/lib/db/users";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function POST(request: Request) {
  const user = await requireUser();
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { currentPassword, newPassword } = parsed.data;

    const result = await changeUserPassword(user.id, currentPassword, newPassword);
    if (result === "no_password") {
      return NextResponse.json(
        { error: "No password set for this account" },
        { status: 400 },
      );
    }
    if (result === "invalid") {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
