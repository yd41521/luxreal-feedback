"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Hero 背景：矢量级渐变压底 + 多层模糊色块缓动（银紫 Token）。
 * 人物请走 Hero 的 asideSlot，勿再叠整屏低清位图。
 */
export function HeroAtmosphere() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 isolate overflow-hidden">
      <BaseGradient />

      <motion.div
        className="pointer-events-none absolute -right-[12%] top-[4%] h-[min(95vw,600px)] w-[min(95vw,600px)] rounded-full bg-accent-glow/85 blur-[100px]"
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, 18, -12, 0],
                y: [0, -22, 10, 0],
                scale: [1, 1.06, 0.96, 1],
              }
        }
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="pointer-events-none absolute -left-[12%] bottom-[0%] h-[min(80vw,500px)] w-[min(80vw,500px)] rounded-full bg-accent-silver/65 blur-[88px]"
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, -14, 16, 0],
                y: [0, 14, -8, 0],
                scale: [1, 0.94, 1.05, 1],
              }
        }
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2,
        }}
      />

      <motion.div
        className="pointer-events-none absolute left-[28%] top-[32%] h-[min(65vw,420px)] w-[min(65vw,420px)] rounded-[40%] bg-accent-violet/55 blur-[100px]"
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, -20, 14, 0],
                y: [0, 18, -12, 0],
                scale: [1, 1.08, 0.92, 1],
              }
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2.5,
        }}
      />

      {/* 极轻噪点：避免渐变带状断层（动效关时仍保留） */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
    </div>
  );
}

function BaseGradient() {
  const violet = { x: "78%", y: "48%", w: "65%", h: "85%" };
  const silver = { x: "12%", y: "30%", w: "55%", h: "70%" };
  return (
    <div
      className="absolute inset-0"
      style={{
        background: [
          `radial-gradient(ellipse ${violet.w} ${violet.h} at ${violet.x} ${violet.y}, rgb(var(--accent-glow) / 0.95) 0%, rgb(var(--accent-violet) / 0.42) 28%, rgb(var(--accent-violet) / 0.14) 52%, transparent 78%)`,
          `radial-gradient(ellipse ${silver.w} ${silver.h} at ${silver.x} ${silver.y}, rgb(var(--accent-silver) / 0.58) 0%, rgb(var(--accent-silver) / 0.12) 48%, transparent 68%)`,
          `linear-gradient(180deg, rgb(var(--surface)) 0%, rgb(var(--surface-subtle)) 100%)`,
        ].join(", "),
      }}
      aria-hidden
    />
  );
}
