import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-utils";
import { getNoteDetail, updateNote, deleteNote } from "@/lib/db/notes";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const userId = await requireUserId();
  const { id } = await params;

  const note = await getNoteDetail(id, userId);
  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(note);
}

const updateNoteSchema = z.object({
  title: z.string().min(1).max(255),
  collectionId: z.string().min(1).optional().nullable(),
  tagIds: z.array(z.string()).default([]),
  content: z.string().default(""),
});

export async function PUT(request: Request, { params }: RouteContext) {
  const userId = await requireUserId();
  const { id } = await params;

  const body = await request.json();
  const parsed = updateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const result = await updateNote(id, userId, parsed.data);
  if (result.status === "not_found") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (result.status === "invalid_collection") {
    return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
  }
  if (result.status === "invalid_tags") {
    return NextResponse.json({ error: "Invalid tags" }, { status: 400 });
  }

  return NextResponse.json({ id: result.id, collectionId: result.collectionId });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const userId = await requireUserId();
  const { id } = await params;

  const deleted = await deleteNote(id, userId);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
