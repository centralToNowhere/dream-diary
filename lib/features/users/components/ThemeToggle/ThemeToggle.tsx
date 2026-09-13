'use client';

import { useTheme } from '@/lib/shared/theme';
import { Moon, Sun } from 'lucide-react';
import Button from '@/_components/ui/Button';
import styles from './ThemeToggle.module.css';
import { useUserPreferencesStore } from '@/lib/entities/users/preferences';

const ThemeToggle = () => {
  const theme = useTheme();
  const preferencesStore = useUserPreferencesStore();
  const isDark = theme === 'dark';

  const handleToggle = () => {
    preferencesStore.setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <Button className={styles.button} onClick={handleToggle}>
      {isDark ? <Moon /> : <Sun />}
    </Button>
  );
};

export default ThemeToggle;
