"use client";

import { useEffect, useState, type ReactNode } from "react";

const languageLabels: Record<string, string> = {
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JSX",
  solidity: "Solidity",
  sol: "Solidity",
  powershell: "PowerShell",
  pwsh: "PowerShell",
  bash: "Bash",
  sh: "Shell",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  text: "Text",
};

function formatLanguage(language?: string) {
  if (!language) return "Code";
  const normalized = language.trim().toLowerCase();
  return languageLabels[normalized] ?? language.toUpperCase();
}

export function CodeBlock({
  code,
  language,
  children,
}: {
  code: string;
  language?: string;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = code;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
      } catch {
        // 剪贴板不可用时静默忽略。
      }
    }
  }

  return (
    <div className="code-block-frame overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--code-block-bg)] shadow-[0_8px_24px_-12px_var(--shadow)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--code-header-bg)] px-4 py-2">
        <span className="font-mono text-xs font-medium tracking-wide text-[var(--text-faint)]">
          {formatLanguage(language)}
        </span>
        {code && (
          <button
            type="button"
            onClick={() => void handleCopy()}
            aria-label={copied ? "已复制代码" : "复制代码"}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
              copied
                ? "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]"
                : "border-[var(--line)] bg-[var(--canvas-raised)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text-strong)]"
            }`}
          >
            {copied ? (
              <>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="size-3.5 shrink-0"
                >
                  <path
                    d="M3.5 8.5 6.5 11.5 12.5 4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.75"
                  />
                </svg>
                <span>已复制</span>
              </>
            ) : (
              <>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="size-3.5 shrink-0"
                >
                  <rect
                    x="5.5"
                    y="5.5"
                    width="8"
                    height="8"
                    rx="1.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.35"
                  />
                  <path
                    d="M10.5 5.5V3.75A1.25 1.25 0 0 0 9.25 2.5h-5.5A1.25 1.25 0 0 0 2.5 3.75v5.5A1.25 1.25 0 0 0 3.75 10.5H5.5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.35"
                  />
                </svg>
                <span>复制</span>
              </>
            )}
          </button>
        )}
      </div>
      <span className="sr-only" aria-live="polite">
        {copied ? "代码已复制到剪贴板" : ""}
      </span>
      {children}
    </div>
  );
}
