import { create } from "zustand";

type DarkModeState = {
  theme: "dark" | "light" | "none";
  setTheme: (theme: "dark" | "light" | "none") => void;
};

export const useGlobalTheme = create<DarkModeState>((set) => ({
  theme: "light",
  setTheme: (theme) => set({ theme }),
}));
