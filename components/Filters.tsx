"use client";

import { CATEGORIES, PUBLIC_STATUSES, type Category, type Status } from "@/lib/types";
import { cn } from "@/lib/utils";

export type SortKey = "trending" | "latest";

/**
 * 极简筛选条：左侧 Trending / Latest 用纯文字 + 图标 + 竖线分隔，
 * 右侧 类别 / 状态 用裸下拉（无边框），保持页面"轻"的呼吸感。
 *
 * 颜色全部 token 化：
 *   - active sort     → accent-violet（与品牌色一致的高亮）
 *   - inactive sort   → ink-faint，hover 转 ink-muted
 *   - select label    → ink-faint（"类别 / 状态" 副文）
 *   - select value    → ink + font-medium（"全部 / 已通过 / ..."）
 */
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
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4 text-sm">
      <div className="flex items-center gap-3">
        <SortLink
          active={sort === "trending"}
          onClick={() => onSort("trending")}
        >
          <FlameIcon /> Trending（热门）
        </SortLink>
        <span aria-hidden className="text-ink-faint/50">
          |
        </span>
        <SortLink
          active={sort === "latest"}
          onClick={() => onSort("latest")}
        >
          <ClockIcon /> Latest（最新）
        </SortLink>
      </div>

      <div className="flex items-center gap-5">
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

function SortLink({
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
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 transition-colors",
        // active：深色 + medium 字重压住整行；icon 仍跟随 text color
        // inactive：浅灰，hover 转中灰
        active
          ? "font-medium text-ink [&>svg]:text-accent-violet"
          : "text-ink-faint hover:text-ink-muted"
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
    <label className="inline-flex items-center gap-1.5">
      <span className="text-ink-faint">{label}</span>
      <span className="relative inline-flex items-center">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="cursor-pointer appearance-none bg-transparent pr-5 font-medium text-ink outline-none transition-colors hover:text-accent-violet"
        >
          <option value="">全部</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronIcon className="pointer-events-none absolute right-0 h-3.5 w-3.5 text-ink-faint" />
      </span>
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
