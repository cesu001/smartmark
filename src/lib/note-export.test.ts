import { describe, it, expect } from "vitest";
import { buildExportContent, buildExportFilename, EXPORT_FOOTER } from "@/lib/note-export";

describe("buildExportContent", () => {
  it("appends the footer after the trimmed content", () => {
    expect(buildExportContent("# Hello")).toBe(`# Hello\n\n---\n${EXPORT_FOOTER}\n`);
  });

  it("trims trailing whitespace before appending the footer", () => {
    expect(buildExportContent("# Hello   \n\n\n")).toBe(`# Hello\n\n---\n${EXPORT_FOOTER}\n`);
  });
});

describe("buildExportFilename", () => {
  it("appends .md to the title", () => {
    expect(buildExportFilename("Meeting Notes")).toBe("Meeting Notes.md");
  });

  it("falls back to untitled.md for an empty title", () => {
    expect(buildExportFilename("   ")).toBe("untitled.md");
  });

  it("replaces filesystem-unsafe characters", () => {
    expect(buildExportFilename('a/b:c*d?e"f<g>h|i')).toBe("a-b-c-d-e-f-g-h-i.md");
  });
});
