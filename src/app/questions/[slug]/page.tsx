import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AddToStudySetButton } from "@/components/add-to-study-set-button";
import { AnswerDisclosure } from "@/components/answer-disclosure";
import { BookmarkButton } from "@/components/bookmark-button";
import { LearningStatusControl } from "@/components/learning-status-control";
import { QuestionBody } from "@/components/question-body";
import {
  AdjacentQuestionNav,
  BackToQuestionsLink,
} from "@/components/question-detail-nav";
import { QuestionToc } from "@/components/question-toc";
import { ReadingProgress } from "@/components/reading-progress";
import {
  DifficultyBadge,
  QuestionTypeBadge,
} from "@/components/ui/semantic-badges";
import { categoryLabels } from "@/content/question-config";
import { extractQuestionHeadings } from "@/content/question-headings";
import {
  getVisibleQuestionBySlug,
  getVisibleQuestions,
} from "@/content/question-repository";
import { splitQuestionSections } from "@/content/question-sections";
import { correctionIssueLink } from "@/lib/contribution-links";
import { getAbsoluteUrl } from "@/lib/site-url";

type QuestionPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const questions = await getVisibleQuestions();
  return questions.map(({ frontmatter }) => ({ slug: frontmatter.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: QuestionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const question = await getVisibleQuestionBySlug(slug);

  if (!question) return {};

  const url = getAbsoluteUrl(`/questions/${slug}`);

  return {
    title: question.frontmatter.title,
    description: question.frontmatter.summary,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      type: "article",
      locale: "zh_CN",
      siteName: "Web3 前端面试题库",
      title: question.frontmatter.title,
      description: question.frontmatter.summary,
      url,
    },
    twitter: {
      card: "summary",
      title: question.frontmatter.title,
      description: question.frontmatter.summary,
    },
  };
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { slug } = await params;
  const questions = await getVisibleQuestions();
  const questionIndex = questions.findIndex(
    ({ frontmatter }) => frontmatter.slug === slug,
  );
  const question = questions[questionIndex];

  if (!question) notFound();

  const { frontmatter, body } = question;
  const sections = splitQuestionSections(body);
  const promptHeadings = extractQuestionHeadings(sections.prompt);
  const answerHeadings = sections.answer
    ? extractQuestionHeadings(sections.answer)
    : [];
  const stackEntries = Object.entries(frontmatter.stacks);
  const previousQuestion = questions[questionIndex - 1]?.frontmatter;
  const nextQuestion = questions[questionIndex + 1]?.frontmatter;

  return (
    <>
      <ReadingProgress />
      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14"
      >
        <BackToQuestionsLink />

        <header className="mt-8 border-b border-[var(--line-strong)] pb-9">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <DifficultyBadge difficulty={frontmatter.difficulty} />
            <span className="study-badge study-badge-neutral">
              {categoryLabels[frontmatter.category]}
            </span>
            <QuestionTypeBadge questionType={frontmatter.questionType} />
          </div>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <h1 className="min-w-0 flex-1 text-3xl leading-tight font-semibold tracking-[-0.04em] text-[var(--text-strong)] sm:text-5xl">
              {frontmatter.title}
            </h1>
            <div className="flex shrink-0 items-center gap-2.5">
              <AddToStudySetButton questionId={frontmatter.id} />
              <BookmarkButton questionId={frontmatter.id} />
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-muted)] sm:text-lg">
            {frontmatter.summary}
          </p>

          <div className="mt-5 flex flex-wrap gap-2 lg:hidden">
            <span className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--text-muted)]">
              生态：{frontmatter.ecosystems.join("、")}
            </span>
            {stackEntries.map(([name, version]) => (
              <span
                key={name}
                className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 font-mono text-xs text-[var(--text-muted)]"
              >
                {name} {version}
              </span>
            ))}
          </div>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,46rem)_16rem] lg:items-start lg:gap-14">
          <div className="min-w-0">
            <QuestionBody source={sections.prompt} />
            {sections.answer && (
              <AnswerDisclosure>
                <QuestionBody source={sections.answer} />
              </AnswerDisclosure>
            )}
          </div>

          <aside className="space-y-4 text-sm lg:sticky lg:top-20">
            <LearningStatusControl questionId={frontmatter.id} />

            <section aria-label="题目元信息" className="study-card p-4">
              <p className="text-xs font-semibold text-[var(--text-strong)]">
                阅读建议
              </p>
              <p className="mt-1.5 text-xs leading-6 text-[var(--text-faint)]">
                先用 30
                秒口述结论，再展开完整状态流，最后对照常见错误与分级标准。
              </p>
              <dl className="mt-4 space-y-3 border-t border-[var(--line)] pt-3.5 text-xs">
                <div>
                  <dt className="text-[var(--text-faint)]">适用生态</dt>
                  <dd className="mt-1 text-[var(--text-muted)]">
                    {frontmatter.ecosystems.join("、")}
                  </dd>
                </div>
                {stackEntries.length > 0 && (
                  <div>
                    <dt className="text-[var(--text-faint)]">技术版本</dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">
                      {stackEntries.map(([name, version]) => (
                        <span
                          key={name}
                          className="rounded border border-[var(--line)] bg-[var(--surface)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-muted)]"
                        >
                          {name} {version}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            <QuestionToc
              promptHeadings={promptHeadings}
              answerHeadings={answerHeadings}
            />
          </aside>
        </div>

        <AdjacentQuestionNav
          previous={
            previousQuestion
              ? {
                  slug: previousQuestion.slug,
                  title: previousQuestion.title,
                }
              : null
          }
          next={
            nextQuestion
              ? { slug: nextQuestion.slug, title: nextQuestion.title }
              : null
          }
        />

        <p className="mt-6 text-sm text-[var(--text-faint)]">
          发现这道题有问题？{" "}
          <a
            href={correctionIssueLink(
              `${frontmatter.title}（/questions/${frontmatter.slug}）`,
            )}
            className="text-[var(--accent-bright)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            反馈此题
          </a>
        </p>
      </main>
    </>
  );
}
