import { create } from "zustand";
import { devtools } from "zustand/middleware";

type SessionStore = {
  isActive: boolean;
  text: string;
  parent: HTMLElement | null;
  activateTooltip: (text: string, parent: HTMLElement) => void;
  deactivateTooltip: () => void;
};

export const useGlobalTooltip = create<SessionStore>()(
  devtools((set) => ({
    parent: null,
    isActive: false,
    text: "",
    activateTooltip: (text, parent) => set({ isActive: true, text, parent }),
    deactivateTooltip: () => set({ isActive: false, parent: null }),
  }))
);
