import {
  createHighlighter,
  createJavaScriptRegexEngine,
  type Highlighter,
} from "shiki";

type HastText = {
  type: "text";
  value: string;
};

type HastElement = {
  type: "element";
  tagName: string;
  properties?: Record<string, unknown>;
  children: HastNode[];
};

type HastRoot = {
  type: "root";
  children: HastNode[];
};

type HastNode =
  | HastText
  | HastElement
  | { type: string; children?: HastNode[]; value?: string };

type SupportedLang =
  | "ts"
  | "tsx"
  | "js"
  | "jsx"
  | "solidity"
  | "powershell"
  | "bash"
  | "json"
  | "yaml"
  | "css"
  | "html"
  | "sql"
  | "markdown";

const langAliases: Record<string, SupportedLang> = {
  ts: "ts",
  typescript: "ts",
  tsx: "tsx",
  js: "js",
  javascript: "js",
  mjs: "js",
  cjs: "js",
  jsx: "jsx",
  sol: "solidity",
  solidity: "solidity",
  ps1: "powershell",
  pwsh: "powershell",
  powershell: "powershell",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  bash: "bash",
  json: "json",
  jsonc: "json",
  yml: "yaml",
  yaml: "yaml",
  css: "css",
  html: "html",
  sql: "sql",
  md: "markdown",
  markdown: "markdown",
};

let highlighterPromise: Promise<Highlighter> | undefined;
const pendingLanguages = new Map<SupportedLang, Promise<void>>();

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark-default", "github-light-default"],
      langs: [],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighterPromise;
}

async function ensureLanguageLoaded(
  highlighter: Highlighter,
  lang: SupportedLang,
): Promise<void> {
  if (highlighter.getLoadedLanguages().includes(lang)) return;

  let loading = pendingLanguages.get(lang);
  if (!loading) {
    loading = highlighter
      .loadLanguage(lang)
      .then(() => undefined)
      .catch((error: unknown) => {
        pendingLanguages.delete(lang);
        throw error;
      });
    pendingLanguages.set(lang, loading);
  }
  await loading;
}

function isElement(node: HastNode): node is HastElement {
  return node.type === "element" && "tagName" in node;
}

function findCodeChild(preNode: HastElement): HastElement | undefined {
  return preNode.children.find(
    (child): child is HastElement =>
      isElement(child) && child.tagName === "code",
  );
}

function hasCodeBlocks(node: HastNode): boolean {
  if (
    isElement(node) &&
    node.tagName === "pre" &&
    findCodeChild(node) !== undefined
  ) {
    return true;
  }
  if ("children" in node && Array.isArray(node.children)) {
    return node.children.some(hasCodeBlocks);
  }
  return false;
}

function collectText(node: HastNode): string {
  if (node.type === "text" && typeof node.value === "string") {
    return node.value;
  }
  if ("children" in node && Array.isArray(node.children)) {
    return node.children.map(collectText).join("");
  }
  return "";
}

function extractLanguage(codeNode: HastElement): string {
  const classes = codeNode.properties?.className;
  const list = Array.isArray(classes)
    ? classes
    : typeof classes === "string"
      ? classes.split(/\s+/)
      : [];

  for (const item of list) {
    if (typeof item === "string" && item.startsWith("language-")) {
      return item.slice("language-".length).trim().toLowerCase();
    }
  }
  return "";
}

async function visitPreBlocks(
  node: HastNode,
  highlighter: Highlighter,
): Promise<void> {
  if (isElement(node) && node.tagName === "pre" && node.children.length > 0) {
    const codeChild = findCodeChild(node);

    if (codeChild) {
      const rawText = collectText(codeChild).replace(/\n$/, "");
      const rawLang = extractLanguage(codeChild);
      const mappedLang = langAliases[rawLang];

      node.properties = {
        ...node.properties,
        "data-raw-code": rawText,
        "data-lang": rawLang || "text",
      };

      if (mappedLang) {
        await ensureLanguageLoaded(highlighter, mappedLang);
        const hast = highlighter.codeToHast(rawText, {
          lang: mappedLang,
          themes: {
            dark: "github-dark-default",
            light: "github-light-default",
          },
          defaultColor: false,
        }) as unknown as HastRoot;

        const shikiPre = hast.children.find(
          (child): child is HastElement =>
            isElement(child) && child.tagName === "pre",
        );

        if (shikiPre) {
          node.properties = {
            ...node.properties,
            className:
              shikiPre.properties?.class ?? shikiPre.properties?.className,
            style: shikiPre.properties?.style,
            tabIndex: 0,
          };
          node.children = shikiPre.children;
        }
      }
      return;
    }
  }

  if ("children" in node && Array.isArray(node.children)) {
    await Promise.all(
      node.children.map((child) => visitPreBlocks(child, highlighter)),
    );
  }
}

export function rehypeShiki() {
  return async (tree: HastRoot) => {
    if (!hasCodeBlocks(tree)) return;
    const highlighter = await getHighlighter();
    await visitPreBlocks(tree, highlighter);
  };
}
