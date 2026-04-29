"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Hero 区采用 slot 模式，将「装饰图层」与「内容结构」彻底解耦：
 *
 *   - backgroundSlot : 绝对定位、铺满 section 的背景层（光晕、渐变、纹理皆可）。
 *                      不传时使用默认银紫双 halo。
 *   - asideSlot      : 主内容右侧的副视觉区（人像、3D 物件、贴纸等）。
 *                      传入时切换为「全宽 2 栏 grid」，左栏文字内有内 max-width，
 *                      右栏从中线一直贯穿到 viewport 右边缘；不传时保持居中。
 *
 * 视觉只通过 props 注入，组件内部不持有任何品牌色硬编码。
 */
export function Hero({
  onSearch,
  initialQuery,
  title = "听见你的声音，让产品更懂你",
  subtitle = "提交你的想法，与社区一起决定下一步",
  backgroundSlot,
  asideSlot,
}: {
  onSearch: (q: string) => void;
  initialQuery?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  backgroundSlot?: ReactNode;
  asideSlot?: ReactNode;
}) {
  const [v, setV] = useState(initialQuery || "");

  useEffect(() => {
    const t = setTimeout(() => onSearch(v.trim()), 300);
    return () => clearTimeout(t);
  }, [v, onSearch]);

  const hasAside = Boolean(asideSlot);

  return (
    <section
      data-embed-hide="true"
      className="relative overflow-hidden border-b border-surface-muted bg-surface"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        {backgroundSlot ?? <DefaultHeroBackground hasAside={hasAside} />}
      </div>

      {hasAside ? (
        <div className="relative grid min-h-[420px] grid-cols-1 lg:min-h-[480px] lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-12 sm:px-8 sm:py-16 lg:items-end lg:py-20 lg:pr-10 xl:pr-14">
            <div className="w-full max-w-2xl">
              <h1 className="text-balance text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-[44px] xl:text-5xl">
                {title}
              </h1>
              <p className="mt-4 text-sm text-ink-subtle sm:text-base lg:text-lg">
                {subtitle}
              </p>
              <div className="mt-8 w-full max-w-xl">
                <SearchInput value={v} onChange={setV} />
              </div>
            </div>
          </div>

          <div className="relative h-72 sm:h-96 lg:h-auto">{asideSlot}</div>
        </div>
      ) : (
        <div className="relative mx-auto flex min-h-[380px] max-w-3xl flex-col items-center justify-center px-4 py-14 text-center sm:min-h-[440px] sm:py-20">
          <h1 className="text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-[44px]">
            {title}
          </h1>
          <p className="mt-3 text-sm text-ink-subtle sm:text-base lg:text-lg">
            {subtitle}
          </p>
          <div className="mt-7 w-full max-w-xl">
            <SearchInput value={v} onChange={setV} />
          </div>
        </div>
      )}
    </section>
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <svg
        className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索想法、关键词..."
        className={cn(
          "h-12 w-full rounded-2xl border border-surface-muted bg-surface/90 pl-11 pr-4 text-sm text-ink shadow-sm outline-none backdrop-blur-sm transition",
          "placeholder:text-ink-faint focus:border-accent-violet focus:ring-2 focus:ring-accent-violet/30"
        )}
      />
    </div>
  );
}

/**
 * 默认背景：双层径向光晕。
 *   - hasAside=true ：紫光环聚焦在右半屏中部（人像所在位置），银光在左下作为平衡
 *   - hasAside=false：紫光环居中靠下，银光居顶部，整体对称居中
 *
 * 全部用 CSS 变量驱动，调色 / 调位置只动 globals.css 与本文件即可。
 */
function DefaultHeroBackground({ hasAside }: { hasAside: boolean }) {
  const violet = hasAside ? { x: "78%", y: "48%", w: "65%", h: "85%" } : { x: "50%", y: "100%", w: "75%", h: "70%" };
  const silver = hasAside ? { x: "12%", y: "30%", w: "55%", h: "70%" } : { x: "20%", y: "0%", w: "60%", h: "60%" };
  return (
    <div
      className="absolute inset-0"
      style={{
        background: [
          `radial-gradient(ellipse ${violet.w} ${violet.h} at ${violet.x} ${violet.y}, rgb(var(--accent-glow) / 0.70) 0%, rgb(var(--accent-violet) / 0.30) 32%, rgb(var(--accent-violet) / 0.08) 55%, transparent 72%)`,
          `radial-gradient(ellipse ${silver.w} ${silver.h} at ${silver.x} ${silver.y}, rgb(var(--accent-silver) / 0.45) 0%, transparent 62%)`,
          `linear-gradient(180deg, rgb(var(--surface)) 0%, rgb(var(--surface-subtle)) 100%)`,
        ].join(", "),
      }}
    />
  );
}
