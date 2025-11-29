"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "odds-theme";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  return prefersLight ? "light" : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== "undefined") {
      const current = document.documentElement.dataset.theme;
      if (current === "light" || current === "dark") return current;
    }
    return getPreferredTheme();
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const body = document.body;
    root.dataset.theme = theme;
    body.dataset.theme = theme;
    root.style.colorScheme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const isLight = theme === "light";
  const label = isLight ? "Mode clair" : "Mode sombre";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isLight}
      onClick={() => setTheme(isLight ? "dark" : "light")}
      data-theme={theme}
      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-black/30 backdrop-blur transition hover:border-indigo-300 hover:bg-indigo-500/20 data-[theme=light]:bg-white/80 data-[theme=light]:text-slate-800"
    >
      <span
        aria-hidden
        className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-[10px]"
      >
        {isLight ? "☀" : "☾"}
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
