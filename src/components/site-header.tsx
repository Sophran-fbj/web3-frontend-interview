import Link from "next/link";

import { ThemeSwitcher } from "@/components/theme-switcher";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)] bg-[color:var(--canvas-raised)]/88 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[-0.01em] text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          Web3 前端面试题库
        </Link>
        <nav
          aria-label="个人工具"
          className="flex w-full flex-wrap items-center gap-4 sm:w-auto sm:gap-5"
        >
          <Link href="/review" className="study-link whitespace-nowrap">
            复习
          </Link>
          <Link
            href="/bookmarks"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            我的收藏
          </Link>
          <Link
            href="/contribute"
            className="hidden text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] sm:inline"
          >
            参与共建
          </Link>
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
}
