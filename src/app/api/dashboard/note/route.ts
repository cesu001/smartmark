import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth-utils";

const createNoteSchema = z.object({
  title: z.string().min(1).max(255),
  collectionId: z.string().min(1),
  tagIds: z.array(z.string()).default([]),
  content: z.string().default(""),
});

export async function POST(request: Request) {
  const userId = await requireUserId();

  const body = await request.json();
  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { title, collectionId, tagIds, content } = parsed.data;

  const note = await prisma.note.create({
    data: {
      title,
      content,
      collectionId,
      userId,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  return NextResponse.json({ id: note.id }, { status: 201 });
}
