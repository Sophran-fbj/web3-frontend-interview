import { NextResponse } from "next/server";

import { getVisibleQuestions } from "@/content/question-repository";

export const dynamic = "force-static";

export async function GET() {
  const questions = await getVisibleQuestions();

  const items = questions.map(({ frontmatter }) => ({
    id: frontmatter.id,
    slug: frontmatter.slug,
    title: frontmatter.title,
    summary: frontmatter.summary,
    category: frontmatter.category,
    difficulty: frontmatter.difficulty,
    questionType: frontmatter.questionType,
    stacks: Object.keys(frontmatter.stacks),
  }));

  return NextResponse.json(items);
}
