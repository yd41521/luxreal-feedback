"use client";

import { CATEGORIES, PUBLIC_STATUSES, type Category, type Status } from "@/lib/types";
import { cn } from "@/lib/utils";

export type SortKey = "trending" | "latest";

export function Filters({
  sort,
  category,
  status,
  onSort,
  onCategory,
  onStatus,
}: {
  sort: SortKey;
  category?: Category;
  status?: Status;
  onSort: (s: SortKey) => void;
  onCategory: (c?: Category) => void;
  onStatus: (s?: Status) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div className="flex items-center gap-1 rounded-xl border border-slate-100 bg-white p-1 shadow-card">
        <SortPill active={sort === "trending"} onClick={() => onSort("trending")}>
          <FlameIcon /> Trending（热门）
        </SortPill>
        <SortPill active={sort === "latest"} onClick={() => onSort("latest")}>
          <ClockIcon /> Latest（最新）
        </SortPill>
      </div>
      <div className="flex items-center gap-2">
        <Select
          label="类别"
          value={category}
          onChange={(v) => onCategory(v as Category | undefined)}
          options={CATEGORIES}
        />
        <Select
          label="状态"
          value={status}
          onChange={(v) => onStatus(v as Status | undefined)}
          options={PUBLIC_STATUSES}
        />
      </div>
    </div>
  );
}

function SortPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm transition",
        active
          ? "bg-brand-50 text-brand-700 shadow-sm"
          : "text-slate-500 hover:text-slate-700"
      )}
    >
      {children}
    </button>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange: (v?: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="pointer-events-none absolute left-3 text-xs text-slate-400">
        {label}
      </span>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="h-9 appearance-none rounded-lg border border-slate-100 bg-white pl-10 pr-7 text-sm shadow-card outline-none transition hover:border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      >
        <option value="">全部</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronIcon className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-slate-400" />
    </label>
  );
}

function FlameIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.5 0 3-1 3-3 0-1.5-1-2-1-3.5 0-2.5 2-4 2-4s.5 2 2 4c1.5 2 2 4 2 6a6 6 0 1 1-12 0c0-1.5.5-3 1.5-4.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
