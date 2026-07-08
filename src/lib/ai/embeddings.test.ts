import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("ai", () => ({ embed: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma: { $executeRaw: vi.fn() } }));
vi.mock("@/lib/ai/client", () => ({ EMBEDDING_MODEL: {} }));

import { embed } from "ai";
import { getEncoding } from "js-tiktoken";
import { prisma } from "@/lib/db";
import { embedNoteContent, embedText } from "@/lib/ai/embeddings";

const mockedEmbed = vi.mocked(embed);
const mockedPrisma = vi.mocked(prisma, { deep: true });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("embedNoteContent", () => {
  it("no-ops on empty content — no embed call, no DB write", async () => {
    await embedNoteContent("note-1", "");
    expect(mockedEmbed).not.toHaveBeenCalled();
    expect(mockedPrisma.$executeRaw).not.toHaveBeenCalled();
  });

  it("no-ops on whitespace-only content", async () => {
    await embedNoteContent("note-1", "   \n\t  ");
    expect(mockedEmbed).not.toHaveBeenCalled();
    expect(mockedPrisma.$executeRaw).not.toHaveBeenCalled();
  });

  it("embeds and persists the vector for non-empty content", async () => {
    mockedEmbed.mockResolvedValue({ embedding: [0.1, 0.2, 0.3] } as never);
    await embedNoteContent("note-1", "hello world");
    expect(mockedEmbed).toHaveBeenCalledOnce();
    expect(mockedPrisma.$executeRaw).toHaveBeenCalledOnce();
  });
});

describe("embedText", () => {
  it("returns the raw embedding array", async () => {
    mockedEmbed.mockResolvedValue({ embedding: [1, 2, 3] } as never);
    expect(await embedText("hi")).toEqual([1, 2, 3]);
  });

  it("passes short input through untouched", async () => {
    mockedEmbed.mockResolvedValue({ embedding: [1] } as never);
    await embedText("short text");
    const arg = mockedEmbed.mock.calls[0][0] as { value: string };
    expect(arg.value).toBe("short text");
  });

  it("truncates input to at most 8000 tokens before embedding", async () => {
    mockedEmbed.mockResolvedValue({ embedding: [1] } as never);
    const long = "photosynthesis ".repeat(20000); // far over 8000 tokens
    await embedText(long);
    const arg = mockedEmbed.mock.calls[0][0] as { value: string };
    const tokenCount = getEncoding("cl100k_base").encode(arg.value).length;
    expect(tokenCount).toBeLessThanOrEqual(8000);
    expect(arg.value.length).toBeLessThan(long.length); // actually truncated
  });
});
