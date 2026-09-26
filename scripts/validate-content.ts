import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import { questionFrontmatterSchema } from "../src/content/question-schema";

const questionsDirectory = path.join(process.cwd(), "content", "questions");
const requiredHeadings = [
  "## 题目",
  "## 考察目标",
  "## 30 秒回答",
  "## 深入回答",
  "## 常见错误",
  "## 面试官追问",
  "## 评分标准",
  "## 参考资料",
  "## 更新记录",
];

async function findQuestionFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) return findQuestionFiles(entryPath);
      if (/\.mdx?$/.test(entry.name)) return [entryPath];
      return [];
    }),
  );

  return files.flat();
}

async function validateContent() {
  const files = await findQuestionFiles(questionsDirectory);
  const ids = new Map<string, string>();
  const slugs = new Map<string, string>();
  const errors: string[] = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const { data, content } = matter(source);
    const result = questionFrontmatterSchema.safeParse(data);
    const relativeFile = path.relative(process.cwd(), file);

    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(
          `${relativeFile}: ${issue.path.join(".")} ${issue.message}`,
        );
      }
      continue;
    }

    for (const [field, value, values] of [
      ["id", result.data.id, ids],
      ["slug", result.data.slug, slugs],
    ] as const) {
      const existing = values.get(value);
      if (existing)
        errors.push(`${relativeFile}: ${field} 与 ${existing} 重复 (${value})`);
      else values.set(value, relativeFile);
    }

    for (const heading of requiredHeadings) {
      if (!content.includes(heading))
        errors.push(`${relativeFile}: 缺少章节“${heading}”`);
    }
  }

  if (files.length === 0) errors.push("content/questions 中至少需要一道题目");

  if (errors.length > 0) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exitCode = 1;
    return;
  }

  console.log(`Content validation passed: ${files.length} question(s).`);
}

await validateContent();
