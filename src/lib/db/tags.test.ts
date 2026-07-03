import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    tag: {
      count: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";
import { verifyTagsOwnership } from "@/lib/db/tags";

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
