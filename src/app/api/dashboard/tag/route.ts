import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth-utils";

export async function GET() {
  const userId = await requireUserId();
  const tags = await prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
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

  const tag = await prisma.tag.create({
    data: { name: parsed.data.name, userId },
    select: { id: true, name: true },
  });

  return NextResponse.json(tag, { status: 201 });
}
