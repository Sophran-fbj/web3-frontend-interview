import type { Metadata, Viewport } from "next";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Web3 前端面试手册",
    template: "%s | Web3 前端面试手册",
  },
  description: "持续更新、经过验证的 Web3 前端面试题库与实战指南。",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#080b16",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN">
      <body>
        <a
          href="#main-content"
          className="fixed top-3 left-3 z-50 -translate-y-20 bg-[var(--text-strong)] px-4 py-2 text-sm font-semibold text-[var(--canvas)] focus:translate-y-0 focus:outline-2 focus:outline-offset-2 focus:outline-[var(--accent-bright)]"
        >
          跳到主要内容
        </a>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
