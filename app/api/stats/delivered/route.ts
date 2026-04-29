import { NextRequest, NextResponse } from "next/server";
import { getDeliveredStats } from "@/lib/feishu";
import { checkLimit, readLimiter } from "@/lib/ratelimit";
import { clientIpFromHeaders } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * 轻量统计接口：返回已交付的总数 / 总票数 / 最近交付时间。
 * 用于 Header 徽章等地方。
 */
export async function GET(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  const ok = await checkLimit(readLimiter, `read:${ip}`);
  if (!ok.ok) {
    return NextResponse.json(
      { ok: false, error: { code: "RATE_LIMITED", message: "请求太频繁" } },
      { status: 429 }
    );
  }
  try {
    const stats = await getDeliveredStats();
    return NextResponse.json(
      { ok: true, data: stats },
      {
        headers: {
          "Cache-Control":
            "s-maxage=60, stale-while-revalidate=120, public",
        },
      }
    );
  } catch (e) {
    console.error("[GET /api/stats/delivered]", e);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "FEISHU_ERROR", message: (e as Error).message },
      },
      { status: 502 }
    );
  }
}
