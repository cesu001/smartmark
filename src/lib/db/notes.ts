import { cache } from "react";
import { prisma } from "@/lib/db";
import { Note } from "@/types/dashboard";
import {
  verifyCollectionOwnership,
  getOrCreateDraftCollection,
} from "./collections";
import { verifyTagsOwnership } from "./tags";

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
    select: { id: true },
  });
  if (!existing) return { status: "not_found" };

  let collectionId = data.collectionId ?? null;
  if (!collectionId) {
    collectionId = await getOrCreateDraftCollection(userId);
  } else if (!(await verifyCollectionOwnership(userId, collectionId))) {
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
