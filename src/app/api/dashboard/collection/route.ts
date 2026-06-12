import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth-utils";

const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  const userId = await requireUserId();

  const body = await request.json();
  const parsed = createCollectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const collection = await prisma.collection.create({
    data: { name: parsed.data.name, userId },
    select: { id: true, name: true },
  });

  return NextResponse.json(collection, { status: 201 });
}
