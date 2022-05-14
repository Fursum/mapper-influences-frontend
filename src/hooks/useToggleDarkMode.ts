import { useEffect, useState } from "react";

function useDarkMode(): [typeof theme, typeof setTheme] {
  //Lock setCss until local storage is fetched
  const [lock, setLock] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light" | "none">("none");

  const getLocalColor = () => {
    if (window)
      switch (localStorage.getItem("theme")) {
        case "light":
          return "light";
        case "dark":
          return "dark";
        default:
          return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
      }
    return "none";
  };

  const setCss = (currentTheme: typeof theme) => {
    const root = window.document.documentElement;

    root.setAttribute("data-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);

    if (typeof window !== "undefined") {
      localStorage.setItem("theme", currentTheme);
    }
  };

  useEffect(() => {
    setCss(getLocalColor());
    setTheme(getLocalColor());
    setLock(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || lock) return;
    setCss(theme);
  }, [theme, lock]);

  return [theme, setTheme];
}

export default useDarkMode;
