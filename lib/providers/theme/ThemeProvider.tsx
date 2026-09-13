'use client';

import { type ReactNode, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ThemeContext } from '@/lib/shared/theme';
import { useUserPreferencesStore } from '@/lib/entities/users/preferences';

type ThemeProviderProps = {
  children: ReactNode;
};

const ThemeProvider = observer(function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const preferencesStore = useUserPreferencesStore();
  const theme = preferencesStore.theme;

  useEffect(() => {
    document.body.classList.toggle('theme-light', theme === 'light');
    document.body.classList.toggle('theme-dark', theme === 'dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
});

export default ThemeProvider;
