import Link from "next/link";
import { FeedbackItem } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { VoteButton } from "./VoteButton";

export function ItemCard({ item }: { item: FeedbackItem }) {
  return (
    <article className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card transition hover:shadow-card-hover sm:gap-4 sm:p-5">
      <VoteButton itemId={item.id} initialCount={item.voteCount} />
      <Link
        href={`/items/${item.id}`}
        className="flex flex-1 flex-col gap-2 min-w-0"
      >
        <h3 className="text-base font-semibold leading-snug text-slate-900 sm:text-lg line-clamp-2">
          {item.title}
        </h3>
        <p className="line-clamp-2 text-sm text-slate-500">
          {item.content}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <StatusBadge status={item.status} />
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">
            {item.category}
          </span>
          <span>{formatRelativeTime(item.createdAt)}</span>
        </div>
      </Link>
    </article>
  );
}
