import { prisma } from "@/lib/db";

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true,
      createdAt: true,
    },
  });
}

export async function getUserStats(userId: string) {
  const [notes, favNotes, collections, favCollections, tags, favTags] =
    await Promise.all([
      prisma.note.count({ where: { userId } }),
      prisma.note.count({ where: { userId, isFavorite: true } }),
      prisma.collection.count({ where: { userId } }),
      prisma.collection.count({ where: { userId, isFavorite: true } }),
      prisma.tag.count({ where: { userId } }),
      prisma.tag.count({ where: { userId, isFavorite: true } }),
    ]);
  return {
    notes,
    collections,
    tags,
    favorites: favNotes + favCollections + favTags,
  };
}
