import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark" || value === "system";

const readStoredTheme = (): Theme => {
  if (typeof window === "undefined") return "system";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isTheme(saved) ? saved : "system";
  } catch {
    // localStorage can throw (private mode, blocked storage)
    return "system";
  }
};

let currentTheme: Theme = readStoredTheme();
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

/** Writes the resolved theme to <html>. Safe to call any time. */
export const applyTheme = (theme: Theme = currentTheme) => {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia(DARK_QUERY).matches);

  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  // Makes native UI (scrollbars, form controls) match the theme.
  root.style.colorScheme = isDark ? "dark" : "light";
};

export const getTheme = () => currentTheme;

export const setTheme = (theme: Theme) => {
  currentTheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore: the theme still applies for this session.
  }
  applyTheme(theme);
  notify();
};

let initialized = false;

/**
 * Call once at app startup (before rendering). Applies the saved theme and
 * keeps it in sync with OS changes and other tabs. Works with no component mounted.
 */
export const initTheme = () => {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  applyTheme();

  // Follow OS changes while in "system" mode.
  window
    .matchMedia(DARK_QUERY)
    .addEventListener("change", () => {
      if (currentTheme === "system") applyTheme();
    });

  // Follow changes made in other tabs.
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    currentTheme = readStoredTheme();
    applyTheme();
    notify();
  });
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** React hook: read and change the theme from any component. */
export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "system" as Theme);
  return { theme, setTheme };
};