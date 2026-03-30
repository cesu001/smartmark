// @/lib/db/tags.ts
import { prisma } from "@/lib/db";
import { Tag } from "@/types/dashboard"; // 記得引入介面

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
    // 將 Prisma 計算出的數量填入 noteCount
    noteCount: tag._count.notes,
  }));
}
