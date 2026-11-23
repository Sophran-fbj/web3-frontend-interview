import Link from "next/link";

import { CommandPalette } from "@/components/command-palette";
import { SiteNav } from "@/components/site-nav";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { readAuthConfiguration } from "@/lib/auth-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--glass)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-2.5 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-[-0.015em] text-[var(--text-strong)] transition-colors hover:text-[var(--accent-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 64 64"
            className="size-6 shrink-0 rounded-md shadow-sm"
          >
            <rect width="64" height="64" rx="14" fill="var(--accent)" />
            <path
              d="M21 20 11 32l10 12m22-24 10 12-10 12"
              fill="none"
              stroke="#fff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="5"
            />
            <path
              d="M27 25c.5-3.5 2.4-5.5 5.4-5.5 3.4 0 5.6 2 5.6 5 0 2.5-1.2 4-4.1 5.8-2 1.2-2.4 2.3-2.4 4.7"
              fill="none"
              stroke="#fff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4.5"
            />
            <circle cx="31.5" cy="43" r="2.8" fill="#fff" />
          </svg>
          <span>Web3 前端面试题库</span>
        </Link>

        <nav
          aria-label="主导航"
          className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3"
        >
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            <SiteNav />
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <CommandPalette />
            <Link
              href="/contribute"
              className="hidden text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] md:inline"
            >
              参与共建
            </Link>
            <ThemeSwitcher />
            {readAuthConfiguration().available && (
              <Link href="/account" className="study-link whitespace-nowrap">
                账号与同步
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
