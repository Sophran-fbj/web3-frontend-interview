"use client";

import { useEffect, useState } from "react";

import type { QuestionHeading } from "@/content/question-headings";

export function QuestionToc({
  promptHeadings,
  answerHeadings,
}: {
  promptHeadings: QuestionHeading[];
  answerHeadings: QuestionHeading[];
}) {
  const allHeadings = [...promptHeadings, ...answerHeadings];
  const [activeId, setActiveId] = useState<string>(allHeadings[0]?.id ?? "");

  useEffect(() => {
    const ids = [...promptHeadings, ...answerHeadings].map((item) => item.id);
    if (ids.length === 0 || typeof IntersectionObserver === "undefined") return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-90px 0px -65% 0px",
        threshold: 0,
      },
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [promptHeadings, answerHeadings]);

  if (allHeadings.length === 0) return null;

  function navigateToHeading(id: string, inAnswer: boolean) {
    if (inAnswer) {
      const disclosure = document.querySelector<HTMLDetailsElement>(
        "details.answer-disclosure",
      );
      if (disclosure && !disclosure.open) {
        disclosure.open = true;
      }
    }

    setActiveId(id);

    requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (!target) return;
      const reducedMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  function renderList(headings: QuestionHeading[], inAnswer: boolean) {
    return (
      <ul className="space-y-0.5">
        {headings.map((heading) => {
          const active = activeId === heading.id;
          return (
            <li key={`${heading.level}-${heading.id}`}>
              <a
                href={`#${heading.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  navigateToHeading(heading.id, inAnswer);
                }}
                className={`block rounded-md border-l-2 py-1 pr-2 text-xs leading-5 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
                  heading.level === 3 ? "pl-5" : "pl-3"
                } ${
                  active
                    ? "border-[var(--accent)] bg-[var(--surface)]/75 font-medium text-[var(--text-strong)]"
                    : "border-transparent text-[var(--text-faint)] hover:border-[var(--line-strong)] hover:text-[var(--text-muted)]"
                }`}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <nav aria-label="页面目录" className="study-card p-4">
      <p className="mb-2.5 text-xs font-semibold text-[var(--text-strong)]">
        页面目录
      </p>
      {promptHeadings.length > 0 && renderList(promptHeadings, false)}
      {answerHeadings.length > 0 && (
        <div className="mt-3 border-t border-[var(--line)] pt-2.5">
          <p className="mb-1.5 px-1 text-[11px] font-medium text-[var(--text-faint)]">
            参考答案章节
          </p>
          {renderList(answerHeadings, true)}
        </div>
      )}
    </nav>
  );
}
