/**
 * 动效占位库：集中管理所有 framer-motion 配置，供组件复用。
 *
 * 设计原则：
 *   1. 组件层不要硬编码 ease / duration / variants，全部从这里 import。
 *      这样后期只需调本文件即可改变全局节奏。
 *   2. 默认导出几个常用 variant，先以「准静态」幅度做基线（位移 ≤ 8px、透明度变化），
 *      后续视觉验收完毕后再统一调大表现力。
 *   3. 通过 prefersReducedMotion 让用户系统设置直接静默动画。
 */

import type { Variants, Transition } from "framer-motion";

/** 全局缓动函数。沿用 Apple HIG / Material 推荐的 standard easing。 */
export const easings = {
  standard: [0.2, 0, 0, 1] as [number, number, number, number],
  emphasized: [0.05, 0.7, 0.1, 1] as [number, number, number, number],
  spring: { type: "spring", stiffness: 280, damping: 26 } as Transition,
} as const;

/** 默认时长（ms 转为 framer-motion 秒）。 */
export const durations = {
  fast: 0.18,
  base: 0.32,
  slow: 0.52,
} as const;

/** 一个保留位：完全无动效（用于禁用动效场景的 variant 占位）。 */
export const noop: Variants = {
  hidden: {},
  show: {},
};

/** 元素从 6px 下方淡入。基础显隐动效，主页 / 详情页通用。 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.base, ease: easings.standard },
  },
};

/** 容器：让子元素以 60ms 间隔依次进入。配合 fadeUp 用于卡片列表。 */
export const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

/**
 * 是否禁用动效。当前简化为：在 ssr 环境强制禁用，
 * 浏览器环境中读取 prefers-reduced-motion。
 *
 * 后续如需做"动效整体开关"，在这里加一个 env / localStorage flag 即可。
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
