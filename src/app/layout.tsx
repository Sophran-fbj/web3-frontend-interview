import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Web3 前端面试手册",
    template: "%s | Web3 前端面试手册",
  },
  description: "持续更新、经过验证的 Web3 前端面试题库与实战指南。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
