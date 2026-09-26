import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { QuestionBody } from "@/components/question-body";
import {
  categoryLabels,
  difficultyLabels,
  questionTypeLabels,
} from "@/content/question-labels";
import {
  getVisibleQuestionBySlug,
  getVisibleQuestions,
} from "@/content/question-repository";

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

  return {
    title: question.frontmatter.title,
    description: question.frontmatter.summary,
  };
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { slug } = await params;
  const question = await getVisibleQuestionBySlug(slug);

  if (!question) notFound();

  const { frontmatter, body } = question;

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14"
    >
      <Link
        href="/questions"
        className="inline-flex text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
      >
        返回题库
      </Link>

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
        <h1 className="mt-5 text-3xl leading-tight font-semibold tracking-[-0.04em] text-[var(--text-strong)] sm:text-5xl">
          {frontmatter.title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--text-muted)] sm:text-lg">
          {frontmatter.summary}
        </p>
        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-[var(--text-faint)]">
          {frontmatter.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,46rem)_12rem] lg:items-start lg:gap-20">
        <QuestionBody source={body} />
        <aside className="order-first border-l border-[var(--line)] pl-5 text-sm lg:sticky lg:top-8 lg:order-last">
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
        </aside>
      </div>
    </main>
  );
}
