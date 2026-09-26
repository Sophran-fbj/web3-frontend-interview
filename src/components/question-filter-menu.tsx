"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

type FilterOption = {
  value: string;
  label: string;
  href: string;
};

type QuestionFilterMenuProps = {
  label: string;
  value?: string;
  allLabel: string;
  allHref: string;
  options: FilterOption[];
};

export function QuestionFilterMenu({
  label,
  value,
  allLabel,
  allHref,
  options,
}: QuestionFilterMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? allLabel;

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
    <div ref={containerRef} className="relative min-w-0">
      <span className="mb-2 block text-xs font-medium text-[var(--text-muted)]">
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${label}：${selectedLabel}`}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 text-left text-sm font-medium text-[var(--text-strong)] shadow-[inset_0_1px_0_var(--control-highlight)] hover:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className={`size-4 shrink-0 text-[var(--text-faint)] transition-transform duration-150 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
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
          id={listId}
          className="absolute top-[calc(100%+0.5rem)] right-0 left-0 z-30 max-h-72 overflow-y-auto rounded-xl border border-[var(--line-strong)] bg-[var(--canvas-raised)] p-1.5 shadow-[0_18px_48px_var(--shadow)]"
        >
          <li>
            <Link
              href={allHref}
              aria-current={value ? undefined : "true"}
              onClick={() => setOpen(false)}
              className="flex min-h-10 items-center justify-between rounded-lg px-3 text-sm text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            >
              {allLabel}
              {!value && <ActiveMark />}
            </Link>
          </li>
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <li key={option.value}>
                <Link
                  href={option.href}
                  aria-current={selected ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  className="flex min-h-10 items-center justify-between rounded-lg px-3 text-sm text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  <span className="truncate">{option.label}</span>
                  {selected && <ActiveMark />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ActiveMark() {
  return (
    <span
      aria-hidden="true"
      className="ml-3 size-1.5 shrink-0 rounded-full bg-[var(--accent)]"
    />
  );
}
