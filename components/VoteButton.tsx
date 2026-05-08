"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { getVisitorId, getVotedSet, setVoted } from "@/lib/fingerprint";

/**
 * 投票按钮：向上细箭头 + 票数。
 * 已投票 → 紫色高亮（浅紫底、紫边、紫字）；未投票 → 灰白中性色。
 * 取消赞时仅箭头微动效，不变横杠；样式随状态切回灰色。
 */
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
  const [playUnvoteAnim, setPlayUnvoteAnim] = useState(false);
  const [playHoverHint, setPlayHoverHint] = useState(false);
  const unvoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setVotedState(getVotedSet().has(itemId));
  }, [itemId]);

  useEffect(() => {
    return () => {
      if (unvoteTimer.current) clearTimeout(unvoteTimer.current);
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, []);

  function triggerUnvoteArrowAnim() {
    setPlayUnvoteAnim(true);
    if (unvoteTimer.current) clearTimeout(unvoteTimer.current);
    unvoteTimer.current = setTimeout(() => setPlayUnvoteAnim(false), 460);
  }

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    setPending(true);

    const willVote = !voted;
    if (voted && !willVote) {
      triggerUnvoteArrowAnim();
    }

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
      setCount(count);
      setVotedState(voted);
      setVoted(itemId, voted);
      setPlayUnvoteAnim(false);
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
      title={voted ? "点击取消投票" : "为这个想法投票"}
      onMouseEnter={() => {
        if (!voted) return;
        setPlayHoverHint(true);
        if (hintTimer.current) clearTimeout(hintTimer.current);
        hintTimer.current = setTimeout(() => setPlayHoverHint(false), 520);
      }}
      className={cn(
        "group flex flex-col items-center justify-center rounded-[18px] border transition-colors duration-200 select-none",
        isLarge ? "w-[110px] min-h-[120px] py-5 gap-1" : "w-[72px] min-h-[72px] py-3 gap-1",
        voted
          ? "border-violet-500/75 bg-violet-50 text-violet-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:border-violet-600/85 hover:bg-violet-50"
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600",
        pending && "opacity-70"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center",
          isLarge ? "h-7 w-7" : "h-5 w-5"
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={isLarge ? 2 : 1.85}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "block h-full w-full transition-transform duration-200",
            !voted && "group-hover:-translate-y-0.5",
            playUnvoteAnim && "animate-voteUnvote",
            voted && playHoverHint && "animate-voteArrowHint"
          )}
          aria-hidden
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </div>
      <span
        className={cn(
          "font-semibold tabular-nums leading-none",
          isLarge ? "text-2xl" : "text-base"
        )}
      >
        {count}
      </span>
      {isLarge && (
        <span
          className={cn("text-xs", voted ? "text-violet-600/90" : "text-slate-400")}
        >
          {voted ? "已投票" : "投票"}
        </span>
      )}
    </button>
  );
}
