import { Status } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<Status, string> = {
  待审核: "bg-slate-100 text-slate-600",
  已通过: "bg-slate-100 text-slate-700",
  计划中: "bg-blue-50 text-blue-600",
  开发中: "bg-amber-50 text-amber-600",
  已完成: "bg-surface-muted text-ink-muted",
  已拒绝: "bg-rose-50 text-rose-600",
};

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLE[status],
        className
      )}
    >
      {status}
    </span>
  );
}
