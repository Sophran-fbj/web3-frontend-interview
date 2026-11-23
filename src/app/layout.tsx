import type { Metadata, Viewport } from "next";
import Link from "next/link";

import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";

import { LearningAccountProvider } from "@/components/learning-account-provider";
import { NavigationProgress } from "@/components/navigation-progress";
import { SiteHeader } from "@/components/site-header";
import { readAuthConfiguration } from "@/lib/auth-config";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const siteUrl = getSiteUrl();
const siteTitle = "Web3 前端面试题库";
const siteDescription =
  "中文 Web3 前端面试题库，覆盖钱包连接、签名、交易、合约交互、链上数据与安全。每题包含简答、深入分析、常见错误和参考资料。";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: siteTitle,
    template: "%s | Web3 前端面试题库",
  },
  description: siteDescription,
  alternates: siteUrl ? { canonical: "/" } : undefined,
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "Web3 前端面试题库",
    title: siteTitle,
    description: siteDescription,
    url: siteUrl?.toString(),
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
  robots:
    process.env.CONTENT_PREVIEW === "true"
      ? { index: false, follow: false }
      : undefined,
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: "#080b16",
};

const themeBootScript = `
try {
  const theme = localStorage.getItem("web3-interview-theme");
  if (["cold-white", "graphite", "warm-sand"].includes(theme)) {
    document.documentElement.dataset.theme = theme;
  }
} catch {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" data-theme="graphite" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <NavigationProgress />
        <a
          href="#main-content"
          className="fixed top-3 left-3 z-50 -translate-y-24 rounded-lg bg-[var(--text-strong)] px-4 py-2 text-sm font-semibold text-[var(--canvas)] shadow-lg transition-transform focus:translate-y-0 focus:outline-2 focus:outline-offset-2 focus:outline-[var(--accent-bright)]"
        >
          跳到主要内容
        </a>
        <LearningAccountProvider enabled={readAuthConfiguration().available}>
          <SiteHeader />
          <div className="flex-1">{children}</div>
        </LearningAccountProvider>
        <footer className="mt-auto border-t border-[var(--line)] bg-[var(--canvas-raised)]/40 px-5 py-7 text-sm text-[var(--text-faint)] sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs tracking-wide text-[var(--text-faint)]">
              Web3 前端面试题库 · 本地优先 · 内容遵循 CC BY-SA 4.0
            </p>
            <div className="flex items-center gap-5 text-xs">
              <Link
                href="/questions"
                className="transition-colors hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
              >
                全部题目
              </Link>
              <Link
                href="/interview"
                className="transition-colors hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
              >
                模拟面试
              </Link>
              <Link
                href="/contribute"
                className="transition-colors hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
              >
                反馈与投稿
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
