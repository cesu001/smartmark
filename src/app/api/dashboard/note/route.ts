import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/auth-utils";
import { createNote, getAllNotes, getFavoriteNotes } from "@/lib/db/notes";

// Which list view is paging. Both are userId-scoped in the db utilities.
const listQuerySchema = z.object({
  scope: z.enum(["all", "favorites"]).default("all"),
  cursor: z.string().min(1).optional(),
});

/** Fetches the next page for the "Load more" button on the note list views. */
export async function GET(request: Request) {
  const userId = await requireUserId();

  const { searchParams } = new URL(request.url);
  const parsed = listQuerySchema.safeParse({
    scope: searchParams.get("scope") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { scope, cursor } = parsed.data;
  const page =
    scope === "favorites"
      ? await getFavoriteNotes(userId, cursor)
      : await getAllNotes(userId, cursor);

  return NextResponse.json(page);
}

const createNoteSchema = z.object({
  title: z.string().min(1).max(255),
  collectionId: z.string().min(1).optional().nullable(),
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

  const result = await createNote(userId, parsed.data);
  if (result.status === "invalid_collection") {
    return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
  }
  if (result.status === "invalid_tags") {
    return NextResponse.json({ error: "Invalid tags" }, { status: 400 });
  }

  return NextResponse.json({ id: result.id }, { status: 201 });
}
