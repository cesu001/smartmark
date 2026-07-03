import { prisma } from "@/lib/db";
import type { Note } from "@/types/dashboard";

export async function getAllCollections(
  userId: string,
): Promise<{ id: string; name: string }[]> {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

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
        where: { userId },
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

export async function createCollection(
  userId: string,
  name: string,
): Promise<{ id: string; name: string }> {
  return prisma.collection.create({
    data: { name, userId },
    select: { id: true, name: true },
  });
}

export async function verifyCollectionOwnership(
  userId: string,
  collectionId: string,
): Promise<boolean> {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { id: true },
  });
  return collection !== null;
}

export async function getOrCreateDraftCollection(
  userId: string,
): Promise<string> {
  const draft = await prisma.collection.findFirst({
    where: { userId, name: "Draft" },
    select: { id: true },
  });
  if (draft) return draft.id;
  const created = await prisma.collection.create({
    data: { name: "Draft", userId },
    select: { id: true },
  });
  return created.id;
}

export async function getCollectionNotesSummary(
  collectionId: string,
  userId: string,
): Promise<{ id: string; title: string }[] | null> {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: {
      notes: {
        where: { userId },
        select: { id: true, title: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
  if (!collection) return null;
  return collection.notes;
}
