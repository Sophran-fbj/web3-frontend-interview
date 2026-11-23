export const themes = ["cold-white", "graphite", "warm-sand"] as const;
export type Theme = (typeof themes)[number];

export const themeLabels: Record<Theme, string> = {
  "cold-white": "冷白",
  graphite: "石墨",
  "warm-sand": "暖砂",
};

export const themeDescriptions: Record<Theme, string> = {
  "cold-white": "高对比清爽浅色",
  graphite: "低眩光深色阅读",
  "warm-sand": "柔和暖纸护眼",
};

export const themeColors: Record<Theme, string> = {
  "cold-white": "#f6f8fc",
  graphite: "#080b16",
  "warm-sand": "#f4eee2",
};

const storageKey = "web3-interview-theme";
const themeChangeEvent = "web3-interview-theme-change";

export function isTheme(value: string | undefined): value is Theme {
  return themes.some((theme) => theme === value);
}

export function applyTheme(theme: Theme) {
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

export function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener(themeChangeEvent, onStoreChange);
  return () => window.removeEventListener(themeChangeEvent, onStoreChange);
}

export function getThemeSnapshot(): Theme {
  const theme = document.documentElement.dataset.theme;
  return isTheme(theme) ? theme : "graphite";
}

export function getServerThemeSnapshot(): Theme {
  return "graphite";
}
