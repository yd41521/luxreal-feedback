import Link from "next/link";
import { listDeliveredItems } from "@/lib/feishu";
import { formatRelativeTime } from "@/lib/utils";
import { BreathingHalo } from "@/components/BreathingHalo";
import { DeliveredHeader } from "./DeliveredHeader";

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
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
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

      <DeliveredHero stats={stats} showStatsStrip={hasItems} />

      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        {hasItems ? (
          <div className="pt-8 sm:pt-10 space-y-3">
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

type DeliveredPageStats = {
  total: number;
  totalVotes: number;
  lastDeliveredAt: number | null;
};

function DeliveredHero({
  stats,
  showStatsStrip,
}: {
  stats: DeliveredPageStats;
  showStatsStrip: boolean;
}) {
  return (
    <section
      data-embed-hide="true"
      className="relative overflow-hidden bg-surface"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background: [
            "radial-gradient(ellipse 90% 75% at 50% 110%, rgb(var(--accent-glow) / 0.42) 0%, rgb(var(--accent-violet) / 0.12) 42%, transparent 72%)",
            "radial-gradient(ellipse 50% 60% at 14% 10%, rgb(var(--accent-silver) / 0.32) 0%, transparent 60%)",
            "linear-gradient(180deg, rgb(var(--surface)) 0%, rgb(var(--surface-subtle)) 100%)",
          ].join(", "),
        }}
      />
      <BreathingHalo />
      <div className="relative z-[1] mx-auto flex max-w-4xl flex-col items-center px-4 pb-12 pt-12 text-center sm:pb-14 sm:pt-16">
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-ink shadow-glow ring-1 ring-accent-silver/40">
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12 4 4 10-10" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold leading-tight text-ink sm:text-3xl">
          {stats.total > 0
            ? `感谢社区，已交付 ${stats.total} 个想法`
            : "成就墙正在路上"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-subtle sm:text-base">
          每一个完成的功能背后，都有用户的声音
        </p>
        {showStatsStrip ? <HeroStatsStrip stats={stats} /> : null}
      </div>
    </section>
  );
}

/** 统计与标题同属一块 banner：无独立白卡片、无负 margin，避免与列表区「骑缝」截断感。 */
function HeroStatsStrip({ stats }: { stats: DeliveredPageStats }) {
  return (
    <div
      className="mt-8 w-full max-w-md sm:mt-10 sm:max-w-xl"
      role="region"
      aria-label="交付统计"
    >
      <div className="flex items-stretch justify-center divide-x divide-accent-violet/25 sm:divide-accent-violet/30">
        <HeroStatCell label="已上线" value={stats.total.toString()} />
        <HeroStatCell
          label="总投票"
          value={stats.totalVotes.toString()}
        />
        <HeroStatCell
          label="最近交付"
          value={
            stats.lastDeliveredAt
              ? formatRelativeTime(stats.lastDeliveredAt)
              : "—"
          }
        />
      </div>
    </div>
  );
}

function HeroStatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-3 py-1 text-center sm:px-5">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className="text-xl font-semibold tabular-nums text-ink sm:text-2xl">
        {value}
      </span>
    </div>
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
      className="group flex items-start gap-4 rounded-2xl border border-surface-muted bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:border-accent-violet/40 hover:shadow-card-hover sm:p-5"
    >
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
        <h3 className="text-base font-semibold leading-snug text-ink sm:text-lg line-clamp-2">
          {title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-subtle">{content}</p>
        {submitterName && (
          <p className="mt-1 text-xs text-ink-faint">由 @{submitterName} 建议</p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
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
