import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * 基于 Upstash Redis 的滑动窗口限频。
 * 未配置 Upstash 时使用进程内存兜底（单实例适用，Vercel 多函数实例下不准确，仅用于本地开发）。
 */

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const useUpstash = Boolean(url && token);

const redis = useUpstash
  ? new Redis({ url: url!, token: token! })
  : null;

function makeLimiter(reqs: number, windowSec: number) {
  if (redis) {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(reqs, `${windowSec} s`),
      analytics: false,
      prefix: "feedback:rl",
    });
  }
  // 内存兜底
  const buckets = new Map<string, { tokens: number; resetAt: number }>();
  return {
    async limit(id: string) {
      const now = Date.now();
      const b = buckets.get(id);
      if (!b || b.resetAt <= now) {
        buckets.set(id, {
          tokens: reqs - 1,
          resetAt: now + windowSec * 1000,
        });
        return { success: true, remaining: reqs - 1 };
      }
      if (b.tokens > 0) {
        b.tokens -= 1;
        return { success: true, remaining: b.tokens };
      }
      return { success: false, remaining: 0 };
    },
  };
}

export const submitLimiter = makeLimiter(1, 60); // 同 IP 60s 内 1 次提交
export const voteLimiter = makeLimiter(10, 60); // 同 IP 60s 内 10 次投票
export const readLimiter = makeLimiter(20, 1); // 同 IP 1s 内 20 次读

export async function checkLimit(
  limiter: ReturnType<typeof makeLimiter>,
  key: string
): Promise<{ ok: true } | { ok: false }> {
  const r = await limiter.limit(key);
  return r.success ? { ok: true } : { ok: false };
}
