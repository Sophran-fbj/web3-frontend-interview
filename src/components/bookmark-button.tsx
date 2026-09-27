"use client";

import { useState } from "react";

import { useBookmarkStore } from "@/stores/use-bookmark-store";

export function BookmarkButton({ questionId }: { questionId: string }) {
  const [animationKey, setAnimationKey] = useState(0);
  const hasHydrated = useBookmarkStore((state) => state.hasHydrated);
  const bookmarked = useBookmarkStore((state) =>
    Boolean(state.bookmarks[questionId]),
  );
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);

  return (
    <button
      type="button"
      aria-label={bookmarked ? "取消收藏" : "收藏题目"}
      aria-pressed={bookmarked}
      title={bookmarked ? "取消收藏" : "收藏题目"}
      disabled={!hasHydrated}
      onClick={() => {
        toggleBookmark(questionId);
        setAnimationKey((key) => key + 1);
      }}
      className="bookmark-button inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-wait"
    >
      <svg
        key={animationKey}
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={`size-6 ${animationKey > 0 ? "bookmark-heart-pulse" : ""}`}
        fill={bookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.4 5.6a5.1 5.1 0 0 0-7.2 0L12 6.8l-1.2-1.2a5.1 5.1 0 0 0-7.2 7.2L12 21l8.4-8.2a5.1 5.1 0 0 0 0-7.2Z" />
      </svg>
    </button>
  );
}
