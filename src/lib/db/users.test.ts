import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock("@/lib/r2", () => ({
  deleteFromR2: vi.fn(),
}));

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { deleteFromR2 } from "@/lib/r2";
import { changeUserPassword, deleteUser } from "@/lib/db/users";

const mockedPrisma = vi.mocked(prisma, { deep: true });
const mockedBcrypt = vi.mocked(bcrypt, { deep: true });
const mockedDeleteFromR2 = vi.mocked(deleteFromR2);

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

describe("deleteUser", () => {
  it("deletes the R2 avatar file before deleting the user when an avatarKey exists", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ avatarKey: "avatars/user-1-abc.png" } as never);
    mockedDeleteFromR2.mockResolvedValue(undefined);

    await deleteUser("user-1");

    expect(mockedDeleteFromR2).toHaveBeenCalledWith("avatars/user-1-abc.png");
    expect(mockedPrisma.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });

  it("skips R2 deletion when the user has no avatarKey", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ avatarKey: null } as never);

    await deleteUser("user-1");

    expect(mockedDeleteFromR2).not.toHaveBeenCalled();
    expect(mockedPrisma.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });

  it("still deletes the user when R2 cleanup fails", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ avatarKey: "avatars/user-1-abc.png" } as never);
    mockedDeleteFromR2.mockRejectedValue(new Error("R2 unavailable"));

    await expect(deleteUser("user-1")).resolves.toBeUndefined();

    expect(mockedPrisma.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });
});
