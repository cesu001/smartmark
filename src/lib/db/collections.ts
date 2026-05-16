import { prisma } from "@/lib/db";

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
