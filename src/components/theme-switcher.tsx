"use client";

import { useState, useSyncExternalStore } from "react";

import {
  applyTheme,
  getServerThemeSnapshot,
  getThemeSnapshot,
  subscribeToTheme,
  themeLabels,
  type Theme,
} from "@/lib/theme";

const sectors: Array<{
  theme: Theme;
  path: string;
  fill: string;
  accent: string;
  hitArea: string;
  dot: { x: number; y: number };
}> = [
  {
    theme: "cold-white",
    path: "M24 24 24 4a20 20 0 0 1 17.32 30Z",
    fill: "#eaf0fb",
    accent: "#4169e1",
    hitArea:
      "polygon(50% 50%, 50% 0%, 75% 6.7%, 93.3% 25%, 100% 50%, 93.3% 75%)",
    dot: { x: 36.1, y: 17 },
  },
  {
    theme: "graphite",
    path: "M24 24 41.32 34a20 20 0 0 1-34.64 0Z",
    fill: "#172033",
    accent: "#7668e8",
    hitArea:
      "polygon(50% 50%, 93.3% 75%, 75% 93.3%, 50% 100%, 25% 93.3%, 6.7% 75%)",
    dot: { x: 24, y: 38 },
  },
  {
    theme: "warm-sand",
    path: "M24 24 6.68 34A20 20 0 0 1 24 4Z",
    fill: "#d8bd95",
    accent: "#a35d37",
    hitArea: "polygon(50% 50%, 6.7% 75%, 0% 50%, 6.7% 25%, 25% 6.7%, 50% 0%)",
    dot: { x: 11.9, y: 17 },
  },
];

export function ThemeSwitcher() {
  const [showLabel, setShowLabel] = useState(false);
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const label = themeLabels[theme];
  const activeSector = sectors.find((sector) => sector.theme === theme);

  return (
    <div
      role="group"
      aria-label={`阅读主题，当前为${label}`}
      onPointerEnter={() => setShowLabel(true)}
      onPointerLeave={() => setShowLabel(false)}
      onFocus={() => setShowLabel(true)}
      onBlur={() => setShowLabel(false)}
      className="relative size-11 shrink-0"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className="absolute inset-0 m-auto size-10 transition-transform duration-150 hover:scale-105 motion-reduce:transform-none"
      >
        {sectors.map((sector) => {
          const active = sector.theme === theme;

          return (
            <path
              key={sector.theme}
              d={sector.path}
              fill={sector.fill}
              stroke={active ? sector.accent : "var(--line-strong)"}
              strokeWidth={active ? 3 : 1}
              strokeLinejoin="round"
              data-active={active ? "true" : undefined}
              data-theme-sector={sector.theme}
            />
          );
        })}
        {activeSector && (
          <circle
            cx={activeSector.dot.x}
            cy={activeSector.dot.y}
            r="2.5"
            fill={activeSector.accent}
          />
        )}
      </svg>

      <div className="absolute inset-0 m-auto size-10 overflow-hidden rounded-full ring-1 ring-[var(--line)]">
        {sectors.map((sector) => {
          const active = sector.theme === theme;
          const sectorLabel = themeLabels[sector.theme];

          return (
            <button
              key={sector.theme}
              type="button"
              aria-label={`切换为${sectorLabel}主题`}
              aria-pressed={active}
              onClick={() => {
                applyTheme(sector.theme);
                setShowLabel(false);
              }}
              className="absolute inset-0 cursor-pointer bg-transparent focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)]"
              style={{ clipPath: sector.hitArea }}
            />
          );
        })}
      </div>

      {showLabel && (
        <span className="popover-panel pointer-events-none absolute top-[calc(100%+0.35rem)] right-0 z-40 rounded-md border border-[var(--line-strong)] bg-[var(--canvas-raised)] px-2.5 py-1 text-xs font-medium whitespace-nowrap text-[var(--text-strong)] shadow-[0_8px_24px_var(--shadow)]">
          {label}
        </span>
      )}
    </div>
  );
}
