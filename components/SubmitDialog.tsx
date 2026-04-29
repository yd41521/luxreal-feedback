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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
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
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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

        <div className="space-y-4 px-6 py-5">
          <Field
            label="标题"
            required
            counter={`${titleLen}/60`}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 60))}
              placeholder="用一句话描述你的想法"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
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
              className="block w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </Field>

          <Field label="类别" required>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "flex h-10 items-center justify-center rounded-xl border text-sm transition",
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
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </Field>
            <Field label="联系方式（可选）">
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value.slice(0, 50))}
                placeholder="邮箱或手机号"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
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

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-3">
          <p className="text-xs text-slate-500">
            提交后由官方审核，通过后将公开展示
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-600 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              disabled={!canSubmit}
              onClick={handleSubmit}
              title={blockReason ?? undefined}
              className={cn(
                "h-9 rounded-lg px-4 text-sm font-medium text-cta-fg transition",
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
