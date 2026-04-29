"use client";

import { useEffect, useState } from "react";

export function Hero({
  onSearch,
  initialQuery,
}: {
  onSearch: (q: string) => void;
  initialQuery?: string;
}) {
  const [v, setV] = useState(initialQuery || "");

  useEffect(() => {
    const t = setTimeout(() => onSearch(v.trim()), 300);
    return () => clearTimeout(t);
  }, [v, onSearch]);

  return (
    <section
      data-embed-hide="true"
      className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-brand-50 via-white to-violet-50"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 0%, rgba(99,102,241,0.18) 0, transparent 40%)," +
            "radial-gradient(circle at 80% 100%, rgba(139,92,246,0.18) 0, transparent 40%)",
        }}
      />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-14 text-center sm:py-20">
        <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          听见你的声音，让产品更懂你
        </h1>
        <p className="mt-3 text-sm text-slate-500 sm:text-base">
          提交你的想法，与社区一起决定下一步
        </p>
        <div className="mt-7 w-full max-w-xl">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={v}
              onChange={(e) => setV(e.target.value)}
              placeholder="搜索想法、关键词..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
