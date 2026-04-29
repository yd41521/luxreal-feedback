import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createItem, listItems } from "@/lib/feishu";
import { CATEGORIES, type Category, type Status } from "@/lib/types";
import {
  checkLimit,
  readLimiter,
  submitLimiter,
} from "@/lib/ratelimit";
import { clientIpFromHeaders, isAllowedOrigin } from "@/lib/utils";

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
  const sort = sp.get("sort") === "latest" ? "latest" : "trending";
  const category = (sp.get("category") || undefined) as Category | undefined;
  const status = (sp.get("status") || undefined) as Status | undefined;
  const q = (sp.get("q") || "").trim() || undefined;
  const page = Number(sp.get("page") || "1");
  const pageSize = Number(sp.get("pageSize") || "20");

  try {
    const data = await listItems({ sort, category, status, q, page, pageSize });
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
    console.error("[GET /api/feedback]", e);
    return NextResponse.json(
      { ok: false, error: { code: "FEISHU_ERROR", message: (e as Error).message } },
      { status: 502 }
    );
  }
}

const SubmitSchema = z.object({
  title: z.string().min(1).max(60),
  content: z.string().min(10).max(2000),
  category: z.enum(CATEGORIES as [Category, ...Category[]]),
  submitter_name: z.string().max(20).optional(),
  submitter_contact: z.string().max(50).optional(),
  fingerprint: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req.headers.get("origin"))) {
    return NextResponse.json(
      { ok: false, error: { code: "FORBIDDEN", message: "来源不被允许" } },
      { status: 403 }
    );
  }
  const ip = clientIpFromHeaders(req.headers);
  const ok = await checkLimit(submitLimiter, `submit:${ip}`);
  if (!ok.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "RATE_LIMITED", message: "提交太频繁，请稍后再试" },
      },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = SubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_PARAMS",
          message: parsed.error.issues.map((i) => i.message).join("; "),
        },
      },
      { status: 400 }
    );
  }

  try {
    const { id } = await createItem({
      title: parsed.data.title.trim(),
      content: parsed.data.content.trim(),
      category: parsed.data.category,
      submitter_name: parsed.data.submitter_name,
      submitter_contact: parsed.data.submitter_contact,
      submitter_fingerprint: parsed.data.fingerprint,
      submitter_ip: ip,
    });
    return NextResponse.json({ ok: true, data: { id } }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/feedback]", e);
    return NextResponse.json(
      { ok: false, error: { code: "FEISHU_ERROR", message: (e as Error).message } },
      { status: 502 }
    );
  }
}
