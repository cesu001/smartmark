import { prisma } from "@/lib/db";
import { Note } from "@/types/dashboard";

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

export async function getNoteStats(userId: string) {
  const [total, favorites] = await Promise.all([
    prisma.note.count({ where: { userId } }),
    prisma.note.count({ where: { userId, isFavorite: true } }),
  ]);
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
