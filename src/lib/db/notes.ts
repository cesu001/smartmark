import { prisma } from "@/lib/db";
import { Note } from "@/types/dashboard";

export async function getNoteStats(userId: string) {
  const [total, favorites] = await Promise.all([
    prisma.note.count({ where: { userId } }),
    prisma.note.count({ where: { userId, isFavorite: true } }),
  ]);
  return { total, favorites };
}
export async function getRecentNotes(
  userId: string,
  limit = 6,
): Promise<Note[]> {
  const notes = await prisma.note.findMany({
    where: { userId, isPinned: false },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      tags: true, // 這裡只需要中間表的資料即可
    },
  });

  return notes.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content ?? "",
    isPinned: n.isPinned,
    isFavorite: n.isFavorite,
    collectionId: n.collectionId,
    updatedAt: n.updatedAt.toLocaleDateString("zh-TW"),
    // 關鍵修正：只回傳 tagId 的字串陣列，符合 string[] 類型
    tags: n.tags.map((t) => t.tagId),
  }));
}
export async function getPinnedNotes(
  userId: string,
  limit = 3,
): Promise<Note[]> {
  const notes = await prisma.note.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      tags: true,
    },
  });
  return notes.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content ?? "",
    isPinned: n.isPinned,
    isFavorite: n.isFavorite,
    collectionId: n.collectionId,
    updatedAt: n.updatedAt.toLocaleDateString("zh-TW"),
    tags: n.tags.map((t) => t.tagId),
  }));
}
