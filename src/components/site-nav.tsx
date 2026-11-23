"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

const learningLinks = [
  { href: "/review", label: "复习", description: "错题与待复习追踪" },
  { href: "/bookmarks", label: "我的收藏", description: "随时回顾重点题目" },
  { href: "/study-sets", label: "题单", description: "自定义刷题路径" },
] as const;

function isWithin(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function navPillClass(active: boolean) {
  return `inline-flex min-h-10 items-center rounded-lg px-3 text-sm whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
    active
      ? "bg-[var(--surface)] font-medium text-[var(--text-strong)] shadow-[inset_0_1px_0_var(--control-highlight)]"
      : "text-[var(--text-muted)] hover:bg-[var(--surface)]/60 hover:text-[var(--text-strong)]"
  }`;
}

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const questionsActive = isWithin(pathname, "/questions");
  const interviewActive = isWithin(pathname, "/interview");
  const learningActive = learningLinks.some((link) =>
    isWithin(pathname, link.href),
  );

  const [lastPathname, setLastPathname] = useState(pathname);
  if (open && lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <Link
        href="/questions"
        aria-current={questionsActive ? "page" : undefined}
        className={navPillClass(questionsActive)}
      >
        题库
      </Link>
      <Link
        href="/interview"
        aria-current={interviewActive ? "page" : undefined}
        className={navPillClass(interviewActive)}
      >
        模拟面试
      </Link>
      <div ref={containerRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label="我的学习"
          onClick={() => setOpen((current) => !current)}
          className={`flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
            learningActive
              ? "bg-[var(--surface)] font-medium text-[var(--text-strong)] shadow-[inset_0_1px_0_var(--control-highlight)]"
              : "text-[var(--text-muted)] hover:bg-[var(--surface)]/60 hover:text-[var(--text-strong)]"
          }`}
        >
          我的学习
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className={`size-3.5 shrink-0 text-[var(--text-faint)] transition-transform duration-150 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          >
            <path
              d="m4 6 4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </button>

        {open && (
          <ul
            id={menuId}
            className="popover-panel absolute top-[calc(100%+0.5rem)] right-0 z-40 w-52 max-w-[calc(100vw-2.5rem)] rounded-xl border border-[var(--line-strong)] bg-[var(--canvas-raised)] p-1.5 shadow-[0_18px_48px_var(--shadow)]"
          >
            {learningLinks.map((link) => {
              const active = isWithin(pathname, link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
                      active
                        ? "bg-[var(--surface)] font-medium text-[var(--text-strong)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-strong)]"
                    }`}
                  >
                    <span>
                      <span className="block leading-tight">{link.label}</span>
                      <span
                        aria-hidden="true"
                        className="mt-0.5 block text-[11px] font-normal text-[var(--text-faint)]"
                      >
                        {link.description}
                      </span>
                    </span>
                    {active && (
                      <span
                        aria-hidden="true"
                        className="size-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
