import { prisma } from "@/lib/db";

type ContentType = "frontend" | "backend" | "testing" | "general";

const TAG_CONTENT_TYPES: Record<string, ContentType> = {
  react: "frontend",
  typescript: "frontend",
  css: "frontend",
  javascript: "frontend",
  database: "backend",
  authentication: "backend",
  performance: "backend",
  "api design": "backend",
  testing: "testing",
};

const CONTENT_TYPE_BORDER_COLORS: Record<ContentType, string> = {
  frontend: "border-l-blue-500",
  backend:  "border-l-green-500",
  testing:  "border-l-orange-500",
  general:  "border-l-border",
};

function deriveBorderColor(tagNames: string[]): string {
  const counts: Record<ContentType, number> = {
    frontend: 0,
    backend: 0,
    testing: 0,
    general: 0,
  };

  for (const name of tagNames) {
    const type = TAG_CONTENT_TYPES[name.toLowerCase()] ?? "general";
    counts[type]++;
  }

  const dominant = (
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as ContentType
  );

  return CONTENT_TYPE_BORDER_COLORS[dominant];
}

export interface CollectionRow {
  id: string;
  name: string;
  noteCount: number;
  isFavorite: boolean;
  borderColor: string;
}

export async function getRecentCollections(
  userId: string,
  limit = 6
): Promise<CollectionRow[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      _count: { select: { notes: true } },
      notes: {
        include: {
          tags: { include: { tag: { select: { name: true } } } },
        },
      },
    },
  });

  return collections.map((c) => {
    const tagNames = c.notes.flatMap((n) => n.tags.map((nt) => nt.tag.name));
    return {
      id: c.id,
      name: c.name,
      noteCount: c._count.notes,
      isFavorite: c.isFavorite,
      borderColor: deriveBorderColor(tagNames),
    };
  });
}

export async function getCollectionStats(
  userId: string
): Promise<{ total: number; favorites: number }> {
  const [total, favorites] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);
  return { total, favorites };
}
