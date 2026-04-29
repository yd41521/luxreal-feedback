"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * 呼吸光晕：多个同心圆，自内向外缩放 + 透明度峰谷起伏，无限循环。
 *
 * 实现要点：
 *   1. 用 staggered delay 把多圈错开半个周期，形成连续涟漪感（而非整体齐刷刷搏动）。
 *   2. 颜色全部走 token（accent-silver 边、accent-violet 光晕），后期改色无需动组件。
 *   3. 自动遵循 prefers-reduced-motion：检测到时退化为静态多层 ring，仍保留装饰性。
 *   4. pointer-events-none，不会拦截上层交互。
 *
 * 用法示例（放在任意 relative 容器内即可）：
 *   <section className="relative">
 *     <BreathingHalo />
 *     <div className="relative">...上层内容...</div>
 *   </section>
 */
export interface BreathingHaloProps {
  className?: string;
  /** 同时存在的圈数。建议 2-4。 */
  count?: number;
  /** 单圈一轮 scale + fade 的秒数。 */
  duration?: number;
  /** 起始 scale（0-1，越小起点越聚拢）。 */
  fromScale?: number;
  /** 终止 scale（>1，越大扩张越远）。 */
  toScale?: number;
  /** 圈的基础尺寸（px），最终视觉直径 = baseSize × scale。 */
  baseSize?: number;
  /** 周期中段的最大透明度。 */
  peakOpacity?: number;
}

const RIPPLE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function BreathingHalo({
  className,
  count = 3,
  duration = 5,
  fromScale = 0.45,
  toScale = 1.6,
  baseSize = 260,
  peakOpacity = 0.5,
}: BreathingHaloProps) {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            width: baseSize,
            height: baseSize,
            border: "1px solid rgb(var(--accent-silver) / 0.65)",
            boxShadow:
              "0 0 36px 2px rgb(var(--accent-violet) / 0.28), inset 0 0 36px 2px rgb(var(--accent-glow) / 0.32)",
          }}
          initial={{ scale: fromScale, opacity: 0 }}
          animate={
            reduce
              ? { scale: 1 + i * 0.22, opacity: 0.18 }
              : {
                  scale: [fromScale, toScale],
                  opacity: [0, peakOpacity, 0],
                }
          }
          transition={
            reduce
              ? { duration: 0.4 }
              : {
                  duration,
                  delay: (i * duration) / count,
                  repeat: Infinity,
                  ease: RIPPLE_EASE,
                }
          }
        />
      ))}
    </div>
  );
}
