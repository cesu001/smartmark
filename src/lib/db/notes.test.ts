import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    note: {
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  },
}));

vi.mock("@/lib/db/collections", () => ({
  verifyCollectionOwnership: vi.fn(),
  getOrCreateDraftCollection: vi.fn(),
}));

vi.mock("@/lib/db/tags", () => ({
  verifyTagsOwnership: vi.fn(),
}));

vi.mock("@/lib/ai/embeddings", () => ({
  embedNoteContent: vi.fn().mockResolvedValue(undefined),
  embedText: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { verifyCollectionOwnership, getOrCreateDraftCollection } from "@/lib/db/collections";
import { verifyTagsOwnership } from "@/lib/db/tags";
import { embedNoteContent } from "@/lib/ai/embeddings";
import {
  createNote,
  updateNote,
  deleteNote,
  searchNotesByTitle,
  searchNotesByContent,
  searchNotesByEmbedding,
} from "@/lib/db/notes";

const mockedPrisma = vi.mocked(prisma, { deep: true });
const mockedVerifyCollectionOwnership = vi.mocked(verifyCollectionOwnership);
const mockedGetOrCreateDraftCollection = vi.mocked(getOrCreateDraftCollection);
const mockedVerifyTagsOwnership = vi.mocked(verifyTagsOwnership);
const mockedEmbedNoteContent = vi.mocked(embedNoteContent);

beforeEach(() => {
  vi.clearAllMocks();
  mockedEmbedNoteContent.mockResolvedValue(undefined);
});

describe("createNote", () => {
  it("rejects when collectionId doesn't belong to the user", async () => {
    mockedVerifyCollectionOwnership.mockResolvedValue(false);
    const result = await createNote("user-1", {
      title: "t",
      content: "",
      collectionId: "other-col",
      tagIds: [],
    });
    expect(result).toEqual({ status: "invalid_collection" });
    expect(mockedPrisma.note.create).not.toHaveBeenCalled();
  });

  it("rejects when a tagId doesn't belong to the user", async () => {
    mockedVerifyCollectionOwnership.mockResolvedValue(true);
    mockedVerifyTagsOwnership.mockResolvedValue(false);
    const result = await createNote("user-1", {
      title: "t",
      content: "",
      collectionId: "col-1",
      tagIds: ["other-tag"],
    });
    expect(result).toEqual({ status: "invalid_tags" });
    expect(mockedPrisma.note.create).not.toHaveBeenCalled();
  });

  it("creates the note when collection and tags are owned", async () => {
    mockedVerifyCollectionOwnership.mockResolvedValue(true);
    mockedVerifyTagsOwnership.mockResolvedValue(true);
    mockedPrisma.note.create.mockResolvedValue({ id: "note-1" } as never);

    const result = await createNote("user-1", {
      title: "t",
      content: "",
      collectionId: "col-1",
      tagIds: ["tag-1"],
    });

    expect(result).toEqual({ status: "ok", id: "note-1" });
  });

  it("triggers an embedding refresh after a successful create", async () => {
    mockedVerifyCollectionOwnership.mockResolvedValue(true);
    mockedVerifyTagsOwnership.mockResolvedValue(true);
    mockedPrisma.note.create.mockResolvedValue({ id: "note-1" } as never);

    await createNote("user-1", {
      title: "t",
      content: "hello world",
      collectionId: "col-1",
      tagIds: [],
    });

    expect(mockedEmbedNoteContent).toHaveBeenCalledWith("note-1", "hello world");
  });

  it("skips collection ownership check when collectionId is not provided", async () => {
    mockedVerifyTagsOwnership.mockResolvedValue(true);
    mockedPrisma.note.create.mockResolvedValue({ id: "note-1" } as never);

    const result = await createNote("user-1", { title: "t", content: "", tagIds: [] });

    expect(mockedVerifyCollectionOwnership).not.toHaveBeenCalled();
    expect(result).toEqual({ status: "ok", id: "note-1" });
  });
});

describe("updateNote", () => {
  it("returns not_found when the note doesn't belong to the user", async () => {
    mockedPrisma.note.findFirst.mockResolvedValue(null);
    const result = await updateNote("note-1", "user-1", { title: "t", content: "", tagIds: [] });
    expect(result).toEqual({ status: "not_found" });
  });

  it("auto-creates a Draft collection when none is provided", async () => {
    mockedPrisma.note.findFirst.mockResolvedValue({ id: "note-1" } as never);
    mockedGetOrCreateDraftCollection.mockResolvedValue("draft-1");
    mockedVerifyTagsOwnership.mockResolvedValue(true);
    mockedPrisma.note.update.mockResolvedValue({ id: "note-1", collectionId: "draft-1" } as never);

    const result = await updateNote("note-1", "user-1", {
      title: "t",
      content: "",
      collectionId: null,
      tagIds: [],
    });

    expect(mockedGetOrCreateDraftCollection).toHaveBeenCalledWith("user-1");
    expect(mockedVerifyCollectionOwnership).not.toHaveBeenCalled();
    expect(result).toEqual({ status: "ok", id: "note-1", collectionId: "draft-1" });
  });

  it("rejects when the given collectionId doesn't belong to the user", async () => {
    mockedPrisma.note.findFirst.mockResolvedValue({ id: "note-1" } as never);
    mockedVerifyCollectionOwnership.mockResolvedValue(false);

    const result = await updateNote("note-1", "user-1", {
      title: "t",
      content: "",
      collectionId: "other-col",
      tagIds: [],
    });

    expect(result).toEqual({ status: "invalid_collection" });
    expect(mockedPrisma.note.update).not.toHaveBeenCalled();
  });

  it("rejects when a tagId doesn't belong to the user", async () => {
    mockedPrisma.note.findFirst.mockResolvedValue({ id: "note-1" } as never);
    mockedVerifyCollectionOwnership.mockResolvedValue(true);
    mockedVerifyTagsOwnership.mockResolvedValue(false);

    const result = await updateNote("note-1", "user-1", {
      title: "t",
      content: "",
      collectionId: "col-1",
      tagIds: ["other-tag"],
    });

    expect(result).toEqual({ status: "invalid_tags" });
    expect(mockedPrisma.note.update).not.toHaveBeenCalled();
  });

  it("skips the embedding refresh when content is unchanged", async () => {
    mockedPrisma.note.findFirst.mockResolvedValue({ id: "note-1", content: "same" } as never);
    mockedGetOrCreateDraftCollection.mockResolvedValue("draft-1");
    mockedVerifyTagsOwnership.mockResolvedValue(true);
    mockedPrisma.note.update.mockResolvedValue({ id: "note-1", collectionId: "draft-1" } as never);

    await updateNote("note-1", "user-1", {
      title: "new title",
      content: "same",
      collectionId: null,
      tagIds: [],
    });

    expect(mockedEmbedNoteContent).not.toHaveBeenCalled();
  });

  it("re-embeds when content changed", async () => {
    mockedPrisma.note.findFirst.mockResolvedValue({ id: "note-1", content: "old" } as never);
    mockedGetOrCreateDraftCollection.mockResolvedValue("draft-1");
    mockedVerifyTagsOwnership.mockResolvedValue(true);
    mockedPrisma.note.update.mockResolvedValue({ id: "note-1", collectionId: "draft-1" } as never);

    await updateNote("note-1", "user-1", {
      title: "t",
      content: "new content",
      collectionId: null,
      tagIds: [],
    });

    expect(mockedEmbedNoteContent).toHaveBeenCalledWith("note-1", "new content");
  });
});

describe("deleteNote", () => {
  it("returns false when the note doesn't exist", async () => {
    mockedPrisma.note.findUnique.mockResolvedValue(null);
    expect(await deleteNote("note-1", "user-1")).toBe(false);
    expect(mockedPrisma.note.delete).not.toHaveBeenCalled();
  });

  it("returns false when the note belongs to a different user", async () => {
    mockedPrisma.note.findUnique.mockResolvedValue({ userId: "someone-else" } as never);
    expect(await deleteNote("note-1", "user-1")).toBe(false);
    expect(mockedPrisma.note.delete).not.toHaveBeenCalled();
  });

  it("deletes and returns true when the note belongs to the user", async () => {
    mockedPrisma.note.findUnique.mockResolvedValue({ userId: "user-1" } as never);
    expect(await deleteNote("note-1", "user-1")).toBe(true);
    expect(mockedPrisma.note.delete).toHaveBeenCalledWith({ where: { id: "note-1" } });
  });
});

describe("searchNotesByTitle", () => {
  it("scopes by userId with a case-insensitive contains and maps updatedAt to ISO", async () => {
    const updatedAt = new Date("2026-07-08T10:00:00.000Z");
    mockedPrisma.note.findMany.mockResolvedValue([
      { id: "note-1", title: "React hooks", updatedAt },
    ] as never);

    const results = await searchNotesByTitle("user-1", "react");

    expect(mockedPrisma.note.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: "user-1",
          title: { contains: "react", mode: "insensitive" },
        },
      }),
    );
    expect(results).toEqual([
      { id: "note-1", title: "React hooks", updatedAt: updatedAt.toISOString() },
    ]);
  });
});

describe("searchNotesByContent", () => {
  it("scopes by userId with a case-insensitive contains on content and maps updatedAt to ISO", async () => {
    const updatedAt = new Date("2026-07-08T10:00:00.000Z");
    mockedPrisma.note.findMany.mockResolvedValue([
      { id: "note-1", title: "React hooks", updatedAt },
    ] as never);

    const results = await searchNotesByContent("user-1", "useEffect");

    expect(mockedPrisma.note.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: "user-1",
          content: { contains: "useEffect", mode: "insensitive" },
        },
      }),
    );
    expect(results).toEqual([
      { id: "note-1", title: "React hooks", updatedAt: updatedAt.toISOString() },
    ]);
  });
});

describe("searchNotesByEmbedding", () => {
  it("maps raw rows to the result shape with numeric similarity and ISO updatedAt", async () => {
    const updatedAt = new Date("2026-07-08T10:00:00.000Z");
    mockedPrisma.$queryRaw.mockResolvedValue([
      { id: "note-1", title: "Vectors", updatedAt, similarity: 0.91 },
    ] as never);

    const results = await searchNotesByEmbedding("user-1", [0.1, 0.2, 0.3]);

    expect(mockedPrisma.$queryRaw).toHaveBeenCalled();
    expect(results).toEqual([
      {
        id: "note-1",
        title: "Vectors",
        updatedAt: updatedAt.toISOString(),
        similarity: 0.91,
      },
    ]);
  });

  it("passes the truncated content excerpt through from the raw row", async () => {
    const updatedAt = new Date("2026-07-08T10:00:00.000Z");
    mockedPrisma.$queryRaw.mockResolvedValue([
      {
        id: "note-1",
        title: "Vectors",
        updatedAt,
        similarity: 0.91,
        excerpt: "Vectors are used for semantic search.",
      },
    ] as never);

    const results = await searchNotesByEmbedding("user-1", [0.1, 0.2, 0.3]);

    expect(results[0].excerpt).toBe("Vectors are used for semantic search.");
  });
});
