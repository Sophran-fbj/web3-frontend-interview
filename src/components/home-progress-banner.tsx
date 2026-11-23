"use client";

import Link from "next/link";

import { useLearningReady } from "@/components/learning-account-provider";
import { interviewHref } from "@/lib/interviews";
import { useBookmarkStore } from "@/stores/use-bookmark-store";
import { useInterviewStore } from "@/stores/use-interview-store";
import { useProgressStore } from "@/stores/use-progress-store";

export function HomeProgressBanner({
  totalQuestions,
}: {
  totalQuestions: number;
}) {
  const learningReady = useLearningReady();
  const progress = useProgressStore((state) => state.progress);
  const progressHydrated = useProgressStore((state) => state.hasHydrated);
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const bookmarksHydrated = useBookmarkStore((state) => state.hasHydrated);
  const sessions = useInterviewStore((state) => state.sessions);
  const sessionsHydrated = useInterviewStore((state) => state.hasHydrated);

  if (
    !learningReady ||
    !progressHydrated ||
    !bookmarksHydrated ||
    !sessionsHydrated
  ) {
    return null;
  }

  const records = Object.values(progress);
  const masteredCount = records.filter(
    (record) => record.status === "mastered",
  ).length;
  const reviewCount = records.filter(
    (record) => record.status === "review",
  ).length;
  const unclearCount = records.filter(
    (record) => record.status === "unclear",
  ).length;
  const pendingReviewCount = reviewCount + unclearCount;
  const bookmarkCount = Object.keys(bookmarks).length;

  const activeSession = Object.values(sessions)
    .filter((session) => session.status !== "completed")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

  const hasAnyActivity =
    records.length > 0 || bookmarkCount > 0 || Boolean(activeSession);

  if (!hasAnyActivity) return null;

  const denominator = Math.max(totalQuestions, 1);
  const masteredPct = Math.round((masteredCount / denominator) * 100);
  const reviewPct = Math.round((reviewCount / denominator) * 100);
  const unclearPct = Math.round((unclearCount / denominator) * 100);

  return (
    <section aria-label="继续本地学习" className="study-card mt-10 p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-[var(--text-strong)]">
              继续学习进度
            </p>
            <p className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
              已掌握 {masteredCount} / {totalQuestions} 题（{masteredPct}%）
            </p>
          </div>
          <div
            aria-hidden="true"
            className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-[var(--surface)]"
          >
            {masteredCount > 0 && (
              <span
                className="h-full bg-[var(--success)] transition-all duration-300"
                style={{ width: `${Math.max(masteredPct, 2)}%` }}
              />
            )}
            {reviewCount > 0 && (
              <span
                className="h-full bg-[var(--warning)] transition-all duration-300"
                style={{ width: `${Math.max(reviewPct, 2)}%` }}
              />
            )}
            {unclearCount > 0 && (
              <span
                className="h-full bg-[var(--danger)] transition-all duration-300"
                style={{ width: `${Math.max(unclearPct, 2)}%` }}
              />
            )}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-faint)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--success)]" />
              已掌握 {masteredCount}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--warning)]" />
              待复习 {reviewCount}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--danger)]" />
              不清楚 {unclearCount}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeSession && (
            <Link
              href={interviewHref(activeSession)}
              className="study-button study-button-primary"
            >
              继续模拟面试
            </Link>
          )}
          {pendingReviewCount > 0 && (
            <Link
              href="/review"
              className={
                activeSession
                  ? "study-button"
                  : "study-button study-button-primary"
              }
            >
              进入复习（{pendingReviewCount}）
            </Link>
          )}
          {bookmarkCount > 0 && (
            <Link href="/bookmarks" className="study-button">
              我的收藏（{bookmarkCount}）
            </Link>
          )}
          <Link href="/study-sets" className="study-button">
            我的题单
          </Link>
        </div>
      </div>
    </section>
  );
}
