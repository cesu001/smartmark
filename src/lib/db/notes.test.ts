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
}));

vi.mock("@/lib/db/tags", () => ({
  verifyTagsOwnership: vi.fn(),
}));

vi.mock("@/lib/ai/embeddings", () => ({
  embedNoteContent: vi.fn().mockResolvedValue(undefined),
  embedText: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { verifyCollectionOwnership } from "@/lib/db/collections";
import { verifyTagsOwnership } from "@/lib/db/tags";
import { embedNoteContent } from "@/lib/ai/embeddings";
import {
  createNote,
  updateNote,
  updateNoteFlags,
  deleteNote,
  searchNotesByTitle,
  searchNotesByContent,
  searchNotesByEmbedding,
  getAllNotes,
  getFavoriteNotes,
  NOTES_PAGE_SIZE,
} from "@/lib/db/notes";

const mockedPrisma = vi.mocked(prisma, { deep: true });
const mockedVerifyCollectionOwnership = vi.mocked(verifyCollectionOwnership);
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

  it("leaves the note uncategorized when no collection is provided", async () => {
    mockedPrisma.note.findFirst.mockResolvedValue({ id: "note-1" } as never);
    mockedVerifyTagsOwnership.mockResolvedValue(true);
    mockedPrisma.note.update.mockResolvedValue({ id: "note-1", collectionId: null } as never);

    const result = await updateNote("note-1", "user-1", {
      title: "t",
      content: "",
      collectionId: null,
      tagIds: [],
    });

    // No collection given → stays null (no Draft fallback), and ownership isn't checked.
    expect(mockedVerifyCollectionOwnership).not.toHaveBeenCalled();
    expect(mockedPrisma.note.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ collectionId: null }) }),
    );
    expect(result).toEqual({ status: "ok", id: "note-1", collectionId: null });
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
    mockedVerifyTagsOwnership.mockResolvedValue(true);
    mockedPrisma.note.update.mockResolvedValue({ id: "note-1", collectionId: null } as never);

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
    mockedVerifyTagsOwnership.mockResolvedValue(true);
    mockedPrisma.note.update.mockResolvedValue({ id: "note-1", collectionId: null } as never);

    await updateNote("note-1", "user-1", {
      title: "t",
      content: "new content",
      collectionId: null,
      tagIds: [],
    });

    expect(mockedEmbedNoteContent).toHaveBeenCalledWith("note-1", "new content");
  });
});

describe("updateNoteFlags", () => {
  it("returns null when the note doesn't belong to the user", async () => {
    mockedPrisma.note.findFirst.mockResolvedValue(null);

    const result = await updateNoteFlags("note-1", "user-1", { isPinned: true });

    expect(result).toBeNull();
    expect(mockedPrisma.note.update).not.toHaveBeenCalled();
  });

  it("updates the flags and returns them when the note is owned", async () => {
    mockedPrisma.note.findFirst.mockResolvedValue({ id: "note-1" } as never);
    mockedPrisma.note.update.mockResolvedValue({
      id: "note-1",
      isPinned: true,
      isFavorite: false,
    } as never);

    const result = await updateNoteFlags("note-1", "user-1", { isPinned: true });

    expect(mockedPrisma.note.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "note-1", userId: "user-1" } }),
    );
    expect(mockedPrisma.note.update).toHaveBeenCalledWith({
      where: { id: "note-1" },
      data: { isPinned: true },
      select: { id: true, isPinned: true, isFavorite: true },
    });
    expect(result).toEqual({ id: "note-1", isPinned: true, isFavorite: false });
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

describe("note list pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rows shaped like the Prisma result: `tags` is the NoteTag join, not the tag itself.
  function makeRows(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: `note-${i}`,
      title: `Note ${i}`,
      content: "body",
      isFavorite: false,
      isPinned: false,
      collectionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    }));
  }

  it("requests one row beyond the page size to detect a next page", async () => {
    mockedPrisma.note.findMany.mockResolvedValue(makeRows(3) as never);

    await getAllNotes("user-1");

    const args = mockedPrisma.note.findMany.mock.calls[0][0];
    expect(args?.take).toBe(NOTES_PAGE_SIZE + 1);
    expect(args?.where).toEqual({ userId: "user-1" });
  });

  it("orders by updatedAt then id so the sort is total", async () => {
    mockedPrisma.note.findMany.mockResolvedValue([] as never);

    await getAllNotes("user-1");

    const args = mockedPrisma.note.findMany.mock.calls[0][0];
    expect(args?.orderBy).toEqual([{ updatedAt: "desc" }, { id: "desc" }]);
  });

  it("returns a null cursor and every row when the page is not full", async () => {
    mockedPrisma.note.findMany.mockResolvedValue(makeRows(3) as never);

    const page = await getAllNotes("user-1", undefined, 5);

    expect(page.notes).toHaveLength(3);
    expect(page.nextCursor).toBeNull();
  });

  it("trims the extra row and returns the last kept id as the cursor", async () => {
    mockedPrisma.note.findMany.mockResolvedValue(makeRows(4) as never);

    const page = await getAllNotes("user-1", undefined, 3);

    expect(page.notes).toHaveLength(3);
    expect(page.notes.at(-1)?.id).toBe("note-2");
    expect(page.nextCursor).toBe("note-2");
  });

  it("skips the cursor row itself when paging forward", async () => {
    mockedPrisma.note.findMany.mockResolvedValue([] as never);

    await getAllNotes("user-1", "note-9");

    const args = mockedPrisma.note.findMany.mock.calls[0][0];
    expect(args?.cursor).toEqual({ id: "note-9" });
    expect(args?.skip).toBe(1);
  });

  it("omits cursor and skip on the first page", async () => {
    mockedPrisma.note.findMany.mockResolvedValue([] as never);

    await getAllNotes("user-1");

    const args = mockedPrisma.note.findMany.mock.calls[0][0];
    expect(args?.cursor).toBeUndefined();
    expect(args?.skip).toBeUndefined();
  });

  it("scopes the favorites page by isFavorite and userId", async () => {
    mockedPrisma.note.findMany.mockResolvedValue([] as never);

    await getFavoriteNotes("user-1");

    const args = mockedPrisma.note.findMany.mock.calls[0][0];
    expect(args?.where).toEqual({ userId: "user-1", isFavorite: true });
  });
});
