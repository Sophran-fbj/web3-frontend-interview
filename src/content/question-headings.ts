export const headingAliases: Record<string, string> = {
  题目: "question",
  考察目标: "goals",
  "30 秒回答": "short-answer",
  深入回答: "deep-answer",
  示例代码: "example",
  常见错误: "common-mistakes",
  面试官追问: "follow-ups",
  评分标准: "scoring",
  参考资料: "references",
  初级回答: "beginner-answer",
  中级回答: "intermediate-answer",
  高级回答: "advanced-answer",
};

export function createHeadingId(text: string): string {
  const trimmed = text.trim();
  return (
    headingAliases[trimmed] ??
    trimmed
      .toLocaleLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "")
  );
}

export type QuestionHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function extractQuestionHeadings(markdown: string): QuestionHeading[] {
  const headings: QuestionHeading[] = [];
  let activeFence: string | null = null;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    const fenceMatch = line.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!activeFence) {
        activeFence = marker[0];
      } else if (marker[0] === activeFence) {
        activeFence = null;
      }
      continue;
    }

    if (activeFence) continue;

    const headingMatch = line.match(/^(#{2,3})\s+(.+?)\s*#*$/);
    if (!headingMatch) continue;

    const level = headingMatch[1].length as 2 | 3;
    const text = headingMatch[2].replace(/`/g, "").trim();
    if (!text) continue;

    headings.push({
      id: createHeadingId(text),
      text,
      level,
    });
  }

  return headings;
}
