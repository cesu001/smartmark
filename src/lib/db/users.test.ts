import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { changeUserPassword } from "@/lib/db/users";

const mockedPrisma = vi.mocked(prisma, { deep: true });
const mockedBcrypt = vi.mocked(bcrypt, { deep: true });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("changeUserPassword", () => {
  it("returns no_password when the account has no password set (OAuth-only user)", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ password: null } as never);
    const result = await changeUserPassword("user-1", "current", "newpass");
    expect(result).toBe("no_password");
    expect(mockedPrisma.user.update).not.toHaveBeenCalled();
  });

  it("returns invalid when the current password doesn't match", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ password: "hashed" } as never);
    mockedBcrypt.compare.mockResolvedValue(false as never);
    const result = await changeUserPassword("user-1", "wrong", "newpass");
    expect(result).toBe("invalid");
    expect(mockedPrisma.user.update).not.toHaveBeenCalled();
  });

  it("hashes and saves the new password when the current one is valid", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ password: "hashed" } as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockedBcrypt.hash.mockResolvedValue("new-hashed" as never);

    const result = await changeUserPassword("user-1", "current", "newpass");

    expect(result).toBe("ok");
    expect(mockedBcrypt.hash).toHaveBeenCalledWith("newpass", 12);
    expect(mockedPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { password: "new-hashed" },
    });
  });
});
