"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function CustomSelect({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
  className = "",
}: {
  id?: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const generatedId = useId();
  const buttonId = id ?? `${generatedId}-button`;
  const labelId = `${generatedId}-label`;
  const valueId = `${generatedId}-value`;
  const listboxId = `${generatedId}-listbox`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!open) return;

    function handleOutsidePointer(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
    };
  }, [open]);

  function firstEnabledIndex() {
    return options.findIndex((option) => !option.disabled);
  }

  function lastEnabledIndex() {
    for (let index = options.length - 1; index >= 0; index--) {
      if (!options[index]?.disabled) return index;
    }
    return -1;
  }

  function nextEnabledIndex(current: number, step: 1 | -1) {
    if (options.length === 0) return -1;
    let cursor = current;
    for (let count = 0; count < options.length; count++) {
      cursor = (cursor + step + options.length) % options.length;
      if (!options[cursor]?.disabled) return cursor;
    }
    return -1;
  }

  function openMenu(targetIndex?: number) {
    if (disabled) return;
    const fallback =
      selectedIndex >= 0 && !options[selectedIndex]?.disabled
        ? selectedIndex
        : firstEnabledIndex();
    const nextIdx =
      targetIndex !== undefined && targetIndex >= 0 ? targetIndex : fallback;
    setActiveIndex(Math.max(nextIdx, 0));
    setOpen(true);
    requestAnimationFrame(() => {
      optionRefs.current[Math.max(nextIdx, 0)]?.focus();
    });
  }

  function focusIndex(index: number) {
    if (index < 0) return;
    setActiveIndex(index);
    optionRefs.current[index]?.focus();
  }

  function selectOption(option: SelectOption) {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenu(
        selectedIndex >= 0
          ? nextEnabledIndex(selectedIndex, 1)
          : firstEnabledIndex(),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(
        selectedIndex >= 0
          ? nextEnabledIndex(selectedIndex, -1)
          : lastEnabledIndex(),
      );
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        setOpen(false);
      } else {
        openMenu();
      }
    }
  }

  function handleListboxKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      focusIndex(nextEnabledIndex(activeIndex, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusIndex(nextEnabledIndex(activeIndex, -1));
    } else if (event.key === "Home") {
      event.preventDefault();
      focusIndex(firstEnabledIndex());
    } else if (event.key === "End") {
      event.preventDefault();
      focusIndex(lastEnabledIndex());
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative min-w-0 ${className}`}>
      <label
        id={labelId}
        htmlFor={buttonId}
        className="mb-2 block text-sm font-medium text-[var(--text-strong)]"
      >
        {label}
      </label>
      <button
        ref={triggerRef}
        id={buttonId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={`${labelId} ${valueId}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-[var(--line-strong)] bg-[var(--canvas-raised)] px-3.5 text-left text-sm font-medium text-[var(--text-strong)] shadow-[inset_0_1px_0_var(--control-highlight)] transition-colors duration-150 hover:border-[var(--accent)] focus-visible:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span id={valueId} className="truncate">
          {selectedOption?.label ?? "请选择"}
        </span>
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
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          onKeyDown={handleListboxKeyDown}
          className="filter-options popover-panel absolute top-[calc(100%+0.45rem)] right-0 left-0 z-30 max-h-64 overflow-y-auto rounded-xl border border-[var(--line-strong)] bg-[var(--canvas-raised)] p-1.5 shadow-[0_18px_48px_var(--shadow)]"
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            return (
              <li key={option.value} role="presentation">
                <button
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={option.disabled}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => {
                    if (!option.disabled) setActiveIndex(index);
                  }}
                  className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-3 text-left text-sm transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-45 ${
                    selected
                      ? "bg-[var(--surface)] font-medium text-[var(--text-strong)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-strong)]"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {selected && (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      className="size-3.5 shrink-0 text-[var(--accent-bright)]"
                    >
                      <path
                        d="M3.5 8.5 6.5 11.5 12.5 4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.75"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
