import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { evaluate } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import * as runtime from "react/jsx-runtime";

function getTextContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join("");
  if (node && typeof node === "object" && "props" in node)
    return getTextContent((node.props as { children?: ReactNode }).children);
  return "";
}

const headingAliases: Record<string, string> = {
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

function headingId(children: ReactNode) {
  const text = getTextContent(children).trim();
  return (
    headingAliases[text] ??
    text
      .toLocaleLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "")
  );
}

function ProseLink({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
  const external = href.startsWith("http://") || href.startsWith("https://");

  return (
    <a
      href={href}
      {...props}
      {...(external ? { rel: "noreferrer", target: "_blank" } : {})}
    />
  );
}

const components: MDXComponents = {
  h2: ({ children, ...props }) => (
    <h2 id={headingId(children)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 id={headingId(children)} {...props}>
      {children}
    </h3>
  ),
  a: ProseLink,
  code: (props) => <code translate="no" {...props} />,
};

export async function QuestionBody({ source }: { source: string }) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    development: false,
    useMDXComponents: () => components,
  });

  return (
    <article className="question-prose">
      <Content />
    </article>
  );
}
