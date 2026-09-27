import Link from "next/link";

import { ThemeSwitcher } from "@/components/theme-switcher";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)] bg-[color:var(--canvas-raised)]/88 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[-0.01em] text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          Web3 前端面试题库
        </Link>
        <nav aria-label="个人工具" className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/bookmarks"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            我的收藏
          </Link>
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
}
