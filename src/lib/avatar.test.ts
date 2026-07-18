import { describe, it, expect } from "vitest";
import { validateAvatarFile, MAX_AVATAR_SIZE_BYTES } from "@/lib/avatar";

describe("validateAvatarFile", () => {
  it("accepts a valid png under the size limit", () => {
    const result = validateAvatarFile("avatar.png", 1024, "image/png");
    expect(result).toEqual({ valid: true, extension: "png" });
  });

  it("rejects files over the max size", () => {
    const result = validateAvatarFile("avatar.png", MAX_AVATAR_SIZE_BYTES + 1, "image/png");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/5 MB/);
  });

  it("rejects unsupported extensions", () => {
    const result = validateAvatarFile("avatar.pdf", 1024, "application/pdf");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Unsupported file type/);
  });

  it("rejects a mismatched mime type for the given extension", () => {
    const result = validateAvatarFile("avatar.png", 1024, "image/gif");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/does not match/);
  });

  it("accepts every documented extension with its matching mime type", () => {
    const cases: [string, string][] = [
      ["a.png", "image/png"],
      ["a.jpg", "image/jpeg"],
      ["a.jpeg", "image/jpeg"],
      ["a.gif", "image/gif"],
      ["a.webp", "image/webp"],
    ];
    for (const [fileName, mimeType] of cases) {
      expect(validateAvatarFile(fileName, 1024, mimeType).valid).toBe(true);
    }
  });

  it("rejects SVG uploads even when the mime type matches the extension", () => {
    const result = validateAvatarFile("avatar.svg", 1024, "image/svg+xml");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Unsupported file type/);
  });
});
