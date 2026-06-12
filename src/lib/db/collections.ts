import { prisma } from "@/lib/db";
import type { Note } from "@/types/dashboard";

export async function getCollectionStats(
  userId: string,
): Promise<{ total: number; favorites: number }> {
  const [total, favorites] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);
  return { total, favorites };
}

export async function getRecentCollection(userId: string, limit = 3) {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      updatedAt: true,
      isFavorite: true,
      _count: { select: { notes: true } },
    },
  });
  return collections;
}

export async function getCollectionWithNotes(
  collectionId: string,
  userId: string,
): Promise<{ name: string; notes: Note[] } | null> {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: {
      name: true,
      notes: {
        orderBy: { updatedAt: "desc" },
        include: {
          tags: {
            include: { tag: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });
  if (!collection) return null;
  return {
    name: collection.name,
    notes: collection.notes.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content ?? "",
      isPinned: n.isPinned,
      isFavorite: n.isFavorite,
      collectionId: n.collectionId,
      updatedAt: n.updatedAt.toLocaleDateString("zh-TW"),
      tags: n.tags.map((t) => t.tag),
    })),
  };
}

export async function getFavCollection(userId: string, limit = 2) {
  const collections = await prisma.collection.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      updatedAt: true,
      isFavorite: true,
      _count: { select: { notes: true } },
    },
  });
  return collections;
}
