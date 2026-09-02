"use client";

import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "dark" | "light";

type ThemeContextValue = {
  value: Theme;
  setValue: (value: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
};

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>("light");

  const value = useMemo(
    () => ({
      value: theme,
      setValue: setTheme,
    }),
    [theme],
  );

  useEffect(() => {
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => {
      setTheme(colorScheme.matches ? "dark" : "light");
    };

    updateTheme();
    colorScheme.addEventListener("change", updateTheme);

    return () => colorScheme.removeEventListener("change", updateTheme);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("theme-light", theme === "light");
    document.body.classList.toggle("theme-dark", theme === "dark");
  }, [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeContext, type Theme, type ThemeContextValue };
