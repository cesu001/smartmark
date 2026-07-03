import { describe, it, expect, vi } from "vitest";
import type { Ratelimit } from "@upstash/ratelimit";
import { getIP, applyRateLimit } from "@/lib/rate-limit";

function makeLimiter(result: { success: boolean; reset: number }) {
  return { limit: vi.fn().mockResolvedValue(result) } as unknown as Ratelimit;
}

describe("getIP", () => {
  it("returns the first IP from x-forwarded-for", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getIP(request)).toBe("1.2.3.4");
  });

  it("falls back to 127.0.0.1 when the header is missing", () => {
    const request = new Request("http://localhost");
    expect(getIP(request)).toBe("127.0.0.1");
  });
});

describe("applyRateLimit", () => {
  it("returns null when under the limit", async () => {
    const limiter = makeLimiter({ success: true, reset: Date.now() + 1000 });
    expect(await applyRateLimit(limiter, "user-1")).toBeNull();
  });

  it("returns a 429 response with Retry-After when over the limit", async () => {
    const limiter = makeLimiter({ success: false, reset: Date.now() + 61_000 });
    const response = await applyRateLimit(limiter, "user-1");
    expect(response).not.toBeNull();
    expect(response!.status).toBe(429);
    expect(response!.headers.get("Retry-After")).toBeTruthy();
  });

  it("fails open when the limiter throws", async () => {
    const limiter = { limit: vi.fn().mockRejectedValue(new Error("redis down")) } as unknown as Ratelimit;
    expect(await applyRateLimit(limiter, "user-1")).toBeNull();
  });
});
