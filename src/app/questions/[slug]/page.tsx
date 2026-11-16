import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AnswerDisclosure } from "@/components/answer-disclosure";
import { BookmarkButton } from "@/components/bookmark-button";
import { LearningStatusControl } from "@/components/learning-status-control";
import {
  AdjacentQuestionNav,
  BackToQuestionsLink,
} from "@/components/question-detail-nav";
import { QuestionBody } from "@/components/question-body";
import { categoryLabels } from "@/content/question-config";
import {
  difficultyLabels,
  questionTypeLabels,
} from "@/content/question-labels";
import {
  getVisibleQuestionBySlug,
  getVisibleQuestions,
} from "@/content/question-repository";
import { splitQuestionSections } from "@/content/question-sections";
import { getAbsoluteUrl } from "@/lib/site-url";
import { correctionIssueLink } from "@/lib/contribution-links";

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
  const previousQuestion = questions[questionIndex - 1]?.frontmatter;
  const nextQuestion = questions[questionIndex + 1]?.frontmatter;

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14"
    >
      <BackToQuestionsLink />

      <header className="mt-10 max-w-4xl border-b border-[var(--line-strong)] pb-10">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <span className="font-medium text-[var(--accent-bright)]">
            {difficultyLabels[frontmatter.difficulty]}
          </span>
          <span className="text-[var(--text-faint)]">
            {categoryLabels[frontmatter.category]}
          </span>
          <span className="text-[var(--text-faint)]">
            {questionTypeLabels[frontmatter.questionType]}
          </span>
        </div>
        <div className="mt-5 flex items-start gap-4">
          <h1 className="min-w-0 flex-1 text-3xl leading-tight font-semibold tracking-[-0.04em] text-[var(--text-strong)] sm:text-5xl">
            {frontmatter.title}
          </h1>
          <BookmarkButton questionId={frontmatter.id} />
        </div>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--text-muted)] sm:text-lg">
          {frontmatter.summary}
        </p>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,46rem)_12rem] lg:items-start lg:gap-20">
        <div className="min-w-0">
          <QuestionBody source={sections.prompt} />
          {sections.answer && (
            <AnswerDisclosure>
              <QuestionBody source={sections.answer} />
            </AnswerDisclosure>
          )}
        </div>
        <aside className="border-l border-[var(--line)] pl-5 text-sm lg:sticky lg:top-8">
          <p className="font-medium text-[var(--text-strong)]">阅读建议</p>
          <p className="mt-2 leading-6 text-[var(--text-faint)]">
            先用 30 秒口述结论，再展开完整状态流，最后检查常见错误。
          </p>
          <dl className="mt-6 space-y-4 border-t border-[var(--line)] pt-5">
            <div>
              <dt className="text-[var(--text-faint)]">适用生态</dt>
              <dd className="mt-1 text-[var(--text-muted)]">
                {frontmatter.ecosystems.join("、")}
              </dd>
            </div>
            {Object.keys(frontmatter.stacks).length > 0 && (
              <div>
                <dt className="text-[var(--text-faint)]">技术版本</dt>
                <dd className="mt-1 text-[var(--text-muted)]">
                  {Object.entries(frontmatter.stacks)
                    .map(([name, version]) => `${name} ${version}`)
                    .join("、")}
                </dd>
              </div>
            )}
          </dl>
          <LearningStatusControl questionId={frontmatter.id} />
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
  );
}
