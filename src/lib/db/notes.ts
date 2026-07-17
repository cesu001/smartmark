import { cache } from "react";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { Note } from "@/types/dashboard";
import { verifyCollectionOwnership } from "./collections";
import { verifyTagsOwnership } from "./tags";
import { embedNoteContent } from "@/lib/ai/embeddings";

/**
 * Refresh a note's embedding without blocking the save. An embedding failure
 * (OpenAI down, quota, etc.) must never fail the note write — same spirit as R2
 * cleanup not blocking account deletion in `deleteUser`.
 *
 * Scheduled via Next's `after()` so the work runs *after* the response is sent
 * but is still awaited by the runtime — a bare `void embedNoteContent(...)` gets
 * dropped on serverless (Vercel), where the function is frozen the moment it
 * responds, so the embedding UPDATE never lands. `after()` throws when there's
 * no request scope (unit tests, one-off scripts, cron), so fall back to running
 * inline in that case.
 */
function refreshNoteEmbedding(noteId: string, content: string): void {
  const run = () =>
    embedNoteContent(noteId, content).catch((err) => {
      console.error(`Failed to embed note ${noteId}:`, err);
    });

  try {
    after(run);
  } catch {
    void run();
  }
}

const noteTagInclude = {
  tags: {
    include: {
      tag: { select: { id: true, name: true } },
    },
  },
};

function mapNote(n: {
  id: string;
  title: string;
  content: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  collectionId: string | null;
  updatedAt: Date;
  tags: { tag: { id: string; name: string } }[];
}): Note {
  return {
    id: n.id,
    title: n.title,
    content: n.content ?? "",
    isPinned: n.isPinned,
    isFavorite: n.isFavorite,
    collectionId: n.collectionId,
    updatedAt: n.updatedAt.toLocaleDateString("zh-TW"),
    tags: n.tags.map((t) => t.tag),
  };
}

export const getNoteCounts = cache(async (userId: string) => {
  const [total, favorites, pinned] = await Promise.all([
    prisma.note.count({ where: { userId } }),
    prisma.note.count({ where: { userId, isFavorite: true } }),
    prisma.note.count({ where: { userId, isPinned: true } }),
  ]);
  return { total, favorites, pinned };
});

export async function getNoteStats(userId: string) {
  const { total, favorites } = await getNoteCounts(userId);
  return { total, favorites };
}

export async function getAllNotes(userId: string): Promise<Note[]> {
  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: noteTagInclude,
  });
  return notes.map(mapNote);
}

export async function getRecentNotes(
  userId: string,
  limit: number,
): Promise<Note[]> {
  const notes = await prisma.note.findMany({
    where: { userId, isPinned: false },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: noteTagInclude,
  });
  return notes.map(mapNote);
}

export async function getFavoriteNotes(userId: string): Promise<Note[]> {
  const notes = await prisma.note.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    include: noteTagInclude,
  });
  return notes.map(mapNote);
}

export async function getPinnedNotes(
  userId: string,
  limit?: number,
): Promise<Note[]> {
  const notes = await prisma.note.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    ...(limit !== undefined && { take: limit }),
    include: noteTagInclude,
  });
  return notes.map(mapNote);
}

export async function getNoteById(
  noteId: string,
  userId: string,
): Promise<Note | null> {
  const note = await prisma.note.findFirst({
    where: { id: noteId, userId },
    include: noteTagInclude,
  });
  return note ? mapNote(note) : null;
}

export interface NoteDetail {
  id: string;
  title: string;
  content: string;
  collectionId: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  tags: { id: string; name: string }[];
  createdAt: string;
  updatedAt: string;
}

export async function getNoteDetail(
  noteId: string,
  userId: string,
): Promise<NoteDetail | null> {
  const note = await prisma.note.findFirst({
    where: { id: noteId, userId },
    include: noteTagInclude,
  });
  if (!note) return null;
  return {
    id: note.id,
    title: note.title,
    content: note.content ?? "",
    collectionId: note.collectionId,
    isPinned: note.isPinned,
    isFavorite: note.isFavorite,
    tags: note.tags.map((t) => t.tag),
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

interface NoteInput {
  title: string;
  content: string;
  collectionId?: string | null;
  tagIds: string[];
}

export type CreateNoteResult =
  | { status: "invalid_collection" }
  | { status: "invalid_tags" }
  | { status: "ok"; id: string };

export async function createNote(
  userId: string,
  data: NoteInput,
): Promise<CreateNoteResult> {
  if (data.collectionId && !(await verifyCollectionOwnership(userId, data.collectionId))) {
    return { status: "invalid_collection" };
  }
  if (!(await verifyTagsOwnership(userId, data.tagIds))) {
    return { status: "invalid_tags" };
  }

  const note = await prisma.note.create({
    data: {
      title: data.title,
      content: data.content,
      collectionId: data.collectionId ?? null,
      userId,
      tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
    },
    select: { id: true },
  });

  refreshNoteEmbedding(note.id, data.content);

  return { status: "ok", id: note.id };
}

export type UpdateNoteResult =
  | { status: "not_found" }
  | { status: "invalid_collection" }
  | { status: "invalid_tags" }
  | { status: "ok"; id: string; collectionId: string | null };

export async function updateNote(
  noteId: string,
  userId: string,
  data: NoteInput,
): Promise<UpdateNoteResult> {
  const existing = await prisma.note.findFirst({
    where: { id: noteId, userId },
    select: { id: true, content: true },
  });
  if (!existing) return { status: "not_found" };

  const collectionId = data.collectionId ?? null;
  if (collectionId && !(await verifyCollectionOwnership(userId, collectionId))) {
    return { status: "invalid_collection" };
  }

  if (!(await verifyTagsOwnership(userId, data.tagIds))) {
    return { status: "invalid_tags" };
  }

  const note = await prisma.note.update({
    where: { id: noteId },
    data: {
      title: data.title,
      content: data.content,
      collectionId,
      tags: {
        deleteMany: {},
        create: data.tagIds.map((tagId) => ({ tagId })),
      },
    },
    select: { id: true, collectionId: true },
  });

  // Only re-embed when the content actually changed. Metadata-only edits
  // (collection/tag reassignment via the autosave path) would otherwise burn a
  // redundant OpenAI embedding call on identical text.
  if (existing.content !== data.content) {
    refreshNoteEmbedding(note.id, data.content);
  }

  return { status: "ok", id: note.id, collectionId: note.collectionId };
}

export async function updateNoteFlags(
  noteId: string,
  userId: string,
  data: { isPinned?: boolean; isFavorite?: boolean },
): Promise<{ id: string; isPinned: boolean; isFavorite: boolean } | null> {
  const existing = await prisma.note.findFirst({
    where: { id: noteId, userId },
    select: { id: true },
  });
  if (!existing) return null;

  return prisma.note.update({
    where: { id: noteId },
    data,
    select: { id: true, isPinned: true, isFavorite: true },
  });
}

export async function deleteNote(
  noteId: string,
  userId: string,
): Promise<boolean> {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { userId: true },
  });
  if (!note || note.userId !== userId) return false;

  await prisma.note.delete({ where: { id: noteId } });
  return true;
}

export interface NoteSearchResult {
  id: string;
  title: string;
  updatedAt: string;
  similarity?: number;
  excerpt?: string;
}

/**
 * Case-insensitive title substring match. Always shown in search results,
 * independent of the semantic similarity threshold.
 */
export async function searchNotesByTitle(
  userId: string,
  query: string,
  limit = 10,
): Promise<NoteSearchResult[]> {
  const notes = await prisma.note.findMany({
    where: { userId, title: { contains: query, mode: "insensitive" } },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: { id: true, title: true, updatedAt: true },
  });
  return notes.map((n) => ({
    id: n.id,
    title: n.title,
    updatedAt: n.updatedAt.toISOString(),
  }));
}

/**
 * Case-insensitive content substring match, for "normal" (non-semantic) search.
 * Mirrors `searchNotesByTitle` but matches on the note body. Scoped by `userId`.
 */
export async function searchNotesByContent(
  userId: string,
  query: string,
  limit = 10,
): Promise<NoteSearchResult[]> {
  const notes = await prisma.note.findMany({
    where: { userId, content: { contains: query, mode: "insensitive" } },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: { id: true, title: true, updatedAt: true },
  });
  return notes.map((n) => ({
    id: n.id,
    title: n.title,
    updatedAt: n.updatedAt.toISOString(),
  }));
}

// Default excerpt length for a matched note's content. The search dropdown
// ignores the excerpt field entirely, so this small default keeps that response
// lean; the AI chat route overrides it with a much larger value so grounding
// sees (nearly) the whole note, not just its opening lines.
const EXCERPT_CHARS = 300;

/**
 * Semantic nearest-neighbour search over note embeddings using pgvector's
 * `<=>` cosine-distance operator (matching the HNSW `vector_cosine_ops` index).
 * `similarity` is `1 - cosineDistance`, so higher is closer. Scoped by `userId`.
 */
export async function searchNotesByEmbedding(
  userId: string,
  queryEmbedding: number[],
  limit = 10,
  excerptChars = EXCERPT_CHARS,
): Promise<NoteSearchResult[]> {
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  const rows = await prisma.$queryRaw<
    {
      id: string;
      title: string;
      updatedAt: Date;
      similarity: number;
      excerpt: string;
    }[]
  >`
    SELECT id, title, "updatedAt",
           1 - (embedding <=> ${vectorLiteral}::vector) AS similarity,
           LEFT(COALESCE(content, ''), ${excerptChars}) AS excerpt
    FROM "Note"
    WHERE "userId" = ${userId} AND embedding IS NOT NULL
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT ${limit}
  `;

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    updatedAt: r.updatedAt.toISOString(),
    similarity: Number(r.similarity),
    excerpt: r.excerpt,
  }));
}
