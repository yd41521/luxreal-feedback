"use client";

import { useState } from "react";

export function CopyLinkButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          const url =
            typeof window !== "undefined"
              ? `${location.origin}/items/${id}`
              : "";
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className="inline-flex h-11 min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700 hover:bg-slate-50 sm:h-9 sm:min-h-0 sm:w-auto"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07L11 5" />
        <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07L13 19" />
      </svg>
      {copied ? "已复制" : "复制链接"}
    </button>
  );
}
