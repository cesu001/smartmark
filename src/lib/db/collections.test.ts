import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    collection: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";
import { verifyCollectionOwnership, getOrCreateDraftCollection } from "@/lib/db/collections";

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
