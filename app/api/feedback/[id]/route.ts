import { NextRequest, NextResponse } from "next/server";
import { getItem } from "@/lib/feishu";
import { checkLimit, readLimiter } from "@/lib/ratelimit";
import { clientIpFromHeaders } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = clientIpFromHeaders(req.headers);
  const ok = await checkLimit(readLimiter, `read:${ip}`);
  if (!ok.ok) {
    return NextResponse.json(
      { ok: false, error: { code: "RATE_LIMITED", message: "请求太频繁" } },
      { status: 429 }
    );
  }
  try {
    const item = await getItem(params.id);
    if (!item) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "想法不存在或已下架" } },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, data: item });
  } catch (e) {
    console.error("[GET /api/feedback/[id]]", e);
    return NextResponse.json(
      { ok: false, error: { code: "FEISHU_ERROR", message: (e as Error).message } },
      { status: 502 }
    );
  }
}
