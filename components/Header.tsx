"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";

type CurrentPath = "home" | "delivered" | "detail";

const statsFetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json?.error?.message || "stats");
  return json.data as {
    total: number;
    totalVotes: number;
    lastDeliveredAt: number | null;
  };
};

export function Header({
  current = "home",
  onSubmitClick,
  submitHref,
}: {
  current?: CurrentPath;
  /** 主页传 setOpen 回调；其他页传 submitHref="/?submit=1" 即可。 */
  onSubmitClick?: () => void;
  submitHref?: string;
}) {
  const { data: stats } = useSWR("/api/stats/delivered", statsFetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60_000,
  });
  const deliveredCount = stats?.total ?? 0;

  // Scroll-aware backing：滚出 banner 后浮出半透明白底，保护卡片可读性；
  // 顶端时保持完全透明，让 hero 主图通透。
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-embed-hide="true"
      className={cn(
        "sticky top-0 z-30 border-b transition-colors duration-200",
        scrolled
          ? "border-surface-muted/60 bg-surface/80 backdrop-blur-md"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cta text-sm font-bold text-cta-fg">
            L
          </span>
          <span className="hidden text-base font-semibold text-slate-900 sm:inline">
            LuxReal · 反馈广场
          </span>
        </Link>

        <nav className="flex flex-1 items-center justify-center gap-1 sm:gap-3">
          <NavLink href="/" active={current === "home"}>
            想法广场
          </NavLink>
          <NavLink href="/delivered" active={current === "delivered"}>
            <span className="inline-flex items-baseline gap-1.5">
              已上线
              {deliveredCount > 0 && (
                <span className="text-xs tabular-nums text-ink-faint">
                  {deliveredCount}
                </span>
              )}
            </span>
          </NavLink>
        </nav>

        {submitHref ? (
          <Link
            href={submitHref}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-cta px-4 text-sm font-medium text-cta-fg shadow-sm transition hover:bg-cta-hover"
          >
            提交想法
          </Link>
        ) : (
          <button
            onClick={onSubmitClick}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-cta px-4 text-sm font-medium text-cta-fg shadow-sm transition hover:bg-cta-hover"
          >
            提交想法
          </button>
        )}
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex h-9 items-center rounded-lg px-3 text-sm font-medium transition",
        active
          ? "text-slate-900"
          : "text-slate-500 hover:text-slate-900"
      )}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-brand-500" />
      )}
    </Link>
  );
}
