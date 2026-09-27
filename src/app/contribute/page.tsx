import type { Metadata } from "next";
import Link from "next/link";

import {
  correctionIssueLink,
  interviewExperienceLink,
  questionSuggestionLink,
} from "@/lib/contribution-links";
import { getAbsoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "参与共建",
  description:
    "反馈 Web3 前端面试题的内容问题，建议新题，或分享可公开的真实面经。",
  alternates: { canonical: getAbsoluteUrl("/contribute") },
};

const options = [
  {
    title: "内容纠错",
    description: "发现答案、版本或参考资料有误，告诉我们具体位置和依据。",
    href: correctionIssueLink(),
    action: "反馈内容问题",
  },
  {
    title: "题目投稿",
    description: "推荐与 Web3 前端工作直接相关、值得练习的面试题。",
    href: questionSuggestionLink,
    action: "建议一道题",
  },
  {
    title: "面经分享",
    description: "分享自己亲历且可以公开的面试问题与追问。请先去除敏感信息。",
    href: interviewExperienceLink,
    action: "分享面经",
  },
] as const;

export default function ContributePage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-20"
    >
      <Link
        href="/questions"
        className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
      >
        返回题库
      </Link>
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.035em] text-[var(--text-strong)] sm:text-5xl">
        参与共建
      </h1>
      <p className="mt-5 max-w-2xl leading-7 text-[var(--text-muted)]">
        选择一类内容，在 GitHub 提交。提交内容和 GitHub
        用户名公开可见；题目和面经会先由维护者核对、整理，再决定是否收录。
      </p>
      <div className="mt-10 divide-y divide-[var(--line)] border-y border-[var(--line-strong)]">
        {options.map((option) => (
          <section
            key={option.title}
            className="py-7 sm:flex sm:items-center sm:justify-between sm:gap-8"
          >
            <div>
              <h2 className="text-xl font-medium text-[var(--text-strong)]">
                {option.title}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
                {option.description}
              </p>
            </div>
            <a
              href={option.href}
              className="mt-4 inline-flex min-h-11 shrink-0 items-center rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--text-strong)] hover:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:mt-0"
            >
              {option.action}
            </a>
          </section>
        ))}
      </div>
      <p className="mt-7 text-sm leading-6 text-[var(--text-faint)]">
        请勿提交个人隐私、公司内部资料、受保密协议约束的内容，或来源不明的题库文字。
      </p>
    </main>
  );
}
