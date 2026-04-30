import type { Metadata, Viewport } from "next";
import "./globals.css";

/** 允许用户缩放（不锁 maximum-scale=1），利于小屏阅读与无障碍。 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "LuxReal · 反馈广场",
  description: "提交你的想法，与社区一起决定 LuxReal 的下一步",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        <noscript>
          <p style={{ padding: 16 }}>本站需要 JavaScript 才能正常工作。</p>
        </noscript>
        <EmbedClassInjector />
        {children}
      </body>
    </html>
  );
}

/** 检测 ?embed=1 时给 body 加 .embed 类，由 globals.css 隐藏 Header/Hero。 */
function EmbedClassInjector() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{if(new URLSearchParams(location.search).get("embed")==="1"){document.body.classList.add("embed");}}catch(e){}})();`,
      }}
    />
  );
}
