import { NextRequest, NextResponse } from "next/server";
import { listDeliveredItems } from "@/lib/feishu";
import { checkLimit, readLimiter } from "@/lib/ratelimit";
import { clientIpFromHeaders } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  const ok = await checkLimit(readLimiter, `read:${ip}`);
  if (!ok.ok) {
    return NextResponse.json(
      { ok: false, error: { code: "RATE_LIMITED", message: "请求太频繁" } },
      { status: 429 }
    );
  }

  const sp = req.nextUrl.searchParams;
  const page = Number(sp.get("page") || "1");
  const pageSize = Number(sp.get("pageSize") || "20");

  try {
    const data = await listDeliveredItems({ page, pageSize });
    return NextResponse.json(
      { ok: true, data },
      {
        headers: {
          "Cache-Control":
            "s-maxage=30, stale-while-revalidate=60, public",
        },
      }
    );
  } catch (e) {
    console.error("[GET /api/feedback/delivered]", e);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "FEISHU_ERROR", message: (e as Error).message },
      },
      { status: 502 }
    );
  }
}
