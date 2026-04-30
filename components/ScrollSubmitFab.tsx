"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { durations, easings } from "@/lib/motion";
import { cn } from "@/lib/utils";

const fabTransition = {
  duration: durations.fab,
  ease: easings.fab,
};

/**
 * Hero / 首屏滚出后的浮动入口：底部居中圆形加号，hover / 键盘聚焦时显示「提交想法」提示。
 */
export function ScrollSubmitFab({
  show,
  dialogOpen,
  onSubmit,
}: {
  show: boolean;
  dialogOpen: boolean;
  onSubmit: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const visible = show && !dialogOpen;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={
            reduceMotion ? false : { opacity: 0, y: 6, scale: 0.985 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 4, scale: 0.985, transition: { duration: 0.32, ease: easings.fab } }
          }
          transition={fabTransition}
          className={cn(
            "fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 z-40 -translate-x-1/2 sm:bottom-8",
            "max-sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))]"
          )}
        >
          <button
            type="button"
            onClick={onSubmit}
            className={cn(
              "group relative flex h-14 w-14 items-center justify-center rounded-full bg-cta",
              "text-cta-fg shadow-glow",
              "transition-colors hover:bg-cta-hover",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet/45 focus-visible:ring-offset-2"
            )}
            aria-label="提交想法"
          >
            <PlusIcon className="h-7 w-7" aria-hidden />
            <span
              role="tooltip"
              className={cn(
                "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2",
                "whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-ink-inverse",
                "shadow-card opacity-0 transition-opacity duration-150",
                "group-hover:opacity-100 group-focus-visible:opacity-100"
              )}
            >
              提交想法
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
