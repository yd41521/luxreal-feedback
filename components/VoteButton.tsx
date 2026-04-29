"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getVisitorId, getVotedSet, setVoted } from "@/lib/fingerprint";

export function VoteButton({
  itemId,
  initialCount,
  size = "md",
  onChange,
}: {
  itemId: string;
  initialCount: number;
  size?: "md" | "lg";
  onChange?: (next: { count: number; voted: boolean }) => void;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVotedState] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setVotedState(getVotedSet().has(itemId));
  }, [itemId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    setPending(true);

    const willVote = !voted;
    const optimisticCount = willVote ? count + 1 : Math.max(0, count - 1);
    setCount(optimisticCount);
    setVotedState(willVote);
    setVoted(itemId, willVote);

    try {
      const fp = await getVisitorId();
      const res = await fetch(`/api/feedback/${itemId}/vote`, {
        method: willVote ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint: fp }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error?.message || "投票失败");
      setCount(json.data.vote_count);
      setVotedState(json.data.voted);
      setVoted(itemId, json.data.voted);
      onChange?.({ count: json.data.vote_count, voted: json.data.voted });
    } catch (err) {
      // 回滚
      setCount(count);
      setVotedState(voted);
      setVoted(itemId, voted);
      console.error(err);
    } finally {
      setPending(false);
    }
  }

  const isLarge = size === "lg";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={voted}
      className={cn(
        "group flex flex-col items-center justify-center rounded-2xl border transition-all select-none",
        isLarge
          ? "w-[110px] py-5 gap-1"
          : "w-[72px] py-3 gap-0.5",
        voted
          ? "border-brand-500 bg-brand-50 text-brand-600 shadow-card"
          : "border-slate-200 bg-white text-slate-500 hover:border-brand-300 hover:text-brand-600 hover:shadow-card",
        pending && "opacity-60"
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn(
          isLarge ? "h-7 w-7" : "h-5 w-5",
          "transition-transform group-hover:-translate-y-0.5"
        )}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
      <span
        className={cn(
          "font-semibold tabular-nums",
          isLarge ? "text-2xl" : "text-base"
        )}
      >
        {count}
      </span>
      {isLarge && (
        <span className="text-xs text-slate-400">{voted ? "已投票" : "投票"}</span>
      )}
    </button>
  );
}
