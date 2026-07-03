import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-utils";
import { getTagNames, createTag } from "@/lib/db/tags";

export async function GET() {
  const userId = await requireUserId();
  const tags = await getTagNames(userId);
  return NextResponse.json(tags);
}

const createTagSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  const userId = await requireUserId();

  const body = await request.json();
  const parsed = createTagSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const tag = await createTag(userId, parsed.data.name);
  return NextResponse.json(tag, { status: 201 });
}
