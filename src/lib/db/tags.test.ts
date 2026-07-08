import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    tag: {
      count: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";
import {
  verifyTagsOwnership,
  updateTagName,
  updateTagFavorite,
  deleteTag,
} from "@/lib/db/tags";

const mockedPrisma = vi.mocked(prisma, { deep: true });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("verifyTagsOwnership", () => {
  it("returns true without querying when tagIds is empty", async () => {
    expect(await verifyTagsOwnership("user-1", [])).toBe(true);
    expect(mockedPrisma.tag.count).not.toHaveBeenCalled();
  });

  it("returns true when every tag belongs to the user", async () => {
    mockedPrisma.tag.count.mockResolvedValue(2);
    expect(await verifyTagsOwnership("user-1", ["t1", "t2"])).toBe(true);
  });

  it("returns false when some tags don't belong to the user", async () => {
    mockedPrisma.tag.count.mockResolvedValue(1);
    expect(await verifyTagsOwnership("user-1", ["t1", "t2"])).toBe(false);
  });
});

describe("updateTagName", () => {
  it("returns null when the tag doesn't belong to the user", async () => {
    mockedPrisma.tag.findFirst.mockResolvedValue(null);
    expect(await updateTagName("tag-1", "user-1", "New Name")).toBeNull();
    expect(mockedPrisma.tag.update).not.toHaveBeenCalled();
  });

  it("renames the tag when owned by the user", async () => {
    mockedPrisma.tag.findFirst.mockResolvedValue({ id: "tag-1" } as never);
    mockedPrisma.tag.update.mockResolvedValue({ id: "tag-1", name: "New Name" } as never);
    expect(await updateTagName("tag-1", "user-1", "New Name")).toEqual({
      id: "tag-1",
      name: "New Name",
    });
  });
});

describe("updateTagFavorite", () => {
  it("returns null when the tag doesn't belong to the user", async () => {
    mockedPrisma.tag.findFirst.mockResolvedValue(null);
    expect(await updateTagFavorite("tag-1", "user-1", true)).toBeNull();
    expect(mockedPrisma.tag.update).not.toHaveBeenCalled();
  });

  it("updates isFavorite when owned by the user", async () => {
    mockedPrisma.tag.findFirst.mockResolvedValue({ id: "tag-1" } as never);
    mockedPrisma.tag.update.mockResolvedValue({
      id: "tag-1",
      isFavorite: true,
    } as never);
    expect(await updateTagFavorite("tag-1", "user-1", true)).toEqual({
      id: "tag-1",
      isFavorite: true,
    });
    expect(mockedPrisma.tag.update).toHaveBeenCalledWith({
      where: { id: "tag-1" },
      data: { isFavorite: true },
      select: { id: true, isFavorite: true },
    });
  });
});

describe("deleteTag", () => {
  it("returns false when the tag doesn't belong to the user", async () => {
    mockedPrisma.tag.findFirst.mockResolvedValue(null);
    expect(await deleteTag("tag-1", "user-1")).toBe(false);
    expect(mockedPrisma.tag.delete).not.toHaveBeenCalled();
  });

  it("deletes the tag when owned by the user", async () => {
    mockedPrisma.tag.findFirst.mockResolvedValue({ id: "tag-1" } as never);
    expect(await deleteTag("tag-1", "user-1")).toBe(true);
    expect(mockedPrisma.tag.delete).toHaveBeenCalledWith({ where: { id: "tag-1" } });
  });
});
