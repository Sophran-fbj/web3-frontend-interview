import type { Metadata, Viewport } from "next";

import { SiteHeader } from "@/components/site-header";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const siteUrl = getSiteUrl();
const siteTitle = "Web3 前端面试题库｜钱包、签名与交易实战";
const siteDescription =
  "中文 Web3 前端面试题库，覆盖钱包连接、签名、交易、合约交互、链上数据与安全。每题包含简答、深入分析、常见错误和参考资料。";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: siteTitle,
    template: "%s | Web3 前端面试手册",
  },
  description: siteDescription,
  alternates: siteUrl ? { canonical: "/" } : undefined,
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "Web3 前端面试手册",
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
