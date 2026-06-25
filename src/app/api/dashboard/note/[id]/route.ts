import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth-utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const userId = await requireUserId();
  const { id } = await params;

  const note = await prisma.note.findFirst({
    where: { id, userId },
    include: {
      tags: { include: { tag: { select: { id: true, name: true } } } },
    },
  });

  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: note.id,
    title: note.title,
    content: note.content ?? "",
    collectionId: note.collectionId,
    isPinned: note.isPinned,
    isFavorite: note.isFavorite,
    tags: note.tags.map((t) => t.tag),
  });
}

const updateNoteSchema = z.object({
  title: z.string().min(1).max(255),
  collectionId: z.string().min(1),
  tagIds: z.array(z.string()).default([]),
  content: z.string().default(""),
});

export async function PUT(request: Request, { params }: RouteContext) {
  const userId = await requireUserId();
  const { id } = await params;

  const existing = await prisma.note.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { title, collectionId, tagIds, content } = parsed.data;

  const note = await prisma.note.update({
    where: { id },
    data: {
      title,
      content,
      collectionId,
      tags: {
        deleteMany: {},
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  return NextResponse.json({ id: note.id });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const userId = await requireUserId();
  const { id } = await params;

  const note = await prisma.note.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!note || note.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.note.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
