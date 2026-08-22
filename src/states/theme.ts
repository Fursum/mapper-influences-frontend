import { create } from "zustand";

export type Theme = "dark" | "light";

type DarkModeState = {
  theme: Theme | "none";
  setTheme: (theme: Theme | "none") => void;
};

export const useGlobalTheme = create<DarkModeState>((set) => ({
  theme: "light",
  setTheme: (theme) => set({ theme }),
}));

// Writes the theme to the DOM, to localStorage, and to the store.
export const applyTheme = (theme: Theme) => {
  if (typeof window === "undefined") return;

  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  useGlobalTheme.setState({ theme });
};

// Stored preference wins. The OS color scheme is the fallback.
export const getPreferredTheme = (): Theme => {
  if (typeof window === "undefined") return "light";

  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const toggleTheme = () => {
  const current = useGlobalTheme.getState().theme;
  applyTheme(current === "dark" ? "light" : "dark");
};
