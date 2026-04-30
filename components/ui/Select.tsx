"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { cn } from "@/lib/utils";

/**
 * Token 化的 Select 组件，基于 Radix Primitives。
 *
 * 设计理由：
 *   - 原生 <select> 弹层由 OS 渲染，没法用 Tailwind token 控制（Windows 上深蓝高亮特别突兀）。
 *   - Radix 自渲染弹层 + 完整 a11y（ARIA / 键盘 / 焦点陷阱 / 屏幕阅读器）。
 *   - 通过 Portal 把 popover 挂到 <body>，不会被 hero 区 overflow:hidden 裁切。
 *
 * 触发器外观沿用原 Filters 极简样式（裸文字 + chevron），保证替换前后视觉零突变。
 *
 * Radix 不允许 <Item value=""/>（空字符串保留），用 ALL 哨兵代替"全部"，在边界做转换。
 */

const ALL = "__all__";

export type SelectProps = {
  label: string;
  value?: string;
  onChange: (v?: string) => void;
  options: readonly string[];
  /** 占位文本（"全部"等中性词），默认"全部"。 */
  placeholder?: string;
};

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "全部",
}: SelectProps) {
  return (
    <label className="inline-flex min-h-[44px] items-center gap-1.5 py-1">
      <span className="shrink-0 text-ink-faint">{label}</span>
      <RadixSelect.Root
        value={value ?? ALL}
        onValueChange={(v) => onChange(v === ALL ? undefined : v)}
      >
        <RadixSelect.Trigger
          aria-label={label}
          className={cn(
            "inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-md px-1 -mx-1 outline-none",
            "font-medium text-ink transition-colors",
            "hover:text-accent-violet",
            "data-[state=open]:text-accent-violet",
            "focus-visible:ring-2 focus-visible:ring-accent-violet/40 focus-visible:ring-offset-2"
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronIcon className="h-3.5 w-3.5 text-ink-faint transition-transform data-[state=open]:rotate-180" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={6}
            className={cn(
              "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-surface-muted bg-surface p-1 shadow-card",
              "data-[state=open]:animate-popIn",
              // Radix 暴露的 transform-origin 变量，让动画从触发器锚点展开
              "[transform-origin:var(--radix-select-content-transform-origin)]"
            )}
          >
            <RadixSelect.Viewport className="p-0.5">
              <SelectItem value={ALL}>{placeholder}</SelectItem>
              {options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </label>
  );
}

function SelectItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <RadixSelect.Item
      value={value}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg py-1.5 pl-2.5 pr-7 text-sm text-ink outline-none",
        "transition-colors",
        // 键盘高亮 / 鼠标悬停（Radix 用同一个 data-highlighted 标记）
        "data-[highlighted]:bg-accent-glow/40 data-[highlighted]:text-accent-violet",
        // 当前选中：字重稍重，方便扫读
        "data-[state=checked]:font-medium"
      )}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="absolute right-2 inline-flex items-center text-accent-violet">
        <CheckIcon className="h-3.5 w-3.5" />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4 10-10" />
    </svg>
  );
}
