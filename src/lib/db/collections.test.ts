import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    collection: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    note: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/db";
import {
  verifyCollectionOwnership,
  getOrCreateDraftCollection,
  getCollectionStats,
  searchCollectionsByTitle,
  updateCollectionName,
  updateCollectionFavorite,
  deleteCollectionAndNotes,
} from "@/lib/db/collections";

const mockedPrisma = vi.mocked(prisma, { deep: true });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("verifyCollectionOwnership", () => {
  it("returns true when the collection belongs to the user", async () => {
    mockedPrisma.collection.findFirst.mockResolvedValue({ id: "col-1" } as never);
    expect(await verifyCollectionOwnership("user-1", "col-1")).toBe(true);
  });

  it("returns false when the collection is not found for that user", async () => {
    mockedPrisma.collection.findFirst.mockResolvedValue(null);
    expect(await verifyCollectionOwnership("user-1", "col-1")).toBe(false);
  });
});

describe("getOrCreateDraftCollection", () => {
  it("returns the existing Draft collection id without creating one", async () => {
    mockedPrisma.collection.findFirst.mockResolvedValue({ id: "draft-1" } as never);
    expect(await getOrCreateDraftCollection("user-1")).toBe("draft-1");
    expect(mockedPrisma.collection.create).not.toHaveBeenCalled();
  });

  it("creates a Draft collection when none exists", async () => {
    mockedPrisma.collection.findFirst.mockResolvedValue(null);
    mockedPrisma.collection.create.mockResolvedValue({ id: "draft-2" } as never);
    expect(await getOrCreateDraftCollection("user-1")).toBe("draft-2");
    expect(mockedPrisma.collection.create).toHaveBeenCalledWith({
      data: { name: "Draft", userId: "user-1" },
      select: { id: true },
    });
  });
});

describe("getCollectionStats", () => {
  it("derives total and favorites from the collection list", async () => {
    mockedPrisma.collection.findMany.mockResolvedValue([
      { id: "c1", name: "A", isFavorite: true, _count: { notes: 2 } },
      { id: "c2", name: "B", isFavorite: false, _count: { notes: 0 } },
      { id: "c3", name: "C", isFavorite: true, _count: { notes: 1 } },
    ] as never);

    expect(await getCollectionStats("user-1")).toEqual({ total: 3, favorites: 2 });
  });

  it("returns zeros when the user has no collections", async () => {
    mockedPrisma.collection.findMany.mockResolvedValue([]);
    expect(await getCollectionStats("user-1")).toEqual({ total: 0, favorites: 0 });
  });
});

describe("searchCollectionsByTitle", () => {
  it("scopes by userId with a case-insensitive contains and maps noteCount", async () => {
    mockedPrisma.collection.findMany.mockResolvedValue([
      { id: "col-1", name: "React Notes", _count: { notes: 4 } },
    ] as never);

    const results = await searchCollectionsByTitle("user-1", "react");

    expect(mockedPrisma.collection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: "user-1",
          name: { contains: "react", mode: "insensitive" },
        },
      }),
    );
    expect(results).toEqual([
      { id: "col-1", name: "React Notes", noteCount: 4 },
    ]);
  });
});

describe("updateCollectionName", () => {
  it("returns null when the collection doesn't belong to the user", async () => {
    mockedPrisma.collection.findFirst.mockResolvedValue(null);
    expect(await updateCollectionName("col-1", "user-1", "New Name")).toBeNull();
    expect(mockedPrisma.collection.update).not.toHaveBeenCalled();
  });

  it("renames the collection when owned by the user", async () => {
    mockedPrisma.collection.findFirst.mockResolvedValue({ id: "col-1" } as never);
    mockedPrisma.collection.update.mockResolvedValue({
      id: "col-1",
      name: "New Name",
    } as never);
    expect(await updateCollectionName("col-1", "user-1", "New Name")).toEqual({
      id: "col-1",
      name: "New Name",
    });
  });
});

describe("updateCollectionFavorite", () => {
  it("returns null when the collection doesn't belong to the user", async () => {
    mockedPrisma.collection.findFirst.mockResolvedValue(null);
    expect(await updateCollectionFavorite("col-1", "user-1", true)).toBeNull();
    expect(mockedPrisma.collection.update).not.toHaveBeenCalled();
  });

  it("updates isFavorite when owned by the user", async () => {
    mockedPrisma.collection.findFirst.mockResolvedValue({ id: "col-1" } as never);
    mockedPrisma.collection.update.mockResolvedValue({
      id: "col-1",
      isFavorite: true,
    } as never);
    expect(await updateCollectionFavorite("col-1", "user-1", true)).toEqual({
      id: "col-1",
      isFavorite: true,
    });
    expect(mockedPrisma.collection.update).toHaveBeenCalledWith({
      where: { id: "col-1" },
      data: { isFavorite: true },
      select: { id: true, isFavorite: true },
    });
  });
});

describe("deleteCollectionAndNotes", () => {
  it("returns false when the collection doesn't belong to the user", async () => {
    mockedPrisma.collection.findFirst.mockResolvedValue(null);
    expect(await deleteCollectionAndNotes("col-1", "user-1")).toBe(false);
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("deletes the collection's notes and the collection in a transaction", async () => {
    mockedPrisma.collection.findFirst.mockResolvedValue({ id: "col-1" } as never);
    mockedPrisma.$transaction.mockResolvedValue([] as never);
    expect(await deleteCollectionAndNotes("col-1", "user-1")).toBe(true);
    expect(mockedPrisma.note.deleteMany).toHaveBeenCalledWith({
      where: { collectionId: "col-1", userId: "user-1" },
    });
    expect(mockedPrisma.collection.delete).toHaveBeenCalledWith({
      where: { id: "col-1" },
    });
    expect(mockedPrisma.$transaction).toHaveBeenCalled();
  });
});
