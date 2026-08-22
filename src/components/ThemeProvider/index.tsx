import { type FC, type ReactNode, useEffect } from 'react';

import { applyTheme, getPreferredTheme, toggleTheme } from '@states/theme';

// Applies the stored or OS theme on mount and registers the "d" hotkey.
// The hotkey ignores text inputs and modifier combinations.
const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    applyTheme(getPreferredTheme());

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName.toLowerCase();
      const isEditable =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        !!target?.isContentEditable;

      if (
        e.key === 'd' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !isEditable
      ) {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <>{children}</>;
};

export default ThemeProvider;
