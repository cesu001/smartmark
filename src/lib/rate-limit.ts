import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "rl:login",
});

export const registerLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "rl:register",
});

export const forgotPasswordLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "rl:forgot",
});

export const resetPasswordLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "rl:reset",
});

export function getIP(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "127.0.0.1";
}

export async function applyRateLimit(
  limiter: Ratelimit,
  identifier: string,
): Promise<NextResponse | null> {
  try {
    const { success, reset } = await limiter.limit(identifier);
    if (!success) {
      const retryAfterSecs = Math.ceil((reset - Date.now()) / 1000);
      const minutes = Math.max(1, Math.ceil(retryAfterSecs / 60));
      return NextResponse.json(
        {
          error: `Too many attempts. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSecs) },
        },
      );
    }
    return null;
  } catch {
    // Fail open — allow the request if Upstash is unavailable
    return null;
  }
}
