import type { Metadata } from "next";

import { QuestionFilterBar } from "@/components/question-filter-bar";
import {
  QuestionListClient,
  type QuestionListItem,
} from "@/components/question-list-client";
import { PageHeader } from "@/components/ui/page-header";
import { categoryOrder } from "@/content/question-config";
import {
  filterQuestions,
  type QuestionFilters,
} from "@/content/question-filter";
import {
  difficultyLabels,
  questionTypeLabels,
} from "@/content/question-labels";
import { parseProgressFilter } from "@/content/question-list-url";
import { paginateQuestions } from "@/content/question-pagination";
import { getVisibleQuestions } from "@/content/question-repository";
import type { QuestionFrontmatter } from "@/content/question-schema";
import { toQuestionSummary } from "@/content/question-summary";
import { getAbsoluteUrl } from "@/lib/site-url";

type QuestionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  searchParams,
}: QuestionsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const hasActiveFilters = [
    "q",
    "difficulty",
    "category",
    "type",
    "stack",
    "progress",
  ].some((key) => Boolean(firstParam(params[key])?.trim()));
  const questions = await getVisibleQuestions();
  const requestedPage = Number.parseInt(firstParam(params.page) ?? "1", 10);
  const { currentPage } = paginateQuestions(questions, requestedPage);
  const title =
    currentPage > 1
      ? `Web3 前端面试题库 · 第 ${currentPage} 页`
      : "Web3 前端面试题库";
  const description =
    "按钱包、签名、交易、合约交互、安全等主题浏览 Web3 前端面试题，查看简答、深入分析、常见错误和参考资料。";
  const url = getAbsoluteUrl(
    currentPage > 1 ? `/questions?page=${currentPage}` : "/questions",
  );

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: hasActiveFilters ? undefined : url },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      siteName: "Web3 前端面试题库",
      title,
      description,
      url: hasActiveFilters ? undefined : url,
    },
    twitter: { card: "summary", title, description },
    robots:
      process.env.CONTENT_PREVIEW === "true"
        ? { index: false, follow: false }
        : hasActiveFilters
          ? { index: false, follow: true }
          : undefined,
  };
}

function findOption<T extends string>(value: string | undefined, options: T[]) {
  return options.find((option) => option === value);
}

const difficultyOrder = Object.keys(
  difficultyLabels,
) as QuestionFrontmatter["difficulty"][];
const questionTypeOrder = Object.keys(
  questionTypeLabels,
) as QuestionFrontmatter["questionType"][];

export default async function QuestionsPage({
  searchParams,
}: QuestionsPageProps) {
  const params = await searchParams;
  const allQuestions = await getVisibleQuestions();
  const difficulties = difficultyOrder.filter((difficulty) =>
    allQuestions.some(
      ({ frontmatter }) => frontmatter.difficulty === difficulty,
    ),
  );
  const categories = categoryOrder.filter((category) =>
    allQuestions.some(({ frontmatter }) => frontmatter.category === category),
  );
  const questionTypes = questionTypeOrder.filter((questionType) =>
    allQuestions.some(
      ({ frontmatter }) => frontmatter.questionType === questionType,
    ),
  );
  const stacks = Array.from(
    new Set(
      allQuestions.flatMap(({ frontmatter }) =>
        Object.keys(frontmatter.stacks),
      ),
    ),
  ).sort((left, right) => left.localeCompare(right, "en"));

  const filters: QuestionFilters = {
    query: firstParam(params.q)?.trim(),
    difficulty: findOption(firstParam(params.difficulty), difficulties),
    category: findOption(firstParam(params.category), categories),
    questionType: findOption(firstParam(params.type), questionTypes),
    stack: findOption(firstParam(params.stack), stacks),
  };
  const progressFilter = parseProgressFilter(firstParam(params.progress));
  const filteredQuestions = filterQuestions(allQuestions, filters);
  const requestedPage = Number.parseInt(firstParam(params.page) ?? "1", 10);

  const listItems: QuestionListItem[] = filteredQuestions.map((doc) => ({
    ...toQuestionSummary(doc),
    stacks: Object.keys(doc.frontmatter.stacks),
  }));

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <PageHeader
        eyebrow="QUESTION BANK"
        title="Web3 前端面试题库"
        description="从单一知识点到完整业务场景。先尝试口述答案，再进入详情对照思路、常见错误和评分标准。"
      />

      {allQuestions.length > 0 && (
        <QuestionFilterBar
          filters={filters}
          progressFilter={progressFilter}
          difficulties={difficulties}
          categories={categories}
          questionTypes={questionTypes}
          stacks={stacks}
        />
      )}

      <QuestionListClient
        questions={listItems}
        totalAllCount={allQuestions.length}
        filters={filters}
        requestedPage={requestedPage}
        progressFilter={progressFilter}
      />
    </main>
  );
}
