"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Hero } from "@/components/Hero";
import { formatRelativeTime } from "@/lib/utils";

const HeroShaderBackground = dynamic(
  () =>
    import("@/components/HeroShaderBackground").then((m) => m.HeroShaderBackground),
  { ssr: false, loading: () => null }
);

export type DeliveredHeroStats = {
  total: number;
  totalVotes: number;
  lastDeliveredAt: number | null;
};

/**
 * 与首页相同的 Hero 结构（标题 + 副标题 + 搜索 + Shader 背景），
 * Shader 使用 `delivered` 预设；搜索跳转回想法广场带关键词。
 */
export function DeliveredHeroClient({
  stats,
  showStatsStrip,
}: {
  stats: DeliveredHeroStats;
  showStatsStrip: boolean;
}) {
  const router = useRouter();

  const onSearch = useCallback(
    (q: string) => {
      const t = q.trim();
      // Hero 挂载后会 debounce 触发一次空字符串；空搜索不应离开已上线页
      if (!t) return;
      router.push(`/?q=${encodeURIComponent(t)}`);
    },
    [router]
  );

  const title =
    stats.total > 0
      ? `感谢社区，已交付 ${stats.total} 个想法`
      : "成就墙正在路上";

  return (
    <Hero
      title={title}
      subtitle="每一个完成的功能背后，都有用户的声音"
      onSearch={onSearch}
      backgroundSlot={<HeroShaderBackground preset="delivered" />}
      extraSlot={
        showStatsStrip ? <HeroStatsStrip stats={stats} /> : null
      }
    />
  );
}

function HeroStatsStrip({ stats }: { stats: DeliveredHeroStats }) {
  return (
    <div
      className="mx-auto w-full max-w-md sm:max-w-xl"
      role="region"
      aria-label="交付统计"
    >
      <div className="flex items-stretch justify-center divide-x divide-accent-violet/25 sm:divide-accent-violet/30">
        <HeroStatCell label="已上线" value={stats.total.toString()} />
        <HeroStatCell label="总投票" value={stats.totalVotes.toString()} />
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
