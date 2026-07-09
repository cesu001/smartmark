import { describe, it, expect } from "vitest";
import { getContentPreview } from "@/lib/note-preview";

describe("getContentPreview", () => {
  it("returns an empty string for null/undefined/empty content", () => {
    expect(getContentPreview(null)).toBe("");
    expect(getContentPreview(undefined)).toBe("");
    expect(getContentPreview("")).toBe("");
  });

  it("returns the first 3 non-blank lines joined by newlines", () => {
    const content = "# Heading\n\nFirst paragraph\nSecond paragraph\nThird paragraph\nFourth paragraph";
    expect(getContentPreview(content)).toBe(
      "# Heading\nFirst paragraph\nSecond paragraph",
    );
  });

  it("skips blank lines when counting toward the limit", () => {
    const content = "# Heading\n\n\nFirst paragraph\n\nSecond paragraph";
    expect(getContentPreview(content)).toBe(
      "# Heading\nFirst paragraph\nSecond paragraph",
    );
  });

  it("returns all lines when content has fewer than maxLines", () => {
    expect(getContentPreview("Only one line")).toBe("Only one line");
  });

  it("respects a custom maxLines argument", () => {
    const content = "Line 1\nLine 2\nLine 3\nLine 4";
    expect(getContentPreview(content, 2)).toBe("Line 1\nLine 2");
  });
});
