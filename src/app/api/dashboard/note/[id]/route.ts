import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-utils";
import { getNoteDetail, updateNote, updateNoteFlags, deleteNote } from "@/lib/db/notes";
import { getAllCollections } from "@/lib/db/collections";
import { getTagNames } from "@/lib/db/tags";

type RouteContext = { params: Promise<{ id: string }> };

// Returns the note plus the user's collections and tags in one round-trip, so
// the drawer can open with a single fetch instead of three.
export async function GET(_request: Request, { params }: RouteContext) {
  const userId = await requireUserId();
  const { id } = await params;

  const [note, collections, tags] = await Promise.all([
    getNoteDetail(id, userId),
    getAllCollections(userId),
    getTagNames(userId),
  ]);
  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ note, collections, tags });
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

const updateFlagsSchema = z
  .object({
    isPinned: z.boolean().optional(),
    isFavorite: z.boolean().optional(),
  })
  .refine((data) => data.isPinned !== undefined || data.isFavorite !== undefined, {
    message: "At least one flag is required",
  });

export async function PATCH(request: Request, { params }: RouteContext) {
  const userId = await requireUserId();
  const { id } = await params;

  const body = await request.json();
  const parsed = updateFlagsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const result = await updateNoteFlags(id, userId, parsed.data);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result);
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
