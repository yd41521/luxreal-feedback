"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getVisitorId, getVotedSet, setVoted } from "@/lib/fingerprint";

/**
 * 投票按钮的三态：
 *   1. 未投票      → 灰边白底，hover 透出银紫 affordance
 *   2. 已投票      → 银紫边 + 浅紫底，明确"我已表态"
 *   3. 已投票+hover → 中性灰 + 图标变减号 + (lg 模式下) 文字 "取消"
 *      —— 三重冗余信号告诉用户"再点会取消投票"
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
      title={voted ? "点击取消投票" : "为这个想法投票"}
      className={cn(
        "group flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 select-none",
        isLarge ? "w-[110px] py-5 gap-1" : "w-[72px] py-3 gap-0.5",
        voted
          ? // 已投票静态：银紫
            "border-accent-violet/60 bg-accent-glow/45 text-accent-violet shadow-card " +
              // hover：所有色调切到中性灰，传达"取消"意图
              "hover:border-ink/15 hover:bg-surface-muted hover:text-ink-muted hover:shadow-none"
          : // 未投票静态：灰
            "border-surface-muted bg-surface text-ink-subtle " +
              // hover：透出银紫 affordance，告诉用户"投这一票"
              "hover:border-accent-violet/40 hover:text-accent-violet hover:shadow-card",
        pending && "opacity-60"
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center",
          isLarge ? "h-7 w-7" : "h-5 w-5"
        )}
      >
        {/* 上升箭头：未投票/已投票静态都显示；已投票 hover 淡出 */}
        <svg
          viewBox="0 0 24 24"
          className={cn(
            "absolute inset-0 transition-all duration-200",
            voted
              ? "group-hover:opacity-0 group-hover:scale-75"
              : "group-hover:-translate-y-0.5"
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
        {/* 取消标记（横线）：仅已投票 hover 时淡入 */}
        {voted && (
          <svg
            viewBox="0 0 24 24"
            className="absolute inset-0 scale-75 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
          </svg>
        )}
      </div>
      <span
        className={cn(
          "font-semibold tabular-nums",
          isLarge ? "text-2xl" : "text-base"
        )}
      >
        {count}
      </span>
      {isLarge && (
        <span className="text-xs text-ink-faint">
          {voted ? (
            <>
              <span className="inline group-hover:hidden">已投票</span>
              <span className="hidden group-hover:inline">取消</span>
            </>
          ) : (
            "投票"
          )}
        </span>
      )}
    </button>
  );
}
