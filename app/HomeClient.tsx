"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Filters, type SortKey } from "@/components/Filters";
import { ItemCard } from "@/components/ItemCard";
import { SubmitDialog } from "@/components/SubmitDialog";
import type { Category, FeedbackItem, Status } from "@/lib/types";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json?.error?.message || "加载失败");
  }
  return json.data as {
    items: FeedbackItem[];
    total: number;
    page: number;
    pageSize: number;
  };
};

export default function HomeClient() {
  const [sort, setSort] = useState<SortKey>("trending");
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [status, setStatus] = useState<Status | undefined>(undefined);
  const [q, setQ] = useState("");
  const [openSubmit, setOpenSubmit] = useState(false);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("submit") === "1") {
      setOpenSubmit(true);
    }
  }, [searchParams]);

  const apiUrl = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("sort", sort);
    if (category) sp.set("category", category);
    if (status) sp.set("status", status);
    if (q) sp.set("q", q);
    return `/api/feedback?${sp.toString()}`;
  }, [sort, category, status, q]);

  const { data, error, isLoading, mutate } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const handleSearch = useCallback((v: string) => setQ(v), []);

  return (
    <>
      <Header current="home" onSubmitClick={() => setOpenSubmit(true)} />
      <Hero
        onSearch={handleSearch}
        backgroundSlot={
          <div className="absolute inset-0">
            <Image
              src="/assets/hero-banner.png"
              alt=""
              aria-hidden
              fill
              priority
              sizes="100vw"
              className="select-none object-cover object-center"
            />
          </div>
        }
      />

      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <Filters
          sort={sort}
          category={category}
          status={status}
          onSort={setSort}
          onCategory={setCategory}
          onStatus={setStatus}
        />

        <div className="space-y-3">
          {isLoading && !data ? (
            <SkeletonList />
          ) : error ? (
            <ErrorBox message={(error as Error).message} onRetry={() => mutate()} />
          ) : data && data.items.length > 0 ? (
            data.items.map((it) => <ItemCard key={it.id} item={it} />)
          ) : (
            <EmptyState onSubmitClick={() => setOpenSubmit(true)} />
          )}
        </div>
      </main>

      <SubmitDialog
        open={openSubmit}
        onClose={() => setOpenSubmit(false)}
        onSubmitted={() => mutate()}
      />
    </>
  );
}

function SkeletonList() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5"
        >
          <div className="h-16 w-[72px] rounded-2xl bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-slate-100" />
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyState({ onSubmitClick }: { onSubmitClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
      <div className="text-base font-medium text-slate-700">这里还没有想法</div>
      <p className="max-w-sm text-sm text-slate-500">
        成为第一个提出想法的用户吧。你的反馈会直接到达我们的产品团队。
      </p>
      <button
        onClick={onSubmitClick}
        className="mt-2 inline-flex h-9 items-center rounded-lg bg-cta px-4 text-sm font-medium text-cta-fg hover:bg-cta-hover"
      >
        提交一个想法
      </button>
    </div>
  );
}

function ErrorBox({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl bg-rose-50 px-4 py-6 text-center">
      <div className="text-sm font-medium text-rose-700">加载失败</div>
      <p className="mt-1 text-xs text-rose-500">{message}</p>
      <button
        onClick={onRetry}
        className="mt-3 inline-flex h-8 items-center rounded-lg border border-rose-200 bg-white px-3 text-xs text-rose-600 hover:bg-rose-50"
      >
        重试
      </button>
    </div>
  );
}
