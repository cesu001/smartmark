// @/lib/db/tags.ts
import { prisma } from "@/lib/db";
import { Tag } from "@/types/dashboard"; // 記得引入介面
import type { Note } from "@/types/dashboard";

export async function getTagWithNotes(
  tagId: string,
  userId: string,
): Promise<{ name: string; notes: Note[] } | null> {
  const tag = await prisma.tag.findFirst({
    where: { id: tagId, userId },
    select: {
      name: true,
      notes: {
        orderBy: { note: { updatedAt: "desc" } },
        include: {
          note: {
            include: {
              tags: {
                include: { tag: { select: { id: true, name: true } } },
              },
            },
          },
        },
      },
    },
  });
  if (!tag) return null;
  return {
    name: tag.name,
    notes: tag.notes.map(({ note: n }) => ({
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

export async function getFavoriteTags(userId: string): Promise<Tag[]> {
  const tags = await prisma.tag.findMany({
    where: { userId, isFavorite: true },
    include: { _count: { select: { notes: true } } },
  });
  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    isAiGenerated: tag.isAiGenerated,
    isFavorite: tag.isFavorite,
    noteCount: tag._count.notes,
  }));
}

export async function getAllTags(userId: string): Promise<Tag[]> {
  const tags = await prisma.tag.findMany({
    where: { userId },
    include: {
      // 叫 Prisma 計算關聯的筆記數量
      _count: {
        select: { notes: true },
      },
    },
  });

  // 將 Prisma 的結果轉換（Map）成符合 Tag 介面的格式
  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    isAiGenerated: tag.isAiGenerated,
    isFavorite: tag.isFavorite,
    noteCount: tag._count.notes,
  }));
}
