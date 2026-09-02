"use client";

import { useEffect, useLayoutEffect, useState, useTransition } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun } from 'lucide-react'
import Button from "@/_components/ui/Button";
import styles from "./ThemeToggle.module.css"

const ThemeToggle = () => {
  const { value: theme, setValue } = useTheme();
  let [isDarkMode, setIsDarkMode] = useState(theme === 'dark');
  const [_, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => {
      setIsDarkMode((prev) => !prev);
    })
  }

  useEffect(() => {
    setIsDarkMode(theme === 'dark')
  }, [theme]);

  useLayoutEffect(() => {
    setValue(isDarkMode ? 'dark' : 'light');
  }, [setValue, isDarkMode])

  return (
    <Button
      className={styles.button}
      onClick={handleToggle}
    >
      {isDarkMode ? <Moon /> : <Sun />}
    </Button>
  )
}

export default ThemeToggle;