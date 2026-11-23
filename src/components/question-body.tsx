import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { evaluate } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "@/components/ui/code-block";
import { createHeadingId } from "@/content/question-headings";
import { rehypeShiki } from "@/lib/highlight-code";

function getTextContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join("");
  if (node && typeof node === "object" && "props" in node)
    return getTextContent((node.props as { children?: ReactNode }).children);
  return "";
}

function headingId(children: ReactNode) {
  return createHeadingId(getTextContent(children));
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

type CodePreProps = ComponentPropsWithoutRef<"pre"> & {
  "data-raw-code"?: string;
  "data-lang"?: string;
};

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
  pre: ({
    "data-raw-code": rawCodeProp,
    "data-lang": langProp,
    children,
    ...props
  }: CodePreProps) => {
    const code =
      typeof rawCodeProp === "string" ? rawCodeProp : getTextContent(children);
    const language = typeof langProp === "string" ? langProp : undefined;

    return (
      <CodeBlock code={code} language={language}>
        <pre data-lang={language} {...props}>
          {children}
        </pre>
      </CodeBlock>
    );
  },
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="table-scroll">
      <table {...props} />
    </div>
  ),
};

export async function QuestionBody({ source }: { source: string }) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    development: false,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeShiki],
    useMDXComponents: () => components,
  });

  return (
    <article className="question-prose">
      <Content />
    </article>
  );
}
