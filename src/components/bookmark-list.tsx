"use client";

import Link from "next/link";

import { BookmarkButton } from "@/components/bookmark-button";
import { useLearningReady } from "@/components/learning-account-provider";
import { QuestionStatusPill } from "@/components/ui/question-status-pill";
import {
  DifficultyBadge,
  QuestionTypeBadge,
} from "@/components/ui/semantic-badges";
import {
  categoryLabels,
  type QuestionCategory,
} from "@/content/question-config";
import type { QuestionFrontmatter } from "@/content/question-schema";
import { useBookmarkStore } from "@/stores/use-bookmark-store";

type BookmarkQuestion = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  difficulty?: QuestionFrontmatter["difficulty"];
  category?: QuestionCategory;
  questionType?: QuestionFrontmatter["questionType"];
};

export function BookmarkList({ questions }: { questions: BookmarkQuestion[] }) {
  const learningReady = useLearningReady();
  const hasHydrated = useBookmarkStore((state) => state.hasHydrated);
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const savedQuestions = questions.filter((question) => bookmarks[question.id]);

  if (!hasHydrated || !learningReady) {
    return (
      <p role="status" className="mt-10 text-sm text-[var(--text-muted)]">
        正在读取本地收藏…
      </p>
    );
  }

  if (savedQuestions.length === 0) {
    return (
      <div className="study-card mt-10 p-8 text-center">
        <p className="text-lg font-medium text-[var(--text-strong)]">
          还没有收藏的题目
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          打开题目，点击心形按钮即可收藏。
        </p>
        <Link href="/questions" className="study-button mt-5">
          浏览题库
        </Link>
      </div>
    );
  }

  return (
    <ol className="mt-10 space-y-4">
      {savedQuestions.map((question) => (
        <li
          key={question.id}
          className="flex items-start gap-4 rounded-2xl border border-[var(--line)] bg-[var(--canvas-raised)] p-5 transition-colors hover:border-[var(--line-strong)] sm:p-6"
        >
          <div className="min-w-0 flex-1">
            {(question.difficulty ||
              question.category ||
              question.questionType) && (
              <div className="mb-2.5 flex flex-wrap items-center gap-2 text-xs">
                {question.difficulty && (
                  <DifficultyBadge difficulty={question.difficulty} />
                )}
                {question.category && (
                  <span className="study-badge study-badge-neutral">
                    {categoryLabels[question.category]}
                  </span>
                )}
                {question.questionType && (
                  <QuestionTypeBadge questionType={question.questionType} />
                )}
                <QuestionStatusPill questionId={question.id} />
              </div>
            )}
            <h2 className="text-lg font-semibold text-[var(--text-strong)]">
              <Link
                href={`/questions/${question.slug}`}
                className="transition-colors hover:text-[var(--accent-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
              >
                {question.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              {question.summary}
            </p>
          </div>
          <BookmarkButton questionId={question.id} />
        </li>
      ))}
    </ol>
  );
}
