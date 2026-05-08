"use client";

import Image from "next/image";
import { useState } from "react";

const CHARACTER_SRC = "/assets/hero-character.png";

/**
 * Hero 右侧人像：透明底 PNG 放在 public/assets/hero-character.png。
 * 若文件暂缺，显示轻量占位，避免布局塌缩。
 */
export function HeroCharacter() {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div className="flex h-full min-h-[240px] w-full flex-col items-center justify-end gap-2 pb-6 text-center lg:pb-10">
        <div className="rounded-2xl border border-dashed border-accent-violet/40 bg-accent-glow/20 px-6 py-8 text-sm text-ink-muted">
          请将透明底人像保存为
          <br />
          <code className="mt-1 inline-block rounded bg-surface-muted px-2 py-0.5 text-xs text-ink">
            public/assets/hero-character.png
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[260px] w-full sm:min-h-[320px] lg:min-h-[480px]">
      <Image
        src={CHARACTER_SRC}
        alt=""
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="select-none object-contain object-bottom"
        onError={() => setBroken(true)}
      />
    </div>
  );
}
