import Link from "next/link";
import { listDeliveredItems } from "@/lib/feishu";
import { formatRelativeTime } from "@/lib/utils";
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

      <DeliveredHero stats={stats} />

      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        {hasItems && <StatsRow stats={stats} />}

        {hasItems ? (
          <div className="mt-6 space-y-3">
            {items.map((it) => (
              <DeliveredCard
                key={it.id}
                id={it.id}
                title={it.title}
                content={it.content}
                completedAt={it.completedAt!}
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

function DeliveredHero({
  stats,
}: {
  stats: { total: number };
}) {
  return (
    <section
      data-embed-hide="true"
      className="relative overflow-hidden border-b border-emerald-100/60 bg-gradient-to-br from-emerald-50 via-white to-teal-50"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 0%, rgba(16,185,129,0.16) 0, transparent 45%)," +
            "radial-gradient(circle at 82% 100%, rgba(20,184,166,0.16) 0, transparent 45%)",
        }}
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-12 text-center sm:py-16">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-sm ring-1 ring-emerald-200">
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
        <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
          {stats.total > 0
            ? `感谢社区，已交付 ${stats.total} 个想法`
            : "成就墙正在路上"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
          每一个完成的功能背后，都有用户的声音
        </p>
      </div>
    </section>
  );
}

function StatsRow({
  stats,
}: {
  stats: { total: number; totalVotes: number; lastDeliveredAt: number | null };
}) {
  return (
    <div className="-mt-7 grid grid-cols-3 gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-card sm:p-5">
      <Stat label="已上线" value={stats.total.toString()} />
      <Stat label="总投票" value={stats.totalVotes.toString()} />
      <Stat
        label="最近交付"
        value={
          stats.lastDeliveredAt
            ? formatRelativeTime(stats.lastDeliveredAt)
            : "—"
        }
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-center">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-xl font-semibold text-emerald-600 tabular-nums sm:text-2xl">
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
      className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-card-hover sm:p-5"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100 sm:h-14 sm:w-14">
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
        <h3 className="text-base font-semibold leading-snug text-slate-900 sm:text-lg line-clamp-2">
          {title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{content}</p>
        {submitterName && (
          <p className="mt-1 text-xs text-slate-400">由 @{submitterName} 建议</p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
          已上线 {formatRelativeTime(completedAt)}
        </span>
        <span className="text-xs text-slate-400 tabular-nums">
          {voteCount} 票
        </span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
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
      <div className="text-base font-medium text-slate-700">
        这里很快会有第一个交付
      </div>
      <p className="max-w-sm text-sm text-slate-500">
        我们正在审阅与开发社区提出的想法，第一个上线的功能即将出现在这里。
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700 hover:bg-slate-50"
      >
        去想法广场逛逛
      </Link>
    </div>
  );
}
