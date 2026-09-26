"use client";

import { useSyncExternalStore } from "react";

const themes = ["cold-white", "graphite", "warm-sand"] as const;
type Theme = (typeof themes)[number];

const themeLabels: Record<Theme, string> = {
  "cold-white": "冷白",
  graphite: "石墨",
  "warm-sand": "暖砂",
};

const themeColors: Record<Theme, string> = {
  "cold-white": "#f6f8fc",
  graphite: "#080b16",
  "warm-sand": "#f4eee2",
};

const sectors: Array<{
  theme: Theme;
  path: string;
  fill: string;
  dot: { x: number; y: number };
}> = [
  {
    theme: "cold-white",
    path: "M24 24 24 4a20 20 0 0 1 17.32 30Z",
    fill: "#eaf0fb",
    dot: { x: 36.1, y: 17 },
  },
  {
    theme: "graphite",
    path: "M24 24 41.32 34a20 20 0 0 1-34.64 0Z",
    fill: "#172033",
    dot: { x: 24, y: 38 },
  },
  {
    theme: "warm-sand",
    path: "M24 24 6.68 34A20 20 0 0 1 24 4Z",
    fill: "#d8bd95",
    dot: { x: 11.9, y: 17 },
  },
];

const storageKey = "web3-interview-theme";
const themeChangeEvent = "web3-interview-theme-change";

function isTheme(value: string | undefined): value is Theme {
  return themes.some((theme) => theme === value);
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;

  const themeColor = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  themeColor?.setAttribute("content", themeColors[theme]);

  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // 本地存储不可用时，主题仍在当前页面生效。
  }

  window.dispatchEvent(new Event(themeChangeEvent));
}

function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener(themeChangeEvent, onStoreChange);
  return () => window.removeEventListener(themeChangeEvent, onStoreChange);
}

function getThemeSnapshot(): Theme {
  const theme = document.documentElement.dataset.theme;
  return isTheme(theme) ? theme : "graphite";
}

function getServerThemeSnapshot(): Theme {
  return "graphite";
}

export function ThemeSwitcher() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  function switchTheme() {
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    applyTheme(nextTheme);
  }

  const label = themeLabels[theme];
  const activeSector = sectors.find((sector) => sector.theme === theme);

  return (
    <button
      type="button"
      onClick={switchTheme}
      aria-label={`切换主题，当前为${label}`}
      title={`当前主题：${label}，点击切换`}
      className="group relative inline-flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      <svg aria-hidden="true" viewBox="0 0 48 48" className="size-10">
        {sectors.map((sector) => {
          const active = sector.theme === theme;

          return (
            <path
              key={sector.theme}
              d={sector.path}
              fill={sector.fill}
              stroke={
                active ? "var(--theme-wheel-outline)" : "var(--line-strong)"
              }
              strokeWidth={active ? 3 : 1}
              strokeLinejoin="round"
              data-active={active ? "true" : undefined}
            />
          );
        })}
        {activeSector && (
          <circle
            cx={activeSector.dot.x}
            cy={activeSector.dot.y}
            r="2.5"
            fill="var(--theme-wheel-indicator)"
            stroke="var(--canvas-raised)"
            strokeWidth="1.25"
          />
        )}
      </svg>
      <span className="pointer-events-none absolute top-[calc(100%+0.35rem)] right-0 z-40 hidden rounded-md border border-[var(--line)] bg-[var(--canvas-raised)] px-2 py-1 text-xs whitespace-nowrap text-[var(--text-muted)] shadow-[0_8px_24px_var(--shadow)] group-hover:block group-focus-visible:block">
        {label}
      </span>
    </button>
  );
}
