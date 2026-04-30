"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, type Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getVisitorId } from "@/lib/fingerprint";

export function SubmitDialog({
  open,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("想法和建议");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErrorMsg(null);
    setOkMsg(null);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const titleLen = title.trim().length;
  const contentLen = content.trim().length;
  const canSubmit =
    !submitting && titleLen >= 1 && titleLen <= 60 && contentLen >= 10 && contentLen <= 2000;

  /** 计算阻止提交的原因，用于按钮文字与字段提示。 */
  function getBlockReason(): string | null {
    if (titleLen === 0) return "请填写标题";
    if (titleLen > 60) return "标题超过 60 字";
    if (contentLen === 0) return "请填写描述";
    if (contentLen < 10) return `描述还差 ${10 - contentLen} 字`;
    if (contentLen > 2000) return "描述超过 2000 字";
    return null;
  }
  const blockReason = getBlockReason();

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const fp = await getVisitorId();
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          submitter_name: name.trim() || undefined,
          submitter_contact: contact.trim() || undefined,
          fingerprint: fp,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message || "提交失败");
      }
      setOkMsg("已提交！等待官方审核通过后将公开展示。");
      setTitle("");
      setContent("");
      setName("");
      setContact("");
      onSubmitted();
      setTimeout(onClose, 1400);
    } catch (e) {
      setErrorMsg((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-h-[min(90dvh,56rem)]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">
              提交一个新想法
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              告诉我们你希望 LuxReal 变成什么样
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="-mr-1 flex h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-6 sm:py-5">
          <Field
            label="标题"
            required
            counter={`${titleLen}/60`}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 60))}
              placeholder="用一句话描述你的想法"
              className="h-12 min-h-[48px] w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:h-11 sm:min-h-0 sm:text-sm"
            />
          </Field>

          <Field
            label="描述"
            required
            counter={`${contentLen}/2000`}
            counterTone={contentLen > 0 && contentLen < 10 ? "warn" : "muted"}
            hint={
              contentLen > 0 && contentLen < 10
                ? `还差 ${10 - contentLen} 字才能提交（描述至少 10 字）`
                : contentLen === 0
                  ? "至少 10 字"
                  : undefined
            }
            hintTone={contentLen > 0 && contentLen < 10 ? "warn" : "muted"}
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 2000))}
              placeholder="详细说明使用场景、期望效果..."
              rows={5}
              className="block min-h-[8rem] w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:text-sm"
            />
          </Field>

          <Field label="类别" required>
            <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "flex min-h-[44px] items-center justify-center rounded-xl border px-2 text-center text-sm transition",
                    category === c
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="昵称（可选）">
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                placeholder="请输入你的昵称"
                className="h-12 min-h-[48px] w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:h-11 sm:min-h-0 sm:text-sm"
              />
            </Field>
            <Field label="联系方式（可选）">
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value.slice(0, 50))}
                placeholder="邮箱或手机号"
                className="h-12 min-h-[48px] w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:h-11 sm:min-h-0 sm:text-sm"
              />
            </Field>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {errorMsg}
            </div>
          )}
          {okMsg && (
            <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
              {okMsg}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="order-2 text-xs text-slate-500 sm:order-1 sm:max-w-[14rem]">
            提交后由官方审核，通过后将公开展示
          </p>
          <div className="order-1 flex w-full gap-2 sm:order-2 sm:w-auto">
            <button
              onClick={onClose}
              className="h-11 min-h-[44px] flex-1 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-600 hover:bg-slate-50 sm:h-9 sm:min-h-0 sm:flex-initial"
            >
              取消
            </button>
            <button
              disabled={!canSubmit}
              onClick={handleSubmit}
              title={blockReason ?? undefined}
              className={cn(
                "h-11 min-h-[44px] flex-1 rounded-lg px-4 text-sm font-medium text-cta-fg transition sm:h-9 sm:min-h-0 sm:flex-initial",
                canSubmit
                  ? "bg-cta hover:bg-cta-hover"
                  : "bg-cta-muted cursor-not-allowed"
              )}
            >
              {submitting
                ? "提交中..."
                : blockReason ?? "提交想法"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type Tone = "muted" | "warn";

function Field({
  label,
  required,
  counter,
  counterTone = "muted",
  hint,
  hintTone = "muted",
  children,
}: {
  label: string;
  required?: boolean;
  counter?: string;
  counterTone?: Tone;
  hint?: string;
  hintTone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
        {counter && (
          <span
            className={cn(
              "text-xs tabular-nums transition-colors",
              counterTone === "warn" ? "text-amber-600" : "text-slate-400"
            )}
          >
            {counter}
          </span>
        )}
      </div>
      {children}
      {hint && (
        <p
          className={cn(
            "text-xs transition-colors",
            hintTone === "warn" ? "text-amber-600" : "text-slate-400"
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
