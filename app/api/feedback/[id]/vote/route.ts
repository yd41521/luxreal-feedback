import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addVote, removeVote } from "@/lib/feishu";
import { checkLimit, voteLimiter } from "@/lib/ratelimit";
import { clientIpFromHeaders, isAllowedOrigin } from "@/lib/utils";

export const dynamic = "force-dynamic";

const Schema = z.object({ fingerprint: z.string().min(8).max(128) });

async function guard(req: NextRequest) {
  if (!isAllowedOrigin(req.headers.get("origin"))) {
    return NextResponse.json(
      { ok: false, error: { code: "FORBIDDEN", message: "来源不被允许" } },
      { status: 403 }
    );
  }
  const ip = clientIpFromHeaders(req.headers);
  const ok = await checkLimit(voteLimiter, `vote:${ip}`);
  if (!ok.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "RATE_LIMITED", message: "投票太频繁，请稍后再试" },
      },
      { status: 429 }
    );
  }
  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const blocked = await guard(req);
  if (blocked) return blocked;
  const ip = clientIpFromHeaders(req.headers);
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_PARAMS", message: "缺少指纹" } },
      { status: 400 }
    );
  }
  try {
    const r = await addVote({
      itemId: params.id,
      fingerprint: parsed.data.fingerprint,
      ip,
    });
    return NextResponse.json({
      ok: true,
      data: { vote_count: r.voteCount, voted: true },
    });
  } catch (e) {
    console.error("[POST vote]", e);
    return NextResponse.json(
      { ok: false, error: { code: "FEISHU_ERROR", message: (e as Error).message } },
      { status: 502 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const blocked = await guard(req);
  if (blocked) return blocked;
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_PARAMS", message: "缺少指纹" } },
      { status: 400 }
    );
  }
  try {
    const r = await removeVote({
      itemId: params.id,
      fingerprint: parsed.data.fingerprint,
    });
    return NextResponse.json({
      ok: true,
      data: { vote_count: r.voteCount, voted: false },
    });
  } catch (e) {
    console.error("[DELETE vote]", e);
    return NextResponse.json(
      { ok: false, error: { code: "FEISHU_ERROR", message: (e as Error).message } },
      { status: 502 }
    );
  }
}
