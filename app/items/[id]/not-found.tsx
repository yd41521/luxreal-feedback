import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">想法不存在</h1>
      <p className="mt-3 text-sm text-slate-500">
        它可能已被作者撤回，或还在等待官方审核。
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-9 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
      >
        返回列表
      </Link>
    </main>
  );
}
