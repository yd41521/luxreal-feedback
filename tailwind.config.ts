import type { Config } from "tailwindcss";

/**
 * 颜色采用语义化 token 体系，全部经由 CSS 变量驱动，实际值在 app/globals.css :root 中定义。
 *
 * Token 分层：
 *   - brand   : 历史 indigo 色阶。保留用于过渡期回退；新视觉中应优先使用 cta / accent。
 *   - cta     : 主行动按钮（提交想法等）。当前为纯黑系。
 *   - surface : 页面 / 卡片 / 对话框的中性面。
 *   - ink     : 文字 / 前景色。
 *   - accent  : 装饰性高光（银紫光晕）。
 *
 * 所有 token 使用 rgb(var(--xxx) / <alpha-value>) 语法，支持 bg-cta/80、text-ink/60 等透明度修饰。
 * 因此 globals.css 中的变量值必须写成空格分隔的 RGB 三元组（不要带 rgb()）。
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        cta: {
          DEFAULT: "rgb(var(--cta) / <alpha-value>)",
          hover: "rgb(var(--cta-hover) / <alpha-value>)",
          fg: "rgb(var(--cta-fg) / <alpha-value>)",
          muted: "rgb(var(--cta-muted) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          subtle: "rgb(var(--surface-subtle) / <alpha-value>)",
          muted: "rgb(var(--surface-muted) / <alpha-value>)",
          elevated: "rgb(var(--surface-elevated) / <alpha-value>)",
          inverse: "rgb(var(--surface-inverse) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
          subtle: "rgb(var(--ink-subtle) / <alpha-value>)",
          faint: "rgb(var(--ink-faint) / <alpha-value>)",
          inverse: "rgb(var(--ink-inverse) / <alpha-value>)",
        },
        accent: {
          silver: "rgb(var(--accent-silver) / <alpha-value>)",
          violet: "rgb(var(--accent-violet) / <alpha-value>)",
          glow: "rgb(var(--accent-glow) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "PingFang SC",
          "Microsoft YaHei",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)",
        "card-hover":
          "0 4px 12px rgba(15, 23, 42, 0.06), 0 2px 4px rgba(15, 23, 42, 0.04)",
        glow:
          "0 0 0 1px rgba(255,255,255,0.6), 0 12px 32px -8px rgba(139,92,246,0.18), 0 4px 12px -4px rgba(148,163,184,0.16)",
        "glow-strong":
          "0 0 0 1px rgba(255,255,255,0.65), 0 24px 56px -12px rgba(139,92,246,0.26), 0 8px 24px -8px rgba(148,163,184,0.22)",
      },
      backgroundImage: {
        "hero-veil":
          "radial-gradient(ellipse at top right, rgba(196,181,253,0.30) 0%, transparent 55%), radial-gradient(ellipse at bottom left, rgba(203,213,225,0.40) 0%, transparent 50%)",
      },
    },
  },
  plugins: [],
};

export default config;
