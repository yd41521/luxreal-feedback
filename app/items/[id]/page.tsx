import Link from "next/link";
import { notFound } from "next/navigation";
import { getItem } from "@/lib/feishu";
import { StatusBadge } from "@/components/StatusBadge";
import { VoteButton } from "@/components/VoteButton";
import { formatRelativeTime } from "@/lib/utils";
import { DetailHeader } from "./DetailHeader";
import { CopyLinkButton } from "./CopyLinkButton";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export default async function DetailPage({
  params,
}: {
  params: { id: string };
}) {
  const item = await getItem(params.id).catch(() => null);
  if (!item) notFound();

  return (
    <>
      <DetailHeader />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <nav className="mb-4 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">
            首页
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-900">想法详情</span>
        </nav>

        <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
            <div className="sm:pt-1">
              <VoteButton
                itemId={item.id}
                initialCount={item.voteCount}
                size="lg"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <StatusBadge status={item.status} />
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">
                  {item.category}
                </span>
                <span>提交于 {formatRelativeTime(item.createdAt)}</span>
                {item.submitterName && (
                  <span>· 提交者 {item.submitterName}</span>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">
                {item.title}
              </h1>
              <div className="prose-base mt-4 whitespace-pre-wrap text-base leading-7 text-slate-700">
                {item.content}
              </div>

              <div className="mt-8 flex flex-wrap justify-end gap-2">
                <CopyLinkButton id={item.id} />
                <Link
                  href="/"
                  className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700 hover:bg-slate-50"
                >
                  返回列表
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
