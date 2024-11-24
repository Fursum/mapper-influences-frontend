import type { MouseEventHandler } from 'react';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type SessionStore = {
  isActive: boolean;
  text: string;
  activateTooltip: (text: string) => void;
  deactivateTooltip: () => void;
  tooltipProps: (text: string) => {
    onMouseEnter: MouseEventHandler;
    onMouseLeave: MouseEventHandler;
  };
};

export const useGlobalTooltip = create<SessionStore>()(
  devtools((set) => ({
    isActive: false,
    text: '',
    activateTooltip: (text) => set({ isActive: true, text }),
    deactivateTooltip: () => set({ isActive: false }),
    tooltipProps: (text) => {
      return {
        onMouseEnter: () => set({ isActive: true, text }),
        onMouseLeave: () => set({ isActive: false }),
      };
    },
  })),
);
