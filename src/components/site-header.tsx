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
          Web3 前端面试手册
        </Link>
        <nav
          aria-label="主导航"
          className="flex items-center gap-4 text-sm sm:gap-6"
        >
          <Link
            href="/questions"
            className="text-[var(--text-muted)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            浏览题库
          </Link>
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
}
