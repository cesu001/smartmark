import { describe, it, expect } from "vitest";
import { validateImportFile, deriveTitleFromFilename } from "@/lib/note-import";

describe("validateImportFile", () => {
  it("accepts .md files", () => {
    expect(validateImportFile({ name: "notes.md", size: 100 })).toEqual({ valid: true });
  });

  it("accepts .txt files", () => {
    expect(validateImportFile({ name: "notes.txt", size: 100 })).toEqual({ valid: true });
  });

  it("accepts uppercase extensions", () => {
    expect(validateImportFile({ name: "NOTES.MD", size: 100 })).toEqual({ valid: true });
  });

  it("rejects disallowed extensions", () => {
    const result = validateImportFile({ name: "notes.pdf", size: 100 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/\.md and \.txt/);
  });

  it("rejects files with no extension", () => {
    const result = validateImportFile({ name: "notes", size: 100 });
    expect(result.valid).toBe(false);
  });

  it("rejects files over the size cap", () => {
    const result = validateImportFile({ name: "notes.md", size: 6 * 1024 * 1024 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/too large/);
  });
});

describe("deriveTitleFromFilename", () => {
  it("strips the extension", () => {
    expect(deriveTitleFromFilename("Meeting Notes.md")).toBe("Meeting Notes");
  });

  it("handles files with no extension", () => {
    expect(deriveTitleFromFilename("README")).toBe("README");
  });

  it("falls back to Untitled Note for an empty base name", () => {
    expect(deriveTitleFromFilename(".md")).toBe("Untitled Note");
  });
});
