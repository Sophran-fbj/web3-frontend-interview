import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { SpotlightCard } from "@/components/ui/spotlight-card";
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
    index: "01",
    title: "内容纠错",
    description: "发现答案、版本或参考资料有误，告诉我们具体位置和依据。",
    href: correctionIssueLink(),
    action: "反馈问题",
  },
  {
    index: "02",
    title: "题目投稿",
    description: "推荐与 Web3 前端工作直接相关、值得练习的面试题。",
    href: questionSuggestionLink,
    action: "题目投稿",
  },
  {
    index: "03",
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
      data-page="contribute"
      className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <PageHeader
        backLink={{ href: "/questions", label: "返回题库" }}
        eyebrow="CONTRIBUTE"
        title="参与共建"
        description="发现题目有误、想到值得收录的新题，或愿意分享真实面经？欢迎一起把题库做得更准确、更贴近实际面试。"
      />

      <div className="mt-10 grid gap-4">
        {options.map((option) => (
          <SpotlightCard key={option.title} className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <div>
                <span className="font-mono text-xs font-medium text-[var(--accent-bright)]">
                  {option.index}
                </span>
                <h2 className="mt-1.5 text-xl font-semibold text-[var(--text-strong)]">
                  {option.title}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
                  {option.description}
                </p>
              </div>
              <a
                href={option.href}
                target="_blank"
                rel="noreferrer"
                className="study-button shrink-0"
              >
                <span>{option.action}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </SpotlightCard>
        ))}
      </div>

      <p className="mt-7 text-sm leading-6 text-[var(--text-faint)]">
        请勿提交个人隐私、公司内部资料、受保密协议约束的内容，或来源不明的题库文字。
      </p>
    </main>
  );
}
