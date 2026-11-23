import Link from "next/link";
import type { ReactNode } from "react";

type BackLinkProp =
  | {
      href: string;
      label: string;
    }
  | ReactNode;

function isBackLinkObject(
  value: BackLinkProp,
): value is { href: string; label: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "href" in value &&
    "label" in value
  );
}

export function PageHeader({
  backLink,
  eyebrow,
  title,
  description,
  meta,
  actions,
  className = "",
}: {
  backLink?: BackLinkProp;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={className}>
      {backLink && (
        <div className="mb-6">
          {isBackLinkObject(backLink) ? (
            <Link
              href={backLink.href}
              className="study-link inline-flex items-center gap-1.5"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="size-3.5 shrink-0"
              >
                <path
                  d="M10 3.5 5.5 8 10 12.5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
              {backLink.label}
            </Link>
          ) : (
            backLink
          )}
        </div>
      )}

      <div className="flex flex-col gap-6 border-l-2 border-[var(--accent)] pl-5 sm:flex-row sm:items-end sm:justify-between sm:pl-7">
        <div className="max-w-3xl min-w-0">
          {eyebrow && (
            <p className="mb-2.5 font-mono text-xs font-medium tracking-wider text-[var(--accent-bright)] uppercase">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[var(--text-strong)] sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-muted)]">
              {description}
            </p>
          )}
          {meta && (
            <div className="mt-3 text-xs leading-6 text-[var(--text-faint)]">
              {meta}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>
        )}
      </div>
    </header>
  );
}
