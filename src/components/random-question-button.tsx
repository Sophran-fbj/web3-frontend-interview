"use client";

import { useRouter } from "next/navigation";

import {
  pickRandomQuestion,
  type RandomQuestionCandidate,
} from "@/content/random-question";

const lastRandomQuestionKey = "web3-interview-last-random-question";

export function RandomQuestionButton({
  candidates,
}: {
  candidates: RandomQuestionCandidate[];
}) {
  const router = useRouter();

  function openRandomQuestion() {
    let lastQuestionId: string | undefined;

    try {
      lastQuestionId = localStorage.getItem(lastRandomQuestionKey) ?? undefined;
    } catch {
      // 浏览器禁用本地存储时仍允许随机练习，只是不保证避免连续重复。
    }

    const question = pickRandomQuestion(candidates, lastQuestionId);
    if (!question) return;

    try {
      localStorage.setItem(lastRandomQuestionKey, question.id);
    } catch {
      // 导航不依赖本地存储写入成功。
    }

    router.push(`/questions/${question.slug}`);
  }

  return (
    <button
      type="button"
      onClick={openRandomQuestion}
      disabled={candidates.length === 0}
      className="min-h-10 border border-[var(--line-strong)] px-4 text-sm font-medium text-[var(--text-muted)] hover:border-[var(--accent-bright)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      随机抽一题
    </button>
  );
}
