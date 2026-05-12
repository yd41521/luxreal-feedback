import Link from "next/link";
import { listDeliveredItems } from "@/lib/feishu";
import { formatRelativeTime } from "@/lib/utils";
import { DeliveredHeader } from "./DeliveredHeader";
import { DeliveredHeroClient } from "./DeliveredHeroClient";

export const dynamic = "force-dynamic";
export const revalidate = 30;
export const metadata = {
  title: "已上线 · LuxReal 反馈广场",
  description: "感谢社区！这里是 LuxReal 已经交付的、来自用户反馈的想法清单",
};

export default async function DeliveredPage() {
  let data;
  try {
    data = await listDeliveredItems({ page: 1, pageSize: 100 });
  } catch (e) {
    console.error("[DeliveredPage]", e);
    return (
      <>
        <DeliveredHeader />
        <main className="relative isolate z-[100] mx-auto max-w-3xl bg-transparent px-4 py-16 text-center">
          <p className="text-sm text-rose-600">数据加载失败：{(e as Error).message}</p>
        </main>
      </>
    );
  }

  const { items, stats } = data;
  const hasItems = items.length > 0;

  return (
    <>
      <DeliveredHeader />

      <DeliveredHeroClient stats={stats} showStatsStrip={hasItems} />

      <main className="relative isolate z-[100] mx-auto max-w-5xl bg-transparent px-4 pb-16 sm:px-6">
        {hasItems ? (
          <div className="space-y-3 pt-8 sm:pt-10">
            {items.map((it) => (
              <DeliveredCard
                key={it.id}
                id={it.id}
                title={it.title}
                content={it.content}
                completedAt={it.completedAt ?? it.updatedAt}
                voteCount={it.voteCount}
                submitterName={it.submitterName}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </>
  );
}

function DeliveredCard({
  id,
  title,
  content,
  completedAt,
  voteCount,
  submitterName,
}: {
  id: string;
  title: string;
  content: string;
  completedAt: number;
  voteCount: number;
  submitterName?: string;
}) {
  return (
    <Link
      href={`/items/${id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-surface-muted bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:border-accent-violet/40 hover:shadow-card-hover sm:flex-row sm:items-start sm:gap-4 sm:p-5"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-glow/40 text-ink transition group-hover:bg-accent-glow/60 sm:h-14 sm:w-14">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 sm:h-7 sm:w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12 4 4 10-10" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-ink sm:text-lg">
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-ink-subtle">{content}</p>
          {submitterName && (
            <p className="mt-1 text-xs text-ink-faint">由 @{submitterName} 建议</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-row items-center justify-between gap-3 border-t border-surface-muted pt-3 sm:flex-col sm:items-end sm:justify-start sm:border-t-0 sm:pt-0">
        <span className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink-muted">
          已上线 {formatRelativeTime(completedAt)}
        </span>
        <span className="text-xs text-ink-faint tabular-nums">
          {voteCount} 票
        </span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-accent-silver/60 bg-surface/60 py-16 text-center backdrop-blur-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-glow/50 text-ink ring-1 ring-accent-silver/40">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 6v12M6 12h12" />
        </svg>
      </div>
      <div className="text-base font-medium text-ink">
        这里很快会有第一个交付
      </div>
      <p className="max-w-sm text-sm text-ink-subtle">
        我们正在审阅与开发社区提出的想法，第一个上线的功能即将出现在这里。
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex h-9 items-center rounded-lg bg-cta px-4 text-sm font-medium text-cta-fg shadow-sm transition hover:bg-cta-hover"
      >
        去想法广场逛逛
      </Link>
    </div>
  );
}
